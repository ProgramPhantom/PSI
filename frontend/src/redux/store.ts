import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/api';
import applicationReducer from './applicationSlice';
import schemesReducer from './schemesSlice';
import assetReducer from './assetSlice';
import { schemeListenerMiddleware } from './middleware/schemeListener';


export const store = configureStore({

    reducer: {
        application: applicationReducer,
        schemes: schemesReducer,
        assets: assetReducer,
        [api.reducerPath]: api.reducer,
    },
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




export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

