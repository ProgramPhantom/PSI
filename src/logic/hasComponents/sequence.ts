import { Element } from "@svgdotjs/svg.js";
import Grid, { GridCell, IGrid } from "../grid";
import { ID, UserComponentType } from "../point";
import Spacial, { IGridChildConfig, IMountConfig, SiteNames, Size } from "../spacial";
import Visual from "../visual";
import Channel, { IChannel } from "./channel";
import { G } from "@svgdotjs/svg.js";

console.log("Load module sequence")

export interface ISequence extends IGrid {
	channels: IChannel[];
}

export type OccupancyStatus = Visual | "." | undefined;



export default class Sequence extends Grid implements ISequence {
	static ElementType: UserComponentType = "sequence";
	get state(): ISequence {
		return {
			channels: this.channels.map((c) => c.state),
			...super.state
		};
	}

	channels: Channel[];


	get channelsDict(): Record<ID, Channel> {
		return Object.fromEntries(this.channels.map((item) => [item.id, item]));
	}
	get channelIDs(): string[] {
		return this.channels.map((c) => c.id);
	}
	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.channels.forEach((c) => {
			elements.push(...c.children);
		});
		return elements;
	}

	override get allElements(): Record<ID, Visual> {
		var elements: Record<ID, Visual> = {[this.id]: this};

		this.channels.forEach((c) => {
			elements = {...elements, ...c.allElements};
		});
		return elements;
	}

	constructor(params: ISequence) {
		super(params);

		this.channels = [];

		params.channels.forEach((c) => {
			var newChan = new Channel(c);
			this.addChannel(newChan);
		});
	}

	public override draw(surface: Element) {
		if (this.svg) {
			this.svg.remove();
		}

		var group = new G().id(this.id).attr({title: this.ref});
		group.attr({
			transform: `translate(${this.offset[0]}, ${this.offset[1]})`
		});

		this.svg = group;

		surface.add(this.svg);

		this.channels.forEach((channel) => {
			channel.draw(this.svg);
		});
	}

	public override computeSize(): Size {
		var size: Size = super.computeSize();

		// Set the channels' sizes.

		var sequenceRows: GridCell[][] = this.getRows();
		this.channels.forEach((channel, i) => {
			var rowIndex: number = 3 * i;

			channel.gridMatrix = [
				sequenceRows[rowIndex],
				sequenceRows[rowIndex+1],
				sequenceRows[rowIndex+2]
			]

			channel.computeSize();
		})

		this.applySizesToChannels();
		return size
	}

	public override computePositions(root: {x: number, y: number}): void {
		this.x = root.x;
		this.y = root.y;

		// Find dimension and positions of the cells.
		this.computeCells();

		// Update positions of columns and rows
		this.gridSizes.columns.forEach((col, i) => {
			col.x = this.cells[0][i].x;
			col.y = this.cells[0][0].y;
		})

		this.gridSizes.rows.forEach((row, i) => {
			row.y = this.cells[i][0].y;
			row.x = this.cells[0][0].x;
		})

		// Now iterate through the gridMatrix and set the position of children
		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.element !== undefined && cell.source === undefined) {
					var cellRect: Spacial = this.cells[row_index][column_index];
					var element: Visual = cell.element;

					var gridConfig: IGridChildConfig;
					if (element.placementMode.type === "grid") {
						gridConfig = element.placementMode.gridConfig;
					} else if (element.placementMode.type === "pulse") {
						gridConfig = this.mountConfigToGridConfig(element.placementMode.config);
					} else {
						gridConfig = {
							coords: {row: row_index, col: column_index},
							alignment: {x: "here", y: "here"},
							gridSize: {noRows: 1, noCols: 1}
						}
					}

					var alignment: {x: SiteNames, y: SiteNames} = gridConfig.alignment ?? {x: "here", y: "here"}

					cellRect.internalImmediateBind(element, "x", alignment.x)
					cellRect.internalImmediateBind(element, "y", alignment.y)
					

					element.computePositions({x: element.x, y: element.y});
				}
			})
		})

		this.applySizesToChannels();
	}

	public addPulse(pulse: Visual) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot mount pulse with no pulse type config`)
			return
		}

		var config: IMountConfig = pulse.placementMode.config;

		var gridConfig: IGridChildConfig = this.mountConfigToGridConfig(config);

		

		// Insert column if occupied:
		if (this.gridMatrix[gridConfig.coords.row][gridConfig.coords.col] !== undefined) {
			this.insertEmptyColumn(gridConfig.coords.col);
		}

		this.addChildAtCoord(pulse, gridConfig.coords.row, gridConfig.coords.col);

		// this.growChannels();
		this.setChannelDimensions();
		this.setChannelMatrices();
	}

	// Content Commands
	public addChannel(channel: Channel) {
		this.channels.push(channel);
		
		// Add the three rows of this channel to the bottom of the 
		// grid matrix;

		// First we need to expand the matrix (as this channel we are)
		// adding  could be longer than the matrix:

		var channelLength: number = channel.numColumns;
		this.setMatrixSize({row: undefined, col: channelLength-1}, true)
		
		// Note we don't care about the row as we will just append the 
		// rows of the channel now, there's no need to expand it
		
		channel.getRows().forEach((row) => {
			this.gridMatrix.push(row);
		})
	
	}

	public deleteChannel(channel: Channel) {
		var channelIndex = this.locateChannel(channel);

		this.channels.splice(channelIndex, 1);
		
		var channelStartRow = channelIndex * 3;

		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);

		// Matrix now may be over-long if the longest channel has 
		// been deleted, hence we squeeze.
		this.squeezeMatrix();
	}

	protected locateChannel(channel: Channel) {
		return this.locateChannelById(channel.id);
	}

	protected locateChannelById(id: ID): number | undefined {
		var channelIndex: number | undefined = undefined;

		this.channels.forEach((child, index) => {
			if (id === child.id) {
				channelIndex = index;
			}
		});

		return channelIndex;
	}

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
		this.channels.forEach((channel, channel_index) => {
			let INDEX: number = channel_index * 3;

			let gridSlice = this.gridMatrix.slice(INDEX, INDEX+3);

			let rowSizeSlice = this.gridSizes.rows.slice(INDEX, INDEX+3);
			let gridSizes: {columns: Spacial[], rows: Spacial[]} = {rows: rowSizeSlice, columns: this.gridSizes.columns}

			let cellSlice = this.cells.slice(INDEX, INDEX+3);

			channel.x = this.contentX;
			channel.y = rowSizeSlice[0].y;

			channel.setGrid(gridSlice, gridSizes, cellSlice);

		})
	}

	protected setChannelDimensions() {
		this.channels.forEach((channel, channel_index) => {
			// Currently channels are forced to be 3 rows so we leave that
			// and just set the number of columns

			// set matrix takes index
			channel.setMatrixSize({col: this.numColumns-1});
			channel.growBar();
		})
	}

	protected setChannelMatrices() {
		this.channels.forEach((channel, channel_index) => {
			let INDEX: number = channel_index * 3;

			let gridSlice = this.gridMatrix.slice(INDEX, INDEX+3);

			channel.setMatrix(gridSlice);
		})
	}

	private growChannels() {
		this.channels.forEach((c) => {
			if (c.bar.placementMode.type === "grid") {
				c.bar.placementMode.gridConfig.gridSize = {noRows: 1, noCols: this.numColumns-1}
			}
		})
	}

	protected mountConfigToGridConfig(mountConfig: IMountConfig): IGridChildConfig {
		var channelId: ID = mountConfig.channelID; 

		// We now need to convert the mount config in the pulse's placement
		// type into the exact coordinate in the grid to insert this element
		var channelIndex = this.locateChannelById(channelId);

		var row: number = 0;
		var column: number = mountConfig.index;  // Starting at 1 as we know the label goes there
		var alignment: {x: SiteNames, y: SiteNames} = {x: "centre", y: "far"}

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		row = channelIndex * 3;
		if (mountConfig.orientation === "both") {
			row += 1
		} else if (mountConfig.orientation === "bottom") {
			row += 2
			alignment = {x: "centre", y: "here"}
		}

		// ---------- Column ------------
		// column += mountConfig.index;  // Shift along by index


		return {
			coords: {row: row, col: column},
			alignment: alignment,
			gridSize: {noRows: 1, noCols: mountConfig.noSections}
		}
	}

	protected override insertEmptyColumn(index?: number) {
		var newColumn: GridCell[] = Array<GridCell>(this.numRows).fill(undefined);
		var index = index; 

		if (index === undefined || index < 0 || index > this.numColumns) {
			index = this.numColumns 
		} 

		for (let i = 0; i < this.numRows; i++) {
      		this.gridMatrix[i].splice(index, 0, newColumn[i]);
    	}

		// Apply this to the channels
		// This condition means this only happens when a channel is initialised.
		if (this.numColumns >= 2) {
			

			// We need to move the bar sources back one and reset their size.
			if (index === 1) {
				this.channels.forEach((channel, channel_index) => {
					let INDEX: number = channel_index * 3;
					let bar_row: number = INDEX + 1;

					this.gridMatrix[bar_row][1] = this.gridMatrix[bar_row][2];
					this.gridMatrix[bar_row][2] = {element: channel.bar, source: {row: bar_row, col: 2}};

					if (channel.bar.placementMode.type === "grid") {
						channel.bar.placementMode.gridConfig.gridSize = {noRows: 1, noCols: this.numColumns-1}
					}
				})
			}

			this.channels.forEach((channel) => {
				this.setChannelMatrices();
			})
		}
		
	}
}
