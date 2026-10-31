Option Explicit
' Bounded WMI bridge. No PowerShell, shell command construction, or port-based kills.
Dim service, rows, row, mode, pid, stamp, result
Set service = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
If WScript.Arguments.Count = 0 Then WScript.Quit 2
mode = WScript.Arguments(0)
If mode = "list" Then
 Set rows = service.ExecQuery("SELECT ProcessId,ParentProcessId,CreationDate,Name,CommandLine FROM Win32_Process WHERE Name='node.exe'")
 For Each row In rows
  If Not IsNull(row.CommandLine) And Not IsNull(row.CreationDate) Then
   WScript.Echo "{""pid"":" & row.ProcessId & ",""parent"":" & row.ParentProcessId & ",""created"":" & Quoted(row.CreationDate) & ",""command"":" & Quoted(row.CommandLine) & "}"
  End If
 Next
ElseIf mode = "terminate" And WScript.Arguments.Count = 3 Then
 pid = WScript.Arguments(1) : stamp = WScript.Arguments(2)
 If Not IsNumeric(pid) Then WScript.Quit 2
 If CLng(pid) <= 0 Then WScript.Quit 2
 Set rows = service.ExecQuery("SELECT ProcessId,CreationDate,Name FROM Win32_Process WHERE ProcessId=" & CLng(pid))
 For Each row In rows
  If row.Name <> "node.exe" Or row.CreationDate <> stamp Then WScript.Quit 3
  result = row.Terminate(0)
  If result <> 0 Then WScript.Quit 4
 Next
Else
 WScript.Quit 2
End If
Function Quoted(value)
 Dim index, code, output, part
 value = Replace(value, "\", "\\")
 value = Replace(value, Chr(34), "\" & Chr(34))
 value = Replace(value, vbCr, "\r")
 value = Replace(value, vbLf, "\n")
 value = Replace(value, vbTab, "\t")
 output = ""
 For index = 1 To Len(value)
  part = Mid(value, index, 1) : code = AscW(part)
  If code < 0 Then code = code + 65536
  If code < 32 Or code > 126 Then
   output = output & "\u" & Right("0000" & Hex(code), 4)
  Else
   output = output & part
  End If
 Next
 Quoted = Chr(34) & output & Chr(34)
End Function
