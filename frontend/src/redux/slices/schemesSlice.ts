import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_SCHEME_SET } from '../../logic/default/schemeSet';
import { ID } from '../../logic/point';
import { IVisual } from '../../logic/visual';
import { IScheme, SchemeDict, SchemeMetadata, SchemeSource } from '../../types/schemes';


export const InternalSchemeId = "internal";

export interface SchemesState {
    schemes: SchemeDict;
}

const initialState: SchemesState = {
    schemes: { ...DEFAULT_SCHEME_SET },
};

const schemesSlice = createSlice({
    name: 'schemes',
    initialState,
    reducers: {
        setSchemes(state, action: PayloadAction<SchemeDict>) {
            state.schemes = action.payload;
        },
        addScheme(state, action: PayloadAction<{ scheme: IScheme; location?: SchemeSource }>) {
            const { scheme, location = "local" } = action.payload;
            const uuid = scheme.metadata.id;
            state.schemes[uuid] = { scheme, location };
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
        selectSchemes: createSelector(
            (state: SchemesState) => state.schemes,
            (schemes) => Object.fromEntries(
                Object.entries(schemes).map(([id, val]) => [id, val.scheme])
            )
        ),
        selectSchemeLocations: createSelector(
            (state: SchemesState) => state.schemes,
            (schemes) => Object.fromEntries(
                Object.entries(schemes).map(([id, val]) => [id, val.location])
            )
        ),
        selectAllSchemeIDs: createSelector(
            (state: SchemesState) => state.schemes,
            (schemes) => Object.keys(schemes)
        ),
        selectSchemeById: (state: SchemesState, schemeId: ID) => state.schemes[schemeId]?.scheme,
        selectSchemeLocationById: (state: SchemesState, schemeId: ID) => state.schemes[schemeId]?.location,
        selectComponentsBySchemeId: createSelector(
            [(state: SchemesState) => state.schemes, (state: SchemesState, schemeId: ID) => schemeId],
            (schemes, schemeId) => schemes[schemeId] ? Object.values(schemes[schemeId].scheme.components) : []
        ),
        selectAllComponents: createSelector(
            (state: SchemesState) => state.schemes,
            (schemes) => Object.values(schemes).flatMap((val) => Object.values(val.scheme.components))
        ),
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
    setSchemeLocation,
    removeAllServerSchemes,
} = schemesSlice.actions;

export const {
    selectSchemes,
    selectSchemeLocations,
    selectAllSchemeIDs,
    selectSchemeById,
    selectSchemeLocationById,
    selectComponentsBySchemeId,
    selectAllComponents,
} = schemesSlice.selectors;

export default schemesSlice.reducer;
