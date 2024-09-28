import {
  ROOK,
  BISHOP,
  SOUTH,
  NORTH,
  Move,
  fr,
  SI,
  toString,
  Game,
  GameStatus,
  GameOverReason,
  newGameWithMoves,
  loadPosition,
  move as gameMove,
  DEFAULT_POSITION_STRING,
  positionToString,
  Position,
} from "./game.js";

// Global constants
const SVGNS = "http://www.w3.org/2000/svg";

// COLORS
const EVEN_SQUARE = 'LightGray';
const ODD_SQUARE = 'SlateGray';
const SELECTED_SQUARE = 'DarkCyan';
const TRACER_COLOR = 'DarkSlateBlue';
const LAST_MOVE_COLOR = 'Yellow';
const SELECTED_SQUARE_COLOR = '#43cb7e';
const POINTS_SOUTH = 'White';
const POINTS_NORTH = 'Black';

const SOUTH_ROOK_IMAGE = '/images/Chess_rlt45.svg';
const SOUTH_BISHOP_IMAGE = '/images/Chess_blt45.svg';
const NORTH_ROOK_IMAGE = '/images/Chess_rdt45.svg';
const NORTH_BISHOP_IMAGE = '/images/Chess_bdt45.svg';
const BLOCKED_SQUARE_IMAGE = '/images/cross-svgrepo-com.svg';
const FROZEN_SQUARE_IMAGE = '/images/cross-frozen.svg';

const DIV_X_MARGIN = 50;
const DIV_Y_MARGIN = 200;

// Types and enums

export const enum GameUXState {
  WaitingUser,
  WaitingOtherPlayer,
  PieceSelected,
  GameOver,
};

export type BoardType = {
  svg: SVGElement | null;
  squares: SVGElement[];
  northIndicator: SVGElement | null;
  southIndicator: SVGElement | null;
  onTop: number;
};

type InfoType = {
  div: HTMLElement | null;
  clock: HTMLElement | null;
  offerDraw: HTMLElement | null;
  flip: HTMLElement | null;
  resign: HTMLElement | null;
  scoreboard: HTMLElement | null;
  positionString: HTMLInputElement | null;
  record: HTMLElement | null;
};

export type GameUXOptionType = {
  startPosition: string;
  setupEvents: boolean;
};

const DEFAULT_OPTIONS = {
  startPosition: DEFAULT_POSITION_STRING,
  setupEvents: true,
};

export class GameUX {
  game!: Game;
  divID: string;
  div: HTMLElement;
  divWidth!: number;
  divHeight!: number;
  squareDim!: number;
  options: GameUXOptionType;
  gameUXState: GameUXState = GameUXState.WaitingUser;
  selectedPiece: [number, number] | null = null;
  board: BoardType = {
    svg: null,
    squares: [],
    southIndicator: null,
    northIndicator: null,
    onTop: NORTH,
  };

  info: InfoType = {
    div: null,
    clock: null,
    offerDraw: null,
    flip: null,
    resign: null,
    scoreboard: null,
    positionString: null,
    record: null,
  };

  constructor(divID: string,
    options: GameUXOptionType = DEFAULT_OPTIONS) {
    this.divID = divID;
    const mainDiv = document.getElementById(divID);
    if (mainDiv === null) {
      throw `Element ${divID} does not exist.`;
    }
    this.div = mainDiv;
    this.options = options;
    this.initialize(options);
  }

  initialize = function(this: GameUX, options: GameUXOptionType) {
    this.divWidth = this.div.offsetWidth;
    this.divHeight = this.div.offsetHeight;
    if (this.game === undefined) {
      this.game = newGameWithMoves(loadPosition(options.startPosition));
    }
    this.setupGame();
    if (options.setupEvents) {
      this.setupEvents();
    }
    this.updateAll();
  }

  calcSquareDim = function(width: number,
    height: number,
    files: number,
    ranks: number): number {
    let result: number;
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    if (width <= vh) {
      result = (width - DIV_X_MARGIN) / files;
    } else {
      result = (height - DIV_Y_MARGIN) / ranks;
    }
    const maxSize = (height - DIV_Y_MARGIN) / 6;
    if (result > maxSize) {
      result = maxSize;
    }
    return result;
  }

