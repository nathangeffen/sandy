import { Variation } from "./variation.ts";

const MAX_FILES = 100;
const MAX_RANKS = 100;
const REGEX_FILES = /(?<files>(\d+))/;
const REGEX_RANKS = /(?<ranks>(\d+))/;
const REGEX_FILES_RANKS = new RegExp(
  REGEX_FILES.source + "x" + REGEX_RANKS.source,
);
const REGEX_PIECES = /(?<pieces>([rbRB_x]*))/;
const REGEX_POINTS = /(?<points>(\d*))/;
const REGEX_BLOCKS = /(?<blocks>([_xb]*))/;
const REGEX_SIDE = /(?<side>([ns]))/;
const REGEX_WINPOINTS = /(?<win>(\d+)*)/;
const REGEX_PLY = /(?<ply>(\d+)*)/;
const REGEX_FROZEN = /(?<frozen>[tf])/;
const REGEX_MOVES = /(?<moves>((\d+)-(\d+))*)/;

/(?<files>(\d+))/;
const REGEX_POSITION = new RegExp(
  REGEX_FILES_RANKS.source +
  "#" +
  REGEX_PIECES.source +
  "#" +
  REGEX_POINTS.source +
  "#" +
  REGEX_BLOCKS.source +
  "#" +
  REGEX_SIDE.source +
  "#" +
  REGEX_WINPOINTS.source +
  "#" +
  REGEX_PLY.source +
  "#" +
  REGEX_FROZEN.source,
);

const REGEX_GAME = new RegExp(REGEX_POSITION.source + "#" + REGEX_MOVES.source);

const DEFAULT_SIZE = "9x9";
const DEFAULT_PIECES =
  "rrbbrbbrr_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_RRBBRBBRR";
const DEFAULT_POINTS =
  "010102020302020101000000000000000000000000000000000000000000000300000000000000000000000000000000003000000000000000000000000000000000000000000000101020203020201010";
const DEFAULT_BLOCKS =
  "x_x_x_x_x_x_x_x_x_xbx_x_xbx_x_x_x_x_x_x_b_x_x_x_x_x_x_xbx_x_xbx_x_x_x_x_x_x_x_x_x";
const DEFAULT_SIDE = "s";
const DEFAULT_WINPOINTS = "12";
const DEFAULT_PLY = "0";
const DEFAULT_FROZEN = "t";
export const DEFAULT_POSITION_STRING =
  DEFAULT_SIZE +
  "#" +
  DEFAULT_PIECES +
  "#" +
  DEFAULT_POINTS +
  "#" +
  DEFAULT_BLOCKS +
  "#" +
  DEFAULT_SIDE +
  "#" +
  DEFAULT_WINPOINTS +
  "#" +
  DEFAULT_PLY +
  "#" +
  DEFAULT_FROZEN;

export const ROOK = 1;
export const BISHOP = 2;
export const SOUTH = 1;
export const NORTH = 2;

const sideIndex = new Map();
sideIndex.set(SOUTH, 0);
sideIndex.set(NORTH, 1);

const SI = function(side: number) {
  return sideIndex.get(side);
}

enum GameStatus {
  InPlay = 0,
  South = SOUTH,
  North = NORTH,
  Tie = SOUTH | NORTH,
}

export function fr(files: number, file: number, rank: number): number {
  return files * rank + file;
}

export function invFr(files: number, index: number): [number, number] {
  const file = index % files;
  const rank = Math.floor(index / files);
  return [file, rank];
}

class Square {
  index: number;
  piece: [number, number];
  points: [number, number];
  blocked: boolean;

  constructor(
    index: number,
    piece: [number, number] = [0, 0],
    points: [number, number] = [0, 0],
    blocked: boolean = false
  ) {
    this.index = index;
    this.piece = piece;
    this.points = points;
    this.blocked = blocked;
  };
}

export type Move = {
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
};

export class Position {
  files: number;
  ranks: number;
  squares: Square[];
  side: number;
  ply: number;
  frozen: boolean;
  winPoints: number;
  points: [number, number];
  gameStatus: GameStatus;
  moves: Move[];

