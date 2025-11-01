import { Element } from "@svgdotjs/svg.js";
import Spacial, { IGridChildConfig, SiteNames, Size } from "./spacial";
import Visual, { doesDraw, IDraw, IVisual } from "./visual";
import { G } from "@svgdotjs/svg.js";

console.log(`[ModuleLoad] Grid`);

export interface IGrid extends IVisual {
	gridChildren: IVisual[]
}

type GridEntry = Visual | undefined


interface Rect {
	x: number,
	y: number,
	width: number,
	height: number
}

export default class Grid<T extends Visual = Visual> extends Visual implements IDraw {
	get state(): IGrid {
		return {
			gridChildren: this.gridChildren,
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
	get gridChildren(): T[] {
		var allChildren: T[] = [];
		
		this.gridMatrix.forEach((row) => {
			row.forEach((cell) => {
				if (cell !== undefined) {
					allChildren.push(cell);
				}
			})
		})

		return allChildren;
	}

	// Truth
	public gridMatrix: (T | undefined)[][] = [];
	//
	
	public gridSizes: {columns: Spacial[], rows: Spacial[]}= {columns: [], rows: []};
	cells: Spacial[][];

	constructor(params: IGrid) {
		super(params);

		this.cells = [];
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

		this.gridChildren.forEach((uc) => {
			if (doesDraw(uc)) {
				uc.draw(surface);
			}
		});
	}

	public computeSize(): Size {
		// First job is to compute the sizes of all children
		this.gridChildren.forEach((c) => c.computeSize());


		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		var gridColumns: GridEntry[][] = this.getColumns();
		var gridRows: GridEntry[][] = this.gridMatrix;

		// Let's compute the width and height of each column
		var columnRects: Spacial[] = Array.from({length: gridColumns.length}, () => new Spacial())
		gridColumns.forEach((col, i) => {
			var maxWidth = Math.max(...col.map((child) => child !== undefined ? child.width : 0))

			columnRects[i].width = maxWidth;

			var colHeight = col.reduce((h, c) => h + (c !== undefined ? c.height : 0), 0);
			columnRects[i].height = colHeight
		})


		// Now lets compute the width and height of each row
		var rowRects: Spacial[] = Array.from({length: gridRows.length}, () => new Spacial())
		gridRows.forEach((row, i) => {
			var maxHeight = Math.max(...row.map((child) => child !== undefined ? child.height : 0))

			rowRects[i].height = maxHeight;

			var rowWidth = row.reduce((w, c) => w + (c !== undefined ? c.width : 0), 0);
			rowRects[i].width = rowWidth
		})

		this.gridSizes.columns = columnRects;
		this.gridSizes.rows = rowRects;

		var totalWidth = this.gridSizes.columns.reduce((w, r) => w + r.width, 0);
		var totalHeight = this.gridSizes.rows.reduce((h, r) => h + r.height, 0);

		// Normalise width and height of columns/rows:
		rowRects.forEach((row) => {
			row.width = totalWidth
		})
		columnRects.forEach((col) => {
			col.height = totalHeight
		})

		this.gridSizes.rows = rowRects;
		this.gridSizes.columns = columnRects;
		
		// Set via content...
		this.contentWidth = totalWidth;
		this.contentHeight = totalHeight;

		// ...so we can use padding
		return {width: this.width, height: this.height};
	}

	public computePositions(root: {x: number, y: number}): void {
		this.x = root.x;
		this.y = root.y;

		// Find dimension and positions of the cells.
		this.computeCells();

		// Now iterate through the gridMatrix and set the position of children
		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((child, column_index) => {
				if (child !== undefined) {
					var cell: Spacial = this.cells[row_index][column_index];

					var gridConfig: IGridChildConfig;
					if (child.placementMode.type === "grid") {
						gridConfig = child.placementMode.gridConfig;
					} else {
						gridConfig = {
							coords: {row: row_index, col: column_index},
							alignment: {x: "here", y: "here"},
							size: {noRows: 1, noCols: 1}
						}
					}

					var alignment: {x: SiteNames, y: SiteNames} = gridConfig.alignment ?? {x: "here", y: "here"}

					cell.internalImmediateBind(child, "x", alignment.x)
					cell.internalImmediateBind(child, "y", alignment.y)

					child.computePositions({x: child.x, y: child.y});
				}
			})
		})
	}

