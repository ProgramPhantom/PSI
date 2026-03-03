import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import { ID } from '../../logic/point';
import { IScheme, SchemeSource } from '../../types/schemes';
import { api } from '../api/api';
import { RootState } from '../rootReducer';
import {
    addComponent, addLocalScheme, addServerScheme, deleteComponent, deleteScheme,
    removeAllServerSchemes,
    updateComponent,
} from '../slices/schemesSlice';
import { deleteSchemeServer, getScheme, saveSchemeByID, uploadScheme } from '../thunks/schemeThunks';
import { loadAsset } from '../thunks/assetThunks';

export const schemeListenerMiddleware = createListenerMiddleware();


// On upload scheme
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(addLocalScheme),

    effect: async (action, listenerApi) => {
        const actionPayload = action.payload as { id?: ID; scheme: IScheme; location?: SchemeSource };
        const id = actionPayload.scheme.metadata.id;

        if (!id) return;

        // The uploadScheme thunk handles login check and location logic internally
        await listenerApi.dispatch(uploadScheme(id));
    }
});



// On delete scheme
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(deleteScheme),
    effect: async (action, listenerApi) => {
        const id = action.payload as ID;

        try {
            // deleteSchemeServer thunk handles the server-side deletion
            await listenerApi.dispatch(deleteSchemeServer(id)).unwrap();
        } catch (error) {
            console.error("Failed to delete scheme from server", error);
        }
    }
});

// On add/delete/update component: re-upload scheme to server if it lives on the server
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(addComponent, deleteComponent, updateComponent),
    effect: async (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const schemeId = (action.payload as { schemeId: ID }).schemeId;
        const entry = state.schemes.schemes[schemeId];

        if (!entry || entry.location !== "server") {
            return;
        }

        // try {
        //     const zip = await ENGINE.createSchemeFile(schemeId);
        //     const blob = await zip.generateAsync({ type: "blob" });
        //     const file = new File([blob], `${schemeId}.nmrs`, { type: "application/zip" });
        // 
        //     const formData = new FormData();
        //     formData.append('file', file);
        // 
        //     // Using saveScheme thunk
        //     await listenerApi.dispatch(
        //         saveScheme({ schemeId, formData })
        //     ).unwrap();
        // } catch (error) {
        //     console.error("Failed to re-upload scheme to server", error);
        // }
        await listenerApi.dispatch(saveSchemeByID(schemeId));
    }
});

// Sync schemes on login/logout
schemeListenerMiddleware.startListening({
    matcher: api.endpoints.getMe.matchFulfilled,
    effect: async (action, listenerApi) => {
        const user = action.payload;

        if (!user || action.meta.requestStatus !== "fulfilled") {
            // Logout case
            listenerApi.dispatch(removeAllServerSchemes());
            return;
        }

        // Login case: Fetch schemes from server
        try {
            const schemesListResponse: {
                schemes?: {
                    scheme_id?: string | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } = await listenerApi.dispatch(
                api.endpoints.getUserSchemes.initiate()
            ).unwrap();

            if (!schemesListResponse.schemes) {
                return;
            }

            for (const schemeInfo of schemesListResponse.schemes) {
                const { scheme_id, name } = schemeInfo;
                if (scheme_id === undefined) { continue }

                try {
                    // Fetch the actual scheme file (.nmrs blob)
                    const file = await listenerApi.dispatch(
                        getScheme(scheme_id)
                    ).unwrap();

                    // Extract components from the zip
                    const zip = new JSZip();
                    const unzipped = await zip.loadAsync(file);

                    // Load assets from the zip
                    const assetsFolder = unzipped.folder("assets");
                    if (assetsFolder) {
                        const assetPromises: Promise<void>[] = [];
                        assetsFolder.forEach((relativePath, assetFile) => {
                            if (!assetFile.dir && relativePath.endsWith(".svg")) {
                                const assetRef = relativePath.substring(0, relativePath.length - 4);
                                assetPromises.push(assetFile.async("text").then(svgText => {
                                    listenerApi.dispatch(loadAsset({ dataString: svgText, reference: assetRef }));
                                }));
                            }
                        });
                        await Promise.all(assetPromises);
                    } else {
                        console.log("Missing assets folder in uploaded scheme");
                    }

                    const componentsFolder = unzipped.folder("components");
                    const components: Record<string, any> = {};

                    if (componentsFolder) {
                        const filePromises: Promise<void>[] = [];
                        componentsFolder.forEach((relativePath, file) => {
                            if (!file.dir && relativePath.endsWith(".json")) {
                                filePromises.push(
                                    file.async("text").then((text) => {
                                        const comp = JSON.parse(text);
                                        components[comp.ref] = comp;
                                    })
                                );
                            }
                        });
                        await Promise.all(filePromises);
                    }

                    const scheme: IScheme = {
                        metadata: { name: name || "Unnamed", id: scheme_id, format: "nmr-pulse-scheme" },
                        components: components
                    };

                    listenerApi.dispatch(addServerScheme({ id: scheme_id, scheme }));

                } catch (error) {
                    console.error(`Failed to load scheme ${scheme_id} from server`, error);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user schemes list", error);
        }
    }
});
