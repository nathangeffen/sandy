"use strict";
// files#ranks#[rbRB_]*#[0-9]*#[_x]+#[to_move]#[winning_points]#[frozen_after_score]
const MAX_FILES = 100;
const MAX_RANKS = 100;
const REGEX_FILES = /(?<files>(\d+))/;
const REGEX_RANKS = /(?<ranks>(\d+))/;
const REGEX_FILES_RANKS = new RegExp(REGEX_FILES.source + "x" + REGEX_RANKS.source);
const REGEX_PIECES = /(?<pieces>([rbRB_x]*))/;
const REGEX_POINTS = /(?<points>(\d*))/;
const REGEX_BLOCKS = /(?<blocks>([_xsnb]*))/;
const REGEX_SIDE = /(?<side>([ns]))/;
const REGEX_WINPOINTS = /(?<win>(\d+)*)/;
const REGEX_PLY = /(?<ply>(\d+)*)/;
const REGEX_FROZEN = /(?<frozen>[tf])/;
const REGEX_MOVES = /(?<moves>((\d+)-(\d+))*)/;
/(?<files>(\d+))/;
const REGEX_POSITION = new RegExp(REGEX_FILES_RANKS.source +
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
    REGEX_FROZEN.source);
const REGEX_GAME = new RegExp(REGEX_POSITION.source + "#" + REGEX_MOVES.source);
const DEFAULT_SIZE = "9x9";
const DEFAULT_PIECES = "rrbbrbbrr_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_RRBBRBBRR";
const DEFAULT_POINTS = "010102020302020101000000000000000000000000000000000000000000000300000000000000003300000000000000003000000000000000000000000000000000000000000000101020203020201010";
const DEFAULT_BLOCKS = "x_x_x_x_x_x_x_x_x_xbxbxbxbx_x_x_x_x_x_x_b_x_x_x_x_x_x_xbxbxbxbx_x_x_x_x_x_x_x_x_x";
const DEFAULT_SIDE = "s";
const DEFAULT_WINPOINTS = "12";
const DEFAULT_PLY = "0";
const DEFAULT_FROZEN = "t";
export const DEFAULT_POSITION_STRING = DEFAULT_SIZE +
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
export const SOUTH = 0;
export const NORTH = 1;
export function fr(files, file, rank) {
    return files * rank + file;
}
export function invFr(files, index) {
    const file = index % files;
    const rank = Math.floor(index / files);
    return [file, rank];
}
class Square {
    constructor(index, piece = [0, 0], points = [0, 0], blocked = [false, false]) {
        this.index = index;
        this.piece = piece;
        this.points = points;
        this.blocked = blocked;
    }
    ;
}
class Position {
    constructor(files = 9, ranks = 9, squares = [], side = SOUTH, winPoints = 12, ply = 0, frozen = true) {
        if (squares.length === 0) {
            for (let file = 0; file < files; file++) {
                for (let rank = 0; rank < ranks; rank++) {
                    squares.push(new Square(fr(files, file, rank)));
                }
            }
        }
        this.files = files;
        this.ranks = ranks;
        this.squares = squares;
        this.side = side;
        this.winPoints = winPoints;
        this.ply = ply;
        this.frozen = frozen;
        this.moves = [];
        this.gameEnded = false;
        this.result = 0;
    }
    ;
}
export const loadPosition = function (positionString = DEFAULT_POSITION_STRING) {
    let parsed_regex_position;
    try {
        parsed_regex_position = REGEX_POSITION.exec(positionString);
    }
    catch (_a) {
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
    const dim = Number(ranks) * Number(files);
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
        let piece;
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
        const point = [Number(points[i * 2]), Number(points[i * 2 + 1])];
        let block;
        switch (blocks[i]) {
            case "s":
                block = [true, false];
                break;
            case "n":
                block = [false, true];
                break;
            case "b":
                block = [true, true];
                break;
            default:
                block = [false, false];
        }
        squares.push(new Square(i, piece, point, block));
    }
    return new Position(Number(files), Number(ranks), squares, side === "s" ? SOUTH : NORTH, Number(win), Number(ply), frozen === "t" ? true : false);
};
export const positionToString = function (position) {
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
        if (blocked[0] === false && blocked[1] === false) {
            positionString += index % 2 === 0 ? "x" : "_";
        }
        else if (blocked[0] === true && blocked[1] === false) {
            positionString += "s";
        }
        else if (blocked[0] === false && blocked[1] === true) {
            positionString += "n";
        }
        else {
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
export class Game {
    constructor(position) {
        return {
            position: position,
            history: [],
            historyIndex: [],
        };
    }
}
;
const ROOK_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const getPieceMoves = function (game, square, directions) {
    const moves = [];
    if (game.position.frozen === true) {
        const side = game.position.side;
        if (square.points[side] > 0) {
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
            const toBlock = toSquare.blocked[0] || toSquare.blocked[1];
            if (toPiece || toBlock) {
                blocked = true;
            }
            else {
                moves.push({
                    fromFile: file, fromRank: rank,
                    toFile: toFile, toRank: toRank
                });
            }
            ;
            toFile += direction[0];
            toRank += direction[1];
        }
    }
    return moves;
};
// Even though moves are associated with a position, the function
// expects a game as its parameter. This is in case we want to implement
// rules limiting moves in the case of position repetition.
export const getMoves = function (game) {
    let moves = [];
    const side = game.position.side;
    for (const square of game.position.squares) {
        const piece = square.piece[side];
        if (piece === ROOK) {
            moves.push(...getPieceMoves(game, square, ROOK_DIRECTIONS));
        }
        else if (piece === BISHOP) {
            moves.push(...getPieceMoves(game, square, BISHOP_DIRECTIONS));
        }
    }
    return moves;
};
const move = function (game, move) {
    const position = game.position;
    const index = position.moves.indexOf(move);
    if (index == -1) {
        throw `Move ${move} not found.`;
    }
    game.history.push(structuredClone(position));
    const side = position.side;
    const fromIndex = fr(position.files, move.fromFile, move.fromRank);
    const toIndex = fr(position.files, move.toFile, move.toRank);
    position.squares[toIndex].piece[side] = position.squares[fromIndex].piece[side];
    position.squares[fromIndex].piece[side] = 0;
};
