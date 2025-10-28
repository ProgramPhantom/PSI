import Collection, { ICollection } from "./collection";
import { Size } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { IDraw, Visual } from "./visual";


export interface IGrid extends ICollection {

}


interface Rect {
	x: number,
	y: number,
	width: number,
	height: number
}

export default class Grid<T extends Visual = Visual> extends Collection implements IDraw {
	static defaults: {[name: string]: IGrid} = {
		default: {
			contentWidth: 0,
			contentHeight: 0,
			x: undefined,
			y: undefined,
			offset: [0, 0],
			padding: [0, 0, 0, 0],
			selfAlignment:  {x: "here", y: "here"},
			sizeMode: {x: "fixed", y: "fixed"},
			ref: "default-collection",
			userChildren: []
		}
	};
	get state(): ICollection {
		return {
			userChildren: this.userChildren.map((c) => c.state),
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

	// Truth
	gridMatrix: (T | undefined)[][] = [[]];
	//
	
	gridSizes: {x: Rect[], y: Rect[]} = {x: [], y: []};
	cells: Rect[][];

	constructor(params: RecursivePartial<IGrid>,
				templateName: string = Collection.defaults["default"].ref) {
		var fullParams: IGrid = FillObject<IGrid>(params, Grid.defaults[templateName]);
		super(fullParams);

	}


	public draw() {
		// Pass
	}

	public computeSize(): Size {
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

	private getColumns(): T[][] {
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

	private getFirstAvailableCell(): {row: number, col: number} {
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

	private expandMatrix(coords: {row: number, col: number}) {
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

	private insertEmptyColumn(index?: number) {
		var newColumn: T[] = Array<T>(this.noRows).fill(undefined);
		var index = index; 

		if (index === undefined || index < 0 || index > this.noColumns) {
			index = this.noColumns 
		} 

		for (let i = 0; i < this.noRows; i++) {
      		this.markComponent[i].splice(index, 0, newColumn[i]);
    	}
	}
	private insertEmptyRow(index?: number): void {
		var newRow: T[] = Array<T>(this.noColumns).fill(undefined)
		if (index === undefined || index < 0 || index > this.noRows) {
			this.gridMatrix.push(newRow);
		} else {
			this.gridMatrix.splice(index, 0, newRow);
		}
  	}

}