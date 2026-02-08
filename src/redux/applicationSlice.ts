import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ApplicationState {
    selectedElementId: string | undefined;
}

const initialState: ApplicationState = {
    selectedElementId: undefined,
};

export const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        setSelectedElementId: (state, action: PayloadAction<string | undefined>) => {
            state.selectedElementId = action.payload;
        },
    },
});

export const { setSelectedElementId } = applicationSlice.actions;

export default applicationSlice.reducer;
