import { Element, Svg, SVG } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";
import DiagramHandler, { ActionResult, Result } from "./diagramHandler";
import Grid, { IGrid, ISubgrid, Subgrid } from "./grid";
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
import Visual, { GridCellElement, IVisual } from "./visual";
import { api } from "../redux/api/api";
import { store } from "../redux/store";
import { appToaster } from "../app/Toaster";
import JSZip from "jszip"
import { downloadBlob } from "./util2";
import AssetStore from "./assetStore";
import { IScheme, selectSchemes, addScheme } from "../redux/schemesSlice";


class ENGINE {
	static SURFACE_ID: string = "surface"
	static listeners: (() => void)[] = [];
	static currentImageName: string = "newPulseImage.svg";
	static StateName: string = "diagram-state";
	static STATE: string | null = localStorage.getItem(ENGINE.StateName);

	static assetStore: AssetStore = new AssetStore();

	private static _surface: Svg;
	static set surface(s: Svg) {
		ENGINE._surface = s;
		ENGINE._surface.attr({ "id": ENGINE.SURFACE_ID })


		ENGINE._handler = new DiagramHandler(s, ENGINE.emitChange, ENGINE.ConstructElement);

		console.log("SURFACE ATTACHED");
	}
	static get surface(): Svg {
		return ENGINE._surface;
	}


