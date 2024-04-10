#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "board.h"


// useful utility function
void substr_regex(pcre2_code *re, const PCRE2_SIZE* ovector,
			 const char *name, char *dest, const char *src)
{
  int i = pcre2_substring_number_from_name(re, (PCRE2_SPTR) name);
  int start = ovector[2 * i];
  int end = ovector[2 * i + 1];
  strncpy(dest, src + start, end - start);
  dest[end - start] = 0;
}



int init_board(board_t *board, int ranks, int files) {
  // Initialize all to 0
  *board = (board_t) {0};

  board->ranks = ranks;
  board->files = files;

  // Calloc space for squares
  board->squares = calloc(ranks * files, sizeof(*board->squares));
  if (board->squares == NULL) {
    fprintf(stderr, "Cannot allocate board squares.");
    return -1;
  }
  // Calloc space for scores
  assert(sizeof(*board->scores[0]) == sizeof(int));
  for (int i = 0; i < 4; i++) {
    board->scores[i] = calloc(ranks * files, sizeof(*board->scores[0]));
    if (board->scores[i] == NULL) {
      fprintf(stderr, "Cannot allocate board scores.");
      return -1;
    }
  }
  return 0;
}

void free_board(board_t *board) {
  free(board->squares);
  for (int i = 0; i < 4; i++) {
    free(board->scores[i]);
  }
}

static void print_square(const board_t *board, int rank, int file,
			 int side, int piecemap, int score_index) {
  int square = board->squares[RF(rank, file)];
  if (square == NONE) {
    putchar('_');
  } else if (square & BLOCK_ANY & side) {
    putchar('X');
  } else if (square & piecemap) {
    if (square & ROOK) {
      putchar('R');
    } else {
      putchar('B');
    }
  } else {
    putchar('_');
  }
  printf("%d", board->scores[score_index][RF(rank, file)]);
}

char to_play_char(const board_t *board)
{
  switch(board->num_moves % 4) {
  case 0: return 'S';
  case 1: return 'W';
  case 2: return 'N';
  case 3: return 'E';
  default: return 'X'; // Shouldn't happen
  };
}

int to_play_int(const board_t *board)
{
  switch(board->num_moves % 4) {
  case 0: return SOUTH;
  case 1: return WEST;
  case 2: return NORTH;
  case 3: return EAST;
  default: return 'X'; // Shouldn't happen
  };
}


void print_board(const board_t* board) {
  for (int i = board->ranks - 1; i >= 0; i--) {
    int side = NONE;
    int piecemap = 0;
    int score_index = -1;
    while (side != SOUTH) {
      switch (side) {
      case NONE:
	side = NORTH;
	piecemap = NORTH_PIECE;
	score_index = NORTH_SCORE;
	break;
      case NORTH:
	side = WEST;
	piecemap = WEST_PIECE;
	score_index = WEST_SCORE;
	break;
      case WEST:
      case EAST:
	piecemap = SOUTH_PIECE;
	score_index = SOUTH_SCORE;
	side = SOUTH;
	break;
      }
      for (int j = 0; j < board->files; j++) {
	switch (side) {
	case NORTH:
	case SOUTH:
	  printf("      ");
	  print_square(board, i, j, side, piecemap, score_index);
	  printf("  ");
	  break;
	default: // We're in West
	  printf("    ");
	  print_square(board, i, j, side, piecemap, score_index);
	  printf("  ");
	  side = EAST;
	  piecemap = EAST_PIECE;
	  score_index = EAST_SCORE;
	  print_square(board, i, j, side, piecemap, score_index);
	  side = WEST;
	  piecemap = WEST_PIECE;
	  score_index = WEST_SCORE;
	}
	if (j == board->files - 1 && side == WEST) {
	  printf("  %d", i);
	}
      }
      puts("");
    }
    puts("");
  }
  printf("       ");
  for (int i = 0; i < board->files; i++) {
    int c = printf("%d", i);
    printf("%*s", 10-c, "");
  }
  printf(" (%c %d)\n", to_play_char(board), board->game_type);
}

void print_moves(board_t *board, const char *delim)
{
  printf("%d possible moves\n", board->num_moves);
  for (int i  = 0; i < board->num_moves; i++)
    printf("(%d %d - %d %d)%s",
	   board->moves[i].file_from,
	   board->moves[i].rank_from,
	   board->moves[i].file_to,
	   board->moves[i].rank_to,
	   delim);
}


int get_rank(const board_t *board, int square) {
  return square / board->files;
}

int get_file(const board_t *board, int square) {
  return square % board->ranks;
}

const static int rook_directions[] = {
  0, -1,
  -1, 0,
  0, 1,
  1, 0
};


const static int bishop_directions[] = {
  1, -1,
  1, 1,
  -1, -1,
  -1, 1
};


void get_piece_moves(board_t *board, int rank, int file)
{
  const int *direction;
  if (board->squares[RF(rank, file)] == ROOK) {
    direction = rook_directions;
  } else {
    direction = bishop_directions;
  }
  for (int i = 0; i < 4; i++) {
    bool blocked = false;
    const int rank_jump = direction[i * 2];
    const int file_jump = direction[i * 2 + 1];
    int r = rank + rank_jump;
    int f = file + file_jump;
    while (r >= 0 && r < board->ranks &&
	   f >= 0 && f < board->files &&
	   blocked == false) {
      if (board->squares[RF(rank, file)] == EMPTY) {
	if (board->num_moves >= MAX_MOVES) {
	  fprintf(stderr, "Too many possible moves");
	  exit(EXIT_FAILURE);
	}
	board->moves[board->num_moves].rank_from = rank;
	board->moves[board->num_moves].file_from = file;
	board->moves[board->num_moves].rank_to = r;
	board->moves[board->num_moves].file_to = f;
	board->num_moves++;
	r += rank_jump;
	f += file_jump;
      } else {
	blocked = true;
      }
    }
  }
}

