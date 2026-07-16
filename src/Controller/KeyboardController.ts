import type { ColumnManager } from "../ColumnManager.js";
import type { EditManager } from "../EditManager.js";
import type { RowManager } from "../RowManager.js";
import type { Selection } from "../Selection.js";

export class KeyboardController {
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
        this.bindEvents();
    }

    private bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.onRedrawRequired();
                //Commit any edited data
                if (this.editManager.isEditing()) {
                    this.editManager.blurEditor(); 
                }
                return;
            } 
            
            //Enter to edit
            if (e.key === 'Enter' && !this.editManager.isEditing()) {
                e.preventDefault();
                const { minRow, minCol } = this.selection.getSelection();
                if (minRow >= 0 && minCol >= 0) {
                    const rect = this.canvas.getBoundingClientRect();
                    const scroll = this.getScroll();
                    this.editManager.showEditor(minRow, minCol, scroll.x, scroll.y, rect);
                }
                return;
            }

            //Ignore arrow keys if the user is typing in the input box
            if (this.editManager.isEditing()) return;

            const { minRow, minCol } = this.selection.getSelection();

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (minRow < this.rowManager.totalRows - 1) this.moveSelection(minRow + 1, minCol);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (minRow > 0) this.moveSelection(minRow - 1, minCol);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (minCol > 0) this.moveSelection(minRow, minCol - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (minRow < this.colManager.totalColumns - 1) this.moveSelection(minRow, minCol + 1);
            } 
        });
    }
}
