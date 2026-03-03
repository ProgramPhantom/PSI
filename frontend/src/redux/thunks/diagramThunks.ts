import { createAsyncThunk } from "@reduxjs/toolkit";
import { IDiagram } from "../../logic/hasComponents/diagram";
import ENGINE from "../../logic/engine";
import { api } from "../api/api";
import { appToaster } from "../../app/Toaster";
import { RootState } from "../rootReducer";


export const saveDiagramAs = createAsyncThunk<void, void>(
    'application/saveDiagramAs',
    async (_, thunkAPI) => {
        const stateObject: IDiagram = ENGINE.handler.diagram.state;
        const stateString = JSON.stringify(stateObject, undefined, 4);
        localStorage.setItem(ENGINE.StateName, stateString);

        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            appToaster.show({ message: "Diagram saved", intent: "success" });
            return;
        }

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

        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            appToaster.show({ message: "Diagram saved", intent: "success" });
            return;
        }


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