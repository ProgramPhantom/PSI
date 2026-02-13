import { AddDispatchData, Components, RemoveDispatchData } from "../collection";
import Grid, { Elements, Ghost, GridCell, IGrid, ISubgrid, Subgrid } from "../grid";
import { BAR_MASK_ID, ID, UserComponentType } from "../point";
import RectElement from "../rectElement";
import { Dimensions, IGridConfig, IPulseConfig, isPulse, ISubgridConfig, Orientation, SiteNames, Size } from "../spacial";
import Text from "../text";
import Visual, { GridCellElement } from "../visual";


export interface IChannel extends ISubgrid {
	sequenceID?: ID;
}


export default class Channel extends Subgrid implements IChannel {
	static ElementType: UserComponentType = "channel";
	static OrientationToRow(orientation: Orientation): 0 | 1 | 2 {
		let row: 0 | 1 | 2 = 0
		switch (orientation) {
			case "top":
				row = 0;
				break;
			case "both":
				row = 1;
				break;
			case "bottom":
				row = 2;
				break;
		}
		return row;
	}
	static RowToOrientation(row: 0 | 1 | 2): Orientation {
		let orientation: Orientation = "top";
		switch (row) {
			case 0:
				orientation = "top";
				break;
			case 1:
				orientation = "both";
				break;
			case 2:
				orientation = "bottom";
				break;
		}
		return orientation;
	}


	get pulseElements(): Visual[] {
		return this.children.filter((v) => isPulse(v))
	}

	get label(): GridCellElement<Text> | undefined {
		let label: GridCellElement<Text> | undefined = this.roles["label"].object as GridCellElement<Text> | undefined;
		return label
	}
	get bar(): GridCellElement<RectElement> | undefined {
		let bar: GridCellElement<RectElement> | undefined = this.roles["bar"].object as GridCellElement<RectElement> | undefined;
		return bar
	}

	roles: Components = {
		"label": {
			object: undefined,
			initialiser: this.initialiseLabel.bind(this)
		},
		"bar": {
			object: undefined,
			initialiser: this.initialiseBar.bind(this)
		}
	}

	constructor(params: IChannel) {
		super(params);

		this.initialiseChannel();
		this.role = "channel"
	}

	override computeSize(): Size {
		return super.computeSize();
	}

	private initialiseChannel() {
		this.insertEmptyRow();
		this.insertEmptyRow();
		this.insertEmptyRow();

		this.insertEmptyColumn();
		this.insertEmptyColumn();

		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[0] }
		}, { row: 0, column: 0 })
		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[2] }
		}, { row: 2, column: 0 })

		this.placementMode.config.fill = { rows: false, cols: true }
	}

	public override add({ child }: AddDispatchData<GridCellElement>) {
		this.sizeBar()

		super.add({ child });
	}

	public remove({ child }: RemoveDispatchData<GridCellElement>) {
		//let remove: {row: boolean, col: boolean } = {row: false, col: isPulse(child)}
		//
		//// Never remove the first pulse column
		//if (this.numColumns === 2) {
		//	remove.col = false
		//}

		super.remove({ child })
	}

	public sizeBar() {
		if (this.bar === undefined) {
			return
		}


		let barRef = this.bar;
		barRef.placementMode = {
			type: "grid",
			config: {
				gridSize: {
					noCols: this.numColumns - 1,
					noRows: 1
				},
				coords: {
					row: 1,
					col: 1
				},
				alignment: {
					x: "here",
					y: "centre"
				}
			}
		}

		// This will recompute state
		this.remove({ child: this.bar })
		super.add({ child: barRef });
	}

	public addCentralElementGhosts(col: number, top: Ghost, bottom: Ghost) {
		this.appendToCellAtCoord({ ghosts: [top] }, { row: 0, col: col });
		this.appendToCellAtCoord({ ghosts: [bottom] }, { row: 2, col: col });
	}

	public getSpacesToNextPulse(orientation: Orientation, index: number): number {
		let rowIndex: 0 | 1 | 2 = Channel.OrientationToRow(orientation);
		let row: GridCell[] | undefined = this.getRow(rowIndex);
		if (row === undefined) {
			throw new Error(`Row with index ${index} undefined`)
		}

		let colIndex: number = index;

		let spaces: number = 0;
		var currElements: Elements<Visual> | undefined = row[colIndex]?.elements;
		var pulsesPresent: boolean = (currElements ?? []).some(e => isPulse(e));

		while (pulsesPresent === false) {
			spaces += 1;

			colIndex += 1
			if (colIndex >= this.numColumns) {
				break;
			}

			currElements = row[colIndex]?.elements;
			pulsesPresent = (currElements ?? []).some(e => isPulse(e));
		}

		return spaces;
	}

	public override insertEmptyColumn(index?: number): void {
		super.insertEmptyColumn(index)
		this.sizeBar();
	}

	private initialiseBar({ child, index }: AddDispatchData) {
		child.maskId = BAR_MASK_ID;
		child.placementMode = {
			type: "grid",
			config: {
				gridSize: {
					noCols: this.numColumns - 1,
					noRows: 1
				},
				coords: {
					row: 1,
					col: 1
				},
				alignment: {
					x: "here",
					y: "centre"
				}
			}
		}
		child.ref = this.ref + "-bar";
	}

	private initialiseLabel({ child, index }: AddDispatchData) {
		child.placementMode = {
			type: "grid", config: {
				alignment: { x: "centre", y: "centre" },
				coords: { row: 1, col: 0 },
				contribution: { x: true, y: false }
			}
		}
	}
}
