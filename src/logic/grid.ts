import Collection from "./collection";
import Spacial, { Dimensions, IMountConfig, SiteNames, Size } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { IDraw, IVisual, Visual } from "./visual";


export interface IGrid extends IVisual {
	gridChildren: IVisual[]
}


export interface IGridChildConfig {
	coords: {row: number, col: number}
	alignment: Record<Dimensions, SiteNames>
	size: {noRows: number, noCols: number}
}


interface Rect {
	x: number,
	y: number,
	width: number,
	height: number
}

export default class Grid<T extends Visual = Visual> extends Visual implements IDraw {
	static defaults: {[name: string]: IGrid} = {
		default: {
			contentWidth: 0,
			contentHeight: 0,
			x: undefined,
			y: undefined,
			offset: [0, 0],
			padding: [0, 0, 0, 0],
			placementMode: {type: "free", sizeMode: "fit"},
			gridChildren: [],
			ref: "default-collection",
		}
	};
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
	protected gridMatrix: (T | undefined)[][] = [];
	//
	
	gridSizes: {x: Rect[], y: Rect[]} = {x: [], y: []};
	cells: Spacial[][];

	constructor(params: RecursivePartial<IGrid>,
				templateName: string = Collection.defaults["default"].ref) {
		var fullParams: IGrid = FillObject<IGrid>(params, Grid.defaults[templateName]);
		super(fullParams);

	}


	public draw() {
		// Pass
	}

	public computeSize(): Size {
		// First job is to compute the sizes of all children
		this.gridChildren.forEach((c) => c.computeSize());


		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		var columns: T[][] = this.getColumns();
		var rows: T[][] = this.gridMatrix;

		// Let's compute the width and height of each column
		var columnRects: Rect[] = Array<Rect>(columns.length).fill({width: 0, height: 0, x: 0, y: 0})
		columns.forEach((col, i) => {
			var maxWidth = Math.max(...col.map((child) => child.width))

			columnRects[i].width = maxWidth;

			var colHeight = col.reduce((h, c) => h + c.height, 0);
			columnRects[i].height = colHeight
		})


		// Now lets compute the width and height of each row
		var rowRects: Rect[] = Array<Rect>(rows.length).fill({width: 0, height: 0, x: 0, y: 0})
		rows.forEach((row, i) => {
			var maxHeight = Math.max(...row.map((child) => child.height))

			rowRects[i].height = maxHeight;

			var rowWidth = row.reduce((w, c) => w + c.width, 0);
			rowRects[i].width = rowWidth
		})

		this.gridSizes.x = columnRects;
		this.gridSizes.y = rowRects;

		var totalWidth = this.gridSizes.x.reduce((w, r) => w + r.width, 0);
		var totalHeight = this.gridSizes.y.reduce((h, r) => h + r.height, 0);
		
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

					cell.internalImmediateBind(child, "x", gridConfig.alignment.x)
					cell.internalImmediateBind(child, "y", gridConfig.alignment.y)

					child.computePositions({x: cell.x, y: cell.y});
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

	protected getColumns(): T[][] {
		if (this.gridMatrix.length === 0 || this.gridMatrix[0].length === 0) {
			return [];
		}

		const numCols = this.gridMatrix[0].length;
		const columns: T[][] = [];

		for (let col = 0; col < numCols; col++) {
			const column: T[] = this.gridMatrix.map(row => row[col]);
			columns.push(column);
		}

		return columns;
	}
	protected getColumn(index: number): T[] {
		return this.gridMatrix.map((row) => row[index]);
	}

	public getRows(): T[][] {
		return this.gridMatrix;
	}
	protected getRow(index: number): T[] {
		return this.gridMatrix[index];
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

	protected isEmpty(target: T[]): boolean {
		return !target.some((c) => c !== undefined)
	}

	protected expandMatrix(coords: {row: number, col: number}) {
		var rowDiff: number = coords.row - this.noRows + 1;
		var colDiff: number = coords.col - this.noColumns + 1;
		
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
		var trailingRow: T[] = this.getRow(this.noRows-1)
		var trailingColumn: T[] = this.getColumn(this.noColumns-1)
		
		var trailingRowEmpty: boolean = this.isEmpty(trailingRow);
		var trailingColumnEmpty: boolean = this.isEmpty(trailingColumn);

		while (trailingRowEmpty === true) {
			this.removeRow();
			var trailingRow: T[] = this.getRow(this.noRows-1);
			var trailingRowEmpty: boolean = this.isEmpty(trailingRow);
		}

		while (trailingColumnEmpty === true) {
			this.removeColumn();
			var trailingColumn: T[] = this.getColumn(this.noColumns-1);
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

	protected computeCells() {
		// First let's generate the sizes and positions of each cell

		this.cells = Array<Spacial[]>(this.noRows).fill(Array<Spacial>(this.noColumns).fill(new Spacial()));

		var xCount: number = 0;
		var yCount: number = 0;
		

		for (var row=0; row<this.noRows; row++) {
			xCount = 0;
			var rowHeight: number = this.gridSizes.y[row].height;

			for (var col=0; col<this.noColumns; col++) {
				var colWidth: number = this.gridSizes.x[col].width;

				this.cells[row][col] = new Spacial(this.contentX + xCount,this.contentY + yCount, colWidth, rowHeight)

				xCount += colWidth;
			}

			yCount += rowHeight;
		}
	}
}