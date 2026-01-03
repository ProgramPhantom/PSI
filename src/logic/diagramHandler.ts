import { Rect, Svg } from "@svgdotjs/svg.js";
import { appToaster } from "../app/Toaster";
import SchemeManager from "./default";
import { defaultDiagram } from "./default/index.ts";
import Channel, { IChannel } from "./hasComponents/channel";
import Diagram, { IDiagram } from "./hasComponents/diagram";
import LabelGroup, { ILabelGroup } from "./hasComponents/labelGroup";
import Sequence from "./hasComponents/sequence";
import Line, { ILine } from "./line";
import { AllComponentTypes, ID } from "./point";
import RectElement, { IRectElement } from "./rectElement";
import { IMountConfig, PlacementConfiguration, PointBind } from "./spacial";
import SVGElement, { ISVGElement } from "./svgElement";
import Visual, { IDraw, IVisual } from "./visual";


export type Result<T = {}> = {ok: true; value: T} | {ok: false; error: string};

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

	constructor(surface: Svg, emitChange: () => void, schemeManager: SchemeManager, EngineConstructor: ((data: IVisual, type: AllComponentTypes) => Visual | undefined)) {
		this.syncExternal = emitChange;
		this.schemeManager = schemeManager;
		this.surface = surface;
		this.EngineConstructor = EngineConstructor;

		var constructResult: Result<Diagram> = this.constructDiagram(
			defaultDiagram
		);

		if (constructResult.ok) {
			this.diagram = constructResult.value;
		} else {
			appToaster.show({
				message: "Error loading diagram",
				intent: "danger"
			});
			this.diagram = new Diagram(defaultDiagram);
		}

		this.draw();
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
		this.diagram?.erase();
	}

	computeDiagram() {
		this.diagram.computeSize();
		this.diagram.growElement(this.diagram.size);
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
		this.erase();

		try {
			var newDiagram: Diagram = new Diagram(state);
		} catch (err) {
			return {ok: false, error: (err as Error).message};
		}
		this.diagram = newDiagram;

		try {
			// Create and mount pulses.
			state.sequenceAligner.children.forEach((s) => {
				s.channels.forEach((c) => {
					c.pulseElements.forEach((m) => {
						if (m.type === undefined) {
							console.warn(`Element data is missing type: ${m.ref}`);
						}
						this.addVisual(m, m.type as AllComponentTypes);
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
				if (parameters.placementMode?.type === "pulse") {
					parameters.placementMode.config.sequenceID = this.diagram.sequenceIDs[0];
				}

				result = this.addVisual(parameters, type);
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
		let deleteResult: Result<Visual> = this.deleteVisual(target, true);
		if (deleteResult.ok === false) {
			return deleteResult;
		}
		let id: ID = deleteResult.value.id;

		// Copy hidden parameter channelID (this shouldn't be needed as it should take the state
		// from the form. The hidden values should still be in the form.)
		// if (mountConfigCopy !== undefined && parameters.placementMode.type === "pulse") {
		// 	parameters.placementMode.config.channelID = mountConfigCopy.channelID;
		// 	parameters.placementMode.config.index = mountConfigCopy.index;
		// 

		parameters.id = id;
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

	public createVisual(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		var element: Visual | undefined = undefined;

		// NECESSARY to make element accept binding changes. X, Y persists when changing into a label
		// so if this isn't done, element might not carry changes and update label position.
		parameters.x = undefined;
		parameters.y = undefined;
		//parameters.id = undefined;

		switch (type) {
			case "svg":
				element = this.EngineConstructor(parameters as ISVGElement, type);
				break;
			case "rect":
				element = new RectElement(parameters as IRectElement);
				break;
			case "label-group":
				// Wipe the id of the core child (otherwise label group and core child would have same id)
				(parameters as ILabelGroup).coreChild.id = undefined;
				let coreChild: Result<Visual> = this.createVisual((parameters as ILabelGroup).coreChild, (parameters as ILabelGroup).coreChildType);
				
				if (coreChild.ok === true) {
					element = new LabelGroup(parameters as ILabelGroup, coreChild.value);
				}

				break;
			default:
				return {
					ok: false,
					error: `Cannot instantiate visual with type ${type}`
				};
		}

		if (element === undefined) {
			return {ok: false, error: `Cannot instantiate visual of type ${type}`}
		} else {
			return {ok: true, value: element}
		}
	}

	// ---------- Visual interaction (generic) -----------
	@draws
	public addVisual(parameters: IVisual, type: AllComponentTypes): Result<Visual> {
		var elementResult: Result<Visual> = this.createVisual(parameters, type);

		if (elementResult.ok === false) {
			return elementResult;
		} else {
			return this.placeVisual(elementResult.value);
		}
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
	public deleteVisual(target: Visual, modifying: boolean=false): Result<Visual> {
		var result: Result<Visual> = {ok: false, error: `Problem deleting visual ${target.ref}`};

		if (target.placementMode.type === "pulse") {
			try {
				this.diagram.deletePulse(target, modifying);
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


		var sequence: Sequence | undefined = this.diagram.sequenceDict[element.sequenceID ?? ""];

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

		var sequence: Sequence | undefined = this.diagram.sequenceDict[target.sequenceID ?? ""];

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
			var newLine: Line = new Line(pParams as ILine);
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