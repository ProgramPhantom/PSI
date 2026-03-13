import { createAsyncThunk } from "@reduxjs/toolkit";
import { sha256 } from "js-sha256";
import JSZip from "jszip";
import { appToaster } from "../../app/Toaster";
import ENGINE from "../../logic/engine";
import { createSchemeFile } from "../../fileCreation/createSchemeFile";
import { downloadBlob } from "../../logic/util2";
import { IVisual } from "../../logic/visual";
import { IScheme, SchemeSource } from "../../types/schemes";
import { api } from "../api/api";
import { RootState } from "../rootReducer";
import { addScheme, removeScheme, setSchemeLocation } from "../slices/schemesSlice";
import { loadAsset, removeDependencyAndCheckDeload } from "./assetThunks";


export const uploadSchemeServer = createAsyncThunk<void, string>(
    'schemes/uploadScheme',
    async (id, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            thunkAPI.dispatch(setSchemeLocation({ id, location: "local" }));
            return;
        }

        const entry = state.schemes.schemes[id];
        if (!entry) {
            return;
        }

        const name = entry.scheme.metadata.name ?? "unnamed scheme";
        thunkAPI.dispatch(setSchemeLocation({ id, location: "server" }));

        try {
            const zip = await createSchemeFile(id, state.schemes.schemes);

            const blob = await zip.generateAsync({ type: "blob" });
            const file = new File([blob], `${id}.nmrs`, { type: "application/zip" });

            const formData = new FormData();
            formData.append("file", file);
            await thunkAPI.dispatch(
                createScheme({ schemeId: id, formData, schemeName: name })
            ).unwrap();
        } catch (error) {
            console.error("Failed to upload scheme to server", error);
            thunkAPI.dispatch(setSchemeLocation({ id, location: "local" }));
        }
    }
);

export const deleteScheme = createAsyncThunk<void, string>(
    'schemes/deleteScheme',
    async (id, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const schemeData = state.schemes.schemes[id]?.scheme;

        try {
            // deleteSchemeServer thunk handles the server-side deletion
            await thunkAPI.dispatch(deleteSchemeServer(id)).unwrap();
        } catch (error) {
            console.error("Failed to delete scheme from server", error);
        }

        if (schemeData && schemeData.associatedAssets) {
            for (const assetId of schemeData.associatedAssets) {
                thunkAPI.dispatch(removeDependencyAndCheckDeload({ assetId, dependencyId: id }));
            }
        }

        thunkAPI.dispatch(removeScheme(id));
    }
);

export const saveSchemeByID = createAsyncThunk<void, string>(
    'schemes/saveSchemeByID',
    async (schemeId, thunkAPI) => {
        try {
            const state = thunkAPI.getState() as RootState;

            const zip = await createSchemeFile(schemeId, state.schemes.schemes);
            const blob = await zip.generateAsync({ type: "blob" });
            const file = new File([blob], `${schemeId}.nmrs`, { type: "application/zip" });
            const formData = new FormData();

            formData.append("file", file);
            await thunkAPI.dispatch(
                saveSchemeServer({ schemeId, formData })
            ).unwrap();
        } catch (error) {
            console.error("Failed to save scheme by ID to server", error);
            throw error;
        }
    }
);

