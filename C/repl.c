#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <readline/readline.h>
#include <readline/history.h>


#include "repl.h"

bool is_blank(const char *str)
{
  for (const char *c = str; *c != 0 && *c != '\n'; c++)
    if (isspace(*c) == false) return false;
  return true;
}

static void clean(const char *str_from, char *str_to)
{
  const char *i = str_from;
  char *j = str_to;

  do  {
    if (*i != ' ' && *i != '\t')
      *j++ = *i;
  } while(*i++ != 0);
}

void print_help()
{
  puts(" ,                                   Show board");
  puts(" ;                                   Show all possible moves");
  puts(" p [swne] [rbx] <file>-<rank>        Place a piece");
  puts(" b [swne]+  <file>-<rank>            Block a square");
  puts(" u [swne]+  <file>-<rank>            Unblock a square");
  puts(" s [swne]+  <score>;<file>-<rank>    Set score to square");
  puts(" i <files>x<ranks>                   Initialize board to dimensions");
  puts(" t [swne]                            Set player turn");
  puts(" n |[move_num]                       Set player turn");
  puts(" g [012]                             Set game type");
  puts(" l <position>                        Load a position");
  puts(" o                                   Output position");
  puts(" m <file>-<rank>;<file>-<rank>       Move piece");
  puts(" d                                   Dump history to stdout");
  puts(" h                                   Help");
  puts(" q                                   Quit");
}

static const unsigned char *spec = (const unsigned char *)
  "(?<print>^,$)|"
  "(?<moves>^;$)|"
  "(?<setpiece>^p(?<side_p>[nswe])(?<piece_p>[rbx])(?<file_p>[0-9]+)-(?<rank_p>[0-9])+$)|"
  "(?<block>^b(?<side_b>([nswe]{1,4})|x)(?<file_b>[0-9]+)-(?<rank_b>[0-9])+$)|"
  "(?<score>s(?<side_s>[nswe]{1,4})(?<score_s>[0-9]+);(?<file_s>[0-9]+)-(?<rank_s>[0-9])+$)|"
  "(?<init>^i(?<file_i>[0-9]+)x(?<rank_i>[0-9])+$)|"
  "(?<turn>^t(?<side_t>[nswe]))|"
  "(?<move>^n(?<num_m>[0-9]+))|"
  "(?<game>^g(?<type>[012]))|"
  "(?<load>l(?<board_regex>" BOARD_REGEX "))|"
  "(?<dump>^d$)|"
  "(?<ouput>^o$)|"
  "(?<help>^h$)|"
  "(?<quit>^q$)";

