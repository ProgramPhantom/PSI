import JSZip from "jszip";
import { SVGDBEntry } from "../logic/assetStore";
import ENGINE from "../logic/engine";
import { selectAssociatedAssetsBySchemeId } from "../redux/slices/schemesSlice";
import { IScheme, SchemeDict, SchemeMetadata } from "../types/schemes";

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

    const elements = scheme.components;
    Object.entries(elements).forEach(([id, el]) => {
        componentsFolder.file(`${id}.json`, JSON.stringify(el, null, 2));
    });

    const usedAssets: string[] = selectAssociatedAssetsBySchemeId({ schemes: { schemes } } as any, schemeId);

    for (const assetId of usedAssets) {
        const assetFile: SVGDBEntry | null = await ENGINE.assetStore.getAsset(assetId);

        if (assetFile) {
            assetsFolder.file(`${assetId}.svg`, assetFile.file);
            assetsFolder.file(`${assetId}.json`, JSON.stringify({ ref: assetFile.ref }));
        }
    }

    return zip;
}