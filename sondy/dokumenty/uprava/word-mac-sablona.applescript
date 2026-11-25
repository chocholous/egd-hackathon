set cil to POSIX file "/Users/chocholous/Library/Containers/com.microsoft.Word/Data/Documents/sablona-word.docx"
tell application "Microsoft Word"
	activate
	set d to make new document
	set r to text object of d
	insert text "Potvrzení o účasti na workshopu" at end of r
	insert paragraph at end of text object of d
	insert text "Jméno účastníka: {{jmeno}}" at end of text object of d
	insert paragraph at end of text object of d
	insert text "Útvar: {{utvar}}, datum: {{datum}}" at end of text object of d
	insert paragraph at end of text object of d
	insert text "Hodnocení: {{hodnoceni}} z 5" at end of text object of d
	insert paragraph at end of text object of d
	insert text "Pole hromadné korespondence: " at end of text object of d
	set konec to (end of content of text object of d) - 1
	set rr to create range d start konec end konec
	create new field text range rr field type field merge field field text "jmeno"
	insert paragraph at end of text object of d
	-- rozdělení zástupných textů do více runů: část tučně, část jiným písmem
	set p1 to text object of paragraph 2 of d
	set s to (start of content of p1) + 17
	set bold of font object of (create range d start (s + 2) end (s + 6)) to true
	set p2 to text object of paragraph 3 of d
	set s2 to (start of content of p2) + 7
	set name of font object of (create range d start (s2 + 3) end (s2 + 7)) to "Arial"
	set italic of font object of (create range d start (s2 + 5) end (s2 + 9)) to true
	save as d file name (cil as text) file format format document
	close d saving no
end tell
