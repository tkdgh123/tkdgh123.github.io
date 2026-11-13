@echo off
chcp 65001 >nul
rem 덜미 카메라 지킴이 준비 - 처음 한 번만 더블클릭 (인터넷 필요)
rem python이 없으면 winget으로 깔고, 휴대폰 인식에 쓰는 mediapipe를 받는다
rem 찾은 python 위치는 eye\python.txt 에 적어 둔다 (덜미가 /eye 할 때 이걸 씀)
cd /d "%~dp0"
echo [카메라 준비] 덜미 카메라 지킴이에 필요한 것을 준비합니다
echo.

rem 1. 이미 깔린 python (윈도우 스토어 바로 가기는 진짜 python이 아니라서 실행해 보고 확인)
set "PY="
python -c "import sys" >nul 2>nul && set "PY=python"
if defined PY goto have_python
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if defined PY goto have_python

rem 2. 없으면 winget으로 python 3.12 깔기 (내 계정에만, 관리자 권한 필요 없음)
echo python이 없어서 새로 깝니다. 몇 분 걸립니다...
winget install -e --id Python.Python.3.12 --scope user --silent --accept-package-agreements --accept-source-agreements
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if defined PY goto have_python
echo.
echo [실패] python을 깔지 못했습니다. https://www.python.org 에서 python을 깔고 이 파일을 다시 실행하세요.
pause
exit /b 1

:have_python
echo python 찾음: %PY%
echo 휴대폰 인식에 쓰는 mediapipe를 받습니다. 처음엔 몇 분 걸립니다...
"%PY%" -m pip install --disable-pip-version-check mediapipe==1.2.0
if errorlevel 1 goto fail
"%PY%" -c "import mediapipe, cv2" 2>nul
if errorlevel 1 goto fail
"%PY%" -c "import sys; open(r'eye\python.txt', 'w', encoding='utf-8').write(sys.executable)"
echo.
echo [카메라 준비] 끝. 덜미에서 /eye 를 치면 카메라 지킴이가 켜집니다.
pause
exit /b 0

:fail
echo.
echo [실패] mediapipe를 받지 못했습니다. 인터넷 연결을 확인하고 이 파일을 다시 실행하세요.
pause
exit /b 1
