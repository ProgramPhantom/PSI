import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { api } from './api/api';
import { schemeListenerMiddleware } from './middleware/schemeListener';
import { diagramListenerMiddleware } from './middleware/diagramListener';
import { rootReducer, RootState } from './rootReducer';
import { SchemeDict } from '../types/schemes';
import { DEFAULT_SCHEME_SET } from '../logic/default/schemeSet';
import { SchemesState } from './slices/schemesSlice';


const schemesTransform = createTransform<SchemesState, SchemesState, RootState>(
    // serialize: save only "local" schemes
    (inboundState) => {
        const rawSchemes: SchemeDict = inboundState.schemes || {};
        const localSchemes = Object.fromEntries(
            Object.entries(rawSchemes).filter(([_, val]) => val.location === "local")
        );
        return { ...inboundState, schemes: localSchemes };
    },
    // deserialize: merge with DEFAULT_SCHEME_SET
    (outboundState) => {
        const persistedSchemes = outboundState.schemes || {};
        return {
            ...outboundState,
            schemes: { ...persistedSchemes, ...DEFAULT_SCHEME_SET }
        };
    },
    { whitelist: ['schemes'] }
);

const persistConfig: PersistConfig<RootState> = {
    key: 'psi-schemes',
    storage,
    whitelist: ['schemes', 'diagram'], // Only persist the schemes and diagram slices
    transforms: [schemesTransform]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })
            .prepend(diagramListenerMiddleware.middleware)
            .prepend(schemeListenerMiddleware.middleware)
            .concat(api.middleware),
    devTools: true
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
