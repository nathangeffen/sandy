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
  div: HTMLDivElement;
  divWidth: number;
  divHeight: number;
  squareDim!: number;
  options: GameUXOptionType;
  selectedPiece: [number, number] | null = null;
  onTop: number;

  constructor(div: HTMLDivElement, options: GameUXOptionType = DEFAULT_OPTIONS) {
    this.div = div;
    this.divWidth = this.div.offsetWidth;
    this.divHeight = this.div.offsetHeight;
    this.onTop = NORTH;
    this.options = options;
    this.game = newGameWithMoves(loadPosition(options.startPosition));
  }

  get = function(this: GameUX, className: string, tagName: string = ""): Element | null {
    const elem = this.div.querySelector(`.${className}`);
    console.log("A", elem?.tagName);
    if (elem && tagName && elem.tagName.toLowerCase() !== tagName.toLowerCase()) {
      return null;
    }
    return elem;
  }
}
