#ifndef BOARD_H
#define BOARD_H

#define PCRE2_CODE_UNIT_WIDTH 8
#define _GNU_SOURCE

#include <stdbool.h>
#include <pcre2.h>

#define EMPTY 0

#define NONE  0
#define SOUTH 1
#define WEST  2
#define NORTH 4
#define EAST  8
#define DRAW  16


#define BLOCK_S      1
#define BLOCK_W      2
#define BLOCK_N      4
#define BLOCK_E      8

#define BLOCK_ANY    (BLOCK_S | BLOCK_W | BLOCK_N |BLOCK_E)

#define SOUTH_BLOCK  BLOCK_S
#define WEST_BLOCK   BLOCK_W
#define NORTH_BLOCK  BLOCK_N
#define EAST_BLOCK   BLOCK_E

#define SOUTH_BISHOP 16
#define SOUTH_ROOK   32

#define WEST_BISHOP  64
#define WEST_ROOK    128

#define NORTH_BISHOP 256
#define NORTH_ROOK   512

#define EAST_BISHOP  1024
#define EAST_ROOK    2048

#define SOUTH_PIECE  (SOUTH_BISHOP | SOUTH_ROOK)
#define WEST_PIECE   (WEST_BISHOP | WEST_ROOK)
#define NORTH_PIECE  (NORTH_BISHOP | NORTH_ROOK)
#define EAST_PIECE   (EAST_BISHOP | EAST_ROOK)

#define ROOK         (SOUTH_ROOK | WEST_ROOK | NORTH_ROOK | EAST_ROOK)
#define BISHOP       (SOUTH_BISHOP | WEST_BISHOP | NORTH_BISHOP | EAST_BISHOP)

#define ANY_PIECE    (SOUTH_PIECE | WEST_PIECE | NORTH_PIECE | EAST_PIECE)

#define SOUTH_SCORE  0
#define WEST_SCORE   1
#define NORTH_SCORE  2
#define EAST_SCORE   3

#define S_V_N        0
#define S_V_N_V_W_E  1
#define S_W_V_N_E    2

#define MAX_MOVES 500
#define MAX_RANKS 10000
#define MAX_FILES 10000

#define WHITE 1
#define BLACK -1

#define RF(rank, file) ( (rank) *  board->files + (file) )
#define FR(file, rank) RF(rank, file)

#define BOARD_REGEX							\
  "(?<files>[0-9]+)x(?<ranks>[0-9]+)/(?<pieces>[RBSCrbsc_-]*)/"		\
  "(?<blocked>[0-9a-fA-F]*)/(?<scores>[0-9a-fA-F]*)/(?<gametype>[012])/" \
  "(?<num_moves>[0-9]+)"

#define DEFAULT_POSITION						\
  "9x9/"								\
  "-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_"				\
  "-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-/"			\
  "0000000000F00000F00000000000000000000000F00000000000000000000000F"	\
  "00000F0000000000/000000300010002000300020001000300000000000000000"	\
  "00000000000000000000000000000000000000000000000000000000000000000"	\
  "00000000000003000000000000000000000000000000000000000000000000000"	\
  "00000000000000000030000000000000000000000000000000000000000000000"	\
  "00000000000000000000000000000000000000000000000003000100020003000"	\
  "2000100030000000/0/0"

// Game types. There are three types:
// South vs North (0)
// South plus West vs North plus East (1)
// South vs West vs North vs East (2)
// The only difference is how the final score is counted.
#define S_VS_N 0
#define SW_VS_NE 1
#define S_VS_W_VS_N_VS_E 2

struct move {
  int file_from;
  int rank_from;
  int file_to;
  int rank_to;
};

typedef struct move move_t;

struct board {
  int ranks;
  int files;
  int *scores[4];
  int *squares;
  int repetitions; // 3 repetitions = draw
  // Array of possibles moves
  move_t moves[MAX_MOVES];
  int num_moves;
  int game_type;
  int winner;
  // Keep track of past positions because repetion not allowed
  struct board *prev;
  struct board *next;
};

typedef struct board board_t;

//prototypes

void substr_regex(pcre2_code *re, const PCRE2_SIZE* ovector,
		  const char *name, char *dest, const char *src);
int init_board(board_t *board, int ranks, int files);
void free_board(board_t *board);
void print_board(const board_t *board);
void print_moves(board_t *board, const char *delim);
int get_rank(const board_t *board, int square);
int get_file(const board_t *board, int square);
void get_rook_moves(board_t *board, int square);
void get_bishop_moves(board_t *board, int square);
void get_piece_moves(board_t *board, int file, int rank);
void get_moves(board_t *board);
void set_piece(board_t *board, char side, char piece, int file, int rank);
void set_block(board_t *board, const char *side, int file, int rank);
void set_score(board_t *board, const char *side,
	       int score, int file, int rank);
void set_side(board_t *board, char side);
void set_num_moves(board_t *board, int n);
void set_type(board_t *board, char type);
char to_play_char(const board_t *board);
int to_play_int(const board_t *board);
#endif
