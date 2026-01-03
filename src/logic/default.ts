import MissingAssetSVG from "../assets/app/MissingAsset2.svg?raw";
import { DEFAULT_SCHEME_SET } from "./default/schemeSet";
import type { IChannel } from "./hasComponents/channel";
import { IDiagram } from "./hasComponents/diagram";
import { ILabelGroup } from "./hasComponents/labelGroup";
import { ISequence } from "./hasComponents/sequence";
import { ISequenceAligner } from "./hasComponents/sequenceAligner";
import { ILine } from "./line";
import { ID, UserComponentType } from "./point";
import { IRectElement } from "./rectElement";
import { ISVGElement } from "./svgElement";
import { IText } from "./text";


// TODO: if there are performance problems, try loading not as raw and using svg encoding instead.
const ASSET_SVGS: SVGDict = import.meta.glob("../assets/svg/*.svg", {
	query: "?raw",
	import: "default",
	eager: true
});

const svgPath: string = "\\src\\assets\\";
var schemes: string[] = ["default"];


export interface AppConfigSchemeData {
	diagram: ISequenceAligner;
	sequence: ISequence;
	channel: IChannel;
	line: ILine;
	text: IText;
}

export type AppConfigSchemeSet = {
	"form-defaults": AppConfigSchemeData;
};

// A "scheme" will be the name for a configuration for a package of defaults for the application
// to use. It includes prefabs for elements, defaults for sequences etc. The application can
// contain multiple
export interface IUserSchemeData {
	diagram: Record<string, IDiagram> | undefined;
	sequence: Record<string, ISequence> | undefined;
	channel: Record<string, IChannel> | undefined;

	svgElements: Record<string, ISVGElement> | undefined;
	rectElements: Record<string, IRectElement> | undefined;
	labelGroupElements: Record<string, ILabelGroup> | undefined;

	line: Record<string, ILine> | undefined;
	text: Record<string, IText> | undefined;
}

// A scheme set is a collection of schemes with names. This object is used to store all the default
// values the application can have.
export type SchemeSet = Record<string, Partial<IUserSchemeData>>;
export type SVGDict = Record<string, string>;
export type PartialUserSchemeData = Partial<IUserSchemeData>;

export default class SchemeManager {
	static InternalSchemeName: string = "internal";
	static SchemeSetStorageName: string = "schemeSet";
	static SVGStringsStorageName: string = "svgs";
	static MissingSVGAssetStr: string = MissingAssetSVG;

	public emitChange: () => void;
	public get id(): ID {
		return JSON.stringify(this.userSchemeSet);
	}

	public internalScheme: IUserSchemeData;
	public svgStrings: SVGDict = {};

	private _userSchemeSet: SchemeSet = {};
	public get schemesList(): DeepReadonly<PartialUserSchemeData[]> {
		return Object.values(this.allSchemes);
	}

	public get userSchemeSet(): DeepReadonly<SchemeSet> {
		return this._userSchemeSet;
	}
	public set userSchemeSet(schemeSet: SchemeSet) {
		this._userSchemeSet = schemeSet;
		this.emitChange();
	}

	get allSchemes(): SchemeSet {
		return {
			...this._userSchemeSet,
			[SchemeManager.InternalSchemeName]: this.internalScheme
		};
	}
	get allSchemeNames(): string[] {
		return Object.keys(this.allSchemes);
	}
	get allSVGDataRefs(): string[] {
		return Object.keys(this.svgStrings ?? {});
	}



	get elementTypes(): Record<string, UserComponentType> {
		var types: Record<string, UserComponentType> = {};

		for (var scheme of this.schemesList) {
			Object.keys(scheme.svgElements ?? {}).forEach((r) => {
				types[r] = "svg";
			});
			Object.keys(scheme.rectElements ?? {}).forEach((r) => {
				types[r] = "rect";
			});
			Object.keys(scheme.labelGroupElements ?? {}).forEach((r) => {
				types[r] = "label-group";
			});
		}

		return types;
	}

	constructor(emitChange: () => void) {
		this.emitChange = () => {
			this.saveToLocalStore();
			emitChange();
		};

		var initialScheme: Record<string, IUserSchemeData> = JSON.parse(
			JSON.stringify(DEFAULT_SCHEME_SET)
		);

		this.internalScheme = initialScheme[SchemeManager.InternalSchemeName];

		this.userSchemeSet = this.getLocalSchemes();
		this.loadSVGs();
	}

