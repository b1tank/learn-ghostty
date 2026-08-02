#define _XOPEN_SOURCE 700
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <termios.h>
#include <unistd.h>

static void print_id(const char *name, long value) {
    if (value < 0) {
        printf("%-22s unavailable (%s)\n", name, strerror(errno));
    } else {
        printf("%-22s %ld\n", name, value);
    }
}

int main(void) {
    const int input_is_tty = isatty(STDIN_FILENO);
    const int output_is_tty = isatty(STDOUT_FILENO);
    const char *name = ttyname(STDIN_FILENO);

    printf("stdin is a terminal    %s\n", input_is_tty ? "yes" : "no");
    printf("stdout is a terminal   %s\n", output_is_tty ? "yes" : "no");
    printf("terminal device        %s\n", name ? name : "(none)");
    print_id("process id (PID)", (long)getpid());
    print_id("parent id (PPID)", (long)getppid());
    print_id("session id (SID)", (long)getsid(0));
    print_id("process group (PGID)", (long)getpgrp());

    if (input_is_tty) {
        print_id("foreground PGID", (long)tcgetpgrp(STDIN_FILENO));
    } else {
        printf("%-22s not applicable (stdin is not a terminal)\n", "foreground PGID");
    }
    return 0;
}
