import Grid, { Elements, Ghost, GridCell, IGrid } from "../grid";
import { ID, UserComponentType } from "../point";
import RectElement, { IRectElement, IRectStyle } from "../rectElement";
import { Orientation } from "../spacial";
import Text, { IText } from "../text";
import Visual, { IVisual } from "../visual";


export interface IChannel extends IGrid {
	sequenceID?: ID;
	label: IText,
	bar: IRectElement,

	pulseElements: IVisual[]
}



export default class Channel extends Grid implements IChannel {
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
	static isPulse(element: Visual): boolean {
		return element.placementMode.type === "pulse"
	}

	get state(): IChannel {
		return {
			sequenceID: this.sequenceID,
			label: this.label.state,
			bar: this.bar.state,
			pulseElements: this.pulseElements.map((p) => p.state),
			...super.state
		};
	}

	get pulseElements(): Visual[] {
		return this.children.filter((v) => v.placementMode.type === "pulse")
	}


	sequenceID?: ID;

	label: Text;
	bar: RectElement;

	constructor(params: IChannel) {
		super(params);

		this.sequenceID = params.sequenceID;

		this.label = new Text(params.label);
		this.label.placementMode = {
			type: "grid", gridConfig: {
				alignment: { x: "centre", y: "centre" },
				coords: { row: 1, col: 0 },
				contribution: { x: true, y: false }
			}
		}
		this.label.ref = this.ref + "-label"


		this.bar = new RectElement(params.bar);
		this.bar.placementMode = {
			type: "grid", gridConfig: {
				alignment: { x: "here", y: "centre" },
				coords: { row: 1, col: 1 }
			}
		}
		this.bar.ref = this.ref + "-bar";

		this.initialiseChannel();
	}

	private initialiseChannel() {
		this.insertEmptyRow();
		this.insertEmptyRow();
		this.insertEmptyRow();

		this.insertEmptyColumn();
		this.insertEmptyColumn();

		this.addChildAtCoord(this.label, 1, 0);
		this.addChildAtCoord(this.bar, 1, 1);

		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[0] }
		}, { row: 0, column: 0 })
		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[2] }
		}, { row: 2, column: 0 })
	}

	public growBar() {
		//this.setChildSize(this.bar, {noRows: 1, noCols: this.numColumns-1});
		//this.positionElement(this.bar, {row: 1, col: 1})
		this.remove(this.bar)

		this.bar.placementMode = {
			type: "grid",
			gridConfig: {
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

		var region = this.getElementGridRegion(this.bar)!;
		this.appendElementsInRegion(region, { row: 1, col: 1 });
	}

	public addCentralElementGhosts(col: number, top: Ghost, bottom: Ghost) {
		this.appendCellAtCoord({ ghosts: [top] }, { row: 0, col: col });
		this.appendCellAtCoord({ ghosts: [bottom] }, { row: 2, col: col });
	}

	public getSpacesToNextPulse(orientation: Orientation, index: number): number {
		let rowIndex: 0 | 1 | 2 = Channel.OrientationToRow(orientation);
		let row: GridCell[] = this.getRow(rowIndex);
		let colIndex: number = index;

		let spaces: number = 0;
		var currElements: Elements<Visual> | undefined = row[colIndex]?.elements;
		var pulsesPresent: boolean = (currElements ?? []).some(e => Channel.isPulse(e));

		while (pulsesPresent === false) {
			spaces += 1;

			colIndex += 1
			if (colIndex >= this.numColumns) {
				break;
			}

			currElements = row[colIndex]?.elements;
			pulsesPresent = (currElements ?? []).some(e => Channel.isPulse(e));
		}

		return spaces;
	}
}
