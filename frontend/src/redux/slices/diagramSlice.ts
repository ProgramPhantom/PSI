import { createSlice, PayloadAction, createEntityAdapter, EntityState, createSelector } from '@reduxjs/toolkit';
import { DiagramSource } from '../../types/diagram';

export interface RecentDiagram {
    title: string;
    fileName?: string;
    diagramUUID: string;
    opened: string;
    diagramSource: DiagramSource;
    author?: string;
    institution?: string;
}

export type LoadStatus = "unloaded" | "fetchServer" | "opening" | "open";

export const recentDiagramsAdapter = createEntityAdapter<RecentDiagram, string>({
    selectId: (diagram) => diagram.diagramUUID,
    sortComparer: (a, b) => new Date(b.opened).getTime() - new Date(a.opened).getTime()
});

export interface DiagramInfoState extends EntityState<RecentDiagram, string> {
    diagramUUID: string | undefined;
    saveState: 'saved' | 'unsaved' | 'saving';
    loadStatus: LoadStatus;
}

const initialState: DiagramInfoState = recentDiagramsAdapter.getInitialState({
    diagramUUID: undefined,
    saveState: 'saved' as const,
    loadStatus: "unloaded" as LoadStatus
});

export const diagramSlice = createSlice({
    name: 'diagram',
    initialState,
    reducers: {
        setTitle: (state, action: PayloadAction<string>) => {
            if (state.diagramUUID) {
                const existing = state.entities[state.diagramUUID];
                if (existing) {
                    recentDiagramsAdapter.updateOne(state, {
                        id: state.diagramUUID,
                        changes: { title: action.payload }
                    });
                } else {
                    recentDiagramsAdapter.addOne(state, {
                        diagramUUID: state.diagramUUID,
                        title: action.payload,
                        diagramSource: "local",
                        opened: new Date().toISOString()
                    });
                }
            }
        },
        setFileName: (state, action: PayloadAction<string>) => {
            if (state.diagramUUID) {
                const existing = state.entities[state.diagramUUID];
                if (existing) {
                    recentDiagramsAdapter.updateOne(state, {
                        id: state.diagramUUID,
                        changes: { fileName: action.payload }
                    });
                }
            }
        },
        setAuthor: (state, action: PayloadAction<string>) => {
            if (state.diagramUUID) {
                const existing = state.entities[state.diagramUUID];
                if (existing) {
                    recentDiagramsAdapter.updateOne(state, {
                        id: state.diagramUUID,
                        changes: { author: action.payload }
                    });
                } else {
                    recentDiagramsAdapter.addOne(state, {
                        diagramUUID: state.diagramUUID,
                        title: "Untitled",
                        author: action.payload,
                        diagramSource: "local",
                        opened: new Date().toISOString()
                    });
                }
            }
        },
        setInstitution: (state, action: PayloadAction<string>) => {
            if (state.diagramUUID) {
                const existing = state.entities[state.diagramUUID];
                if (existing) {
                    recentDiagramsAdapter.updateOne(state, {
                        id: state.diagramUUID,
                        changes: { institution: action.payload }
                    });
                } else {
                    recentDiagramsAdapter.addOne(state, {
                        diagramUUID: state.diagramUUID,
                        title: "Untitled",
                        institution: action.payload,
                        diagramSource: "local",
                        opened: new Date().toISOString()
                    });
                }
            }
        },
        setDiagramSource: (state, action: PayloadAction<DiagramSource>) => {
            if (state.diagramUUID) {
                const existing = state.entities[state.diagramUUID];
                if (existing) {
                    recentDiagramsAdapter.updateOne(state, {
                        id: state.diagramUUID,
                        changes: { diagramSource: action.payload }
                    });
                } else {
                    recentDiagramsAdapter.addOne(state, {
                        diagramUUID: state.diagramUUID,
                        title: "Untitled",
                        diagramSource: action.payload,
                        opened: new Date().toISOString()
                    });
                }
            }
        },
        setDiagramUUID: (state, action: PayloadAction<string | undefined>) => {
            state.diagramUUID = action.payload;
        },
        setSaveState: (state, action: PayloadAction<'saved' | 'unsaved' | 'saving'>) => {
            state.saveState = action.payload;
        },
        addRecentDiagram: recentDiagramsAdapter.upsertOne,
        removeRecentDiagram: recentDiagramsAdapter.removeOne,
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
    setTitle,
    setFileName,
    setAuthor,
    setInstitution,
    setDiagramUUID, 
    setSaveState, 
    addRecentDiagram, 
    removeRecentDiagram, 
    setDiagramSource,
    setDiagramLoadStatus 
} = diagramSlice.actions;


export default diagramSlice.reducer;

