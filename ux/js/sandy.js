"use strict";

const ROOK = 16;
const BISHOP = 32;
const SOUTH = 1;
const NORTH = 4;
const SIDES = [SOUTH, NORTH];
const SOUTH_ROOK = SOUTH | ROOK;
const SOUTH_BISHOP = SOUTH | BISHOP;
const NORTH_ROOK = NORTH | ROOK;
const NORTH_BISHOP = NORTH | BISHOP;
const BLOCK = 64;
const SOUTH_BLOCK = SOUTH | BLOCK;
const NORTH_BLOCK = NORTH | BLOCK;
const SOUTH_NORTH_BLOCK = SOUTH_BLOCK | NORTH_BLOCK;
const SVGNS = "http://www.w3.org/2000/svg";
const SQUARE_LIGHT = "LightGray";
const SQUARE_DARK = "DarkGray";
const SQUARE_LIGHT_MOVED = "#ffffe6";
const SQUARE_DARK_MOVED = "#ffffb3";
const SQUARE_LIGHT_SCORED = '#444';
const SQUARE_DARK_SCORED = '#444';
const SQUARE_SOUTH_SCORE = 'Red';
const SQUARE_NORTH_SCORE = 'Green';

const NOT_ENDED = 0;
const DRAW = SOUTH | NORTH;
const SOUTH_WINS = SOUTH;
const NORTH_WINS = NORTH;

function defaultBoard() {
        const scores = new Map();
        scores.set(SOUTH, [
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 3, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 2, 1, 3, 2, 1, 3, 0,
        ]);
        scores.set(NORTH, [
                0, 3, 2, 1, 3, 2, 1, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 3, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]);
        const winningScores = new Map();
        winningScores.set(SOUTH, 10);
        winningScores.set(NORTH, 10);
        const currentScores = new Map();
        currentScores.set(SOUTH, 0);
        currentScores.set(NORTH, 0);
        const possibleScores = new Map();
        possibleScores.set(SOUTH, 0);
        possibleScores.set(NORTH, 0);

        return {
                files: 9,
                ranks: 9,
                squares: [
                        SOUTH_ROOK, SOUTH_ROOK, SOUTH_BISHOP, SOUTH_ROOK, SOUTH_ROOK, SOUTH_ROOK, SOUTH_BISHOP, SOUTH_ROOK, SOUTH_ROOK,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        NORTH_ROOK, NORTH_ROOK, NORTH_BISHOP, NORTH_ROOK, NORTH_ROOK, NORTH_ROOK, NORTH_BISHOP, NORTH_ROOK, NORTH_ROOK,
                ],
                blocks: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, SOUTH_NORTH_BLOCK, 0, 0, 0, 0, 0, SOUTH_NORTH_BLOCK, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, SOUTH_NORTH_BLOCK, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, SOUTH_NORTH_BLOCK, 0, 0, 0, 0, 0, SOUTH_NORTH_BLOCK, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                scores: scores,
                winningScores: winningScores,
                currentScores: currentScores,
                possibleScores: possibleScores,
                side: SOUTH,
                ply: 0,
                ended: false,
                ending: false,
                moves: [],
                history: [],
                gameEnded: NOT_ENDED,
                gui: {
                        selected: [-1],
                        originalColor: undefined,
                        destinations: [],
                        squareDim: undefined,
                        squareFrom: undefined,
                        squareTo: undefined,
                        squares: [],
                },
        };
}

function fr(board, file, rank) {
        return board.files * rank + file;
}

function invFr(board, square) {
        const file = square % board.files;
        const rank = Math.floor(square / board.files);
        return [file, rank];
}

function toUserNotation(file, rank) {
        return [String.fromCharCode(file + 97), rank + 1];
}

function fromUserNotation(file, rank) {
        return [file.charCodeAt(0) - 97, rank.toNumber() - 2];
}

function showDestination(board, i) {
        let elem = document.getElementById(board.gui.id + 'square-' + i);
        const box = elem.getClientRects()[0];
        let r = box.width / 6.0;
        let cx = box.width / 2.0;
        let cy = box.height / 2.0;
        let circle = document.createElementNS(SVGNS, 'circle');
        circle.setAttribute('r', r);
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('fill', 'purple');
        circle.id = board.gui.id + "destination-" + i;
        elem.appendChild(circle);
        board.gui.destinations.push(i);
}

