// import { DEFAULT_POSITION_STRING, Position, fr, SI, SOUTH, NORTH, ROOK, BISHOP, loadPosition, loadEmptyPosition, positionToString } from "./game.js";
//
// import { GameUX } from "./gameux.js";
//
// export type PositionUXOptionType = {
//   files: number;
//   ranks: number;
//   positionString: string;
// };
//
// const DEFAULT_OPTIONS: PositionUXOptionType = {
//   files: 9,
//   ranks: 9,
//   positionString: DEFAULT_POSITION_STRING,
// };
//
// const linkFormFieldsToPosition = function(positionUX: PositionUX, divID: string) {
//   const div = document.getElementById(divID);
//   if (!div) return;
//
//   const positionString: HTMLInputElement | null = div.querySelector('.position-string input');
//   if (!positionString) return;
//
//   const position = positionUX.gameUX.game.position;
//
//   const sideToPlay: HTMLInputElement | null = div.querySelector('select[name="side-to-play"]');
//   const startScoreSouth: HTMLInputElement | null = div.querySelector('input[name="start-score-south"]');
//   const startScoreNorth: HTMLInputElement | null = div.querySelector('input[name="start-score-north"]');
//   const winScoreSouth: HTMLInputElement | null = div.querySelector('input[name="win-score-south"]');
//   const winScoreNorth: HTMLInputElement | null = div.querySelector('input[name="win-score-north"]');
//   const ply: HTMLInputElement | null = div.querySelector('input[name="ply"]');
//   const plyWhenLastPointsScored: HTMLInputElement | null = div.querySelector('input[name="ply-last"]');
//   const plyCountWithoutPointsTillEnd: HTMLInputElement | null = div.querySelector('input[name="ply-count"]');
//   const canMoveBackToLastMoveSquare: HTMLInputElement | null = div.querySelector('input[name="repeat"]');
//
//   if (sideToPlay) {
//     sideToPlay.value = (position.side === SOUTH) ? "south" : "north";
//     sideToPlay.addEventListener('change', function() {
//       position.side = (sideToPlay.value === 'south') ? SOUTH : NORTH;
//       positionString.value = positionToString(position);
//     });
//   }
//   if (startScoreSouth) {
//     startScoreSouth.value = String(position.score[SI(SOUTH)]);
//     startScoreSouth.addEventListener('click', function() {
//       position.startScore[SI(SOUTH)] = Number(startScoreSouth.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (startScoreNorth) {
//     startScoreNorth.value = String(position.score[SI(NORTH)]);
//     startScoreNorth.addEventListener('click', function() {
//       position.startScore[SI(NORTH)] = Number(startScoreNorth.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (winScoreSouth) {
//     winScoreSouth.value = String(position.winScore[SI(SOUTH)]);
//     winScoreSouth.addEventListener('click', function() {
//       position.winScore[SI(SOUTH)] = Number(winScoreSouth.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (winScoreNorth) {
//     winScoreNorth.value = String(position.winScore[SI(NORTH)]);
//     winScoreNorth.addEventListener('click', function() {
//       position.winScore[SI(NORTH)] = Number(winScoreNorth.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (ply) {
//     ply.value = String(position.ply);
//     ply.addEventListener('change', function() {
//       position.ply = Number(ply.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (plyWhenLastPointsScored) {
//     plyWhenLastPointsScored.value = String(position.plyLastPoints);
//     plyWhenLastPointsScored.addEventListener('change', function() {
//       position.plyLastPoints = Number(plyWhenLastPointsScored.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (plyCountWithoutPointsTillEnd) {
//     plyCountWithoutPointsTillEnd.value = String(position.plyTillEnd);
//     plyCountWithoutPointsTillEnd.addEventListener('change', function() {
//       position.plyTillEnd = Number(plyCountWithoutPointsTillEnd.value);
//       positionString.value = positionToString(position);
//     });
//   }
//   if (canMoveBackToLastMoveSquare) {
//     canMoveBackToLastMoveSquare.checked = position.repeatLastMove;
//     canMoveBackToLastMoveSquare.addEventListener('change', function() {
//       position.repeatLastMove = canMoveBackToLastMoveSquare.checked;
//       positionString.value = positionToString(position);
//     });
//   }
// }
//
// export class PositionUX {
//   position: Position;
//   positionString: string;
//   gameUX: GameUX;
//   action: string;
//
//   constructor(divID: string, options: PositionUXOptionType = DEFAULT_OPTIONS) {
//     if (options.positionString > "") {
//       this.position = loadPosition(options.positionString);
//     } else {
//       this.position = loadEmptyPosition(options.files, options.ranks);
//     }
//     this.positionString = positionToString(this.position);
//     this.gameUX = new GameUX(divID, {
//       startPosition: this.positionString,
//       setupEvents: false,
//     });
//     this.gameUX.updateBoard();
//     linkFormFieldsToPosition(this, divID);
//     this.action = "cursor";
//   }
// };
//
// export const processForm = function(divID: string, form: HTMLFormElement) {
//   const formData = new FormData(form);
//   // try {
//   const files: number = Number(formData.get('files'));
//   const ranks: number = Number(formData.get('ranks')); 0
//   const positionString: string = String(formData.get('position-string'));
//   //try {
//   return new PositionUX(divID, {
//     files: files,
//     ranks: ranks,
//     positionString: positionString
//   });
// };
//
// const setupSquareActions = function(positionUX: PositionUX) {
//
//   const selectSquare = function(squareSVG: SVGElement) {
//     const position = positionUX.gameUX.game.position;
//     const action = positionUX.action;
//     const file = Number(squareSVG.dataset.file);
//     const rank = Number(squareSVG.dataset.rank);
//     const square = position.squares[fr(position.files, file, rank)];
//     switch (action) {
//       case 'north-rook':
//         square.piece = [0, ROOK];
//         break;
//       case 'north-bishop':
//         square.piece = [0, BISHOP];
//         break;
//       case 'south-rook':
//         square.piece = [ROOK, 0];
//         break;
//       case 'south-bishop':
//         square.piece = [BISHOP, 0];
//         break;
//       case 'north-0':
//         square.points[1] = 0;
//         break;
//       case 'north-1':
//         square.points[1] = 1;
//         break;
//       case 'north-2':
//         square.points[1] = 2;
//         break;
//       case 'north-3':
//         square.points[1] = 3;
//         break;
//       case 'north-4':
//         square.points[1] = 4;
//         break;
//       case 'south-0':
//         square.points[0] = 0;
//         break;
//       case 'south-1':
//         square.points[0] = 1;
//         break;
//       case 'south-2':
//         square.points[0] = 2;
//         break;
//       case 'south-3':
//         square.points[0] = 3;
//         break;
//       case 'south-4':
//         square.points[0] = 4;
//         break;
//       case 'block':
//         square.blocked = true;
//         break;
//       case 'eraser':
//         square.piece = [0, 0];
//         square.points = [0, 0];
//         square.blocked = false;
//         break;
//     }
//   }
//
//   const svg = positionUX.gameUX.get('board', 'svg') as SVGElement;
//   if (!svg) return;
//
//   svg.addEventListener('click', function(e) {
//     e.preventDefault();
//     const squareSVG = positionUX.gameUX.getSquare(e.clientX, e.clientY);
//     if (squareSVG) {
//       selectSquare(squareSVG);
//     }
//     positionUX.gameUX.redrawBoard(positionUX.gameUX.squareDim);
//     positionUX.gameUX.updatePositionString();
//   });
//
// }
//
// const setupSelectorActions = function(positionUX: PositionUX, userElem: HTMLElement) {
//   const elems = userElem.querySelectorAll('div.position-elements button');
//   elems.forEach((elem) => {
//     const button = <HTMLButtonElement>elem;
//     const selected = <HTMLDivElement>userElem.querySelector('div.selected');
//     const pointer = <HTMLButtonElement>userElem.querySelector('button.cursor');
//     button.addEventListener('click', function(e) {
//       e.preventDefault();
//       if (selected) {
//         selected.innerHTML = button.innerHTML;
//         selected.style.backgroundColor = getComputedStyle(button).getPropertyValue('background-color');
//         positionUX.action = button.dataset.action || "cursor";
//       }
//     });
//     if (selected && pointer) {
//       const event = new MouseEvent("click", {
//         view: window,
//         bubbles: true,
//         cancelable: true,
//       });
//       pointer.dispatchEvent(event);
//     }
//   });
// }
//
// const setupUsePositionButton = function(
//   positionUX: PositionUX,
//   userElem: HTMLElement,
//   action: string) {
//
//   const link = userElem.querySelector('.' + action);
//   if (!link) return;
//   const positionString = positionUX.gameUX.info.positionString;
//   if (!positionString) return;
//
//   link.addEventListener('click', function(e) {
//     e.preventDefault();
//     // link.setAttribute('href', `${action}/${encodeURIComponent(positionString.value)}`);
//     const url = `/${action}/${encodeURIComponent(positionString.value)}`;
//     alert(url);
//     //fetch(`${action}_custom/${encodeURIComponent(positionString.value)}`);
//
//     document.location.href = url;
//   });
// }
//
//
export const processPositions = function (elemID) {
    const userElem = document.getElementById(elemID);
    if (!userElem)
        return;
    const divs = userElem.querySelectorAll('div.setup-position');
    for (const div of divs) {
        let positionUX;
        const form = div.querySelector('div.position-files-ranks form');
        const position = div.querySelector('div.position');
        if (position) {
            position.style.visibility = "hidden";
        }
        if (form === null || position === null)
            continue;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            position.style.visibility = "visible";
            // positionUX = processForm(elemID, form);
            // setupSquareActions(positionUX);
            // setupSelectorActions(positionUX, userElem);
            // setupUsePositionButton(positionUX, userElem, 'play');
            // setupUsePositionButton(positionUX, userElem, 'analyze');
            form.style.display = "none";
        });
        const dialog = div.querySelector('dialog.select-position-dialog');
        const button = div.querySelector('button.select-position-button');
        if (dialog === null || button === null)
            continue;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            dialog.showModal();
        });
        dialog.addEventListener('open', () => {
        });
    }
};
//
//
