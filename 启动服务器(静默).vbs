Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)

' 检查server.py是否存在
serverPath = scriptPath & "\web\server.py"
If Not fso.FileExists(serverPath) Then
    MsgBox "错误: 未找到 web\server.py 文件" & vbCrLf & "请确保在项目根目录运行此脚本", vbCritical, "Dreamina AI"
    WScript.Quit
End If

' 检查是否已经在运行
pidFile = scriptPath & "\.server_pid.txt"
If fso.FileExists(pidFile) Then
    result = MsgBox("服务器可能已在运行" & vbCrLf & "是否重新启动?", vbYesNo + vbQuestion, "Dreamina AI")
    If result = vbNo Then
        WScript.Quit
    Else
        ' 先关闭旧进程
        WshShell.Run "cmd /c taskkill /F /IM pythonw.exe /FI ""WINDOWTITLE eq *server.py*""", 0, True
        WScript.Sleep 1000
    End If
End If

' 启动服务器(完全隐藏窗口)
WshShell.CurrentDirectory = scriptPath
WshShell.Run "pythonw web\server.py", 0, False

' 等待服务器启动
WScript.Sleep 3000

' 保存进程ID
WshShell.Run "cmd /c for /f ""tokens=2"" %i in ('tasklist /FI ""IMAGENAME eq pythonw.exe"" /FO LIST ^| find ""PID:""') do @echo %i > .server_pid.txt", 0, True

' 显示成功消息
result = MsgBox("✅ 服务器已在后台启动!" & vbCrLf & vbCrLf & _
                "📡 访问地址:" & vbCrLf & _
                "   本地: http://localhost:5000" & vbCrLf & _
                "   局域网: http://192.168.3.68:5000" & vbCrLf & vbCrLf & _
                "💡 双击""关闭服务器.bat""可停止服务器" & vbCrLf & vbCrLf & _
                "是否打开浏览器?", vbYesNo + vbInformation, "Dreamina AI")

If result = vbYes Then
    WshShell.Run "http://localhost:5000"
End If

