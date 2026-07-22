import { EnterKeyAction } from "../Actions/KeyboardActions/EnterKeyAction.js";
import { EscapeKeyAction } from "../Actions/KeyboardActions/EscapeKeyAction.js";
import { NavigationKeyAction } from "../Actions/KeyboardActions/NavigationKeyAction.js";
import type { ColumnManager } from "../ColumnManager.js";
import type { EditManager } from "../EditManager.js";
import type { IKeyboardAction } from "../interfaces/IkeyboardAction.js";
import type { RowManager } from "../RowManager.js";
import type { Selection } from "../Selection.js";

export class KeyboardController {

    private handlers: IKeyboardAction[] = [];

    constructor(
        private canvas: HTMLCanvasElement,
        private selection: Selection,
        private editManager: EditManager,
        private rowManager: RowManager,
        private colManager: ColumnManager,
        private getScroll: () => { x: number, y: number },
        private moveSelection: (row: number, col: number) => void,
        private onRedrawRequired: () => void
    ) {

        this.addHandler(new EscapeKeyAction(editManager, onRedrawRequired));
        this.addHandler(new EnterKeyAction(canvas, editManager, selection, getScroll));
        this.addHandler(new NavigationKeyAction(editManager, selection, rowManager, colManager, moveSelection));


        this.bindEvents();
    }

    public addHandler(action: IKeyboardAction): void {
        this.handlers.push(action);
    }

    private bindEvents() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }


    private handleKeyDown(e: KeyboardEvent): void {
        // Loop through strategies
        for (const handler of this.handlers) {
            if (handler.handleKeyDown(e)) {
                return;
            }
        }
    }
}
