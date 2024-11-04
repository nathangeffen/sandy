export class Specification {
    constructor(gameUX, button) {
        this.gameUX = gameUX;
        this.input = button;
    }
    addEvents() {
        const gameUX = this.gameUX;
        this.input.addEventListener('change', function (e) {
            e.preventDefault();
        });
    }
}
