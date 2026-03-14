import { createAsyncThunk } from "@reduxjs/toolkit";
import { IDiagram } from "../../logic/hasComponents/diagram";
import ENGINE from "../../logic/engine";
import { api } from "../api/api";
import { appToaster } from "../../app/Toaster";
import { RootState } from "../rootReducer";
import { loadAsset } from "./assetThunks";
import JSZip from "jszip";
import localforage from "localforage";
import { createDiagramFile } from "../../fileCreation/createDiagramFile";



export const saveDiagramServer = createAsyncThunk<void, { stateObject: IDiagram, asNew: boolean }>(
    'application/saveDiagramServer',
    async ({ stateObject, asNew }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            appToaster.show({ message: "Diagram saved locally", intent: "success" });
            return;
        }

        if (asNew) {
            // Save As
            try {
                // CREATE diagram, this will give a new id
                const createResponse = await thunkAPI.dispatch(api.endpoints.createDiagram.initiate(stateObject.ref)).unwrap();

                if (createResponse.id !== undefined) {
                    // Save diagram data
                    await thunkAPI.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: createResponse.id, diagram: stateObject }));

                    localStorage.setItem("diagramUUID", createResponse.id);

                    appToaster.show({ message: "Diagram saved successfully", intent: "success" });
                }
            } catch (error) {
                console.error("Failed to save diagram as:", error);
                appToaster.show({ message: "Failed to save diagram", intent: "danger" });
            }

        } else {
            // Save
            const currentUUID = localStorage.getItem("diagramUUID") ?? "";

            try {
                // Try save
                await thunkAPI.dispatch(api.endpoints.saveDiagram.initiate({ diagramId: currentUUID, diagram: stateObject })).unwrap();
                appToaster.show({ message: "Diagram saved", intent: "success" });
            } catch (error) {
                // Try save as
                try {
                    // CREATE diagram and get id
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
    }
);

export const saveDiagram = createAsyncThunk<void, boolean>(
    'application/saveDiagram',
    async (saveAs, thunkAPI) => {
        const stateObject: IDiagram = ENGINE.handler.diagram.state;

        try {
            const file = await createDiagramFile();
            const blob = await file.generateAsync({ type: "blob" });
            await localforage.setItem(ENGINE.StateName, blob);
        } catch (error) {
            console.error("Failed to save local diagram file:", error);
        }

        await thunkAPI.dispatch(saveDiagramServer({ stateObject, asNew: saveAs }));
    },

);

export const openDiagram = createAsyncThunk<void, File>(
    'application/openDiagram',
    async (file, thunkAPI) => {
        try {
            const zip = await JSZip.loadAsync(file);

            // Read the diagram.json file
            const diagramFile = zip.file("diagram.json");
            if (!diagramFile) {
                throw new Error("Missing diagram.json in the uploaded file.");
            }

            const diagramString = await diagramFile.async("string");
            const stateData = JSON.parse(diagramString) as IDiagram;

            // Extract all SVGs in the assets folder
            const assetsFolder = zip.folder("assets");
            if (assetsFolder) {
                const svgFiles = Object.values(assetsFolder.files).filter((f) => !f.dir && f.name.endsWith(".svg"));

                for (const fileObj of svgFiles) {
                    const blob = await fileObj.async("blob");
                    const assetId = fileObj.name.split("/").pop()!.replace(".svg", "");

                    let reference = assetId; // Default fallback

                    const sidecarFile = assetsFolder.file(`${assetId}.json`);
                    let metadataMissing = false;
                    if (sidecarFile) {
                        try {
                            const sidecarText = await sidecarFile.async("string");
                            const sidecarMetadata = JSON.parse(sidecarText);
                            if (sidecarMetadata.ref) {
                                reference = sidecarMetadata.ref;
                            }
                        } catch (e) {
                            console.warn(`Failed to parse sidecar file for asset ${assetId}`, e);
                            metadataMissing = true
                        }
                    }

                    if (metadataMissing) {
                        appToaster.show({
                            message: "Metadata is missing in diagram file",
                            intent: "warning"
                        });
                    }

                    await thunkAPI.dispatch(loadAsset({
                        file: blob,
                        reference: reference,
                        source: "local"
                    })).unwrap();
                }
            }

            ENGINE.loadDiagramState(stateData);

            appToaster.show({
                message: "Diagram loaded successfully",
                intent: "success"
            });
        } catch (error) {
            console.error("Failed to load diagram:", error);
            appToaster.show({
                message: "Failed to load diagram file. It may be corrupted or invalid.",
                intent: "danger"
            });
        }
    }
);