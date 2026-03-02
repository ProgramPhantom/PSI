import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/api';
import { schemeListenerMiddleware } from './middleware/schemeListener';
import { rootReducer } from './rootReducer';


export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
            .prepend(schemeListenerMiddleware.middleware)
            .concat(api.middleware),
    devTools: true
},);


store.subscribe(() => {
    const state = store.getState();
    const rawSchemes = state.schemes.schemes;

    // Only serialize "local" schemes to local storage
    const localSchemes = Object.fromEntries(
        Object.entries(rawSchemes).filter(([_, val]) => val.location === "local")
    );

    localStorage.setItem("psi-schemes-data", JSON.stringify(localSchemes));
});




export type AppDispatch = typeof store.dispatch;