  constructor(
    files = 9,
    ranks = 9,
    squares: Square[] = [],
    side = SOUTH,
    ply = 0,
    frozen = true,
    winPoints = 12,
  ) {
    if (squares.length === 0) {
      for (let rank = 0; rank < ranks; rank++) {
        for (let file = 0; file < files; file++) {
          squares.push(new Square(fr(files, file, rank)));
        }
      }
    }
    this.files = files;
    this.ranks = ranks;
    this.squares = squares;
    this.side = side;
    this.ply = ply;
    this.frozen = frozen;
    this.winPoints = winPoints;
    this.points = [0, 0];
    this.gameStatus = GameStatus.InPlay;
    this.moves = [];
  };

}

export const loadPosition = function(
  positionString = DEFAULT_POSITION_STRING,
): Position {
  let parsed_regex_position: RegExpExecArray | null;
  try {
    parsed_regex_position = REGEX_POSITION.exec(positionString);
  } catch {
    throw "Cannot parse position string";
  }
  if (parsed_regex_position === null) {
    throw "Cannot parse position string";
  }
  const groups = parsed_regex_position.groups;
  const { files, ranks, pieces, points, blocks, side, win, ply, frozen } = groups;
  if (Number(files) > MAX_FILES) {
    throw `Maximum allowed for files is ${MAX_FILES} but ${files} given`;
  }
  if (Number(ranks) > MAX_RANKS) {
    throw `Maximum allowed for files is ${MAX_RANKS} but ${ranks} given`;
  }

  const dim: number = Number(ranks) * Number(files);

  if (pieces.length != dim) {
    throw `Piece string must be exactly ${dim} characters`;
  }
  if (points.length != dim * 2) {
    throw `Points string must be exactly ${dim * 2} characters`;
  }
  if (blocks.length != dim) {
    throw `Blocks string is ${blocks.length} characters but must be exactly ${dim} characters`;
  }
  const squares = [];
  for (let i = 0; i < dim; i++) {
    let piece: [number, number];
    switch (pieces[i]) {
      case "r":
        piece = [ROOK, 0];
        break;
      case "b":
        piece = [BISHOP, 0];
        break;
      case "R":
        piece = [0, ROOK];
        break;
      case "B":
        piece = [0, BISHOP];
        break;
      default:
        piece = [0, 0];
    }
    const point: [number, number] = [Number(points[i * 2]), Number(points[i * 2 + 1])];
    let block: boolean;
    switch (blocks[i]) {
      case "b":
        block = true;
        break;
      default:
        block = false;
    }
    squares.push(new Square(i, piece, point, block));
  }
  return new Position(
    Number(files),
    Number(ranks),
    squares,
    side === "s" ? SOUTH : NORTH,
    Number(ply),
    frozen === "t" ? true : false,
    Number(win),
  );
};

export const positionToString = function(position: Position) {
  let positionString = "";
  positionString += position.files + "x" + position.ranks + "#";
  for (const [index, square] of position.squares.entries()) {
    const piece = square.piece[0] + square.piece[1];
    switch (piece) {
      case 0:
        positionString += index % 2 == 0 ? "x" : "_";
        break;
      case ROOK:
        positionString += square.piece[0] == 0 ? "R" : "r";
        break;
      case BISHOP:
        positionString += square.piece[0] == 0 ? "B" : "b";
        break;
    }
  }

  positionString += "#";

  for (const square of position.squares) {
    positionString += square.points[0].toString() + square.points[1].toString();
  }

  positionString += "#";

  for (const [index, square] of position.squares.entries()) {
    const blocked = square.blocked;
    if (blocked === false) {
      positionString += index % 2 === 0 ? "x" : "_";
    } else {
      positionString += "b";
    }
  }
  positionString += "#";

  positionString += position.side == SOUTH ? "s" : "n";
  positionString += "#";

  positionString += position.winPoints.toString();
  positionString += "#";

  positionString += position.ply.toString();
  positionString += "#";

  positionString += position.frozen ? "t" : "f";

  return positionString;
};

type PositionMove = {
  position: Position;
  move: Move | null;
};

export class Game {
  position: Position;
  history: Variation<PositionMove>;
  constructor(position: Position) {
    const positionMove: PositionMove = {
      position: structuredClone(position),
      move: null,
    };
    const node = new Variation(positionMove);
    this.position = position;
    this.history = node;
  };
};

