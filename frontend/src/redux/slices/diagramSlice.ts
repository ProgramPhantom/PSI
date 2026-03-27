import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from "uuid";
import { DiagramSource } from '../../types/diagram';


export interface RecentDiagram {
    name: string;
    diagramUUID: string;
    opened: string;
}

export type LoadStatus = "unloaded" | "fetchServer" | "opening" | "open";

export interface DiagramInfoState {
    fileName: string;
    diagramUUID: string | undefined;
    saveState: 'saved' | 'unsaved' | 'saving';
    recentDiagrams: RecentDiagram[];
    diagramSource: DiagramSource;
    loadStatus: LoadStatus;
}

const initialState: DiagramInfoState = {
    fileName: "unnamed",
    diagramUUID: undefined,
    saveState: 'saved',
    recentDiagrams: [],
    diagramSource: "local",
    loadStatus: "unloaded"
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
        setDiagramSource: (state, action: PayloadAction<DiagramSource>) => {
            state.diagramSource = action.payload
        },
        setDiagramLoadStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.loadStatus = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase('application/loadDiagram/pending', (state) => {
                state.loadStatus = "fetchServer";
            })
            .addCase('application/loadDiagram/rejected', (state) => {
                state.loadStatus = "unloaded";
            })
            .addCase('application/openDiagram/pending', (state) => {
                state.loadStatus = "opening";
            })
            .addCase('application/openDiagram/fulfilled', (state) => {
                state.loadStatus = "open";
            })
            .addCase('application/openDiagram/rejected', (state) => {
                state.loadStatus = "unloaded";
            });
    }
});

export const { 
    setFileName, 
    setDiagramUUID, 
    setSaveState, 
    addRecentDiagram, 
    removeRecentDiagram, 
    setDiagramSource,
    setDiagramLoadStatus } = diagramSlice.actions;

export default diagramSlice.reducer;
