import { loadPosition, loadEmptyPosition, newGameWithMoves } from "../game.js";
export class PositionForm {
    constructor(gameUX, form) {
        this.positionSetupDiv = null;
        this.selectSavedPositionButton = null;
        this.selectSavedPositionDialog = null;
        this.select = null;
        this.gameUX = gameUX;
        this.form = form;
        const positionSetup = gameUX.components['positionSetup'];
        if (positionSetup) {
            this.positionSetupDiv = positionSetup.div;
            this.positionSetupDiv.style.visibility = "hidden";
        }
        this.selectSavedPositionButton = gameUX.get("selectSavedPositionButton", "button");
        this.selectSavedPositionDialog = gameUX.get("selectSavedPositionDialog", "dialog");
        this.select = this.selectSavedPositionDialog?.querySelector("select");
    }
    getSavedPositions(specifications) {
        const select = this.select;
        if (!select)
            return;
        specifications.map((entry, i) => {
            let opt = document.createElement("option");
            opt.value = String(i);
            opt.innerHTML = entry.name;
            select.append(opt);
        });
    }
    createPosition(formData) {
        const gameUX = this.gameUX;
        const files = Number(formData.get('files'));
        const ranks = Number(formData.get('ranks'));
        let specification = String(formData.get('position-string'));
        let position;
        if (specification !== null && specification > "") {
            position = loadPosition(specification);
        }
        else {
            position = loadEmptyPosition(files, ranks);
        }
        gameUX.game = newGameWithMoves(position);
        gameUX.components['board']?.setup();
        gameUX.update();
    }
    addEvents() {
        const positionForm = this;
        const positionSetupDiv = this.positionSetupDiv;
        const gameUX = this.gameUX;
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!positionSetupDiv)
                return;
            const formData = new FormData(positionForm.form);
            positionForm.createPosition(formData);
            positionForm.form.style.display = "none";
            positionSetupDiv.style.visibility = "visible";
        });
        const dialog = this.selectSavedPositionDialog;
        const button = this.selectSavedPositionButton;
        if (!dialog || !button)
            return;
        const specificationInput = gameUX.get("position-string");
        const confirm = dialog.querySelector('.confirm');
        if (!confirm || !specificationInput)
            return;
        let specifications;
        button.addEventListener('click', function (e) {
            e.preventDefault();
            fetch('/loadpositions', {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }).then((response) => response.json())
                .then((json) => {
                specifications = json;
                positionForm.getSavedPositions(specifications);
            });
            dialog.show();
        });
        confirm.addEventListener("click", (e) => {
            e.preventDefault();
            const index = this.select?.selectedIndex || 0;
            dialog.close(specifications[index].specification);
        });
        dialog.addEventListener("close", () => {
            const specification = dialog.returnValue;
            specificationInput.value = specification;
        });
    }
}
