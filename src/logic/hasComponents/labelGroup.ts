import Collection from "../collection";
import Grid, { IGrid } from "../grid";
import { UserComponentType } from "../point";
import Visual, { IVisual } from "../visual";
import Label, { ILabel } from "./label";

console.log("Load module label group")


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
			contentWidth: this.coreChild.contentWidth,
			contentHeight: this.coreChild.contentHeight
		};
	}

	get labels(): Label[] {
		return this.gridChildren.filter((c) => c.placementMode.type === "grid") as Label[]
	}

	private _coreChild: T;
	get coreChild(): T {
		return this._coreChild;
	}

	coreChildType: UserComponentType;


	constructor(
		params: ILabelGroup,
		coreChild?: T,
	) {
		super(params);

		this.coreChildType = params.coreChildType;

		if (coreChild !== undefined) {
			var coreChild: T = coreChild;
		} else {
			var coreChild: T = Collection.CreateChild(params.coreChild, params.coreChildType) as T;
		}

		this._contentHeight = coreChild.contentHeight!;
		this._contentWidth = coreChild.contentWidth!;

		this.placementMode = params.placementMode;
		// parent.mountConfig = undefined;

		// this.ref = "labelled-" + coreChild.ref;
		this.ref = coreChild.ref;

		this.setCoreChild(coreChild);

		var labels: Label[] = [];
		params.labels?.forEach((label) => {
			var newLabel = new Label(label);
			labels.push(newLabel);
			this.addLabel(newLabel);
		});
	}

	private setCoreChild(child: T) {
		this._coreChild = child;

		this.add(child, 1, 1);
	}


	addLabel(label: Label) {
		switch (label.labelConfig.labelPosition) {
			case "top":
				this.gridChildren[0][1] = label;
				break;
			case "right":
				this.gridChildren[1][2] = label;
				break;
			case "bottom":
				this.gridChildren[2][1] = label;
				break;
			case "left":
				this.gridChildren[1][0] = label;
				break;
			case "centre":
				throw new Error("Not implemented");
				break;
			default:
				throw new Error(`Unknown label bind location ${label.labelConfig.labelPosition}`);
		}
	}
}


