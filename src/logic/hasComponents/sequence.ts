import { Element } from "@svgdotjs/svg.js";
import { AddDispatchData, RemoveDispatchData, StructuredChildEntry, StructuredChildren } from "../collection";
import Grid, { GridCell, IGrid, Subgrid } from "../grid";
import { ID, UserComponentType } from "../point";
import Spacial, { Size } from "../spacial";
import Visual from "../visual";
import Channel, { IChannel, SubgridChannel } from "./channel";



export interface ISequence extends IGrid {
}


export default class Sequence extends Grid implements ISequence {
	static ElementType: UserComponentType = "sequence";
	get state(): ISequence {
		return {
			...super.state,
			children: this.children.map((c) => c.state),
		};
	}

	get channels(): SubgridChannel[] {
		return this.structuredChildren["channel"].objects;
	}
	get channelsDict(): Record<ID, SubgridChannel> {
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
		var elements: Record<ID, Visual> = { [this.id]: this };

		this.children.forEach((c) => {
			elements = { ...elements, ...c.allElements };
		});
		return elements;
	}


	structuredChildren: {
		"channel": StructuredChildEntry<SubgridChannel>
	} = {
		"channel": {
			objects: [],
			initialiser: this.configureChannel.bind(this),
			destructor: this.removeChannel.bind(this),
		}
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
		return size
	}

	public override computePositions(root: { x: number, y: number }): void {
		super.computePositions(root);
	}
	//#endregion
	// -----------------------------------------------

	// --------------- Draw Methods ----------------
	//#region
	public draw(surface: Element) {
		super.draw(surface);
	}
	//#endregion
	// -----------------------------------------------


	// ----------------- Add Methods -----------------
	//#region
	public override add({ child, index }: AddDispatchData<Subgrid>) {
		super.add({child, index})
	}
	//#endregion
	// -----------------------------------------------


	// --------------- Remove methods ----------------
	//#region 
	public override remove({ child }: RemoveDispatchData<Subgrid>) {
		super.remove({ child })
	}
	//#endregion
	// ----------------------------------------------


	// ------------ Accessors ---------------------
	//#region 

	//#endregion
	// -------------------------------------------

	// -------------- Channel interaction -------------
	//#region 
	private configureChannel( {child, index}: AddDispatchData<Channel> ) {
		let CHILD_INDEX: number = index ?? this.numChannels-1;

		child.placementControl = "auto";
		child.placementMode = {type: "subgrid", config: {coords: {row: CHILD_INDEX*3, col: 0}}}
	}

	private removeChannel( {child}: RemoveDispatchData<SubgridChannel>) {
		var channelIndex: number | undefined = this.childIndex(child);

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

	protected synchroniseChannels() {
		let longestChannel: number = Math.max(...this.channels.map((c) => c.numColumns));

		this.channels.forEach((channel, channel_index) => {
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

	// public override removeColumn(index?: number, remove: true | "if-empty" = true) {
	// 	let INDEX: number | undefined = index;
	// 	if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns - 1) {
	// 		INDEX = this.numColumns - 1;
	// 	}
// 
	// 	if (INDEX === 1 && this.numColumns === 2) {
	// 		return
	// 	}
// 
	// 	var empty: boolean = !this.colHasPulse(INDEX);
// 
	// 	if (remove === "if-empty" && empty === false) { return }
// 
	// 	for (let i = 0; i < this.numRows; i++) {
	// 		this.gridMatrix[i].splice(INDEX, 1);
	// 	}
// 
	// 	this.synchroniseChannels();
// 
	// 	this.shiftElementColumnIndexes(INDEX, -1);
	// }
	//#endregion
	// -----------------------------------------------

	// --------------- Helpers -----------------------
	//#region 
	private colHasPulse(col: number): boolean {
		return this.channels.some(c => c.colHasPulse(col));
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
