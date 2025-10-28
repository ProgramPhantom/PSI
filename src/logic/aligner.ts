import { Element } from "@svgdotjs/svg.js";
import Collection, {ICollection} from "./collection";
import logger, {Processes} from "./log";
import {Alignment} from "./mountable";
import Spacial, {Dimensions, Size} from "./spacial";
import {FillObject, RecursivePartial} from "./util";
import {IVisual, Visual} from "./visual";
import { ID } from "./point";

export interface IAligner extends IVisual {
	mainAxis: Dimensions;
	minCrossAxis?: number;

	alignerChildren: IVisual[]
}

// A collection where all elements are assumed to be in a stack arrangement (either vertically or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends Visual = Visual> extends Visual implements IAligner {
	static defaults: {[name: string]: IAligner} = {
		default: {
			mainAxis: "x",
			minCrossAxis: 0,
			contentWidth: 0,
			contentHeight: 0,
			x: undefined,
			y: undefined,
			offset: [0, 0],
			padding: [0, 0, 0, 0],
			placementMode: {type: "free", position: {x: 0, y: 0}},
			ref: "default-aligner",
			alignerChildren: []
		}
	};
	get state(): IAligner {
		return {
			alignerChildren: this.alignerChildren.map((c) => c.state),
			mainAxis: this.mainAxis,
			minCrossAxis: this.minCrossAxis,
			...super.state
		};
	}


	get noChildren() {
		return this.alignerChildren.length;
	}

	mainAxis: Dimensions;
	crossAxis: Dimensions;

	minCrossAxis?: number;

	alignerChildren: T[];

	constructor(params: RecursivePartial<IAligner>, templateName: string = "default") {
		var fullParams: IAligner = FillObject<IAligner>(params, Aligner.defaults[templateName]);
		super(fullParams);

		this.mainAxis = fullParams.mainAxis;
		this.crossAxis = this.mainAxis === "x" ? "y" : "x";

		this.minCrossAxis = fullParams.minCrossAxis;
	}

	public draw(surface: Element): void {
		// TODO
	}

	public computeSize(): Size {
		var contentSize: Size = {width: 0, height: 0};

		if (this.mainAxis === "x") {
			contentSize.width = this.alignerChildren.reduce((w, c) => w + c.width, 0)
			contentSize.height = Math.max(...this.alignerChildren.map((c) => c.height))
		} else {
			contentSize.width = Math.max(...this.alignerChildren.map((c) => c.width));
			contentSize.height = this.alignerChildren.reduce((h, c) => h + c.height, 0)
		}

		this.contentWidth = contentSize.width;
		this.contentHeight = contentSize.height

		return {width: this.width, height: this.height};
	}

	public add(
		child: T,
		index?: number,
	) {
		if (index === undefined) {
			this.alignerChildren.push(child);
		} else {
			this.alignerChildren.splice(index, 0, child)
		}
	}

	public removeAt(index: number) {
		if (index < 0 || index >= this.noChildren) {
			console.warn(`Trying to remove child at index out of range in ${this.ref}`);
			return
		}

		this.alignerChildren.slice(index, 1);
	}

	public remove(target: T): boolean {
		var INDEX: number | undefined = this.locateChild(target);

		if (INDEX === undefined) {
			return false
		}

		this.removeAt(INDEX);
	}


	protected locateChild(target: T): number | undefined {
		return this.locateChildById(target.id);
	}

	protected locateChildById(id: ID): number | undefined {
		var childIndex: number | undefined = undefined;

		this.alignerChildren.forEach((child, index) => {
			if (id === child.id) {
				childIndex = index;
			}
		});

		return childIndex;
	}
}
