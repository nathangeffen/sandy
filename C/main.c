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

static int process_args(int argc, char **argv, board_t *board)
{
  int opt, ret = 0, initialized = false;
  while ((opt = getopt(argc, argv, "qp:")) != -1) {
    switch (opt) {
    case 'q':
      options = options ^ SHOW_PROMPT;
      break;
    case 'p':
      ret = string_to_board(board, (unsigned char *) argv[1]);
      if (ret == 0) initialized = true;
      break;
    default: /* '?' */
      fprintf(stderr, "Usage: %s [-p position]\n", argv[0]);
      exit(EXIT_FAILURE);
    }
  }
  if (initialized == false) {
    ret = init_board(board, 9, 9);
  }
  return ret;
}

int main(int argc, char **argv)
{
  board_t board;

  if (process_args(argc, argv, &board)) return 1;
  if (repl(&board, options)) return 1;
  free_board(&board);
  return 0;
}
