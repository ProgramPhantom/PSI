import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { addComponent, addLocalScheme, addServerScheme, deleteComponent, deleteScheme, removeAllServerSchemes, 
    setSchemeLocation, setSchemeLocationServer, updateComponent } from '../schemesSlice';
import { api } from '../api/api';
import type { RootState } from '../store';
import ENGINE from '../../logic/engine';
import { ID } from '../../logic/point';
import { IScheme, SchemeSource } from '../schemesSlice';
import JSZip from 'jszip';

export const schemeListenerMiddleware = createListenerMiddleware();

// On upload scheme
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(addLocalScheme),
    effect: async (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;

        // We only attempt to upload if the user is logged in
        // A user is logged in if we have the "getMe" query fulfilled.
        // We can check the RTK query cache for getMe.
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;

        if (!isLoggedIn) {
            return;
        }

        const actionPayload = action.payload as { id?: ID; scheme: IScheme; location?: SchemeSource };
        const { scheme, location = "local" } = actionPayload;
        const id = scheme.metadata.id;
        let name = scheme.metadata.name

        // Only upload local schemes. If it's builtin or already from the server, do not upload.
        if (location !== "local" || id === undefined) {
            return;
        }

        if (name === undefined) {
            name = "unnamed scheme"
        }

        try {
            // Reconstruct the nmrs file for this specific scheme
            // ENGINE.createSchemeFile technically takes a schemeName, which maps to the ID in the store
            const zip = await ENGINE.createSchemeFile(id);
            const blob = await zip.generateAsync({ type: "blob" });
            const file = new File([blob], `${id}.nmrs`, { type: "application/zip" });

            const formData = new FormData();
            formData.append('file', file);

            // Dispatch the saveScheme mutation
            await listenerApi.dispatch(
                api.endpoints.createScheme.initiate({ schemeId: id, formData, schemeName: name })
            ).unwrap();

            // Setup the scheme location to "server" if successful (ServerSync avoids triggering upload listener)
            listenerApi.dispatch(setSchemeLocationServer({ id }));

        } catch (error) {
            console.error("Failed to upload scheme to server", error);
        }
    }
});

// When user moves a scheme to "server" (e.g. Upload button): run upload; revert to "local" on failure
schemeListenerMiddleware.startListening({
    matcher: setSchemeLocation.match,
    effect: async (action, listenerApi) => {
        const { id, location } = action.payload;
        if (location !== "server" || id === undefined) {
            return;
        }

        const state = listenerApi.getState() as RootState;
        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;
        if (!isLoggedIn) {
            listenerApi.dispatch(setSchemeLocation({ id, location: "local" }));
            return;
        }

        const entry = state.schemes.schemes[id];
        if (!entry) {
            return;
        }

        const name = entry.scheme.metadata.name ?? "unnamed scheme";
        try {
            const zip = await ENGINE.createSchemeFile(id);
            const blob = await zip.generateAsync({ type: "blob" });
            const file = new File([blob], `${id}.nmrs`, { type: "application/zip" });
            const formData = new FormData();
            formData.append("file", file);
            await listenerApi.dispatch(
                api.endpoints.createScheme.initiate({ schemeId: id, formData, schemeName: name })
            ).unwrap();
        } catch (error) {
            console.error("Failed to upload scheme to server", error);
            listenerApi.dispatch(setSchemeLocation({ id, location: "local" }));
        }
    }
});

// On delete scheme
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(deleteScheme),
    effect: async (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;

        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;

        if (!isLoggedIn) {
            return;
        }

        const id = action.payload as ID;

        // At this point the scheme is already deleted from local state, so we couldn't easily check its location.
        // But since we want the state of the backend to mirror reality, if they are logged in and delete a scheme,
        // we'll attempt to delete it from the server. If it's a "local" scheme or doesn't exist on the server,
        // it may just 404 which is fine.

        try {
            await listenerApi.dispatch(
                api.endpoints.deleteScheme.initiate(id)
            ).unwrap();
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

        const userState = api.endpoints.getMe.select()(state);
        const isLoggedIn = userState?.isSuccess && userState?.data;

        if (!isLoggedIn) {
            return;
        }

        const schemeId = (action.payload as { schemeId: ID }).schemeId;
        const entry = state.schemes.schemes[schemeId];

        if (!entry || entry.location !== "server") {
            return;
        }

        try {
            const zip = await ENGINE.createSchemeFile(schemeId);
            const blob = await zip.generateAsync({ type: "blob" });
            const file = new File([blob], `${schemeId}.nmrs`, { type: "application/zip" });

            const formData = new FormData();
            formData.append('file', file);

            await listenerApi.dispatch(
                api.endpoints.saveScheme.initiate({ schemeId, formData })
            ).unwrap();
        } catch (error) {
            console.error("Failed to re-upload scheme to server", error);
        }
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
                        api.endpoints.getScheme.initiate(scheme_id)
                    ).unwrap();

                    // Load assets from the zip
                    await ENGINE.loadSchemeAssets(file);

                    // Extract components from the zip
                    const zip = new JSZip();
                    const unzipped = await zip.loadAsync(file);

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
