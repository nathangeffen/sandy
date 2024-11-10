import { GameUX } from "./gameux.js";
import { Message } from "./components/message.js";
import { Board } from "./components/board.js";
import { Flip } from "./components/flip.js";
import { Specification } from "./components/specification.js";
import { Record } from "./components/record.js";
import { Result } from "./components/result.js";
import { ScoreBoard } from "./components/scoreboard.js";
import { Copy } from "./components/copy.js";
const componentSpecs = [
    {
        name: 'message',
        tagName: 'div',
        typeName: Message
    },
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
    },
    {
        name: 'result',
        tagName: 'div',
        typeName: Result
    },
    {
        name: 'scoreboard',
        tagName: 'div',
        typeName: ScoreBoard
    },
    {
        name: 'record',
        tagName: 'div',
        typeName: Record
    },
    {
        name: 'copy',
        tagName: 'button',
        typeName: Copy
    }
];
export const createGameUX = function (divID, options) {
    const div = document.querySelector(`div#${divID}`);
    if (!div) {
        throw `Div element ${divID} does not exist.`;
    }
    const gameUX = new GameUX(div, options);
    for (const spec of componentSpecs) {
        gameUX.addComponent(spec);
    }
    initComponents(gameUX);
    return gameUX;
};
const initComponents = function (gameUX) {
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
};
