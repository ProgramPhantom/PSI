import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DiagramInfoState {
    fileName: string;
    diagramUUID: string | undefined;
    saveState: 'saved' | 'unsaved' | 'saving';
}

const initialState: DiagramInfoState = {
    fileName: "unnamed",
    diagramUUID: undefined,
    saveState: 'saved',
};

export const diagramSlice = createSlice({
    name: 'diagram',
    initialState,
    reducers: {
        setFileName: (state, action: PayloadAction<string>) => {
            state.fileName = action.payload;
        },
        setDiagramUUID: (state, action: PayloadAction<string | undefined>) => {
            state.diagramUUID = action.payload;
        },
        setSaveState: (state, action: PayloadAction<'saved' | 'unsaved' | 'saving'>) => {
            state.saveState = action.payload;
        },
    },
});

export const { setFileName, setDiagramUUID, setSaveState } = diagramSlice.actions;

export default diagramSlice.reducer;
