import { createAsyncThunk } from "@reduxjs/toolkit";
import { sha256 } from "js-sha256";
import localforage from "localforage";
import ENGINE from "../../logic/engine";
import { RootState } from "../rootReducer";
import { addAsset, deleteAsset, removeDependency, SVGDict } from "../slices/assetSlice";
import { SVGDBEntry } from "../../logic/assetStore";
import { AssetSource } from "../../types/assets";

// Load client SVGs
const CLIENT_SVGS: SVGDict = import.meta.glob("../../assets/svg/*.svg", {
    query: "?raw",
    import: "default",
    eager: true
});



export const loadAsset = createAsyncThunk<void, { file: Blob | File, reference: string, source: AssetSource, dependants?: string[], }>(
    'assets/loadAsset',
    async ({ file, reference, source, dependants: dependencies }, thunkAPI) => {
        const dataString = await file.text();
        const id = sha256(dataString);

        const state = thunkAPI.getState() as RootState;
        if (state.assets.assets[id]) {
            return;
        }

        const fileType = file.type;
        const fileName = (file as File).name || "";

        switch (fileType) {
            case "image/svg+xml":
            case "text/xml":
            case "application/xml":
            case "": // If the file was created without type
            default:
                if (fileName.endsWith(".svg") || fileType === "image/svg+xml" || fileType === "") {
                    await ENGINE.assetStore.addSVGData(file, reference, source);
                } else {
                    console.warn(`Unsupported file type: ${fileType} for asset ${reference}`);
                    return;
                }
                break;
        }
        thunkAPI.dispatch(addAsset({
            id: id,
            asset: {
                reference: reference,
                id: id,
                size: file.size,
                dependents: dependencies ?? [],
                status: "loaded",
                source: source ?? "local"
            }
        }));
    }
);

export const deloadAsset = createAsyncThunk<void, { reference: string, id: string }>(
    'assets/deloadAsset',
    async ({ reference, id }, thunkAPI) => {
        await ENGINE.assetStore.removeSVGData(id);
        thunkAPI.dispatch(deleteAsset(id));
    }
);

export const removeDependencyAndCheckDeload = createAsyncThunk<void, { assetId: string, dependencyId: string }>(
    'assets/removeDependencyAndCheckDeload',
    async ({ assetId, dependencyId }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const asset = state.assets.assets[assetId];

        if (!asset) return;

        thunkAPI.dispatch(removeDependency({ assetId, dependencyId }));

        // After removing, check if dependencies are empty
        const updatedAsset = (thunkAPI.getState() as RootState).assets.assets[assetId];
        if (updatedAsset && updatedAsset.dependents.length === 0 && updatedAsset.source !== "builtin") {
            console.log(`Deloading asset '${updatedAsset.reference}'`)
            thunkAPI.dispatch(deloadAsset({ reference: updatedAsset.reference, id: assetId }));
        }
    }
);



export const initialiseAssets = createAsyncThunk<void, void>(
    'assets/initializeAssets',
    async (_, thunkAPI) => {

        try {
            let builtInAssets: Set<SVGDBEntry> = new Set<SVGDBEntry>;
            try {
                for (const [path, svgString] of Object.entries(CLIENT_SVGS)) {

                    const ref = (path.split("/").pop() ?? "").replace(".svg", "");
                    const blob = new Blob([svgString as string], { type: "image/svg+xml" });

                    builtInAssets.add({ ref: ref, file: blob });
                }
            } catch (e) {
                console.warn("Failed to load asset svg data");
            }

            let localStoreAssetData: Set<SVGDBEntry> = new Set<SVGDBEntry>;
            try {
                const keys = await localforage.keys();
                for (const key of keys) {
                    const svgStore: SVGDBEntry | null = await localforage.getItem<SVGDBEntry>(key);
                    if (svgStore) {
                        localStoreAssetData.add(svgStore)
                    }
                }
            } catch (e) {
                console.warn("Failed to load local svg data");
            }


            for (const entry of builtInAssets) {
                thunkAPI.dispatch(loadAsset({
                    file: entry.file,
                    reference: entry.ref,
                    source: "builtin"
                }));
            }

            for (const entry of localStoreAssetData) {
                thunkAPI.dispatch(loadAsset({
                    file: entry.file,
                    reference: entry.ref,
                    source: "local"
                }));
            }

        } catch (e) {
            console.warn("Failed to initialize assets", e);
        }

    }
);