	public add(child: T, row: number, column?: number) {
		var insertCoords: {row: number, col: number} | undefined;
		if (column === undefined) {
			insertCoords = this.getFirstAvailableCell();
		}
		insertCoords = {row: row, col: column}

		// Expands the matrix to fix in this coord.
		this.expandMatrix(insertCoords);
		
		// Should never happen
		if (this.gridMatrix[row][column] !== undefined) {
			throw new Error(`Position row: ${insertCoords.row} column: ${insertCoords.col} is already occupied`)
		}

		this.gridMatrix[row][column] = child;
	}

	public remove(child: T) {
		// First we need to locate this child in the matrix:
		var coords: {row: number, col: number} | undefined = this.locateChild(child);
		if (coords === undefined) {
			console.warn(`Cannot locate child ${child.ref} in grid object ${this.ref}`)
			return
		}

		this.removeAt(coords);
	}

	public removeAt(coords: {row: number, col: number}) {
		var targetCell = this.gridMatrix[coords.row][coords.col];

		if (targetCell === undefined) {
			console.warn(`Removing child in cell outside of matrix in grid ${this.ref}`)
			return 
		}

		this.gridMatrix[coords.row][coords.col] = undefined;

		// Cut off empty trailing rows and columns
		this.squeezeMatrix();
	}

	public getColumns(): GridEntry[][] {
		if (this.gridMatrix.length === 0 || this.gridMatrix[0].length === 0) {
			return [];
		}

		const numCols = this.gridMatrix[0].length;
		const columns: GridEntry[][] = [];

		for (let col = 0; col < numCols; col++) {
			const column: GridEntry[] = this.gridMatrix.map(row => row[col]);
			columns.push(column);
		}

		return columns;
	}
	public getColumn(index: number): GridEntry[] {
		return this.gridMatrix.map((row) => row[index]);
	}

	public getRows(): GridEntry[][] {
		return this.gridMatrix;
	}
	public getRow(index: number): GridEntry[] {
		return this.gridMatrix[index];
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

	protected locateChild(child: T): {row: number, col: number} | undefined {
		var coords: {row: number, col: number} = undefined;

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell && cell.id === child.id) {
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

	protected isEmpty(target: GridEntry[]): boolean {
		return !target.some((c) => c !== undefined)
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
	protected expandMatrix(coords: {row?: number, col?: number}) {
		var rowDiff: number = coords.row !== undefined ? coords.row - this.noRows + 1 : 0;
		var colDiff: number = coords.col !== undefined ? coords.col - this.noRows + 1 : 0;
		
		// There are missing rows needed to add this coord
		while (rowDiff >= 1) {
			this.insertEmptyRow()
			rowDiff -= 1
		}

		while (colDiff >= 1) {
			this.insertEmptyColumn();
			colDiff -= 1
		}
	}
	protected squeezeMatrix() {
		var trailingRow: GridEntry[] = this.getRow(this.noRows-1)
		var trailingColumn: GridEntry[] = this.getColumn(this.noColumns-1)
		
		var trailingRowEmpty: boolean = this.isEmpty(trailingRow);
		var trailingColumnEmpty: boolean = this.isEmpty(trailingColumn);

		while (trailingRowEmpty === true) {
			this.removeRow();
			var trailingRow: GridEntry[] = this.getRow(this.noRows-1);
			var trailingRowEmpty: boolean = this.isEmpty(trailingRow);
		}

		while (trailingColumnEmpty === true) {
			this.removeColumn();
			var trailingColumn: GridEntry[] = this.getColumn(this.noColumns-1);
			var trailingColumnEmpty: boolean = this.isEmpty(trailingColumn);
		}
	}

	protected insertEmptyColumn(index?: number) {
		var newColumn: T[] = Array<T>(this.noRows).fill(undefined);
		var index = index; 

		if (index === undefined || index < 0 || index > this.noColumns) {
			index = this.noColumns 
		} 

		for (let i = 0; i < this.noRows; i++) {
      		this.gridMatrix[i].splice(index, 0, newColumn[i]);
    	}
	}
	protected insertEmptyRow(index?: number): void {
		var newRow: T[] = Array<T>(this.noColumns).fill(undefined)
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

		var targetColumn: T[] = this.getColumn[INDEX];
		var empty: boolean = this.isEmpty(targetColumn)

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

		var targetRow: T[] = this.gridMatrix[INDEX];
		var empty: boolean = this.isEmpty(targetRow)

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
}