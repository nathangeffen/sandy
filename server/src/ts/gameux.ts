import {
  ROOK,
  BISHOP,
  SOUTH,
  NORTH,
  Move,
  fr,
  SI,
  toString,
  PositionMove,
  Game,
  GameStatus,
  newGameWithMoves,
  loadPosition,
  move as gameMove,
  DEFAULT_POSITION_STRING,
} from "./game.js";


// Global constants
const SVGNS = "http://www.w3.org/2000/svg";

// COLORS
const EVEN_SQUARE = 'LightGray';
const ODD_SQUARE = 'SlateGray';
const SELECTED_SQUARE = 'DarkCyan';
const TRACER_COLOR = 'DarkSlateBlue';
const LAST_MOVE_COLOR = 'Yellow';
const POINTS_SOUTH = 'DarkRed';
const POINTS_NORTH = '#145a32';

const SOUTH_ROOK_IMAGE = '/images/Chess_rlt45.svg';
const SOUTH_BISHOP_IMAGE = '/images/Chess_blt45.svg';
const NORTH_ROOK_IMAGE = '/images/Chess_rdt45.svg';
const NORTH_BISHOP_IMAGE = '/images/Chess_bdt45.svg';
const BLOCKED_SQUARE_IMAGE = '/images/cross-svgrepo-com.svg';
const FROZEN_SQUARE_IMAGE = '/images/cross-frozen.svg';

const DIV_X_MARGIN = 100;
const DIV_Y_MARGIN = 100;

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
  record: HTMLElement | null;
};

type OptionType = {
  startPosition: string;
};

const DEFAULT_OPTIONS = {
  startPosition: DEFAULT_POSITION_STRING,
};

