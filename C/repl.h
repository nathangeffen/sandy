#ifndef __REPL_H__
#define __REPL_H__

#include "board.h"
#include "position.h"

#define SHOW_PROMPT 1

void print_help();
int repl(board_t *board, int options);

#endif
