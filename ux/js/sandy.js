"use strict";

function parseBoard(board_spec) {

        return {
                ranks: 9,
                files: 9,
                pieces: {
                        S: {

                        },
                        N: {

                        },
                },
                blocks: {
                        S: {

                        },
                        N: {

                        },
                },
                scores: {
                        S: {

                        },
                        N: {

                        },
                },
        };
}

function drawSquares(ctx, files, ranks) {

}

function drawPieces(ctx, pieces) {

}

function drawBlocks(ctx, blocks) {

}

function drawScores(ctx, scores) {

}

function drawBoard(canvas, board_spec) {
        let board = parseBoard(board_spec);
        var ctx = canvas.getContext("2d");
        drawSquares(ctx, board.files, board.ranks);
        drawPieces(ctx, board.pieces);
        drawBlocks(ctx, board.blocks);
        drawScores(ctx, board.scores);
}

function sendMove(board_spec, move) {

}

function receiveMove(canvas) {

}
