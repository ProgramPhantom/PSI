import { createAsyncThunk } from "@reduxjs/toolkit";
import ENGINE from "../../logic/engine";
import { sha256 } from "js-sha256";
import { addAsset, deleteAsset, SVGDict } from "../slices/assetSlice";
import { mergeObjectsPreferNonEmpty } from "../../logic/util2";


// Load client SVGs
const CLIENT_SVGS: SVGDict = import.meta.glob("../../assets/svg/*.svg", {
    query: "?raw",
    import: "default",
    eager: true
});



export const loadAsset = createAsyncThunk<void, { dataString: string, reference: string }>(
    'assets/loadAsset',
    async ({ dataString, reference }, thunkAPI) => {
        ENGINE.assetStore.addSVGData(dataString, reference);

        const id = sha256(dataString);
        thunkAPI.dispatch(addAsset({
            id: id,
            asset: {
                reference: reference,
                author: "test", // placeholder
                dateCreated: "",
                id: id,
                size: dataString.length,
                dependencies: [],
                status: "loaded"
            }
        }));
    }
);

export const deloadAsset = createAsyncThunk<void, { reference: string, id: string }>(
    'assets/deloadAsset',
    async ({ reference, id }, thunkAPI) => {
        ENGINE.assetStore.removeSVGData(reference);
        thunkAPI.dispatch(deleteAsset(id));
    }
);



export const initializeAssets = createAsyncThunk<void, void>(
    'assets/initializeAssets',
    async (_, thunkAPI) => {

        try {
            let assetData = {};
            try {
                assetData = Object.fromEntries(
                    Object.entries(CLIENT_SVGS).map(([path, content]) => {
                        const name = (path.split("/").pop() ?? "").replace(".svg", "");
                        return [name, content as string];
                    })
                )
            } catch (e) {
                console.warn("Failed to load asset svg data");
            }

            let localStoreAssetData = {};
            try {
                const storedDataStr = localStorage.getItem("svgs"); // AssetStore.SVGStringsStorageName
                if (storedDataStr) {
                    localStoreAssetData = JSON.parse(storedDataStr);
                }
            } catch (e) {
                console.warn("Failed to load local svg data");
            }

            const allSvgData = mergeObjectsPreferNonEmpty(assetData, localStoreAssetData) as Record<string, string>;

            Object.entries(allSvgData).forEach(([ref, svgString]) => {
                thunkAPI.dispatch(loadAsset({
                    dataString: svgString,
                    reference: ref
                }));
            });

        } catch (e) {
            console.warn("Failed to initialize assets", e);
        }

    }
);
