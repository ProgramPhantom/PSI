import { createAsyncThunk } from "@reduxjs/toolkit";
import DOMPurify from "dompurify";
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



export const loadAsset = createAsyncThunk<void, {
    file: Blob | File, reference: string,
    source: AssetSource,
    dependants?: string[],
}>(
    'assets/loadAsset',
    async ({ file, reference, source, dependants }, thunkAPI) => {
        let dataString = await file.text();
        const fileType = file.type;
        const fileName = (file as File).name || "";

        let processedFile = file;



        if (fileName.endsWith(".svg") || fileType === "image/svg+xml" || fileType === "") {
            const cleanSVG = DOMPurify.sanitize(dataString, { USE_PROFILES: { svg: true } });

            // Repackage cleaned svg
            if (cleanSVG !== dataString) {
                console.log(reference)
                dataString = cleanSVG;
                processedFile = new Blob([cleanSVG], { type: "image/svg+xml" });
            }

            const id = sha256(dataString);

            const state = thunkAPI.getState() as RootState;
            if (state.assets.assets[id]) {
                console.log(`Skipping ${reference}`)
                return;
            }

            await ENGINE.assetStore.addSVGData(processedFile, reference, source);

            thunkAPI.dispatch(addAsset({
                id: id,
                asset: {
                    reference: reference,
                    id: id,
                    size: processedFile.size,
                    dependents: dependants ?? [],
                    status: "loaded",
                    source: source ?? "local"
                }
            }));
        } else {
            console.warn(`Unsupported file type: ${fileType} for asset ${reference}`);
            return;
        }


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
                    // Important so /n does not cause id problems when hashing
                    const cleanString: string = svgString.trim()

                    const ref = (path.split("/").pop() ?? "").replace(".svg", "");
                    const blob = new Blob([cleanString], { type: "image/svg+xml" });

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
