CC = gcc
CFLAGS = -Wall -Wextra -g
TESTS = tests/test_net tests/test_server

# 프로그램은 deolmi.c 한 파일
deolmi: deolmi.c
	$(CC) $(CFLAGS) -o deolmi deolmi.c

# 테스트는 deolmi.c 의 통신 부분(NET_ONLY)만 가져다 쓴다
tests/%: tests/%.c deolmi.c
	$(CC) $(CFLAGS) -o $@ $<

# 서버를 새로 켜고 테스트를 돌린 뒤 끈다
test: deolmi $(TESTS)
	@for t in $(TESTS); do \
	    ./deolmi --server > /dev/null & pid=$$!; sleep 0.3; \
	    echo "== $$t"; ./$$t; r=$$?; kill $$pid; wait $$pid 2>/dev/null; \
	    [ $$r -eq 0 ] || exit 1; \
	done

clean:
	rm -f deolmi $(TESTS)

.PHONY: test clean
