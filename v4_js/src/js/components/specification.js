import { positionToString } from "../game.js";
// import {
//   Board
// } from "./board.js";
export class Specification {
    constructor(gameUX, button) {
        this.gameUX = gameUX;
        this.input = button;
    }
    update() {
        console.log("Updating specification");
        this.input.value = positionToString(this.gameUX.game.position);
    }
}
