# Excel Grid

## Objective
The objective of this project is to build a high-performance, Excel-like spreadsheet application using TypeScript and HTML5 Canvas. The application demonstrates advanced software architecture by rendering a virtualized grid capable of supporting 100,000 rows and 500 columns, managing state through the Command Pattern, and strictly adhering to Object-Oriented Programming (OOP) and SOLID design principles.

## How to Install and Run
1. Clone or download the repository the repository and navigate to the root directory:
    ```bash
    git clone https://github.com/djdivyan/Excel-Grid
    cd .\Excel-Grid\
    ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the dataset by running the data generation script: (This will generate a data.json file containing 50,000 records) 
    ```bash
    node generateData.js
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Open `index.html` in a browser or serve the project using a local dev server. (you can run the server via `npm run dev`)

## Features Implemented
- Virtual Rendering: Canvas only draws the cells currently visible in the viewport, supporting massive datasets without lag.
- Sticky row and column headers
- Cell Editing: Double-click any cell to edit its contents via a dynamic HTML input overlay.
- Formula Support: Basic formula parsing (e.g., =SUM(A1:B3)) with a suggestion popup.
- Row & Column Resizing: Click and drag header boundaries to resize rows and columns.
- Selection & Navigation: Support for cell highlighting and keyboard navigation (Arrow keys, Enter, Escape).
- Summary Calculations: Calculation of Count, Min, Max, Sum, and Average for numeric data in the selected range.
- Undo / Redo: Ctrl+Z and Ctrl+Y shortcuts for editing and resizing actions.

## Folder and Class Structure
- `src/` 
    - `app.ts`: The main entry point that initializes the Application, fetches data, and binds global listeners
    - `Grid.ts`:  Main coordinator that wires data, rendering, selection, editing and commands and handles mouse events
    - `GridRenderer.ts`:  Draws canvas grid, headers, selected cells, active cell and resize indicators
    - `EditManager.ts`:  Handles editing workflow and input overlay coordination
    - `ViewportManager.ts`:  Calculates visible rows/columns based on scroll position and viewport size and hover detection method for row/col resize boundary detection 
    - `Cell.ts`: Represents cell values and display information
    * `ColumnManager.ts`: Manages column width and total columns
    - `RowManager.ts`: Managers row height and total rows
    - `DataStore.ts`: Stores and retrieves cell data using map and handles recalculation for cells with formulas
    - `Selection.ts`: Manages the state of the active cell and highlighted selection bounds
    - `FormulaParser.ts`: Evaluates basic cell formulas
    - `JsonDataLoader.ts`: Loads and maps JSON data into the grid
    - `SummaryCalculator.ts`: Computes Count, Min, Max, Sum, and Average for numeric values in a selected range

- `src/config`:
    - `GridConfig.ts`: Stores global constants for colors, fonts and UI dimensions.

- `src/interfaces`:
    - `ICommand.ts`: Interface for executable and undoable actions.
    - `IEmployee.ts`: Type definition for the JSON data records.

- `src/Command`: (undo, redo)
    - `CommandManager.ts`: Manages undo/redo stacks and executes actions.
    - `EditCommand.ts`: Represents a cell edit action.
    - `ResizeCommands.ts`: Handles column and row resize actions.


## How OOP Concepts are Applied
- Encapsulation: Internal state is hidden and protected. For example: `DataStore` manages a private `Map` of cells, and `RowManager` protects row heights, forcing other classes to use dedicated getters and setters rather than modifying data directly.
- Abstraction: Complex logic is hidden behind simple APIs. The `Grid` class does not know how canvas pixel math works; it simply calls `viewportManager.convertToCell()`.
- Polymorphism: Command classes implement a shared `ICommand` interface. The `CommandManager` treats all actions as a generic `ICommand`. It can execute or undo an `EditCommand` or a `ColumnResizeCommand` using the exact same method calls, without knowing the specific details of the action.