static int exec_cmd(board_t *board, const char *cmd, bool *cont,
		    pcre2_code *re, PCRE2_SIZE* ovector)
{
  char side[5], piece;
  int file, rank, score;
  char *subcmd = malloc(strlen(cmd) + 1);
  if (subcmd == 0) {
    fprintf(stderr, "No memory at %s %d\n", __FILE__, __LINE__);
    return -1;
  }
  switch( (char) cmd[0]) {
  case ',':
    print_board(board); break;
  case ';':
    print_moves(board, " "); break;
  case 'p':
    substr_regex(re, ovector, "side_p", subcmd, cmd);
    side[0] = subcmd[0];
    substr_regex(re, ovector, "piece_p", subcmd, cmd);
    piece = subcmd[0];
    substr_regex(re, ovector, "file_p", subcmd, cmd);
    file = atoi(subcmd);
    substr_regex(re, ovector, "rank_p", subcmd, cmd);
    rank = atoi(subcmd);
    set_piece(board, side[0], piece, file, rank);
    break;
  case 'b':
    substr_regex(re, ovector, "side_b", subcmd, cmd);
    strncpy(side, subcmd, 5);
    substr_regex(re, ovector, "file_b", subcmd, cmd);
    file = atoi(subcmd);
    substr_regex(re, ovector, "rank_b", subcmd, cmd);
    rank = atoi(subcmd);
    set_block(board, side, file, rank);
    break;
  case 's':
    substr_regex(re, ovector, "side_s", subcmd, cmd);
    strncpy(side, subcmd, 5);
    substr_regex(re, ovector, "score_s", subcmd, cmd);
    score = atoi(subcmd);
    substr_regex(re, ovector, "file_s", subcmd, cmd);
    file = atoi(subcmd);
    substr_regex(re, ovector, "rank_s", subcmd, cmd);
    rank = atoi(subcmd);
    set_score(board, side, score, file, rank);
    break;
  case 'i':
    substr_regex(re, ovector, "file_i", subcmd, cmd);
    file = atoi(subcmd);
    substr_regex(re, ovector, "rank_i", subcmd, cmd);
    rank = atoi(subcmd);
    free_board(board);
    int ret = init_board(board, rank, file);
    if (ret) {
      free(subcmd);
      return ret;
    }
    break;
  case 't':
    substr_regex(re, ovector, "side_t", subcmd, cmd);
    set_side(board, subcmd[0]);
    break;
  case 'n':
    substr_regex(re, ovector, "num_m", subcmd, cmd);
    set_num_moves(board, atoi(subcmd));
    break;
  case 'g':
    substr_regex(re, ovector, "type", subcmd, cmd);
    set_type(board, subcmd[0]);
    break;
  case 'o':
    output_board(board, stdout); break;
  case 'l':
    substr_regex(re, ovector, "board_regex", subcmd, cmd);
    printf("DBG LOADING: %s\n", subcmd); break;
  case 'd':
    {
    HIST_ENTRY **the_list;
    the_list = history_list ();
    if (the_list)
      for (int i = 0; the_list[i]; i++)
	printf ("%s\n", the_list[i]->line);
    }
    break;
  case 'h':
    print_help(); break;
  case 'q':
    *cont = false; break;
  default:
    puts("Unrecognised command");
  }
  free(subcmd);
  return 0;
}

int repl(board_t *board, int options)
{
  /* for pcre2_compile */
  pcre2_code *re;
  PCRE2_SIZE erroffset;
  int errcode;
  PCRE2_UCHAR8 buffer[128];

  /* for pcre2_match */
  PCRE2_SIZE* ovector;

  pcre2_match_data *match_data;
  uint32_t ovecsize = 1024;


  //const size_t spec_size = strlen( (char *) spec);

  re = pcre2_compile(spec, PCRE2_ZERO_TERMINATED, 0, &errcode, &erroffset,
		     NULL);
  if (re == NULL)  {
    pcre2_get_error_message(errcode, buffer, 120);
    fprintf(stderr,"%d\t%s: %s %d\n", errcode, buffer, __FILE__, __LINE__);
    return -1;
  }

  match_data = pcre2_match_data_create(ovecsize, NULL);

  bool cont = true;
  using_history();
  do {
    char *cmd, *clean_cmd;
    PCRE2_SPTR subject;
    if (options & SHOW_PROMPT) {
      cmd = readline("> ");
    } else {
      cmd = readline("");
    }

    if (cmd) {
      add_history(cmd);
      clean_cmd = malloc(strlen(cmd) + 1);
      if (clean_cmd == NULL) {
	fprintf(stderr, "Not enough memory: %s %d\n", __FILE__, __LINE__);
	return -1;
      }
      clean(cmd, clean_cmd);
    } else {
      break;
    }

    subject = (PCRE2_SPTR) clean_cmd;
    int rc = pcre2_match(re, subject, strlen(clean_cmd), 0,
			 0, match_data, NULL);

    if (is_blank((char *) subject)) {
      continue;
    } else if (rc == 0) {
      fprintf(stderr,"Error processing command. Error code %d. File %s. Line %d", rc, __FILE__, __LINE__);
    } else if(rc < 0) {
      puts("Unrecognised command");
    } else {
      ovector = pcre2_get_ovector_pointer(match_data);
      exec_cmd(board, (char *) subject, &cont, re, ovector);
    }
    free(cmd);
    free(clean_cmd);
  } while (cont);
  pcre2_match_data_free(match_data);
  pcre2_code_free(re);
  return 0;
}
