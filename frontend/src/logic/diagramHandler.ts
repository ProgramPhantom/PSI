import { Rect, Svg } from "@svgdotjs/svg.js";
import { sha256 } from 'js-sha256';
import { appToaster } from "../app/Toaster.tsx";
import Collection, { AddDispatchData, CanAdd, CanRemove, RemoveDispatchData } from "./collection.ts";
import { BLANK_DIAGRAM } from "./default/blankDiagram.ts";
import { DEFAULT_DIAGRAM } from "./default/defaultDiagram.ts";
import { ISubgrid } from "./grid.ts";
import Channel, { IChannel } from "./hasComponents/channel.ts";
import Diagram, { IDiagram } from "./hasComponents/diagram.ts";
import Sequence from "./hasComponents/sequence.ts";
import { AllComponentTypes, ID } from "./point.ts";
import Visual, { IDraw, IVisual } from "./visual.ts";
import RBush from "rbush";
import { IBindsPlacementConfig, RBushItem } from "./spacial.ts";


/**
 * Decorator that automatically calls this.draw() after a method execution,
 * but only if the method returns a Result object with ok: true
 */
function draws(
	target: IDraw,
	propertyKey: string,
	descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
) {
	const originalMethod = descriptor.value;

	if (originalMethod) {
		descriptor.value = function (this: DiagramHandler, ...args: any[]) {
			const result = originalMethod.apply(this, args);

			// Only call draw() if the result is ok
			if (result && typeof result === "object" && "ok" in result && result.ok === true) {
				this.draw();
			}

			return result;
		};
	}

	return descriptor;
}


type AddEdit = { type: "add", data: AddDispatchData, parentId: ID }
type RemoveEdit = { type: "remove", data: RemoveDispatchData, parentId: ID }

type Edit = AddEdit | RemoveEdit


type CreateAndModifyInput = { parameters: IVisual, target: Visual }
type ModifyInput = { child: IVisual, target: Visual }
type AddInput = { child: IVisual, index?: number }
type RemoveInput = RemoveDispatchData
type AddSubgridInput = { subgrid: ISubgrid };

export type Result<T = {}> = { ok: true; value: T } | { ok: false; error: string };

export type ActionResult<T extends keyof Actions> =
	| { ok: true; undo: { action: Actions[T]["undoAction"], data: UndoData<T> } }
	| { ok: false; error: string };


type DispatchAction<Type extends keyof Actions> = (parameters: InputData<Type>) => ActionResult<Type>;
type InputData<T extends keyof Actions> = Actions[T]["inputData"]
type UndoData<T extends keyof Actions> = Actions[Actions[T]["undoAction"]]["inputData"];

type Actions = {
	"modify": {
		inputData: ModifyInput,
		undoAction: "modify"
	},
	"add": {
		inputData: AddInput,
		undoAction: "remove"
	},
	"remove": {
		inputData: RemoveInput,
		undoAction: "add"
	},
}
type ActionNames = keyof Actions;


type ActionRegistry = {
	[K in ActionNames]: DispatchAction<K>
}

interface IDispatchAction<T extends ActionNames> {
	type: T,
	input: InputData<T>;
}

interface ICompletedAction<T extends ActionNames> extends IDispatchAction<T> {
	result: ActionResult<T>;
	duration?: number
}

type AnyCompletedAction = { [K in keyof Actions]: ICompletedAction<K> }[keyof Actions];




export default class DiagramHandler implements IDraw {
	static MAX_UNDO_DEPTH = 25;

	public diagram: Diagram;

	surface?: Svg;
	EngineConstructor: (data: IVisual, type: AllComponentTypes) => Visual | undefined

	public visualRTree: RBush<RBushItem> = new RBush<RBushItem>();

	get id(): string {
		let id: string = sha256(JSON.stringify(this.diagram.state))
		return id;
	}
	syncExternal: () => void;

	get sequences(): Sequence[] {
		return this.diagram.sequences;
	}
	hasSequence(name: string): boolean {
		return this.diagram.sequenceIDs.includes(name);
	}

