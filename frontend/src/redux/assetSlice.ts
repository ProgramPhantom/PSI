import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ID } from '../logic/point';

export interface IAsset {
    reference: string;
    author: string;
    dataCreated: string; // Using user-requested name "dataCreated"
    dependencies: ID[];
    size: number;
    status: "loaded" | "missing"
    id: string,
}

export type AssetDict = Record<ID, IAsset>;

interface AssetState {
    assets: AssetDict;
}

const initialState: AssetState = {
    assets: {},
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
