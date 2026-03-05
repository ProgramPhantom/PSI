import MissingAssetSVG from "../assets/app/MissingAsset2.svg?raw";
import { SVG, Element as SVGElementObject } from "@svgdotjs/svg.js";
import localforage from "localforage";

export type SVGDict = Record<string, SVGElementObject>;

export default class AssetStore {
    static MissingSVGAssetStr: string = MissingAssetSVG;

    public svgObjects: SVGDict = {};

    // Method for adding svg data to a scheme
    public async addSVGData(file: Blob | File, reference: string) {
        if (this.svgObjects?.[reference] !== undefined) {
            console.warn(`Overriding svg ${reference}`);
        }

        const text = await file.text();
        this.svgObjects[reference] = SVG(text);

        await localforage.setItem(reference, file);
    }

    public async removeSVGData(reference: string) {
        delete this.svgObjects[reference];
        await localforage.removeItem(reference);
    }
}
