import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/api';
import ENGINE from '../../logic/engine';
import { appToaster } from '../../app/Toaster';
import { IDiagram } from '../../logic/hasComponents/diagram';

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

export const saveDiagramAs = createAsyncThunk<void, void>(
    'application/saveDiagramAs',
    async (_, thunkAPI) => {
        const stateObject: IDiagram = ENGINE.handler.diagram.state;
        const stateString = JSON.stringify(stateObject, undefined, 4);
        localStorage.setItem(ENGINE.StateName, stateString);

        try {
            const createResponse = await thunkAPI.dispatch(api.endpoints.createDiagram.initiate(stateObject.ref)).unwrap();
            if (createResponse.id !== undefined) {
                await thunkAPI.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: createResponse.id, diagram: stateObject }));
                localStorage.setItem("diagramUUID", createResponse.id);
                appToaster.show({ message: "Diagram saved successfully", intent: "success" });
            }
        } catch (error) {
            console.error("Failed to save diagram as:", error);
            appToaster.show({ message: "Failed to save diagram", intent: "danger" });
        }
    }
);

export const saveDiagram = createAsyncThunk<void, void>(
    'application/saveDiagram',
    async (_, thunkAPI) => {
        const stateObject: IDiagram = ENGINE.handler.diagram.state;
        const stateString = JSON.stringify(stateObject, undefined, 4);
        localStorage.setItem(ENGINE.StateName, stateString);

        const currentUUID = localStorage.getItem("diagramUUID") ?? "";

        try {
            await thunkAPI.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: currentUUID, diagram: stateObject })).unwrap();
            appToaster.show({ message: "Diagram saved", intent: "success" });
        } catch (error) {
            try {
                const createResponse = await thunkAPI.dispatch(api.endpoints.createDiagram.initiate(stateObject.ref)).unwrap();
                if (createResponse.id !== undefined) {
                    await thunkAPI.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: createResponse.id, diagram: stateObject }));
                    localStorage.setItem("diagramUUID", createResponse.id);
                    appToaster.show({ message: "Diagram saved", intent: "success" });
                }
            } catch (createError) {
                console.error("Failed to save and create diagram:", createError);
                appToaster.show({ message: "Failed to save diagram", intent: "danger" });
            }
        }
    }
);

export const { setSelectedElementId } = applicationSlice.actions;

export default applicationSlice.reducer;
