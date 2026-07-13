import type { DataStore } from "./DataStore.js";
import type { IEmployee } from "./interfaces/IEmployee.js";

export class JsonDataLoader {
    public static async load(url: string, dataStore: DataStore): Promise<void> {
        try {
            const response = await fetch(url);
            const data: IEmployee[] = await response.json();
            
            // Row 0 for headers
            const headers = ["ID", "First Name", "Last Name", "Age", "Salary"];

            headers.forEach((header: string, col: number) => {
                dataStore.setCell(0, col, header);
            });

            data.forEach((record: IEmployee, index: number) => {
                const row = index + 1; // Start at Row 1
                dataStore.setCell(row, 0, record.id);
                dataStore.setCell(row, 1, record.firstName);
                dataStore.setCell(row, 2, record.lastName);
                dataStore.setCell(row, 3, record.age);
                dataStore.setCell(row, 4, record.salary);
            });

            console.log(`Loaded ${data.length} records into the DataStore!`);
        } catch (error) {
            console.error("Failed to load data: ", error);
        }
    }
}