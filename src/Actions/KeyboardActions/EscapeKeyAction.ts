import type { EditManager } from "../../EditManager.js";
import type { IKeyboardAction } from "../../interfaces/IkeyboardAction.js";

export class EscapeKeyAction implements IKeyboardAction {
    constructor(
        private editManager: EditManager,
        private onRedrawRequired: () => void
    ) {}

    handleKeyDown(e: KeyboardEvent): boolean {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.onRedrawRequired();
            
            if (this.editManager.isEditing()) {
                this.editManager.blurEditor(); 
            }
            return true;
        }
        return false;
    }
}