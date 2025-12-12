import { Element } from "@svgdotjs/svg.js";
import Spacial, { IGridChildConfig, SiteNames, Size } from "./spacial";
import Visual, { doesDraw, IDraw, IVisual } from "./visual";
import { G } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";
import { ID } from "./point";

console.log(`[ModuleLoad] Grid`);

export interface IGrid extends ICollection {
	minHeight?: number,
	minWidth?: number
}

export type GridCell<T extends Visual=Visual> = OccupiedCell<T> | undefined

interface OccupiedCell<T> {
  element?: T;               // The element if this is the “owning” cell
  source?: { row: number; col: number }; // If this cell is covered by another
  ghost?: {width: number, height: number}  // Provide spacing to a cell
}

export default class Grid<T extends Visual = Visual> extends Collection implements IDraw {
	get state(): IGrid {
		return {
			...super.state
		};
	}
	
	get noRows(): number {
		return this.gridMatrix.length;
	}
	get noColumns(): number {
		if (this.gridMatrix[0] === undefined) {
			return 0
		} else {
			return this.gridMatrix[0].length;
		}
	}
	override get children(): T[] {
		var allChildren: T[] = [];
		
		this.gridMatrix.forEach((row) => {
			row.forEach((cell) => {
				if (cell === undefined) {return}
				if (cell.source === undefined && cell.element !== undefined) {
					allChildren.push(cell.element);
				}
			})
		})

		return allChildren;
	}

	private min: {width: number, height: number};

	// Truth
	public gridMatrix: GridCell<T>[][] = [];
	//
	
	public gridSizes: {columns: Spacial[], rows: Spacial[]} = {columns: [], rows: []};
	cells: Spacial[][];

	constructor(params: IGrid) {
		super(params);

		this.cells = [];

		this.min = {width: params.minWidth ?? 0, height: params.minHeight ?? 0};
	}


	public draw(surface: Element) {
		if (this.svg) {
			this.svg.remove();
		}

		var group = new G().id(this.id).attr({title: this.ref});
		group.attr({
			transform: `translate(${this.offset[0]}, ${this.offset[1]})`
		});

		this.svg = group;

		surface.add(this.svg);

		this.children.forEach((uc) => {
			if (doesDraw(uc)) {
				uc.draw(this.svg);
			}
		});
	}

