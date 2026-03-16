import JSZip from "jszip";
import { downloadBlob } from "../logic/util2";
import ENGINE from "../logic/engine";

export async function createDiagramFile(diagramUUID: string): Promise<JSZip> {
    const zip = new JSZip();

    zip.file("diagram.json", JSON.stringify(ENGINE.diagramState, null, 2));

    const assetsFolder = zip.folder("assets")!;

    // We must find which assets are actually used in the diagram
    const requiredIds = ENGINE.getAssetRequirementsFromDiagram();

    // Mapping over all known dict entries to find matches
    for (const [id, refObj] of Object.entries(ENGINE.svgDict)) {
        if (!requiredIds.has(id)) {
            continue; // Only bundle used assets
        }

        // SVG.js elements can export their SVG string directly
        const svgString = refObj.object.svg();

        assetsFolder.file(`${id}.svg`, svgString);
        assetsFolder.file(`${id}.json`, JSON.stringify({ ref: refObj.ref }));
    }

    const manifest: any = {
        format: "nmr-pulse-diagram",
        version: 1,
        UUID: diagramUUID
    };

    zip.file("manifest.json", JSON.stringify(manifest));

    return zip
}

export async function saveDiagramFile(fileName: string = "diagram", diagramUUID: string) {
    const file = await createDiagramFile(diagramUUID)
    const blob = await file.generateAsync({ type: "blob" });

    // Ensure the extension is correct
    const finalFileName = fileName.endsWith(".nmrd") ? fileName : `${fileName}.nmrd`;

    downloadBlob(blob, finalFileName);
}