	get allElements(): Record<ID, Visual> {
		return this.diagram.allElements;
	}

	get canUndo(): boolean {
		return this.undoStack.length > 0 ? true : false;
	}

	get canRedo(): boolean {
		return this.redoStack.length > 0 ? true : false;
	}

	public undoStack: AnyCompletedAction[] = [];
	public redoStack: AnyCompletedAction[] = [];

	public ActionRegistry: Partial<ActionRegistry> = {
		"add": this.add.bind(this),
		"modify": this.modify.bind(this),
		"remove": this.remove.bind(this),
	}


	constructor(surface: Svg, emitChange: () => void, EngineConstructor: ((data: IVisual, type: AllComponentTypes) => Visual | undefined)) {
		this.syncExternal = emitChange;
		this.surface = surface;
		this.EngineConstructor = EngineConstructor;

		this.diagram = this.emptyDiagram();
	}

	public refreshDiagram() {
		this.draw();
	}

	draw() {
		if (!this.surface) {
			throw new Error("Svg surface not attached!");
		}

		try {
			this.computeDiagram();
		} catch (err) {
			appToaster.show({
				"intent": "danger",
				"message": `Compute error: ${(err as string)}`
			})

			throw new Error(err as string);
		}


		this.surface.viewbox(this.diagram.x, this.diagram.y, this.diagram.width, this.diagram.height);
		this.surface.size(`${this.diagram.width}px`, `${this.diagram.height}px`);

		try {
			this.diagram.draw(this.surface);
		} catch (err) {
			appToaster.show({
				"intent": "danger",
				"message": `Draw error: ${(err as string)}`
			})
		}

		this.syncExternal();
	}

	erase() {
		this.diagram?.erase();
	}

	computeDiagram() {
		const start = performance.now();
		this.diagram.computeSize();
		this.diagram.growElement(this.diagram.size);
		this.diagram.computePositions({ x: 0, y: 0 });
		this.computeBoundaryTree();
		const end = performance.now();
		console.log(`computeDiagram took ${(end - start).toFixed(2)} ms`);
	}

	/**
	 * Inspects an element and all its descendants for `placementMode: { type: "binds" }` configurations.
	 * For each binding rule in `config`, resolves the anchor object in the diagram
	 * and registers the corresponding binding on that anchor.
	 *
	 * @param element The root visual element or collection subtree to register bindings for.
	 */
	public createElementBindings(element: Visual): void {
		for (const el of Object.values(element.allElements)) {
			if (el.placementMode?.type === "binds" && el.placementMode.config) {
				const config: IBindsPlacementConfig = el.placementMode.config;

				for (const rule of config) {
					const anchorId = rule.targetId || rule.anchorId;
					if (!anchorId) continue;
					const anchor: Visual | undefined = this.identifyElement(anchorId);
					if (anchor) {
						anchor.bind(
							el,
							rule.dimension,
							rule.anchorSiteName,
							rule.targetSiteName,
							rule.offset,
							rule.hint,
							rule.bindToContent ?? true
						);
					}

				}
			}
		}
	}

	/**
	 * Transfers active outgoing bindings from an existing visual element (or its descendants)
	 * to a newly instantiated replacement element. Used during element modifications (e.g. dragging
	 * or resizing an anchor object) so that attached bound elements (like arrows) seamlessly follow
	 * the new anchor instance without requiring a full diagram re-scan.
	 *
	 * @param source The retired visual element instance holding active outgoing bindings.
	 * @param destination The newly created visual element instance that will assume the anchor role.
	 */
	public transferAnchorBindings(source: Visual, destination: Visual): void {
		const sourceElements = source.allElements;
		const destinationElements = destination.allElements;

		for (const [id, srcEl] of Object.entries(sourceElements)) {
			const destEl = destinationElements[id];
			if (!destEl) continue;

			// Transfer outgoing bindings where this element acts as an anchor
			for (const bind of srcEl.bindings) {
				destEl.bind(
					bind.targetObject,
					bind.bindingRule.dimension,
					bind.bindingRule.anchorSiteName,
					bind.bindingRule.targetSiteName,
					bind.offset,
					bind.hint,
					bind.bindToContent
				);
			}

			// Clear old outgoing bindings from the retired source instance
			for (const bind of [...srcEl.bindings]) {
				srcEl.clearBindsTo(bind.targetObject);
			}
		}
	}

