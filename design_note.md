## Design Note

### Component Diagram


### Class Responsibilities
- app.ts: Starts the application, loads data, and initializes the grid.
- `Grid`: Main coordinator that wires rendering, selection, editing, scrolling, controllers, and commands.
- `GridRenderer`: Draws the visible portion of the grid, headers, selection, and resize indicators.
- `ViewportManager`: Converts scroll position and canvas size into visible row and column ranges.
- `EditManager`: Handles cell editing through the overlay input and commits values to the data store.
- `Selection`: Stores the active cell and the current selected range.
- `PointerController`: Routes pointer events to either selection or resize behavior.
- `KeyboardController`: Handles keyboard navigation and edit shortcuts.
- `DataStore`: Stores cell values and formulas in a sparse structure.
- `CommandManager`: Executes commands and manages undo and redo history.
- `EditCommand`: Represents a cell edit action.
- `ResizeCommands`: Contains row and column resize commands.
- `FormulaParser`: Evaluates formula expressions and resolves ranges.
- `FormulaFactory`: Returns the correct formula implementation.
- `SummaryCalculator`: Computes count, min, max, sum, and average for the selected range.

### Data Storage Approach
The grid uses a sparse storage model instead of a full 2D array. Only cells that contain data or have been changed are stored in `DataStore`, which keeps memory usage low for large grids. Row and column sizes are managed separately by `RowManager` and `ColumnManager`, while `Selection` tracks the active and highlighted area.

### Virtual Rendering Approach
Only the cells inside the visible viewport are calculated and drawn. `ViewportManager` determines the visible rows and columns from scroll position and canvas size. `GridRenderer` then renders only that subset on the canvas, which keeps the UI fast even with very large datasets.

### Command Pattern Approach
All state-changing actions are wrapped as commands that implement `ICommand`. `CommandManager` calls `execute()` when an action happens, stores the command in the undo stack, and moves it to the redo stack when undone. `undo()` restores the previous state, and `redo()` re-executes the stored command.

### Selection Model
The selection state is represented by `Selection` using:
- active cell
- selected row
- selected column
- selected range bounds

This allows the grid to support single-cell focus, row selection, column selection, and multi-cell range selection.

### Summary Calculation
`SummaryCalculator` computes count, min, max, sum, and average from the selected range only. It does not scan the full grid. It reads the currently selected bounds from `Selection`, pulls only matching values from `DataStore`, and calculates the result from that subset.

### Known Limitations
- Copy and paste are not implemented.
- Persistent storage is not implemented.
- Custom cell formatting and merged cells are not supported.
- Formula support is limited to basic functions.
- Formula range typing is manual and not auto-filled from selection.
- Drag selection does not auto-scroll outside the canvas bounds.
- Multiline cell values are not supported.
