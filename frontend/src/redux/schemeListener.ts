import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { addScheme, deleteScheme, setSchemeLocation } from './schemesSlice';
import { api } from './api/api';
import type { RootState } from './store';
import ENGINE from '../logic/engine';
import { ID } from '../logic/point';
import { IScheme, SchemeSource } from './schemesSlice';

export const schemeListenerMiddleware = createListenerMiddleware();

// On upload scheme
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(addScheme),
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
        const { id, scheme, location = "local" } = actionPayload;

        // Only upload local schemes. If it's builtin or already from the server, do not upload.
        if (location !== "local" || id === undefined) {
            return;
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
                api.endpoints.saveScheme.initiate({ schemeId: id, formData })
            ).unwrap();

            // Setup the scheme location to "server" if successful
            listenerApi.dispatch(setSchemeLocation({ id, location: "server" }));

        } catch (error) {
            console.error("Failed to upload scheme to server", error);
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
