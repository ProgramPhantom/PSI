import JSZip from "jszip";
import localforage from "localforage";
import { downloadBlob } from "../logic/util2";
import ENGINE from "../logic/engine";

export async function createDiagramFile(): Promise<JSZip> {
    const zip = new JSZip();

    zip.file("diagram.json", JSON.stringify(ENGINE.diagramState, null, 2));

    const assetsFolder = zip.folder("assets")!;

    for (const [id, refObj] of Object.entries(ENGINE.svgDict)) {
        const file = await localforage.getItem<File>(id)

        if (!file) {
            console.warn(`Cannot collect asset '${refObj.ref}' for diagram file`);
            continue
        }

        assetsFolder.file(`${id}.svg`, file);
    }

    zip.file("manifest.json", JSON.stringify({
        format: "nmr-pulse-diagram",
        version: 1
    }));

    return zip
}

export async function saveDiagramFile() {
    const file = await createDiagramFile()
    const blob = await file.generateAsync({ type: "blob" });

    downloadBlob(blob, "diagram.nmrd");
}