static int piece_color(int i) {
  if (i & SOUTH_PIECE) return SOUTH;
  if (i & WEST_PIECE) return EAST;
  if (i & NORTH_PIECE) return NORTH;
  if (i & EAST_PIECE) return EAST;
  return NONE;
}

void get_moves(board_t *board) {
  board->num_moves = 0;
  for (int i = 0; i < board->ranks; i++) {
    for (int j = 0; j < board->files; j++) {
      int to_play = to_play_int(board);
      if (to_play == piece_color(board->squares[RF(i,j)]) &&
	  board->scores[board->num_moves % 4][RF(i,j)] == 0) {
	get_piece_moves(board, i, j);
      }
    }
  }
}


void set_piece(board_t *board, char side, char piece, int file, int rank)
{
  if (rank >= board->ranks || rank < 0 ||
      file >= board->files || file < 0) {
    fprintf(stderr, "Square (%d, %d) out of bounds in board "
	    "with dimensions %dx%d.\n",
	    file, rank, board->ranks, board->files);
    return;
  }
  switch (side) {
  case 's':
  case 'S':
    if (piece == 'r')
      board->squares[FR(file, rank)] = SOUTH_ROOK;
    else if (piece == 'b')
      board->squares[FR(file, rank)] = SOUTH_BISHOP;
    else
      board->squares[FR(file, rank)] = NONE;
    break;
  case 'w':
  case 'W':
    if (piece == 'r')
      board->squares[FR(file, rank)] = WEST_ROOK;
    else if (piece == 'b')
      board->squares[FR(file, rank)] = WEST_BISHOP;
    else
      board->squares[FR(file, rank)] = NONE;
    break;
  case 'e':
  case 'E':
    if (piece == 'r')
      board->squares[FR(file, rank)] = EAST_ROOK;
    else if (piece == 'b')
      board->squares[FR(file, rank)] = EAST_BISHOP;
    else
      board->squares[FR(file, rank)] = NONE;
    break;
  case 'n':
  case 'N':
    if (piece == 'r')
      board->squares[FR(file, rank)] = NORTH_ROOK;
    else if (piece == 'b')
      board->squares[FR(file, rank)] = NORTH_BISHOP;
    else
      board->squares[FR(file, rank)] = NONE;
    break;
  }
}

void set_block(board_t *board, const char *side, int file, int rank)
{
  if (rank >= board->ranks || rank < 0 ||
      file >= board->files || file < 0) {
    fprintf(stderr, "Square (%d, %d) out of bounds in board "
	    "with dimensions %dx%d.\n",
	    file, rank, board->ranks, board->files);
    return;
  }
  board->squares[FR(file, rank)]  = 0;
  if (side[0] == 'x') return;
  for (const char *s = side; *s != 0; s++) {
    switch (*s) {
    case 's':
    case 'S':
      board->squares[FR(file, rank)] |= SOUTH_BLOCK;
      break;
    case 'w':
    case 'W':
      board->squares[FR(file, rank)] |= WEST_BLOCK;
      break;
    case 'e':
    case 'E':
      board->squares[FR(file, rank)] |= EAST_BLOCK;
      break;
    case 'n':
    case 'N':
      board->squares[FR(file, rank)] |= NORTH_BLOCK;
      break;
    }
  }
}


void set_score(board_t *board, const char *side,
	       int score, int file, int rank)
{
  if (rank >= board->ranks || rank < 0 ||
      file >= board->files || file < 0) {
    fprintf(stderr, "Square (%d, %d) out of bounds in board "
	    "with dimensions %dx%d.\n",
	    file, rank, board->ranks, board->files);
    return;
  }
  board->squares[FR(file, rank)] = 0;
  for (const char *s = side; *s != 0; s++) {
    switch (*s) {
    case 's':
    case 'S':
      board->scores[SOUTH_SCORE][FR(file, rank)] = score;
      break;
    case 'w':
    case 'W':
      board->scores[WEST_SCORE][FR(file, rank)] = score;
      break;
    case 'n':
    case 'N':
      board->scores[NORTH_SCORE][FR(file, rank)] = score;
      break;
    case 'e':
    case 'E':
      board->scores[EAST_SCORE][FR(file, rank)] = score;
      break;

    }
  }
}

void set_side(board_t *board, char side)
{
  switch(side) {
  case 's':
    board->num_moves = 0; break;
  case 'w':
    board->num_moves = 1; break;
  case 'n':
    board->num_moves = 2; break;
  case 'e':
    board->num_moves = 3; break;
  }
}

void set_num_moves(board_t *board, int n)
{
  board->num_moves = n;
}

void set_type(board_t *board, char type)
{
  switch(type) {
  case '0':
    board->game_type = S_V_N; break;
  case '1':
    board->game_type = S_V_N_V_W_E; break;
  case '2':
    board->game_type = S_W_V_N_E; break;
  }
}
