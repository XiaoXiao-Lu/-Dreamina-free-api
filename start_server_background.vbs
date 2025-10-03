' Dreamina AI Server - Silent Background Starter
' This script starts the server completely silently (no windows at all)

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the script's directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Change to script directory
WshShell.CurrentDirectory = scriptDir

' Check if server.py exists
serverPath = scriptDir & "\web\server.py"
If Not fso.FileExists(serverPath) Then
    MsgBox "Error: web\server.py not found!" & vbCrLf & vbCrLf & "Please run this script from the project root directory.", vbCritical, "Dreamina AI Server"
    WScript.Quit 1
End If

' Start server in background (completely hidden)
WshShell.Run "pythonw web\server.py", 0, False

' Wait 3 seconds for server to start
WScript.Sleep 3000

' Show success message
MsgBox "Dreamina AI Server started in background!" & vbCrLf & vbCrLf & _
       "Access URL: http://localhost:5000" & vbCrLf & vbCrLf & _
       "To stop the server, run: stop_server.bat", vbInformation, "Dreamina AI Server"

' Optional: Open browser
result = MsgBox("Open browser now?", vbYesNo + vbQuestion, "Dreamina AI Server")
If result = vbYes Then
    WshShell.Run "http://localhost:5000", 1, False
End If

