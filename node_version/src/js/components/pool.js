export class Pool {
    constructor(gameUX, table) {
        this.addEvents = function () {
        };
        this.setEntries = function (entries, session) {
            const tbody = this.table.querySelector('tbody');
            if (!tbody)
                return;
            tbody.innerHTML = "";
            entries.map((entry) => {
                if (session === entry.session)
                    return;
                let tr = document.createElement("tr");
                tr.classList.add('pool-entry');
                let tdLeft = document.createElement("td");
                tdLeft.innerText = entry.session;
                let tdRight = document.createElement("td");
                tdRight.innerText = entry.name;
                tbody.append(tr);
                tr.append(tdLeft);
                tr.append(tdRight);
                tr.addEventListener('click', (event) => {
                    event.preventDefault();
                    tr.querySelectorAll("td").forEach((td) => {
                        console.log("Calling choose opponent", td.innerText);
                        this.gameUX.components['placePool'].chooseOpponent(td.innerText);
                    });
                });
            });
        };
        this.gameUX = gameUX;
        this.table = table;
        this.poolEntry = {
            session: "0",
            name: "DEFAULT",
            gameRequested: false
        };
    }
}
