import MissingAssetSVG from "../assets/app/MissingAsset2.svg?raw";



// TODO: if there are performance problems, try loading not as raw and using svg encoding instead.
const CLIENT_SVGS: SVGDict = import.meta.glob("../assets/svg/*.svg", {
    query: "?raw",
    import: "default",
    eager: true
});


export type SVGDict = Record<string, string>;


export default class AssetStore {
    static SVGStringsStorageName: string = "svgs";
    static MissingSVGAssetStr: string = MissingAssetSVG;


    public svgStrings: SVGDict = {};


    public async loadAllSVGs() {
        // Get all svg data, from the assets and from internal storage:

        var allSvgData: SVGDict = {};
        var assetData: SVGDict = {};

        // Try to load from assets:
        try {
            assetData = await this.getAssetSVGs();
            allSvgData = { ...assetData };
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

    //  Get svgs from client
    private async getAssetSVGs(): Promise<SVGDict> {
        var renamedSVGAssets = Object.fromEntries(
            Object.entries(CLIENT_SVGS).map(([path, content]) => {
                const name = (path.split("/").pop() ?? "").replace(".svg", "");
                return [name, content];
            })
        );

        return renamedSVGAssets;
    }

    // Get local store saved SVGs
    private getLocalStoreSVGs(): SVGDict {
        // Try to load svg from internal storage:
        var storedDataStr: string | null = localStorage.getItem(
            AssetStore.SVGStringsStorageName
        );
        if (storedDataStr === null) {
            return {};
        }

        var storedData: SVGDict = JSON.parse(storedDataStr);

        // TODO: add validation.
        return storedData;
    }

    // Method for adding svg data to a scheme
    public addSVGData(dataString: string, reference: string) {
        if (this.svgStrings?.[reference] !== undefined) {
            console.warn(`Overriding svg ${reference}`);
        }

        this.svgStrings[reference] = dataString;
    }
}



/**
 * Merge two objects preferring non-empty object values from obj1.
 * If a value in obj1 is an empty object ({}), the value from obj2 is used.
 */
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