export const importSchemeFile = createAsyncThunk<void, { file: File, location?: SchemeSource, nameOverride?: string }>(
    'schemes/importSchemeFile',
    async ({ file, location, nameOverride }, thunkAPI) => {
        const zip = new JSZip;
        const unzipped = await zip.loadAsync(file);

        const manifestFile = unzipped.file("manifest.json");
        if (!manifestFile) {
            throw new Error("Invalid scheme file: missing manifest.json");
        }
        const manifestStr = await manifestFile.async("text");
        const manifest = JSON.parse(manifestStr);

        if (manifest.format !== "nmr-pulse-scheme") {
            appToaster.show({
                "message": "Invalid scheme format",
                "intent": "danger"
            });
            return;
        }

        const schemeName = nameOverride || manifest.name || "Imported Scheme";
        const schemeUUID = manifest.id;
        if (schemeUUID === undefined) {
            throw new Error("Invalid scheme file: missing id in manifest");
        }

        // Load assets
        const associatedAssets: string[] = [];
        try {
            const assetsFolder = unzipped.folder("assets");
            if (assetsFolder) {
                const assetPromises: Promise<void>[] = [];
                assetsFolder.forEach((relativePath, assetFile) => {


                    if (!assetFile.dir && relativePath.endsWith(".svg")) {

                        const assetRef = relativePath.substring(0, relativePath.length - 4);

                        assetPromises.push(assetFile.async("blob").then(async blob => {
                            const file = new File([blob], `${assetRef}.svg`, { type: "image/svg+xml" });
                            const dataString = await file.text();
                            const id = await sha256(dataString);
                            associatedAssets.push(id);
                            thunkAPI.dispatch(loadAsset({ file: file, reference: "loaded", dependencies: [schemeUUID] }));
                        }));
                    }
                });
                await Promise.all(assetPromises);
            } else {
                console.log("Missing assets folder in uploaded scheme");
            }
        } catch (err) {
            console.log(`Error opening assets file for scheme ${schemeName}`)
        }


        // Load components
        try {
            const componentsFolder = unzipped.folder("components");
            const components: Record<string, IVisual> = {};
            if (componentsFolder) {
                const promises: Promise<void>[] = [];
                componentsFolder.forEach((relativePath, compFile) => {
                    if (!compFile.dir && relativePath.endsWith(".json")) {
                        promises.push(compFile.async("text").then(compStr => {
                            const comp = JSON.parse(compStr) as IVisual;
                            components[comp.ref] = comp;
                        }));
                    }
                });
                await Promise.all(promises);
            }

            const newScheme: IScheme = {
                metadata: { name: schemeName, id: schemeUUID, format: "nmr-pulse-scheme" },
                components: components,
                associatedAssets: associatedAssets
            };

            thunkAPI.dispatch(addScheme({ scheme: newScheme, location: location ?? "local" }));

            ENGINE.handler.refreshDiagram();
        } catch (err) {
            console.log(`Error opening componetns file for scheme ${schemeName}`);
        }
    }
);

export const syncUserSchemes = createAsyncThunk<void, void>(
    'schemes/syncUserSchemes',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;

        if (!isLoggedIn) {
            return;
        }

        try {
            const schemesListResponse: {
                schemes?: {
                    scheme_id?: string | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } = await thunkAPI.dispatch(
                api.endpoints.getUserSchemes.initiate()
            ).unwrap();

            if (!schemesListResponse.schemes) {
                return;
            }

            // Iterate over all schemes on user
            for (const schemeInfo of schemesListResponse.schemes) {
                const { scheme_id, name } = schemeInfo;
                if (scheme_id === undefined) { continue }

                // Check if already loaded
                const currentState = thunkAPI.getState() as RootState;
                if (currentState.schemes.schemes[scheme_id]) {
                    continue;
                }

                try {
                    // Fetch the actual scheme file (.nmrs blob)
                    const file = await thunkAPI.dispatch(
                        getScheme(scheme_id)
                    ).unwrap();

                    await thunkAPI.dispatch(importSchemeFile({ file: file, location: "server" }));
                } catch (error) {
                    console.error(`Failed to load scheme ${scheme_id} from server`, error);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user schemes list", error);
        }
    }
);


// -------------- Pure thunks ------------------
export const getScheme = createAsyncThunk<File, string>(
    'schemes/getScheme',
    async (schemeId) => {
        const response = await fetch(`/api/schemes/${schemeId}`, { credentials: 'include', cache: "reload" });
        if (!response.ok) throw new Error('Failed to fetch scheme');
        return response.blob() as unknown as File;
    }
);

export const createScheme = createAsyncThunk<void, { schemeId: string, schemeName: string, formData: FormData }>(
    'schemes/createScheme',
    async ({ schemeId, schemeName, formData }) => {
        if (!formData.has('name')) {
            formData.append('name', schemeName);
        }
        const response = await fetch(`/api/schemes/${schemeId}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to create scheme');
    }
);

export const saveSchemeServer = createAsyncThunk<void, { schemeId: string, formData: FormData }>(
    'schemes/saveScheme',
    async ({ schemeId, formData }) => {
        const response = await fetch(`/api/schemes/${schemeId}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to save scheme');
    }
);

export const deleteSchemeServer = createAsyncThunk<void, string>(
    'schemes/deleteSchemeServer',
    async (schemeId) => {
        const response = await fetch(`/api/schemes/${schemeId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete scheme');
    }
);

export const downloadSchemeFile = createAsyncThunk<void, string>(
    'schemes/downloadSchemeFile',
    async (schemeId, thunkAPI) => {
        const state = thunkAPI.getState() as any;
        const schemes = state.schemes.schemes;
        const scheme: IScheme | undefined = schemes[schemeId]?.scheme;
        if (!scheme) return;

        const name = scheme.metadata.name;
        const file = await createSchemeFile(schemeId, schemes);
        const blob = await file.generateAsync({ type: "blob" });
        downloadBlob(blob, `${name}.nmrs`);
    }
);