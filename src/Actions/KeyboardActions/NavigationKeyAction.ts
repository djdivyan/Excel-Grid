import type { EditManager } from "../../EditManager.js";
import type { Selection } from "../../Selection.js";
import type { RowManager } from "../../RowManager.js";
import type { ColumnManager } from "../../ColumnManager.js";
import type { IKeyboardAction } from "../../interfaces/IkeyboardAction.js";

export class NavigationKeyAction implements IKeyboardAction {
    constructor(
        private editManager: EditManager,
        private selection: Selection,
        private rowManager: RowManager,
        private colManager: ColumnManager,
        private moveSelection: (row: number, col: number) => void
    ) {}

    handleKeyDown(e: KeyboardEvent): boolean {
        // Ignore navigation if the user is typing in the input box
        if (this.editManager.isEditing()) return false;

        const { minRow, minCol } = this.selection.getSelection();

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (minRow < this.rowManager.totalRows - 1) this.moveSelection(minRow + 1, minCol);
            return true;
        } 
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (minRow > 0) this.moveSelection(minRow - 1, minCol);
            return true;
        } 
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (minCol > 0) this.moveSelection(minRow, minCol - 1);
            return true;
        } 
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (minRow < this.colManager.totalColumns - 1) this.moveSelection(minRow, minCol + 1);
            return true;
        }

        return false; 
    }
}