import { ROOK, BISHOP, SOUTH, NORTH, fr, SI, toString, GameStatus, GameOverReason, newGameWithMoves, loadPosition, move as gameMove, DEFAULT_POSITION_STRING, positionToString, } from "./game.js";
// Global constants
const SVGNS = "http://www.w3.org/2000/svg";
// COLORS
const EVEN_SQUARE = 'LightGray';
const ODD_SQUARE = 'SlateGray';
const SELECTED_SQUARE = 'DarkCyan';
const TRACER_COLOR = 'DarkSlateBlue';
const LAST_MOVE_COLOR = 'Yellow';
const SELECTED_SQUARE_COLOR = '#43cb7e';
const POINTS_SOUTH = 'White';
const POINTS_NORTH = 'Black';
const SOUTH_ROOK_IMAGE = '/images/Chess_rlt45.svg';
const SOUTH_BISHOP_IMAGE = '/images/Chess_blt45.svg';
const NORTH_ROOK_IMAGE = '/images/Chess_rdt45.svg';
const NORTH_BISHOP_IMAGE = '/images/Chess_bdt45.svg';
const BLOCKED_SQUARE_IMAGE = '/images/cross-svgrepo-com.svg';
const FROZEN_SQUARE_IMAGE = '/images/cross-frozen.svg';
const DIV_X_MARGIN = 50;
const DIV_Y_MARGIN = 200;
;
const DEFAULT_OPTIONS = {
    startPosition: DEFAULT_POSITION_STRING,
    setupEvents: true,
};
export class GameUX {
    constructor(divID, options = DEFAULT_OPTIONS) {
        this.gameUXState = 0 /* GameUXState.WaitingUser */;
        this.selectedPiece = null;
        this.board = {
            squares: [],
            southIndicator: null,
            northIndicator: null,
            onTop: NORTH,
        };
        this.info = {
            div: null,
            clock: null,
            offerDraw: null,
            flip: null,
            resign: null,
            scoreboard: null,
            positionString: null,
            record: null,
            message: null,
        };
        this.initialize = function (options) {
            this.divWidth = this.div.offsetWidth;
            this.divHeight = this.div.offsetHeight;
            if (this.game === undefined) {
                this.game = newGameWithMoves(loadPosition(options.startPosition));
            }
            this.setupGame();
            if (options.setupEvents) {
                this.setupEvents();
            }
            this.updateAll();
        };
        this.get = function (className, tagName = "") {
            const elem = this.div.querySelector(`.${className}`);
            console.log("A", elem?.tagName);
            if (elem && tagName && elem.tagName.toLowerCase() !== tagName.toLowerCase()) {
                return null;
            }
            return elem;
        };
        this.calcSquareDim = function (width, height, files, ranks) {
            let result;
            let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            if (width <= vh) {
                result = (width - DIV_X_MARGIN) / files;
            }
            else {
                result = (height - DIV_Y_MARGIN) / ranks;
            }
            const maxSize = (height - DIV_Y_MARGIN) / 6;
            if (result > maxSize) {
                result = maxSize;
            }
            return result;
        };
        this.setupBlocked = function (square) {
            const blocked = document.createElementNS(SVGNS, 'image');
            square.appendChild(blocked);
            blocked.setAttribute('x', String(0));
            blocked.setAttribute('y', String(0));
            blocked.setAttribute('height', String(this.squareDim));
            blocked.setAttribute('width', String(this.squareDim));
            blocked.setAttribute('href', BLOCKED_SQUARE_IMAGE);
        };
        this.placePoint = function (svg, points, fill, fontSize, x, y) {
            const pointElement = document.createElementNS(SVGNS, 'text');
            svg.appendChild(pointElement);
            pointElement.style.fontWeight = 'bold';
            pointElement.style.fontSize = String(fontSize) + "px";
            pointElement.setAttribute('x', String(x));
            pointElement.setAttribute('y', String(y));
            pointElement.setAttribute('fill', fill);
            pointElement.textContent = String(points);
        };
        this.setupPoints = function (svg, points) {
            const offset = 6;
            const fontSize = this.squareDim / 5.0;
            if (points[0]) {
                if (this.board.onTop === NORTH) {
                    this.placePoint(svg, points[0], POINTS_SOUTH, fontSize, offset, this.squareDim - offset);
                }
                else {
                    this.placePoint(svg, points[0], POINTS_SOUTH, fontSize, offset, fontSize + offset);
                }
            }
            if (points[1]) {
                if (this.board.onTop === NORTH) {
                    this.placePoint(svg, points[1], POINTS_NORTH, fontSize, offset, fontSize + offset);
                }
                else {
                    this.placePoint(svg, points[1], POINTS_NORTH, fontSize, offset, this.squareDim - offset);
                }
            }
        };
        this.setupSquare = function (file, rank) {
            const svg = document.createElementNS(SVGNS, 'svg');
            const square = document.createElementNS(SVGNS, 'rect');
            svg.appendChild(square);
            svg.id = this.divID + "-square-" + String(file) + '-' + String(rank);
            let x;
            let y;
            if (this.board.onTop === NORTH) {
                x = file * this.squareDim;
                y = (this.game.position.ranks - rank - 1) * this.squareDim;
            }
            else {
                x = (this.game.position.files - file - 1) * this.squareDim;
                y = rank * this.squareDim;
            }
            svg.setAttribute('x', String(x));
            svg.setAttribute('y', String(y));
            svg.setAttribute('height', String(this.squareDim));
            svg.setAttribute('width', String(this.squareDim));
            svg.dataset.file = String(file);
            svg.dataset.rank = String(rank);
            square.setAttribute('x', "0");
            square.setAttribute('y', "0");
            square.setAttribute('height', String(this.squareDim));
            square.setAttribute('width', String(this.squareDim));
            const fill = ((file + rank) % 2 == 0) ? EVEN_SQUARE : ODD_SQUARE;
            square.setAttribute('fill', fill);
            const index = fr(this.game.position.files, file, rank);
            if (this.game.position.squares[index].blocked === true) {
                this.setupBlocked(svg);
            }
            const points = this.game.position.squares[index].points;
            if (points[0] || points[1]) {
                this.setupPoints(svg, points);
            }
            return svg;
        };
        this.setupFileBar = function () {
            const group = document.createElementNS(SVGNS, 'g');
            const files = this.game.position.files;
            const ranks = this.game.position.ranks;
            for (let i = 0; i < files; i++) {
                const text = document.createElementNS(SVGNS, 'text');
                text.style.fontSize = 'small';
                if (this.board.onTop === NORTH) {
                    text.textContent = String.fromCharCode(97 + i);
                }
                else {
                    text.textContent = String.fromCharCode(97 + files - i - 1);
                }
                text.setAttribute('x', String(i * this.squareDim + this.squareDim / 2.5));
                text.setAttribute('y', String(ranks * this.squareDim + 15));
                group.appendChild(text);
            }
            this.get('board', 'svg')?.appendChild(group);
        };
        this.setupRankBar = function () {
            const group = document.createElementNS(SVGNS, 'g');
            const files = this.game.position.files;
            const ranks = this.game.position.ranks;
            for (let i = 0; i < ranks; i++) {
                const text = document.createElementNS(SVGNS, 'text');
                text.style.fontSize = 'small';
                if (this.board.onTop === NORTH) {
                    text.textContent = String(ranks - i);
                }
                else {
                    text.textContent = String(i + 1);
                }
                text.setAttribute('x', String(files * this.squareDim + 10));
                text.setAttribute('y', String(i * this.squareDim + this.squareDim / 2.0));
                group.appendChild(text);
            }
            this.get('board', 'svg')?.appendChild(group);
        };
        this.setupBars = function () {
            this.setupFileBar();
            this.setupRankBar();
        };
        this.setupSideIndicator = function (sideGroup, sideElement, x, y) {
            sideElement.setAttribute('x', String(x));
            sideElement.setAttribute('y', String(y));
            sideGroup.appendChild(sideElement);
        };
        this.setupSideIndicators = function () {
            const group = document.createElementNS(SVGNS, 'g');
            this.board.southIndicator = document.createElementNS(SVGNS, 'text');
            this.board.northIndicator = document.createElementNS(SVGNS, 'text');
            this.board.southIndicator.style.fontSize = 'xx-small';
            this.board.northIndicator.style.fontSize = 'xx-small';
            if (this.board.onTop === NORTH) {
                this.setupSideIndicator(group, this.board.southIndicator, this.game.position.files * this.squareDim + 2, this.game.position.ranks * this.squareDim);
                this.setupSideIndicator(group, this.board.northIndicator, this.game.position.files * this.squareDim + 2, 12);
            }
            else {
                this.setupSideIndicator(group, this.board.northIndicator, this.game.position.files * this.squareDim + 2, this.game.position.ranks * this.squareDim);
                this.setupSideIndicator(group, this.board.southIndicator, this.game.position.files * this.squareDim + 2, 12);
            }
            this.get('board', 'svg')?.appendChild(group);
        };
        this.setupBoard = function (squareDim = 0) {
            const svg = this.get('board', 'svg');
            if (!svg)
                return;
            const div = this.div.querySelector('div.board-container');
            if (!div)
                return;
            svg.innerHTML = '';
            const dim = div.offsetWidth;
            svg.setAttribute('width', String(dim));
            svg.setAttribute('height', String(dim));
            const position = this.game.position;
            this.squareDim = squareDim || this.calcSquareDim(dim, dim, position.files, position.ranks);
            this.board.squares = [];
            for (let rank = 0; rank < position.ranks; rank++) {
                for (let file = 0; file < position.files; file++) {
                    const square = this.setupSquare(file, rank);
                    this.board.squares.push(square);
                    svg.appendChild(square);
                }
            }
            this.setupBars();
            this.setupSideIndicators();
        };
        // To do
        this.setupClock = function () {
            this.info.clock = this.info.div?.querySelector('.clock') || null;
        };
        this.setupUserActions = function () {
            this.info.flip = this.info.div?.querySelector('.flip') || null;
            this.info.offerDraw = this.info.div?.querySelector('.draw') || null;
            this.info.resign = this.info.div?.querySelector('.resign') || null;
        };
        this.setupScoreboard = function () {
            this.info.scoreboard = this.info.div?.querySelector('.scoreboard') || null;
        };
        this.setupPositionString = function () {
            this.info.positionString = this.info.div?.querySelector('.position-string input') || null;
            const copy = this.info.div?.querySelector('.position-string .copy');
            const save = this.info.div?.querySelector('.position-string .save');
            const positionString = this.info.positionString;
            const gameUX = this;
            if (positionString && copy) {
                copy.addEventListener('click', function (e) {
                    e.preventDefault();
                    navigator.clipboard.writeText(positionString.value);
                    gameUX.setMessage('Copied!', 1000);
                });
            }
            if (positionString && save) {
                save.addEventListener('click', function (e) {
                    e.preventDefault();
                    fetch("/saveposition", {
                        method: "POST",
                        body: JSON.stringify({
                            positionString: positionString.value,
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    })
                        .then((response) => response.json())
                        .then((json) => {
                        gameUX.setMessage(json['message']);
                    });
                });
            }
        };
        this.setupRecord = function () {
            this.info.record = this.info.div?.querySelector('.record') || null;
        };
        this.setupMessage = function () {
            this.info.message = this.info.div?.querySelector('.message') || null;
        };
        this.setupInfo = function () {
            this.info.div = this.div.querySelector('.info');
            if (this.info.div) {
                this.setupClock();
                this.setupUserActions();
                this.setupScoreboard();
                this.setupPositionString();
                this.setupRecord();
                this.setupMessage();
            }
        };
        this.setupGame = function () {
            this.setupBoard();
            this.setupInfo();
        };
        this.placePiece = function (square, piece) {
            const pieceDim = this.squareDim * (3.0 / 4.0);
            const x = (this.squareDim - pieceDim) / 2.0;
            const y = x;
            const pieceElement = document.createElementNS(SVGNS, 'image');
            pieceElement.setAttribute('x', String(x));
            pieceElement.setAttribute('y', String(y));
            pieceElement.setAttribute('width', String(pieceDim));
            pieceElement.setAttribute('height', String(pieceDim));
            pieceElement.setAttribute('class', 'piece dynamic');
            square.appendChild(pieceElement);
            if ((piece[0] | piece[1]) > 0) {
                if (piece[0] === ROOK) {
                    pieceElement.setAttribute('href', SOUTH_ROOK_IMAGE);
                }
                else if (piece[0] === BISHOP) {
                    pieceElement.setAttribute('href', SOUTH_BISHOP_IMAGE);
                }
                else if (piece[1] === ROOK) {
                    pieceElement.setAttribute('href', NORTH_ROOK_IMAGE);
                }
                else {
                    pieceElement.setAttribute('href', NORTH_BISHOP_IMAGE);
                }
            }
        };
        this.setLastMove = function (square) {
            const lastMoveElement = document.createElementNS(SVGNS, 'rect');
            lastMoveElement.setAttribute('x', '0');
            lastMoveElement.setAttribute('y', '0');
            lastMoveElement.setAttribute('width', String(this.squareDim));
            lastMoveElement.setAttribute('height', String(this.squareDim));
            lastMoveElement.setAttribute('fill', LAST_MOVE_COLOR);
            lastMoveElement.setAttribute('fill-opacity', '20%');
            lastMoveElement.setAttribute('class', 'last-move dynamic');
            square.appendChild(lastMoveElement);
        };
        this.setFrozen = function (square) {
            const frozen = document.createElementNS(SVGNS, 'image');
            const frozenDim = this.squareDim * (3.0 / 7.0);
            const x = (this.squareDim - frozenDim) / 2.0;
            const y = x;
            square.appendChild(frozen);
            frozen.setAttribute('x', String(x));
            frozen.setAttribute('y', String(y));
            frozen.setAttribute('height', String(frozenDim));
            frozen.setAttribute('width', String(frozenDim));
            frozen.setAttribute('href', FROZEN_SQUARE_IMAGE);
            frozen.setAttribute('stroke', "Red");
        };
        this.updateSideIndicators = function () {
            if (this.board.southIndicator && this.board.northIndicator) {
                let sideText;
                sideText = 'S';
                if (this.game.position.side === SOUTH) {
                    sideText += "*";
                }
                this.board.southIndicator.textContent = sideText;
                sideText = 'N';
                if (this.game.position.side === NORTH) {
                    sideText += "*";
                }
                this.board.northIndicator.textContent = sideText;
            }
        };
        this.updateBoard = function () {
            const position = this.game.position;
            const svg = this.get('board', 'svg');
            if (!svg)
                return;
            this.updateSideIndicators();
            for (let rank = 0; rank < position.ranks; rank++) {
                for (let file = 0; file < position.files; file++) {
                    const index = fr(position.files, file, rank);
                    const square = this.board.squares[index];
                    const piece = position.squares[index].piece;
                    const dynamicElements = square.querySelectorAll('.dynamic');
                    for (const element of dynamicElements) {
                        element.remove();
                    }
                    const lastMove = this.game.history.value.move;
                    if (lastMove) {
                        if ((file === lastMove.fromFile && rank === lastMove.fromRank) ||
                            (file === lastMove.toFile && rank === lastMove.toRank)) {
                            this.setLastMove(square);
                        }
                    }
                    if ((piece[0] | piece[1]) > 0) {
                        this.placePiece(square, piece);
                        const points = position.squares[index].points;
                        if ((piece[0] && points[0]) || (piece[1] && points[1]) &&
                            this.game.position.frozen) {
                            this.setFrozen(square);
                        }
                    }
                }
            }
        };
        this.reasonText = function (reason, ply) {
            switch (reason) {
                case GameOverReason.Agreement:
                    return "Draw agreed";
                case GameOverReason.NoMoves:
                    return "No moves possible";
                case GameOverReason.PlyWithoutPoints:
                    return `No points scored for ${ply} ply`;
                case GameOverReason.PointsScored:
                    return "Winning points scored";
                default:
                    return "";
            }
        };
        this.updateScoreboard = function () {
            if (this.info.scoreboard) {
                const resultDiv = this.info.scoreboard.querySelector('div.result');
                if (resultDiv) {
                    switch (this.game.position.gameStatus) {
                        case GameStatus.Tie:
                            resultDiv.textContent = "Game tied: " +
                                this.reasonText(this.game.position.gameOverReason, this.game.position.plyTillEnd);
                            break;
                        case GameStatus.North:
                            resultDiv.textContent = "North wins: " +
                                this.reasonText(this.game.position.gameOverReason, this.game.position.plyTillEnd);
                            ;
                            break;
                        case GameStatus.South:
                            resultDiv.textContent = "South wins: " +
                                this.reasonText(this.game.position.gameOverReason, this.game.position.plyTillEnd);
                            ;
                            break;
                    }
                }
                const plyLeft = this.info.scoreboard.querySelector('div.ply-left');
                if (plyLeft) {
                    plyLeft.textContent = "Ply till result:" +
                        (this.game.position.plyTillEnd - (this.game.position.ply - this.game.position.plyLastPoints));
                }
                const scoreDiv = this.info.scoreboard.querySelector('div.score');
                if (scoreDiv) {
                    const southScore = this.game.position.score[SI(SOUTH)];
                    const northScore = this.game.position.score[SI(NORTH)];
                    const southToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - southScore);
                    const northToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - northScore);
                    const northDiv = scoreDiv.querySelector('div.north-score');
                    if (northDiv) {
                        northDiv.textContent = "North score: " + String(northScore) + " To win: " + String(northToWin);
                    }
                    const southDiv = scoreDiv.querySelector('div.south-score');
                    if (southDiv) {
                        southDiv.textContent = "South score: " + String(southScore) + " To win: " + String(southToWin);
                    }
                }
            }
        };
        this.updatePositionString = function () {
            if (this.info.positionString) {
                this.info.positionString.setAttribute('value', positionToString(this.game.position));
            }
        };
        this.updateRecord = function () {
            if (this.info.record) {
                this.info.record.innerHTML = "";
                this.game.history.head().traverse((position) => {
                    const elem = document.createElement('a');
                    elem.setAttribute('href', '#');
                    let text;
                    if (position.move) {
                        if (position.side === NORTH) {
                            text = String(1 + Math.floor(position.ply / 2)) + ' ' +
                                toString(position.move);
                            elem.setAttribute('class', 'south');
                        }
                        else {
                            text = toString(position.move);
                            elem.setAttribute('class', 'north');
                        }
                        elem.textContent = text;
                        this.info.record.appendChild(elem);
                    }
                });
            }
        };
        this.clearMessage = function () {
            if (this.info.message) {
                this.info.message.textContent = "";
            }
        };
        this.updateAll = function () {
            this.updateBoard();
            this.updateScoreboard();
            this.updatePositionString();
            this.updateRecord();
            this.clearMessage();
        };
        this.setMessage = function (msg, seconds = 0) {
            if (this.info.message) {
                this.info.message.textContent = msg;
                if (seconds) {
                    setTimeout(() => {
                        this.clearMessage();
                    }, seconds);
                }
            }
        };
        this.selectPieceMoves = function (file, rank) {
            const pieceMoves = [];
            for (const move of this.game.position.moves) {
                if (move.fromFile === file && move.fromRank === rank) {
                    pieceMoves.push(move);
                }
            }
            return pieceMoves;
        };
        this.setSelectedSquare = function (file, rank) {
            const square = this.board.squares[fr(this.game.position.files, file, rank)];
            if (square) {
                const selectedElement = document.createElementNS(SVGNS, 'rect');
                selectedElement.setAttribute('x', '0');
                selectedElement.setAttribute('y', '0');
                selectedElement.setAttribute('width', String(this.squareDim));
                selectedElement.setAttribute('height', String(this.squareDim));
                selectedElement.setAttribute('fill', SELECTED_SQUARE_COLOR);
                selectedElement.setAttribute('fill-opacity', '20%');
                selectedElement.setAttribute('class', 'selected-square dynamic');
                square.appendChild(selectedElement);
            }
        };
        this.setTracerOn = function (file, rank) {
            const moves = this.selectPieceMoves(file, rank);
            for (const move of moves) {
                const toFile = move.toFile;
                const toRank = move.toRank;
                const index = fr(this.game.position.files, toFile, toRank);
                const toSquare = this.board.squares[index];
                const tracerElement = document.createElementNS(SVGNS, 'circle');
                const r = this.squareDim / 8;
                const cx = this.squareDim / 2;
                const cy = this.squareDim / 2;
                tracerElement.setAttribute('cx', String(cx));
                tracerElement.setAttribute('cy', String(cy));
                tracerElement.setAttribute('r', String(r));
                tracerElement.setAttribute('fill', TRACER_COLOR);
                tracerElement.setAttribute('fill-opacity', '30%');
                tracerElement.setAttribute('class', 'tracer dynamic');
                toSquare.appendChild(tracerElement);
            }
        };
        this.selectPiece = function (square, file, rank) {
            square.setAttribute('fill', SELECTED_SQUARE);
            this.selectedPiece = [file, rank];
            this.setSelectedSquare(file, rank);
            this.setTracerOn(file, rank);
        };
        this.movePiece = function (file, rank) {
            if (this.selectedPiece === null)
                return false;
            const move = {
                fromFile: this.selectedPiece[0],
                fromRank: this.selectedPiece[1],
                toFile: file,
                toRank: rank,
            };
            try {
                gameMove(this.game, move);
            }
            catch (err) {
                return false;
            }
            return true;
        };
        this.updateBasedOnState = function (square, file, rank) {
            switch (this.gameUXState) {
                case 1 /* GameUXState.WaitingOtherPlayer */:
                case 0 /* GameUXState.WaitingUser */:
                    if (square) {
                        this.selectPiece(square, file, rank);
                        this.gameUXState = 2 /* GameUXState.PieceSelected */;
                    }
                    break;
                case 2 /* GameUXState.PieceSelected */:
                    if (this.movePiece(file, rank) === true) {
                        this.gameUXState = 1 /* GameUXState.WaitingOtherPlayer */;
                    }
                    else {
                        this.gameUXState = 0 /* GameUXState.WaitingUser */;
                    }
                    this.updateAll();
                    break;
                case 3 /* GameUXState.GameOver */:
                default:
                    break;
            }
        };
        this.getSquare = function (x, y) {
            for (const square of this.board.squares) {
                const rect = square.getBoundingClientRect();
                if (rect.left <= x && rect.top <= y &&
                    rect.right >= x && rect.bottom >= y) {
                    return square;
                }
            }
            return null;
        };
        this.redrawBoard = function (squareDim = 0) {
            this.setupBoard(squareDim);
            this.updateBoard();
        };
        this.setupEvents = function () {
            const gameUX = this;
            this.setupBoardEvents();
            if (this.info.flip) {
                this.info.flip.addEventListener('click', function (e) {
                    e.preventDefault();
                    gameUX.board.onTop = (gameUX.board.onTop === SOUTH) ? NORTH : SOUTH;
                    gameUX.redrawBoard();
                });
            }
        };
        this.divID = divID;
        const mainDiv = document.querySelector('div#' + divID);
        if (mainDiv === null) {
            throw `Element ${divID} does not exist.`;
        }
        this.div = mainDiv;
        this.options = options;
        this.initialize(options);
    }
    setupBoardEvents() {
        const gameUX = this;
        const svg = this.get('board', 'svg');
        if (!svg)
            return;
        window.onresize = function () {
            gameUX.initialize(gameUX.options);
        };
        let squareDown = null;
        let rovingPiece = null;
        svg.addEventListener('mousedown', function (e) {
            e.preventDefault();
            const square = gameUX.getSquare(e.clientX, e.clientY);
            if (square) {
                const file = Number(square.dataset.file);
                const rank = Number(square.dataset.rank);
                gameUX.updateBasedOnState(square, file, rank);
                if (gameUX.gameUXState === 0 /* GameUXState.WaitingUser */ &&
                    squareDown !== square) {
                    gameUX.updateBasedOnState(square, file, rank);
                }
                squareDown = square;
            }
            if (rovingPiece === null && squareDown) {
                const pieceElement = squareDown.querySelector('.piece');
                if (pieceElement) {
                    rovingPiece = document.createElementNS(SVGNS, 'image');
                    rovingPiece.setAttribute('width', String(pieceElement.getAttribute('width')));
                    rovingPiece.setAttribute('height', String(pieceElement.getAttribute('height')));
                    rovingPiece.setAttribute('href', String(pieceElement.getAttribute('href')));
                    rovingPiece.style.visibility = "hidden";
                    rovingPiece.style.opacity = "50%";
                    svg.appendChild(rovingPiece);
                }
            }
        });
        svg.addEventListener('mouseup', function (e) {
            e.preventDefault();
            const square = gameUX.getSquare(e.clientX, e.clientY);
            if (square) {
                const file = Number(square.dataset.file);
                const rank = Number(square.dataset.rank);
                if (squareDown !== square) {
                    gameUX.updateBasedOnState(square, file, rank);
                    squareDown = null;
                }
            }
            rovingPiece?.remove();
            rovingPiece = null;
        });
        svg.addEventListener('mousemove', function (e) {
            e.preventDefault();
            if (rovingPiece) {
                const width = Number(rovingPiece.getAttribute('width'));
                const height = Number(rovingPiece.getAttribute('height'));
                const x = e.offsetX - width / 2.0;
                const y = e.offsetY - height / 2.0;
                rovingPiece.setAttribute('x', String(x));
                rovingPiece.setAttribute('y', String(y));
                rovingPiece.style.visibility = "visible";
            }
        });
    }
}
