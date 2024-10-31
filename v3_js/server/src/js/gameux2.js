import { NORTH, DEFAULT_POSITION_STRING, newGameWithMoves, loadPosition, } from "./game.js";
export const SVGNS = "http://www.w3.org/2000/svg";
;
const DEFAULT_OPTIONS = {
    startPosition: DEFAULT_POSITION_STRING,
    setupEvents: true,
};
export class GameUX {
    constructor(divID, options = DEFAULT_OPTIONS) {
        this.selectedPiece = null;
        const mainDiv = document.querySelector(`div#${divID}`);
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
