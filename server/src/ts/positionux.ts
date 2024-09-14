import { DEFAULT_POSITION_STRING, Position, loadPosition, loadEmptyPosition, positionToString, } from "./game.js";

import { GameUX } from "./gameux.js";

export type PositionUXOptionType = {
  files: number;
  ranks: number;
  positionString: string;
};

const DEFAULT_OPTIONS: PositionUXOptionType = {
  files: 9,
  ranks: 9,
  positionString: DEFAULT_POSITION_STRING,
};

export class PositionUX {
  position: Position;
  positionString: string;
  gameUX: GameUX;

  constructor(divID: string, options: PositionUXOptionType = DEFAULT_OPTIONS) {
    if (options.positionString > "") {
      this.position = loadPosition(options.positionString);
    } else {
      this.position = loadEmptyPosition(options.files, options.ranks);
    }
    this.positionString = positionToString(this.position);
    this.gameUX = new GameUX(divID, {
      startPosition: this.positionString,
      boardOnly: true,
    });
    this.gameUX.updateBoard();
  }
};

export const processForm = function(divID: string, form: HTMLFormElement) {
  const formData = new FormData(form);
  try {
    const files: number = Number(formData.get('files'));
    const ranks: number = Number(formData.get('ranks'));
    const positionString: string = String(formData.get('position-string'));
    try {
      return new PositionUX(divID, {
        files: files,
        ranks: ranks,
        positionString: positionString
      });
    } catch (err) {
      throw "Problem creating position";
    }
  } catch (err) {
    throw `Problem with form: ${err}`;
  }
};
