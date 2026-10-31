Option Explicit
Dim shell, files, root, node, shortcut, target
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
root = files.GetParentFolderName(files.GetParentFolderName(WScript.ScriptFullName))
node = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\nodejs\node.exe"
If Not files.FileExists(node) Then WScript.Echo "Node.js is missing.": WScript.Quit 1
target = shell.SpecialFolders("Desktop") & "\Realhub.lnk"
Set shortcut = shell.CreateShortcut(target)
If files.FileExists(target) Then
 If InStr(1, shortcut.Arguments, root, vbTextCompare) = 0 Then WScript.Echo "Shortcut belongs to another installation.": WScript.Quit 1
End If
shortcut.TargetPath = node
shortcut.Arguments = Chr(34) & root & "\scripts\start-desktop.mjs" & Chr(34)
shortcut.WorkingDirectory = root
shortcut.WindowStyle = 1
shortcut.Description = "Realhub - visible local server and Companion console"
shortcut.IconLocation = shell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\shell32.dll,14"
shortcut.Save
target = shell.SpecialFolders("Desktop") & "\Stop Realhub.lnk"
Set shortcut = shell.CreateShortcut(target)
If files.FileExists(target) Then
 If InStr(1, shortcut.Arguments, root & "\scripts\stop-desktop.mjs", vbTextCompare) = 0 Then WScript.Echo "Stop shortcut belongs to another installation.": WScript.Quit 1
End If
shortcut.TargetPath = node
shortcut.Arguments = Chr(34) & root & "\scripts\stop-desktop.mjs" & Chr(34)
shortcut.WorkingDirectory = root
shortcut.WindowStyle = 1
shortcut.Description = "Stop this Realhub server and Companion; preserve saved libraries"
shortcut.IconLocation = shell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\shell32.dll,27"
shortcut.Save
WScript.Echo "Realhub and Stop Realhub desktop shortcuts are ready. Both use Node.js directly."
