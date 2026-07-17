# Excel Grid
 
## Objective
The objective of this project is to build a high-performance, Excel-like spreadsheet application using TypeScript and HTML5 Canvas. The application demonstrates advanced software architecture by rendering a virtualized grid capable of supporting 100,000 rows and 500 columns, managing state through the Command Pattern, and strictly adhering to Object-Oriented Programming (OOP) and SOLID design principles.
 
## How to Install and Run
1. Clone or download the repository the repository and navigate to the root directory:
    ```bash
    git clone https://github.com/unborntadpole/excel-grid-canvas
    cd .\excel-grid-canvas\
    ```
2. Enter command to install node modules and build files:
   ```bash
   npm install
   npm run build
   ```
3. Serve `/dist/index.html` using a local dev server with `./dist` as root folder. (you can also run the server via `npm run dev`)
 
## Features Implemented
- Virtual Rendering: Canvas only draws the cells currently visible in the viewport, supporting massive datasets without lag.
- Sticky row and column headers
- Cell Editing: Double-click any cell to edit its contents via a dynamic HTML input overlay.
- Formula Support: Basic formula parsing (e.g., =SUM(A1+B3)).
- Datastore: Datastore class to securely store cell data and row heights and column widths.
- Row & Column Resizing: Click and drag header boundaries to resize rows and columns.
- Selection & Navigation: Support for cell highlighting and keyboard navigation (Arrow keys, Shift, Enter, Escape).
- Summary Calculations: Calculation of Count, Min, Max, Sum, and Average for numeric data in the selected range.
- Undo / Redo: Ctrl+Z and Ctrl+Y shortcuts for editing, resizing actions, file importing, copy/paste actions.
- Copy/Paste: Ctrl+C and Ctrl+V shortcuts for copyings cells and pasting them in the grid.
- File import: Import any json file into the grid.
 
## Folder and Class Structure
- `src/`
    - `script.ts`: The main entry point that initializes the Application and holds the constants.
    - `grid.ts`:  Main coordinator that wires data, rendering, selection, editing and commands
    - `gridApplication.ts`: Has the eventhanadlers for all actions. This is the main application which imports grid and gives it context.
    - `gridRenderer.ts`:  Draws canvas grid, headers, selected cells, active cell.
    - `cell.ts`: Has classes for Cell, CellRange and Selection. Cell used for accessing data, Selection used for storing selected cells.
    - `datastore.ts`: Class for storing cell data and row heights and column widths securely.

- `src/utils`
    - `generator.ts`:  Backup class for data generation when json file from default import is not found.
    - `rowcolumn.ts`:  Has classes for updating values of row and column width in memory.
    - `fetchFromJson.ts`: Handles Json import and parsing for storage.
    - `selectionFunctions.ts`: Functions to evaluate selected cells sum, mean, count, max, min.
    - `copypaste.ts`: Classes to handle copy/paste operations for cells in the grid.
    - `formulae.ts`: Evaluates basic cell formulas.
 
- `src/config`:
    - `constants.ts`: Stores global constants for UI dimensions.
 
- `src/Command`:
    - `commands.ts`: Containes class for command handling and undo/redo and implementation class for commands.
    - `typeaction.ts`: Represents a cell edit action.
    - `rowcolumnResize.ts`: Handles column and row resize actions.
    - `rederjson.ts`: Handles importing and rendering json.
 
 
## How OOP Concepts are Applied
- Encapsulation: Internal state is hidden and protected. For example: `DataStore` manages a private `Map` of cells, and `Row` protects row heights, forcing other classes to use dedicated getters and setters rather than modifying data directly.
- Abstraction: Complex logic is hidden behind simple APIs. The `Grid` class does not know how canvas pixel math works; it simply calls `GridRenderer` objedct method `render`.
- Polymorphism: Command classes implement a shared `ICommand` interface. The `CommandManager` treats all actions as a generic `ICommand`. It can execute or undo an `EditCommand` or a `ColumnResizeCommand` or `PasteCommand` using the exact same method calls, without knowing the specific details of the action.
 
