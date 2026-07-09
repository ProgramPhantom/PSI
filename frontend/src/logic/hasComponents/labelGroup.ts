import Collection, { AddDispatchData, Components, StructuredChildEntry, ClearIDs } from "../collection";
import Grid, { IGrid } from "../grid";
import { UserComponentType } from "../point";
import { isPulse } from "../spacial";
import { Position } from "../textBase";
import Visual, { GridCellElement, IVisual } from "../visual";
import Label, { ILabel } from "./label";


export interface ILabelGroup extends IGrid {

}

export default class LabelGroup
	extends Grid {
	static isLabelGroup(val: Visual): val is LabelGroup {
		return (val as LabelGroup)?.coreChild !== undefined;
	}
	static applyAnnotation(targetState: IVisual, annotationState: IVisual): ILabelGroup {
		const isTargetLabelGroup = targetState.type === "label-group" || targetState.type === "simple-label-group";

		if (!isTargetLabelGroup) {
			const pulseState = structuredClone(targetState);
			ClearIDs(pulseState);
			pulseState.role = "coreChild";
			pulseState.padding = [0, 0, 0, 0];

			const labelGroupState: ILabelGroup = {
				type: "label-group",
				ref: targetState.ref + "-labelGroup",
				parentId: targetState.parentId,
				pulseData: { ...pulseState.pulseData },
				placementMode: structuredClone(pulseState.placementMode),
				sizeMode: { x: "fit", y: "fit" },
				padding: targetState.padding ?? [0, 0, 0, 0],
				offset: [0, 0],
				contentWidth: targetState.contentWidth ?? 0,
				contentHeight: targetState.contentHeight ?? 0,
				x: targetState.x,
				y: targetState.y,
				children: [
					pulseState,
					annotationState
				]
			};
			return labelGroupState;
		} else {
			const updatedLabelGroupState = structuredClone(targetState) as ILabelGroup;
			if (!updatedLabelGroupState.children) {
				updatedLabelGroupState.children = [];
			}
			updatedLabelGroupState.children.push(annotationState);
			return updatedLabelGroupState;
		}
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
	get labelCentre(): GridCellElement<Visual> | undefined {
		let labelCentre: GridCellElement<Visual> | undefined = this.roles["labelCentre"].object as GridCellElement<Visual> | undefined;
		return labelCentre
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
		},
		"labelCentre": {
			object: undefined,
			initialiser: this.addLabelCentre.bind(this)
		}
	}



	constructor(
		params: ILabelGroup,
	) {
		super(params);
		this.setMatrixBottomRight({ row: 2, col: 2 })
		this.squeeze = false;
	}

	private setCoreChild({ child, index }: AddDispatchData<Visual>) {
		child.placementMode = {
			type: "grid",
			config: {
				coords: { row: 1, col: 1 },
				alignment: {
					"x": "centre",
					"y": "far"
				}
			}
		}
		child.placementControl = "auto"

		this.ref = child.ref + "-labelGroup";
	}

	addLabelTop({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto"
		let contributionX = true;
		let contributionY = true;
		let minPadding = 2;

		if (isPulse(this)) {
			if (this.pulseData.orientation === "bottom") {
				contributionX = false;
				contributionY = false;
				minPadding = 4;
			} else if (this.pulseData.orientation === "both") {
				contributionX = true;
				contributionY = false;
			}
		}

		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: contributionX,
					y: contributionY
				}
			}
		}

		child.placementMode.config.alignment = { x: "centre", y: "far" }
		child.placementMode.config.coords = { row: 0, col: 1 }

		if (child.type === "label") {
			child.sizeMode = { x: "grow", y: "fit" }
		} else {
			child.sizeMode = { x: "fit", y: "fit" }
		}

		child.padding[2] = Math.max(child.padding[2], minPadding);

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

		if (child.type === "label") {
			child.sizeMode = { x: "fit", y: "grow" }
		} else {
			child.sizeMode = { x: "fit", y: "fit" }
		}

		child.padding[3] = Math.max(child.padding[3], 2);

		if (child instanceof Label) {
			child.mainAxis = "x";
		}
	}

	addLabelBottom({ child, index }: AddDispatchData<Visual>) {
		child.placementControl = "auto"
		let contributionX = true;
		let contributionY = true;
		let minPadding = 2;

		if (isPulse(this)) {
			if (this.pulseData.orientation === "top") {
				contributionX = false;
				contributionY = false;
				minPadding = 4;
			} else if (this.pulseData.orientation === "both") {
				contributionX = true;
				contributionY = false;
			}
		}

		child.placementMode = {
			type: "grid",
			config: {
				contribution: {
					x: contributionX,
					y: contributionY
				}
			}
		}

		child.placementMode.config.alignment = { x: "centre", y: "here" }
		child.placementMode.config.coords = { row: 2, col: 1 }

		if (child.type === "label") {
			child.sizeMode = { x: "grow", y: "fit" }
		} else {
			child.sizeMode = { x: "fit", y: "fit" }
		}

		child.padding[0] = Math.max(child.padding[0], minPadding);

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

		if (child.type === "label") {
			child.sizeMode = { x: "fit", y: "grow" }
		} else {
			child.sizeMode = { x: "fit", y: "fit" }
		}

		child.padding[1] = Math.max(child.padding[1], 2);

		if (child instanceof Label) {
			child.mainAxis = "x";
		}
	}

	addLabelCentre({ child, index }: AddDispatchData<Visual>) {
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

		child.placementMode.config.alignment = { x: "centre", y: "centre" }
		child.placementMode.config.coords = { row: 1, col: 1 }
		// child.sizeMode = { x: "grow", y: "fixed" }

		if (child instanceof Label) {
			child.mainAxis = "y";
		}
	}
}