	/**
	 * Cleans up incoming bindings for an element and its descendants where the element is the target of an anchor.
	 * Used before modifying a bound element (e.g. an arrow) so that its previous anchor connections
	 * are severed prior to re-registering its updated placement configuration.
	 *
	 * @param element The visual element whose incoming anchor bindings should be cleared.
	 */
	public unregisterIncomingBindings(element: Visual): void {
		for (const el of Object.values(element.allElements)) {
			for (const bind of [...el.bindingsToThis]) {
				bind.anchorObject.clearBindsTo(el);
			}
		}
	}

	/**
	 * Completely severs both incoming and outgoing bindings for an element and all its descendants.
	 * Used when an element is removed from the diagram to prevent dangling references on anchors or targets.
	 *
	 * @param element The visual element to fully detach from the diagram binding graph.
	 */
	public unregisterElementBindings(element: Visual): void {
		for (const el of Object.values(element.allElements)) {
			// Remove bindings from this to other elements
			for (const bind of [...el.bindings]) {
				el.clearBindsTo(bind.targetObject);
			}

			// Remove bindings from other elements to this.
			for (const bind of [...el.bindingsToThis]) {
				bind.anchorObject.clearBindsTo(el);
			}
		}
	}

	computeBoundaryTree() {
		this.visualRTree.clear();
		this.diagram.addDrawBounds(this.visualRTree);
	}

	// ---------- Element identification ----------
	public identifyElement(id: ID): Visual | undefined {
		var element: Visual | undefined = undefined;

		element = this.allElements[id];


		if (element === undefined) {
			return undefined;
		} else {
			return element;
		}
	}

	@draws
	public constructDiagram(state: IDiagram): Result<Diagram> {
		console.log("constructing diagram")
		this.erase();

		let newDiagram: Diagram | undefined = undefined;
		try {
			newDiagram = this.EngineConstructor(state, "diagram") as Diagram | undefined;
		} catch (err) {
			throw err
			return { ok: false, error: (err as string) }
		}


		if (newDiagram === undefined) {
			return { ok: false, error: `Failed to create diagram` };
		}

		this.diagram = newDiagram;
		this.createElementBindings(this.diagram);
		this.diagram.svg?.show();

		this.computeDiagram();

		return { ok: true, value: newDiagram };
	}

	@draws
	public resetDiagram() {
		this.constructDiagram(structuredClone(DEFAULT_DIAGRAM));
	}

	@draws
	public emptyDiagram(): Diagram {
		return new Diagram(BLANK_DIAGRAM)
	}

	@draws
	private dispatchAction<T extends ActionNames>(action: T, data: InputData<T>): ActionResult<T> {
		const handler = this.ActionRegistry[action] as DispatchAction<T>;
		return handler(data);
	}


	public act<T extends ActionNames>(action: IDispatchAction<T>) {
		const start = performance.now();
		let actionResult: ActionResult<T> = this.dispatchAction(
			action.type,
			action.input
		)

		if (actionResult.ok === false) {
			appToaster.show({
				"message": `${actionResult.error as string}`,
				"intent": "danger",
			})
		} else {
			let dispatchedAction: ICompletedAction<T> = {
				type: action.type,
				result: actionResult,
				input: action.input,
			}

			if (this.undoStack.length >= DiagramHandler.MAX_UNDO_DEPTH) {
				this.undoStack.shift();
			}
			this.undoStack.push(dispatchedAction as AnyCompletedAction);
			this.redoStack = [];
		}
		const end = performance.now();
		console.log(`act (${action.type}) took ${(end - start).toFixed(2)} ms`);
	}

	public undo() {
		let action = this.undoStack.pop()

		if (action?.result.ok === true) {
			this.dispatchAction(
				action.result.undo.action,
				action.result.undo.data
			);
			this.redoStack.push(action);

			appToaster.show({
				intent: "success",
				"message": "Undo",
				"icon": "undo",
			})
		}
	}

