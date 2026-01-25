import { Element, Svg, SVG } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";
import SchemeManager, { IUserSchemeData } from "./default";
import DiagramHandler, { ActionResult, Result } from "./diagramHandler";
import Grid, { IGrid } from "./grid";
import Channel, { IChannel } from "./hasComponents/channel";
import Diagram, { IDiagram } from "./hasComponents/diagram";
import Label, { ILabel } from "./hasComponents/label";
import LabelGroup, { ILabelGroup } from "./hasComponents/labelGroup";
import Sequence, { ISequence } from "./hasComponents/sequence";
import SequenceAligner, { ISequenceAligner } from "./hasComponents/sequenceAligner";
import { AllComponentTypes } from "./point";
import RectElement, { IRectElement } from "./rectElement";
import SVGElement, { ISVGElement } from "./svgElement";
import Text, { IText } from "./text";
import Visual, { GridElement, IVisual } from "./visual";


//                                    scheme name
export type SingletonStorage = Record<string, Visual[]>;

class ENGINE {
	static SURFACE_ID: string = "surface"
	static listeners: (() => void)[] = [];
	static currentImageName: string = "newPulseImage.svg";
	static StateName: string = "diagram-state";
	static STATE: string | null = localStorage.getItem(ENGINE.StateName);
	static schemeManager: SchemeManager;
	static singletons: SingletonStorage;

	static set surface(s: Svg) {
		ENGINE._surface = s;
		ENGINE._surface.attr({ "id": ENGINE.SURFACE_ID })
		ENGINE._handler = new DiagramHandler(s, ENGINE.emitChange, this.schemeManager, ENGINE.ConstructElement);
		console.log("SURFACE ATTACHED");
	}
	static get surface(): Svg {
		return ENGINE._surface;
	}
	private static _surface: Svg;

	static initialiseSchemeManager() {
		ENGINE.schemeManager = new SchemeManager(ENGINE.emitChange);
	}

	static get handler(): DiagramHandler {
		if (ENGINE._handler === undefined) {
			throw new Error("Handler has not been created");
		}
		return ENGINE._handler;
	}
	private static _handler: DiagramHandler;

	static subscribe(listener: () => void) {
		ENGINE.listeners = [...ENGINE.listeners, listener];
		return (() => {
			ENGINE.listeners = ENGINE.listeners.filter((l) => l !== listener);
		}).bind(ENGINE);
	}
	static getSnapshot() {
		return ENGINE.handler.id + ENGINE.schemeManager.id;
	}
	static emitChange() {
		ENGINE.listeners.forEach((l) => {
			l();
		});
	}
	static loadDiagramState() {
		var stateObj: IDiagram | undefined = undefined;
		if (this.STATE !== null) {
			try {
				stateObj = JSON.parse(this.STATE) as IDiagram;
			} catch (error) {
				console.warn(`Could not parse internal state`);
			}
		}

		if (stateObj !== undefined) {
			var result: Result<any> = this.handler.constructDiagram(stateObj);

			if (!result.ok) {
				console.warn(`Could not construct diagram from internal state`);
				this.handler.resetDiagram();
			}
		} else {
			this.handler.resetDiagram();
		}
	}
	static async loadSVGData() {
		await this.schemeManager.loadSVGs();
	}
	static save() {
		var stateObject: IDiagram = ENGINE.handler.diagram.state;
		var stateString = JSON.stringify(stateObject, undefined, 4);
		localStorage.setItem(ENGINE.StateName, stateString);
	}

	static clearState() {
		localStorage.removeItem(ENGINE.StateName);
	}

	static createSingletons() {
		var singletonCollections: SingletonStorage = {};

		for (var [schemeName, scheme] of Object.entries(this.schemeManager.allSchemes)) {
			var singletons: Visual[] = [];

			this.schemeManager.allElementsInScheme(schemeName).forEach((element) => {
				let clonedData: IVisual = structuredClone(element);

				clonedData.id = undefined;
				let singleton: Visual | undefined = ENGINE.ConstructElement(clonedData, element.type!);
				if (singleton !== undefined) {
					singletons.push(singleton)
				}
			})

			singletonCollections[schemeName] = singletons;
		}

		this.singletons = singletonCollections;
	}