  setupBlocked = function(this: GameUX, square: SVGElement) {
    const blocked = document.createElementNS(SVGNS, 'image');
    square.appendChild(blocked);
    blocked.setAttribute('x', String(0));
    blocked.setAttribute('y', String(0));
    blocked.setAttribute('height', String(this.squareDim));
    blocked.setAttribute('width', String(this.squareDim));
    blocked.setAttribute('href', BLOCKED_SQUARE_IMAGE);
  }

  placePoint = function(this: GameUX,
    svg: SVGElement,
    points: number,
    fill: string,
    fontSize: number,
    x: number,
    y: number) {
    const pointElement = document.createElementNS(SVGNS, 'text');
    svg.appendChild(pointElement);
    pointElement.style.fontWeight = 'bold';
    pointElement.style.fontSize = String(fontSize) + "px";

    pointElement.setAttribute('x', String(x));
    pointElement.setAttribute('y', String(y));
    pointElement.setAttribute('fill', fill);
    pointElement.textContent = String(points);
  }

  setupPoints = function(this: GameUX, svg: SVGElement, points: [number, number]) {
    const offset: number = 6;
    const fontSize = this.squareDim / 5.0;
    if (points[0]) {
      if (this.board.onTop === NORTH) {
        this.placePoint(svg, points[0], POINTS_SOUTH, fontSize, offset, this.squareDim - offset);
      } else {
        this.placePoint(svg, points[0], POINTS_SOUTH, fontSize, offset, fontSize + offset);
      }
    }
    if (points[1]) {
      if (this.board.onTop === NORTH) {
        this.placePoint(svg, points[1], POINTS_NORTH, fontSize, offset, fontSize + offset);
      } else {
        this.placePoint(svg, points[1], POINTS_NORTH, fontSize, offset, this.squareDim - offset);
      }
    }
  }

  setupSquare = function(this: GameUX, file: number, rank: number) {
    const svg = document.createElementNS(SVGNS, 'svg');
    const square: SVGRectElement = document.createElementNS(SVGNS, 'rect');
    svg.appendChild(square);
    svg.id = this.divID + "-square-" + String(file) + '-' + String(rank);
    let x: number;
    let y: number;
    if (this.board.onTop === NORTH) {
      x = file * this.squareDim;
      y = (this.game.position.ranks - rank - 1) * this.squareDim;
    } else {
      x = (this.game.position.files - file - 1) * this.squareDim;
      y = rank * this.squareDim;
    }
    svg.setAttribute('x', String(x));
    svg.setAttribute('y', String(y));
    svg.setAttribute('height', String(this.squareDim));
    svg.setAttribute('width', String(this.squareDim));
    svg.dataset.file = String(file);
    svg.dataset.rank = String(rank);
    square.setAttribute('x', "0");
    square.setAttribute('y', "0");
    square.setAttribute('height', String(this.squareDim));
    square.setAttribute('width', String(this.squareDim));
    const fill = ((file + rank) % 2 == 0) ? EVEN_SQUARE : ODD_SQUARE;
    square.setAttribute('fill', fill);
    const index = fr(this.game.position.files, file, rank);
    if (this.game.position.squares[index].blocked === true) {
      this.setupBlocked(svg);
    }
    const points = this.game.position.squares[index].points;
    if (points[0] || points[1]) {
      this.setupPoints(svg, points);
    }
    return svg;
  }

  setupFileBar = function(this: GameUX) {
    const group = document.createElementNS(SVGNS, 'g');
    const files = this.game.position.files;
    const ranks = this.game.position.ranks;
    for (let i = 0; i < files; i++) {
      const text = document.createElementNS(SVGNS, 'text');
      text.style.fontSize = 'small';
      if (this.board.onTop === NORTH) {
        text.textContent = String.fromCharCode(97 + i);
      } else {
        text.textContent = String.fromCharCode(97 + files - i - 1);
      }
      text.setAttribute('x', String(i * this.squareDim + this.squareDim / 2.5));
      text.setAttribute('y', String(ranks * this.squareDim + 15));
      group.appendChild(text);
    }
    if (this.board.svg) {
      this.board.svg.appendChild(group);
    }
  }