	public redo() {
		let action = this.redoStack.pop();

		if (action?.result.ok === true) {
			this.dispatchAction(
				action.type,
				action.result.undo.data
			);
			this.undoStack.push(action);

			appToaster.show({
				intent: "success",
				"message": "Redo",
				"icon": "redo"
			})
		}
	}


	private editDiagram(edit: Edit): Result<Visual> {
		let result: Result<Visual> = { ok: false, error: "Something went wrong" };

		let parent: Visual | undefined = this.diagram.allElements[edit.parentId ?? ""];

		if (parent === undefined) {
			return { ok: false, error: `Cannot find target parent for edit ${edit.type}` }
		}

		// Check target is capable of making this edit:

		try {
			switch (edit.type) {
				case "add":
					if (!CanAdd(parent)) {
						result = { ok: false, error: `Parent ${parent.ref}` }
					} else {
						parent.add({ ...edit.data });
						result = { ok: true, value: parent }
					}
					break;
				case "remove":
					if (!CanRemove(parent)) {
						result = { ok: false, error: `Parent ${parent.ref}` }
					} else {
						parent.remove({ ...edit.data });
						result = { ok: true, value: parent }
					}
					break;
			}
		} catch (err) {
			result = { ok: false, error: (err as string) }
		}

		return result
	}


	// ------------- ACTIONS ---------------------
	//#region 
	protected add({ child, index }: AddInput): ActionResult<"add"> {
		let childInstance: Visual;
		if (!(child instanceof Visual)) {
			let constructedChildResult: Result<Visual> = this.createVisual(child, child.type);

			if (constructedChildResult.ok === false) {
				return { ok: false, error: constructedChildResult.error };
			}

			childInstance = constructedChildResult.value;
		} else {
			childInstance = child;
		}

		let editResult: Result<Visual> = this.editDiagram({
			type: "add",
			data: { child: childInstance, index: index },
			parentId: childInstance.parentId ?? ""
		})

		if (editResult.ok === false) {
			return editResult
		}

		this.createElementBindings(childInstance);

		return { ok: true, undo: { action: "remove", data: { child: childInstance } } }
	}

	protected remove({ child }: RemoveInput): ActionResult<"remove"> {
		this.unregisterElementBindings(child);

		let editResult: Result<Visual> = this.editDiagram({
			type: "remove",
			data: { child: child },
			parentId: child.parentId ?? ""
		})

		child.erase();

		if (editResult.ok === false) {
			return editResult
		}

		return {
			ok: true,
			undo: { action: "add", data: { child: child } }
		}
	}

	protected modify({ child, target }: ModifyInput): ActionResult<"modify"> {
		// Ensure the new child configuration inherits the target's identity, parent, and role if not explicitly provided.
		child.id = target.id;
		if (child.parentId === undefined) {
			child.parentId = target.parentId;
		}
		if (child.role === undefined) {
			child.role = target.role;
		}

		let childInstance: Visual;
		if (!(child instanceof Visual)) {
			let constructedChildResult: Result<Visual> = this.createVisual(child, child.type);

			if (constructedChildResult.ok === false) {
				return { ok: false, error: constructedChildResult.error };
			}

			childInstance = constructedChildResult.value;
		} else {
			childInstance = child;
			childInstance.id = target.id;
			if (childInstance.parentId === undefined) {
				childInstance.parentId = target.parentId;
			}
			if (childInstance.role === undefined) {
				childInstance.role = target.role;
			}
		}

		// Handle edge case for modifying the root diagram (which has no parent)
		if (target.id === this.diagram.id) {
			if (!(childInstance instanceof Diagram)) {
				return { ok: false, error: `Invalid visual type for diagram modification` };
			}
			this.transferAnchorBindings(target, childInstance);
			this.unregisterIncomingBindings(target);
			target.erase();
			this.diagram = childInstance;
			this.createElementBindings(childInstance);
			this.diagram.svg?.show();
			return { ok: true, undo: { action: "modify", data: { child: target, target: childInstance } } };
		}

		let parent: Collection | undefined = this.diagram.allElements[target.parentId ?? ""] as Collection | undefined;
		if (parent === undefined) {
			return { ok: false, error: `Cannot find parent of visual ${target.ref}` }
		}

		let targetIndex: number | undefined = parent.childIndex(target);
		if (targetIndex === undefined) {
			return { ok: false, error: `Child ${target.ref} does not exist on parent ${parent.ref}` }
		}

		this.transferAnchorBindings(target, childInstance);
		this.unregisterIncomingBindings(target);

		// Delete element
		let deleteResult: Result<Visual> = this.editDiagram({
			"type": "remove",
			"data": { child: target },
			"parentId": target.parentId ?? ""
		})
		if (deleteResult.ok === false) { return deleteResult }

		target.erase();

		let addResult: Result<Visual> = this.editDiagram({
			"type": "add",
			"data": { child: childInstance, index: targetIndex },
			"parentId": childInstance.parentId ?? ""
		})

		if (addResult.ok === false) { return addResult }

		this.createElementBindings(childInstance);

		return { ok: true, undo: { action: "modify", data: { child: target, target: childInstance } } }
	}
	//#endregion
	// ------------------------------------------