	static addSingleton(
		data: IVisual,
		schemeName: string = SchemeManager.InternalSchemeName
	) {
		let clonedData: IVisual = structuredClone(data);
		clonedData.id = undefined;
		this.schemeManager.addElementData(clonedData, schemeName);


		let singleton: Visual | undefined = ENGINE.ConstructElement(clonedData, data.type!);
		if (singleton !== undefined) {
			this.singletons[schemeName].push(singleton)
		}
	}

	static removeSingleton(
		data: IVisual,
		schemeName: string = SchemeManager.InternalSchemeName
	) {

		this.schemeManager.removeElementData(data, schemeName);

		this.singletons[schemeName] = this.singletons[
			schemeName
		].filter((singleton) => singleton.id !== data.id);
		this.emitChange();
	}


	static addBlankScheme(name: string) {
		ENGINE.singletons[name] = [];
		ENGINE.schemeManager.setUserScheme(name.trim(), {});
	}
	static addScheme(name: string, data: IUserSchemeData) {
		ENGINE.schemeManager.setUserScheme(name, data);
		ENGINE.createSingletons();
	}
	static removeScheme(name: string) {
		delete ENGINE.singletons[name];
		ENGINE.schemeManager.deleteUserScheme(name);
	}


	static ConstructSVGElement(data: ISVGElement): SVGElement {
		var result: SVGElement = new SVGElement(data);
		if (ENGINE.schemeManager.svgStrings && data.svgDataRef) {
			if (ENGINE.schemeManager.svgStrings[data.svgDataRef] === undefined) {
				console.warn(
					`SVG data reference '${data.svgDataRef}' not found in SchemeManager`
				);
			} else {
				let svgString: string = ENGINE.schemeManager.svgStrings[data.svgDataRef];
				let svgObj: Element = SVG(svgString);

				result.setSvgData(svgObj);
			}
		}

		return result;
	}

	static ConstructElement(parameters: IVisual, type: AllComponentTypes): Visual | undefined {
		var element: Visual | undefined = undefined;

		switch (type) {
			case "svg":
				element = ENGINE.ConstructSVGElement(parameters as ISVGElement);
				break;
			case "rect":
				element = new RectElement(parameters as IRectElement);
				break;
			case "label-group":
				// Wipe the id of the core child (otherwise label group and core child would have same id)
				(parameters as ILabelGroup).coreChild.id = undefined;
				let coreChild: Visual | undefined = ENGINE.ConstructElement((parameters as ILabelGroup).coreChild, (parameters as ILabelGroup).coreChildType);

				if (coreChild === undefined) {
					break;
				}

				element = new LabelGroup(parameters as ILabelGroup, coreChild as GridElement);
				break;
			case "label":
				element = new Label(parameters as ILabel);
				break;
			case "sequence-aligner":
				element = new SequenceAligner(parameters as ISequenceAligner);
				break;
			case "collection":
				element = new Collection(parameters as ICollection);
				break;
			case "grid":
				element = new Grid(parameters as IGrid);
				break
			case "sequence":
				element = new Sequence(parameters as ISequence);
				break;
			case "channel":
				element = new Channel(parameters as IChannel);
				break;
			case "text":
				element = new Text(parameters as IText);
				break;
			case "diagram":
				element = new Diagram(parameters as IDiagram);
				break;

			default:
				element = undefined;
		}

		if (element !== undefined && Collection.isCollection(parameters)) {
			parameters.children.forEach(c => {
				c.parentId = parameters.id;
				ENGINE.BuildSection(c, element!)
			})
		}

		return element
	}

	// ----- Construct diagram from state ------
	static BuildSection(params: IVisual, parent: Visual) {
		if (parent === undefined) {
			throw new Error(`Cannot find parent to element ${params.ref}, with parent id ${params.parentId}`)
		}

		let element: Visual | undefined = ENGINE.ConstructElement(params, params.type as AllComponentTypes);

		if (element === undefined) {
			throw new Error(`Error instantiating element ${params.ref}`)
		}

		if (Collection.isCollection(parent)) {
			parent.add({ child: element });
		}



	}
}

export default ENGINE;
