import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { api } from './api/api';
import ENGINE from '../logic/engine';
import { ID } from '../logic/point';
import { IVisual } from '../logic/visual';
import { DEFAULT_SCHEME_SET } from '../logic/default/schemeSet';
import { UUID } from 'crypto';


export type SchemeSource = "builtin" | "local" | "server"


export type SchemeMetadata = {
    name: string,
    id: string,
    format: string
}
export type IScheme = {
    metadata: SchemeMetadata,
    components: Record<ID, IVisual>
};
export type SchemeDict = Record<ID, { scheme: IScheme, location: SchemeSource }>;

export const InternalSchemeId = "internal";
export const SCHEMES_STORAGE_KEY = "psi-schemes-data";

const loadSchemesFromStorage = (): SchemeDict | undefined => {
    try {
        const stored = localStorage.getItem(SCHEMES_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as SchemeDict;
        }
    } catch (e) {
        console.warn("Failed to load schemes from storage", e);
    }
    return undefined;
};

interface SchemesState {
    schemes: SchemeDict;
}

const localLoadedSchemes: SchemeDict = loadSchemesFromStorage() ?? {}
const initialState: SchemesState = {
    schemes: { ...localLoadedSchemes, ...DEFAULT_SCHEME_SET },
};

const schemesSlice = createSlice({
    name: 'schemes',
    initialState,
    reducers: {
        setSchemes(state, action: PayloadAction<SchemeDict>) {
            state.schemes = action.payload;
        },
        addLocalScheme(state, action: PayloadAction<{ scheme: IScheme; location?: SchemeSource }>) {
            const { scheme, location = "local" } = action.payload;
            const uuid = scheme.metadata.id;
            state.schemes[uuid] = { scheme, location };
        },
        addServerScheme(state, action: PayloadAction<{ id: string, scheme: IScheme; }>) {
            const { id, scheme, } = action.payload;
            state.schemes[id] = { scheme, location: "server" };
        },
        deleteScheme(state, action: PayloadAction<ID>) {
            delete state.schemes[action.payload];
        },
        updateSchemeMetadata(state, action: PayloadAction<{ id: ID; metadata: SchemeMetadata }>) {
            const { id, metadata } = action.payload;
            if (state.schemes[id]) {
                state.schemes[id].scheme.metadata = metadata;
            }
        },
        addComponent(state, action: PayloadAction<{ schemeId: ID; component: IVisual }>) {
            const { schemeId, component } = action.payload;
            if (state.schemes[schemeId]) {
                const id = Math.random().toString(16).slice(2);
                state.schemes[schemeId].scheme.components[id] = component;
            }
        },
        deleteComponent(state, action: PayloadAction<{ schemeId: ID; templateId: ID }>) {
            const { schemeId, templateId } = action.payload;
            if (state.schemes[schemeId]) {
                delete state.schemes[schemeId].scheme.components[templateId];
            }
        },
        updateComponent(state, action: PayloadAction<{ schemeId: ID; componentId: ID, component: IVisual }>) {
            const { schemeId, componentId, component } = action.payload;
            if (state.schemes[schemeId]) {
                state.schemes[schemeId].scheme.components[componentId] = component;
            }
        },
        setSchemeLocation(state, action: PayloadAction<{ id: ID; location: SchemeSource }>) {
            const { id, location } = action.payload;
            if (state.schemes[id]) {
                state.schemes[id].location = location;
            }
        },
        removeAllServerSchemes(state) {
            for (const id in state.schemes) {
                if (state.schemes[id].location === "server") {
                    delete state.schemes[id]
                }
            }
        }
    },
    selectors: {
        selectSchemes: (state) => Object.fromEntries(
            Object.entries(state.schemes).map(([id, val]) => [id, val.scheme])
        ),
        selectAllSchemeIDs: (state) => Object.keys(state.schemes),
        selectSchemeById: (state, schemeId: ID) => state.schemes[schemeId]?.scheme,
        selectSchemeLocationById: (state, schemeId: ID) => state.schemes[schemeId]?.location,
        selectComponentsBySchemeId: (state, schemeId: ID) =>
            state.schemes[schemeId] ? Object.values(state.schemes[schemeId].scheme.components) : [],
        selectAllComponents: (state) =>
            Object.values(state.schemes).flatMap((val) => Object.values(val.scheme.components)),
    }
});

export const uploadScheme = createAsyncThunk<void, ID>(
    'schemes/uploadScheme',
    async (id, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            thunkAPI.dispatch(setSchemeLocation({ id, location: "local" }));
            return;
        }

        const entry = state.schemes.schemes[id];
        if (!entry) {
            return;
        }

        const name = entry.scheme.metadata.name ?? "unnamed scheme";
        thunkAPI.dispatch(setSchemeLocation({ id, location: "server" }));

        try {
            const zip = await ENGINE.createSchemeFile(id);
            const blob = await zip.generateAsync({ type: "blob" });
            const file = new File([blob], `${id}.nmrs`, { type: "application/zip" });
            const formData = new FormData();
            formData.append("file", file);
            await thunkAPI.dispatch(
                createScheme({ schemeId: id, formData, schemeName: name })
            ).unwrap();
        } catch (error) {
            console.error("Failed to upload scheme to server", error);
            thunkAPI.dispatch(setSchemeLocation({ id, location: "local" }));
        }
    }
);

export const getScheme = createAsyncThunk<File, string>(
    'schemes/getScheme',
    async (schemeId) => {
        const response = await fetch(`/api/schemes/${schemeId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch scheme');
        return response.blob() as unknown as File;
    }
);

export const createScheme = createAsyncThunk<void, { schemeId: string, schemeName: string, formData: FormData }>(
    'schemes/createScheme',
    async ({ schemeId, schemeName, formData }) => {
        if (!formData.has('name')) {
            formData.append('name', schemeName);
        }
        const response = await fetch(`/api/schemes/${schemeId}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to create scheme');
    }
);

export const saveScheme = createAsyncThunk<void, { schemeId: string, formData: FormData }>(
    'schemes/saveScheme',
    async ({ schemeId, formData }) => {
        const response = await fetch(`/api/schemes/${schemeId}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to save scheme');
    }
);

export const deleteSchemeServer = createAsyncThunk<void, string>(
    'schemes/deleteSchemeServer',
    async (schemeId) => {
        const response = await fetch(`/api/schemes/${schemeId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete scheme');
    }
);

export const {
    setSchemes,
    addLocalScheme,
    addServerScheme,
    deleteScheme,
    updateSchemeMetadata,
    addComponent,
    deleteComponent,
    updateComponent,
    setSchemeLocation,
    removeAllServerSchemes,
} = schemesSlice.actions;

export const {
    selectSchemes,
    selectAllSchemeIDs,
    selectSchemeById,
    selectSchemeLocationById,
    selectComponentsBySchemeId,
    selectAllComponents,
} = schemesSlice.selectors;

export default schemesSlice.reducer;
