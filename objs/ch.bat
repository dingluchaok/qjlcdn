

@echo off

:start
echo start
C:\curl-7.70.0-win64-mingw\bin\curl.exe http://127.0.0.1/Home/Queue/upsssss
echo end 
choice /T 1 /C ync /CS /D y /n
goto start