	public addColumn(sequenceId: ID, index: number): Result {
		let sequence: Sequence | undefined = this.diagram.sequenceDict[sequenceId];

		if (sequence === undefined) {
			console.warn(`Cannot insert column in sequence with id ${sequenceId}`);
			return { ok: false, error: `Sequence ${sequenceId} not found` };
		}

		let tempResult = this.createVisual<Sequence>(structuredClone(sequence.state), "sequence");
		if (tempResult.ok === false) {
			return { ok: false, error: tempResult.error };
		}
		let updatedSeq = tempResult.value;
		updatedSeq.insertEmptyColumn(index);

		this.act({
			type: "modify",
			input: {
				child: updatedSeq,
				target: sequence
			}
		});

		return { ok: true, value: {} };
	}

	public removeColumn(sequenceId: ID, index: number): Result {
		let sequence: Sequence | undefined = this.diagram.sequenceDict[sequenceId];

		if (sequence === undefined) {
			console.warn(`Cannot remove column in sequence with id ${sequenceId}`);
			return { ok: false, error: `Sequence ${sequenceId} not found` };
		}

		// Inefficient. Fix later
		let tempResult = this.createVisual<Sequence>(structuredClone(sequence.state), "sequence");
		if (tempResult.ok === false) {
			return { ok: false, error: tempResult.error };
		}
		let updatedSeq = tempResult.value;
		updatedSeq.removeColumn(index);

		this.act({
			type: "modify",
			input: {
				child: updatedSeq,
				target: sequence
			}
		});

		return { ok: true, value: {} };
	}

	public setColumnWidth(sequenceId: ID, colIndex: number, width: number): Result {
		let sequence: Sequence | undefined = this.diagram.sequenceDict[sequenceId];

		if (sequence === undefined) {
			console.warn(`Cannot set column width in sequence with id ${sequenceId}`);
			return { ok: false, error: `Sequence ${sequenceId} not found` };
		}

		if (sequence.numRows === 0 || colIndex < 0 || colIndex >= sequence.numColumns) {
			return { ok: false, error: `Column index ${colIndex} out of bounds or no rows` };
		}

		let tempResult = this.createVisual<Sequence>(structuredClone(sequence.state), "sequence");
		if (tempResult.ok === false) {
			return { ok: false, error: tempResult.error };
		}
		let updatedSeq = tempResult.value;
		updatedSeq.setMinColumnWidth(colIndex, width);

		this.act({
			type: "modify",
			input: {
				child: updatedSeq,
				target: sequence
			}
		});

		return { ok: true, value: {} };
	}

