@echo off
rem 덜미 자동 테스트 (Visual Studio 개발자 명령 프롬프트에서, deolmi 폴더에서 tests\run.bat)
rem 방장 H를 켜 두고 테스트 두 개를 돌린 뒤 방장을 끈다
cl /nologo /W4 /utf-8 deolmi.c || exit /b 1
cl /nologo /W4 /utf-8 /Fe:tests\test_net.exe /Fo:tests\ tests\test_net.c || exit /b 1
cl /nologo /W4 /utf-8 /Fe:tests\test_server.exe /Fo:tests\ tests\test_server.c || exit /b 1
set fail=0
for %%t in (test_net test_server) do (
    start "" /b cmd /c "ping -n 30 127.0.0.1 >nul | .\deolmi.exe H --host >nul"
    ping -n 2 127.0.0.1 >nul
    echo == %%t
    .\tests\%%t.exe || set fail=1
    taskkill /f /im deolmi.exe >nul 2>nul
    ping -n 2 127.0.0.1 >nul
)
exit /b %fail%
