import { DEFAULT_POSITION_STRING, fr, ROOK, BISHOP, loadPosition, loadEmptyPosition, positionToString } from "./game.js";
import { GameUX } from "./gameux.js";
const DEFAULT_OPTIONS = {
    files: 9,
    ranks: 9,
    positionString: DEFAULT_POSITION_STRING,
};
export class PositionUX {
    constructor(divID, options = DEFAULT_OPTIONS) {
        if (options.positionString > "") {
            this.position = loadPosition(options.positionString);
        }
        else {
            this.position = loadEmptyPosition(options.files, options.ranks);
        }
        this.positionString = positionToString(this.position);
        this.gameUX = new GameUX(divID, {
            startPosition: this.positionString,
            setupEvents: false,
        });
        this.gameUX.updateBoard();
        this.action = "cursor";
    }
}
;
export const processForm = function (divID, form) {
    const formData = new FormData(form);
    // try {
    const files = Number(formData.get('files'));
    const ranks = Number(formData.get('ranks'));
    const positionString = String(formData.get('position-string'));
    //try {
    return new PositionUX(divID, {
        files: files,
        ranks: ranks,
        positionString: positionString
    });
};
const setupSquareActions = function (positionUX) {
    if (positionUX.gameUX.board && positionUX.gameUX.board.svg) {
        positionUX.gameUX.board.svg.addEventListener('click', function (e) {
            e.preventDefault();
            const squareSVG = positionUX.gameUX.getSquare(e.clientX, e.clientY);
            if (squareSVG) {
                const position = positionUX.gameUX.game.position;
                const action = positionUX.action;
                const file = Number(squareSVG.dataset.file);
                const rank = Number(squareSVG.dataset.rank);
                const square = position.squares[fr(position.files, file, rank)];
                switch (action) {
                    case 'north-rook':
                        square.piece = [0, ROOK];
                        break;
                    case 'north-bishop':
                        square.piece = [0, BISHOP];
                        break;
                    case 'south-rook':
                        square.piece = [ROOK, 0];
                        break;
                    case 'south-bishop':
                        square.piece = [BISHOP, 0];
                        break;
                    case 'north-0':
                        square.points[1] = 0;
                        break;
                    case 'north-1':
                        square.points[1] = 1;
                        break;
                    case 'north-2':
                        square.points[1] = 2;
                        break;
                    case 'north-3':
                        square.points[1] = 3;
                        break;
                    case 'north-4':
                        square.points[1] = 4;
                        break;
                    case 'south-0':
                        square.points[0] = 0;
                        break;
                    case 'south-1':
                        square.points[0] = 1;
                        break;
                    case 'south-2':
                        square.points[0] = 2;
                        break;
                    case 'south-3':
                        square.points[0] = 3;
                        break;
                    case 'south-4':
                        square.points[0] = 4;
                        break;
                    case 'block':
                        square.blocked = true;
                        break;
                    case 'eraser':
                        square.piece = [0, 0];
                        square.points = [0, 0];
                        square.blocked = false;
                        break;
                }
                positionUX.gameUX.redrawBoard(positionUX.gameUX.squareDim);
                positionUX.gameUX.updatePositionString();
            }
        });
    }
};
export const processPositions = function (elemID) {
    const userElem = document.getElementById(elemID);
    if (userElem) {
        const divs = userElem.querySelectorAll('div.setup-position');
        for (const div of divs) {
            let positionUX;
            const form = div.querySelector('div.position-files-ranks form');
            const position = div.querySelector('div.position');
            if (position) {
                position.style.visibility = "hidden";
            }
            if (form && position) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    position.style.visibility = "visible";
                    positionUX = processForm(elemID, form);
                    setupSquareActions(positionUX);
                    setupSelectorActions(positionUX, userElem);
                    positionUX.gameUX.setupPositionString();
                    form.style.display = "none";
                });
            }
        }
    }
    else {
        throw `No elements ${elemID} found`;
    }
};
const setupSelectorActions = function (positionUX, userElem) {
    const elems = userElem.querySelectorAll('div.position-elements button');
    elems.forEach((elem) => {
        const button = elem;
        const selected = userElem.querySelector('div.selected');
        const pointer = userElem.querySelector('button.cursor');
        button.addEventListener('click', function (e) {
            e.preventDefault();
            if (selected) {
                selected.innerHTML = button.innerHTML;
                selected.style.backgroundColor = getComputedStyle(button).getPropertyValue('background-color');
                positionUX.action = button.dataset.action || "cursor";
            }
        });
        if (selected && pointer) {
            const event = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            pointer.dispatchEvent(event);
        }
    });
};
