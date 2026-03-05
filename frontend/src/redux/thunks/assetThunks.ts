import { createAsyncThunk } from "@reduxjs/toolkit";
import { sha256 } from "js-sha256";
import localforage from "localforage";
import ENGINE from "../../logic/engine";
import { addAsset, deleteAsset, SVGDict } from "../slices/assetSlice";

// Load client SVGs
const CLIENT_SVGS: SVGDict = import.meta.glob("../../assets/svg/*.svg", {
    query: "?raw",
    import: "default",
    eager: true
});



export const loadAsset = createAsyncThunk<void, { file: Blob | File, reference: string }>(
    'assets/loadAsset',
    async ({ file, reference }, thunkAPI) => {
        const fileType = file.type;
        const fileName = (file as File).name || "";

        switch (fileType) {
            case "image/svg+xml":
            case "text/xml":
            case "application/xml":
            case "": // If the file was created without type
            default:
                if (fileName.endsWith(".svg") || fileType === "image/svg+xml" || fileType === "") {
                    await ENGINE.assetStore.addSVGData(file, reference);
                } else {
                    console.warn(`Unsupported file type: ${fileType} for asset ${reference}`);
                    return;
                }
                break;
        }

        const dataString = await file.text();
        const id = sha256(dataString);
        thunkAPI.dispatch(addAsset({
            id: id,
            asset: {
                reference: reference,
                author: "test", // placeholder
                dateCreated: "",
                id: id,
                size: file.size,
                dependencies: [],
                status: "loaded"
            }
        }));
    }
);

export const deloadAsset = createAsyncThunk<void, { reference: string, id: string }>(
    'assets/deloadAsset',
    async ({ reference, id }, thunkAPI) => {
        await ENGINE.assetStore.removeSVGData(reference);
        thunkAPI.dispatch(deleteAsset(id));
    }
);



export const initializeAssets = createAsyncThunk<void, void>(
    'assets/initializeAssets',
    async (_, thunkAPI) => {

        try {
            let assetData: Record<string, Blob> = {};
            try {
                assetData = Object.fromEntries(
                    Object.entries(CLIENT_SVGS).map(([path, content]) => {
                        const name = (path.split("/").pop() ?? "").replace(".svg", "");
                        const blob = new Blob([content as string], { type: "image/svg+xml" });
                        return [name, blob];
                    })
                )
            } catch (e) {
                console.warn("Failed to load asset svg data");
            }

            let localStoreAssetData: Record<string, Blob | File> = {};
            try {
                const keys = await localforage.keys();
                for (const key of keys) {
                    const blob = await localforage.getItem<Blob | File>(key);
                    if (blob) {
                        localStoreAssetData[key] = blob;
                    }
                }
            } catch (e) {
                console.warn("Failed to load local svg data");
            }

            const allFileRefs = new Set([...Object.keys(assetData), ...Object.keys(localStoreAssetData)]);

            for (const ref of allFileRefs) {
                const fileToLoad = localStoreAssetData[ref] || assetData[ref];
                if (fileToLoad) {
                    thunkAPI.dispatch(loadAsset({
                        file: fileToLoad,
                        reference: ref
                    }));
                }
            }

        } catch (e) {
            console.warn("Failed to initialize assets", e);
        }

    }
);
