import {Rect, Svg} from "@svgdotjs/svg.js";
import {PointBind} from "../features/canvas/LineTool";
import Channel, {IChannel} from "./hasComponents/channel";
import SchemeManager from "./default";
import SequenceAligner, {AllStructures, ISequenceAligner} from "./hasComponents/sequenceAligner";
import LabelGroup, {ILabelGroup} from "./hasComponents/labelGroup";
import Line, {ILine} from "./line";
import logger, {Operations} from "./log";
import {IMountConfig} from "./mountable";
import {ID} from "./point";
import RectElement, {IRectElement} from "./rectElement";
import Sequence from "./hasComponents/sequence";
import SVGElement, {ISVGElement} from "./svgElement";
import {FillObject, instantiateByType, RecursivePartial} from "./util";
import {IDraw, IVisual, Visual} from "./visual";
import ENGINE from "./engine";
import {error} from "console";
import * as defaultDiagram from "./default/defaultDiagram.json";
import {myToaster} from "../app/App";
import Diagram, { IDiagram } from "./hasComponents/diagram";

export type Result<T> = {ok: true; value: T} | {ok: false; error: string};

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

// All component types
export type AllComponentTypes = UserComponentType | AbstractComponentTypes;

// The types of component
export type UserComponentType =
	| DrawComponent
	| "label-group"
	| "label"
	| "text"
	| "line"
	| "channel"
	| "sequence"
	| "diagram";
export type DrawComponent = "svg" | "rect" | "space";

// Abstract component types (have no visual content)
export type AbstractComponentTypes = "aligner" | "collection" | "lower-abstract" | "visual";

// All
export type AllElementIdentifiers = AllStructures | AllComponentTypes;

export default class DiagramHandler implements IDraw {
	public diagram: Diagram;

	surface?: Svg;
	schemeManager: SchemeManager;

	get id(): string {
		var id: string = "";
		this.diagram.components.sequences.forEach((s) => {
			Object.keys(s.allElements).forEach((k) => {
				id += k;
			});
		});
		return id;
	}
	syncExternal: () => void;

	get sequences(): Sequence[] {
		return this.diagram.components.sequences;
	}
	hasSequence(name: string): boolean {
		return this.diagram.sequenceIDs.includes(name);
	}

	get allElements(): Record<ID, Visual> {
		return this.diagram.allElements;
	}

	constructor(surface: Svg, emitChange: () => void, schemeManager: SchemeManager) {
		this.syncExternal = emitChange;
		this.schemeManager = schemeManager;
		this.surface = surface;

		var constructResult: Result<SequenceAligner> = this.constructDiagram(
			(<any>defaultDiagram) as ISequenceAligner
		);

		if (constructResult.ok) {
			this.diagram = constructResult.value;
		} else {
			myToaster.show({
				message: "Error loading diagram",
				intent: "danger"
			});
			this.diagram = new SequenceAligner({});
		}
	}

	@draws
	freshDiagram() {
		this.diagram = new Diagram({});
	}

	draw() {
		if (!this.surface) {
			throw new Error("Svg surface not attached!");
		}

		this.surface.add(new Rect().move(0, 0).id("diagram-root"));

		this.surface.size(`${this.diagram.width}px`, `${this.diagram.height}px`);
		this.diagram.draw(this.surface);
		this.syncExternal();
	}

