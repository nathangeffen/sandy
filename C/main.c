#define PCRE2_CODE_UNIT_WIDTH 8
#define _GNU_SOURCE

#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pcre2.h>

#include "board.h"
#include "position.h"
#include "repl.h"

static bool options = SHOW_PROMPT;

static void print_help(const char *prog)
{
  printf("%s [-dhqp] <args>\n"
	 "An experimental game\n"
	 "Options:\n"
	 " -d \t Load default position\n"
	 " -h \t Show help\n"
	 " -q \t Do not show prompt\n"
	 " -p <position> \t Load position\n"
	 , prog);

}

static board_t *process_args(int argc, char **argv)
{
  board_t *board;
  int opt, initialized = false;
  while ((opt = getopt(argc, argv, "hqp:")) != -1) {
    switch (opt) {
    case 'q':
      options = options ^ SHOW_PROMPT;
      break;
    case 'p':
      board = string_to_board((unsigned char *) argv[1]);
      if (board) initialized = true;
      break;
    case 'h':
      print_help(argv[0]);
      exit(EXIT_SUCCESS);
    default: /* '?' */
      fprintf(stderr, "Usage: %s [-p position]\n", argv[0]);
      exit(EXIT_FAILURE);
    }
  }
  if (initialized == false) {
      board = string_to_board((unsigned char *) DEFAULT_POSITION);
  }
  return board;
}

int main(int argc, char **argv)
{
  board_t *board;

  board = process_args(argc, argv);
  if (board == NULL) return 1;
  int ret = repl(&board, options);
  free_board(board);
  return ret;
}
