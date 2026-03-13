import JSZip from "jszip";
import ENGINE from "../logic/engine";
import { ISVGElement } from "../logic/svgElement";
import { IScheme, SchemeDict, SchemeMetadata } from "../types/schemes";
import { sha256 } from "js-sha256";
import { SVGDBEntry } from "../logic/assetStore";

export async function createSchemeFile(schemeId: string, schemes: SchemeDict): Promise<JSZip> {
    const zip = new JSZip();
    const scheme: IScheme | undefined = schemes[schemeId]?.scheme;

    if (!scheme) {
        throw new Error(`Scheme ${schemeId} not found`);
    }

    const manifestData: SchemeMetadata = {
        id: schemeId,
        name: scheme.metadata.name,
        format: "nmr-pulse-scheme"
    }
    zip.file("manifest.json", JSON.stringify(manifestData));

    const componentsFolder = zip.folder("components")!;
    const assetsFolder = zip.folder("assets")!;

    // Svg data refs
    const usedAssets = new Set<string>();

    const elements = scheme.components;
    Object.values(elements).forEach((el) => {
        const id = sha256(JSON.stringify(el));
        componentsFolder.file(`${id}.json`, JSON.stringify(el, null, 2));

        // Add svg file if svg
        if (el.type === "svg") {
            const svgEl = el as ISVGElement;
            if (svgEl.asset) {
                usedAssets.add(svgEl.asset.id);
            }
        }
    });

    for (const assetId of usedAssets) {
        const assetFile: SVGDBEntry | null = await ENGINE.assetStore.getAsset(assetId);

        if (assetFile) {
            assetsFolder.file(`${assetId}.svg`, assetFile.file);
            assetsFolder.file(`${assetId}.json`, JSON.stringify({ ref: assetFile.ref }));
        }
    }

    return zip;
}