import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ID } from '../logic/point';
import { IVisual } from '../logic/visual';


export type SchemeMetadata = {
    name: string,
}
export type IScheme = {
    metadata: SchemeMetadata,
    components: IVisual[]
};
export type SchemeDict = Record<ID, IScheme>;


interface SchemesState {
    schemes: SchemeDict;
}

const initialState: SchemesState = {
    schemes: {},
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
                state.schemes[schemeId].components.push(component);
            }
        },
        deleteComponent(state, action: PayloadAction<{ schemeId: ID; componentId: ID }>) {
            const { schemeId, componentId } = action.payload;
            if (state.schemes[schemeId]) {
                state.schemes[schemeId].components = state.schemes[schemeId].components.filter(
                    (c) => c.id !== componentId
                );
            }
        },
        updateComponent(state, action: PayloadAction<{ schemeId: ID; component: IVisual }>) {
            const { schemeId, component } = action.payload;
            if (state.schemes[schemeId]) {
                const index = state.schemes[schemeId].components.findIndex((c) => c.id === component.id);
                if (index !== -1) {
                    state.schemes[schemeId].components[index] = component;
                }
            }
        },
    },
    selectors: {
        selectSchemes: (state) => state.schemes,
        selectAllSchemeIDs: (state) => Object.keys(state.schemes),
        selectSchemeById: (state, schemeId: ID) => state.schemes[schemeId],
        selectComponentsBySchemeId: (state, schemeId: ID) => state.schemes[schemeId]?.components ?? [],
        selectAllComponents: (state) => Object.values(state.schemes).flatMap((scheme) => scheme.components),
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
