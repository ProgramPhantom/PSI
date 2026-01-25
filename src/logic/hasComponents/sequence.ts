import { AddDispatchData, RemoveDispatchData } from "../collection";
import Grid, { GridCell, IGrid } from "../grid";
import { ID, UserComponentType } from "../point";
import Spacial, { Dimensions, IGridConfig, IPulseConfig, Orientation, SiteNames, Size } from "../spacial";
import Visual from "../visual";
import Channel, { IChannel } from "./channel";

export type AddBlockDispatchData = { region: GridCell[][], coords?: { row: number, col: number } }
export interface ICanAddBlock {
	addBlock: ({ region, coords }: AddBlockDispatchData) => void
}
export function CanAddBlock(value: Visual): value is Visual & ICanAddBlock {
	return (value as any).addBlock !== undefined
}

export interface ISequence extends IGrid<IChannel> {
}


export default class Sequence extends Grid<Channel> implements ISequence, ICanAddBlock {
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
		// Do this so if Channels self added a column
		this.deleteEmptyColumns();
		this.synchroniseChannels();

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
	public override add({ child, index }: AddDispatchData<Channel>) {
		let CHILD_INDEX: number = index ?? this.numChildren;
		// super.add(child);
		this.children.splice(CHILD_INDEX, 0, child);
		// Add the three rows of this channel to the bottom of the 
		// grid matrix;

		// First we need to expand the matrix (as this channel we are)
		// adding  could be longer than the matrix:

		var channelLength: number = child.numColumns;
		this.setMatrixSize({ row: undefined, col: channelLength - 1 }, true)

		// Note we don't care about the row as we will just append the 
		// rows of the channel now, there's no need to expand it

		child.getRows().forEach((row, row_index) => {
			this.gridMatrix.splice((CHILD_INDEX * 3) + row_index, 0, row)
		})

		child.placementControl = "auto";
		child.placementMode = { type: "channel" }
	}

	public addBlock({ region, coords }: AddBlockDispatchData) {
		this.appendElementsInRegion(region, coords);
	}
	//#endregion
	// -----------------------------------------------


	// --------------- Remove methods ----------------
	//#region 
	public override remove({ child }: RemoveDispatchData<Channel>) {
		var channelIndex: number | undefined = this.childIndex(child);
		super.remove({ child })

		if (channelIndex === undefined) {
			console.warn(`Cannot find index of channel with ref ${child.ref}`)
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

	protected synchroniseChannels() {
		let longestChannel: number = Math.max(...this.children.map((c) => c.numColumns));

		this.children.forEach((channel, channel_index) => {
			// Currently channels are forced to be 3 rows so we leave that
			// and just set the number of columns

			// set matrix takes index
			channel.setMatrixSize({ col: longestChannel - 1 });
			channel.sizeBar();
		})
	}
	//#endregion
	// ----------------------------------------------


	// --------------- Behaviour overrides -------------
	//#region 
	public override insertEmptyColumn(index?: number) {
		super.insertEmptyColumn(index);

		// Apply this to the channels
		// This condition means this only happens when a channel is initialised.
		if (this.numColumns >= 2) {
			this.synchroniseChannels();
		}
	}

	public override removeColumn(index?: number, remove: true | "if-empty" = true) {
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns - 1) {
			INDEX = this.numColumns - 1;
		}

		if (INDEX === 1 && this.numColumns === 2) {
			return
		}

		var empty: boolean = !this.colHasPulse(INDEX);

		if (remove === "if-empty" && empty === false) { return }

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 1);
		}

		this.synchroniseChannels();

		this.shiftElementColumnIndexes(INDEX, -1);
	}
	//#endregion
	// -----------------------------------------------

	// --------------- Helpers -----------------------
	//#region 
	private colHasPulse(col: number): boolean {
		var targetColumn: GridCell[] | undefined = this.getColumn(col);
		if (targetColumn === undefined) { return false }

		return targetColumn.some((cell) => (cell?.elements ?? []).some(e => e.role !== "bar"));
	}

	private deleteEmptyColumns() {
		// Never removes column 1 or 2
		let index: number = 2;

		while (index < this.numColumns) {
			if (!this.colHasPulse(index)) {
				this.removeColumn(index);
			} else {
				index++
			}
		}
	}
	//#endregion
	// -----------------------------------------------
}
