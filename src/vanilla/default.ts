import { publicDecrypt } from "crypto"
import { IArrow } from "./arrow"
import { IChannel } from "./channel"
import { IDiagram } from "./diagram"
import { ILabel } from "./label"
import { ILabellable } from "./labellable"
import { ILine } from "./line"
import { IRectElement } from "./rectElement"
import { ISequence } from "./sequence"
import { ISVGElement } from "./svgElement"
import { IText } from "./text"
import defaultScheme from "./default/data/schemeSet.json"
import { UserComponentType } from "./diagramHandler"


const svgPath: string = "\\src\\assets\\"
var schemes: string[] = ["default"]


// A "scheme" will be the name for a configuration for a package of defaults for the application 
// to use. It includes prefabs for elements, defaults for sequences etc. The application can 
// contain multiple 
export interface ISchemeData {
    diagram: IDiagram,
    sequence: ISequence,
    channel: IChannel,

    svgElements: Record<string, ISVGElement>
    svgStrings: SVGDict | undefined;

    rectElements: Record<string, IRectElement>,
    labellableElements: Record<string, ILabellable>

    arrow: IArrow,
    line: ILine,
    text: IText,
}

// A scheme set is a collection of schemes with names. This object is used to store all the default
// values the application can have.
export type SchemeSet = Record<string, Partial<ISchemeData>>;
export type SVGDict = Record<string, string>;

export default class SchemeManager {
    static DefaultSchemeName: string = "default"
    static StorageName: string = "schemeSet"
    static SVGAssetPath: string = "\\src\\assets\\"

    public get defaultScheme(): ISchemeData {
        if (this._schemes[SchemeManager.DefaultSchemeName] === undefined) {
            throw new Error(`Scheme manager contains no default scheme`);
        }
        // TODO: is there a way to validate this?
        return this._schemes[SchemeManager.DefaultSchemeName] as ISchemeData
    };

    private _schemes: SchemeSet = {};
    public get schemeData(): Partial<ISchemeData>[] {return Object.values(this.schemeSet)}
    public get schemeSet(): SchemeSet {
        return this._schemes;
    };
    public set schemeSet(v: SchemeSet) {
        this._schemes = v;
    }
    public get SVGData(): Record<string, SVGDict> {
        var svgData: Record<string, SVGDict> = {}
        for (var [schemeName, schemeData] of Object.entries(this.schemeSet)) {
            svgData[schemeName] = schemeData.svgStrings ?? {};
        } 
        return svgData;
    }
    public setScheme(name: string, scheme: Partial<ISchemeData>) {
        if (name === "default") {
            throw new Error(`Cannot override default scheme`);
        }
        this.schemeSet[name] = scheme;
    }
    get schemeNames(): string[] {
        return Object.keys(this.schemeSet);
    }

    get elementTypes(): Record<string, UserComponentType> {
        var types: Record<string, UserComponentType> = {};
        
        for (var scheme of this.schemeData) {
            Object.keys(scheme.svgElements ?? {}).forEach((r) => {
                types[r] = "svg";
            })
            Object.keys(scheme.rectElements ?? {}).forEach((r) => {
                types[r] = "rect";
            })
            Object.keys(scheme.labellableElements ?? {}).forEach((r) => {
                types[r] = "labellable";
            })
        }

        return types;
    }


    constructor() {
        var initialScheme: Record<string, ISchemeData> = JSON.parse(JSON.stringify(defaultScheme));

        this.schemeSet = this.getLocalSchemes();
        this.schemeSet = {...initialScheme, ...this.schemeSet}; 
    
        this.saveToLocalStore();
    }

    
    // Goes through all schemes and makes sure they have their associated svg data.
    public async loadSVGs() {
        // Get all svg data, from the assets and from internal storage:

        var allSvgData: Record<string, Record<string, string>> = {};
        
        // Try to load from assets:
        try {
            var assetData = await this.getAssetSVGs();
            allSvgData = {...assetData};
        } catch {
            console.warn(`Failed to load asset svg data`)
        }

        try {
            var localSvgData = this.getLocalSVGs();
            // TODO: sort this shit out
            allSvgData = {"default": {...allSvgData["default"], ...localSvgData["default"]}};
        } catch {
            console.warn(`Failed to load local svg data`);
        }


        // Confirm that every svg in each scheme has a corresponding svg data collected above

        var svgsWithMissing: ISVGElement[] = [];
        for (var [schemeName, scheme] of Object.entries(this.schemeSet)) {
            if (!scheme.svgElements) {continue}

            for (var [name, svgElement] of Object.entries(scheme.svgElements)) {
                if (allSvgData[schemeName][name] === undefined) { svgsWithMissing.push(svgElement) }
            }
        }

        if (svgsWithMissing.length > 0) {
            // Perhaps instead, remove the svg?
            throw new Error(`Cannot find svg data for ${svgsWithMissing[0].ref}`);
        } else {
            // Apply loaded svgs to scheme set
            for (var [schemeName, scheme] of Object.entries(this.schemeSet)) {
                this.schemeSet[schemeName].svgStrings = allSvgData[schemeName];
            }
        }
    }

