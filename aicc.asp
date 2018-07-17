<% Response.Expires = 0 %>
<%
Dim fso, f, loc, logstring, data, logfile, datafile, s

Const ForReading = 1, ForWriting = 2, ForAppending = 8
loc = Server.MapPath(Request.ServerVariables("SCRIPT_NAME"))
Set fso = CreateObject("Scripting.FileSystemObject")
logfile = "logs/log.txt"
datafile = "data/data.txt"

logstring = ""
logstring = logstring & "--------------------------------------------" & vbCrLf
logstring = logstring & "Date/Time: " & Now & vbCrLf
logstring = logstring & "--------------------------------------------" & vbCrLf

If LCase(Request.Form("command")) <> "" then
    logstring = logstring & "command: " & LCase(Request.Form("command")) & vbCrLf
End If

If LCase(Request.Form("session_id")) <> "" then
	logstring = logstring & "session_id: " & LCase(Request.Form("session_id")) & vbCrLf
End If

If LCase(Request.Form("aicc_data")) <> "" then
	logstring = logstring & "aicc_data:" & vbCrLf & LCase(Request.Form("aicc_data")) & vbCrLf
End If

%>

<%
If LCase(Request.Form("command")) = "getparam" Then
  
  s = ""
   
  set df = fso.getFile(fso.GetParentFolderName(loc) + "\/" + datafile)
  If df.size > 0 then
		Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + datafile, ForReading, True)
		s = f.ReadAll 
		f.Close
		Set f = Nothing
	End If
	
	If s = "" Then
    s = s&"error=0" & vbCrLf
    s = s&"error_text=Successful" & vbCrLf
    s = s&"version=2.0" & vbCrLf
    s = s&"aicc_data=[core]" & vbCrLf
    s = s&"student_id=demo" & vbCrLf
    s = s&"student_name=demo" & vbCrLf
    s = s&"output_file=" & vbCrLf
    s = s&"lesson_location=null" & vbCrLf
    s = s&"credit=no-credit" & vbCrLf
    s = s&"lesson_mode=" & vbCrLf
    s = s&"lesson_status=N" & vbCrLf
    s = s&"time=00:00:00" & vbCrLf
    s = s&"score=" & vbCrLf
    s = s&"[Core_Lesson]" & vbCrLf
    s = s&""
  End If

  logstring = logstring & "Data Returned:" & vbCrLf
  logstring = logstring & "--------------------------------------------" & vbCrLf
  logstring = logstring & s
  logstring = logstring & "--------------------------------------------" & vbCrLf & vbCrLf

  Response.Write s

ElseIf LCase(Request.Form("command")) = "putparam" Or LCase(Request.Form("command")) = "exitau" Then

  s = ""
  s = s&"error=0" & vbCrLf
  s = s&"version=2.0" & vbCrLf
  s = s&"aicc_data=" & vbCrLf
  
  If LCase(Request.Form("command")) = "putparam" Then
    
    s = s&Request.Form("aicc_data")
  
    Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + datafile, ForWriting, True)
    f.Write s
    f.Close
    Set f = Nothing
    
  Else
    
    s = ""
    s = s&"error=0" & vbCrLf
    s = s&"version=2.0" & vbCrLf
    
  End If
  
  Response.Write s
  
End If

If LCase(Request.Form("command")) <> "" then

	Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + logfile, ForAppending, True)
	f.Write logstring
	f.Close
	Set f = Nothing
	
End If

%>

<% If LCase(Request.Form("command")) <> "getparam" And LCase(Request.Form("command")) <> "putparam" And LCase(Request.Form("command")) <> "exitau" And Request.QueryString("command") = "" then %>
error=1
error_text=Unknown command
version=2.0
aicc_data=
<% End If %>

<%
If LCase(Request.QueryString("command")) = "getlog" then
	set lf = fso.getFile(fso.GetParentFolderName(loc) + "\/" + logfile)
  If lf.size > 0 then
		Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + logfile, ForReading, True)
		s = f.ReadAll 
		f.Close
		Set f = Nothing
	Else
		s = "Log file is empty!"
	End If
	
	Response.Write s
End If
%>

<%
If LCase(Request.QueryString("command")) = "getdata" then
  set lf = fso.getFile(fso.GetParentFolderName(loc) + "\/" + datafile)
  If lf.size > 0 then
    Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + datafile, ForReading, True)
    s = f.ReadAll 
    f.Close
    Set f = Nothing
  Else
    s = "Data file is empty!"
  End If
  
  Response.Write s
End If
%>

<%
If LCase(Request.QueryString("command")) = "clearlog" then
	Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + logfile, ForWriting, True)
	f.Write ""
	f.Close
	Set f = Nothing
	
	Response.Write "SUCCESS"
End If
%>

<%
If LCase(Request.QueryString("command")) = "cleardata" then
	Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + datafile, ForWriting, True)
	f.Write ""
	f.Close
	Set f = Nothing
	
	Response.Write "SUCCESS"
End If
%>

<%
If LCase(Request.QueryString("command")) = "test" then 
	logstring = ""
	logstring = logstring & "--------------------------------------------" & vbCrLf
	logstring = logstring & "AICC Script Test: " & Now & vbCrLf
	logstring = logstring & "--------------------------------------------" & vbCrLf
	
	Set f = fso.OpenTextFile(fso.GetParentFolderName(loc) + "\/" + logfile, ForAppending, True)
	f.Write logstring
	f.Close
	Set f = Nothing
	
	Response.Write "SUCCESS"
End If
%>