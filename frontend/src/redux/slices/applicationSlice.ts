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
    selectedElementId: string | undefined;
    debugSelectionTypes: Record<AllComponentTypes, boolean>;
    debugSelectedElement: boolean;
    selectedTool: CanvasTool;
    toolConfigs: Record<CanvasToolType, any>;
    isMouseOverCanvas: boolean;
    canvasMousePosition: CanvasMousePosition | undefined;
}

const initialState: ApplicationState = {
    selectedElementId: undefined,
    debugSelectionTypes: DefaultDebugSelection,
    debugSelectedElement: false,
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
        box: {},
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
            state.selectedElementId = action.payload;
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
        }
    },
});

export const {
    setSelectedElementId,
    toggleDebugSelectionType,
    toggleDebugSelectedElement,
    setDebugSelectedElement,
    setSelectedTool,
    setCanvasMousePosition
} = applicationSlice.actions;

export default applicationSlice.reducer;


