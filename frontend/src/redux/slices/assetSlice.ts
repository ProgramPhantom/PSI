import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { sha256 } from 'js-sha256';
import { ID } from '../../logic/point';
import ENGINE from '../../logic/engine';
import { AssetDict, IAsset } from '../../types/assets';
import { mergeObjectsPreferNonEmpty } from '../../logic/util2';

export type SVGDict = Record<string, string>;

// Load client SVGs
const CLIENT_SVGS: SVGDict = import.meta.glob("../assets/svg/*.svg", {
    query: "?raw",
    import: "default",
    eager: true
});

function getAssetSVGs(): SVGDict {
    return Object.fromEntries(
        Object.entries(CLIENT_SVGS).map(([path, content]) => {
            const name = (path.split("/").pop() ?? "").replace(".svg", "");
            return [name, content as string];
        })
    );
}

function getLocalStoreSVGs(): SVGDict {
    const storedDataStr = localStorage.getItem("svgs"); // AssetStore.SVGStringsStorageName
    if (!storedDataStr) return {};
    return JSON.parse(storedDataStr);
}

export const initializeAssets = createAsyncThunk<void, void>(
    'assets/initializeAssets',
    async (_, thunkAPI) => {
        try {
            let assetData = {};
            try { assetData = getAssetSVGs(); } catch (e) { console.warn("Failed to load asset svg data"); }

            let localSvgData = {};
            try { localSvgData = getLocalStoreSVGs(); } catch (e) { console.warn("Failed to load local svg data"); }

            const allSvgData = mergeObjectsPreferNonEmpty(assetData, localSvgData);

            Object.entries(allSvgData).forEach(([ref, svgString]) => {
                thunkAPI.dispatch(loadAsset({
                    dataString: svgString as string,
                    reference: ref
                }));
            });
        } catch (e) {
            console.warn("Failed to initialize assets", e);
        }
    }
);


interface AssetState {
    assets: AssetDict;
}

const initialState: AssetState = {
    assets: {}
};

const assetSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        addAsset(state, action: PayloadAction<{ id: ID; asset: IAsset }>) {
            const { id, asset } = action.payload;
            state.assets[id] = asset;
        },
        deleteAsset(state, action: PayloadAction<ID>) {
            delete state.assets[action.payload];
        },
        modifyAsset(state, action: PayloadAction<{ id: ID; asset: Partial<IAsset> }>) {
            const { id, asset } = action.payload;
            if (state.assets[id]) {
                state.assets[id] = { ...state.assets[id], ...asset };
            }
        },
        addDependency(state, action: PayloadAction<{ assetId: ID; dependencyId: ID }>) {
            const { assetId, dependencyId } = action.payload;
            const asset = state.assets[assetId];
            if (asset && !asset.dependencies.includes(dependencyId)) {
                asset.dependencies.push(dependencyId);
            }
        },
    },
    selectors: {
        selectAssets: (state) => state.assets,
        selectAssetById: (state, id: ID) => state.assets[id],
    }
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

export const deloadAsset = createAsyncThunk<void, { reference: string, id: ID }>(
    'assets/deloadAsset',
    async ({ reference, id }, thunkAPI) => {
        ENGINE.assetStore.removeSVGData(reference);
        thunkAPI.dispatch(deleteAsset(id));
    }
);

export const {
    addAsset,
    deleteAsset,
    modifyAsset,
    addDependency,
} = assetSlice.actions;

export const {
    selectAssets,
    selectAssetById,
} = assetSlice.selectors;

export default assetSlice.reducer;
