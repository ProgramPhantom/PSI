import { Element } from "@svgdotjs/svg.js";
import { AddDispatchData, RemoveDispatchData, StructuredChildEntry } from "../collection";
import Grid, { GridCell, GridColumn, IGrid, Subgrid } from "../grid";
import { ID, UserComponentType } from "../point";
import { Size, } from "../spacial";
import Visual from "../visual";
import Channel from "./channel";
import { determineBindingPlacementModeType, isGridBindingRule } from "../bindingUtil";



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
				destructor: this.destroyChannel.bind(this)
			}
		}

	constructor(params: ISequence) {
		super(params);

		this.sizeMode = { x: "fit", y: "fit" }
	}

	// --------------- Compute Methods ---------------
	//#region
	public override computeSize(): Size {
		// Do this so if Channels self added a column
		// this.deleteEmptyColumns();

		var size: Size = super.computeSize();
		return size;
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
		// Fires after the channel has been added to structured children
		child.placementControl = "auto";
		child.placementMode = {
			type: "subgrid", config: {
				coords: { row: (this.numChannels - 1) * 3, col: 0, },
				fill: { cols: true, rows: false }
			}
		}
	}

	private destroyChannel({ child }: RemoveDispatchData<Channel>) {
		let startRow = child.placementMode?.config?.coords?.row ?? this.locateElement(child)?.row;
		if (startRow !== undefined && startRow >= 0) {
			let noRows = child.numRows ?? 3;
			for (let i = 0; i < noRows; i++) {
				this.removeRow(startRow);
			}
		}
	}
	//#endregion
	// ----------------------------------------------


	// --------------- Behaviour overrides -------------
	//#region 
	//#endregion
	// -----------------------------------------------

	// --------------- Helpers -----------------------
	//#region 
	public colHasNonStructureElement(col_index: number): boolean {
		let col: GridCell[] | undefined = this.getColumn(col_index);
		if (col === undefined) { return false }

		let hasNonStructureElement: boolean = false;
		for (let row_index = 0; row_index < this.numRows; row_index++) {
			let elements: Visual[] = this.getGridElementsAtCell({ row: row_index, col: col_index });
			if (elements.some(el => !this.isStructure(el)) === true) {
				hasNonStructureElement = true;
			}
		}

		return hasNonStructureElement;
	}

	public getNonStructureElementsInCol(col_index: number): Visual[] {
		let elementsInCol: Visual[] = [];
		for (let row_index = 0; row_index < this.numRows; row_index++) {
			let elements: Visual[] = this.getGridElementsAtCell({ row: row_index, col: col_index });
			for (let el of elements) {
				if (!this.isStructure(el)) {
					elementsInCol.push(el);
				}
			}
		}
		return elementsInCol;
	}

	public override removeColumn(index?: number, remove?: true | "if-empty"): void {
		if (index !== undefined) {
			// Remove pulses 
			let nonStructureElements = this.getNonStructureElementsInCol(index);
			for (let el of nonStructureElements) {
				for (let ch of this.channels) {
					if (ch.children.some(c => c.id === el.id)) {
						ch.remove({ child: el });
					}
				}
			}

			// Clean up placement rules on elements bound to this deleted column
			const removedCol = this.gridSizes.columns[index];
			if (removedCol) {
				for (const bind of removedCol.bindings) {
					const target = bind.targetObject;
					if (target && target.placementMode) {
						const pm = target.placementMode;
						if ((pm.type === "sequenceBind" || pm.type === "binds") && Array.isArray(pm.config)) {
							const remaining = pm.config.filter(
								(rule) => !(isGridBindingRule(rule) && rule.sequenceId === this.id && rule.column === index)
							);
							target.placementMode = determineBindingPlacementModeType(remaining);
						}
					}
				}
			}
		}
		super.removeColumn(index, remove);
	}

	protected override shiftColumnIndexes(from: number, amount: number = 1): void {
		super.shiftColumnIndexes(from, amount);
		this.shiftSequenceColumnBindings(from, amount);
	}

	protected shiftSequenceColumnBindings(from: number, amount: number): void {
		const updatedRules = new Set<any>();

		if (amount > 0) {
			for (let c = this.gridSizes.columns.length - 1; c >= from; c--) {
				const col = this.gridSizes.columns[c];
				if (col instanceof GridColumn) {
					const oldIndex = c - amount;
					this.updateBoundElementsForColumnShift(col, oldIndex, c, updatedRules);
				}
			}
		} else if (amount < 0) {
			for (let c = from; c < this.gridSizes.columns.length; c++) {
				const col = this.gridSizes.columns[c];
				if (col instanceof GridColumn) {
					const oldIndex = c - amount;
					this.updateBoundElementsForColumnShift(col, oldIndex, c, updatedRules);
				}
			}
		}
	}

	private updateBoundElementsForColumnShift(
		col: GridColumn,
		oldIndex: number,
		newIndex: number,
		updatedRules: Set<any>
	): void {
		for (const bind of col.bindings) {
			const target = bind.targetObject;
			if (target && target.placementMode) {
				const pm = target.placementMode;
				if ((pm.type === "sequenceBind" || pm.type === "binds") && Array.isArray(pm.config)) {
					for (const rule of pm.config) {
						if (
							!updatedRules.has(rule) &&
							isGridBindingRule(rule) &&
							rule.sequenceId === this.id &&
							rule.column === oldIndex
						) {
							rule.column = newIndex;
							updatedRules.add(rule);
						}
					}
				}
			}
		}
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
		let cell: GridCell = this.getCell({ row: row, col: 0 });
		let channel: Channel | undefined = cell?.elements?.filter(e => e instanceof Channel)?.[0];

		return channel;
	}
	//#endregion
	// -----------------------------------------------
}