    // Load scheme data from local storage
    public getLocalSchemes(): SchemeSet {
        var storedDataStr: string | null = localStorage.getItem(SchemeManager.StorageName);
        if (storedDataStr === null) {
            return {};
        }

        var storedData: SchemeSet = JSON.parse(storedDataStr);
        // TODO: validate

        return storedData;
    }

    // Method for adding svg data to a scheme
    public addSVGStrData(dataString: string, reference: string, schemeName: string) {
        if (this.schemeSet[schemeName] === undefined) {
            throw new Error(`Cannot add svg data to non-existent scheme ${schemeName}`)
        }

        if (this.schemeSet[schemeName].svgStrings === undefined) {this.schemeSet[schemeName].svgStrings = {}}
        this.schemeSet[schemeName].svgStrings[reference] = dataString;
        this.saveToLocalStore();
    }

    public addSVGData(data: ISVGElement, schemeName:string=SchemeManager.DefaultSchemeName) {
        if (this.schemeSet[schemeName] === undefined) {
            throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`)
        }
        
        if (this.schemeSet[schemeName].svgElements === undefined) {this.schemeSet[schemeName].svgElements = {}}
        this.schemeSet[schemeName].svgElements[data.ref] = data;
        this.saveToLocalStore()
    }

    public addRectData(data: IRectElement, schemeName:string=SchemeManager.DefaultSchemeName) {
        if (this.schemeSet[schemeName] === undefined) {
            throw new Error(`Cannot add svg template to non-existent scheme ${schemeName}`)
        }
        
        if (this.schemeSet[schemeName].rectElements === undefined) {this.schemeSet[schemeName].rectElements = {}}
        this.schemeSet[schemeName].rectElements[data.ref] = data;
        this.saveToLocalStore();
    }

    private saveToLocalStore() {
        localStorage.setItem(SchemeManager.StorageName, JSON.stringify(this.schemeSet));
    }

    private async getAssetSVGs(): Promise<Record<string, SVGDict>> {
        const svgStrings: Record<string, SVGDict> = {};


        for (const [schemeName, scheme] of Object.entries(this.schemeSet)) {
            if (scheme.svgElements === undefined) {continue}
            var svgData: Record<string, string> = {};
            for (var [name, el] of Object.entries(scheme.svgElements)) {
                if (name === "tick") {
                    console.log()
                }
                var fetchString = SchemeManager.SVGAssetPath + name + ".svg";

                try {
                    var svg = await fetch(fetchString, {cache: "no-store"}).then(
                        (response) => {
                            console.log(`STATUS ${response.status}`)
                            if (!response.ok || response.status === 404) {
                                throw new Error("asset not found");
                            }

                            return response.text()
                        }
                    ).catch(
                        (error) => {console.error(`Cannot find svg for element ${el.ref}`)}
                    )
                } catch {continue}
                
            
                if (svg) {
                    svgData[name] = svg;
                }
            }

            svgStrings[schemeName] = svgData;
        }

        return svgStrings;
    }

    private getLocalSVGs(): Record<string, SVGDict> {
        // Try to load svg from internal storage:
        var storedDataStr: string | null = localStorage.getItem(SchemeManager.StorageName);
        if (storedDataStr === null) {
            return {};
        }

        var storedData: SchemeSet = JSON.parse(storedDataStr);

        var svgData: Record<string, Record<string, string>> = {};
        for (var [schemeName, scheme] of Object.entries(storedData)) {
            svgData[schemeName] = scheme.svgStrings ?? {}
        }
        
        // TODO: add validation.

        return svgData;
    }
}