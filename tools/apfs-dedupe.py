#!/usr/bin/env python3
"""APFS dedupe: duplikáty podle fdupes nahradí klonem (clonefile), ne smazáním.

Použití: apfs-dedupe.py [--dry-run] DIR [DIR ...]
Každá skupina identických souborů: první (podle cesty) zůstane, ostatní se atomicky
nahradí `cp -c` klonem prvního. Obsah se nemění, bloky na disku se sdílejí.
Přeskočí: hardlinky na stejný inode, jiné zařízení, jiný mode/uid/gid, symlinky.
Pozor: spouštěj až PO kompresi (afsctool přepisuje soubory a sdílení bloků by zrušil).
Vyžaduje fdupes v PATH. Výstup: počet skupin, nahrazených souborů, ušetřené bajty.
"""
import ctypes
import ctypes.util
import os
import struct
import subprocess
import sys

# clone ID (APFS ATTR_CMNEXT_CLONEID): stejné ID = soubory už sdílejí bloky
_libc = ctypes.CDLL(ctypes.util.find_library("c"), use_errno=True)


class _AttrList(ctypes.Structure):
    _fields_ = [("bitmapcount", ctypes.c_ushort), ("reserved", ctypes.c_uint16),
                ("commonattr", ctypes.c_uint32), ("volattr", ctypes.c_uint32),
                ("dirattr", ctypes.c_uint32), ("fileattr", ctypes.c_uint32),
                ("forkattr", ctypes.c_uint32)]


_attrs = _AttrList(5, 0, 0, 0, 0, 0, 0x100)
_buf = ctypes.create_string_buffer(64)


def clone_id(path):
    rc = _libc.getattrlist(os.fsencode(path), ctypes.byref(_attrs), _buf, ctypes.sizeof(_buf),
                           0x1 | 0x20)  # FSOPT_NOFOLLOW | FSOPT_ATTR_CMN_EXTENDED
    return None if rc != 0 else struct.unpack_from("=IQ", _buf.raw)[1]


def groups(dirs):
    p = subprocess.Popen(["fdupes", "-r", "-n", "-q", *dirs], stdout=subprocess.PIPE, text=True)
    assert p.stdout is not None
    cur = []
    for line in p.stdout:
        line = line.rstrip("\n")
        if line:
            cur.append(line)
        elif cur:
            yield cur
            cur = []
    if cur:
        yield cur
    if p.wait() != 0:
        sys.exit(f"fdupes rc={p.returncode}")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        return
    dry = args[0] == "--dry-run"
    dirs = args[1:] if dry else args
    n_groups = n_repl = saved = skipped = 0
    for g in groups(dirs):
        g.sort()
        keep = g[0]
        try:
            ks = os.lstat(keep)
        except OSError as e:  # soubor zmizel mezi fdupes a klonováním
            print(f"SKIP skupina {keep}: {e}", file=sys.stderr)
            skipped += len(g) - 1
            continue
        n_groups += 1
        keep_cid = clone_id(keep)
        for dup in g[1:]:
            try:
                ds = os.lstat(dup)
                if keep_cid is not None and clone_id(dup) == keep_cid:
                    skipped += 1  # už klon
                    continue
                if (ds.st_ino == ks.st_ino and ds.st_dev == ks.st_dev) or ds.st_dev != ks.st_dev \
                        or (ds.st_mode, ds.st_uid, ds.st_gid) != (ks.st_mode, ks.st_uid, ks.st_gid) \
                        or os.path.islink(dup) or os.path.islink(keep):
                    skipped += 1
                    continue
                if not dry:
                    tmp = dup + ".apfs-dedupe-tmp"
                    subprocess.run(["cp", "-c", keep, tmp], check=True)
                    os.utime(tmp, ns=(ds.st_atime_ns, ds.st_mtime_ns))
                    os.replace(tmp, dup)
                n_repl += 1
                saved += ds.st_size
            except Exception as e:  # jeden soubor nesmí shodit celý běh
                print(f"SKIP {dup}: {e}", file=sys.stderr)
                skipped += 1
    print(f"groups={n_groups} replaced={n_repl} skipped={skipped} logical_bytes={saved} dry_run={dry}")


main()
