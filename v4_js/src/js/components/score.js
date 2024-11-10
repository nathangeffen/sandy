export class Score {
    constructor(gameUX, div) {
        this.gameUX = gameUX;
        this.div = div;
    }
    update() {
        const div = this.div;
        const position = this.gameUX.game.position;
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
}
