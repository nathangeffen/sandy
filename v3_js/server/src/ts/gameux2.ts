import {
  Game,
  NORTH,
  DEFAULT_POSITION_STRING,
  newGameWithMoves,
  loadPosition,
} from "./game.js";

export const SVGNS = "http://www.w3.org/2000/svg";

export const enum GameUXState {
  WaitingUser,
  WaitingOtherPlayer,
  PieceSelected,
  GameOver,
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
  game: Game;
  divID: string;
  div: HTMLDivElement;
  divWidth!: number;
  divHeight!: number;
  squareDim!: number;
  options: GameUXOptionType;
  selectedPiece: [number, number] | null = null;
  onTop: number;

  constructor(divID: string,
    options: GameUXOptionType = DEFAULT_OPTIONS) {

    const mainDiv: HTMLDivElement | null =
      document.querySelector(`div#${divID}`);
    if (!mainDiv) {
      throw `Div element ${divID} does not exist.`;
    }

    this.divID = divID;
    this.div = mainDiv;
    this.divWidth = this.div.offsetWidth;
    this.divHeight = this.div.offsetHeight;
    this.onTop = NORTH;
    this.div = mainDiv;
    this.options = options;
    this.game = newGameWithMoves(loadPosition(options.startPosition));
  }
}
