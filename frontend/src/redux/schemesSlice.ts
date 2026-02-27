import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ID } from '../logic/point';
import { IVisual } from '../logic/visual';
import { DEFAULT_SCHEME_SET } from '../logic/default/schemeSet';


export type SchemeMetadata = {
    name: string,
}
export type IScheme = {
    metadata: SchemeMetadata,
    components: Record<ID, IVisual>
};
export type SchemeDict = Record<ID, IScheme>;

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

const initialState: SchemesState = {
    schemes: loadSchemesFromStorage() ?? DEFAULT_SCHEME_SET,
};

const schemesSlice = createSlice({
    name: 'schemes',
    initialState,
    reducers: {
        setSchemes(state, action: PayloadAction<SchemeDict>) {
            state.schemes = action.payload;
        },
        addScheme(state, action: PayloadAction<{ id: ID; scheme: IScheme }>) {
            const { id, scheme } = action.payload;
            state.schemes[id] = scheme;
        },
        deleteScheme(state, action: PayloadAction<ID>) {
            delete state.schemes[action.payload];
        },
        updateSchemeMetadata(state, action: PayloadAction<{ id: ID; metadata: SchemeMetadata }>) {
            const { id, metadata } = action.payload;
            if (state.schemes[id]) {
                state.schemes[id].metadata = metadata;
            }
        },
        addComponent(state, action: PayloadAction<{ schemeId: ID; component: IVisual }>) {
            const { schemeId, component } = action.payload;
            if (state.schemes[schemeId]) {
                const id = Math.random().toString(16).slice(2);
                state.schemes[schemeId].components[id] = component;
            }
        },
        deleteComponent(state, action: PayloadAction<{ schemeId: ID; templateId: ID }>) {
            const { schemeId, templateId } = action.payload;
            if (state.schemes[schemeId]) {
                delete state.schemes[schemeId].components[templateId];
            }
        },
        updateComponent(state, action: PayloadAction<{ schemeId: ID; componentId: ID, component: IVisual }>) {
            const { schemeId, componentId, component } = action.payload;
            if (state.schemes[schemeId]) {
                state.schemes[schemeId].components[componentId] = component;
            }
        },
    },
    selectors: {
        selectSchemes: (state) => state.schemes,
        selectAllSchemeIDs: (state) => Object.keys(state.schemes),
        selectSchemeById: (state, schemeId: ID) => state.schemes[schemeId],
        selectComponentsBySchemeId: (state, schemeId: ID) =>
            state.schemes[schemeId] ? Object.values(state.schemes[schemeId].components) : [],
        selectAllComponents: (state) =>
            Object.values(state.schemes).flatMap((scheme) => Object.values(scheme.components)),
    }
});

export const {
    setSchemes,
    addScheme,
    deleteScheme,
    updateSchemeMetadata,
    addComponent,
    deleteComponent,
    updateComponent,
} = schemesSlice.actions;

export const {
    selectSchemes,
    selectAllSchemeIDs,
    selectSchemeById,
    selectComponentsBySchemeId,
    selectAllComponents,
} = schemesSlice.selectors;

export default schemesSlice.reducer;
