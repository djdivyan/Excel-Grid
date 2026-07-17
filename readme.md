# Excel Grid

## Design Note
[Link to Design Note](design_note.md)

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
    - `ViewportManager.ts`:  Calculates visible rows and columns from scroll position and viewport size, and detects resize boundaries
    - `Cell.ts`: Represents cell values and display information
    - `ColumnManager.ts`: Manages column width and total columns
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
    - `IFormulaFunction.ts`: Interface for formula functions
    - `IPointerAction.ts`: Interface for pointer-based actions

- `src/Command`: (undo, redo)
    - `CommandManager.ts`: Manages undo/redo stacks and executes actions.
    - `EditCommand.ts`: Represents a cell edit action.
    - `ResizeCommands.ts`: Handles column and row resize actions.

- `src/Controller/`:
    - `PointerController.ts`: Routes pointer events to selection or resize actions
    - `KeyboardController.ts`: Handles keyboard navigation and edit shortcuts

- `src/Actions/`
    - `SelectionAction.ts`: Handles pointer-based selection and double-click editing behavior
    - `ResizeAction.ts`: Handles pointer-based row and column resizing

- `src/Formulas/`
    - `FormulaFactory.ts`: Registers and resolves formula implementations
    - `SumFunction.ts`: Implements SUM
    - `CountFunction.ts`: Implements COUNT
    - `MinFunction.ts`: Implements MIN
    - `MaxFunction.ts`: Implements MAX


## How OOP Concepts are Applied
- Encapsulation: Internal state is hidden and protected. For example, `DataStore` manages a private `Map` of cells, and `RowManager` and `ColumnManager` control row heights and column widths through dedicated methods instead of direct manipulation.
- Abstraction: Complex behavior is hidden behind simple APIs. `Grid` coordinates the application without needing to know the low-level details of canvas drawing, viewport math, or pointer handling.
- Polymorphism: Command classes implement the shared `ICommand` interface, so `CommandManager` can execute and undo different command types in the same way. This includes `EditCommand`, `ColumnResizeCommand`, and `RowResizeCommand`.
- Composition: `Grid` combines smaller focused objects like `GridRenderer`, `EditManager`, `ViewportManager`, `PointerController`, and `KeyboardController` to build the full spreadsheet behavior.
- Separation of concerns: Rendering, editing, selection, resizing, input handling, and data storage are split into separate classes rather than being bundled into one large component.

## How SOLID Principles are Applied
- Single Responsibility: Each class has one clear job. `GridRenderer` draws the grid, `EditManager` handles editing, `SummaryCalculator` computes totals, and `JsonDataLoader` loads data.
- Open/Closed: The system can be extended with new commands or formula functions without changing the existing core flow. For example, new command types can implement `ICommand`, and new formulas can be added through `FormulaFactory`. Also new Formulas can be added easily.
- Liskov Substitution: Any class that implements `ICommand` can be used by `CommandManager` without breaking behavior.
- Interface Segregation: Small interfaces like `ICommand`, `IFormulaFunction`, and `IPointerAction` keep contracts narrow and specific, so classes only implement what they actually need.
- Dependency Inversion: Higher-level classes depend on abstractions and injected dependencies rather than concrete implementations. `Grid` receives core collaborators through its constructor, which keeps the design modular and testable.

## How Virtual Rendering Works
Rendering 100,000 rows x 500 columns would freeze the browser if processed via the DOM. Instead, this project uses a Virtual Render loop:
1. The ViewportManager calculates exactly which rows and columns should be visible based on the current scrollX, scrollY, and canvas dimensions.
2. It skips processing any elements outside these bounds.
3. The GridRenderer then only loops through and paints the explicitly visible subset of cells onto the single <canvas> element.

## How Data is Generated and Loaded
Data generation is handled by a script (generateData.js) which generates 50,000 randomized employee records (ID, Name, Age, Salary) and writes them to a JSON file. 
At runtime, app.ts delegates the loading to JsonDataLoader, which fetches the JSON asynchronously, parses it, and maps it directly into the DataStore's sparse matrix map.

## How the Command Pattern (Undo/Redo) Works
Every user action that changes state is wrapped in a command object that implements `ICommand` with `execute()` and `undo()` methods.
When a user edits a cell or resizes a row or column, the action is executed through `CommandManager`, which pushes it onto the undo stack. Pressing Ctrl+Z calls `undo()` on the latest command and moves it to the redo stack. Pressing Ctrl+Y re-executes the last undone command.
Editing uses `EditCommand`, while resize actions use `ColumnResizeCommand` and `RowResizeCommand` from `ResizeCommands.ts`.


## Test Cases Covered
For all the formulas ( SUM,COUNT,MIN,MAX,Avg )
- Should handle range of positive integers and decimals
- Should handle negative numbers and zero correctly 
- Should treat empty cells or text values as 0 during calculation
For formula arguements
- Should gracefully return a fallback error string for broken ranges
- Should process lowercase cell coordinates gracefully


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