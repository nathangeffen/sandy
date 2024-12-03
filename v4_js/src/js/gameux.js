import { NORTH, DEFAULT_POSITION_STRING, newGameWithMoves, loadPosition, } from "./game.js";
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
;
export class GameUX {
    constructor(div, options) {
        this.selectedPiece = null;
        this.components = {};
        this.get = function (className, tagName = "") {
            const elem = this.div.querySelector(`.${className}`);
            if (elem && tagName && elem.tagName.toLowerCase() !== tagName.toLowerCase()) {
                return null;
            }
            return elem;
        };
        this.update = function () {
            for (const component of Object.values(this.components)) {
                if (typeof component.update === "function") {
                    component.update();
                }
            }
        };
        let defaults = {
            startPosition: DEFAULT_POSITION_STRING,
            gameUXState: 1 /* GameUXState.WaitingUser */,
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
    setGame(options) {
        this.options = options;
        this.game = newGameWithMoves(loadPosition(options.startPosition));
    }
    addComponent(component) {
        const elem = this.get(component.name, component.tagName);
        if (!elem)
            return;
        if (component.tagName &&
            component.tagName.toLowerCase() !== component.tagName.toLowerCase())
            return;
        this.components[component.name] = new component.typeName(this, elem);
    }
}