	public computeSize(): Size {
		// First job is to compute the sizes of all children
		for (let child of this.children) {
			child.computeSize();
		}


		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		var gridColumns: GridCell<T>[][] = this.getColumns();
		var gridRows: GridCell<T>[][] = this.gridMatrix;

		// Let's compute the width and height of each column
		var columnRects: Spacial[] = Array.from({length: gridColumns.length}, () => new Spacial())
		gridColumns.forEach((col, i) => {
			var colEntries: GridCell<T>[] = col.filter((cell) => cell !== undefined);
			
			// Find width of column
			var widths: number[] = [];
			for (let cell of colEntries) {
				let contributing: boolean = true;

				if (cell.ghost !== undefined) {
					widths.push(cell.ghost.width);
				}

				if (cell.element !== undefined) {
					let child: Visual = cell.element;

					if (child.placementMode.type === "grid" && child.placementMode.gridConfig.contribution !== undefined
						&& child.placementMode.gridConfig.contribution.x === false
					) { contributing = false; }

					// Compute partial width contribution (distribute evenly):
					let width: number = child.width;

					if (child.placementMode.type === "grid" && child.placementMode.gridConfig.gridSize?.noCols > 1) {
						width = 0;
					}

					if (contributing === true) {
						widths.push(width)
					}
				}
			}

			// Set the width of this column
			var maxWidth = Math.max(...widths, this.min.width)
			columnRects[i].width = maxWidth;


			var colHeight = col.reduce((h, c) => {
				let dh = 0;
				if (c !== undefined && c.element !== undefined) {
					dh = c.element.height;

					if (c.ghost !== undefined && c.ghost.height > dh) {
						dh = c.ghost.height
					}
				}
				return h + dh;
			}, 0);
			columnRects[i].height = colHeight
		})


		// Now lets compute the width and height of each row
		var rowRects: Spacial[] = Array.from({length: gridRows.length}, () => new Spacial())
		gridRows.forEach((row, i) => {
			var rowEntries: GridCell<T>[] = row.filter((cell) => cell !== undefined);
			
			// Find height of the row
			var heights: number[] = [];
			for (let cell of rowEntries) {
				let contributing: boolean = true;

				if (cell.ghost !== undefined) {
					heights.push(cell.ghost.height);
				}

				if (cell.element !== undefined) {
					let child: Visual = cell.element;

					if (child.placementMode.type === "grid" && child.placementMode.gridConfig.contribution !== undefined
						&& child.placementMode.gridConfig.contribution.y === false
					) { contributing = false; }

					// Compute partial width contribution (distribute evenly):
					let height: number = child.height;

					if (child.placementMode.type === "grid" && child.placementMode.gridConfig.gridSize?.noRows > 1) {
						height = 0;
					}

					if (contributing === true) {
						heights.push(height)
					}
				}
			}

			// Set the width of this column
			var maxHeight = Math.max(...heights, this.min.height)
			rowRects[i].height = maxHeight;


			var rowWidth = row.reduce((w, c) => {
				let dw = 0;
				if (c !== undefined && c.element !== undefined) {
					dw = c.element.width;

					if (c.ghost !== undefined && c.ghost.width > dw) {
						dw = c.ghost.height
					}
				}
				return w + dw;
			}, 0);
			rowRects[i].width = rowWidth
		})

		this.gridSizes.columns = columnRects;
		this.gridSizes.rows = rowRects;

		var totalWidth = this.gridSizes.columns.reduce((w, c) => w + c.width, 0);
		var totalHeight = this.gridSizes.rows.reduce((h, r) => h + r.height, 0);

		// Normalise width and height of columns/rows:
		rowRects.forEach((row) => {
			row.width = totalWidth
		})
		columnRects.forEach((col) => {
			col.height = totalHeight
		})

		this.computeCellSizes();

		this.gridSizes.rows = rowRects;
		this.gridSizes.columns = columnRects;
		
		// Set via content...
		this.contentWidth = totalWidth;
		this.contentHeight = totalHeight;
		// super.computeSize();

		// ...so we can use padding
		return {width: this.width, height: this.height};
	}