	public reorderChannel(channelId: ID, direction: "up" | "down"): Result {
		let channel = this.diagram.channelsDict[channelId] || this.allElements[channelId];
		if (!channel) {
			console.warn(`Cannot reorder channel with id ${channelId}: channel not found`);
			return { ok: false, error: `Channel ${channelId} not found` };
		}

		let sequence: Sequence | undefined;
		if (channel.parentId) {
			sequence = this.diagram.sequenceDict[channel.parentId];
		}

		if (!sequence) {
			console.warn(`Cannot reorder channel ${channelId}: parent sequence not found`);
			return { ok: false, error: `Sequence for channel ${channelId} not found` };
		}

		let seqState = structuredClone(sequence.state);
		if (!seqState.children) {
			return { ok: false, error: `Sequence ${sequence.id} has no children` };
		}

		let index = seqState.children.findIndex((c) => c.id === channelId);
		if (index === -1) {
			return { ok: false, error: `Channel ${channelId} not found in sequence children` };
		}

		let targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= seqState.children.length) {
			return { ok: true, value: {} };
		}

		let temp = seqState.children[index];
		seqState.children[index] = seqState.children[targetIndex];
		seqState.children[targetIndex] = temp;

		let tempResult = this.createVisual<Sequence>(seqState, "sequence");
		if (tempResult.ok === false) {
			return { ok: false, error: tempResult.error };
		}
		let updatedSeq = tempResult.value;

		this.act({
			type: "modify",
			input: {
				child: updatedSeq,
				target: sequence
			}
		});

		return { ok: true, value: {} };
	}

	public setChannelPadding(
		channelId: ID,
		padding: { top?: number; bottom?: number } | [number, number, number, number]
	): Result {
		let channel = this.diagram.channelsDict[channelId] || (this.allElements[channelId] as Channel | undefined);
		if (!channel || !(channel instanceof Channel)) {
			console.warn(`Cannot set padding for channel with id ${channelId}: channel not found`);
			return { ok: false, error: `Channel ${channelId} not found` };
		}

		let sequence: Sequence | undefined;
		if (channel.parentId) {
			sequence = this.diagram.sequenceDict[channel.parentId];
		}

		if (!sequence) {
			console.warn(`Cannot set padding for channel ${channelId}: parent sequence not found`);
			return { ok: false, error: `Sequence for channel ${channelId} not found` };
		}

		let newPadding: [number, number, number, number] = [...channel.padding];
		if (Array.isArray(padding)) {
			newPadding = [
				Math.max(0, padding[0] ?? 0),
				Math.max(0, padding[1] ?? 0),
				Math.max(0, padding[2] ?? 0),
				Math.max(0, padding[3] ?? 0)
			];
		} else {
			if (padding.top !== undefined) newPadding[0] = Math.max(0, padding.top);
			if (padding.bottom !== undefined) newPadding[2] = Math.max(0, padding.bottom);
		}

		let seqState = structuredClone(sequence.state);
		if (!seqState.children) {
			return { ok: false, error: `Sequence ${sequence.id} has no children` };
		}

		let channelIndex = seqState.children.findIndex((c) => c.id === channelId);
		if (channelIndex === -1) {
			return { ok: false, error: `Channel ${channelId} not found in sequence children` };
		}

		(seqState.children[channelIndex] as IChannel).padding = newPadding;

		let tempResult = this.createVisual<Sequence>(seqState, "sequence");
		if (tempResult.ok === false) {
			return { ok: false, error: tempResult.error };
		}
		let updatedSeq = tempResult.value;

		this.act({
			type: "modify",
			input: {
				child: updatedSeq,
				target: sequence
			}
		});

		return { ok: true, value: {} };
	}


	public createVisual<T extends Visual = Visual>(parameters: IVisual, type: AllComponentTypes): Result<T> {
		try {
			var element: T | undefined = this.EngineConstructor(parameters, type) as T | undefined;
		} catch (e) {
			return { ok: false, error: (e as string) }
		}

		if (element === undefined) {
			return { ok: false, error: `Cannot instantiate visual of type ${type}` }
		} else {
			return { ok: true, value: element }
		}
	}
}


export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
	? RecursivePartial<U>[]
	: T[P] extends object | undefined
	? RecursivePartial<T[P]>
	: T[P];
};