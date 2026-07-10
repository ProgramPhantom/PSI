import { AddDispatchData, Components } from "../collection";
import Grid, { IGrid } from "../grid";
import { UserComponentType } from "../point";
import { isPulse } from "../spacial";
import Visual, { GridCellElement } from "../visual";
import Label from "./label";

export interface ISimpleLabelGroup extends IGrid {

}

export default class SimpleLabelGroup extends Grid {
	static isSimpleLabelGroup(val: Visual): val is SimpleLabelGroup {
		return (val as SimpleLabelGroup)?.coreChild !== undefined && val.type === "simple-label-group";
	}
	static ElementType: UserComponentType = "simple-label-group";
	get state(): ISimpleLabelGroup {
		return {
			...super.state,
		};
	}

	get coreChild(): GridCellElement<Visual> | undefined {
		let coreChild: GridCellElement<Visual> | undefined = this.roles["coreChild"].object as GridCellElement<Visual> | undefined;
		return coreChild;
	}

	get labelTop(): GridCellElement<Visual> | undefined {
		let labelTop: GridCellElement<Visual> | undefined = this.roles["labelTop"].object as GridCellElement<Visual> | undefined;
		return labelTop;
	}

	get labelBottom(): GridCellElement<Visual> | undefined {
		let labelBottom: GridCellElement<Visual> | undefined = this.roles["labelBottom"].object as GridCellElement<Visual> | undefined;
		return labelBottom;
	}

	roles: Components = {
		"coreChild": {
			object: undefined,
			initialiser: this.setCoreChild.bind(this)
		},
		"labelTop": {
			object: undefined,
			initialiser: this.addLabelTop.bind(this)
		},
		"labelBottom": {
			object: undefined,
			initialiser: this.addLabelBottom.bind(this)
		}
	}

	constructor(
		params: ISimpleLabelGroup,
	) {
		super(params);
		this.setMatrixBottomRight({ row: 2, col: 0 });
		this.squeeze = false;
	}

	private setCoreChild({ child, index }: AddDispatchData<Visual>) {
		child.placementMode = {
			type: "grid",
			config: {
				coords: { row: 1, col: 0 }
			}
		};
		child.placementControl = "auto";

		this.ref = child.ref + "-simpleLabelGroup";
	}

	addLabelTop({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto";
		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: true,
					y: (isPulse(this) && this.pulseLayoutConfig.orientation === "both") ? false : true
				}
			}
		};

		child.placementMode.config.alignment = { x: "centre", y: "far" };
		child.placementMode.config.coords = { row: 0, col: 0 };
		child.sizeMode = { x: "grow", y: "fit" };

		if (child instanceof Label) {
			child.mainAxis = "y";
		}
	}

	addLabelBottom({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto";
		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: false,
					y: false
				}
			}
		};

		child.placementMode.config.alignment = { x: "centre", y: "here" };
		child.placementMode.config.coords = { row: 2, col: 0 };
		child.sizeMode = { x: "grow", y: "fit" };

		if (child instanceof Label) {
			child.mainAxis = "y";
		}

		child.padding = [Math.max(child.padding[0], 4), child.padding[1], child.padding[2], child.padding[3]];
	}
}