	public computePositions(root: {x: number, y: number}): void {
		this.x = root.x;
		this.y = root.y;

		// Find dimension and positions of the cells.
		this.computeCells();

		// Update positions of columns and rows
		this.gridSizes.columns.forEach((col, i) => {
			col.x = this.cells[0][i].x;
			col.y = this.cells[0][0].y;
		})

		this.gridSizes.rows.forEach((row, i) => {
			row.y = this.cells[i][0].y;
			row.x = this.cells[0][0].x;
		})

		// Now iterate through the gridMatrix and set the position of children
		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell !== undefined) {
					var cellRect: Spacial = this.cells[row_index][column_index];
					var element: Visual = cell.element

					var gridConfig: IGridChildConfig;
					if (element.placementMode.type === "grid") {
						gridConfig = element.placementMode.gridConfig;
					} else {
						gridConfig = {
							coords: {row: row_index, col: column_index},
							alignment: {x: "here", y: "here"},
							gridSize: {noRows: 1, noCols: 1}
						}
					}

					var alignment: {x: SiteNames, y: SiteNames} = gridConfig.alignment ?? {x: "here", y: "here"}

					cellRect.internalImmediateBind(element, "x", alignment.x)
					cellRect.internalImmediateBind(element, "y", alignment.y)

					element.computePositions({x: element.x, y: element.y});
				}
			})
		})
	}

	public growElement(containerSize: Size) {
		super.growElement(containerSize);

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.element !== undefined && cell.source === undefined) {
					let cellRect: Spacial = this.cells[row_index][column_index];
					let childBottomRight: {row: number, col: number} = this.getChildBottomRight(cell.element);

					// Create a rect union if the child is in multiple cells
					if (childBottomRight.col !== column_index || childBottomRight.row !== row_index) {
						cellRect = this.getMultiCellRect({row: row_index, col: column_index}, childBottomRight);
					}

					cell.element.growElement(cellRect.size);
				}
			})
		})
	}

	public addChildAtCoord(child: T, row: number, column?: number) {
		var insertCoords: {row: number, col: number} | undefined;
		if (column === undefined) {
			insertCoords = this.getFirstAvailableCell();
		}
		insertCoords = {row: row, col: column}

		// Expands the matrix to fix in this coord.
		this.setMatrixSize(insertCoords, true);
		
		
		if (this.gridMatrix[row][column] !== undefined) {
			throw new Error(`Position row: ${insertCoords.row} column: ${insertCoords.col} is already occupied`)
		}

		this.gridMatrix[row][column] = {element: child};

		if (child.placementMode.type === "grid") {
			child.placementMode.gridConfig.coords = insertCoords;
		}
	}

	public setMatrixAtCoord(gridEntry: GridCell<T>, coords: {row: number, column: number}) {
		this.gridMatrix[coords.row][coords.column] = gridEntry;
	}

	public remove(child: T) {
		// First we need to locate this child in the matrix:
		var coords: {row: number, col: number} | undefined = this.locateGridChild(child);
		if (coords === undefined) {
			console.warn(`Cannot locate child ${child.ref} in grid object ${this.ref}`)
			return
		}

		this.removeAtGrid(coords);
	}

	public removeAtGrid(coords: {row: number, col: number}) {
		var targetCell = this.gridMatrix[coords.row][coords.col];

		if (targetCell === undefined) {
			console.warn(`Removing child in cell outside of matrix in grid ${this.ref}`)
			return 
		}

		this.gridMatrix[coords.row][coords.col] = undefined;

		// Cut off empty trailing rows and columns
		this.squeezeMatrix();
	}

	public getColumns(): GridCell<T>[][] {
		if (this.gridMatrix.length === 0 || this.gridMatrix[0].length === 0) {
			return [];
		}

		const numCols = this.gridMatrix[0].length;
		const columns: GridCell<T>[][] = [];

		for (let col = 0; col < numCols; col++) {
			const column: GridCell<T>[] = this.gridMatrix.map(row => row[col]);
			columns.push(column);
		}

		return columns;
	}
	public getColumn(index: number): GridCell[] {
		return this.gridMatrix.map((row) => row[index]);
	}

	public getRows(): GridCell<T>[][] {
		return this.gridMatrix;
	}
	public getRow(index: number): GridCell[] {
		return this.gridMatrix[index];
	}

	public getCells(): Spacial[] {
		return this.cells.flat();
	}

	public setGrid(grid: GridCell<T>[][], sizes: {columns: Spacial[], rows: Spacial[]}, cells: Spacial[][]) {
		this.gridMatrix = grid;
		this.gridSizes = sizes;
		this.cells = cells;
	}

	public setMatrix(matrix: GridCell<T>[][]) {
		this.gridMatrix = matrix;
	}

	public setMatrixRegion(gridRegion: GridCell<T>[][], coords?: {row: number, col: number}) {
		if (gridRegion.length === 0 || gridRegion[0].length === 0) {return}
		if (coords === undefined) {
			coords = {row: 0, col: 0}
		}

		let noRows: number = gridRegion.length;
		let noCols: number = gridRegion[0].length;

		let leftCol: number = coords.col;
		let rightCol: number = coords.col + noCols-1;
		
		let topRow: number = coords.row;
		let bottomRow: number = coords.row + noRows-1;


		this.setMatrixSize({row: bottomRow, col: rightCol}, true);

		for (let r = 0; r<noRows; r++) {
			for (let c = 0; c<noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;

				this.gridMatrix[row][col] = gridRegion[r][c]
			}
		}
	}	

	public matchRowLengths() {
		var maxRowLength = Math.max(...this.getRows().map(row => row.length));

		this.getRows().forEach((row) => {
			var rowLength = row.length;
			var diff = rowLength - maxRowLength;

			if (diff > 0) {
				row.push(...(new Array<undefined>(diff).fill(undefined)))
			}
			
		})
	}

	protected locateGridChild(child: T): {row: number, col: number} | undefined {
		var coords: {row: number, col: number} = undefined;

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.element !== undefined && cell.element.id === child.id && cell.source === undefined) {
					coords = {row: row_index, col: column_index}
				}
			})
		})

		return coords;
	}

	protected getFirstAvailableCell(): {row: number, col: number} {
		var coords: {row: number, col: number} | undefined = undefined; 
		for (let row=0; row < this.noRows; row++) {
			for (let col=0; col<this.noColumns; col++) {
				if (this.gridMatrix[row][col] === undefined) {
					coords = {row: row, col: col}
				}
			}
		}

		// If there is nowhere to insert this child, create a new row and put it there
		if (coords === undefined) {
			this.insertEmptyRow();
			coords = {row: this.noRows, col: 0}
		}

		return coords;
	}

	public getChildBottomRight(child: T): {row: number, col: number} | undefined {
		let location: {row: number, col: number} | undefined = this.locateGridChild(child);

		if (location === undefined) {return undefined}

		let right: number = location.col;
		let bottom: number = location.row;

		// Move right:
		while (this.gridMatrix[location.row][right+1] !== undefined && this.gridMatrix[location.row][right+1]?.element.id === child.id) {
			right += 1
		}

		// Move down:
		while (this.gridMatrix[bottom+1] !== undefined && this.gridMatrix[bottom+1][location.col]?.element?.id === child.id) {
			bottom += 1
		}
		
		return {row: bottom, col: right}
	}

	public getMatrixInRegion(topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}): GridCell<T>[] {
		// Check valid input:
		if (topLeft.row < bottomRight.row || topLeft.col < bottomRight.col) {
			return []
		}

		let result: GridCell<T>[] = [];

		for (let r = topLeft.row; r<=bottomRight.row; r++) {
			for (let c=topLeft.col; c<=bottomRight.col; c++) {
				result.push(this.gridMatrix[r][c]);
			}
		}

		return result;
	}

	public getCellsInRegion(topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}): Spacial[] {
		// Check valid input:
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			return []
		}

		let result: Spacial[] = [];

		for (let r = topLeft.row; r<=bottomRight.row; r++) {
			if (this.cells[r] === undefined) {continue}
			for (let c=topLeft.col; c<=bottomRight.col; c++) {
				if (this.cells[r][c] === undefined) {continue}
				result.push(this.cells[r][c]);
			}
		}

		return result;
	}

	public getMultiCellRect(topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}): Spacial {
		// Select

		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			throw new Error(`Erroneous coordinate input topLeft: {row: ${topLeft.row}, col: ${topLeft.col}}, bottomRight: {row: ${bottomRight.row}, col: ${bottomRight.col}}`)
		}

		let cells: Spacial[] = this.getCellsInRegion(topLeft, bottomRight);

		let width: number = cells.reduce((w, c) => w + c.width, 0);
		let height: number = cells.reduce((h, c) => h + c.height, 0);

		return new Spacial(0, 0, width, height);
	}

	protected isArrayEmpty(target: GridCell[]): boolean {
		return !target.some((c) => c !== undefined)
	}

	protected isCellEmptyAt(coords: {row: number, col: number}): boolean {
		let cellRow: OccupiedCell<T>[] | undefined = this.gridMatrix[coords.row];
		if (cellRow === undefined) {return true}
		let cell: OccupiedCell<T> = cellRow[coords.col];

		if (cell === undefined) {
			return true
		}

		return false
	}

	protected numChildrenOverArea(topLeft: {row: number, col: number}, size: {noRows: number, noCols: number}): number {
		let count: number = 0;
		let right: number = topLeft.col + size.noCols-1;
		let bottom: number = topLeft.row + size.noRows-1;

		for (let r = topLeft.row; r<=bottom; r++) {
			for (let c = topLeft.col; c<=right; c++) {
				let cell: GridCell<T> = this.gridMatrix[r][c];
				
				if (cell !== undefined && cell.source === undefined) {
					count += 1;
				}
			}
		}

		return count;
	}

	/**
	 * Expands the matrix by inserting empty rows and/or columns until the provided
	 * zero-based coordinate (row, col) is within the matrix bounds. This method
	 * mutates the underlying grid state by calling insertEmptyRow() and
	 * insertEmptyColumn() as needed.
	 *
	 * @protected
	 *
	 * @param coords - An object with zero-based `row` and `col` indices that must be contained by the matrix.
	 *                 If the coordinate is already within bounds, no changes are made.
	 *
	 * @remarks
	 * - The method computes how many additional rows and columns are required and
	 *   inserts them one at a time until the coordinate is reachable. The coords
	 *   parameter is *not* the number of rows and columns to be added.
	 * - Negative indices or non-integer values are not explicitly validated here;
	 *   callers should provide valid, non-negative integer indices.
	 * - Complexity is proportional to the number of inserted rows and columns.
	 *
	 * @example
	 * // ensure coordinate (5, 3) exists; will insert rows/columns as needed
	 * this.expandMatrix({ row: 5, col: 3 });
	 */
	public setMatrixSize(coords: {row?: number, col?: number}, onlyGrow: boolean=false) {
		var rowDiff: number = coords.row !== undefined ? coords.row - this.noRows + 1 : 0;
		var colDiff: number = coords.col !== undefined ? coords.col - this.noColumns + 1 : 0;
		
		// There are missing rows needed to add this coord
		while (rowDiff >= 1) {
			this.insertEmptyRow()
			rowDiff -= 1
		}

		while (colDiff >= 1) {
			this.insertEmptyColumn();
			colDiff -= 1
		}

		if (onlyGrow === false) {
			// Or if negative, we need to remove rows
			while (rowDiff < 0) {
				this.removeRow();
				rowDiff += 1
			}

			while (colDiff < 0) {
				this.removeColumn();
				colDiff += 1
			}
		}
	}
	protected squeezeMatrix() {
		var trailingRow: GridCell[] = this.getRow(this.noRows-1)
		var trailingColumn: GridCell[] = this.getColumn(this.noColumns-1)
		
		var trailingRowEmpty: boolean = this.isArrayEmpty(trailingRow);
		var trailingColumnEmpty: boolean = this.isArrayEmpty(trailingColumn);

		while (trailingRowEmpty === true) {
			this.removeRow();
			var trailingRow: GridCell[] = this.getRow(this.noRows-1);
			var trailingRowEmpty: boolean = this.isArrayEmpty(trailingRow);
		}

		while (trailingColumnEmpty === true) {
			this.removeColumn();
			var trailingColumn: GridCell[] = this.getColumn(this.noColumns-1);
			var trailingColumnEmpty: boolean = this.isArrayEmpty(trailingColumn);
		}
	}

	protected insertEmptyColumn(index?: number) {
		var newColumn: GridCell<T>[] = Array<GridCell<T>>(this.noRows).fill(undefined);
		var index = index; 

		if (index === undefined || index < 0 || index > this.noColumns) {
			index = this.noColumns 
		} 

		for (let i = 0; i < this.noRows; i++) {
      		this.gridMatrix[i].splice(index, 0, newColumn[i]);
    	}
	}
	protected insertEmptyRow(index?: number): void {
		var newRow: GridCell<T>[] = Array<GridCell<T>>(this.noColumns).fill(undefined)
		if (index === undefined || index < 0 || index > this.noRows) {
			this.gridMatrix.push(newRow);
		} else {
			this.gridMatrix.splice(index, 0, newRow);
		}
  	}

	protected removeColumn(index?: number, onlyIfEmpty: boolean=false) {
		var INDEX = index;
		if (index === undefined || index < 0 || index > this.noColumns-1) {
			INDEX = this.noColumns - 1;
		}

		var targetColumn: GridCell<T>[] = this.getColumn[INDEX];
		var empty: boolean = this.isArrayEmpty(targetColumn)

		if (onlyIfEmpty === true && !empty) { return }

		for (let i = 0; i < this.noRows; i++) {
			this.gridMatrix[i].splice(INDEX, 1);
		}
		
	}
	protected removeRow(index?: number, onlyIfEmpty: boolean=false) {
		var INDEX = index;
		if (index === undefined || index < 0 || index > this.noRows-1) {
			INDEX = this.noRows - 1;
		}

		var targetRow: GridCell<T>[] = this.gridMatrix[INDEX];
		var empty: boolean = this.isArrayEmpty(targetRow)

		if (onlyIfEmpty === true && !empty) { return }

		this.gridMatrix.splice(INDEX, 1);	
	}

	/**
	 * Computes the positions and dimensions of cells in a grid layout.
	 * Initializes the cells array with Spacial objects representing each cell's geometry.
	 * Each cell's position is calculated based on cumulative widths (x-axis) and heights (y-axis)
	 * from the grid's content origin point (contentX, contentY).
	 * 
	 * The computation uses:
	 * - gridSizes.rows[].height for row heights
	 * - gridSizes.columns[].width for column widths
	 * 
	 * @protected
	 * @returns {void}
	 */
	protected computeCells() {
		// First let's generate the sizes and positions of each cell

		this.cells = Array.from({length: this.noRows}, () => Array.from({length: this.noColumns}, () => new Spacial()));

		var xCount: number = 0;
		var yCount: number = 0;
		

		for (var row=0; row<this.noRows; row++) {
			xCount = 0;
			var rowHeight: number = this.gridSizes.rows[row].height;

			for (var col=0; col<this.noColumns; col++) {
				var colWidth: number = this.gridSizes.columns[col].width;

				this.cells[row][col] = new Spacial(this.contentX + xCount,this.contentY + yCount, colWidth, rowHeight)

				xCount += colWidth;
			}

			yCount += rowHeight;
		}
	}

	protected computeCellSizes() {
		this.cells = Array.from({length: this.noRows}, () => Array.from({length: this.noColumns}, () => new Spacial()));

		this.gridSizes.rows.forEach((row, row_index) => {
			this.gridSizes.columns.forEach((column, column_index) => {
				let targetCell = this.cells[row_index][column_index];

				targetCell.width = column.width;
				targetCell.height = row.height;
			})
		})
	}

	public setChildSize(child: T, size: {noRows: number, noCols: number}) {
		let location: {row: number, col: number} | undefined = this.locateGridChild(child)

		if (location === undefined) {
			console.warn(`Cannot locate child for size change ${child.ref}`)
			return
		}

		// Test if this growth will overlap another element:
		let overlaps: number = this.numChildrenOverArea({row: location.row, col: location.col}, {noRows: size.noRows, noCols: size.noCols})
		// This should return 1 if the area is empty (the child is in the top left)
		if (overlaps > 1) {
			return
		}

		// Create region:
		let entry: OccupiedCell<T> = {element: child, source: location}
		let region: OccupiedCell<T>[][] = Array<OccupiedCell<T>[]>(size.noRows).fill(Array<OccupiedCell<T>>(size.noCols).fill(entry))

		// Put the top left back to just the element:
		region[0][0] = {element: child};

		this.setMatrixRegion(region, location);

		if (child.placementMode.type === "grid") {
			child.placementMode.gridConfig.gridSize = {noRows: size.noRows, noCols: size.noCols}
		}
	}
}