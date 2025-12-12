import { Element } from "@svgdotjs/svg.js";
import { ID } from "./point";
import Spacial, { Dimensions, Size } from "./spacial";
import Visual, { doesDraw, IVisual } from "./visual";
import { G } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";

console.log("Load module aligner")

export interface IAligner<T extends IVisual = IVisual> extends ICollection {
	mainAxis: Dimensions;
	minCrossAxis?: number;

	children: T[]
}

// A collection where all elements are assumed to be in a stack arrangement (either vertically or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends Visual = Visual> extends Collection<T> implements IAligner {
	get state(): IAligner {
		return {
			children: this.children.map((c) => c.state),
			mainAxis: this.mainAxis,
			minCrossAxis: this.minCrossAxis,
			...super.state
		};
	}


	get noChildren() {
		return this.children.length;
	}

	mainAxis: Dimensions;
	crossAxis: Dimensions;

	minCrossAxis?: number;

	cells: Spacial[];

	constructor(params: IAligner) {
		super(params);

		this.mainAxis = params.mainAxis;
		this.crossAxis = this.mainAxis === "x" ? "y" : "x";

		this.minCrossAxis = params.minCrossAxis;
	}

	public draw(surface: Element): void {
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
		this.children.forEach((c) => c.computeSize());

		var contentSize: Size = {width: 0, height: 0};
		this.cells = Array.from({length: this.noChildren}, () => new Spacial());

		if (this.mainAxis === "x") {
			contentSize.width = this.children.reduce((w, c) => w + c.width, 0)
			contentSize.height = Math.max(...this.children.map((c) => c.height))

			this.cells.forEach((cell, cell_index) => {
				var target: T = this.children[cell_index];
				cell.width = target.width;
				cell.height = contentSize.height;
			})

		} else {
			contentSize.width = Math.max(...this.children.map((c) => c.width));
			contentSize.height = this.children.reduce((h, c) => h + c.height, 0);

			this.cells.forEach((cell, cell_index) => {
				var target: T = this.children[cell_index];
				cell.height = target.height;
				cell.width = contentSize.width
			})
		}

		this.contentWidth = contentSize.width;
		this.contentHeight = contentSize.height

		return {width: this.width, height: this.height};
	}

	public computePositions(root: {x: number, y: number}): void {
		this.x = root.x;
		this.y = root.y;

		var xCount = 0;
		var yCount = 0;


		// Yes this could be done with dimension setters
		if (this.mainAxis === "x") {
			this.children.forEach((child, child_index) => {
				let targetCell = this.cells[child_index];

				child.x = this.contentX + xCount
				
				targetCell.x = child.x;
				targetCell.y = this.contentY;

				xCount += child.width;

				// TODO: allow for other alignments
				this.internalImmediateBind(child, "y", "centre");

				child.computePositions({x: child.x, y: child.y});
			})
		} else {  // this.mainAxis === "y"
			this.children.forEach((child, child_index) => {
				let targetCell = this.cells[child_index];

				child.y = this.contentY + yCount;
				
				targetCell.y = child.y;
				targetCell.x = this.contentX;
				
				yCount += child.height;
			
				this.internalImmediateBind(child, "x", "centre");

				child.computePositions({x: child.x, y: child.y});
			})
		}
	}

	public override growElement(containerSize: Size) {
		super.growElement(containerSize)

		// TODO:
		this.children.forEach((child, child_index) => {
			let targetCell = this.cells[child_index];
		
			child.growElement(targetCell.contentSize);	
		})
	}

	public add(
		child: T,
		index?: number,
	) {
		if (index === undefined) {
			this.children.push(child);
		} else {
			this.children.splice(index, 0, child)
		}
	}

	public removeAt(index: number) {
		if (index < 0 || index >= this.noChildren) {
			console.warn(`Trying to remove child at index out of range in ${this.ref}`);
			return
		}

		this.children.slice(index, 1);
	}

	public remove(target: T): boolean {
		var INDEX: number | undefined = this.locateChild(target);

		if (INDEX === undefined) {
			return false
		}

		this.removeAt(INDEX);
	}


	public locateChild(target: T): number | undefined {
		return this.locateChildById(target.id);
	}

	protected locateChildById(id: ID): number | undefined {
		var childIndex: number | undefined = undefined;

		this.children.forEach((child, index) => {
			if (id === child.id) {
				childIndex = index;
			}
		});

		return childIndex;
	}
}