## How SOLID Principles are Applied
* Single Responsibility Principle (SRP): The original Grid class was aggressively refactored. GridRenderer only draws. JsonDataLoader only fetches data.
* Open/Closed Principle (OCP): The Command Pattern allows new features (like cell formatting or deleting rows) to be added by creating new Command classes, without altering the CommandManager.
* Dependency Inversion Principle (DIP): Higher-level managers depend on interfaces (ICommand) rather than concrete implementations, ensuring loose coupling.
 
## How Virtual Rendering Works
Rendering 100,000 rows x 500 columns would freeze the browser if processed via the DOM. Instead, this project uses a Virtual Render loop:
1. The GridRenderer calculates exactly which rows and columns should be visible based on the current scrollX, scrollY, and canvas dimensions.
2. It skips processing any elements outside these bounds.
3. The GridRenderer then only loops through and paints the explicitly visible subset of cells onto the single <canvas> element.
 
## How Data is Generated and Loaded
Data generation is handled by a standalone python script (generator.py) which generates 50,000 randomized employee records (ID, Name, Age, Salary) and writes them to a JSON file.
At runtime, the data loaded can be loaded via helper function fetchFromJson.ts or generated again using another script in typescript. Shortcut command to load default data is Ctrl+i and to import from specific file is Ctrl+o. 
 
## How the Command Pattern (Undo/Redo) Works
Every user action that modifies state (editing a cell, resizing a row/column, importing from json) is wrapped in a class that implements ICommand (featuring execute() and undo() methods).
When an action occurs, it is passed to the HistoryManager, which executes it and pushes it to an undoStack. When Ctrl+Z is pressed, the manager pops the command, calls its undo() method, and pushes it to a redoStack.
 
## Test Cases Covered
1. Testing Cell and Selection:
    1. cell setRawValue() and value, should store and retrieve a value in cell
    2. cell setRawValue() and value, should return "" on exceeding limit
    3. selection evaluate(), should get selection evaluation
    4. selection evaluate(), should return initial empty object when there is no selection at all

2. Testing cell selection functions
    1. getEvaluation(), should evalute a cell range
    2. getEvaluation(), should safely skip text
    3. getEvaluation(), should not evaluate text

3. Testing formulae function
    1. checkFormula(), should evalute a formula
    2. checkFormula(), should return "" without = in the beginning
    3. checkFormula(), invalid formula name
    4. checkFormula(), should exclude empty text
    5. checkFormula(), testing =sum()
    6. checkFormula(), testing =median()
    7. checkFormula(), testing =avg()
    8. checkFormula(), testing =mean()
    9. useFormula(), new function
    10. Formulae calling each other

4. Testing cell copy paste functions
    1. paste(), should paste in new location
    2. paste(), should paste text too in new location
    3. paste(), should overwrite text new location
    4. paste(), should not crash on exceeding Max rows
    5. paste(), should not paste beyond scope

 
## Performance Observations
* Initialization: Initialization of grid takes around 10 - 20 ms and reloading window takes < 10ms.
* Loading Data: On testing, loading 50,000 * 5 entries from json took around 500ms - 1500 ms during regular application working.
* Scrolling: Because only visible cells (typically ~100-200 at a time) are drawn, scrolling remains locked at 60 FPS regardless of the total data volume.
* Calculations: Highlighting massive ranges (e.g., 10,000 cells) for summary calculation performs adequately but can cause slight frame drops due to iterating the Map structure.
 
## Accessibility Considerations
HTML5 canvas works like a single picture. Because of this, screen readers cannot see the items drawn inside it. Here is how we fix this limitation:
* Accessible Typing: We place a hidden, real HTML <input> on top of the canvas. This lets screen readers announce text as you type.
* Readable Status: The summary bar uses normal HTML text outside the canvas. Assistive tools can easily read these live calculations.
* Keyboard Control: Users can navigate everything using a keyboard instead of a mouse.
 
## Known Limitations and Next Improvements
- No built-in support for custom cell formatting, or merging cells.
- Formulas are limited to a small set of functions(SUM,COUNT,MIN,MAX,Avg) and do not support arbitrary expressions.
- While Formula typing, Cell range has to be typed manually, it doesn't auto fill through selections.
- Selection Scrolling, Dragging the mouse outside the canvas bounds does not currently auto-scroll the viewport to extend the selection.
- Not using persistent storage
- Multiline values not supported in cells