	static get diagramState(): IDiagram {
		return ENGINE.handler.diagram.state
	}
	static get svgDict(): Record<string, string> {
		return ENGINE.assetStore.svgStrings
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
		await ENGINE.assetStore.loadAllSVGs();
	}
	static saveAs() {
		var stateObject: IDiagram = ENGINE.handler.diagram.state;
		var stateString = JSON.stringify(stateObject, undefined, 4);
		localStorage.setItem(ENGINE.StateName, stateString);

		// Creates diagram with fresh UUID
		store.dispatch(api.endpoints.createDiagram.initiate(stateObject.ref))
			.unwrap()
			.then((createResponse) => {
				if (createResponse.id !== undefined) {
					store.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: createResponse.id, diagram: stateObject }));
					localStorage.setItem("diagramUUID", createResponse.id);
				}
			})
			.catch(() => { });
	}
	static save() {
		var stateObject: IDiagram = ENGINE.handler.diagram.state;
		var stateString = JSON.stringify(stateObject, undefined, 4);
		localStorage.setItem(ENGINE.StateName, stateString);

		store.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: localStorage.getItem("diagramUUID") ?? "", diagram: stateObject }))
			.unwrap()
			.then((response) => {
				appToaster.show({ message: "Diagram saved", intent: "success" })
			})
			.catch((error) => {
				store.dispatch(api.endpoints.createDiagram.initiate(stateObject.ref))
					.unwrap()
					.then((createResponse) => {
						if (createResponse.id !== undefined) {
							store.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: createResponse.id, diagram: stateObject }));
							localStorage.setItem("diagramUUID", createResponse.id);

							appToaster.show({ message: "Diagram saved", intent: "success" })
						}
					})
					.catch(() => { });
			});
	}

	static clearState() {
		localStorage.removeItem(ENGINE.StateName);
	}

	static resetDiagram() {
		ENGINE.handler.resetDiagram();
		localStorage.removeItem("diagramUUID");
	}


	// ---------- File savers and downloaders ------------
	static async createDiagramFile(): Promise<JSZip> {
		const zip = new JSZip();

		zip.file("diagram.json", JSON.stringify(ENGINE.diagramState, null, 2));

		const assetsFolder = zip.folder("assets")!;

		for (const [id, svgText] of Object.entries(ENGINE.svgDict)) {
			assetsFolder.file(`${id}.svg`, svgText);
		}

		zip.file("manifest.json", JSON.stringify({
			format: "nmr-pulse-diagram",
			version: 1
		}));

		return zip
	}
	static async saveDiagramFile() {
		const file = await ENGINE.createDiagramFile()
		const blob = await file.generateAsync({ type: "blob" });

		downloadBlob(blob, "diagram.nmrd");
	}

	static async createSchemeFile(schemeName: string): Promise<JSZip> {
		const zip = new JSZip();
		const state = store.getState();
		const schemes = selectSchemes(state);
		const scheme: IScheme | undefined = schemes[schemeName];

		if (!scheme) {
			throw new Error(`Scheme ${schemeName} not found`);
		}

		zip.file("manifest.json", JSON.stringify({
			format: "nmr-pulse-scheme",
			version: 1,
			name: schemeName
		}));

		const componentsFolder = zip.folder("components")!;
		const assetsFolder = zip.folder("assets")!;

		// Svg data refs
		const usedAssets = new Set<string>();

		const elements = scheme.components;
		Object.values(elements).forEach((el) => {
			componentsFolder.file(`${el.ref}.json`, JSON.stringify(el, null, 2));

			// Add svg file if svg
			if (el.type === "svg") {
				const svgEl = el as ISVGElement;
				if (svgEl.svgDataRef) {
					usedAssets.add(svgEl.svgDataRef);
				}
			}
		});

		usedAssets.forEach((assetId) => {
			const svgText = ENGINE.svgDict[assetId];
			if (svgText) {
				assetsFolder.file(`${assetId}.svg`, svgText);
			}
		});

		return zip;
	}
	static async saveSchemeFile(schemeName: string) {
		const file = await ENGINE.createSchemeFile(schemeName);
		const blob = await file.generateAsync({ type: "blob" });
		downloadBlob(blob, `${schemeName}.nmrs`);
	}

	static async uploadSchemeFile(file: File, nameOverride?: string) {
		const zip = new JSZip();
		const unzipped = await zip.loadAsync(file);

		const manifestFile = unzipped.file("manifest.json");
		if (!manifestFile) {
			throw new Error("Invalid scheme file: missing manifest.json");
		}
		const manifestStr = await manifestFile.async("text");
		const manifest = JSON.parse(manifestStr);

		if (manifest.format !== "nmr-pulse-scheme") {
			appToaster.show({
				"message": "Invalid scheme format",
				"intent": "danger"
			})
			return
		}

		const schemeName = nameOverride || manifest.name || "Imported Scheme";

		// Load assets
		const assetsFolder = unzipped.folder("assets");
		if (assetsFolder) {
			const promises: Promise<void>[] = [];
			assetsFolder.forEach((relativePath, file) => {
				if (!file.dir && relativePath.endsWith(".svg")) {
					// Chop off .json
					const assetRef = relativePath.substring(0, relativePath.length - 4);
					promises.push(file.async("text").then(svgText => {
						ENGINE.assetStore.svgStrings[assetRef] = svgText;
					}));
				}
			});
			await Promise.all(promises);
		}

		// Load components
		const componentsFolder = unzipped.folder("components");
		const components: Record<string, IVisual> = {};
		if (componentsFolder) {
			const promises: Promise<void>[] = [];
			componentsFolder.forEach((relativePath, file) => {
				if (!file.dir && relativePath.endsWith(".json")) {
					promises.push(file.async("text").then(compStr => {
						const comp = JSON.parse(compStr) as IVisual;
						components[comp.ref] = comp;
					}));
				}
			});
			await Promise.all(promises);
		}

		const newScheme: IScheme = {
			metadata: { name: schemeName },
			components: components
		};

		store.dispatch(addScheme({ id: schemeName, scheme: newScheme }));
	}

	static async createComponentFile(component: IVisual): Promise<JSZip> {
		const zip = new JSZip();
		const state = component;

		zip.file("component.json", JSON.stringify(state, null, 2));

		zip.file("manifest.json", JSON.stringify({
			format: "nmr-pulse-component",
			version: 1,
			name: state.ref
		}));

		const assetsFolder = zip.folder("assets")!;
		const usedAssets: Set<string> = ENGINE.getAssetRequirementsFromComponent(component);

		usedAssets.forEach((assetId) => {
			const svgText = ENGINE.svgDict[assetId];
			if (svgText) {
				assetsFolder.file(`${assetId}.svg`, svgText);
			}
		});

		return zip;
	}
	static async saveComponentFile(component: IVisual) {
		const file = await ENGINE.createComponentFile(component);
		const blob = await file.generateAsync({ type: "blob" });
		const name = (component as any).ref ?? "component";
		downloadBlob(blob, `${name}.nmrc`);
	}



	static getAssetRequirementsFromComponent(component: IVisual): Set<string> {
		let assets: Set<string> = new Set<string>();

		if (SVGElement.isSVGElement(component)) {
			assets.add(component.svgDataRef)
		} else if (Collection.isCollection(component)) {
			component.children.forEach((c) => {
				assets = new Set([...assets, ...ENGINE.getAssetRequirementsFromComponent(c)])
			})
		}

		return assets
	}

	static ConstructSVGElement(data: ISVGElement): SVGElement {
		var result: SVGElement = new SVGElement(data);
		if (ENGINE.assetStore.svgStrings && data.svgDataRef) {
			if (ENGINE.assetStore.svgStrings[data.svgDataRef] === undefined) {
				console.warn(
					`SVG data reference '${data.svgDataRef}' not found in AssetStore`
				);
			} else {
				let svgString: string = ENGINE.assetStore.svgStrings[data.svgDataRef];
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

				element = new LabelGroup(parameters as ILabelGroup, coreChild as GridCellElement);
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
