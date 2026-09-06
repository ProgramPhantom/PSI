import { Element } from "@svgdotjs/svg.js";
import { ID } from "./point";
import Spacial, { Dimensions, SiteNames, Size } from "./spacial";
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

	get numChildren() {
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

	// ---------------- Compute Methods ----------------
	//#region 
	public computeSize(): Size {
		this.children.forEach((c) => c.computeSize());

		this.cells = Array.from({ length: this.numChildren }, () => new Spacial());

		// Compute intrinsic length of main axis:
		// This is the sum of main axis lengths:
		this.children.forEach((child, child_index) => {
			let correspondingCell: Spacial = this.cells[child_index];

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
				correspondingCell.setContentSizeByDimension(child.getSizeByDimension(this.mainAxis), this.mainAxis);
			} else {
				correspondingCell.setContentSizeByDimension(0, this.mainAxis);
			}
		});
		let intrinsicLength: number = this.cells.reduce((l, cell) => l + cell.getSizeByDimension(this.mainAxis), 0);

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
				widths.push(child.getSizeByDimension(this.crossAxis));
			}
		});
		let intrinsicWidth: number = Math.max(0, this.minCrossAxis ?? 0, ...widths);

		if (this.mainAxis === "x") {
			this.minContentWidth = intrinsicLength;
			this.minContentHeight = intrinsicWidth;
		} else {
			this.minContentWidth = intrinsicWidth;
			this.minContentHeight = intrinsicLength;
		}

		// TODO: perf improvement by stopping compute when fixed?
		if (this.sizeMode?.[this.mainAxis] !== "fixed") {
			this.setContentSizeByDimension(intrinsicLength, this.mainAxis);
		} else {
			const minMain = this.mainAxis === "x" ? this.minContentWidth : this.minContentHeight;
			this.setContentSizeByDimension(Math.max(minMain, this.getContentSizeByDimension(this.mainAxis)), this.mainAxis);
		}
		if (this.sizeMode?.[this.crossAxis] !== "fixed") {
			this.setContentSizeByDimension(intrinsicWidth, this.crossAxis);
		} else {
			const minCross = this.crossAxis === "x" ? this.minContentWidth : this.minContentHeight;
			this.setContentSizeByDimension(Math.max(minCross, this.getContentSizeByDimension(this.crossAxis)), this.crossAxis);
		}

		// Apply final cross-axis content size to all cells
		const finalCrossContentSize = this.getContentSizeByDimension(this.crossAxis);
		this.cells.forEach((cell) => {
			cell.setContentSizeByDimension(finalCrossContentSize, this.crossAxis);
		});

		return { width: this.width, height: this.height };
	}

	public computePositions(root: { x: number, y: number }): void {
		super.computePositions(root);

		var xCount = 0;
		var yCount = 0;

		// Yes this could be done with dimension setters
		if (this.mainAxis === "x") {
			this.children.forEach((child, child_index) => {
				let targetCell = this.cells[child_index];

				let contribution: boolean = true;
				if (child.placementMode.type === "aligner") {
					if (child.placementMode.config.contribution?.mainAxis === false) {
						contribution = false;
					}
					if (child.sizeMode[this.mainAxis] === "grow") {
						contribution = false;
					}
				}

				let alignmentCell = targetCell;
				if (!contribution && child_index > 0) {
					alignmentCell = this.cells[child_index - 1];
					targetCell.x = alignmentCell.x;
					targetCell.y = alignmentCell.y;
				} else {
					targetCell.x = this.cx + xCount;
					targetCell.y = this.cy;
					xCount += targetCell.getSizeByDimension(this.mainAxis);
				}

				let crossAlign: SiteNames = "centre";
				let mainAlign: SiteNames | undefined = undefined;

				if (child.placementMode.config.alignment !== undefined) {
					crossAlign = child.placementMode.config.alignment.crossAxis ?? "centre";
					mainAlign = child.placementMode.config.alignment.mainAxis;
				}

				alignmentCell.internalImmediateBind(child, "y", crossAlign);
				alignmentCell.internalImmediateBind(child, "x", mainAlign ?? "here");

				child.computePositions({ x: child.x, y: child.y });
			});
		} else {  // this.mainAxis === "y"
			this.children.forEach((child, child_index) => {
				let targetCell = this.cells[child_index];

				let contribution: boolean = true;
				if (child.placementMode.type === "aligner") {
					if (child.placementMode.config.contribution?.mainAxis === false) {
						contribution = false;
					}
					if (child.sizeMode[this.mainAxis] === "grow") {
						contribution = false;
					}
				}

				let alignmentCell = targetCell;
				if (!contribution && child_index > 0) {
					alignmentCell = this.cells[child_index - 1];
					targetCell.y = alignmentCell.y;
					targetCell.x = alignmentCell.x;
				} else {
					targetCell.y = this.cy + yCount;
					targetCell.x = this.cx;
					yCount += targetCell.getSizeByDimension(this.mainAxis);
				}

				let crossAlign: SiteNames = "centre";
				let mainAlign: SiteNames | undefined = undefined;

				if (child.placementMode.config.alignment !== undefined) {
					crossAlign = child.placementMode.config.alignment.crossAxis ?? "centre";
					mainAlign = child.placementMode.config.alignment.mainAxis;
				}

				alignmentCell.internalImmediateBind(child, "x", crossAlign);
				alignmentCell.internalImmediateBind(child, "y", mainAlign ?? "here");

				child.computePositions({ x: child.x, y: child.y });
			});
		}
	}

	public override growElement(containerSize: Size): Record<Dimensions, number> {
		let change: Record<Dimensions, number> = super.growElement(containerSize);

		// Resize cells:
		// Main axis:
		const currentTotalCellLength = this.cells.reduce((l, cell) => l + cell.getSizeByDimension(this.mainAxis), 0);
		let remainingMainAxisChange: number = this.getContentSizeByDimension(this.mainAxis) - currentTotalCellLength;
		const epsilon = 1e-5;

		if (this.cells.length === 0) {
			remainingMainAxisChange = 0;
		}

		const growableCells = this.cells.filter((cell, idx) => {
			const child = this.children[idx];
			return child && child.sizeMode?.[this.mainAxis] === "grow";
		});

		const candidateCells = growableCells.length > 0
			? growableCells
			: (this.sizeMode?.[this.mainAxis] === "grow" ? this.cells : []);

		while (remainingMainAxisChange > epsilon && candidateCells.length > 0) {
			let smallestLength: number = candidateCells[0].getSizeByDimension(this.mainAxis);
			let secondSmallestLength: number = Infinity;

			candidateCells.forEach((cell) => {
				let cellLength: number = cell.getSizeByDimension(this.mainAxis);
				if (cellLength < smallestLength - epsilon) {  // New smallest length found
					secondSmallestLength = smallestLength;
					smallestLength = cellLength;
				} else if (cellLength > smallestLength + epsilon) {
					secondSmallestLength = Math.min(secondSmallestLength, cellLength);
				}
			});

			let sizeToAdd: number = secondSmallestLength === Infinity
				? remainingMainAxisChange
				: (secondSmallestLength - smallestLength);

			let smallestCells = candidateCells.filter(cell =>
				Math.abs(cell.getSizeByDimension(this.mainAxis) - smallestLength) <= epsilon
			);

			sizeToAdd = Math.min(sizeToAdd, remainingMainAxisChange / smallestCells.length);

			const mainDimKey = this.mainAxis === "x" ? "width" : "height";
			smallestCells.forEach((cell) => {
				cell.setContentSizeByDimension(cell.contentSize[mainDimKey] + sizeToAdd, this.mainAxis);
				remainingMainAxisChange -= sizeToAdd;
			});
		}
		if (remainingMainAxisChange < -epsilon) {
			console.warn(`Aligner ${this.ref} is over spilling container on main axis`);
		}

		// Cross axis:
		const crossContentSize = this.getContentSizeByDimension(this.crossAxis);
		this.cells.forEach((cell) => {
			cell.setContentSizeByDimension(crossContentSize, this.crossAxis);
		});

		// Grow children using cell contentSize
		this.children.forEach((child, child_index) => {
			let targetCell = this.cells[child_index];

			child.growElement(targetCell.contentSize);
		});

		return change;
	}
	//#endregion
	// -------------------------------------------------

	// -------------- Add/Remove Methods ---------------
	//#region 
	public add(
		{ child, index }: AddDispatchData<T>
	) {
		super.add({ child, index })
	}

	public removeAt(index: number): boolean {
		if (index < 0 || index >= this.numChildren) {
			console.warn(`Trying to remove child at index out of range in ${this.ref}`);
			return false
		}

		let child = this.children[index];
		super.remove({ child });
		return true
	}

	public remove({ child }: RemoveDispatchData<T>): boolean {
		var INDEX: number | undefined = this.childIndex(child);

		if (INDEX === undefined) {
			return false
		}

		super.remove({ child });
		return true;
	}
	//#endregion
	// -------------------------------------------------


	// ---------------- Helpers ---------------------
	//#region 
	public childIndex(target: T): number | undefined {
		return this.locateChildById(target.id);
	}

	public setChildIndex(child: T, newIndex: number) {
		const currentIndex = this.childIndex(child);
		if (currentIndex !== undefined) {
			this.children.splice(currentIndex, 1);
			const targetIndex = Math.max(0, Math.min(newIndex, this.children.length));
			this.children.splice(targetIndex, 0, child);
		}
	}

	public getCells(): Spacial[] {
		return this.cells;
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
	//#endregion
	// -------------------------------------------------
}
