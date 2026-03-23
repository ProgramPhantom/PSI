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
import { setDiagramUUID, setFileName, addRecentDiagram, setSaveState, setDiagramSource } from "../slices/diagramSlice";
import { v7 as uuidv7 } from "uuid";
import { IDiagramMetadata } from "../../types/diagram";


// -------------- Pure thunks ------------------
export const getDiagramThunk = createAsyncThunk<File, string>(
    'diagrams/getDiagram',
    async (diagramId) => {
        const response = await fetch(`/api/diagrams/${diagramId}`, { credentials: 'include', cache: "reload" });
        if (!response.ok) throw new Error('Failed to fetch diagram');
        return response.blob() as unknown as File;
    }
);

export const createDiagramServerThunk = createAsyncThunk<{ message: string }, { formData: FormData }>(
    'diagrams/createDiagramServerThunk',
    async ({ formData }) => {
        const response = await fetch(`/api/diagrams/`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to create diagram');
        return response.json();
    }
);

export const putSaveDiagramServerThunk = createAsyncThunk<{ copied: boolean, message: string }, { diagramId: string, formData: FormData }>(
    'diagrams/putSaveDiagramServerThunk',
    async ({ diagramId, formData }, thunkAPI) => {
        const response = await fetch(`/api/diagrams/${diagramId}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to save diagram');
        return response.json();
    }
);


// ------------ Main thunks ----------------

export const newDiagram = createAsyncThunk<void, void>(
    'application/newDiagram',
    async (_, thunkAPI) => {
        ENGINE.resetDiagram();
        const newUUID = uuidv7();
        thunkAPI.dispatch(setDiagramUUID(undefined));
        thunkAPI.dispatch(setFileName("new-diagram"));
        appToaster.show({ message: "New diagram created", intent: "success" });
    }
);


// ------------ Main thunks ----------------

export const uploadDiagram = createAsyncThunk<void, { stateObject: IDiagram, asNew: boolean }>(
    'application/saveDiagramServer',
    async ({ stateObject, asNew }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            return;
        }

        try {
            let currentUUID = state.diagram.diagramUUID;
            if (!currentUUID) {
                console.warn(`Cannot upload file when no file is loaded`)
                return
            }

            const metadataToUpload: IDiagramMetadata = {
                UUID: currentUUID,
                source: "server",
                diagramName: state.diagram.fileName,
                institution: undefined,
                originalAuthor: isLoggedIn ? `${userState.data.firstname} ${userState.data.surname}`.trim() : undefined,
                dateCreated: new Date().toISOString()
            };

            const file = await createDiagramFile(metadataToUpload);
            const blob = await file.generateAsync({ type: "blob" });
            const zipFile = new File([blob], `diagram.nmrd`, { type: "application/zip" });

            const formData = new FormData();
            formData.append("data", JSON.stringify(metadataToUpload));
            formData.append("file", zipFile);


            if (asNew) {
                // Save As
                await thunkAPI.dispatch(createDiagramServerThunk({ formData })).unwrap();
                appToaster.show({ message: "Saved to server", intent: "success" });
            } else {
                try {
                    const saveResponse = await thunkAPI.dispatch(putSaveDiagramServerThunk({ diagramId: currentUUID, formData })).unwrap();
                    if (saveResponse.copied) {
                        appToaster.show({ message: "Diagram copied to your account", intent: "success" });
                    } else {
                        appToaster.show({ message: "Saved to server", intent: "success" });
                    }
                } catch (error) {
                    // Fallback to Create/Save As if PUT fails (cant save uncreated diagram)

                    await thunkAPI.dispatch(createDiagramServerThunk({ formData: formData })).unwrap();
                    appToaster.show({ message: "Saved to server", intent: "success" });
                }
            }

            // Re-fetch diagrams list
            thunkAPI.dispatch(api.util.invalidateTags(['Diagram']));
        } catch (error) {
            console.error("Failed to save diagram file to server:", error);
            appToaster.show({ message: "Failed to save diagram", intent: "danger" });
        }
    }
);

export const saveDiagram = createAsyncThunk<void, boolean>(
    'application/saveDiagram',
    async (saveAs, thunkAPI) => {
        const diagramStateObject: IDiagram = ENGINE.handler.diagram.state;
        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;

        let currentUUID: string | undefined = state.diagram.diagramUUID;


        if (saveAs || currentUUID === undefined) {
            currentUUID = uuidv7();
            thunkAPI.dispatch(setDiagramUUID(currentUUID));

            thunkAPI.dispatch(addRecentDiagram({
                name: state.diagram.fileName,
                diagramUUID: currentUUID,
                opened: new Date().toISOString()
            }));
        }

        if (currentUUID === undefined) {
            appToaster.show({
                "message": "No diagram loaded",
                "intent": "warning"
            })
            return
        }

        const source = state.diagram.diagramSource;

        if (source === "server" || isLoggedIn) {
            thunkAPI.dispatch(setDiagramSource("server"))
            await thunkAPI.dispatch(uploadDiagram({ stateObject: diagramStateObject, asNew: saveAs }));
            thunkAPI.dispatch(setSaveState("saved"))

        } else if (source === "local") {

            try {
                const file = await createDiagramFile({
                    "UUID": currentUUID,
                    "source": "local",
                    diagramName: state.diagram.fileName,
                    institution: undefined,
                    originalAuthor: undefined,
                    dateCreated: new Date().toISOString()
                });
                const blob = await file.generateAsync({ type: "blob" });

                await localforage.setItem(`diagram-${currentUUID}`, blob);

                thunkAPI.dispatch(setSaveState("saved"))
            } catch (error) {
                console.error("Failed to save local diagram file:", error);
            }
        }
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
                        source: "diagram",
                    })).unwrap();
                }
            }

            // Read the manifest.json file
            const manifestFile = zip.file("manifest.json");
            if (manifestFile) {
                try {
                    const manifestString = await manifestFile.async("string");
                    const manifestData: IDiagramMetadata = JSON.parse(manifestString);
                    if (manifestData.UUID) {
                        thunkAPI.dispatch(setDiagramUUID(manifestData.UUID));
                        thunkAPI.dispatch(setDiagramSource(manifestData.source || "local"));

                        const diagramName = manifestData.diagramName || file.name.replace(".nmrd", "") || "unnamed";

                        thunkAPI.dispatch(setFileName(diagramName));

                        if (manifestData.source === "local") {
                            thunkAPI.dispatch(addRecentDiagram({
                                name: diagramName,
                                diagramUUID: manifestData.UUID,
                                opened: new Date().toISOString()
                            }));
                        }

                    } else {
                        console.error(`Diagram does not contain ID`)
                    }
                } catch (e) {
                    console.warn("Failed to parse manifest.json", e);
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

export const loadDiagram = createAsyncThunk<void, string>(
    'application/loadDiagram',
    async (diagramId, thunkAPI) => {
        try {
            const file = await thunkAPI.dispatch(getDiagramThunk(diagramId)).unwrap();
            await thunkAPI.dispatch(openDiagram(file)).unwrap();
            thunkAPI.dispatch(setDiagramSource("server"))

        } catch (error) {
            console.error(`Failed to fetch and load diagram ${diagramId} from server`, error);
            appToaster.show({
                message: "Error loading diagram from server",
                intent: "danger"
            });
            throw error;
        }
    }
);