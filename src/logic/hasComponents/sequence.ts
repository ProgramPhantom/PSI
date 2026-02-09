import { Element } from "@svgdotjs/svg.js";
import { AddDispatchData, RemoveDispatchData, StructuredChildEntry } from "../collection";
import Grid, { GridCell, IGrid, Subgrid } from "../grid";
import { ID, UserComponentType } from "../point";
import { Size } from "../spacial";
import Visual from "../visual";
import Channel from "./channel";



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

	get channels(): Channel[] {
		return this.structuredChildren["channel"].objects;
	}
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
		var elements: Record<ID, Visual> = { [this.id]: this };

		this.children.forEach((c) => {
			elements = { ...elements, ...c.allElements };
		});
		return elements;
	}


	structuredChildren: {
		"channel": StructuredChildEntry<Channel>
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
		super.add({ child, index })
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
	private configureChannel({ child, index }: AddDispatchData<Channel>) {
		let CHILD_INDEX: number = index ?? this.numChannels - 1;

		child.placementControl = "auto";
		child.placementMode = {
			type: "subgrid", config: {
				coords: { row: CHILD_INDEX * 3, col: 0, },
				fill: { cols: true, rows: false }
			}
		}
	}

	private removeChannel({ child }: RemoveDispatchData<Channel>) {
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
	//#endregion
	// ----------------------------------------------


	// --------------- Behaviour overrides -------------
	//#region 
	//#endregion
	// -----------------------------------------------

	// --------------- Helpers -----------------------
	//#region 
	private colHasNonStructureElement(col_index: number): boolean {
		let col: GridCell[] | undefined = this.getColumn(col_index);
		if (col === undefined) { return false } ''

		let hasPulse: boolean = false;
		for (let row_index = 0; row_index < this.numRows; row_index++) {
			let elements: Visual[] = this.getGridElementsAtCell({ row: row_index, col: col_index });
			hasPulse = elements.some(el => !this.isStructure(el));
		}

		return hasPulse;
	}

	public cellHasNonStructureElement(coords: { row: number, col: number }): boolean {
		let elementsAtCell: Visual[] = this.getGridElementsAtCell(coords);

		return elementsAtCell.some((el) => !this.isStructure(el));
	}

	private deleteEmptyColumns() {
		// Never removes column 1 or 2
		let index: number = 2;

		while (index < this.numColumns) {
			if (!this.colHasNonStructureElement(index)) {
				this.removeColumn(index);
			} else {
				index++
			}
		}
	}

	public getChannelOnRow(row: number): Channel | undefined {
		let channelIndex: number = Math.floor(row / 3);
		let channel: Channel | undefined = this.channels[channelIndex];

		return channel;
	}
	//#endregion
	// -----------------------------------------------
}