  setupRankBar = function(this: GameUX) {
    const group = document.createElementNS(SVGNS, 'g');
    const files = this.game.position.files;
    const ranks = this.game.position.ranks;
    for (let i = 0; i < ranks; i++) {
      const text = document.createElementNS(SVGNS, 'text');
      text.style.fontSize = 'small';
      if (this.board.onTop === NORTH) {
        text.textContent = String(ranks - i);
      } else {
        text.textContent = String(i + 1);
      }
      text.setAttribute('x', String(files * this.squareDim + 10));
      text.setAttribute('y', String(i * this.squareDim + this.squareDim / 2.0));
      group.appendChild(text);
    }
    this.board.svg!.appendChild(group);
  }

  setupBars = function(this: GameUX) {
    this.setupFileBar();
    this.setupRankBar();
  }

  setupSideIndicator = function(this: GameUX, sideGroup: SVGElement, sideElement: SVGElement,
    x: number, y: number) {
    sideElement.setAttribute('x', String(x));
    sideElement.setAttribute('y', String(y));
    sideGroup.appendChild(sideElement);
  }

  setupSideIndicators = function(this: GameUX) {
    const group = document.createElementNS(SVGNS, 'g');
    this.board.southIndicator = document.createElementNS(SVGNS, 'text');
    this.board.northIndicator = document.createElementNS(SVGNS, 'text');
    this.board.southIndicator.style.fontSize = 'xx-small';
    this.board.northIndicator.style.fontSize = 'xx-small';
    if (this.board.onTop === NORTH) {
      this.setupSideIndicator(
        group,
        this.board.southIndicator!,
        this.game.position.files * this.squareDim + 2,
        this.game.position.ranks * this.squareDim);
      this.setupSideIndicator(
        group,
        this.board.northIndicator!,
        this.game.position.files * this.squareDim + 2,
        12);
    } else {
      this.setupSideIndicator(
        group,
        this.board.northIndicator!,
        this.game.position.files * this.squareDim + 2,
        this.game.position.ranks * this.squareDim);
      this.setupSideIndicator(
        group,
        this.board.southIndicator!,
        this.game.position.files * this.squareDim + 2,
        12);
    }
    this.board.svg!.appendChild(group);
  }

  setupBoard = function(this: GameUX, squareDim = 0) {
    this.board.svg = this.div.querySelector('svg');
    const div: HTMLDivElement | null = this.div.querySelector('div.board');
    if (this.board.svg && div) {
      this.board.svg.innerHTML = '';
      const dim = div.offsetWidth;
      this.board.svg.setAttribute('width', String(dim));
      this.board.svg.setAttribute('height', String(dim));
      const position = this.game.position;
      this.squareDim = squareDim || this.calcSquareDim(dim, dim, position.files, position.ranks);
      this.board.squares = [];
      for (let rank = 0; rank < position.ranks; rank++) {
        for (let file = 0; file < position.files; file++) {
          const square = this.setupSquare(file, rank);
          this.board.squares.push(square);
          this.board.svg.appendChild(square);
        }
      }
      this.setupBars();
      this.setupSideIndicators();
    }
  }

  // To do
  setupClock = function(this: GameUX) {
    this.info.clock = this.info.div?.querySelector('.clock') || null;
  }

  setupUserActions = function(this: GameUX) {
    this.info.flip = this.info.div?.querySelector('.flip') || null;
    this.info.offerDraw = this.info.div?.querySelector('.draw') || null;
    this.info.resign = this.info.div?.querySelector('.resign') || null;
  }

  setupScoreboard = function(this: GameUX) {
    this.info.scoreboard = this.info.div?.querySelector('.scoreboard') || null;
  }

