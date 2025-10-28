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

	gridMatrix: T[][] = [[]];
	gridSizes: {x: Rect[], y: Rect[]} = {x: [], y: []};
	cells: Rect[][];

	constructor(params: RecursivePartial<IGrid>,
				templateName: string = Collection.defaults["default"].ref) {
		var fullParams: IGrid = FillObject<IGrid>(params, Grid.defaults[templateName]);
		super(fullParams);

	}


	draw() {
		// Pass
	}

	computeSize(): Size {
		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		// Let's compute the width and height of each column
		this.gridSizes.x.forEach((col, i) => {
			var colChildren = this.getColumn(i);
			var maxWidth = Math.max(...colChildren.map((child) => child.width))

			this.gridSizes.x[i].width = maxWidth;

			var colHeight = colChildren.reduce((h, c) => h + c.height, 0);
			this.gridSizes.x[i].height = colHeight
		})

		// Now lets compute the width and height of each row
		this.gridSizes.y.forEach((row, i) => {
			var rowChildren = this.gridMatrix[i];
			var maxHeight = Math.max(...rowChildren.map((child) => child.height))

			this.gridSizes.y[i].height = maxHeight;

			var rowWidth = rowChildren.reduce((w, c) => w + c.width, 0);
			this.gridSizes.y[i].width = rowWidth
		})


		var totalWidth = this.gridSizes.x.reduce((w, r) => w + r.width, 0);
		var totalHeight = this.gridSizes.y.reduce((h, r) => h + r.height, 0);
		
		// Set via content...
		this.contentWidth = totalWidth;
		this.contentHeight = totalHeight;

		// ...so we can use padding
		return {width: this.width, height: this.height};
	}


	private getColumn(index: number): T[] {
		return this.gridMatrix.map((row) => row[index]);
	}
}