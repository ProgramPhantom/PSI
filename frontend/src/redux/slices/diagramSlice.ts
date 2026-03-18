import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RecentDiagram {
    name: string;
    diagramUUID: string;
    opened: string;
}

export interface DiagramInfoState {
    fileName: string;
    diagramUUID: string | undefined;
    saveState: 'saved' | 'unsaved' | 'saving';
    recentDiagrams: RecentDiagram[];
}

const initialState: DiagramInfoState = {
    fileName: "unnamed",
    diagramUUID: undefined,
    saveState: 'saved',
    recentDiagrams: [],
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
        addRecentDiagram: (state, action: PayloadAction<RecentDiagram>) => {
            // Remove diagram entry if it already exists to avoid duplicates
            state.recentDiagrams = state.recentDiagrams.filter(d => d.diagramUUID !== action.payload.diagramUUID);
            // Push to the beginning of the array so it's most recent
            state.recentDiagrams.unshift(action.payload);
        },
        removeRecentDiagram: (state, action: PayloadAction<string>) => {
            state.recentDiagrams = state.recentDiagrams.filter(d => d.diagramUUID !== action.payload);
        },
    },
});

export const { setFileName, setDiagramUUID, setSaveState, addRecentDiagram, removeRecentDiagram } = diagramSlice.actions;

export default diagramSlice.reducer;