function selectPiece(board, i) {
        for (const move of board.moves) {
                if (move[0] == i) {
                        showDestination(board, move[1]);
                }
        }
        if (board.gui.destinations.length > 0) {
                let elem = document.getElementById(board.gui.id + 'rect-' + i);
                board.gui.selected = i;
                board.gui.originalColor = elem.getAttribute('fill');
                elem.setAttribute('fill', 'SlateGray');
        }
}

function removeDestination(board, i) {
        let elem = document.getElementById(board.gui.id + "destination-" + i);
        elem.remove();
}

function deselectPiece(board) {
        let elem = document.getElementById(board.gui.id + 'rect-' + board.gui.selected);
        elem.setAttribute('fill', board.gui.originalColor);
        board.gui.selected = -1;
        for (const destination of board.gui.destinations) {
                removeDestination(board, destination);
        }
        board.gui.destinations = [];
}

function drawSides(board) {
        let div = board.gui.elems.divSouthSide;
        let content =
                "South | Scored: " + board.currentScores.get(SOUTH) +
                ". Left: " + (board.possibleScores.get(SOUTH) - board.currentScores.get(SOUTH)) +
                ". Win: " + board.winningScores.get(SOUTH) + ". ";
        if (board.side == SOUTH) {
                content += "* "
        }
        div.textContent = content;
        div = board.gui.elems.divNorthSide;
        content =
                "North | Scored: " + board.currentScores.get(NORTH) +
                ". Left: " + (board.possibleScores.get(NORTH) - board.currentScores.get(NORTH)) +
                ". Win: " + board.winningScores.get(NORTH) + ". ";
        if (board.side == NORTH) {
                content += "* "
        }
        div.textContent = content;
}

function drawGameEnded(board) {
        if (board.gameEnded == SOUTH_WINS) {
                board.gui.elems.divGameInfo.textContent = "South wins.";
        } else if (board.gameEnded == NORTH_WINS) {
                board.gui.elems.divGameInfo.textContent = "North wins.";
        } else if (board.gameEnded == DRAW) {
                board.gui.elems.divGameInfo.textContent = "Game tied.";
        }
}

function reverseMovePieceBoard(board) {
        if (board.history.length > 0) {
                // Execute first part of movePieceBoard in reverse
                if (board.side == SOUTH) {
                        board.side = NORTH;
                } else {
                        board.side = SOUTH;
                }
                board.ply -= 1;
                const [from, to] = board.history.pop();
                board.blocks[to] = 0;
                board.squares[from] = board.squares[to];
                board.squares[to] = 0;
                // This must be executed in the same order as movePieceBoard
                getMoves(board);
                calcScores(board);
                board.gameEnded = checkGameEnded(board);
        }
}

function movePieceBoard(board, from, to) {
        board.squares[to] = board.squares[from];
        board.squares[from] = 0;
        if (board.scores.get(board.side)[to] > 0) {
                board.blocks[to] = SOUTH_NORTH_BLOCK;
        }
        board.history.push([from, to]);
        board.ply += 1;
        if (board.side == SOUTH) {
                board.side = NORTH;
        } else {
                board.side = SOUTH;
        }
        getMoves(board);
        calcScores(board);
        board.gameEnded = checkGameEnded(board);
}

function drawRecord(board, from, to) {
        let [from_file, from_rank] = invFr(board, from);
        let [to_file, to_rank] = invFr(board, to);
        [from_file, from_rank] = toUserNotation(from_file, from_rank);
        [to_file, to_rank] = toUserNotation(to_file, to_rank);
        const move = document.createElement('span');
        move.setAttribute('data-ply', board.ply);
        move.setAttribute('data-move-from', from);
        move.setAttribute('data-move-to', to);
        if (board.ply % 2 == 0) {
                move.setAttribute('class', 'sandy-move-south');
                move.textContent = (board.ply / 2 + 1) + ".";
        } else {
                move.setAttribute('class', 'sandy-move-north');
        }
        move.textContent += from_file + from_rank + '-' + to_file + to_rank;
        board.gui.elems.divRecord.appendChild(move);
}

