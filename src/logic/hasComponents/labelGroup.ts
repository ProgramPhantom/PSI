import Collection from "../collection";
import Grid, { IGrid } from "../grid";
import { UserComponentType } from "../point";
import Visual, { IVisual } from "../visual";
import Label, { ILabel } from "./label";


export interface ILabelGroup extends IGrid {
	labels: ILabel[];
	coreChild: IVisual;
	coreChildType: UserComponentType;
}

export default class LabelGroup<T extends Visual = Visual>
	extends Grid
{
	static isLabelGroup(val: Visual): val is LabelGroup {
		return (val as LabelGroup)?.coreChild !== undefined;
	}
	static ElementType: UserComponentType = "label-group";
	// Todo: fix this
	get state(): ILabelGroup {
		return {
			labels: this.labels.map((l) => {
				return l.state;
			}),
			coreChild: this.coreChild.state,
			coreChildType: this.coreChildType,
			...super.state,
		};
	}

	get labels(): Label[] {
		return this.children.filter((c) => c.placementMode.type === "grid") as Label[]
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
		this.setMatrixSize({row: 2, col: 2})

		this.coreChildType = params.coreChildType;

		var coreChild: T = coreChild;


		this.placementMode = params.placementMode ?? {type: "free"};

		this.ref = coreChild.ref + "-labelGroup";

		this._coreChild = coreChild;
		this.setCoreChild(coreChild);

		params.labels?.forEach((label) => {
			var newLabel = new Label(label);

			this.addLabel(newLabel);
		});
	}

	private setCoreChild(child: T) {
		this._coreChild = child;
		this._coreChild.placementMode = {
			type: "managed"
		}

		this.addChildAtCoord(child, 1, 1)
	}


	addLabel(label: Label) {
		
		label.placementMode = {
			type: "grid",
			gridConfig: {
				contribution: {
					x: true,
					y: (this.placementMode.type === "pulse" && this.placementMode.config.orientation === "both") ? false : true
				}
			}
		}

		
		switch (label.labelConfig.labelPosition) {
			case "top":
				label.placementMode.gridConfig.alignment = {x: "centre", y: "far"}
				label.sizeMode = {x: "grow", y: "fixed"}
				this.addChildAtCoord(label, 0, 1);
				break;
			case "right":
				label.placementMode.gridConfig.alignment = {x: "here", y: "centre"}
				label.sizeMode = {x: "fixed", y: "grow"}
				this.addChildAtCoord(label, 1, 2);
				break;
			case "bottom":
				label.placementMode.gridConfig.alignment = {x: "centre", y: "here"}
				label.sizeMode = {x: "grow", y: "fixed"}
				this.addChildAtCoord(label, 2, 1);
				break;
			case "left":
				label.placementMode.gridConfig.alignment = {x: "far", y: "centre"}
				label.sizeMode = {x: "fixed", y: "grow"}
				this.addChildAtCoord(label, 1, 0);
				break;
			case "centre":
				throw new Error("Not implemented");
				break;
			default:
				throw new Error(`Unknown label bind location ${label.labelConfig.labelPosition}`);
		}
	}
}


