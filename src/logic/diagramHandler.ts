import { Rect, Svg } from "@svgdotjs/svg.js";
import { appToaster } from "../app/Toaster";
import SchemeManager from "./default";
import { defaultDiagram } from "./default/index.ts";
import Channel, { IChannel } from "./hasComponents/channel";
import Diagram, { IDiagram } from "./hasComponents/diagram";
import Sequence from "./hasComponents/sequence";
import Line, { ILine } from "./line";
import { AllComponentTypes, ID } from "./point";
import { isPulse, PointBind } from "./spacial";
import Visual, { IDraw, IVisual } from "./visual";

import { sha256 } from 'js-sha256';
import Collection from "./collection.ts";
import { DEFAULT_DIAGRAM } from "./default/defaultDiagram.ts";
import { BLANK_DIAGRAM } from "./default/blankDiagram.ts";


export type Result<T = {}> = { ok: true; value: T } | { ok: false; error: string };

type ConstructorFunction = (parameters: IVisual, ...args: any[]) => Result<any>;
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





export default class DiagramHandler implements IDraw {
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

		this.computeDiagram();

		this.surface.add(new Rect().move(0, 0).id("diagram-root"));

		this.surface.viewbox(this.diagram.x, this.diagram.y, this.diagram.width, this.diagram.height);
		this.surface.size(`${this.diagram.width}px`, `${this.diagram.height}px`);
		this.diagram.draw(this.surface);
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

		let newDiagram: Diagram | undefined = this.EngineConstructor(state, "diagram") as Diagram | undefined;

		if (newDiagram === undefined) {
			return { ok: false, error: `Failed to create diagram` };
		}

		this.diagram = newDiagram;

