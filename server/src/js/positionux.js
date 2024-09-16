import { DEFAULT_POSITION_STRING, loadPosition, loadEmptyPosition, positionToString, } from "./game.js";
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
        });
        this.gameUX.updateBoard();
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
    //   } catch (err) {
    //     throw "Problem creating position";
    //   }
    // } catch (err) {
    //   throw `Problem with form: ${err}`;
    // }
};
export const processPositions = function () {
    const divs = document.querySelectorAll('div.setup-position');
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
                positionUX = processForm("position-1", form);
                form.style.display = "none";
                console.log("A", position);
            });
        }
    }
};