function movePieceGuiBefore(board, from, to) {
        const squareFrom = document.getElementById(board.gui.id + 'square-' + from);
        const squareTo = document.getElementById(board.gui.id + 'square-' + to);
        if (board.gui.squareFrom) {
                clearPreviousMoveSquare(board.gui.squareFrom);
        }
        if (board.gui.squareTo && board.gui.scoredOnPreviousMove === false) {
                clearPreviousMoveSquare(board.gui.squareTo);
        }
        drawMove(board, squareFrom, squareTo);
        if (board.scores.get(board.side)[to] > 0) {
                drawScoredSquare(squareTo);
                board.gui.scoredOnPreviousMove = true;
        } else {
                board.gui.scoredOnPreviousMove = false;
        }
        drawRecord(board, from, to);
}

function movePieceGuiAfter(board) {
        if (board.gameEnded) {
                drawGameEnded(board);
        }
        setPossibleScores(board);
        drawSides(board);
}

function movePiece(board, from, to) {
        movePieceGuiBefore(board, from, to);
        movePieceBoard(board, from, to);
        movePieceGuiAfter(board);
        // board.squares[to] = board.squares[from];
        // board.squares[from] = 0;
        // const squareFrom = document.getElementById(board.gui.id + 'square-' + from);
        // const squareTo = document.getElementById(board.gui.id + 'square-' + to);
        // if (board.gui.squareFrom) {
        //         clearPreviousMoveSquare(board.gui.squareFrom);
        // }
        // if (board.gui.squareTo && board.gui.scoredOnPreviousMove === false) {
        //         clearPreviousMoveSquare(board.gui.squareFrom);
        // }
        // drawMove(board, squareFrom, squareTo);
        // if (board.scores.get(board.side)[to] > 0) {
        //         drawScoredSquare(squareTo);
        //         board.blocks[to] = SOUTH_NORTH_BLOCK;
        //         board.gui.scoredOnPreviousMove = true;
        // } else {
        //         board.gui.scoredOnPreviousMove = false;
        // }
        // board.ply += 1;
        // if (board.side == SOUTH) {
        //         board.side = NORTH;
        // } else {
        //         board.side = SOUTH;
        // }
        // getMoves(board);
        // calcScores(board);
        // board.gameEnded = checkGameEnded(board);
        // if (board.gameEnded) {
        //         drawGameEnded(board);
        // }
        // setPossibleScores(board);
        // drawSides(board);
}

function calcSquareDim(svg, board) {
        const box = svg.getClientRects()[0];
        let width = (box.width - 40.0) / board.files;
        let height = (box.height - 40.0) / board.ranks;
        return Math.min(width, height);
}

function drawHorizontalBar(svg, board) {
        let group = document.createElementNS(SVGNS, 'g');
        let rect = document.createElementNS(SVGNS, 'rect');
        rect.id = board.gui.id + '-horizontal';
        rect.setAttribute('x', 0);
        rect.setAttribute('y', board.gui.squareDim * board.ranks);
        rect.setAttribute('width', board.gui.squareDim * board.files);
        rect.setAttribute('height', 30.0);
        rect.setAttribute('fill', 'none');
        svg.appendChild(group);
        group.appendChild(rect);
        return group;
}

function drawVerticalBar(svg, board) {
        let group = document.createElementNS(SVGNS, 'g');
        let rect = document.createElementNS(SVGNS, 'rect');
        rect.id = board.gui.id + '-vertical';
        rect.setAttribute('x', board.gui.squareDim * board.ranks);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', 30.0);
        rect.setAttribute('height', board.gui.squareDim * board.ranks);
        rect.setAttribute('fill', 'none');
        svg.appendChild(group);
        group.appendChild(rect);
        return group;
}

