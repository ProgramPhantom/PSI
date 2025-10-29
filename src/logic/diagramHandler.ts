import { Rect, Svg } from "@svgdotjs/svg.js";
import { myToaster } from "../app/App";
import { PointBind } from "../features/canvas/LineTool";
import SchemeManager from "./default";
import * as defaultDiagram from "./default/defaultDiagram.json";
import Diagram, { IDiagram } from "./hasComponents/diagram";
import LabelGroup, { ILabelGroup } from "./hasComponents/labelGroup";
import SequenceAligner, { ISequenceAligner } from "./hasComponents/sequenceAligner";
import { ID } from "./point";
import RectElement, { IRectElement } from "./rectElement";
import { IMountConfig, PlacementConfiguration } from "./spacial";
import SVGElement, { ISVGElement } from "./svgElement";
import { RecursivePartial } from "./util";
import { IDraw, IVisual, Visual } from "./visual";
import Sequence from "./hasComponents/sequence";
import Channel, { IChannel } from "./hasComponents/channel";
import Line, { ILine } from "./line";

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
	| "sequence-aligner"
	| "sequence"
	| "diagram";
export type DrawComponent = "svg" | "rect" | "space";

// Abstract component types (have no visual content)
export type AbstractComponentTypes = "aligner" | "collection" | "lower-abstract" | "visual" | "grid";



export default class DiagramHandler implements IDraw {
	public diagram: Diagram;

	surface?: Svg;
	schemeManager: SchemeManager;

	get id(): string {
		var id: string = "";
		this.diagram.children.forEach((s) => {
			Object.keys(s.allElements).forEach((k) => {
				id += k;
			});
		});
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

	constructor(surface: Svg, emitChange: () => void, schemeManager: SchemeManager) {
		this.syncExternal = emitChange;
		this.schemeManager = schemeManager;
		this.surface = surface;

		var constructResult: Result<Diagram> = this.constructDiagram(
			(<any>defaultDiagram) as Diagram
		);

		if (constructResult.ok) {
			this.diagram = constructResult.value;
		} else {
			myToaster.show({
				message: "Error loading diagram",
				intent: "danger"
			});
			this.diagram = new Diagram(<any>defaultDiagram);
		}
	}

	draw() {
		if (!this.surface) {
			throw new Error("Svg surface not attached!");
		}

		this.computeDiagram();

		this.surface.add(new Rect().move(0, 0).id("diagram-root"));

		this.surface.size(`${this.diagram.width}px`, `${this.diagram.height}px`);
		this.diagram.draw(this.surface);
		this.syncExternal();
	}

	erase() {
		this.diagram.erase();
	}

	computeDiagram() {
		this.diagram.computeSize();
		this.diagram.computePositions({x: 0, y: 0});
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
					c.pulseElements.forEach((m) => {
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

	@draws
	freshDiagram() {
		this.diagram = new Diagram(<any>defaultDiagram);
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
				// Temporary as we only allow one sequence currently.
				if (parameters.placementMode.type === "pulse") {
					parameters.placementMode.config.sequenceID = this.diagram.sequenceIDs[0];
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
		var mountConfigCopy: IMountConfig | undefined;
		if (target.placementMode.type === "pulse") {
			mountConfigCopy = target.placementMode.config;
		}
		
		// Delete element
		this.deleteVisual(target);

		// Copy hidden parameter channelID (this shouldn't be needed as it should take the state
		// from the form. The hidden values should still be in the form.)
		if (mountConfigCopy !== undefined && parameters.placementMode.type === "pulse") {
			parameters.placementMode.config.channelID = mountConfigCopy.channelID;
			parameters.placementMode.config.index = mountConfigCopy.index;
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

	// ------------------------------------------

	// ---------- Visual interaction (generic) -----------
	@draws
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

		this.placeVisual(element);
	}
	@draws
	public moveVisual(element: Visual, x: number, y: number): Result<Visual> {
		// Cancel if pulse position type or change to free position type?

		try {
			element.x = x;
			element.y = y;

		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}

		return {ok: true, value: element};
	}
	@draws
	public deleteVisual(target: Visual): Result<Visual> {
		var result: Result<Visual>;

		if (target.placementMode.type === "pulse") {
			try {
				this.diagram.deletePulse(target);
				result = {ok: true, value: target};
			} catch (err) {
				result = {ok: false, error: (err as Error).message}
			}
		} else if (target.placementMode.type === "free") {
			try {
				this.diagram.remove(target);
				result = {ok: true, value: target};
			} catch (err) {
				result = {ok: false, error: (err as Error).message}
			}
		} else if (target.placementMode.type === "binds") {
			// TODO
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
		var result: Result<Channel>;

		var sequence: Sequence | undefined = this.diagram.sequenceDict[element.sequenceID];

		if (sequence === undefined) {
			result = {
				ok: false,
				error: `Cannot find sequence of ID ${element.sequenceID}`
			};
		}

		try {
			sequence.addChannel(element);
		} catch (err) {
			result = {ok: false, error: (err as Error).message};
		}
		result = {ok: true, value: element};
		return result;
	}

	@draws
	public deleteChannel(target: Channel): Result<Channel> {
		var result: Result<Channel>;

		var sequence: Sequence | undefined = this.diagram.sequenceDict[target.sequenceID];

		if (sequence === undefined) {
			result = {
				ok: false,
				error: `Cannot find channel with ID: ${target.sequenceID}`
			};
		}

		try {
			sequence.deleteChannel(target);
		} catch (err) {
			result = {ok: false, error: (err as Error).message};
		}
		result = {ok: true, value: target};
		return result
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

		// try {
		// 	this.diagram.addFreeArrow(newLine);
		// } catch (err) {
		// 	return {ok: false, error: (err as Error).message};
		// }

		return {ok: true, value: newLine};
	}

	// -------------- Placement ----------------
	private placeVisual(target: Visual): Result<Visual> {
		var placementMode: PlacementConfiguration = target.placementMode;
		try {
			if (placementMode.type === "pulse") {
				this.diagram.addPulse(target);
			} else if (placementMode.type === "binds") {
				// TODO
			} else if (placementMode.type === "free") {
				// Do nothing I believe.
			}
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}
		
		return {ok: true, value: target}
	}
}
