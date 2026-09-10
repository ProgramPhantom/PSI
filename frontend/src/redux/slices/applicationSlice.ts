import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AllComponentTypes } from '../../logic/point';

export type CanvasToolType = 'select' | 'text' | 'latex' | 'box' | 'arrow';

export interface CanvasTool {
    type: CanvasToolType;
    config?: any;
}

export const DefaultDebugSelection: Record<AllComponentTypes, boolean> = {
    // Types
    svg: false,
    text: false,
    latex: false,
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
    "simple-label-group": false,
    "sequence-aligner": false,
    grid: false,
    subgrid: false
};

export interface CanvasMousePosition {
    x: number;
    y: number;
}

export interface ApplicationState {
    selectedElementIds: string[];
    debugSelectionTypes: Record<AllComponentTypes, boolean>;
    debugSelectedElement: boolean;
    selectedTool: CanvasTool;
    toolConfigs: Record<CanvasToolType, any>;
    isMouseOverCanvas: boolean;
    canvasMousePosition: CanvasMousePosition | undefined;
    isResizing: boolean;
    columnMode: boolean;
}

const initialState: ApplicationState = {
    selectedElementIds: [],
    debugSelectionTypes: DefaultDebugSelection,
    debugSelectedElement: false,
    isResizing: false,
    columnMode: false,
    selectedTool: {
        type: 'select',
        config: {}
    },
    toolConfigs: {
        select: {},
        text: {
            fontFamily: 'sans-serif',
            fontSize: 20
        },
        latex: {
            fontSize: 35
        },
        box: {
            style: {
                fill: "#137cbd",
                stroke: "#137cbd",
                strokeWidth: 2,
                dashing: [0, 0]
            }
        },
        arrow: {
            thickness: 2,
            lineStyle: {
                stroke: "#000000",
                dashing: [0, 0],
                headStyle: ["none", "default"]
            }
        }
    },
    isMouseOverCanvas: false,
    canvasMousePosition: undefined
};

export const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        setSelectedElementId: (state, action: PayloadAction<string | undefined>) => {
            state.selectedElementIds = action.payload ? [action.payload] : [];
        },
        setSelectedElementIds: (state, action: PayloadAction<string[]>) => {
            const next = action.payload;
            const current = state.selectedElementIds;
            if (current.length === next.length && current.every((id, i) => id === next[i])) {
                return;
            }
            state.selectedElementIds = next;
        },
        toggleElementSelection: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (state.selectedElementIds.includes(id)) {
                state.selectedElementIds = state.selectedElementIds.filter(item => item !== id);
            } else {
                state.selectedElementIds.push(id);
            }
        },
        addElementToSelection: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (!state.selectedElementIds.includes(id)) {
                state.selectedElementIds.push(id);
            }
        },
        clearSelection: (state) => {
            if (state.selectedElementIds.length === 0) {
                return;
            }
            state.selectedElementIds = [];
        },
        toggleDebugSelectionType: (state, action: PayloadAction<AllComponentTypes>) => {
            state.debugSelectionTypes[action.payload] = !state.debugSelectionTypes[action.payload];
        },
        toggleDebugSelectedElement: (state) => {
            state.debugSelectedElement = !state.debugSelectedElement;
        },
        setDebugSelectedElement: (state, action: PayloadAction<boolean>) => {
            state.debugSelectedElement = action.payload;
        },
        setSelectedTool: (
            state,
            action: PayloadAction<{ type: CanvasToolType; config?: any } | CanvasTool>
        ) => {
            const { type, config } = action.payload;
            if (config && Object.keys(config).length > 0) {
                state.toolConfigs[type] = {
                    ...(state.toolConfigs[type] ?? {}),
                    ...config
                };
            }
            state.selectedTool = {
                type,
                config: {
                    ...(state.toolConfigs[type] ?? {}),
                    ...(config ?? {})
                }
            };
        },
        setCanvasMousePosition: (
            state,
            action: PayloadAction<{ isMouseOverCanvas: boolean; position?: CanvasMousePosition }>
        ) => {
            state.isMouseOverCanvas = action.payload.isMouseOverCanvas;
            state.canvasMousePosition = action.payload.position;
        },
        setIsResizing: (state, action: PayloadAction<boolean>) => {
            state.isResizing = action.payload;
        },
        setColumnMode: (state, action: PayloadAction<boolean>) => {
            state.columnMode = action.payload;
        },
        toggleColumnMode: (state) => {
            state.columnMode = !state.columnMode;
        }
    },
});

export const {
    setSelectedElementId,
    setSelectedElementIds,
    toggleElementSelection,
    addElementToSelection,
    clearSelection,
    toggleDebugSelectionType,
    toggleDebugSelectedElement,
    setDebugSelectedElement,
    setSelectedTool,
    setCanvasMousePosition,
    setIsResizing,
    setColumnMode,
    toggleColumnMode
} = applicationSlice.actions;

export const selectSelectedElementId = (state: { application: ApplicationState }): string | undefined => {
    return state.application.selectedElementIds.length === 1 ? state.application.selectedElementIds[0] : undefined;
};

export default applicationSlice.reducer;