type Directions = [number, number][];

const ROOK_DIRECTIONS: Directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS: Directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

const getPieceMoves = function(game: Game, square: Square, directions: Directions): Move[] {
  const moves: Move[] = [];
  if (game.position.frozen === true) {
    const side = game.position.side;
    if (square.points[SI(side)] > 0) {
      return moves;
    }
  }
  const [file, rank] = invFr(game.position.files, square.index);
  for (const direction of directions) {
    let toFile = file + direction[0];
    let toRank = rank + direction[1];
    let blocked = false;
    while (blocked === false &&
      toFile < game.position.files && toRank < game.position.ranks &&
      toFile >= 0 && toRank >= 0) {
      const index = fr(game.position.files, toFile, toRank);
      const toSquare = game.position.squares[index];
      const toPiece = toSquare.piece[0] | toSquare.piece[1];
      const toBlock = toSquare.blocked;
      if (toPiece || toBlock) {
        blocked = true;
      } else {
        moves.push({
          fromFile: file, fromRank: rank,
          toFile: toFile, toRank: toRank
        });
      };
      toFile += direction[0];
      toRank += direction[1];
    }
  }
  return moves;
}

// Even though moves are associated with a position, the function
// expects a game as its parameter. This is in case we want to implement
// rules limiting moves in the case of position repetition.
export const getMoves = function(game: Game): Move[] {
  let moves: Move[] = [];
  const side = game.position.side;
  for (const square of game.position.squares) {
    const piece = square.piece[SI(side)];
    if (piece === ROOK) {
      moves.push(...getPieceMoves(game, square, ROOK_DIRECTIONS));
    } else if (piece === BISHOP) {
      moves.push(...getPieceMoves(game, square, BISHOP_DIRECTIONS));
    }
  }
  return moves;
};

export const newGameWithMoves = function(position: Position): Game {
  const game = new Game(position);
  game.position.moves = getMoves(game);
  return game;
}

const moveSquares = function(position: Position, move: Move) {
  const side = position.side;
  const files = position.files;
  const fromIndex = fr(files, move.fromFile, move.fromRank);
  const toIndex = fr(files, move.toFile, move.toRank);
  position.squares[toIndex].piece[SI(side)] = position.squares[fromIndex].piece[SI(side)];
  position.squares[fromIndex].piece[SI(side)] = 0;
};

const calcPoints = function(position: Position, side: number): number {
  const squares = position.squares;
  if (position.frozen) {
    let total = 0;
    squares.forEach((square: Square) => {
      if (square.piece[SI(side)])
        total += square.points[SI(side)];
    });
    return total;
  } else {
    throw "Points calc for non-frozen positions not implemented yet";
  }
}

const checkGameStatus = function(game: Game, side: number): GameStatus {
  const position = game.position;
  if (position.gameStatus > 0) {
    return position.gameStatus;
  } else {
    const points = calcPoints(position, side);
    if (points < position.winPoints) {
      return GameStatus.InPlay;
    } else {
      if (side === SOUTH) {
        return GameStatus.South;
      } else {
        return GameStatus.North;
      }
    }
  }
}

export const move = function(game: Game, move: Move) {
  const position = game.position;
  const foundMove = position.moves.find((key: Move) =>
  (move.fromFile === key.fromFile && move.fromRank === key.fromRank &&
    move.toFile === key.toFile && move.toRank === key.toRank));
  if (!foundMove) {
    throw {
      name: "InvalidMoveError",
      message: `${move.fromFile}.${move.fromRank}-${move.toRank}.${move.toFile} not found.`,
    };
  }
  moveSquares(position, foundMove);
  position.ply += 1;
  position.gameStatus = checkGameStatus(game, position.side);
  position.side = (SOUTH | NORTH) ^ position.side;
  position.moves = getMoves(game);
  const positionMove: PositionMove = {
    position: structuredClone(position),
    move: structuredClone(move),
  };
  game.history = game.history.appendChild(positionMove);
}
// const g = new Game(loadPosition());
// getMoves(g);
// consolem.log(g.position.moves);
