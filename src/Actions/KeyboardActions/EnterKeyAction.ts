import type { EditManager } from "../../EditManager.js";
import type { IKeyboardAction } from "../../interfaces/IkeyboardAction.js";
import type { Selection } from "../../Selection.js";

export class EnterKeyAction implements IKeyboardAction {
    constructor(
        private canvas: HTMLCanvasElement,
        private editManager: EditManager,
        private selection: Selection,
        private getScroll: () => { x: number, y: number }
    ) {}

    handleKeyDown(e: KeyboardEvent): boolean {
        if (e.key === 'Enter' && !this.editManager.isEditing()) {
            e.preventDefault();
            const { minRow, minCol } = this.selection.getSelection();
            
            if (minRow >= 0 && minCol >= 0) {
                const rect = this.canvas.getBoundingClientRect();
                const scroll = this.getScroll();
                this.editManager.showEditor(minRow, minCol, scroll.x, scroll.y, rect);
            }
            return true;
        }
        return false;
    }
}