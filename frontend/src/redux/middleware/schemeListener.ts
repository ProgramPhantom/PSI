import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ID } from '../../logic/point';
import { IScheme, SchemeSource } from '../../types/schemes';
import { api } from '../api/api';
import { RootState } from '../rootReducer';
import {
    addComponent, addLocalScheme,
    deleteComponent, deleteScheme,
    removeAllServerSchemes,
    updateComponent
} from '../slices/schemesSlice';
import { deleteSchemeServer, saveSchemeByID, syncSchemes, uploadScheme } from '../thunks/schemeThunks';

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
        await listenerApi.dispatch(syncSchemes());
    }
});
