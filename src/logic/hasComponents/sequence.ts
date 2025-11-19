import Grid, { IGrid } from "../grid";
import { AllComponentTypes, ID, UserComponentType } from "../point";
import Spacial, { IGridChildConfig, IMountConfig, SiteNames, Size } from "../spacial";
import Visual from "../visual";
import Channel, { IChannel } from "./channel";

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
			elements.push(...c.gridChildren);
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

	public override computeSize(): Size {
		var size: Size = super.computeSize();

		// Set the channels' sizes.

		var sequenceRows: Visual[][] = this.getRows();
		this.channels.forEach((channel, i) => {
			var rowIndex: number = 3 * i;

			channel.gridMatrix = [
				sequenceRows[rowIndex],
				sequenceRows[rowIndex+1],
				sequenceRows[rowIndex+2]
			]

			channel.computeSize();
		})

		this.applyToChannels();
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
			row.forEach((child, column_index) => {
				if (child !== undefined) {
					var cell: Spacial = this.cells[row_index][column_index];

					var gridConfig: IGridChildConfig;
					if (child.placementMode.type === "grid") {
						gridConfig = child.placementMode.gridConfig;
					} else if (cell.placementMode.type === "pulse") {
						gridConfig = this.mountConfigToGridConfig(cell.placementMode.config);
					} else {
						gridConfig = {
							coords: {row: row_index, col: column_index},
							alignment: {x: "here", y: "here"},
							gridSize: {noRows: 1, noCols: 1}
						}
					}

					var alignment: {x: SiteNames, y: SiteNames} = gridConfig.alignment ?? {x: "here", y: "here"}

					cell.internalImmediateBind(child, "x", alignment.x)
					cell.internalImmediateBind(child, "y", alignment.y)
					

					child.computePositions({x: child.x, y: child.y});
				}
			})
		})

		this.applyToChannels();
	}

	public addPulse(pulse: Visual) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot mount pulse with no pulse type config`)
			return
		}

		var config: IMountConfig = pulse.placementMode.config;

		var gridConfig: IGridChildConfig = this.mountConfigToGridConfig(config);


		this.add(pulse, gridConfig.coords.row, gridConfig.coords.col);
	}

	// Content Commands
	public addChannel(channel: Channel) {
		this.channels.push(channel);
		
		// Add the three rows of this channel to the bottom of the 
		// grid matrix;

		// First we need to expand the matrix (as this channel we are)
		// adding  could be longer than the matrix:

		var channelLength: number = channel.noColumns;
		this.expandMatrix({row: undefined, col: channelLength-1})
		
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

	private applyToChannels() {
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

	protected mountConfigToGridConfig(mountConfig: IMountConfig): IGridChildConfig {
		var channelId: ID = mountConfig.channelID; 

		// We now need to convert the mount config in the pulse's placement
		// type into the exact coordinate in the grid to insert this element
		var channelIndex = this.locateChannelById(channelId);

		var row: number = 0;
		var column: number = 1;  // Starting at 1 as we know the label goes there

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		row = channelIndex * 3;
		if (mountConfig.orientation === "both") {
			row += 1
		} else if (mountConfig.orientation === "bottom") {
			row += 2
		}

		// ---------- Column ------------
		column += mountConfig.index;  // Shift along by index


		return {
			coords: {row: row, col: column},
			alignment: mountConfig.alignment,
			gridSize: {noRows: 1, noCols: mountConfig.noSections}
		}
	}
}
