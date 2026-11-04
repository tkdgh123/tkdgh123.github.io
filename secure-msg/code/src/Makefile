CC = gcc
CFLAGS = -Wall -Wextra -g
TESTS = tests/test_net tests/test_server

# 윈도우(MSYS2/MinGW)에서 make 하면 소켓 라이브러리를 붙인다 (deolmi.exe 가 생김)
ifeq ($(OS),Windows_NT)
LDLIBS = -lws2_32
endif

# 프로그램은 deolmi.c 한 파일
deolmi: deolmi.c
	$(CC) $(CFLAGS) -o deolmi deolmi.c $(LDLIBS)

# 테스트는 deolmi.c 의 통신 부분(NET_ONLY)만 가져다 쓴다
tests/%: tests/%.c deolmi.c
	$(CC) $(CFLAGS) -o $@ $<

# 방장 H를 새로 켜고 테스트를 돌린 뒤 끈다 (sleep 이 입력을 열어 두어 방장이 바로 끝나지 않게)
test: deolmi $(TESTS)
	@for t in $(TESTS); do \
	    sleep 20 | ./deolmi H --host > /dev/null & pid=$$!; sleep 0.3; \
	    echo "== $$t"; ./$$t; r=$$?; kill $$pid; wait $$pid 2>/dev/null; \
	    [ $$r -eq 0 ] || exit 1; \
	done

clean:
	rm -f deolmi $(TESTS)

.PHONY: test clean