function drawSquare(svg, board, file, rank) {
        const idx = fr(board, file, rank);
        let square = document.createElementNS(SVGNS, 'svg');
        board.gui.squares.push(square);
        square.id = board.gui.id + "square-" + idx;
        let rect = document.createElementNS(SVGNS, 'rect');
        rect.id = board.gui.id + "rect-" + idx;
        const x = file * board.gui.squareDim;
        const y = (board.ranks - rank - 1) * board.gui.squareDim;

        square.setAttribute('x', x);
        square.setAttribute('y', y);
        square.setAttribute('height', board.gui.squareDim);
        square.setAttribute('width', board.gui.squareDim);
        rect.setAttribute('x', 0);
        rect.setAttribute('y', 0);
        rect.setAttribute('height', board.gui.squareDim);
        rect.setAttribute('width', board.gui.squareDim);
        let squareColor;
        if (file % 2 == 0) {
                if (rank % 2 == 0) {
                        squareColor = SQUARE_LIGHT;
                        rect.classList.add('light');
                } else {
                        squareColor = SQUARE_DARK;
                        rect.classList.add('dark');
                }
        } else {
                if (rank % 2 == 0) {
                        squareColor = SQUARE_DARK;
                        rect.classList.add('dark');
                } else {
                        squareColor = SQUARE_LIGHT;
                        rect.classList.add('light');
                }
        }
        rect.setAttribute('fill', squareColor);

        square.addEventListener("click", function() {
                if (board.gameEnded == NOT_ENDED) {
                        if (board.gui.selected < 0) {
                                const piece = board.squares[idx];
                                if (piece > 0 && (piece & board.side)) {
                                        selectPiece(board, idx);
                                }
                        } else if (board.gui.destinations.includes(idx)) {
                                const from = board.gui.selected;
                                deselectPiece(board);
                                movePiece(board, from, idx);
                        } else {
                                deselectPiece(board);
                        }
                }
        });
        svg.appendChild(square);
        square.appendChild(rect);
        return square;
}

function drawPiece(group, square, idx) {
        let piece = document.createElementNS(SVGNS, 'image');
        const box = group.getClientRects()[0];
        const width = box.width / (4 / 3);
        const height = box.height / (4 / 3);
        const x = (box.width - width) / 2.0;
        const y = (box.height - height) / 2.0;
        piece.id = board.gui.id + "piece-" + idx;
        piece.setAttribute('x', x);
        piece.setAttribute('y', y);
        piece.setAttribute('width', width);
        piece.setAttribute('height', height);
        if (square & SOUTH) {
                if (square & ROOK) {
                        piece.setAttribute('href', '../images/Chess_rlt45.svg');
                } else {
                        piece.setAttribute('href', '../images/Chess_blt45.svg');
                }
        } else {
                if (square & ROOK) {
                        piece.setAttribute('href', '../images/Chess_rdt45.svg');
                } else {
                        piece.setAttribute('href', '../images/Chess_bdt45.svg');
                }
        }
        group.append(piece);
}

function drawBlock(group, blockVal) {
        let file = '../images/cross-svgrepo-com.svg';
        let block = document.createElementNS(SVGNS, 'image');
        block.setAttribute('href', file);
        const box = group.getClientRects()[0];
        block.setAttribute('width', box.width);
        if ((blockVal & SOUTH) && (blockVal & NORTH)) {
                block.setAttribute('x', 0);
                block.setAttribute('y', 0);
        } else if (blockVal & SOUTH) {
                block.setAttribute('height', box.height / 2.0);
                block.setAttribute('x', 0);
                block.setAttribute('y', box.height / 2.0);
        } else if (blockVal & NORTH) {
                block.setAttribute('height', box.height / 2.0);
                block.setAttribute('x', 0);
                block.setAttribute('y', 0);
        }
        group.append(block);
}

function drawScore(group, side, scoreVal) {
        let score = document.createElementNS(SVGNS, 'text');
        score.textContent = scoreVal;
        const box = group.getClientRects()[0];
        score.setAttribute('x', box.width / 2);
        if (side == SOUTH) {
                score.setAttribute('y', box.height - 2);
                score.setAttribute('fill', SQUARE_SOUTH_SCORE);
        } else if (side == NORTH) {
                score.setAttribute('y', 9)
                score.setAttribute('fill', SQUARE_NORTH_SCORE);
        }
        score.style.fontSize = 'x-small';
        group.append(score);
}


function drawFileNotation(group, board, n) {
        let file = document.createElementNS(SVGNS, 'text');
        const start = 97; // UTF-16 for 'a'
        file.textContent = String.fromCharCode(start + n);
        file.setAttribute('x', n * board.gui.squareDim +
                0.5 * board.gui.squareDim);
        file.setAttribute('y', board.ranks * board.gui.squareDim + 15);
        file.style.fontSize = 'small';
        group.append(file);
}

