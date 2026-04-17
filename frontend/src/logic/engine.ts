import { Element, Svg } from "@svgdotjs/svg.js";
import localforage from "localforage";
import AssetStore from "./assetStore";
import Collection, { ICollection } from "./collection";
import { DEFAULT_DIAGRAM } from "./default/defaultDiagram";
import DiagramHandler, { Result } from "./diagramHandler";
import Grid, { IGrid, ISubgrid, Subgrid } from "./grid";
import Channel, { IChannel } from "./hasComponents/channel";
import Diagram, { IDiagram } from "./hasComponents/diagram";
import Label, { ILabel } from "./hasComponents/label";
import LabelGroup, { ILabelGroup } from "./hasComponents/labelGroup";
import Sequence, { ISequence } from "./hasComponents/sequence";
import SequenceAligner, { ISequenceAligner } from "./hasComponents/sequenceAligner";
import { AllComponentTypes, ID } from "./point";
import RectElement, { IRectElement } from "./rectElement";
import SVGElement, { ISVGElement } from "./svgElement";
import Text, { IText } from "./text";
import Visual, { GridCellElement, IVisual } from "./visual";
import Line, { ILine } from "./line";


class ENGINE {
	static SURFACE_ID: string = "surface"
	static listeners: (() => void)[] = [];
	static DiagramStoreName: string = "diagram-state";
	static STATE: string | null = JSON.stringify(DEFAULT_DIAGRAM);

	static assetStore: AssetStore = new AssetStore();

	private static _surface: Svg;
	static set surface(s: Svg) {
		ENGINE._surface = s;
		ENGINE._surface.attr({ "id": ENGINE.SURFACE_ID })

		ENGINE._handler = new DiagramHandler(s, ENGINE.emitChange, ENGINE.ConstructElement);
	}
	static get surface(): Svg {
		return ENGINE._surface;
	}


	static get diagramState(): IDiagram {
		return ENGINE.handler.diagram.state
	}
	static get svgDict(): Record<ID, { ref: string, object: Element }> {
		return ENGINE.assetStore.svgObjects;
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
		return ENGINE.handler.id
	}
	static emitChange() {
		ENGINE.listeners.forEach((l) => {
			l();
		});
	}
	static loadDiagramState(newState?: IDiagram) {
		var stateObj: IDiagram | undefined = undefined;

		if (newState !== undefined) { this.STATE = JSON.stringify(newState) };
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

	static clearState() {
		localforage.removeItem(ENGINE.DiagramStoreName);
	}

	static resetDiagram() {
		ENGINE.handler.resetDiagram();
	}

	static getAssetRequirementsFromDiagram(): Set<string> {
		return ENGINE.getAssetRequirementsFromComponent(ENGINE.handler.diagram)
	}

	static getAssetRequirementsFromComponent(component: IVisual): Set<string> {
		let assets: Set<string> = new Set<string>();

		if (SVGElement.isSVGElement(component)) {
			assets.add(component.asset.id)
		} else if (Collection.isCollection(component)) {
			component.children.forEach((c) => {
				assets = new Set([...assets, ...ENGINE.getAssetRequirementsFromComponent(c)])
			})
		}

		return assets
	}

	static ConstructSVGElement(data: ISVGElement): SVGElement {
		var result: SVGElement = new SVGElement(data);
		if (ENGINE.assetStore.svgObjects && data.asset) {
			const id = data.asset.id === "builtin" ? data.asset.ref : data.asset.id

			if (ENGINE.assetStore.svgObjects[data.asset.id] === undefined) {
				console.warn(
					`SVG data reference '${data.asset.ref}' not found in AssetStore`
				);
			} else {
				let svgObj: Element = ENGINE.assetStore.svgObjects[id].object.clone(true, true) as Element;

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
				element = new LabelGroup(parameters as ILabelGroup);
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
			case "subgrid":
				element = new Subgrid(parameters as ISubgrid);
				break;
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
			case "line":
				element = new Line(parameters as ILine)
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
