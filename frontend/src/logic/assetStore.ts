import MissingAssetSVG from "../assets/app/MissingAsset2.svg?raw";
import { SVG, Element } from "@svgdotjs/svg.js";
import { sha256 } from "js-sha256";
import localforage from "localforage";

export type SVGDict = Record<string, { ref: string, object: Element }>;

export type SVGStoreEntry = { ref: string, object: Element }
export type SVGDBEntry = { ref: string, file: Blob | File }

export default class AssetStore {
    static MissingSVGAssetStr: string = MissingAssetSVG;

    public svgObjects: SVGDict = {};

    // Method for adding svg data to a scheme
    public async addSVGData(file: Blob | File, reference: string) {
        const dataString = await file.text();
        const id = sha256(dataString);

        if (this.svgObjects?.[id] !== undefined) {
            console.warn(`Overriding svg ${reference}`);
        }

        this.svgObjects[id] = { ref: reference, object: SVG(dataString) };

        await localforage.setItem<SVGDBEntry>(id, { ref: reference, file: file });
    }

    public async removeSVGData(reference: string) {
        delete this.svgObjects[reference];
        await localforage.removeItem(reference);
    }
}