	public setUserScheme(name: string, schemeData: PartialUserSchemeData) {
		if (name === SchemeManager.InternalSchemeName) {
			throw new Error(`Cannot override default scheme`);
		}

		this._userSchemeSet[name] = schemeData;

		this.emitChange();
	}
	public setUserSchemeCollection<K extends keyof IUserSchemeData>(
		propertyName: K,
		schemeName: string,
		value: IUserSchemeData[K]
	) {
		if (this.allSchemes[schemeName] === undefined) {
			throw new Error(
				`Cannot add collection to scheme with name ${schemeName} as it does not exist.`
			);
		}

		this._userSchemeSet[schemeName][propertyName] = value;
		this.emitChange();
	}

	public deleteUserScheme(name: string) {
		delete this._userSchemeSet[name];
		this.emitChange();
	}

	//// ----------------- LOADERS -------------------
	// Goes through all schemes and makes sure they have their associated svg data.
	public async loadSVGs() {
		// Get all svg data, from the assets and from internal storage:

		var allSvgData: SVGDict = {};
		var assetData: SVGDict = {};

		// Try to load from assets:
		try {
			assetData = await this.getAssetSVGs();
			allSvgData = {...assetData};
		} catch {
			console.warn(`Failed to load asset svg data`);
		}

		try {
			var localSvgData: SVGDict = this.getLocalStoreSVGs();

			// TODO: sort this shit out
			allSvgData = mergeObjectsPreferNonEmpty(assetData, localSvgData);
		} catch {
			console.warn(`Failed to load local svg data`);
		}

		this.svgStrings = allSvgData;
		// Confirm that every svg in each scheme has a corresponding svg data collected above
	}

	private saveToLocalStore() {
		localStorage.setItem(SchemeManager.SchemeSetStorageName, JSON.stringify(this.allSchemes));

		if (this.svgStrings !== undefined) {
			localStorage.setItem(
				SchemeManager.SVGStringsStorageName,
				JSON.stringify(this.svgStrings)
			);
		}
	}

	private async getAssetSVGs(): Promise<SVGDict> {
		var renamedSVGAssets = Object.fromEntries(
			Object.entries(ASSET_SVGS).map(([path, content]) => {
				const name = (path.split("/").pop() ?? "").replace(".svg", "");
				return [name, content];
			})
		);

		return renamedSVGAssets;
	}

	private getLocalStoreSVGs(): SVGDict {
		// Try to load svg from internal storage:
		var storedDataStr: string | null = localStorage.getItem(
			SchemeManager.SVGStringsStorageName
		);
		if (storedDataStr === null) {
			return {};
		}

		var storedData: SVGDict = JSON.parse(storedDataStr);

		// TODO: add validation.

		return storedData;
	}

	// Load scheme data from local storage
	public getLocalSchemes(): SchemeSet {
		var storedDataStr: string | null = localStorage.getItem(SchemeManager.SchemeSetStorageName);
		if (storedDataStr === null) {
			return {};
		}

		var storedData: SchemeSet = JSON.parse(storedDataStr);
		// TODO: validate

		return storedData;
	}
	//// -----------------------------------------------

	//// ---------- Validate ----------------
	public validateAllSVGsPresent() {
		var svgsWithMissing: ISVGElement[] = [];
		// Iterate schemes
		for (var [schemeName, scheme] of Object.entries(this.allSchemes)) {
			if (!scheme.svgElements) {
				continue;
			}

			// Iterate svg elements
			for (var [name, svgElement] of Object.entries(scheme.svgElements)) {
				if (this.svgStrings?.[svgElement.svgDataRef] === undefined) {
					// Missing, so add a
					// this.svgStrings[svgElement.svgDataRef] = SchemeManager.MissingSVGAssetStr;
				}
			}
		}

		if (svgsWithMissing.length > 0) {
			// Perhaps instead, remove the svg?
			// throw new Error(`Cannot find svg data for ${svgsWithMissing[0].ref}`);
		}
	}

	//// ---------------------- MODIFIERS --------------
	// Method for adding svg data to a scheme
	public addSVGStrData(dataString: string, reference: string) {
		if (this.svgStrings?.[reference] !== undefined) {
			console.warn(`Overriding svg ${reference}`);
		}

		this.svgStrings[reference] = dataString;
		this.emitChange();
	}

	// Add
	public addSVGData(data: ISVGElement, schemeName: string = SchemeManager.InternalSchemeName) {
		if (this.userSchemeSet[schemeName] === undefined) {
			throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`);
		}

		var mutableSchemeSet: DeepMutable<SchemeSet> = structuredClone<DeepMutable<SchemeSet>>(
			this.userSchemeSet as DeepMutable<SchemeSet>
		);
		var selectedScheme: Partial<IUserSchemeData> = mutableSchemeSet[schemeName];

		if (selectedScheme.svgElements === undefined) {
			selectedScheme.svgElements = {};
		}
		this.setUserScheme(schemeName, {
			...selectedScheme,
			svgElements: {...selectedScheme.svgElements, [data.ref]: data}
		});
	}
	public addRectData(data: IRectElement, schemeName: string = SchemeManager.InternalSchemeName) {
		if (this.userSchemeSet[schemeName] === undefined) {
			throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`);
		}

