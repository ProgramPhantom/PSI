import { Rect, Svg } from "@svgdotjs/svg.js";
import { sha256 } from 'js-sha256';
import { appToaster } from "../app/Toaster";
import Collection, { AddDispatchData, CanAdd, CanRemove, RemoveDispatchData } from "./collection.ts";
import SchemeManager from "./default";
import { BLANK_DIAGRAM } from "./default/blankDiagram.ts";
import { DEFAULT_DIAGRAM } from "./default/defaultDiagram.ts";
import Grid, { AddSubgrid, CanAddSubgrid, ISubgrid } from "./grid.ts";
import Diagram, { IDiagram } from "./hasComponents/diagram";
import Sequence from "./hasComponents/sequence";
import { AllComponentTypes, ID } from "./point";
import Visual, { IDraw, IVisual } from "./visual";


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
type AddSubgridEdit = {type: "addSubgrid", data: AddSubgrid, parentId: ID} 

type Edit = AddEdit | RemoveEdit | AddSubgridEdit


type CreateAndModifyInput = { parameters: IVisual, target: Visual }
type ModifyInput = { child: IVisual, target: Visual }
type AddInput = { child: IVisual, index?: number}
type RemoveInput = RemoveDispatchData
type AddSubgridInput =  { subgrid: ISubgrid };

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

	"addSubgrid": {
		inputData: AddSubgridInput,
		undoAction: "removeSubgrid"
	},
	"removeSubgrid": {
		inputData: AddSubgridInput,
		undoAction: "addSubgrid"
	}
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
	schemeManager: SchemeManager;
	EngineConstructor: (data: IVisual, type: AllComponentTypes) => Visual | undefined

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

		"addSubgrid": this.addSubgrid.bind(this)
	}


	constructor(surface: Svg, emitChange: () => void, schemeManager: SchemeManager, EngineConstructor: ((data: IVisual, type: AllComponentTypes) => Visual | undefined)) {
		this.syncExternal = emitChange;
		this.schemeManager = schemeManager;
		this.surface = surface;
		this.EngineConstructor = EngineConstructor;

		this.diagram = this.emptyDiagram();
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
		}


		this.surface.add(new Rect().move(0, 0).id("diagram-root"));

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
		this.diagram.computeSize();
		this.diagram.growElement(this.diagram.size);
		this.diagram.computePositions({ x: 0, y: 0 });
	}

	// ---------- Element identification ----------
	public identifyElement(id: ID): Visual | undefined {
		var element: Visual | undefined = undefined;

		element = this.allElements[id];


		if (element === undefined) {
			console.warn(`Cannot find element "${id}"`);
			return undefined;
		} else {
			return element;
		}
	}

	@draws
	public constructDiagram(state: IDiagram): Result<Diagram> {
		this.erase();

		let newDiagram: Diagram | undefined = undefined;
		try {
			newDiagram = this.EngineConstructor(state, "diagram") as Diagram | undefined;
		} catch (err) {
			return { ok: false, error: (err as string) }
		}


		if (newDiagram === undefined) {
			return { ok: false, error: `Failed to create diagram` };
		}

		this.diagram = newDiagram;

		return { ok: true, value: newDiagram };
	}

	@draws
	public resetDiagram() {
		this.constructDiagram(DEFAULT_DIAGRAM);
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
				action.input
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
				case "addSubgrid":
					if (!CanAddSubgrid(parent)) {
						result = { ok: false, error: `Parent ${parent.ref}` }
					} else {
						parent.addSubgrid({ ...edit.data });
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

		return { ok: true, undo: { action: "remove", data: { child: childInstance } } }
	}

	protected remove({ child }: RemoveInput): ActionResult<"remove"> {
		let editResult: Result<Visual> = this.editDiagram({
			type: "remove",
			data: { child: child },
			parentId: child.parentId ?? ""
		})


		if (child.svg) {
			child.svg.remove();
		}
		if (child.maskBlock) {
			child.maskBlock.remove();
		}

		if (editResult.ok === false) {
			return editResult
		}

		return {
			ok: true,
			undo: { action: "add", data: { child: child } }
		}
	}

	protected modify({ child, target }: ModifyInput): ActionResult<"modify"> {
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
		
		let parent: Collection | undefined = this.diagram.allElements[target.parentId ?? ""] as Collection | undefined;
		if (parent === undefined) {
			return { ok: false, error: `Cannot find parent of visual ${target.ref}` }
		}

		let targetIndex: number | undefined = parent.childIndex(target);
		if (targetIndex === undefined) {
			return { ok: false, error: `Child ${target.ref} does not exist on parent ${parent.ref}` }
		}

		let targetId: ID = target.id;

		// Delete element
		let deleteResult: Result<Visual> = this.editDiagram({
			"type": "remove",
			"data": { child: target },
			"parentId": target.parentId ?? ""
		})
		if (deleteResult.ok === false) { return deleteResult }

		child.id = targetId;
		let addResult: Result<Visual> = this.editDiagram({
			"type": "add",
			"data": { child: childInstance, index: targetIndex },
			"parentId": child.parentId ?? ""
		})

		if (addResult.ok === false) { return addResult }

		return { ok: true, undo: { action: "modify", data: { child: target, target: childInstance } } }
	}

	protected addSubgrid({ subgrid }: AddSubgridInput): ActionResult<"addSubgrid"> {
		let childInstance: Grid;
		if (!(subgrid instanceof Grid)) {
			let constructedChildResult: Result<Grid> = this.createVisual(subgrid, "grid");

			if (constructedChildResult.ok === false) {
				return { ok: false, error: constructedChildResult.error };
			}

			childInstance = constructedChildResult.value;
		} else {
			childInstance = subgrid;
		}
		
		let editResult: Result<Visual> = this.editDiagram({
			type: "addSubgrid",
			data: { subgrid: childInstance },
			parentId: subgrid.parentId ?? ""
		})

		if (editResult.ok === false) {
			return editResult
		}

		return { ok: true, undo: { action: "removeSubgrid", data: { subgrid: subgrid } } }
	}
	//#endregion
	// ------------------------------------------


	public addColumn(sequenceId: ID, index: number) {
		let sequence: Sequence | undefined = this.diagram.sequenceDict[sequenceId]

		if (sequence === undefined) {
			console.warn(`Cannot insert column in sequence with id ${sequenceId}`)
			return
		}

		sequence.insertEmptyColumn(index);
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