import { Element } from "@svgdotjs/svg.js";
import Grid, { Ghost, GridCell, IGrid, OccupiedCell } from "../grid";
import { ID, UserComponentType } from "../point";
import Spacial, { Dimensions, IGridConfig, IPulseConfig, Orientation, PlacementConfiguration, SiteNames, Size } from "../spacial";
import Visual, { GridElement, PulseElement } from "../visual";
import Channel, { IChannel } from "./channel";
import { G } from "@svgdotjs/svg.js";


export interface ISequence extends IGrid<IChannel> {

}

export type OccupancyStatus = Visual | "." | undefined;


export default class Sequence extends Grid<Channel> implements ISequence {
	static ElementType: UserComponentType = "sequence";
	get state(): ISequence {
		return {
			...super.state,
			children: this.children.map((c) => c.state),
		};
	}


	get channelsDict(): Record<ID, Channel> {
		return Object.fromEntries(this.children.map((item) => [item.id, item]));
	}
	get channelIDs(): string[] {
		return this.children.map((c) => c.id);
	}
	get numChannels(): number {
		return this.children.length;
	}
	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.children.forEach((c) => {
			elements.push(...c.children);
		});
		return elements;
	}


	override get allElements(): Record<ID, Visual> {
		var elements: Record<ID, Visual> = { [this.id]: this };

		this.children.forEach((c) => {
			elements = { ...elements, ...c.allElements };
		});
		return elements;
	}

	constructor(params: ISequence) {
		super(params);
	}

	// --------------- Compute Methods ---------------
	//#region
	public override computeSize(): Size {
		var size: Size = super.computeSize();

		this.applySizesToChannels();
		return size
	}

	public override computePositions(root: { x: number, y: number }): void {
		super.computePositions(root);

		this.applySizesToChannels();
	}
	//#endregion
	// -----------------------------------------------

	// --------------- Draw Methods ----------------
	//#region

	//#endregion
	// -----------------------------------------------


	// ----------------- Add Methods -----------------
	//#region
	public override add(child: Channel) {
		// super.add(child);
		this.children.push(child);
		// Add the three rows of this channel to the bottom of the 
		// grid matrix;

		// First we need to expand the matrix (as this channel we are)
		// adding  could be longer than the matrix:

		var channelLength: number = child.numColumns;
		this.setMatrixSize({ row: undefined, col: channelLength - 1 }, true)

		// Note we don't care about the row as we will just append the 
		// rows of the channel now, there's no need to expand it

		child.getRows().forEach((row) => {
			this.gridMatrix.push(row);
		})
	}
	//#endregion
	// -----------------------------------------------


	// --------------- Remove methods ----------------
	//#region 
	public override remove(channel: Channel) {
		var channelIndex: number | undefined = this.childIndex(channel);
		super.remove(channel)

		if (channelIndex === undefined) {
			console.warn(`Cannot find index of channel with ref ${channel.ref}`)
			return
		}

		var channelStartRow = channelIndex * 3;

		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);

		// Matrix now may be over-long if the longest channel has 
		// been deleted, hence we squeeze.
		this.squeezeMatrix();  // TODO: is this why channel deletion is bugging?
	}
	//#endregion
	// ----------------------------------------------


	// ------------ Accessors ---------------------
	//#region 

	//#endregion
	// -------------------------------------------

	// -------------- Channel interaction -------------
	//#region 
	/**
	 * Applies grid slices and positional offsets to each channel in `this.channels`.
	 *
	 * For each channel at index `i` this method:
	 * - computes a base `INDEX = i * 3` and extracts 3-item slices from `this.gridMatrix` and `this.cells`,
	 *   plus a corresponding 3-item slice from `this.gridSizes.rows`.
	 * - builds a `gridSizes` object that preserves `this.gridSizes.columns` and uses the extracted row slice.
	 * - sets the channel's `x` to `this.contentX` and `y` to the `y` value of the first row in the row slice.
	 * - calls `channel.setGrid(gridSlice, gridSizes, cellSlice)` to assign the extracted grid and cells.
	 *
	 * Side effects:
	 * - Mutates each channel by setting `x`, `y`, and invoking `setGrid`.
	 *
	 * Preconditions:
	 * - `this.gridMatrix`, `this.cells`, and `this.gridSizes.rows` must be aligned and long enough so that
	 *   slicing `INDEX .. INDEX + 3` is valid for every channel.
	 *
	 * @private
	 */
	private applySizesToChannels() {
		this.children.forEach((channel, channel_index) => {
			let INDEX: number = channel_index * 3;

			let gridSlice = this.gridMatrix.slice(INDEX, INDEX + 3);

			let rowSizeSlice = this.gridSizes.rows.slice(INDEX, INDEX + 3);
			let gridSizes: { columns: Spacial[], rows: Spacial[] } = { rows: rowSizeSlice, columns: this.gridSizes.columns }

			let cellSlice = this.cells.slice(INDEX, INDEX + 3);

			channel.x = this.cx;
			channel.y = rowSizeSlice[0].y;

			channel.setGrid(gridSlice, gridSizes, cellSlice);

			let channelWidth: number = this.width;
			let channelHeight: number = rowSizeSlice.reduce((h, row) => h + row.height, 0);

			channel.width = channelWidth;
			channel.height = channelHeight;
		})
	}

	protected setChannelDimensions() {
		this.children.forEach((channel, channel_index) => {
			// Currently channels are forced to be 3 rows so we leave that
			// and just set the number of columns

			// set matrix takes index
			channel.setMatrixSize({ col: this.numColumns - 1 });
			channel.growBar();
		})
	}

	protected setChannelMatrices() {
		this.children.forEach((channel, channel_index) => {
			let INDEX: number = channel_index * 3;

			let gridSlice = this.gridMatrix.slice(INDEX, INDEX + 3);

			channel.setMatrix(gridSlice);
		})
	}
	//#endregion
	// ----------------------------------------------

	// -------------- Translation functions -------------
	//#region 
	protected pulseDataToGridConfig(data: IPulseConfig): IGridConfig | undefined {
		var channelId: ID | undefined = data.channelID;


		// We now need to convert the mount config in the pulse's placement
		// type into the exact coordinate in the grid to insert this element
		var channelIndex: number = this.childIndexById(channelId ?? "") ?? 0;



		var row: number = 0;
		var column: number = data.index ?? 0;  // Starting at 1 as we know the label goes there
		var alignment: { x: SiteNames, y: SiteNames } = { x: "centre", y: "far" }
		let contribution: Record<Dimensions, boolean> = { x: true, y: true };

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		row = channelIndex * 3;
		if (data.orientation === "both") {
			row += 1
			alignment = { x: "centre", y: "centre" }
			contribution = { x: true, y: false }
		} else if (data.orientation === "bottom") {
			row += 2
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
				{ row: row - 1, col: column },
				{ row: row + 1, col: column }
			]
		}


		return gridConfig
	}

	protected setPulseDataViaGridConfig(child: Visual, config: IGridConfig) {
		let numCols: number = config.gridSize?.noCols ?? 1;
		let index: number = config.coords?.col ?? 1;

		let channel: Channel | undefined = this.getChildById(child.parentId ?? "")

		if (channel === undefined) {
			throw new Error(`Cannot find channel for pulse ${child.id}`)
		}

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

			channelID: channel.id,
			sequenceID: this.id,
			index: index,
			clipBar: clipBar
		}
	}
	//#endregion
	// -------------------------------------------------


	// --------------- Behaviour overrides -------------
	//#region 
	public override insertEmptyColumn(index?: number) {
		super.insertEmptyColumn(index);

		// Apply this to the channels
		// This condition means this only happens when a channel is initialised.
		if (this.numColumns >= 2) {
			this.setChannelDimensions();
			this.setChannelMatrices();
		}
	}

	public override removeColumn(index?: number, onlyIfEmpty: boolean = false) {
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns - 1) {
			INDEX = this.numColumns - 1;
		}

		if (INDEX === 1 && this.numColumns === 2) {
			return
		}

		var empty: boolean = !this.colHasPulse(INDEX);

		if (onlyIfEmpty === true && empty === false) { return }

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 1);
		}

		this.setChannelDimensions();

		this.shiftElementColumnIndexes(INDEX, -1);
	}
	//#endregion
	// -----------------------------------------------

	// --------------- Helpers -----------------------
	//#region 
	private colHasPulse(col: number): boolean {
		var targetColumn: GridCell[] = this.getColumn(col);
		let present: number = 0;

		targetColumn.forEach((cell) => {
			if (cell?.elements !== undefined) {
				present += cell.elements.length;
			}
		})

		// Reliable?
		if (present > this.numChannels) {
			return true
		}

		return false
	}
	//#endregion
	// -----------------------------------------------
}
