import {
  Position, loadPosition, loadEmptyPosition,
  newGameWithMoves
} from "../game.js";

import {
  GameUX
} from "../gameux.js";

export class PositionForm {
  gameUX: GameUX;
  form: HTMLFormElement;
  positionSetupDiv: HTMLDivElement | null = null;
  selectSavedPositionButton: HTMLButtonElement | null = null;
  selectSavedPositionDialog: HTMLDialogElement | null = null;
  select: HTMLSelectElement | null = null;

  constructor(gameUX: GameUX, form: HTMLFormElement) {
    this.gameUX = gameUX;
    this.form = form;
    const positionSetup = gameUX.components['positionSetup'];
    if (positionSetup) {
      this.positionSetupDiv = positionSetup.div;
      this.positionSetupDiv!.style.visibility = "hidden";
    }
    this.selectSavedPositionButton = gameUX.get("selectSavedPositionButton", "button") as HTMLButtonElement;
    this.selectSavedPositionDialog = gameUX.get("selectSavedPositionDialog", "dialog") as HTMLDialogElement;
    this.select = this.selectSavedPositionDialog?.querySelector("select") as HTMLSelectElement;
  }


  getSavedPositions(this: PositionForm,
    specifications: { name: string, specification: string }[]) {
    const select = this.select;
    if (!select) return;
    specifications.map((entry: any, i: number) => {
      let opt = document.createElement("option");
      opt.value = String(i);
      opt.innerHTML = entry.name;
      select.append(opt);
    });
  }

  createPosition(formData: FormData) {
    const gameUX = this.gameUX;
    const files: number = Number(formData.get('files'));
    const ranks: number = Number(formData.get('ranks'));
    let specification: string = String(formData.get('position-string'));
    let position: Position;

    if (specification !== null && specification > "") {
      position = loadPosition(specification);
    } else {
      position = loadEmptyPosition(files, ranks);
    }
    gameUX.game = newGameWithMoves(position);
    gameUX.components['board']?.setup();
    gameUX.update();
  }

  addEvents(this: PositionForm) {
    const positionForm = this;
    const positionSetupDiv = this.positionSetupDiv;
    const gameUX = this.gameUX;

    this.form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!positionSetupDiv) return;

      const formData = new FormData(positionForm.form);
      positionForm.createPosition(formData);
      positionForm.form.style.display = "none";
      positionSetupDiv.style.visibility = "visible";
    });

    const dialog = this.selectSavedPositionDialog;
    const button = this.selectSavedPositionButton;
    if (!dialog || !button) return;

    const specificationInput = gameUX.get("position-string") as HTMLInputElement;
    const confirm = dialog.querySelector('.confirm') as HTMLButtonElement;
    if (!confirm || !specificationInput) return;

    let specifications: { name: string, specification: string }[];

    button.addEventListener('click', function(e) {
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


