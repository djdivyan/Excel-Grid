import { CommandManager } from './Command/CommandManager.js';
import { DataStore } from './DataStore.js';
import { Grid } from './Grid.js'; 
import { JsonDataLoader } from './JsonDataLoader.js';

window.onload = async () => {
    performance.mark('app-start');
    console.log("App initialized!");
    //1 Lakh rows and 500 cols 
    const totalRows = 100000;
    const totalColumns  = 500;

    const dataStore = new DataStore();
    await JsonDataLoader.load('data.json', dataStore);

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
    performance.mark('app-end');
    performance.measure('App Load Time', 'app-start', 'app-end');
    console.log(`App took ${performance.getEntriesByName('App Load Time')[0]!.duration.toFixed(2)}ms to load.`);
    performance.clearMarks();
    performance.clearMeasures();
};