	erase() {
		this.diagram.erase();
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

	// ----- Construct diagram from state ------
	@draws
	public constructDiagram(state: IDiagram): Result<Diagram> {
		try {
			var newDiagram: Diagram = new Diagram(state);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}
		this.diagram = newDiagram;

		try {
			// Create and mount pulses.
			state.sequenceAligner.sequences.forEach((s) => {
				s.channels.forEach((c) => {
					c.mountedElements.forEach((m) => {
						if (m.type === undefined) {
							console.warn(`Element data is missing type: ${m.ref}`);
						}
						this.createVisual(m, m.type as AllComponentTypes);
					});
				});
			});
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {ok: true, value: newDiagram};
	}

	// ---- Form interfaces ----
	public submitVisual(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		var result: Result<Visual>;
		switch (type) {
			case "channel":
				(parameters as IChannel).sequenceID = this.diagram.sequenceIDs[0];
				result = this.submitChannel(parameters as IChannel);
				break;
			case "rect":
			case "svg":
			case "label-group":
				if (parameters.mountConfig !== undefined) {
					parameters.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
				}

				result = this.createVisual(parameters, type);
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
		var mountConfigCopy: IMountConfig | undefined = target.mountConfig;
		// Delete element
		this.deleteVisual(target, false);

		// Copy hidden parameter channelID (this shouldn't be needed as it should take the state
		// from the form. The hidden values should still be in the form.)
		if (mountConfigCopy !== undefined && parameters.mountConfig !== undefined) {
			parameters.mountConfig.channelID = mountConfigCopy.channelID;
			parameters.mountConfig.index = mountConfigCopy.index;
		}

		var result: Result<Visual> = this.submitVisual(parameters, type);

		return result;
	}

	public submitDeleteVisual(target: Visual, type: AllComponentTypes): Result<Visual> {
		var result: Result<Visual>;

		switch (type) {
			case "rect":
			case "svg":
			case "label-group":
				result = this.deleteVisual(target);
				break;
			case "channel":
				result = this.deleteChannel(target as Channel);
				break;
			default:
				throw new Error(`Cannot delete component of type ${type}`);
		}

		return result;
	}

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

	// ------------------------

	// ---------- Visual interaction (generic) -----------
	@draws
	public addElement(element: Visual): Result<Visual> {
		if (element.isMountable === true) {
			return this.mountVisual(element, false);
		}

		try {
			this.diagram.add(element);
			this.diagram.computeBoundary();
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {ok: true, value: element};
	}
	public createVisual(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		var element: Visual;

		// NECESSARY to make element accept binding changes. X, Y persists when changing into a label
		// so if this isn't done, element might not carry changes and update label position.
		parameters.x = undefined;
		parameters.y = undefined;

		switch (type) {
			case "svg":
				element = new SVGElement(parameters as ISVGElement);
				break;
			case "rect":
				element = new RectElement(parameters as IRectElement);
				break;
			case "label-group":
				element = new LabelGroup(parameters as ILabelGroup);
				break;
			default:
				return {
					ok: false,
					error: `Cannot instantiate visual with type ${type}`
				};
		}

		if (element.mountConfig !== undefined) {
			return this.mountVisual(element, false);
		} else {
			return this.addElement(element);
		}
	}
	public replaceVisual(target: Visual, newElement: Visual): Result<Visual> {
		if (target.isMountable) {
			return this.replaceMountable(target, newElement);
		} else {
			throw new Error("not implemented");
		}
	}
	@draws
	public moveVisual(element: Visual, x: number, y: number): Result<Visual> {
		try {
			element.x = x;
			element.y = y;

			this.diagram.computeBoundary();
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {ok: true, value: element};
	}
	@draws
	public deleteVisual(target: Visual, removeColumn?: boolean): Result<Visual> {
		var result: Result<Visual>;

		if (target.isMountable) {
			var deleteResult = this.deleteMountedVisual(target, removeColumn);
			if (deleteResult.ok === true) {
				result = {ok: true, value: deleteResult.value.target};
			} else {
				result = deleteResult;
			}
		} else {
			result = this.deleteFreeVisual(target);
		}

		return result;
	}
	public deleteVisualByID(targetId: ID): Result<Visual> {
		var target: Visual | undefined = this.identifyElement(targetId);
		if (target === undefined) {
			return {ok: false, error: `Element with id ${targetId} not found`};
		}
		return this.deleteVisual(target);
	}
	// ----------------------------

	// ------- Channel stuff ---------
	@draws
	public addChannel(element: Channel): Result<Channel> {
		var sequence: Sequence | undefined = this.diagram.sequenceDict[element.sequenceID];

		if (sequence === undefined) {
			return {
				ok: false,
				error: `Cannot find sequence of ID ${element.sequenceID}`
			};
		}

		try {
			sequence.addChannel(element);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}
		return {ok: true, value: element};
	}

	@draws
	public deleteChannel(target: Channel): Result<Channel> {
		var sequence: Sequence | undefined = this.diagram.sequenceDict[target.sequenceID];

		if (sequence === undefined) {
			return {
				ok: false,
				error: `Cannot find channel with ID: ${target.sequenceID}`
			};
		}

		try {
			sequence.deleteChannel(target);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}
		return {ok: true, value: target};
	}

	// ----------- Annotation stuff ------------------
	@draws
	public createLine(
		pParams: RecursivePartial<ILine>,
		startBinds: PointBind,
		endBinds: PointBind
	): Result<Line> {
		try {
			var newLine: Line = new Line(pParams);
		} catch (err) {
			return {ok: false, error: `Cannot instantiate line ${pParams.ref}`};
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
			return {ok: false, error: `Cannot bind line`};
		}

		try {
			this.diagram.addFreeArrow(newLine);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {ok: true, value: newLine};
	}

	// -------------- Free element interactions ----------------
	private deleteFreeVisual(target: Visual): Result<Visual> {
		if (!this.diagram.userChildren.includes(target)) {
			return {
				ok: false,
				error: `Cannot remove controlled element ${target.ref} with this method`
			};
		}

		try {
			this.diagram.remove(target);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {ok: true, value: target};
	}
	private deleteFreeVisualByID(id: ID) {
		var target: Visual | undefined = this.identifyElement(id);
		if (target === undefined) {
			throw new Error(`Cannot find element with ID ${id}`);
		}

		if (!this.diagram.userChildren.includes(target)) {
			throw new Error(`Cannot remove controlled element ${target.ref} with this method`);
		}

		this.diagram.remove(target);
		this.draw();
	}

	// -------------- Mounted visual interactions ----------------
	// @isMountable
	@draws
	public mountVisual(target: Visual, insert: boolean = true): Result<Visual> {
		// Temporary
		if (target.mountConfig !== undefined) {
			target.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
		}

		try {
			this.diagram.mountElement(target, insert);
		} catch (err) {
			return {ok: false, error: `Cannot mount element ${target.ref}`};
		}

		return {ok: true, value: target};
	}

	@draws
	private deleteMountedVisual(
		target: Visual,
		removeColumn: boolean = true
	): Result<{target: Visual; removedColumn: boolean}> {
		var columnRemoved: boolean = false;
		// Find which channel owns this element:

		try {
			columnRemoved = this.diagram.deleteMountedElement(target, removeColumn);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {
			ok: true,
			value: {target: target, removedColumn: columnRemoved}
		};
	}

	@draws
	private replaceMountable(target: Visual, newElement: Visual): Result<Visual> {
		logger.operation(Operations.MODIFY, `${target} -> ${newElement}`);

		var deleteResult: Result<{target: Visual; removedColumn: boolean}> =
			this.deleteMountedVisual(target, false);
		if (deleteResult.ok === false) {
			return {ok: false, error: deleteResult.error};
		}

		var mountResult: Result<Visual> = this.mountVisual(newElement, false);
		if (mountResult.ok === false) {
			return mountResult;
		}

		return {ok: true, value: mountResult.value};
	}

	// For inserting
	// @isMountable
	public shiftMountedVisual(target: Visual, newMountConfig: IMountConfig): Result<Visual> {
		var result: Result<{target: Visual; removedColumn: boolean}> = this.deleteMountedVisual(
			target,
			true
		);

		if (result.ok === false) {
			return {ok: false, error: result.error};
		}
		var deleted: boolean = result.value.removedColumn;

		if (
			deleted
			&& target.mountConfig!.index + target.mountConfig!.noSections === newMountConfig.index
		) {
			newMountConfig.index -= target.mountConfig!.noSections;
		}

		target.mountConfig = newMountConfig;
		return this.mountVisual(target, true);
	}

	// For moving to another mount
	public moveMountedVisual(target: Visual, newMountConfig: IMountConfig): Result<Visual> {
		var removeCol: boolean = true;
		if (target.mountConfig!.index === newMountConfig.index) {
			// Moving to the same column (for intra-channel movement)
			removeCol = false;
		}
		var result: Result<{target: Visual; removedColumn: boolean}> = this.deleteMountedVisual(
			target,
			removeCol
		);

		if (result.ok === false) {
			return {ok: false, error: result.error};
		}
		var deleted: boolean = result.value.removedColumn;

		if (
			deleted
			&& target.mountConfig!.index + target.mountConfig!.noSections < newMountConfig.index
		) {
			newMountConfig.index -= 1;
		}

		target.mountConfig = newMountConfig;

		return this.mountVisual(target, false);
	}
	// ------------------------------------------------------------
}
