import { RolesDict } from "../collection";
import Grid, { Elements, Ghost, GridCell, IGrid } from "../grid";
import { BAR_MASK_ID, ID, UserComponentType } from "../point";
import RectElement, { IRectElement } from "../rectElement";
import { Dimensions, IGridConfig, IPulseConfig, isPulse, Orientation, PlacementConfiguration, SiteNames, Size } from "../spacial";
import Text, { IText } from "../text";
import Visual, { GridElement } from "../visual";


export interface IChannel extends IGrid {
	sequenceID?: ID;
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


	get state(): IChannel {
		return {
			...super.state
		};
	}

	get pulseElements(): Visual[] {
		return this.children.filter((v) => isPulse(v))
	}

	get label(): GridElement<Text> | undefined {
		let label: GridElement<Text> | undefined = this.roles["label"].object as GridElement<Text> | undefined;

		return label
	}
	get bar(): GridElement<RectElement> | undefined {
		let bar: GridElement<RectElement> | undefined = this.roles["bar"].object as GridElement<RectElement> | undefined;

		return bar
	}

	roles: RolesDict = {
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

		if (params.sequenceID !== undefined) {
			
		}
	

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

		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[0] }
		}, { row: 0, column: 0 })
		this.setMatrixAtCoord({
			ghosts: [{ size: { width: 0, height: 10 } }],
			extra: { width: 0, height: this.padding[2] }
		}, { row: 2, column: 0 })

	}

	public override add(child: GridElement) {
		if (isPulse(child)) {
			this.setGridConfigViaPulseData(child, child.pulseData);

			// If this pulse is placed in the "both" orientation, it needs to create two ghosts
			// above and below it to pad out the top and bottom row:
			if (child.pulseData.orientation === "both") {
				let barHeight: number = this.bar?.height ?? 0;
				let ghostHeight: number = (child.height - barHeight) / 2;

				let ghost: Ghost = { size: { width: 0, height: ghostHeight }, owner: child.id }

				this.addCentralElementGhosts(child.pulseData.index!, ghost, ghost);
			}

			this.sizeBar()
		}

		

		super.add(child);
	}

	public remove(child: GridElement, deleteIfEmpty?: { row: boolean, col: boolean }, modifying?: boolean) {
		//let remove: {row: boolean, col: boolean } = {row: false, col: isPulse(child)}
		//
		//// Never remove the first pulse column
		//if (this.numColumns === 2) {
		//	remove.col = false
		//}
		
		super.remove(child)
	}

	public sizeBar() {
		if (this.bar === undefined) {
			return
		}

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

		super.add(this.bar);
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

	private initialiseBar(bar: Visual) {
		bar.maskId = BAR_MASK_ID;
		bar.placementMode = {
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
		bar.ref = this.ref + "-bar";
	}

	private initialiseLabel(label: Visual) {
		label.placementMode = {
			type: "grid", config: {
				alignment: { x: "centre", y: "centre" },
				coords: { row: 1, col: 0 },
				contribution: { x: true, y: false }
			}
		}
	}

	// -------------- Translation functions -------------
	//#region 
	protected setGridConfigViaPulseData(child: Visual, data: IPulseConfig) {
		var row: number = Channel.OrientationToRow(data.orientation);
		var column: number = data.index ?? 0;  // Starting at 1 as we know the label goes there
		var alignment: { x: SiteNames, y: SiteNames } = { x: "centre", y: "far" }
		let contribution: Record<Dimensions, boolean> = { x: true, y: true };

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		if (data.orientation === "both") {
			alignment = { x: "centre", y: "centre" }
			contribution = { x: true, y: false }
		} else if (data.orientation === "bottom") {
			alignment = { x: "centre", y: "here" }
		}

		let gridConfig: IGridConfig = {
			coords: { row: row, col: column },
			alignment: alignment,
			gridSize: { noRows: 1, noCols: data.noSections },
			contribution: contribution,
		}

		// Inform of ghosts that have been placed by addPulse process.
		if (data.orientation === "both") {
			gridConfig.ownedGhosts = [
				{ row: 0, col: column },
				{ row: 2, col: column }
			]
		}

		child.placementMode = {
			type: "grid",
			config: gridConfig
		}
	}

	protected setPulseDataViaGridConfig(child: Visual, config: IGridConfig) {
		let numCols: number = config.gridSize?.noCols ?? 1;
		let index: number = config.coords?.col ?? 1;


		let orientationIndex: 0 | 1 | 2 = ((config.coords?.row ?? 0) % 3) as 0 | 1 | 2;
		let orientation: Orientation = Channel.RowToOrientation(orientationIndex);

		let alignment: Record<Dimensions, SiteNames> = {
			x: config.alignment?.x ?? "centre",
			y: config.alignment?.y ?? "centre"
		}

		let clipBar: boolean = false;
		if (child.pulseData !== undefined && child.pulseData.clipBar === true) {
			clipBar = true;
		}

		child.pulseData = {
			noSections: numCols,
			orientation: orientation,
			alignment: alignment,

			channelID: this.id,
			sequenceID: this.parentId,
			index: index,
			clipBar: clipBar
		}
	}
	//#endregion
	// -------------------------------------------------
}
