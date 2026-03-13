import JSZip from "jszip";
import { IVisual } from "../logic/visual";
import ENGINE from "../logic/engine";
import { downloadBlob } from "../logic/util2";

export async function createComponentFile(component: IVisual): Promise<JSZip> {
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

    for (const assetId of usedAssets) {
        const assetFile = await ENGINE.assetStore.getAsset(assetId);
        if (assetFile) {
            assetsFolder.file(`${assetId}.svg`, assetFile.file);
            assetsFolder.file(`${assetId}.json`, JSON.stringify({ ref: assetFile.ref }));
        }
    }

    return zip;
}

export async function saveComponentFile(component: IVisual) {
    const file = await createComponentFile(component);
    const blob = await file.generateAsync({ type: "blob" });
    const name = (component as any).ref ?? "component";
    downloadBlob(blob, `${name}.nmrc`);
}