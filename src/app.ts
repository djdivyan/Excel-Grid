import { ColumnManager } from './ColumnManager.js';
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

    const myGrid = new Grid('excel-grid', totalRows, totalColumns, dataStore);

    const container = document.getElementById('grid-container') as HTMLDivElement;

    container.addEventListener('scroll' , () => {
        myGrid.setScroll(container.scrollLeft,container.scrollTop);
    })
};