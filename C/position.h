#ifndef POSITION_H
#define POSITION_H

#define PCRE2_CODE_UNIT_WIDTH 8
#define _GNU_SOURCE

#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <pcre2.h>


#include <stdio.h>

#include "board.h"

int string_to_board(board_t *board, unsigned char *spec);
void output_board(const board_t *board, FILE *f);

#endif
