import {
  GameUX,
  GameUXOptionType,
  ComponentEntry
} from "./gameux.js";

import {
  Board
} from "./components/board.js";

import {
  Flip
} from "./components/flip.js";

import {
  Specification
} from "./components/specification.js";
const componentSpecs: ComponentEntry[] = [
  {
    name: 'board',
    tagName: 'svg',
    typeName: Board
  },
  {
    name: 'flip',
    tagName: 'button',
    typeName: Flip
  },
  {
    name: 'specification',
    tagName: 'input',
    typeName: Specification
  }
];

export const createGameUX = function(divID: string, options: GameUXOptionType): GameUX {
  const div: HTMLDivElement | null = document.querySelector(`div#${divID}`);
  if (!div) {
    throw `Div element ${divID} does not exist.`;
  }

  const gameUX = new GameUX(div, options);
  for (const spec of componentSpecs) {
    gameUX.addComponent(spec);
  }
  initComponents(gameUX);
  return gameUX;
}

const initComponents = function(gameUX: GameUX) {
  for (const component of Object.values(gameUX.components)) {
    if (typeof component.setup === "function") {
      component.setup();
    }
    if (typeof component.update === "function") {
      component.update();
    }
    if (typeof component.addEvents === "function") {
      component.addEvents();
    }
  }
}
