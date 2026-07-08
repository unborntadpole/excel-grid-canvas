import { fetchFromJson } from "./fetchFromJson.js";
import { Grid } from "./grid.js";
import { Row, Column } from "./rowcolumn.js";

export const DEFAULT_ROW_HEIGHT = 30;
export const DEFAULT_COLUMN_WIDTH = 100;
export const MAX_ROWS = 100000;
export const MAX_COLUMNS = 50;




const container = document.getElementById('grid-container') as HTMLDivElement;
const spacer = document.getElementById('grid-spacer') as HTMLDivElement;
const canvas = document.getElementById('my-grid-canvas') as HTMLCanvasElement;
const editor = document.getElementById('grid-editor') as HTMLInputElement;

canvas.style.width = `${container.clientWidth}px`;
canvas.style.height = `${container.clientHeight}px`;

export const grid = new Grid(canvas);

(await fetchFromJson());

let isDraggingSelection = false;
let isResizingColumn = false;
let isResizingRow = false;
let activeResizeIndex = -1;
let initialMousePos = 0;
let initialSize = 0;
let currentEditingCell: { row: number; col: number } | null = null;

function updateScrollDimensions(): void {
  let totalWidth = 0;
  for (let c = 0; c < 500; c++) totalWidth += Column.getWidth(c);
  
  let totalHeight = 0;
  for (let r = 0; r < 100000; r++) totalHeight += Row.getHeight(r);

  spacer.style.width = `${totalWidth}px`;
  spacer.style.height = `${totalHeight}px`;
}

function getCellAtPixels(pixelX: number, pixelY: number): { row: number; col: number; x: number; y: number; w: number; h: number } {
  const absoluteX = pixelX + grid.scrollX;
  const absoluteY = pixelY + grid.scrollY;

  let currentX = 0, col = 0, cellX = 0, cellW = 0;
  for (let c = 0; c < 500; c++) {
    const cw = Column.getWidth(c);
    if (absoluteX >= currentX && absoluteX <= currentX + cw) {
      col = c; cellX = currentX - grid.scrollX; cellW = cw;
      break;
    }
    currentX += cw;
  }

  let currentY = 0, row = 0, cellY = 0, cellH = 0;
  for (let r = 0; r < 100000; r++) {
    const rh = Row.getHeight(r);
    if (absoluteY >= currentY && absoluteY <= currentY + rh) {
      row = r; cellY = currentY - grid.scrollY; cellH = rh;
      break;
    }
    currentY += rh;
  }

  return { row, col, x: cellX, y: cellY, w: cellW, h: cellH };
}

function checkResizeTarget(pixelX: number, pixelY: number): { type: 'col' | 'row' | null; index: number } {
  const absoluteX = pixelX + grid.scrollX;
  const absoluteY = pixelY + grid.scrollY;
  const threshold = 4; 

  let currentX = 0;
  for (let c = 0; c < 500; c++) {
    currentX += Column.getWidth(c);
    if (Math.abs(absoluteX - currentX) <= threshold) return { type: 'col', index: c };
  }

  let currentY = 0;
  for (let r = 0; r < 100000; r++) {
    currentY += Row.getHeight(r);
    if (Math.abs(absoluteY - currentY) <= threshold) return { type: 'row', index: r };
  }

  return { type: null, index: -1 };
}

container.addEventListener('scroll', () => {
  grid.scrollX = container.scrollLeft;
  grid.scrollY = container.scrollTop;
  
  if (currentEditingCell) commitEditingChanges();
  grid.render();
});

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const resizeHit = checkResizeTarget(mouseX, mouseY);

  if (resizeHit.type === 'col') {
    isResizingColumn = true;
    activeResizeIndex = resizeHit.index;
    initialMousePos = e.clientX;
    initialSize = Column.getWidth(activeResizeIndex);
  } else if (resizeHit.type === 'row') {
    isResizingRow = true;
    activeResizeIndex = resizeHit.index;
    initialMousePos = e.clientY;
    initialSize = Row.getHeight(activeResizeIndex);
  } else {
    isDraggingSelection = true;
    if (currentEditingCell) commitEditingChanges();

    const target = getCellAtPixels(mouseX, mouseY);
    grid.selection.selectCell(target.row, target.col);
    grid.render();
  }
});

window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (isResizingColumn) {
    const delta = e.clientX - initialMousePos;
    const newWidth = Math.max(30, initialSize + delta); 
    Column.setWidth(activeResizeIndex, newWidth);
    updateScrollDimensions();
    grid.render();
    return;
  }

  if (isResizingRow) {
    const delta = e.clientY - initialMousePos;
    const newHeight = Math.max(18, initialSize + delta);
    Row.setHeight(activeResizeIndex, newHeight);
    updateScrollDimensions();
    grid.render();
    return;
  }

  
  if (isDraggingSelection) {
    const target = getCellAtPixels(mouseX, mouseY);
    grid.selection.updateDragRange(target.row, target.col);
    grid.render();
    return;
  }

  
  const hit = checkResizeTarget(mouseX, mouseY);
  if (hit.type === 'col') canvas.style.cursor = 'col-resize';
  else if (hit.type === 'row') canvas.style.cursor = 'row-resize';
  else canvas.style.cursor = 'cell';
});


window.addEventListener('mouseup', (e) => {
  if (isResizingColumn) {
    const delta = e.clientX - initialMousePos;
    Column.setWidth(activeResizeIndex, initialSize);
    grid.resizeColumn(activeResizeIndex, Math.max(30, initialSize + delta));
  } else if (isResizingRow) {
    const delta = e.clientY - initialMousePos;
    Row.setHeight(activeResizeIndex, initialSize);
    grid.resizeRow(activeResizeIndex, Math.max(18, initialSize + delta));
  }

  isDraggingSelection = false;
  isResizingColumn = false;
  isResizingRow = false;
  activeResizeIndex = -1;
});
canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const cellTarget = getCellAtPixels(mouseX, mouseY);
  
  currentEditingCell = { row: cellTarget.row, col: cellTarget.col };
  const currentText = grid['pointerCell'].bindTo(cellTarget.row, cellTarget.col).value;

  editor.value = currentText;

  editor.style.left = `${cellTarget.x + container.scrollLeft}px`;
  editor.style.top = `${cellTarget.y + container.scrollTop}px`;
  editor.style.width = `${cellTarget.w}px`;
  editor.style.height = `${cellTarget.h}px`;
  editor.style.display = 'block';
  
  setTimeout(() => editor.focus(), 10);
});


function commitEditingChanges(): void {
  if (!currentEditingCell) return;
  grid.typeIntoCell(currentEditingCell.row, currentEditingCell.col, editor.value);
  editor.style.display = 'none';
  currentEditingCell = null;
}
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    commitEditingChanges();
    canvas.focus();
  } else if (e.key === 'Escape') {
    editor.style.display = 'none'; 
    currentEditingCell = null;
    canvas.focus();
  }
});

editor.addEventListener('blur', () => {
  commitEditingChanges();
});

window.addEventListener('keydown', (e) => {
  if (document.activeElement === editor) return;

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      grid.redo();
    } else {
      grid.undo();
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    grid.redo();
  }
});


updateScrollDimensions();
grid.render();

