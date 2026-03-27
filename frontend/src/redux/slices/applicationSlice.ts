import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AllComponentTypes } from '../../logic/point';

export const DefaultDebugSelection: Record<AllComponentTypes, boolean> = {
    // Types
    svg: false,
    text: false,
    rect: false,
    space: false,
    line: false,
    aligner: false,
    collection: false,
    channel: false,
    "lower-abstract": false,
    visual: false,
    sequence: false,
    label: false,
    diagram: false,
    "label-group": false,
    "sequence-aligner": false,
    grid: false,
    subgrid: false
};

export interface ApplicationState {
    selectedElementId: string | undefined;
    debugSelectionTypes: Record<AllComponentTypes, boolean>;
}

const initialState: ApplicationState = {
    selectedElementId: undefined,
    debugSelectionTypes: DefaultDebugSelection
};

export const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        setSelectedElementId: (state, action: PayloadAction<string | undefined>) => {
            state.selectedElementId = action.payload;
        },
        toggleDebugSelectionType: (state, action: PayloadAction<AllComponentTypes>) => {
            state.debugSelectionTypes[action.payload] = !state.debugSelectionTypes[action.payload];
        }
    },
});

export const { setSelectedElementId, toggleDebugSelectionType } = applicationSlice.actions;

export default applicationSlice.reducer;
