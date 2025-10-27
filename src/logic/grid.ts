import Collection, { ICollection } from "./collection";
import { FillObject, RecursivePartial } from "./util";
import { IDraw, Visual } from "./visual";


export interface IGrid extends ICollection {

}


interface Cell {
	x: number,
	y: number,
	width: number,
	height: number
}

export default class Grid<T extends Visual = Visual> extends Collection implements IDraw {
	static defaults: {[name: string]: ICollection} = {
		default: {
			contentWidth: 0,
			contentHeight: 0,
			x: undefined,
			y: undefined,
			offset: [0, 0],
			padding: [0, 0, 0, 0],
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

	gridSizes: Cell[][] = [[]];

	constructor(params: RecursivePartial<IGrid>,
				templateName: string = Collection.defaults["default"].ref) {
		var fullParams: ICollection = FillObject<ICollection>(params, Collection.defaults[templateName]);
		super(fullParams);
		
		
	}


	draw() {

	}
}