@echo off
rem 덜미 자동 테스트 (Visual Studio 개발자 명령 프롬프트에서, deolmi 폴더에서 tests\run.bat)
rem 1) 키 부분 단위 테스트  2) 방장 H를 켜 두고 통신·중계 테스트  3) 네 명이 실제로 쓰는 시나리오 (python 필요)
set CL=/nologo /W4 /utf-8 /Ilibsodium\include
set LINK=/LIBPATH:libsodium\lib\Release
set DEOLMI_HOME=%TEMP%\deolmi-test
cl deolmi.c || exit /b 1
cl /Fe:tests\test_crypto.exe /Fo:tests\ tests\test_crypto.c || exit /b 1
cl /Fe:tests\test_net.exe /Fo:tests\ tests\test_net.c || exit /b 1
cl /Fe:tests\test_server.exe /Fo:tests\ tests\test_server.c || exit /b 1
set fail=0
echo == test_crypto
.\tests\test_crypto.exe || set fail=1
for %%t in (test_net test_server) do (
    start "" /b cmd /c "ping -n 30 127.0.0.1 >nul | .\deolmi.exe H --host >nul"
    ping -n 2 127.0.0.1 >nul
    echo == %%t
    .\tests\%%t.exe || set fail=1
    taskkill /f /im deolmi.exe >nul 2>nul
    ping -n 2 127.0.0.1 >nul
)
echo == e2e
python tests\e2e.py || set fail=1
exit /b %fail%
