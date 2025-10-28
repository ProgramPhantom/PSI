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

	// Truth
	gridMatrix: T[][] = [[]];
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


}