function drawRankNotation(group, board, n) {
        let file = document.createElementNS(SVGNS, 'text');
        file.textContent = board.ranks - n;
        file.setAttribute('y', n * board.gui.squareDim +
                0.5 * board.gui.squareDim);
        file.setAttribute('x', board.files * board.gui.squareDim + 5);
        file.style.fontSize = 'small';
        group.append(file);
}

function createGUI(topDiv, board) {
        board.gui.elems = {};
        topDiv.setAttribute('class', 'sandy-container');
        board.gui.elems.divLeft = document.createElement('div');
        board.gui.elems.divLeft.setAttribute('class', 'sandy-container-left');
        board.gui.elems.divRight = document.createElement('div');
        board.gui.elems.divRight.setAttribute('class', 'sandy-container-right');
        board.gui.elems.svg = document.createElementNS(SVGNS, 'svg');
        board.gui.elems.svg.setAttribute('width', '100%');
        board.gui.elems.svg.setAttribute('height', '100%');
        board.gui.elems.divGameInfo = document.createElement('div');
        board.gui.elems.divGameInfo.setAttribute('class', 'sandy-game-info');
        board.gui.elems.divNorthSide = document.createElement('div');
        board.gui.elems.divNorthSide.setAttribute('class', 'sandy-north-side');
        board.gui.elems.divSouthSide = document.createElement('div');
        board.gui.elems.divSouthSide.setAttribute('class', 'sandy-south-side');
        board.gui.elems.divRecord = document.createElement('div');
        board.gui.elems.divRecord.setAttribute('class', 'sandy-record');
        topDiv.appendChild(board.gui.elems.divLeft);
        topDiv.appendChild(board.gui.elems.divRight);
        board.gui.elems.divLeft.appendChild(board.gui.elems.svg);
        board.gui.elems.divRight.appendChild(board.gui.elems.divGameInfo);
        board.gui.elems.divRight.appendChild(board.gui.elems.divNorthSide);
        board.gui.elems.divRight.appendChild(board.gui.elems.divSouthSide);
        board.gui.elems.divRight.appendChild(board.gui.elems.divRecord);
        board.gui.squareDim = calcSquareDim(board.gui.elems.svg, board);
        board.gui.elems.horizontal = drawHorizontalBar(board.gui.elems.svg, board);
        board.gui.elems.vertical = drawVerticalBar(board.gui.elems.svg, board);
}

function drawBoard(div, board) {
        board.gui.id = div.id;
        createGUI(div, board);
        for (let i = 0; i < board.files; i++) {
                for (let j = 0; j < board.ranks; j++) {
                        let group = drawSquare(board.gui.elems.svg, board, i, j);
                        const idx = fr(board, i, j);
                        const square = board.squares[idx];
                        if (square) {
                                drawPiece(group, square, idx);
                        }
                        const blockVal = board.blocks[idx];
                        if (blockVal) {
                                drawBlock(group, blockVal);
                        }
                        for (const [side, scores] of board.scores) {
                                const scoreVal = scores[idx];
                                if (scoreVal) {
                                        drawScore(group, side, scoreVal);
                                }
                        }
                        if (j == 0) {
                                drawFileNotation(board.gui.elems.horizontal, board, i);
                        }
                        if (i == board.files - 1) {
                                drawRankNotation(board.gui.elems.vertical, board, j);
                        }
                }
        }
        drawSides(board);
}

function clearPreviousMoveSquare(square) {
        if (square.classList.contains('light')) {
                square.setAttribute('fill', SQUARE_LIGHT);
        } else {
                square.setAttribute('fill', SQUARE_DARK);
        }
}

function drawMove(board, groupFrom, groupTo) {
        const piece = groupFrom.querySelector('image');
        groupTo.appendChild(piece);
        let rectFrom = groupFrom.querySelector('rect');
        if (rectFrom.classList.contains('light')) {
                rectFrom.setAttribute('fill', SQUARE_LIGHT_MOVED);
        } else {
                rectFrom.setAttribute('fill', SQUARE_DARK_MOVED);
        }
        let rectTo = groupTo.querySelector('rect');
        if (rectTo.classList.contains('light')) {
                rectTo.setAttribute('fill', SQUARE_LIGHT_MOVED);
        } else {
                rectTo.setAttribute('fill', SQUARE_DARK_MOVED);
        }
        board.gui.squareFrom = rectFrom;
        board.gui.squareTo = rectTo;
}