		return { ok: true, value: newDiagram };
	}

	@draws
	resetDiagram() {
		this.constructDiagram(DEFAULT_DIAGRAM);
	}

	@draws
	emptyDiagram(): Diagram {
		return new Diagram(BLANK_DIAGRAM)
	}

	// ---- Form interfaces ----
	public submitVisual(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		var result: Result<Visual>;
		switch (type) {
			case "channel":
			case "rect":
			case "svg":
			case "label-group":
				// Temporary as we only allow one sequence currently.
				if (isPulse(parameters)) {
					parameters.pulseData.sequenceID = this.diagram.sequenceIDs[0];
				}

				result = this.createAndAdd(parameters, type);
				break;
			default:
				result = {
					ok: false,
					error: `No implementation to instantiate type ${type} from form submission`
				};
		}

		return result;
	}

	public submitModifyVisual(
		parameters: IVisual,
		type: AllComponentTypes,
		target: Visual
	): Result<Visual> {
		let removeCol: boolean = true;
		if (isPulse(target)) {
			removeCol = parameters.pulseData?.index === target.pulseData.index ? false : true
		}

		// Delete element
		let deleteResult: Result<Visual> = this.remove(target, removeCol);
		if (deleteResult.ok === false) {
			return deleteResult;
		}
		let id: ID = deleteResult.value.id;

		parameters.id = id;
		var result: Result<Visual> = this.submitVisual(parameters, type);

		return result;
	}

	public submitDeleteVisual(target: Visual, type: AllComponentTypes): Result<Visual> {
		var result: Result<Visual>;

		switch (type) {
			case "label":
			case "rect":
			case "svg":
			case "label-group":
			case "channel":
				result = this.remove(target, true);
				break;

				break;
			default:
				throw new Error(`Cannot delete component of type ${type}`);
		}

		return result;
	}

	/*
	public submitChannel(parameters: IChannel): Result<Channel> {
		if (parameters.sequenceID === undefined) {
			return {
				ok: false,
				error: `No sequence id on channel ${parameters.ref}`
			};
		}

		try {
			var newChannel = new Channel(parameters);
		} catch (err) {
			return {
				ok: false,
				error: `Cannot instantiate channel ${parameters.ref}`
			};
		}

		return this.addChannel(newChannel);
	}
		*/

	// ------------------------------------------

	public createVisual(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		try {
			var element: Visual | undefined = this.EngineConstructor(parameters, type);
		} catch (e) {
			return { ok: false, error: (e as string) }
		}

		if (element === undefined) {
			return { ok: false, error: `Cannot instantiate visual of type ${type}` }
		} else {
			return { ok: true, value: element }
		}
	}

	// ---------- Visual interaction (generic) -----------
	@draws
	public createAndAdd(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		var elementResult: Result<Visual> = this.createVisual(parameters, type);

		if (elementResult.ok === false) {
			return elementResult;
		} else {
			return this.add(elementResult.value);
		}
	}
	@draws
	public moveVisual(element: Visual, x: number, y: number): Result<Visual> {
		// Cancel if pulse position type or change to free position type?

		try {
			element.x = x;
			element.y = y;

		} catch (err) {
			return { ok: false, error: (err as Error).message };
		}

		return { ok: true, value: element };
	}
	@draws
	public remove(target: Visual, removeCol: boolean = false): Result<Visual> {
		var result: Result<Visual> = { ok: false, error: `Problem deleting visual ${target.ref}` };

		// Parent Id can never be atomic
		let parent: Collection | undefined = this.diagram.allElements[target.parentId ?? ""] as Collection | undefined;

		if (parent === undefined) {
			return { ok: false, error: `Cannot find parent of visual ${target.ref}` }
		}

		try {
			parent.remove(target);
			result = { ok: true, value: target };
		} catch (err) {
			result = { ok: false, error: (err as Error).message }
		}

		if (isPulse(target)) {
			let targetSequence: Sequence | undefined = this.allElements[target.pulseData.sequenceID ?? 0] as Sequence | undefined;

			if (targetSequence !== undefined) {
				targetSequence.removeColumn(target.pulseData.index, removeCol === false ? false : "if-empty")
			}
		}


		if (target.svg) {
			target.svg.remove();
		}
		if (target.maskBlock) {
			target.maskBlock.remove();
		}

		return result;
	}
	public removeByID(targetId: ID): Result<Visual> {
		var target: Visual | undefined = this.identifyElement(targetId);
		if (target === undefined) {
			return { ok: false, error: `Element with id ${targetId} not found` };
		}
		return this.remove(target);
	}
	// ----------------------------

	// ------- Channel stuff ---------
	/*
	@draws
	public addChannel(element: Channel): Result<Channel> {
		var result: Result<Channel>;


		var sequence: Sequence | undefined = this.diagram.sequenceDict[element.sequenceID ?? ""];

		if (sequence === undefined) {
			result = {
				ok: false,
				error: `Cannot find sequence of ID ${element.sequenceID}`
			};
		}

		try {
			sequence.add(element);
		} catch (err) {
			result = { ok: false, error: (err as Error).message };
		}
		result = { ok: true, value: element };
		return result;
	}

	@draws
	public deleteChannel(target: Channel): Result<Channel> {
		var result: Result<Channel>;

		var sequence: Sequence | undefined = this.diagram.sequenceDict[target.sequenceID ?? ""];

		if (sequence === undefined) {
			result = {
				ok: false,
				error: `Cannot find channel with ID: ${target.sequenceID}`
			};
		}

		try {
			sequence.remove(target);
		} catch (err) {
			result = { ok: false, error: (err as Error).message };
		}
		result = { ok: true, value: target };
		return result
	}
	*/
	// ----------- Annotation stuff ------------------
	@draws
	public createLine(
		pParams: RecursivePartial<ILine>,
		startBinds: PointBind,
		endBinds: PointBind
	): Result<Line> {
		try {
			var newLine: Line = new Line(pParams as ILine);
		} catch (err) {
			return { ok: false, error: `Cannot instantiate line ${pParams.ref}` };
		}

		try {
			startBinds["x"].anchorObject.bind(
				newLine,
				"x",
				startBinds["x"].bindingRule.anchorSiteName,
				"here",
				undefined,
				undefined,
				false
			);
			startBinds["y"].anchorObject.bind(
				newLine,
				"y",
				startBinds["y"].bindingRule.anchorSiteName,
				"here",
				undefined,
				undefined,
				false
			);
			startBinds["x"].anchorObject.enforceBinding();
			startBinds["y"].anchorObject.enforceBinding();

			endBinds["x"].anchorObject.bind(
				newLine,
				"x",
				endBinds["x"].bindingRule.anchorSiteName,
				"far",
				undefined,
				undefined,
				false
			);
			endBinds["y"].anchorObject.bind(
				newLine,
				"y",
				endBinds["y"].bindingRule.anchorSiteName,
				"far",
				undefined,
				undefined,
				false
			);
			endBinds["x"].anchorObject.enforceBinding();
			endBinds["y"].anchorObject.enforceBinding();
		} catch (err) {
			return { ok: false, error: `Cannot bind line` };
		}

		// try {
		// 	this.diagram.addFreeArrow(newLine);
		// } catch (err) {
		// 	return {ok: false, error: (err as Error).message};
		// }

		return { ok: true, value: newLine };
	}

	// -------------- Placement ----------------
	private add(target: Visual): Result<Visual> {
		// Parent Id can never be atomic
		let parent: Collection | undefined = this.diagram.allElements[target.parentId ?? ""] as Collection | undefined;

		if (parent === undefined) {
			return { ok: false, error: `Cannot find parent of visual ${target.ref}` }
		}

		try {
			parent.add(target);
		} catch (err) {
			return { ok: false, error: (err as Error).message };
		}



		return { ok: true, value: target }
	}


	public addColumn(sequenceId: ID, index: number) {
		let sequence: Sequence | undefined = this.diagram.sequenceDict[sequenceId]

		if (sequence === undefined) {
			console.warn(`Cannot insert column in sequence with id ${sequenceId}`)
			return
		}

		sequence.insertEmptyColumn(index);
	}
}


export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
	? RecursivePartial<U>[]
	: T[P] extends object | undefined
	? RecursivePartial<T[P]>
	: T[P];
};