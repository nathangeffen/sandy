import {
  Game,
  NORTH,
  DEFAULT_POSITION_STRING,
  newGameWithMoves,
  loadPosition,
} from "./game.js";


// Global constants

// COLORS
export const POINTS_SOUTH = 'White';
export const POINTS_NORTH = 'Black';

export const SOUTH_ROOK_IMAGE = '/images/Chess_rlt45.svg';
export const SOUTH_BISHOP_IMAGE = '/images/Chess_blt45.svg';
export const NORTH_ROOK_IMAGE = '/images/Chess_rdt45.svg';
export const NORTH_BISHOP_IMAGE = '/images/Chess_bdt45.svg';
export const BLOCKED_SQUARE_IMAGE = '/images/cross-svgrepo-com.svg';
export const FROZEN_SQUARE_IMAGE = '/images/cross-frozen.svg';

export const DIV_X_MARGIN = 50;
export const DIV_Y_MARGIN = 200;

// Types and enums

export type ComponentEntry = {
  name: string,
  tagName: string,
  typeName: any
};

export const enum GameUXState {
  SettingUp,
  WaitingUser,
  WaitingOtherPlayer,
  PieceSelected,
  GameOver,
};

export type GameUXOptionType = {
  startPosition: string,
  gameUXState: GameUXState,
  southId: string,
  northId: string
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
  components: { [key: string]: any } = {};
  gameUXState: GameUXState;

  constructor(div: HTMLDivElement, options: GameUXOptionType) {

    let defaults = {
      startPosition: DEFAULT_POSITION_STRING,
      gameUXState: GameUXState.WaitingUser,
      southId: "",
      northId: ""
    };

    this.options = Object.assign({}, defaults, options);
    this.div = div;
    this.divWidth = this.div.offsetWidth;
    this.divHeight = this.div.offsetHeight;
    this.onTop = NORTH;
    this.game = newGameWithMoves(loadPosition(this.options.startPosition));
    this.gameUXState = this.options.gameUXState;
  }

  setGame(options: GameUXOptionType) {
    this.options = options;
    this.game = newGameWithMoves(loadPosition(options.startPosition));
  }

  get = function(this: GameUX, className: string, tagName: string = ""): Element | null {
    const elem = this.div.querySelector(`.${className}`);
    if (elem && tagName && elem.tagName.toLowerCase() !== tagName.toLowerCase()) {
      return null;
    }
    return elem;
  }

  addComponent(this: GameUX, component: ComponentEntry) {
    const elem = this.get(component.name, component.tagName);
    if (!elem) return;
    if (component.tagName &&
      component.tagName.toLowerCase() !== component.tagName.toLowerCase()) return;
    this.components[component.name] = new component.typeName(this, elem);
  }

  update = function(this: GameUX) {
    for (const component of Object.values(this.components)) {
      if (typeof component.update === "function") {
        component.update();
      }
    }
  }
}