## How SOLID Principles are Applied
- Single Responsibility: Every class is designed with a single purpose. `GridRenderer` is only for drawing on the canvas, `EditManager` coordinates the HTML input overlay, `SummaryCalculator` handles math, and `JsonDataLoader` parses external data.
- Open/Closed: The system is open for extension but closed for modification. Behavior can be extended by adding new command types without changing existing class logic.
- Liskov Substitution: Commands implementing `Command` can be used interchangeably by `CommandManager`.
- Interface Segregation: Small interfaces like `Command` keep behavior narrow and specific.`ICommand` has only `execute()` and `undo()`, ensuring implementing classes are not forced to write unnecessary methods
- Dependency Inversion: Higher-level classes depend on abstractions and injections rather than concrete instantiations. The `Grid` class receives its major dependencies (such as `DataStore` and `CommandManager`) via constructor injection, allowing for modularity, easier testing, and clear contracts.

## How Virtual Rendering Works
Rendering 100,000 rows x 500 columns would freeze the browser if processed via the DOM. Instead, this project uses a Virtual Render loop:
1. The ViewportManager calculates exactly which rows and columns should be visible based on the current scrollX, scrollY, and canvas dimensions.
2. It skips processing any elements outside these bounds.
3. The GridRenderer then only loops through and paints the explicitly visible subset of cells onto the single <canvas> element.

## How Data is Generated and Loaded
Data generation is handled by a script (generateData.js) which generates 50,000 randomized employee records (ID, Name, Age, Salary) and writes them to a JSON file. 
At runtime, app.ts delegates the loading to JsonDataLoader, which fetches the JSON asynchronously, parses it, and maps it directly into the DataStore's sparse matrix map.

## How the Command Pattern (Undo/Redo) Works
Every user action that modifies state (editing a cell, resizing a row/column) is wrapped in a class that implements ICommand which has execute() and undo() methods. 
When an action occurs, it is passed to the CommandManager, which executes it and pushes it to an undoStack. When Ctrl+Z is pressed, the manager pops the command, calls its undo() method, and pushes it to a redoStack.

## Test Cases Covered


## Performance Observations
- Virtual Rendering: Instead of rendering the entire 100,000 row by 500 column grid, the system calculates and draws only the exact cells visible in the current viewport.
- Large Data Handling: The `JsonDataLoader` efficiently parses 50,000 generated JSON records and inserts them into a sparse Map structure, minimizing memory overhead and load times.
- Initialization: Loading the entire application and parsing 50,000 records takes roughly ~100-200ms. 
- Scrolling: Because only visible cells (typically ~30-50 at a time) are painted, scrolling remains locked at 60 FPS regardless of the total data volume.
- Calculations: Highlighting massive ranges (e.g: 10,000 cells) for summary calculation performs the work but can cause slight frame drops due to iterating the Map structure.

## Accessibility Considerations
- Overcoming Canvas Limitations: Because an HTML5 `<canvas>` renders as a single flat image, its internal grid is inherently invisible to screen readers. To solve this, the we use a native HTML `<input>` overlay during cell editing, restoring focus and screen reader visibility.
- Keyboard Navigation: The grid is fully operable without a mouse. Users can traverse the grid using Arrow keys, open and commit edits using `Enter`, and safely discard changes using `Escape`.
- Summary Status Bar: The summary calculator (Count, Min, Max, Sum, Average) outputs its results to standard HTML text elements outside the canvas, ensuring that computed data can be easily read by assistive technologies.
- Selection accessibility: We use bold borders along with colors for selection to support colorblind users


## Known Limitations and Next Improvements
- Copy/Paste functionality is not implemented yet
- No built-in support for custom cell formatting, or merging cells.
- Formulas are limited to a small set of functions(SUM,COUNT,MIN,MAX,Avg) and do not support arbitrary expressions.
- While Formula typing, Cell range has to be typed manually, it doesn't auto fill through selections.
- Selection Scrolling, Dragging the mouse outside the canvas bounds does not currently auto-scroll the viewport to extend the selection. 
- Not using persistent storage
- Multiline values not supported in cells