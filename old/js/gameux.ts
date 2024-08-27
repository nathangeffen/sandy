import { Game, loadPosition } from "./game.js";

const SVGNS = "http://www.w3.org/2000/svg";

type SquareParameters = {
  divID: string;
  files: number;
  ranks: number;
  file: number;
  rank: number;
  dim: number;
  offsetX: number;
  offsetY: number;
};

const Square = function(parameters: SquareParameters) {
  const square = document.createElementNS(SVGNS, 'rect');
  square.id = parameters.divID + "-square-" +
    String(parameters.file) + '-' + String(parameters.rank);
  const x = parameters.file * parameters.dim + parameters.offsetX;
  const y = (parameters.ranks - parameters.rank - 1) *
    parameters.dim + parameters.offsetY;
  square.setAttribute('x', String(x));
  square.setAttribute('y', String(y));
  square.setAttribute('height', String(parameters.dim));
  square.setAttribute('width', String(parameters.dim));
  const squareColor = ((this.file + this.rank) % 2 == 0) ? "square-even" : "square-odd";
  square.setAttribute('class', squareColor);
  return square;
}

class FileBar {
  constructor() {

  }
};

class RankBar {

};

class Info {
  constructor(gameUI: GameUI) {

  }

  render = function() {

  }
};

const Board = function(game: Game, divID: string) {
  const svg = document.createElementNS(SVGNS, 'svg');
  const squares = [];
  for (let file = 0; file < this.GameUI.game.files; file++) {
    for (let rank = 0; rank < this.GameUI.game.ranks; rank++) {
      const squareParameters: SquareParameters = {
        divID: divID,
        files: game.position.files,
        ranks: game.position.ranks,
        file: file,
        rank: rank,
        dim: 60,
        offsetX: 10,
        offsetY: 10,
      };
      const square = Square(squareParameters);
      squares.push(square);
      svg.appendChild(square);
    }
  }
  return {
    svg: svg,
    squares: squares,
  };
}

const GameUI = function(game: Game, divID: string) {
  const div = document.getElementById(divID);
  if (!div) {
    throw `Element ${divID} does not exist.`;
  }
  const board = Board(game, divID);
  // Something with GameInfo
  return {
    board: board,
  };
}

const startGame = function(divId: string) {
  // Todo: Pass a URL parameter with start position to loadPosition
  const game = new Game(loadPosition());
  const gameUI = GameUI(game, divId);
}

startGame('sandy-game-1');
