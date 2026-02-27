import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/api';
import applicationReducer from './applicationSlice';
import schemesReducer from './schemesSlice';


export const store = configureStore({

    reducer: {
        application: applicationReducer,
        schemes: schemesReducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
    devTools: true
},);


store.subscribe(() => {
    const state = store.getState();
    const schemes = state.schemes.schemes;
    localStorage.setItem("psi-schemes-data", JSON.stringify(schemes));
});




export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

