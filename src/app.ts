import { ColumnManager } from './ColumnManager.js';
import { CommandManager } from './Command/CommandManager.js';
import { DataStore } from './DataStore.js';
import { Grid } from './Grid.js'; 
import { RowManager } from './RowManager.js';

window.onload = async () => {
    console.log("App initialized!");
    //1 Lakh rows and 500 cols 
    const totalRows = 100000;
    const totalColumns  = 500;

    const dataStore = new DataStore();
    await dataStore.loadJsonData('data.json');

    const commandManager = new CommandManager();

    const myGrid = new Grid('excel-grid', totalRows, totalColumns, dataStore, commandManager);

    const container = document.getElementById('grid-container') as HTMLDivElement;

    container.addEventListener('scroll' , () => {
        myGrid.setScroll(container.scrollLeft,container.scrollTop);
    });

    window.addEventListener('keydown', (e) => {
        if(e.ctrlKey){
            if (e.key === 'z') {
                e.preventDefault();
                commandManager.undo();
                myGrid.drawGrid();
            } else if(e.key === 'y') {
                e.preventDefault();
                commandManager.redo();
                myGrid.drawGrid();
            }
        }
    });
};