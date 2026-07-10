import type { ICommand } from "../interfaces/ICommand.js";

export class CommandManager {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];

    public executeCommand(command: ICommand): void {
        command.execute();         
        this.undoStack.push(command);
        this.redoStack = [];
    }

    public undo(): void {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop()!; 
            command.undo();                        
            this.redoStack.push(command);          
        }
    }

    public redo(): void {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop()!;
            command.execute();
            this.undoStack.push(command);
        }
    }
}