export class GameUX {
  game!: Game;
  divID: string;
  div: HTMLElement;
  divWidth!: number;
  divHeight!: number;
  squareDim!: number;
  options: OptionType;
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
    record: null,
  };

  constructor(divID: string,
    options: OptionType = DEFAULT_OPTIONS) {
    this.divID = divID;
    const mainDiv = document.getElementById(divID);
    if (mainDiv === null) {
      throw `Element ${divID} does not exist.`;
    }
    this.div = mainDiv;
    this.options = options;
    this.initialize(options);
  }

  initialize = function(this: GameUX, options: OptionType) {
    this.div.innerHTML = "";
    this.divWidth = this.div.offsetWidth;
    this.divHeight = this.div.offsetHeight;
    // Todo: Pass a URL parameter with start position to loadPosition
    if (this.game === undefined) {
      this.game = newGameWithMoves(loadPosition(options.startPosition));
    }
    // Draw static elements
    this.setupGame();
    // Set events
    this.setEvents();
    this.updateAll();
  }

  calcSquareDim = function(width: number,
    height: number,
    files: number,
    ranks: number): number {
    const dimWidth = (width - DIV_X_MARGIN) / files;
    const dimHeight = (height - DIV_Y_MARGIN) / ranks;
    return Math.min(dimWidth, dimHeight);
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
    } else {
      if (this.board.onTop === NORTH) {
        this.placePoint(svg, points[1], POINTS_NORTH, fontSize, offset, fontSize + offset);
      } else {
        this.placePoint(svg, points[1], POINTS_NORTH, fontSize, offset, this.squareDim - offset);
      }
    }
  }

  setupSquare = function(this: GameUX, file: number, rank: number) {
    const svg = document.createElementNS(SVGNS, 'svg');
    const square = document.createElementNS(SVGNS, 'rect');
    svg.appendChild(square);
    svg.id = this.divID + "-square-" + String(file) + '-' + String(rank);
    let x: number;
    let y: number;
    if (this.board.onTop === NORTH) {
      x = file * this.squareDim + DIV_X_MARGIN / 2.0;
      y = (this.game.position.ranks - rank - 1) * this.squareDim + DIV_Y_MARGIN / 2.0;
    } else {
      x = (this.game.position.files - file - 1) * this.squareDim + DIV_X_MARGIN / 2.0;
      y = rank * this.squareDim + DIV_Y_MARGIN / 2.0;
    }
    svg.setAttribute('x', String(x));
    svg.setAttribute('y', String(y));
    svg.setAttribute('height', String(this.squareDim));
    svg.setAttribute('width', String(this.squareDim));
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
      text.setAttribute('x', String(i * this.squareDim + this.squareDim / 2.5 + DIV_X_MARGIN / 2.0));
      text.setAttribute('y', String(ranks * this.squareDim + DIV_Y_MARGIN / 1.5));
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
      text.setAttribute('x', String(files * this.squareDim + DIV_X_MARGIN / 1.8));
      text.setAttribute('y', String(i * this.squareDim + DIV_Y_MARGIN / 2.0 + this.squareDim / 2.0));
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
    if (this.board.onTop === NORTH) {
      this.setupSideIndicator(group, this.board.southIndicator!, DIV_X_MARGIN / 2.0 - 26,
        this.game.position.files * this.squareDim + DIV_Y_MARGIN / 2.0);
      this.setupSideIndicator(group, this.board.northIndicator!, DIV_X_MARGIN / 2.0 - 26,
        DIV_Y_MARGIN / 2.0 + 12);
    } else {
      this.setupSideIndicator(group, this.board.northIndicator!, DIV_X_MARGIN / 2.0 - 26,
        this.game.position.files * this.squareDim + DIV_Y_MARGIN / 2.0);
      this.setupSideIndicator(group, this.board.southIndicator!, DIV_X_MARGIN / 2.0 - 26,
        DIV_Y_MARGIN / 2.0 + 12);
    }
    this.board.svg!.appendChild(group);
  }

  setupBoard = function(this: GameUX) {
    this.board.svg = document.createElementNS(SVGNS, 'svg');
    const svg = this.board.svg;
    const dim = Math.min(this.divWidth, this.divHeight);
    svg.setAttribute('width', String(dim));
    svg.setAttribute('height', String(dim));
    const position = this.game.position;
    this.squareDim = this.calcSquareDim(this.divWidth, this.divHeight, position.files, position.ranks);
    this.board.squares = [];
    for (let rank = 0; rank < position.ranks; rank++) {
      for (let file = 0; file < position.files; file++) {
        const square = this.setupSquare(file, rank);
        this.board.squares.push(square);
        this.board.svg.appendChild(square);
      }
    }
    this.div.appendChild(svg);
    this.setupBars();
    this.setupSideIndicators();
  }

  // To do
  setupClock = function(this: GameUX) {
    const clock = document.createElement('div');
    clock.textContent = "PLACEHOLDER FOR CLOCK";
    clock.setAttribute('class', 'samax-clock');
    this.info.clock = clock;
    this.info.div!.appendChild(clock);
  }

  setupUserActions = function(this: GameUX) {
    const flip = document.createElement('button');
    flip.textContent = "Flip board";
    flip.setAttribute('class', 'samax-button samax-flip-button');
    this.info.div!.appendChild(flip);
    this.info.flip = flip;

    const offerDraw = document.createElement('button');
    offerDraw.textContent = "Offer draw";
    offerDraw.setAttribute('class', 'samax-button samax-offer-draw-button');
    this.info.div!.appendChild(offerDraw);
    this.info.offerDraw = offerDraw;

    const resign = document.createElement('button');
    resign.setAttribute('class', 'samax-button samax-resign-button');
    resign.textContent = 'Resign';
    this.info.div!.appendChild(resign);
    this.info.resign = resign;
  }

  setupScoreboard = function(this: GameUX) {
    const scoreboard = document.createElement('div');
    scoreboard.setAttribute('class', 'samax-scoreboard');
    this.info.scoreboard = scoreboard;
    this.info.div!.appendChild(scoreboard);
  }

  setupRecord = function(this: GameUX) {
    const record = document.createElement('div');
    record.setAttribute('class', 'samax-record');
    this.info.record = record;
    this.info.div!.appendChild(record);
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
    const infoDiv = document.createElement('div');
    infoDiv.style.backgroundColor = 'LightGray';
    infoDiv.style.marginTop = String(DIV_X_MARGIN / 2.0) + "px";
    infoDiv.style.marginBottom = String(DIV_X_MARGIN / 2.0) + "px";
    infoDiv.style.padding = "12px";
    this.div.appendChild(infoDiv);
    this.info.div = infoDiv;
    this.setupClock();
    this.setupUserActions();
    this.setupScoreboard();
    this.setupRecord();
  }

  setupGame = function(this: GameUX) {
    this.setupBoard();
    this.setupInfo();
  }

  placePiece = function(this: GameUX, square: SVGElement, piece: [number, number]) {
    const pieceElement = document.createElementNS(SVGNS, 'image');
    const pieceDim = this.squareDim * (3.0 / 4.0);
    const x = (this.squareDim - pieceDim) / 2.0;
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
    let sideText;
    sideText = 'S';
    if (this.game.position.side === SOUTH) {
      sideText += "*";
    }
    this.board.southIndicator!.textContent = sideText;
    sideText = 'N';
    if (this.game.position.side === NORTH) {
      sideText += "*";
    }
    this.board.northIndicator!.textContent = sideText;
  }

  updateBoard = function(this: GameUX) {
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

  updateScoreboard = function(this: GameUX) {
    let text = "";
    switch (this.game.position.gameStatus) {
      case GameStatus.Tie:
        text += "Game drawn\n";
        break;
      case GameStatus.North:
        text += "North wins\n";
        break;
      case GameStatus.South:
        text += "South wins\n";
        break;
    }
    const southScore = this.game.position.score[SI(SOUTH)];
    const northScore = this.game.position.score[SI(NORTH)];
    const southToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - southScore);
    const northToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - northScore);
    text += "South score: " + String(southScore) + " To win: " + String(southToWin) + "\r\n";
    text += "North score: " + String(northScore) + " To win: " + String(northToWin) + "\r\n";
    this.info.scoreboard!.textContent = text;
  }

  updateRecord = function(this: GameUX) {
    let text = "";
    const node = this.game.history.head();
    node.traverse((positionMove: PositionMove, location: number[]) => {
      const move = positionMove.move;
      if (move) {
        if (positionMove.position.side === NORTH) {
          text += String(Math.floor(location[location.length - 1] / 2) + 1) + ". ";
        }
        text += toString(move);
        if (positionMove.position.side === SOUTH) {
          text += '\r\n';
        } else {
          text += " ";
        }
      }
    });
    this.info.record!.textContent = text;
  }

  updateAll = function(this: GameUX) {
    this.updateBoard();
    this.updateScoreboard();
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

  updateBasedOnState = function(this: GameUX, square: SVGElement, file: number, rank: number) {
    switch (this.gameUXState) {
      // Temporary measure until 2-player-mode working
      case GameUXState.WaitingOtherPlayer:
      case GameUXState.WaitingUser:
        this.selectPiece(square, file, rank);
        this.gameUXState = GameUXState.PieceSelected;
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

  setEvents = function(this: GameUX) {
    const gameUX = this;
    window.onresize = function() {
      gameUX.initialize(gameUX.options);
    }
    const position = this.game.position;
    for (let rank = 0; rank < position.ranks; rank++) {
      for (let file = 0; file < position.files; file++) {
        const index = fr(position.files, file, rank);
        const square = this.board.squares[index];
        square.addEventListener('click', function() {
          gameUX.updateBasedOnState(square, file, rank);
        });
      }
    }
    this.info.flip!.addEventListener('click', function() {
      gameUX.board.onTop = (gameUX.board.onTop === SOUTH) ? NORTH : SOUTH;
      gameUX.initialize(gameUX.options);
    });
  }

}

