import { Element } from "@svgdotjs/svg.js";
import { ID } from "./point";
import Spacial, { Dimensions, Size } from "./spacial";
import Visual, { AlignerElement, doesDraw, IVisual } from "./visual";
import { G } from "@svgdotjs/svg.js";
import Collection, { AddDispatchData, ICollection, RemoveDispatchData } from "./collection";


export interface IAligner<T extends IVisual = IVisual> extends ICollection {
	mainAxis: Dimensions;
	minCrossAxis?: number;

	children: T[]
}


// A collection where all elements are assumed to be in a stack arrangement (either vertically or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends AlignerElement = AlignerElement> extends Collection<T> implements IAligner {
	get state(): IAligner {
		return {
			mainAxis: this.mainAxis,
			minCrossAxis: this.minCrossAxis,
			...super.state
		};
	}


	get noChildren() {
		return this.children.length;
	}

	private _mainAxis: Dimensions;
	public get mainAxis(): Dimensions {
		return this._mainAxis;
	}
	public set mainAxis(value: Dimensions) {
		this._mainAxis = value;
	}
	get crossAxis(): Dimensions {
		return this.mainAxis === "x" ? "y" : "x";
	}

	minCrossAxis?: number;

	cells: Spacial[];

	constructor(params: IAligner) {
		super(params);

		this._mainAxis = params.mainAxis;

		this.minCrossAxis = params.minCrossAxis;

		this.cells = [];
	}

	public computeSize(): Size {
		if (this.ref === "label") {
			console.log()
		}
		this.children.forEach((c) => c.computeSize());

		this.cells = Array.from({ length: this.noChildren }, () => new Spacial());

		// Compute intrinsic length of main axis:
		// This is the sum of main axis lengths:
		this.children.forEach((child, child_index) => {
			let correspondingCell: Spacial = this.cells[child_index]

			let contribution: boolean = true;
			if (child.placementMode.type === "aligner") {
				if (child.placementMode.config.contribution?.mainAxis === false) {
					contribution = false;
				}
				if (child.sizeMode[this.mainAxis] === "grow") {
					contribution = false;
				}
			}

			if (contribution === true) {
				correspondingCell.setSizeByDimension(child.getSizeByDimension(this.mainAxis), this.mainAxis)
			} else {
				correspondingCell.setSizeByDimension(0, this.mainAxis)
			}
		})
		let intrinsicLength: number = this.cells.reduce((l, cell) => l + cell.getSizeByDimension(this.mainAxis), 0)

		// Find the cross axis length of the aligner;
		// This is the max cross axis size of all elements;
		let widths: number[] = [];
		this.children.forEach((child) => {
			let contribution: boolean = true;
			if (child.placementMode.type === "aligner") {
				if (child.placementMode.config.contribution?.crossAxis === false) {
					contribution = false;
				}
				if (child.sizeMode[this.crossAxis] === "grow") {
					contribution = false;
				}
			}

			if (contribution === true) {
				widths.push(child.getSizeByDimension(this.crossAxis))
			}
		})
		let intrinsicWidth: number = Math.max(...widths);
		// Apply to cells:
		this.cells.forEach((cell) => {
			cell.setSizeByDimension(intrinsicWidth, this.crossAxis)
		})


		this.setSizeByDimension(intrinsicLength, this.mainAxis)
		this.setSizeByDimension(intrinsicWidth, this.crossAxis)

		return { width: this.width, height: this.height };
	}

	public computePositions(root: { x: number, y: number }): void {
		this.x = root.x;
		this.y = root.y;

		var xCount = 0;
		var yCount = 0;

		// Yes this could be done with dimension setters
		if (this.mainAxis === "x") {
			this.children.forEach((child, child_index) => {
				let targetCell = this.cells[child_index];

				child.x = this.cx + xCount

				targetCell.x = child.x;
				targetCell.y = this.cy;

				xCount += child.width;

				// TODO: allow for other alignments
				this.internalImmediateBind(child, "y", "centre");

				child.computePositions({ x: child.x, y: child.y });
			})
		} else {  // this.mainAxis === "y"
			this.children.forEach((child, child_index) => {
				let targetCell = this.cells[child_index];

				child.y = this.cy + yCount;

				targetCell.y = child.y;
				targetCell.x = this.cx;

				yCount += child.height;

				this.internalImmediateBind(child, "x", "centre");

				child.computePositions({ x: child.x, y: child.y });
			})
		}
	}

	public override growElement(containerSize: Size): Record<Dimensions, number> {
		let change: Record<Dimensions, number> = super.growElement(containerSize)


		// Resize cells:
		// Main axis:
		let remainingMainAxisChange: number = change[this.mainAxis];
		while (remainingMainAxisChange > 0) {
			let smallestLength: number = this.children[0].getSizeByDimension(this.mainAxis);
			let secondSmallestLength: number = Infinity;
			let widthToAdd: number = remainingMainAxisChange;

			this.children.forEach((child) => {
				let childLength: number = child.getSizeByDimension(this.mainAxis);
				if (childLength < smallestLength) {
					secondSmallestLength = smallestLength
					smallestLength = childLength;
				}
				if (childLength > smallestLength) {
					secondSmallestLength = Math.min(secondSmallestLength, childLength)
					widthToAdd = secondSmallestLength - smallestLength
				}
			})

			widthToAdd = Math.min(widthToAdd, remainingMainAxisChange / this.noChildren);

			this.children.forEach((child) => {
				let childLength: number = child.getSizeByDimension(this.mainAxis);
				if (childLength === smallestLength) { /// The smallest element
					child.setSizeByDimension(widthToAdd, this.mainAxis);
					remainingMainAxisChange -= widthToAdd;
				}
			})
		}
		if (remainingMainAxisChange < 0) {
			console.warn(`Aligner ${this.ref} is over spilling container on main axis`)
		}

		// Cross axis:
		let remainingCrossAxisChange: number = change[this.crossAxis];
		let containerCrossAxisSize: number = containerSize[this.crossAxis === "x" ? "width" : "height"]
		if (remainingCrossAxisChange > 0) {
			this.cells.forEach((cell) => {
				cell.setSizeByDimension(containerCrossAxisSize, this.crossAxis)
			})
		} else if (remainingCrossAxisChange < 0) {
			console.warn(`Aligner ${this.ref} is over spilling container on cross axis`)
		}


		// TODO:
		this.children.forEach((child, child_index) => {
			let targetCell = this.cells[child_index];

			child.growElement(targetCell.contentSize);
		})

		return change;
	}

	public add(
		{ child, index }: AddDispatchData<T>
	) {
		let INDEX: number = index ?? this.children.length;

		this.children.splice(INDEX, 0, child)

		if (child.placementMode.type === "aligner") {
			child.placementMode.config.index = INDEX;
		}
		child.parentId = this.id;
	}

	public removeAt(index: number): boolean {
		if (index < 0 || index >= this.noChildren) {
			console.warn(`Trying to remove child at index out of range in ${this.ref}`);
			return false
		}

		this.children.slice(index, 1);
		return true
	}

	public remove({ child }: RemoveDispatchData<T>): boolean {
		var INDEX: number | undefined = this.childIndex(child);

		if (INDEX === undefined) {
			return false
		}

		return this.removeAt(INDEX);
	}


	public childIndex(target: T): number | undefined {
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
