import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ID } from '../../logic/point';
import { IScheme, SchemeSource } from '../../types/schemes';
import { api } from '../api/api';
import { RootState } from '../rootReducer';
import {
    addComponent, addScheme,
    deleteComponent,
    updateComponent
} from '../slices/schemesSlice';
import { deloadServerSchemes, saveSchemeByID, syncUserSchemes, uploadSchemeServer } from '../thunks/schemeThunks';
import ENGINE from '../../logic/engine';

export const schemeListenerMiddleware = createListenerMiddleware();


// On upload scheme
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(addScheme),

    effect: async (action, listenerApi) => {
        const actionPayload = action.payload as { id?: ID; scheme: IScheme; location?: SchemeSource };
        const id = actionPayload.scheme.metadata.id;

        if (!id) return;
        if (actionPayload.location === "server") return

        // The uploadScheme thunk handles login check and location logic internally
        await listenerApi.dispatch(uploadSchemeServer(id));
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

        await listenerApi.dispatch(saveSchemeByID(schemeId));

        ENGINE.handler.refreshDiagram();
    }
});

// Sync schemes on login/logout
schemeListenerMiddleware.startListening({
    matcher: isAnyOf(api.endpoints.getMe.matchFulfilled, api.util.resetApiState.match),
    effect: async (action, listenerApi) => {
        if (api.util.resetApiState.match(action)) {
            listenerApi.dispatch(deloadServerSchemes());
            return;
        }

        const user = action.payload;

        if (!user) {
            // Logout case
            listenerApi.dispatch(deloadServerSchemes());
            return;
        }

        // Login case: Fetch schemes from server
        await listenerApi.dispatch(syncUserSchemes());
    }
});