function drawScoredSquare(group) {
        let rect = group.querySelector('rect');
        if (rect.classList.contains('light')) {
                rect.setAttribute('fill', SQUARE_LIGHT_SCORED);
        } else {
                rect.setAttribute('fill', SQUARE_DARK_SCORED);
        }
}

function getMoves(board) {
        board.moves = [];
        if (board.gameEnded) {
                return;
        }
        const rookDirections = [
                0, -1,
                -1, 0,
                0, 1,
                1, 0,
        ];
        const bishopDirections = [
                1, -1,
                1, 1,
                -1, -1,
                -1, 1,
        ];

        function getPieceMoves(file, rank, idx) {
                let directions;
                if (board.squares[idx] & ROOK) {
                        directions = rookDirections;
                } else {
                        directions = bishopDirections;
                }
                for (let i = 0; i < directions.length; i += 2) {
                        const rankJump = directions[i];
                        const fileJump = directions[i + 1];
                        let blocked = false;
                        let r = rank + rankJump;
                        let f = file + fileJump;
                        while (r >= 0 && r < board.ranks &&
                                f >= 0 && f < board.files &&
                                blocked == false) {
                                const i = fr(board, f, r);
                                if (board.squares[i] == 0 &&
                                        ((board.blocks[i] & board.side) == 0)) {
                                        board.moves.push([idx, i]);
                                        r += rankJump;
                                        f += fileJump;
                                } else {
                                        blocked = true;
                                }
                        }
                }
        }

        for (let file = 0; file < board.files; file++) {
                for (let rank = 0; rank < board.ranks; rank++) {
                        const idx = fr(board, file, rank);
                        if (board.squares[idx] & board.side && board.scores.get(board.side)[idx] == 0) {
                                getPieceMoves(file, rank, idx);
                        }
                }
        }
}

function setPossibleScores(board) {
        for (const side of SIDES) {
                let total = 0;
                for (let i = 0; i < board.scores.get(side).length; i++) {
                        console.log(i, board.blocks[i], side, board.blocks[i] & side);
                        if ((board.blocks[i] & side) == 0) {
                                total += board.scores.get(side)[i];
                        }
                }
                board.possibleScores.set(side, total + board.currentScores.get(side));
        }
}

function calcScores(board) {
        for (const side of SIDES) {
                let total = 0;
                for (let i = 0; i < board.scores.get(side).length; i++) {
                        if (board.squares[i] & side) {
                                total += board.scores.get(side)[i];
                        }
                        board.currentScores.set(side, total);
                }
        }
}

function initGame(board) {
        board.size = board.files * board.ranks;
        setPossibleScores(board);
        calcScores(board);
        getMoves(board);
}

function checkGameEnded(board) {
        const southScore = board.currentScores.get(SOUTH);
        const northScore = board.currentScores.get(NORTH);
        const southPossible = board.possibleScores.get(SOUTH);
        const northPossible = board.possibleScores.get(NORTH);

        if (board.moves.length == 0) {
                if (southScore > northScore) {
                        return SOUTH_WINS;
                }
                if (northScore > southScore) {
                        return NORTH_WINS;
                }
                return DRAW;
        }

        if (southScore > northScore) {
                if (southScore >= board.winningScores.get(SOUTH)) {
                        return SOUTH_WINS;
                }
                if (northPossible < southScore) {
                        return SOUTH_WINS;
                }
        } else if (northScore > southScore) {
                if (northScore >= board.winningScores.get(NORTH)) {
                        return NORTH_WINS;
                }
                if (southPossible < northScore) {
                        return NORTH_WINS;
                }
        }

        if (southScore == northScore) {
                if (southScore >= board.winningScores.get(SOUTH) &&
                        northScore < board.winningScores.get(NORTH)) {
                        return SOUTH_WINS;
                }
                if (northScore >= board.winningScores.get(SOUTH) &&
                        northScore < board.winningScores.get(NORTH)) {
                        return SOUTH_WINS;
                }

                if (southScore >= board.winningScores.get(SOUTH) &&
                        northScore >= board.winningScores.get(NORTH)) {
                        return DRAW;
                }
        }

        return NOT_ENDED;
}

function gameLoop(div, board) {
        initGame(board);
        drawBoard(div, board);
}

let div = document.getElementById('sandy-game-1');
let board = defaultBoard();
gameLoop(div, board);

