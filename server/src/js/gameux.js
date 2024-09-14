import { ROOK, BISHOP, SOUTH, NORTH, fr, SI, toString, GameStatus, newGameWithMoves, loadPosition, move as gameMove, DEFAULT_POSITION_STRING, positionToString, } from "./game.js";
// Global constants
const SVGNS = "http://www.w3.org/2000/svg";
// COLORS
const EVEN_SQUARE = 'LightGray';
const ODD_SQUARE = 'SlateGray';
const SELECTED_SQUARE = 'DarkCyan';
const TRACER_COLOR = 'DarkSlateBlue';
const LAST_MOVE_COLOR = 'Yellow';
const POINTS_SOUTH = 'DarkRed';
const POINTS_NORTH = '#145a32';
const SOUTH_ROOK_IMAGE = '/images/Chess_rlt45.svg';
const SOUTH_BISHOP_IMAGE = '/images/Chess_blt45.svg';
const NORTH_ROOK_IMAGE = '/images/Chess_rdt45.svg';
const NORTH_BISHOP_IMAGE = '/images/Chess_bdt45.svg';
const BLOCKED_SQUARE_IMAGE = '/images/cross-svgrepo-com.svg';
const FROZEN_SQUARE_IMAGE = '/images/cross-frozen.svg';
const DIV_X_MARGIN = 150;
const DIV_Y_MARGIN = 150;
// Types and enums
var GameUXState;
(function (GameUXState) {
    GameUXState[GameUXState["WaitingUser"] = 0] = "WaitingUser";
    GameUXState[GameUXState["WaitingOtherPlayer"] = 1] = "WaitingOtherPlayer";
    GameUXState[GameUXState["PieceSelected"] = 2] = "PieceSelected";
    GameUXState[GameUXState["GameOver"] = 3] = "GameOver";
})(GameUXState || (GameUXState = {}));
;
const DEFAULT_OPTIONS = {
    startPosition: DEFAULT_POSITION_STRING,
    boardOnly: false,
};
export class GameUX {
    constructor(divID, options = DEFAULT_OPTIONS) {
        this.gameUXState = GameUXState.WaitingUser;
        this.selectedPiece = null;
        this.board = {
            svg: null,
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
        };
        this.initialize = function (options) {
            this.div.innerHTML = "";
            this.divWidth = this.div.offsetWidth;
            this.divHeight = this.div.offsetHeight;
            if (this.game === undefined) {
                this.game = newGameWithMoves(loadPosition(options.startPosition));
            }
            if (options.boardOnly === true) {
                this.setupBoard();
            }
            else {
                // Draw static elements
                this.setupGame();
                // Set events
                this.setEvents();
                this.updateAll();
            }
        };
        this.calcSquareDim = function (width, height, files, ranks) {
            const dimWidth = (width - DIV_X_MARGIN) / files;
            const dimHeight = (height - DIV_Y_MARGIN) / ranks;
            return Math.min(dimWidth, dimHeight);
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
            else {
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
            if (this.board.svg) {
                this.board.svg.appendChild(group);
            }
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
            this.board.svg.appendChild(group);
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
            this.board.southIndicator.style.fontSize = 'x-small';
            this.board.northIndicator.style.fontSize = 'x-small';
            if (this.board.onTop === NORTH) {
                this.setupSideIndicator(group, this.board.southIndicator, this.game.position.files * this.squareDim + 5, this.game.position.ranks * this.squareDim);
                this.setupSideIndicator(group, this.board.northIndicator, this.game.position.files * this.squareDim + 5, 12);
            }
            else {
                this.setupSideIndicator(group, this.board.northIndicator, this.game.position.files * this.squareDim + 5, this.game.position.ranks * this.squareDim);
                this.setupSideIndicator(group, this.board.southIndicator, this.game.position.files * this.squareDim + 5, 12);
            }
            this.board.svg.appendChild(group);
        };
        this.setupBoard = function () {
            this.board.svg = document.createElementNS(SVGNS, 'svg');
            const svg = this.board.svg;
            let dim;
            dim = Math.min(this.divWidth / 2.0, this.divHeight);
            svg.setAttribute('width', String(dim));
            svg.setAttribute('height', String(dim));
            const position = this.game.position;
            this.squareDim = this.calcSquareDim(this.divWidth, this.divHeight, position.files, position.ranks);
            this.board.squares = [];
            for (let rank = 0; rank < position.ranks; rank++) {
                for (let file = 0; file < position.files; file++) {
                    const square = this.setupSquare(file, rank);
                    this.board.squares.push(square);
                    this.board.svg.appendChild(square);
                }
            }
            this.div.appendChild(svg);
            this.setupBars();
            this.setupSideIndicators();
        };
        // To do
        this.setupClock = function () {
            const clock = document.createElement('div');
            clock.textContent = "PLACEHOLDER FOR CLOCK";
            clock.setAttribute('class', 'clock');
            this.info.clock = clock;
            this.info.div.appendChild(clock);
        };
        this.setupUserActions = function () {
            const flip = document.createElement('button');
            flip.textContent = "Flip board";
            flip.setAttribute('class', 'button flip-button');
            this.info.div.appendChild(flip);
            this.info.flip = flip;
            const offerDraw = document.createElement('button');
            offerDraw.textContent = "Offer draw";
            offerDraw.setAttribute('class', 'button offer-draw-button');
            this.info.div.appendChild(offerDraw);
            this.info.offerDraw = offerDraw;
            const resign = document.createElement('button');
            resign.setAttribute('class', 'button resign-button');
            resign.textContent = 'Resign';
            this.info.div.appendChild(resign);
            this.info.resign = resign;
        };
        this.setupScoreboard = function () {
            const scoreboard = document.createElement('div');
            scoreboard.setAttribute('class', 'scoreboard');
            this.info.scoreboard = scoreboard;
            this.info.div.appendChild(scoreboard);
        };
        this.setupRecord = function () {
            const record = document.createElement('div');
            record.setAttribute('class', 'record');
            this.info.record = record;
            this.info.div.appendChild(record);
        };
        this.setupPositionString = function () {
            const positionString = document.createElement('input');
            positionString.setAttribute('class', 'position-string-holder');
            this.info.positionString = positionString;
            this.info.div.appendChild(positionString);
        };
        this.setupInfo = function () {
            // Result if this.game over
            // Clock
            // To play
            // To play: South
            // Points: South: 9/18 (3 more to win) North 9
            // Draw offer
            // Resign
            // Move history
            //
            const infoDiv = document.createElement('div');
            infoDiv.style.marginTop = String(DIV_X_MARGIN / 2.0) + "px";
            infoDiv.style.marginBottom = String(DIV_X_MARGIN / 2.0) + "px";
            infoDiv.style.padding = "12px";
            this.div.appendChild(infoDiv);
            this.info.div = infoDiv;
            this.setupClock();
            this.setupUserActions();
            this.setupScoreboard();
            this.setupPositionString();
            this.setupRecord();
        };
        this.setupGame = function () {
            this.setupBoard();
            this.setupInfo();
        };
        this.placePiece = function (square, piece) {
            const pieceElement = document.createElementNS(SVGNS, 'image');
            const pieceDim = this.squareDim * (3.0 / 4.0);
            const x = (this.squareDim - pieceDim) / 2.0;
            const y = x;
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
        };
        this.updateBoard = function () {
            const position = this.game.position;
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
        this.updateScoreboard = function () {
            let text = "";
            switch (this.game.position.gameStatus) {
                case GameStatus.Tie:
                    text += "Game drawn\n";
                    break;
                case GameStatus.North:
                    text += "North wins\n";
                    break;
                case GameStatus.South:
                    text += "South wins\n";
                    break;
            }
            const southScore = this.game.position.score[SI(SOUTH)];
            const northScore = this.game.position.score[SI(NORTH)];
            const southToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - southScore);
            const northToWin = Math.max(0, this.game.position.winScore[SI(SOUTH)] - northScore);
            text += "South score: " + String(southScore) + " To win: " + String(southToWin) + "\r\n";
            text += "North score: " + String(northScore) + " To win: " + String(northToWin) + "\r\n";
            this.info.scoreboard.textContent = text;
        };
        this.updatePositionString = function () {
            this.info.positionString?.setAttribute('value', positionToString(this.game.position));
        };
        this.updateRecord = function () {
            let text = "";
            const node = this.game.history.head();
            node.traverse((positionMove, location) => {
                const move = positionMove.move;
                if (move) {
                    if (positionMove.position.side === NORTH) {
                        text += String(Math.floor(location[location.length - 1] / 2) + 1) + ". ";
                    }
                    text += toString(move);
                    if (positionMove.position.side === SOUTH) {
                        text += '\r\n';
                    }
                    else {
                        text += " ";
                    }
                }
            });
            this.info.record.textContent = text;
        };
        this.updateAll = function () {
            this.updateBoard();
            this.updateScoreboard();
            this.updatePositionString();
            this.updateRecord();
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
                // Temporary measure until 2-player-mode working
                case GameUXState.WaitingOtherPlayer:
                case GameUXState.WaitingUser:
                    this.selectPiece(square, file, rank);
                    this.gameUXState = GameUXState.PieceSelected;
                    break;
                case GameUXState.PieceSelected:
                    if (this.movePiece(file, rank) === true) {
                        this.gameUXState = GameUXState.WaitingOtherPlayer;
                    }
                    else {
                        this.gameUXState = GameUXState.WaitingUser;
                    }
                    this.updateAll();
                    break;
                case GameUXState.GameOver:
                default:
                    break;
            }
        };
        this.setEvents = function () {
            const gameUX = this;
            window.onresize = function () {
                gameUX.initialize(gameUX.options);
            };
            const position = this.game.position;
            for (let rank = 0; rank < position.ranks; rank++) {
                for (let file = 0; file < position.files; file++) {
                    const index = fr(position.files, file, rank);
                    const square = this.board.squares[index];
                    square.addEventListener('click', function () {
                        gameUX.updateBasedOnState(square, file, rank);
                    });
                }
            }
            this.info.flip.addEventListener('click', function () {
                gameUX.board.onTop = (gameUX.board.onTop === SOUTH) ? NORTH : SOUTH;
                gameUX.initialize(gameUX.options);
            });
        };
        this.divID = divID;
        const mainDiv = document.getElementById(divID);
        if (mainDiv === null) {
            throw `Element ${divID} does not exist.`;
        }
        this.div = mainDiv;
        this.options = options;
        this.initialize(options);
    }
}
