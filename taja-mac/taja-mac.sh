#!/bin/bash
# 공식 구 한컴타자연습(Windows용)을 고치지 않고 Wine으로 맥에서 실행합니다.
# 사용법: 터미널에서  bash taja-mac.sh
# 지우려면: rm -rf ~/Library/Application\ Support/OldTaja
set -e

WINE_URL="https://github.com/Gcenx/macOS_Wine_builds/releases/download/11.21/wine-staging-11.21-osx64.tar.xz"
WINE_SHA="d7bcd5abf4df27aae397a7898aef074fea4a2e0b51e0a55aa9659517bbf9d452"
INSTALLER_SHA="f397a302826d45b78ea7fa5bd43c3c8b02896976d212679614fdf0dd97605d96"
INSTALLER="$HOME/Downloads/HTTOnline.exe"

BASE="$HOME/Library/Application Support/OldTaja"
WINE_DIR="$BASE/Wine Staging.app/Contents/Resources/wine/bin"
export WINEPREFIX="$BASE/prefix" WINEDEBUG=-all LANG=ko_KR.UTF-8 LC_ALL=ko_KR.UTF-8
GAME="$WINEPREFIX/drive_c/HancomTaja/HncTT80/HncTT.exe"
LOG="$WINEPREFIX/drive_c/taja-install.log"

die() { echo; echo "$1"; exit 1; }
sha() { shasum -a 256 "$1" | cut -d' ' -f1; }

# M 칩 맥은 Windows 프로그램을 돌리려면 Rosetta가 필요합니다.
if [ "$(uname -m)" = arm64 ] && ! arch -x86_64 /usr/bin/true 2>/dev/null; then
  echo "Rosetta를 설치합니다. 약관 동의를 물으면 A를 누르세요."
  softwareupdate --install-rosetta
fi

if [ ! -x "$WINE_DIR/wine" ]; then
  mkdir -p "$BASE"
  echo "Wine을 받습니다(약 220MB)."
  curl -fL --progress-bar -o "$BASE/wine.tar.xz" "$WINE_URL" ||
    die "Wine을 받지 못했어요. 인터넷 연결을 확인해 주세요."
  [ "$(sha "$BASE/wine.tar.xz")" = "$WINE_SHA" ] || { rm -f "$BASE/wine.tar.xz"; die "받은 Wine 파일이 예상과 달라 멈췄어요."; }
  tar -xf "$BASE/wine.tar.xz" -C "$BASE"
  rm -f "$BASE/wine.tar.xz"
fi

if [ ! -f "$GAME" ]; then
  if [ ! -f "$INSTALLER" ]; then
    open "https://www.hancomtaja.com/ko/overview"
    die "방금 열린 한컴타자 공식 페이지에서 '(구)한컴 타자연습'을 눌러 다운로드 폴더에 받은 뒤, 이 스크립트를 다시 실행하세요."
  fi
  [ "$(sha "$INSTALLER")" = "$INSTALLER_SHA" ] ||
    die "다운로드 폴더의 HTTOnline.exe가 공식 파일과 달라요. 공식 페이지에서 다시 받아 주세요."

  echo "구 한컴타자를 설치합니다. 몇 분 걸리고, 오류 창이 잠깐 떠도 그대로 두세요."
  rm -rf "$WINEPREFIX"
  "$WINE_DIR/wine" wineboot -i >/dev/null 2>&1
  "$WINE_DIR/wineserver" -w

  # 설치 프로그램은 한국어 Windows에서만 진행되므로 Wine의 시스템 언어도 한국어로 맞춥니다.
  for name in Default InstallLanguage; do
    "$WINE_DIR/wine" reg add 'HKLM\System\CurrentControlSet\Control\Nls\Language' /v "$name" /d 0412 /f >/dev/null 2>&1
  done
  "$WINE_DIR/wineserver" -w

  # 함께 실행되는 보조 프로그램이 Wine에서 오류로 멈추므로, 설치 완료 기록이 남으면 정리합니다.
  "$WINE_DIR/wine" "$INSTALLER" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART '/DIR=C:\HancomTaja' '/LOG=C:\taja-install.log' >/dev/null 2>&1 &
  for _ in $(seq 1 300); do
    grep -aq 'Installation process succeeded' "$LOG" 2>/dev/null && break
    sleep 1
  done
  "$WINE_DIR/wineserver" -k || true
  wait $! || true
  [ -f "$GAME" ] || die "설치가 끝나지 않았어요. Wine에서 설치 프로그램이 실패한 것 같아요."
fi

cd "$(dirname "$GAME")"
exec "$WINE_DIR/wine" HncTT.exe
