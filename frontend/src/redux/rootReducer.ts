import { combineReducers } from "@reduxjs/toolkit";
import applicationReducer from './slices/applicationSlice';
import dialogReducer from './slices/dialogSlice';
import schemesReducer from './slices/schemesSlice';
import assetReducer from './slices/assetSlice';
import { api } from "./api/api";


export const rootReducer = combineReducers({
    application: applicationReducer,
    dialog: dialogReducer,
    schemes: schemesReducer,
    assets: assetReducer,
    [api.reducerPath]: api.reducer,
})


/*
        application: applicationReducer,
        schemes: schemesReducer,
        assets: assetReducer,

*/

export type RootState = ReturnType<typeof rootReducer>;