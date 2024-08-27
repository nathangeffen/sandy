import {
  ROOK,
  BISHOP,
  SOUTH,
  NORTH,
  Move,
  fr,
  Game,
  Position,
  newGameWithMoves,
  loadPosition,
  move as gameMove,
} from "./game.js";

const GameUX = function(divID: string) {

  // Global constants
  const SVGNS = "http://www.w3.org/2000/svg";

  // COLORS
  const EVEN_SQUARE = 'LightGray';
  const ODD_SQUARE = 'SlateGray';
  const SELECTED_SQUARE = 'DarkCyan';
  const TRACER_COLOR = 'DarkSlateBlue';
  const LAST_MOVE_COLOR = 'Yellow';
  const POINTS_SOUTH = 'Blue';
  const POINTS_NORTH = 'Black';
  const SOUTH_ROOK_IMAGE = '/images/Chess_rlt45.svg';
  const SOUTH_BISHOP_IMAGE = '/images/Chess_blt45.svg';
  const NORTH_ROOK_IMAGE = '/images/Chess_rdt45.svg';
  const NORTH_BISHOP_IMAGE = '/images/Chess_bdt45.svg';
  const BLOCKED_SQUARE_IMAGE = '/images/cross-svgrepo-com.svg';
  const DIV_X_MARGIN = 60;
  const DIV_Y_MARGIN = 60;

  // Types and enums

  enum GameUXState {
    WaitingUser,
    WaitingOtherPlayer,
    PieceSelected,
    GameOver,
  };

  type BoardType = {
    svg: SVGElement | null;
    squares: SVGElement[];
  };

  // Variables
  let game: Game;
  let div: HTMLElement;
  let divWidth: number;
  let divHeight: number;
  let squareDim: number;
  let gameUXState: GameUXState = GameUXState.WaitingUser;
  let selectedPiece: [number, number] | null = null;
  let board: BoardType = {
    svg: null,
    squares: []
  };

  // Functions

  // export const selectPieceMoves = function(position: Position, file: number, rank: number): Move[] {
  //   const pieceMoves: Move[] = [];
  //   for (const move of position.moves) {
  //     if (move.fromFile === file && move.fromRank === rank) {
  //       pieceMoves.push(move);
  //     }
  //   }
  //   return pieceMoves;
  // }
  //
  // const Blocked = function(parameters: BlockedParameters): BlockedType {
  //   if (parameters.blocked) {
  //     const blockedElement = document.createElementNS(SVGNS, 'image');
  //     blockedElement.setAttribute('x', String(parameters.x));
  //     blockedElement.setAttribute('y', String(parameters.y));
  //     blockedElement.setAttribute('width', String(parameters.squareDim));
  //     blockedElement.setAttribute('height', String(parameters.squareDim));
  //     blockedElement.setAttribute('href', BLOCKED_SQUARE_IMAGE);
  //     return { blockedElement };
  //   } else {
  //     return null;
  //   }
  // }
  //
  // const Piece = function(parameters: PieceParameters): PieceType {
  //   if (parameters.piece[0] + parameters.piece[1] == 0) return null;
  //   let side: number;
  //   let type: number;
  //   const position = parameters.position;
  //   const file = parameters.file;
  //   const rank = parameters.rank;
  //   const moves: Move[] = selectPieceMoves(position, file, rank);
  //   const pieceElement = document.createElementNS(SVGNS, 'image');
  //   pieceElement.id = parameters.divID + "-piece-" +
  //     String(parameters.file) + '-' + String(parameters.rank);
  //   const squareDim = parameters.dim / (4 / 3);
  //   const x = (parameters.squareDim - dim) / 2.0 + parameters.x;
  //   const y = (parameters.squareDim - dim) / 2.0 + parameters.y;
  //   pieceElement.setAttribute('x', String(x));
  //   pieceElement.setAttribute('y', String(y));
  //   pieceElement.setAttribute('width', String(squareDim));
  //   pieceElement.setAttribute('height', String(squareDim));
  //   if (parameters.piece[0]) {
  //     pieceElement.setAttribute('data-side', 'south');
  //     side = SOUTH;
  //     if (parameters.piece[0] === ROOK) {
  //       pieceElement.setAttribute('href', SOUTH_ROOK_IMAGE);
  //       pieceElement.setAttribute('data-piece', 'rook');
  //       type = ROOK;
  //     } else {
  //       pieceElement.setAttribute('href', SOUTH_BISHOP_IMAGE);
  //       pieceElement.setAttribute('data-piece', 'bishop');
  //       type = BISHOP;
  //     }
  //   } else {
  //     side = NORTH;
  //     pieceElement.setAttribute('data-side', 'north');
  //     if (parameters.piece[1] === ROOK) {
  //       pieceElement.setAttribute('href', NORTH_ROOK_IMAGE);
  //       pieceElement.setAttribute('data-piece', 'rook');
  //       type = ROOK;
  //     } else {
  //       pieceElement.setAttribute('href', NORTH_BISHOP_IMAGE);
  //       pieceElement.setAttribute('data-piece', 'bishop');
  //       type = BISHOP;
  //     }
  //   }
  //   return {
  //     pieceElement,
  //     type,
  //     side,
  //     file,
  //     rank,
  //     moves,
  //   }
  // }
  //
  // // class FileBar {
  // //   constructor() {
  // //
  // //   }
  // // };
  // //
  // // class RankBar {
  // //
  // // };
  // //
  // // class Info {
  // //   constructor(gameUI: GameUI) {
  // //
  // //   }
  // //
  // //   render = function() {
  // //
  // //   }
  // // };
  //
  // const setTracerOn = function(board: BoardType, square: SquareType) {
  //   if (square.piece) {
  //     for (const move of square.piece.moves) {
  //       const file = move.toFile;
  //       const rank = move.toRank;
  //       const index = fr(board.files, file, rank);
  //       const toSquare = board.squares[index];
  //       if (toSquare.squareElement) {
  //         toSquare.tracerElement = document.createElementNS(SVGNS, 'circle');
  //         const x = toSquare.squareElement.getAttribute('x') | 0;
  //         const y = toSquare.squareElement.getAttribute('y') | 0;
  //         const height = toSquare.squareElement.getAttribute('height') | 0;
  //         const r = height / 4;
  //         const cx = x + height / 2;
  //         const cy = y + height / 2;
  //         toSquare.tracerElement.setAttribute('cx', String(cx));
  //         toSquare.tracerElement.setAttribute('cy', String(cy));
  //         toSquare.tracerElement.setAttribute('r', String(r));
  //         toSquare.tracerElement.setAttribute('fill', TRACER_COLOR);
  //         board.svg.appendChild(toSquare.tracerElement);
  //       }
  //     }
  //   }
  // }
  //
  // const setTracerOff = function(squares: SquareType[]) {
  //   for (const square of squares) {
  //     if (square.tracerElement) {
  //       square.tracerElement.remove();
  //     }
  //   }
  // }
  //
  // const selectPiece = function(board: BoardType, square: SquareType) {
  //   square.squareElement.setAttribute('fill', SELECTED_SQUARE);
  //   board.squareSelected = square;
  //   setTracerOn(board, square);
  // };
  //
  // const unselectPiece = function(board: BoardType) {
  //   if (board.squareSelected) {
  //     board.squareSelected.squareElement.setAttribute('fill', board.squareSelected.fill);
  //     board.squareSelected = null;
  //   }
  //   setTracerOff(board.squares);
  // }
  //
  // const movePiece = function(squares: SquareType[], piece: PieceType, move: Move) {
  //   drawGame('sandy-game-1');
  // };
  //
  // const colorSelectedPiece = function(board: BoardType, square: SquareType) {
  // }
  //
  // const showPossibleMoves = function(board: BoardType, square: SquareType) {
  //
  // }
  //
  // const findMove = function(moves: Move[], key: Move): boolean {
  //   for (const move of moves) {
  //     if (move.fromRank === key.fromRank &&
  //       move.fromFile === key.fromFile &&
  //       move.toRank === key.toRank &&
  //       move.toFile === key.toFile) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  //
  // const selectSquare = function(board: BoardType, square: SquareType) {
  //   // Program this as a list of actions, each responsible for own logic
  //   switch (board.state) {
  //     case BoardState.WaitingOtherPlayer:
  //     case BoardState.GameOver:
  //       break;
  //     case BoardState.WaitingUser:
  //       if (square.piece && square.piece.side == board.side) {
  //         board.state = BoardState.PieceSelected;
  //         selectPiece(board, square);
  //       }
  //       break;
  //     case BoardState.PieceSelected:
  //       if (board.squareSelected) {
  //         const piece = board.squareSelected.piece;
  //         if (piece) {
  //           const move: Move = {
  //             fromFile: piece.file,
  //             fromRank: piece.rank,
  //             toFile: square.file,
  //             toRank: square.rank,
  //           }
  //           if (findMove(piece.moves, move)) {
  //             movePiece(board.squares, piece, move);
  //           } else {
  //             unselectPiece(board);
  //             board.state = BoardState.WaitingUser;
  //           }
  //         }
  //       }
  //       break;
  //   };
  // }
  //
  // const setEvents = function(board: BoardType) {
  //   for (const square of board.squares) {
  //     square.squareElement.addEventListener('click', function() {
  //       selectSquare(board, square);
  //     });
  //     if (square.piece) {
  //       square.piece.pieceElement.addEventListener('click', function() {
  //         selectSquare(board, square);
  //       });
  //     }
  //   }
  // }

  function calcSquareDim(width: number, height: number,
    files: number, ranks: number): number {
    const dimWidth = (width - DIV_X_MARGIN) / files;
    const dimHeight = (height - DIV_Y_MARGIN) / ranks;
    return Math.min(dimWidth, dimHeight);
  }

  const setupBlocked = function(square: SVGElement) {
    const blocked = document.createElementNS(SVGNS, 'image');
    square.appendChild(blocked);
    blocked.setAttribute('x', String(0));
    blocked.setAttribute('y', String(0));
    blocked.setAttribute('height', String(squareDim));
    blocked.setAttribute('width', String(squareDim));
    blocked.setAttribute('href', BLOCKED_SQUARE_IMAGE);
  }

  const setupPoints = function(svg: SVGElement, points: [number, number]) {
    const placePoint = function(index: number, fill: string, y) {
      const pointElement = document.createElementNS(SVGNS, 'text');
      svg.appendChild(pointElement);
      let offset: number = 2;
      if (squareDim < 45) {
        pointElement.style.fontSize = 'xx-small';
      } else {
        pointElement.style.fontSize = 'small';
      }
      pointElement.setAttribute('x', String(offset));
      pointElement.setAttribute('y', String(y - offset));
      pointElement.setAttribute('fill', fill);
      pointElement.textContent = String(points[index]);
    }
    if (points[0]) {
      placePoint(0, POINTS_SOUTH, squareDim - 2);
    } else {
      placePoint(1, POINTS_NORTH, 16);
    }
  }

  const setupSquare = function(file: number, rank: number) {
    const svg = document.createElementNS(SVGNS, 'svg');
    const square = document.createElementNS(SVGNS, 'rect');
    svg.appendChild(square);
    svg.id = divID + "-square-" + String(file) + '-' + String(rank);
    const x = file * squareDim + DIV_X_MARGIN;
    const y = (game.position.ranks - rank - 1) * squareDim + DIV_Y_MARGIN;
    svg.setAttribute('x', String(x));
    svg.setAttribute('y', String(y));
    svg.setAttribute('height', String(squareDim));
    svg.setAttribute('width', String(squareDim));
    square.setAttribute('x', "0");
    square.setAttribute('y', "0");
    square.setAttribute('height', String(squareDim));
    square.setAttribute('width', String(squareDim));
    const fill = ((file + rank) % 2 == 0) ? EVEN_SQUARE : ODD_SQUARE;
    square.setAttribute('fill', fill);
    const index = fr(game.position.files, file, rank);
    if (game.position.squares[index].blocked === true) {
      setupBlocked(svg);
    }
    const points = game.position.squares[index].points;
    if (points[0] || points[1]) {
      setupPoints(svg, points);
    }
    return svg;
  }

  const setupBoard = function() {
    board.svg = document.createElementNS(SVGNS, 'svg');
    board.svg.setAttribute('width', '100%');
    board.svg.setAttribute('height', '100%');
    const position = game.position;
    squareDim = calcSquareDim(divWidth, divHeight, position.files, position.ranks);
    board.squares = [];
    for (let rank = 0; rank < position.ranks; rank++) {
      for (let file = 0; file < position.files; file++) {
        const square = setupSquare(file, rank);
        board.squares.push(square);
        board.svg.appendChild(square);
      }
    }
    div.appendChild(board.svg);
  }

  const placePiece = function(square: SVGElement, piece: [number, number]) {
    const pieceElement = document.createElementNS(SVGNS, 'image');
    const pieceDim = squareDim * (3.0 / 4.0);
    const x = (squareDim - pieceDim) / 2.0;
    const y = x;
    pieceElement.setAttribute('x', String(x));
    pieceElement.setAttribute('y', String(y));
    pieceElement.setAttribute('width', String(pieceDim));
    pieceElement.setAttribute('height', String(pieceDim));
    pieceElement.setAttribute('class', 'piece dynamic');
    square.appendChild(pieceElement);
    if ((piece[0] | piece[1]) > 0) {
      if (piece[0] === ROOK) {
        pieceElement.setAttribute('href', SOUTH_ROOK_IMAGE);
      } else if (piece[0] === BISHOP) {
        pieceElement.setAttribute('href', SOUTH_BISHOP_IMAGE);
      } else if (piece[1] === ROOK) {
        pieceElement.setAttribute('href', NORTH_ROOK_IMAGE);
      } else {
        pieceElement.setAttribute('href', NORTH_BISHOP_IMAGE);
      }
    }
  }

  const setLastMove = function(square: SVGElement) {
    const lastMoveElement = document.createElementNS(SVGNS, 'rect');
    lastMoveElement.setAttribute('x', '0');
    lastMoveElement.setAttribute('y', '0');
    lastMoveElement.setAttribute('width', String(squareDim));
    lastMoveElement.setAttribute('height', String(squareDim));
    lastMoveElement.setAttribute('fill', LAST_MOVE_COLOR);
    lastMoveElement.setAttribute('fill-opacity', '20%');
    lastMoveElement.setAttribute('class', 'last-move dynamic');
    square.appendChild(lastMoveElement);
  }

  const updateBoard = function() {
    const position = game.position;
    for (let rank = 0; rank < position.ranks; rank++) {
      for (let file = 0; file < position.files; file++) {
        const index = fr(position.files, file, rank);
        const square = board.squares[index];
        const piece = position.squares[index].piece;
        const dynamicElements = square.querySelectorAll('.dynamic');
        for (const element of dynamicElements) {
          element.remove();
        }
        const lastMove = game.history.value.move;
        if (lastMove) {
          console.log("Lastmove: ", lastMove);
          if ((file === lastMove.fromFile && rank === lastMove.fromRank) ||
            (file === lastMove.toFile && rank === lastMove.toRank)) {
            setLastMove(square);
          }
        }
        if ((piece[0] | piece[1]) > 0) {
          placePiece(square, piece);
        }
      }
    }
  }

  const selectPieceMoves = function(file: number, rank: number) {
    const pieceMoves: Move[] = [];
    for (const move of game.position.moves) {
      if (move.fromFile === file && move.fromRank === rank) {
        pieceMoves.push(move);
      }
    }
    return pieceMoves;
  }

  const setTracerOn = function(file: number, rank: number) {
    const moves = selectPieceMoves(file, rank);
    for (const move of moves) {
      const toFile = move.toFile;
      const toRank = move.toRank;
      const index = fr(game.position.files, toFile, toRank);
      const toSquare = board.squares[index];
      const tracerElement = document.createElementNS(SVGNS, 'circle');
      const r = squareDim / 8;
      const cx = squareDim / 2;
      const cy = squareDim / 2;
      tracerElement.setAttribute('cx', String(cx));
      tracerElement.setAttribute('cy', String(cy));
      tracerElement.setAttribute('r', String(r));
      tracerElement.setAttribute('fill', TRACER_COLOR);
      tracerElement.setAttribute('fill-opacity', '30%');
      tracerElement.setAttribute('class', 'tracer dynamic');
      toSquare.appendChild(tracerElement);
    }
  }

  const selectPiece = function(square: SVGElement, file: number, rank: number) {
    square.setAttribute('fill', SELECTED_SQUARE);
    selectedPiece = [file, rank];
    setTracerOn(file, rank);
  }

  const movePiece = function(file: number, rank: number): boolean {
    if (selectedPiece === null) return false;
    const move: Move = {
      fromFile: selectedPiece[0],
      fromRank: selectedPiece[1],
      toFile: file,
      toRank: rank,
    };
    try {
      gameMove(game, move);
    } catch (err) {
      return false;
    }
    return true;
  }

  const updateBasedOnState = function(square: SVGElement, file: number, rank: number) {
    switch (gameUXState) {
      // Temporary measure until 2-player-mode working
      case GameUXState.WaitingOtherPlayer:
      case GameUXState.WaitingUser:
        selectPiece(square, file, rank);
        gameUXState = GameUXState.PieceSelected;
        break;
      case GameUXState.PieceSelected:
        if (movePiece(file, rank) === true) {
          gameUXState = GameUXState.WaitingOtherPlayer;
        } else {
          gameUXState = GameUXState.WaitingUser;
        }
        updateBoard();
        break;
      case GameUXState.GameOver:
      default:
        break;
    }
  }

  const setEvents = function() {
    const position = game.position;
    for (let rank = 0; rank < position.ranks; rank++) {
      for (let file = 0; file < position.files; file++) {
        const index = fr(position.files, file, rank);
        const square = board.squares[index];
        square.addEventListener('click', function() {
          updateBasedOnState(square, file, rank);
        });
      }
    }
  }

  const initialize = function() {
    const mainDiv = document.getElementById(divID);
    if (!mainDiv) {
      throw `Element ${divID} does not exist.`;
    } else {
      div = mainDiv;
      divWidth = div.offsetHeight;
      divHeight = div.offsetHeight;
    }
    // Todo: Pass a URL parameter with start position to loadPosition
    game = newGameWithMoves(loadPosition());
    // Draw static elements
    setupBoard();
    // Set events
    setEvents();

    updateBoard();
  }

  initialize();
}

GameUX('sandy-game-1');