		var mutableSchemeSet: DeepMutable<SchemeSet> = structuredClone<DeepMutable<SchemeSet>>(
			this.userSchemeSet as DeepMutable<SchemeSet>
		);
		var selectedScheme: Partial<IUserSchemeData> = mutableSchemeSet[schemeName];

		if (selectedScheme.rectElements === undefined) {
			selectedScheme.rectElements = {};
		}
		this.setUserScheme(schemeName, {
			...selectedScheme,
			rectElements: {...selectedScheme.rectElements, [data.ref]: data}
		});
	}
	public addLabelGroupData(
		data: ILabelGroup,
		schemeName: string = SchemeManager.InternalSchemeName
	) {
		if (this.userSchemeSet[schemeName] === undefined) {
			throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`);
		}

		var mutableSchemeSet: DeepMutable<SchemeSet> = structuredClone<DeepMutable<SchemeSet>>(
			this.userSchemeSet as DeepMutable<SchemeSet>
		);
		var selectedScheme: Partial<IUserSchemeData> = mutableSchemeSet[schemeName];

		if (selectedScheme.labelGroupElements === undefined) {
			selectedScheme.labelGroupElements = {};
		}
		this.setUserScheme(schemeName, {
			...selectedScheme,
			labelGroupElements: {
				...selectedScheme.labelGroupElements,
				[data.ref]: data
			}
		});
	}

	// Remove
	public removeSVGData(data: ISVGElement, schemeName: string = SchemeManager.InternalSchemeName) {
		if (this.userSchemeSet[schemeName] === undefined) {
			throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`);
		}

		var mutableSchemeSet: DeepMutable<SchemeSet> = structuredClone<DeepMutable<SchemeSet>>(
			this.userSchemeSet as DeepMutable<SchemeSet>
		);
		var selectedScheme: Partial<IUserSchemeData> = mutableSchemeSet[schemeName];

		if (selectedScheme.svgElements !== undefined) {
			delete selectedScheme.svgElements[data.ref];
		}
		this.setUserScheme(schemeName, {
			...selectedScheme,
			svgElements: selectedScheme.svgElements
		});
	}
	public removeRectData(
		data: IRectElement,
		schemeName: string = SchemeManager.InternalSchemeName
	) {
		if (this.userSchemeSet[schemeName] === undefined) {
			throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`);
		}

		var mutableSchemeSet: DeepMutable<SchemeSet> = structuredClone<DeepMutable<SchemeSet>>(
			this.userSchemeSet as DeepMutable<SchemeSet>
		);
		var selectedScheme: Partial<IUserSchemeData> = mutableSchemeSet[schemeName];

		if (selectedScheme.rectElements !== undefined) {
			delete selectedScheme.rectElements[data.ref];
		}
		this.setUserScheme(schemeName, {
			...selectedScheme,
			rectElements: selectedScheme.rectElements
		});
	}
	public removeLabelGroupData(
		data: ILabelGroup,
		schemeName: string = SchemeManager.InternalSchemeName
	) {
		if (this.userSchemeSet[schemeName] === undefined) {
			throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`);
		}

		var mutableSchemeSet: DeepMutable<SchemeSet> = structuredClone<DeepMutable<SchemeSet>>(
			this.userSchemeSet as DeepMutable<SchemeSet>
		);
		var selectedScheme: Partial<IUserSchemeData> = mutableSchemeSet[schemeName];

		if (selectedScheme.labelGroupElements !== undefined) {
			delete selectedScheme.labelGroupElements[data.ref];
		}
		this.setUserScheme(schemeName, {
			...selectedScheme,
			labelGroupElements: selectedScheme.labelGroupElements
		});
	}
	//// ----------------------------------------------
}

export type DeepReadonly<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export function mergeObjectsPreferNonEmpty(obj1: any, obj2: any) {
	const result: any = {};
	for (const key of new Set([...Object.keys(obj1), ...Object.keys(obj2)])) {
		const val1 = obj1[key];
		const val2 = obj2[key];

		// If val1 is empty object, use val2; otherwise use val1
		if (
			val1
			&& typeof val1 === "object"
			&& !Array.isArray(val1)
			&& Object.keys(val1).length === 0
		) {
			result[key] = val2;
		} else {
			result[key] = val1 ?? val2; // fallback if val1 is null/undefined
		}
	}
	return result;
}

export type DeepMutable<T> = {
	-readonly [P in keyof T]: DeepMutable<T[P]>;
};