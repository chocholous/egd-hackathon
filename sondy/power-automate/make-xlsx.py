#!/usr/bin/env python3
"""Vyrobí sondy/power-automate/vystupy/tabulka-test.xlsx s Excel tabulkou „Tabulka1“ (Klic, Hodnota) a vypíše base64 do stdout (pro expression base64ToBinary)."""
import base64, os, sys
from openpyxl import Workbook
from openpyxl.worksheet.table import Table
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vystupy", "tabulka-test.xlsx")
wb = Workbook(); ws = wb.active; ws.title = "List1"
ws.append(["Klic", "Hodnota"]); ws.append(["A", "puvodni"]); ws.append(["B", "puvodni"])
t = Table(displayName="Tabulka1", ref="A1:B3"); ws.add_table(t); wb.save(out)
sys.stdout.write(base64.b64encode(open(out, "rb").read()).decode())
