import { Element } from "@svgdotjs/svg.js";
import Grid, { Ghost, GridCell, IGrid, OccupiedCell } from "../grid";
import { ID, UserComponentType } from "../point";
import Spacial, { Dimensions, IGridChildConfig, IPulseConfig, Orientation, PlacementConfiguration, SiteNames, Size } from "../spacial";
import Visual from "../visual";
import Channel, { IChannel } from "./channel";
import { G } from "@svgdotjs/svg.js";


export interface ISequence extends IGrid {
	channels: IChannel[];
}

export type OccupancyStatus = Visual | "." | undefined;



export default class Sequence extends Grid implements ISequence {
	static ElementType: UserComponentType = "sequence";
	static isPulse(element: Visual): boolean {
		return element.placementMode.type === "pulse"
	}
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
	get numChannels(): number {
		return this.channels.length;
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
		this.placementModeTranslators = {
			get: this.pulseConfigToGridConfig.bind(this),
			set: this.setPulseConfigViaGridConfig.bind(this)
		}

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
			
			channel.draw(this.svg!);
			
		});
	}

	public override computeSize(): Size {
		var size: Size = super.computeSize();

		this.applySizesToChannels();
		return size
	}

	public override computePositions(root: {x: number, y: number}): void {
		super.computePositions(root);

		this.applySizesToChannels();
	}

	// Content Commands
	public addPulse(pulse: Visual) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot mount pulse with no pulse type config`)
			return
		}

		var gridConfig: IGridChildConfig = this.pulseConfigToGridConfig(pulse.placementMode)!;

		if (gridConfig.coords === undefined) {return}
		let targetChannel: Channel = this.channelsDict[pulse.placementMode.config.channelID ?? ""]
		if (targetChannel === undefined) {
			throw new Error(`Cannot find targeted channel with id ${pulse.placementMode.config.channelID}`);
		}

		let columnSpaces: number = targetChannel.getSpacesToNextPulse(pulse.placementMode.config.orientation, pulse.placementMode.config.index ?? 0);
		while (columnSpaces < (gridConfig.gridSize?.noCols ?? 1)) {
			this.insertEmptyColumn(pulse.placementMode.config.index);
			columnSpaces += 1;
		}

		this.addChildAtCoord(pulse, gridConfig.coords.row, gridConfig.coords.col);

		this.setChannelDimensions();
		this.setChannelMatrices();

		// If this pulse is placed in the "both" orientation, it needs to create two ghosts
		// above and below it to pad out the top and bottom row:
		if (pulse.placementMode.config.orientation === "both") {
			let barHeight: number = targetChannel.bar.height;
			let ghostHeight: number = (pulse.height - barHeight)/2;

			let ghost: Ghost = {size: {width: 0, height: ghostHeight}, owner: pulse.id}

			targetChannel.addCentralElementGhosts(pulse.placementMode.config.index!, ghost, ghost);

			let channelIndex: number = this.getChannelIndex(targetChannel) ?? 0;
			let channelRow: number = channelIndex * 3;
		}
	}

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
		var channelIndex: number | undefined = this.getChannelIndex(channel);

		if (channelIndex === undefined) {
			console.warn(`Cannot find index of channel with ref ${channel.ref}`)
			return
		}

		this.channels.splice(channelIndex, 1);
		
		var channelStartRow = channelIndex * 3;

		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);

		// Matrix now may be over-long if the longest channel has 
		// been deleted, hence we squeeze.
		this.squeezeMatrix();
	}

	protected getChannelIndex(channel: Channel): number | undefined {
		return this.getChannelIndexById(channel.id);
	}

	protected getChannelIndexById(id: ID): number | undefined {
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

	public colHasPulse(col: number): boolean {
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

	protected pulseConfigToGridConfig(placementMode: PlacementConfiguration): IGridChildConfig | undefined {
		if (placementMode.type === "grid") {
			return placementMode.gridConfig
		} else if (placementMode.type !== "pulse") {
			return undefined
		}
		
		var channelId: ID | undefined = placementMode.config.channelID;
		
		
		// We now need to convert the mount config in the pulse's placement
		// type into the exact coordinate in the grid to insert this element
		var channelIndex: number = this.getChannelIndexById(channelId ?? "") ?? 0;
		

		
		var row: number = 0;
		var column: number = placementMode.config.index ?? 0;  // Starting at 1 as we know the label goes there
		var alignment: {x: SiteNames, y: SiteNames} = {x: "centre", y: "far"}
		let contribution: Record<Dimensions, boolean> = {x: true, y: true};

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		row = channelIndex * 3;
		if (placementMode.config.orientation === "both") {
			row += 1
			alignment = {x: "centre", y: "centre"}
			contribution = {x: true, y: false}
		} else if (placementMode.config.orientation === "bottom") {
			row += 2
			alignment = {x: "centre", y: "here"}
		}

		let gridConfig: IGridChildConfig = {
			coords: {row: row, col: column},
			alignment: alignment,
			gridSize: {noRows: 1, noCols: placementMode.config.noSections},
			contribution: contribution,
		}

		// Inform of ghosts that have been placed by addPulse process.
		if (placementMode.config.orientation === "both") {
			gridConfig.ownedGhosts = [
				{row: row-1, col: column},
				{row: row+1, col: column}
			]
		}


		return gridConfig
	}

	protected setPulseConfigViaGridConfig(child: Visual, config: IGridChildConfig) {
		let numCols: number = config.gridSize?.noCols ?? 1;
		let index: number = config.coords?.col ?? 1;

		let channelIndex: number = Math.floor((config.coords?.row ?? 0) / 3);
		let channel: Channel = this.channels[channelIndex];

		
		let orientationIndex: 0 | 1 | 2 = ((config.coords?.row ?? 0) % 3) as 0 | 1 | 2;
		let orientation: Orientation = Channel.RowToOrientation(orientationIndex);

		let alignment: Record<Dimensions, SiteNames> = {
			x: config.alignment?.x ?? "centre",
			y: config.alignment?.y ?? "centre"
		}

		child.placementMode = {
			type: "pulse",
			config: {
				noSections: numCols,
				orientation: orientation,
				alignment: alignment,

				channelID: channel.id,
				sequenceID: this.id,
				index: index
			}
		}
	}

	public override insertEmptyColumn(index?: number) {
		super.insertEmptyColumn(index);

		// Apply this to the channels
		// This condition means this only happens when a channel is initialised.
		if (this.numColumns >= 2) {
			this.setChannelDimensions();
			this.setChannelMatrices();
		}
	}

	public override removeColumn(index?: number, onlyIfEmpty: boolean=false) {
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns-1) {
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

	protected override getElementGridRegion(child: Visual, overridePosition?: { row: number; col: number; }): OccupiedCell<Visual>[][] | undefined {
		var region: OccupiedCell<Visual>[][] | undefined;
		if (child.placementMode.type === "pulse") {
			let pulseConfig: IPulseConfig = child.placementMode.config;
			let gridConfig: IGridChildConfig | undefined = this.pulseConfigToGridConfig(child.placementMode);

			if (gridConfig === undefined) {
				return undefined
			}

			child.placementMode = {type: "grid", gridConfig: gridConfig}

			region = super.getElementGridRegion(child, overridePosition);
			child.placementMode = {type: "pulse", config: pulseConfig}
		} else if (child.placementMode) {
			region = super.getElementGridRegion(child, overridePosition)
		}

		return region;
	}

	
}
