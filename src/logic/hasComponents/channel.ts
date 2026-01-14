import Grid, { Elements, Ghost, GridCell, IGrid } from "../grid";
import { BAR_MASK_ID, ID, UserComponentType } from "../point";
import RectElement, { IRectElement } from "../rectElement";
import { Dimensions, IGridConfig, Orientation, PlacementConfiguration, SiteNames, Size } from "../spacial";
import Text, { IText } from "../text";
import Visual, { GridElement } from "../visual";
import { SequenceElement } from "./sequence";


export interface IChannel extends IGrid {
	sequenceID?: ID;
	label: IText,
	bar: IRectElement,
}



export default class Channel extends Grid<SequenceElement> implements IChannel {
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
			...super.state
		};
	}

	get pulseElements(): Visual[] {
		return this.children.filter((v) => Grid.isPulseElement(v))
	}


	sequenceID?: ID;

	label: GridElement<Text>;
	bar: GridElement<RectElement>;

	constructor(params: IChannel) {
		super(params);
		this.placementModeTranslators = {
			get: this.pulseConfigToGridConfig,
			set: this.setPulseConfigViaGridConfig
		}

		this.sequenceID = params.sequenceID;

		this.label = new Text(params.label) as GridElement<Text>;
		this.label.placementMode = {
			type: "grid", config: {
				alignment: { x: "centre", y: "centre" },
				coords: { row: 1, col: 0 },
				contribution: { x: true, y: false }
			}
		}
		this.label.ref = this.ref + "-label";
		this.label = this.label as GridElement<Text>;


		this.bar = new RectElement(params.bar) as GridElement<RectElement>;
		this.bar.maskId = BAR_MASK_ID;
		this.bar.placementMode = {
			type: "grid", config: {
				alignment: { x: "here", y: "centre" },
				coords: { row: 1, col: 1 }
			}
		}
		this.bar.ref = this.ref + "-bar";

		this.initialiseChannel();
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

		this.add(this.label);
		this.add(this.bar);

		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[0] }
		}, { row: 0, column: 0 })
		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[2] }
		}, { row: 2, column: 0 })
	}

	public override add(child: SequenceElement) {
		super.add(child);
	}

	public growBar() {
		//this.setChildSize(this.bar, {noRows: 1, noCols: this.numColumns-1});
		//this.positionElement(this.bar, {row: 1, col: 1})
		this.remove(this.bar)

		this.bar.placementMode = {
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


	// -------------- Translation functions -------------
	//#region 
	protected pulseConfigToGridConfig(placementMode: PlacementConfiguration): IGridConfig | undefined {
		if (placementMode.type === "grid") {
			return placementMode.config
		} else if (placementMode.type !== "pulse") {
			return undefined
		}

		var channelId: ID | undefined = placementMode.config.channelID;


		var row: number = 0;
		var column: number = placementMode.config.index ?? 0;  // Starting at 1 as we know the label goes there
		var alignment: { x: SiteNames, y: SiteNames } = { x: "centre", y: "far" }
		let contribution: Record<Dimensions, boolean> = { x: true, y: true };

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		row = Channel.OrientationToRow(placementMode.config.orientation)
		if (placementMode.config.orientation === "both") {
			row += 1
			alignment = { x: "centre", y: "centre" }
			contribution = { x: true, y: false }
		} else if (placementMode.config.orientation === "bottom") {
			row += 2
			alignment = { x: "centre", y: "here" }
		}

		let gridConfig: IGridConfig = {
			coords: { row: row, col: column },
			alignment: alignment,
			gridSize: { noRows: 1, noCols: placementMode.config.noSections },
			contribution: contribution,
		}

		// Inform of ghosts that have been placed by addPulse process.
		if (placementMode.config.orientation === "both") {
			gridConfig.ownedGhosts = [
				{ row: row - 1, col: column },
				{ row: row + 1, col: column }
			]
		}


		return gridConfig
	}

	protected setPulseConfigViaGridConfig(child: Visual, config: IGridConfig) {
		let numCols: number = config.gridSize?.noCols ?? 1;
		let index: number = config.coords?.col ?? 1;

		let channelIndex: number = Math.floor((config.coords?.row ?? 0) / 3);
		let channel: Channel = this;


		let orientationIndex: 0 | 1 | 2 = ((config.coords?.row ?? 0) % 3) as 0 | 1 | 2;
		let orientation: Orientation = Channel.RowToOrientation(orientationIndex);

		let alignment: Record<Dimensions, SiteNames> = {
			x: config.alignment?.x ?? "centre",
			y: config.alignment?.y ?? "centre"
		}

		let clipBar: boolean = false;
		if (child.placementMode.type === "pulse" && child.placementMode.config.clipBar === true) {
			clipBar = true;
		}

		child.placementMode = {
			type: "pulse",
			config: {
				noSections: numCols,
				orientation: orientation,
				alignment: alignment,

				channelID: channel.id,
				sequenceID: this.id,
				index: index,
				clipBar: clipBar
			}
		}
	}
	//#endregion
	// -------------------------------------------------
}
