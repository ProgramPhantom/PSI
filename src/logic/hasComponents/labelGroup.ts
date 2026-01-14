import Collection from "../collection";
import Grid, { IGrid } from "../grid";
import { UserComponentType } from "../point";
import { Position } from "../text";
import Visual, { GridElement, IVisual } from "../visual";
import Label, { ILabel } from "./label";


export interface ILabelGroup extends IGrid {
	labels: Partial<Record<Position, ILabel>>;
	coreChild: IVisual;
	coreChildType: UserComponentType;
}

export default class LabelGroup
	extends Grid {
	static isLabelGroup(val: Visual): val is LabelGroup {
		return (val as LabelGroup)?.coreChild !== undefined;
	}
	static ElementType: UserComponentType = "label-group";
	get state(): ILabelGroup {
		return {
			labels: this.labelsState,
			coreChild: this.coreChild.state,
			coreChildType: this.coreChildType,
			...super.state,
		};
	}

	get labels(): Partial<Record<Position, GridElement<Label>>> {
		let record: Partial<Record<Position, GridElement<Label>>> = {};

		let top: GridElement<Label> | undefined = this.getCell({ row: 0, col: 1 })?.elements?.[0] as GridElement<Label>;
		let bottom: GridElement<Label> | undefined = this.getCell({ row: 2, col: 1 })?.elements?.[0] as GridElement<Label>;
		let left: GridElement<Label> | undefined = this.getCell({ row: 1, col: 0 })?.elements?.[0] as GridElement<Label>;
		let right: GridElement<Label> | undefined = this.getCell({ row: 1, col: 2 })?.elements?.[0] as GridElement<Label>;

		record["top"] = top;
		record["bottom"] = bottom;
		record["left"] = left;
		record["right"] = right;

		return record
	}
	get labelsState(): Partial<Record<Position, ILabel>> {
		let record: Partial<Record<Position, ILabel>> = {};

		let top: Label | undefined = this.getCell({ row: 0, col: 1 })?.elements?.[0] as Label;
		let bottom: Label | undefined = this.getCell({ row: 2, col: 1 })?.elements?.[0] as Label;
		let left: Label | undefined = this.getCell({ row: 1, col: 0 })?.elements?.[0] as Label;
		let right: Label | undefined = this.getCell({ row: 1, col: 2 })?.elements?.[0] as Label;

		if (top) { record["top"] = top.state }
		if (bottom) { record["bottom"] = bottom.state }
		if (left) { record["left"] = left.state }
		if (right) { record["right"] = right.state }

		return record
	}

	private _coreChild: T;
	get coreChild(): T {
		return this._coreChild;
	}

	coreChildType: UserComponentType;


	constructor(
		params: ILabelGroup,
		coreChild: T,
	) {
		super(params);
		this.setMatrixSize({ row: 2, col: 2 })

		this.coreChildType = params.coreChildType;

		var coreChild: T = coreChild;


		this.placementMode = params.placementMode ?? { type: "free" };

		this.ref = coreChild.ref + "-labelGroup";

		this._coreChild = coreChild;
		this.setCoreChild(coreChild);

		Object.entries(params.labels)?.forEach(([position, label]) => {
			var newLabel = new Label(label) as GridElement<Label>;

			this.addLabel(newLabel, position as Position);
		});
	}

	private setCoreChild(child: T) {
		this._coreChild = child;
		this._coreChild.placementMode = {
			type: "grid",
			config: {
				coords: { row: 1, col: 1 }
			}
		}

		this.addChildAtCoord(child, 1, 1)
	}


	addLabel(label: GridElement<Label>, position: Position) {

		label.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: true,
					y: (this.placementMode.type === "pulse" && this.placementMode.config.orientation === "both") ? false : true
				}
			}
		}


		switch (position) {
			case "top":
				label.placementMode.config.alignment = { x: "centre", y: "far" }
				label.sizeMode = { x: "grow", y: "fit" }
				label.mainAxis = "y";
				this.addChildAtCoord(label, 0, 1);
				break;
			case "right":
				label.placementMode.config.alignment = { x: "here", y: "centre" }
				label.sizeMode = { x: "fit", y: "grow" }
				label.mainAxis = "x";
				this.addChildAtCoord(label, 1, 2);
				break;
			case "bottom":
				label.placementMode.config.alignment = { x: "centre", y: "here" }
				label.sizeMode = { x: "grow", y: "fit" }
				label.mainAxis = "y";
				this.addChildAtCoord(label, 2, 1);
				break;
			case "left":
				label.placementMode.config.alignment = { x: "far", y: "centre" }
				label.sizeMode = { x: "fit", y: "grow" }
				label.mainAxis = "x";
				this.addChildAtCoord(label, 1, 0);
				break;
			case "centre":
				throw new Error("Not implemented");
				break;
			default:
				throw new Error(`Unknown label bind location ${position}`);
		}
	}
}


