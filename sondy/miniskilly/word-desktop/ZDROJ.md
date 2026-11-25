# Šablona z desktopového Wordu

`sablona-desktop-word.docx` vytvořil 24. 11. 2026 desktopový **Microsoft Word for Mac** (AppVersion 16.0000) přes AppleScript
(`make new document`, `make new field … field merge field`, `save as … format document`).
Obsah: značky `{{jmeno}}`, `{{oddeleni}}`, `{{datum}}`, `{{hodnoceni}}` a slučovací pole `MERGEFIELD jmeno` (`w:fldSimple`).
Word pro Windows ❓ neověřeno (lab je macOS).

Oprava 24. 11.: nadpis byl „ariaPotvrzení o školení“ (zbytek AppleScriptu). V `word/document.xml` je přepsaný
na „Potvrzení o školení“, ostatní části balíku jsou beze změny. Test ms-uprava-dok (`sondy/dokumenty/uprava/klik-3.log`)
běžel ještě nad verzí s vadou. Ta se týká jen textu nadpisu, ne značek ani pole.
