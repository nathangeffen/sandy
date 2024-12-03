export class PlacePool {
    constructor(gameUX, button) {
        this.socket = io();
        this.specificationName = "DEFAULT";
        this.gameRequested = false;
        this.chooseOpponent = function (opponentId) {
            console.log("Choosing opponent");
            this.socket.emit('chooseopponent', [this.socket.id, opponentId]);
        };
        this.addEvents = function () {
            const placePool = this;
            this.button.addEventListener('click', function (e) {
                e.preventDefault();
                placePool.gameRequested = !placePool.gameRequested;
                const poolEntry = {
                    session: placePool.socket.id,
                    name: placePool.specificationName,
                    gameRequested: placePool.gameRequested
                };
                placePool.socket.emit("placePool", poolEntry);
                if (placePool.gameRequested === true) {
                    placePool.button.textContent = "Leave playing pool";
                }
                else {
                    placePool.button.textContent = "Enter playing pool";
                }
            });
            this.socket.on('placePool', (entries) => {
                this.gameUX.components['pool'].setEntries(entries, this.socket.id);
            });
            this.socket.on(this.socket.id, (entry) => {
                // Go to game this.socket.id + "-" + this.entry.session
            });
        };
        this.gameUX = gameUX;
        this.button = button;
    }
}
