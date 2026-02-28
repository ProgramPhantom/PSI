import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ID } from '../logic/point';
import { IVisual } from '../logic/visual';
import { DEFAULT_SCHEME_SET } from '../logic/default/schemeSet';
import { UUID } from 'crypto';


export type SchemeSource = "builtin" | "local" | "server"


export type SchemeMetadata = {
    name: string,
    id: string
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