  setupPositionString = function(this: GameUX) {
    this.info.positionString = this.info.div?.querySelector('.position-string input') || null;
    const copy = this.info.div?.querySelector('.position-string .copy');
    const positionString: HTMLInputElement | null = this.info.positionString;
    if (positionString && copy) {
      copy.addEventListener('click', function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(positionString.value);
      });
    }
  }

  setupRecord = function(this: GameUX) {
    this.info.record = this.info.div?.querySelector('.record') || null;
  }

  setupInfo = function(this: GameUX) {
    // Result if this.game over
    // Clock
    // To play
    // To play: South
    // Points: South: 9/18 (3 more to win) North 9
    // Draw offer
    // Resign
    // Move history
    //
    this.info.div = this.div.querySelector('.info');
    if (this.info.div) {
      this.setupClock();
      this.setupUserActions();
      this.setupScoreboard();
      this.setupPositionString();
      this.setupRecord();
    }
  }

  setupGame = function(this: GameUX) {
    this.setupBoard();
    this.setupInfo();
  }

  placePiece = function(this: GameUX, square: SVGElement, piece: [number, number]) {
    const pieceDim = this.squareDim * (3.0 / 4.0);
    const x = (this.squareDim - pieceDim) / 2.0;
    const y = x;
    const pieceElement = document.createElementNS(SVGNS, 'image');
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

  setLastMove = function(this: GameUX, square: SVGElement) {
    const lastMoveElement = document.createElementNS(SVGNS, 'rect');
    lastMoveElement.setAttribute('x', '0');
    lastMoveElement.setAttribute('y', '0');
    lastMoveElement.setAttribute('width', String(this.squareDim));
    lastMoveElement.setAttribute('height', String(this.squareDim));
    lastMoveElement.setAttribute('fill', LAST_MOVE_COLOR);
    lastMoveElement.setAttribute('fill-opacity', '20%');
    lastMoveElement.setAttribute('class', 'last-move dynamic');
    square.appendChild(lastMoveElement);
  }

  setFrozen = function(this: GameUX, square: SVGElement) {
    const frozen = document.createElementNS(SVGNS, 'image');
    const frozenDim = this.squareDim * (3.0 / 7.0);
    const x = (this.squareDim - frozenDim) / 2.0;
    const y = x;
    square.appendChild(frozen);
    frozen.setAttribute('x', String(x));
    frozen.setAttribute('y', String(y));
    frozen.setAttribute('height', String(frozenDim));
    frozen.setAttribute('width', String(frozenDim));
    frozen.setAttribute('href', FROZEN_SQUARE_IMAGE);
    frozen.setAttribute('stroke', "Red");
  }

  updateSideIndicators = function(this: GameUX) {
    if (this.board.southIndicator && this.board.northIndicator) {
      let sideText;
      sideText = 'S';
      if (this.game.position.side === SOUTH) {
        sideText += "*";
      }
      this.board.southIndicator.textContent = sideText;
      sideText = 'N';
      if (this.game.position.side === NORTH) {
        sideText += "*";
      }
      this.board.northIndicator.textContent = sideText;
    }
  }

  updateBoard = function(this: GameUX) {
    if (this.board.svg) {
      const position = this.game.position;
      this.updateSideIndicators();
      for (let rank = 0; rank < position.ranks; rank++) {
        for (let file = 0; file < position.files; file++) {
          const index = fr(position.files, file, rank);
          const square = this.board.squares[index];
          const piece = position.squares[index].piece;
          const dynamicElements = square.querySelectorAll('.dynamic');
          for (const element of dynamicElements) {
            element.remove();
          }
          const lastMove = this.game.history.value.move;
          if (lastMove) {
            if ((file === lastMove.fromFile && rank === lastMove.fromRank) ||
              (file === lastMove.toFile && rank === lastMove.toRank)) {
              this.setLastMove(square);
            }
          }
          if ((piece[0] | piece[1]) > 0) {
            this.placePiece(square, piece);
            const points = position.squares[index].points;
            if ((piece[0] && points[0]) || (piece[1] && points[1]) &&
              this.game.position.frozen) {
              this.setFrozen(square);
            }
          }
        }
      }
    }
  }

  reasonText = function(reason: GameOverReason, ply: number) {
    switch (reason) {
      case GameOverReason.Agreement:
        return "Draw agreed";
      case GameOverReason.NoMoves:
        return "No moves possible";
      case GameOverReason.PlyWithoutPoints:
        return `No points scored for ${ply} ply`;
      case GameOverReason.PointsScored:
        return "Winning points scored";
      default:
        return "";
    }
  }

  updateScoreboard = function(this: GameUX) {
    if (this.info.scoreboard) {
      const resultDiv = this.info.scoreboard.querySelector('div.result');
      if (resultDiv) {
        switch (this.game.position.gameStatus) {
          case GameStatus.Tie:
            resultDiv.textContent = "Game tied: " +
              this.reasonText(this.game.position.gameOverReason,
                this.game.position.plyTillEnd);
            break;
          case GameStatus.North:
            resultDiv.textContent = "North wins: " +
              this.reasonText(this.game.position.gameOverReason,
                this.game.position.plyTillEnd);
            ;
            break;
          case GameStatus.South:
            resultDiv.textContent = "South wins: " +
              this.reasonText(this.game.position.gameOverReason,
                this.game.position.plyTillEnd);
            ;
            break;
        }
      }
      const plyLeft = this.info.scoreboard.querySelector('div.ply-left');
      if (plyLeft) {
        plyLeft.textContent = "Ply till result:" +
          (this.game.position.plyTillEnd - (this.game.position.ply - this.game.position.plyLastPoints));
      }
      const scoreDiv = this.info.scoreboard.querySelector('div.score');
      if (scoreDiv) {
        const southScore = this.game.position.score[SI(SOUTH)];
        const northScore = this.game.position.score[SI(NORTH)];
        const southToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - southScore);
        const northToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - northScore);
        const northDiv = scoreDiv.querySelector('div.north-score');
        if (northDiv) {
          northDiv.textContent = "North score: " + String(northScore) + " To win: " + String(northToWin);
        }
        const southDiv = scoreDiv.querySelector('div.south-score');
        if (southDiv) {
          southDiv.textContent = "South score: " + String(southScore) + " To win: " + String(southToWin);
        }
      }
    }
  }

  updatePositionString = function(this: GameUX) {
    if (this.info.positionString) {
      this.info.positionString.setAttribute('value',
        positionToString(this.game.position));
    }
  }

  updateRecord = function(this: GameUX) {
    if (this.info.record) {
      this.info.record.innerHTML = "";
      this.game.history.head().traverse((position: Position) => {
        const elem = document.createElement('a');
        elem.setAttribute('href', '#');
        let text: string;
        if (position.move) {
          if (position.side === NORTH) {
            text = String(1 + Math.floor(position.ply / 2)) + ' ' +
              toString(position.move);
            elem.setAttribute('class', 'south');
          } else {
            text = toString(position.move);
            elem.setAttribute('class', 'north');
          }
          elem.textContent = text;
          this.info.record!.appendChild(elem);
        }
      });
    }
  }

  updateAll = function(this: GameUX) {
    this.updateBoard();
    this.updateScoreboard();
    this.updatePositionString();
    this.updateRecord();
  }

  selectPieceMoves = function(this: GameUX, file: number, rank: number) {
    const pieceMoves: Move[] = [];
    for (const move of this.game.position.moves) {
      if (move.fromFile === file && move.fromRank === rank) {
        pieceMoves.push(move);
      }
    }
    return pieceMoves;
  }

  setSelectedSquare = function(this: GameUX, file: number, rank: number) {
    const square = this.board.squares[fr(this.game.position.files, file, rank)];
    if (square) {
      const selectedElement = document.createElementNS(SVGNS, 'rect');
      selectedElement.setAttribute('x', '0');
      selectedElement.setAttribute('y', '0');
      selectedElement.setAttribute('width', String(this.squareDim));
      selectedElement.setAttribute('height', String(this.squareDim));
      selectedElement.setAttribute('fill', SELECTED_SQUARE_COLOR);
      selectedElement.setAttribute('fill-opacity', '20%');
      selectedElement.setAttribute('class', 'selected-square dynamic');
      square.appendChild(selectedElement);
    }
  }

  setTracerOn = function(this: GameUX, file: number, rank: number) {
    const moves = this.selectPieceMoves(file, rank);
    for (const move of moves) {
      const toFile = move.toFile;
      const toRank = move.toRank;
      const index = fr(this.game.position.files, toFile, toRank);
      const toSquare = this.board.squares[index];
      const tracerElement = document.createElementNS(SVGNS, 'circle');
      const r = this.squareDim / 8;
      const cx = this.squareDim / 2;
      const cy = this.squareDim / 2;
      tracerElement.setAttribute('cx', String(cx));
      tracerElement.setAttribute('cy', String(cy));
      tracerElement.setAttribute('r', String(r));
      tracerElement.setAttribute('fill', TRACER_COLOR);
      tracerElement.setAttribute('fill-opacity', '30%');
      tracerElement.setAttribute('class', 'tracer dynamic');
      toSquare.appendChild(tracerElement);
    }
  }

  selectPiece = function(this: GameUX, square: SVGElement, file: number, rank: number) {
    square.setAttribute('fill', SELECTED_SQUARE);
    this.selectedPiece = [file, rank];
    this.setSelectedSquare(file, rank);
    this.setTracerOn(file, rank);
  }

  movePiece = function(this: GameUX, file: number, rank: number): boolean {
    if (this.selectedPiece === null) return false;
    const move: Move = {
      fromFile: this.selectedPiece[0],
      fromRank: this.selectedPiece[1],
      toFile: file,
      toRank: rank,
    };
    try {
      gameMove(this.game, move);
    } catch (err) {
      return false;
    }
    return true;
  }

  updateBasedOnState = function(this: GameUX, square: SVGElement | null, file: number, rank: number) {
    switch (this.gameUXState) {
      case GameUXState.WaitingOtherPlayer:
      case GameUXState.WaitingUser:
        if (square) {
          this.selectPiece(square, file, rank);
          this.gameUXState = GameUXState.PieceSelected;
        }
        break;
      case GameUXState.PieceSelected:
        if (this.movePiece(file, rank) === true) {
          this.gameUXState = GameUXState.WaitingOtherPlayer;
        } else {
          this.gameUXState = GameUXState.WaitingUser;
        }
        this.updateAll();
        break;
      case GameUXState.GameOver:
      default:
        break;
    }
  }

  getSquare = function(this: GameUX, x: number, y: number) {
    for (const square of this.board.squares) {
      const rect = square.getBoundingClientRect();
      if (rect.left <= x && rect.top <= y &&
        rect.right >= x && rect.bottom >= y) {
        return square;
      }
    }
    return null;
  }

  setupBoardEvents(this: GameUX) {
    const gameUX = this;
    const svg = this.board.svg;

    window.onresize = function() {
      gameUX.initialize(gameUX.options);
    }

    let squareDown: SVGElement | null = null;
    let rovingPiece: SVGElement | null = null;

    // TO DO: This is inefficient and should be replaced by proper math

    if (svg) {

      svg.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const square = gameUX.getSquare(e.clientX, e.clientY);
        if (square) {
          const file = Number(square.dataset.file);
          const rank = Number(square.dataset.rank);
          gameUX.updateBasedOnState(square, file, rank);
          if (gameUX.gameUXState === GameUXState.WaitingUser &&
            squareDown !== square) {
            gameUX.updateBasedOnState(square, file, rank);
          }
          squareDown = square;
        }
        if (rovingPiece === null && squareDown) {
          const pieceElement = <SVGElement | null>squareDown.querySelector('.piece');
          if (pieceElement) {
            rovingPiece = document.createElementNS(SVGNS, 'image');
            rovingPiece.setAttribute('width', String(pieceElement.getAttribute('width')));
            rovingPiece.setAttribute('height', String(pieceElement.getAttribute('height')));
            rovingPiece.setAttribute('href', String(pieceElement.getAttribute('href')));
            rovingPiece.style.visibility = "hidden";
            rovingPiece.style.opacity = "50%";
            svg.appendChild(rovingPiece);
          }
        }
      });

      svg.addEventListener('mouseup', function(e) {
        e.preventDefault();
        const square = gameUX.getSquare(e.clientX, e.clientY);
        if (square) {
          const file = Number(square.dataset.file);
          const rank = Number(square.dataset.rank);
          if (squareDown !== square) {
            gameUX.updateBasedOnState(square, file, rank);
            squareDown = null;
          }
        }
        rovingPiece?.remove();
        rovingPiece = null;
      });

      svg.addEventListener('mousemove', function(e) {
        e.preventDefault();
        if (rovingPiece) {
          const width = Number(rovingPiece.getAttribute('width'));
          const height = Number(rovingPiece.getAttribute('height'));
          const x = e.offsetX - width / 2.0;
          const y = e.offsetY - height / 2.0;
          rovingPiece.setAttribute('x', String(x));
          rovingPiece.setAttribute('y', String(y));
          rovingPiece.style.visibility = "visible";
        }
      });

    }
  }

  redrawBoard = function(this: GameUX, squareDim = 0) {
    this.setupBoard(squareDim);
    this.updateBoard();
  }

  setupEvents = function(this: GameUX) {
    const gameUX = this;
    this.setupBoardEvents();

    if (this.info.flip) {
      this.info.flip!.addEventListener('click', function(e) {
        e.preventDefault();
        gameUX.board.onTop = (gameUX.board.onTop === SOUTH) ? NORTH : SOUTH;
        gameUX.redrawBoard();
      });
    }
  }

}

