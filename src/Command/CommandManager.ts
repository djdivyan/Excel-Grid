import type { Command } from "../interfaces/Command.js";

export class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    public executeCommand(command: Command): void {
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