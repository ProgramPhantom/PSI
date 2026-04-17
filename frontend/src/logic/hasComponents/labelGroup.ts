import Collection, { AddDispatchData, Components, StructuredChildEntry } from "../collection";
import Grid, { IGrid } from "../grid";
import { UserComponentType } from "../point";
import { isPulse } from "../spacial";
import { Position } from "../text";
import Visual, { GridCellElement, IVisual } from "../visual";
import Label, { ILabel } from "./label";


export interface ILabelGroup extends IGrid {

}

export default class LabelGroup
	extends Grid {
	static isLabelGroup(val: Visual): val is LabelGroup {
		return (val as LabelGroup)?.coreChild !== undefined;
	}
	static ElementType: UserComponentType = "label-group";
	get state(): ILabelGroup {
		return {
			...super.state,
		};
	}

	get coreChild(): GridCellElement<Visual> | undefined {
		let coreChild: GridCellElement<Visual> | undefined = this.roles["coreChild"].object as GridCellElement<Visual> | undefined;
		return coreChild
	}

	get labelTop(): GridCellElement<Visual> | undefined {
		let labelTop: GridCellElement<Visual> | undefined = this.roles["labelTop"].object as GridCellElement<Visual> | undefined;
		return labelTop
	}
	get labelRight(): GridCellElement<Visual> | undefined {
		let labelRight: GridCellElement<Visual> | undefined = this.roles["labelRight"].object as GridCellElement<Visual> | undefined;
		return labelRight
	}
	get labelBottom(): GridCellElement<Visual> | undefined {
		let labelBottom: GridCellElement<Visual> | undefined = this.roles["labelBottom"].object as GridCellElement<Visual> | undefined;
		return labelBottom
	}
	get labelLeft(): GridCellElement<Visual> | undefined {
		let labelLeft: GridCellElement<Visual> | undefined = this.roles["labelLeft"].object as GridCellElement<Visual> | undefined;
		return labelLeft
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
		"labelRight": {
			object: undefined,
			initialiser: this.addLabelRight.bind(this)
		},
		"labelBottom": {
			object: undefined,
			initialiser: this.addLabelBottom.bind(this)
		},
		"labelLeft": {
			object: undefined,
			initialiser: this.addLabelLeft.bind(this)
		}
	}



	constructor(
		params: ILabelGroup,
	) {
		super(params);
		this.setMatrixBottomRight({ row: 2, col: 2 })
	}

	private setCoreChild({ child, index }: AddDispatchData<Visual>) {
		child.placementMode = {
			type: "grid",
			config: {
				coords: { row: 1, col: 1 }
			}
		}
		child.placementControl = "auto"

		this.ref = child.ref + "-labelGroup";
	}

	addLabelTop({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto"
		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: true,
					y: (isPulse(this) && this.pulseData.orientation === "both") ? false : true
				}
			}
		}

		child.placementMode.config.alignment = { x: "centre", y: "far" }
		child.placementMode.config.coords = { row: 0, col: 1 }
		child.sizeMode = { x: "grow", y: "fit" }

		if (child instanceof Label) {
			child.mainAxis = "y";
		}
	}

	addLabelRight({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto"
		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: true,
					y: (isPulse(this) && this.pulseData.orientation === "both") ? false : true
				}
			}
		}

		child.placementMode.config.alignment = { x: "here", y: "centre" }
		child.placementMode.config.coords = { row: 1, col: 2 }
		child.sizeMode = { x: "fit", y: "grow" }

		if (child instanceof Label) {
			child.mainAxis = "x";
		}
	}

	addLabelBottom({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto"
		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: true,
					y: (isPulse(this) && this.pulseData.orientation === "both") ? false : true
				}
			}
		}

		child.placementMode.config.alignment = { x: "centre", y: "here" }
		child.placementMode.config.coords = { row: 2, col: 1 }
		child.sizeMode = { x: "grow", y: "fit" }

		if (child instanceof Label) {
			child.mainAxis = "y";
		}
	}

	addLabelLeft({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto"
		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: true,
					y: (isPulse(this) && this.pulseData.orientation === "both") ? false : true
				}
			}
		}

		child.placementMode.config.alignment = { x: "far", y: "centre" }
		child.placementMode.config.coords = { row: 1, col: 0 }
		child.sizeMode = { x: "fit", y: "grow" }

		if (child instanceof Label) {
			child.mainAxis = "x";
		}
	}
}


