import MissingAssetSVG from "../assets/app/MissingAsset2.svg?raw";


export type SVGDict = Record<string, string>;


export default class AssetStore {
    static SVGStringsStorageName: string = "svgs";
    static MissingSVGAssetStr: string = MissingAssetSVG;

    public svgStrings: SVGDict = {};

    // Method for adding svg data to a scheme
    public addSVGData(dataString: string, reference: string) {
        if (this.svgStrings?.[reference] !== undefined) {
            console.warn(`Overriding svg ${reference}`);
        }

        this.svgStrings[reference] = dataString;
    }

    public removeSVGData(reference: string) {
        delete this.svgStrings[reference];
    }
}


