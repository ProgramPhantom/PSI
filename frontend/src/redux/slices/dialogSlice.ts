import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IconName } from '@blueprintjs/core';
import { AllComponentTypes } from '../../logic/point';

export interface RoleSubformLevel {
    roleName: string;
    prefix: string;
    displayName: string;
    elementType: AllComponentTypes;
    icon?: IconName;
}

export interface DialogState {
    isPNGDialogOpen: boolean;
    isSVGDialogOpen: boolean;
    isLoadDialogOpen: boolean;
    isSaveAsDialogOpen: boolean;
    isLoginDialogOpen: boolean;
    isUserDialogOpen: boolean;
    isDiagramsDialogOpen: boolean;
    isDebugLayerDialogOpen: boolean;
    isAssetStoreDialogOpen: boolean;
    isNewDiagramAlertOpen: boolean;
    isUnsavedDiagramLogoutAlertOpen: boolean;
    isAboutDialogOpen: boolean;
    roleSubformStack: RoleSubformLevel[];
}

const initialState: DialogState = {
    isPNGDialogOpen: false,
    isSVGDialogOpen: false,
    isLoadDialogOpen: false,
    isSaveAsDialogOpen: false,
    isLoginDialogOpen: false,
    isUserDialogOpen: false,
    isDiagramsDialogOpen: false,
    isDebugLayerDialogOpen: false,
    isAssetStoreDialogOpen: false,
    isNewDiagramAlertOpen: false,
    isUnsavedDiagramLogoutAlertOpen: false,
    isAboutDialogOpen: false,
    roleSubformStack: []
};

export const dialogSlice = createSlice({
    name: 'dialog',
    initialState,
    reducers: {
        setPNGDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isPNGDialogOpen = action.payload;
        },
        setSVGDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isSVGDialogOpen = action.payload;
        },
        setLoadDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isLoadDialogOpen = action.payload;
        },
        setSaveAsDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isSaveAsDialogOpen = action.payload;
        },
        setLoginDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isLoginDialogOpen = action.payload;
        },
        setUserDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isUserDialogOpen = action.payload;
        },
        setDiagramsDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isDiagramsDialogOpen = action.payload;
        },
        setDebugLayerDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isDebugLayerDialogOpen = action.payload
        },
        setAssetStoreDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isAssetStoreDialogOpen = action.payload
        },
        setNewDiagramAlertOpen: (state, action: PayloadAction<boolean>) => {
            state.isNewDiagramAlertOpen = action.payload;
        },
        setUnsavedDiagramLogoutAlertOpen: (state, action: PayloadAction<boolean>) => {
            state.isUnsavedDiagramLogoutAlertOpen = action.payload;
        },
        setAboutDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isAboutDialogOpen = action.payload;
        },
        pushRoleSubform: (state, action: PayloadAction<RoleSubformLevel>) => {
            state.roleSubformStack.push(action.payload);
        },
        popRoleSubform: (state) => {
            state.roleSubformStack.pop();
        },
        closeAllRoleSubforms: (state) => {
            state.roleSubformStack = [];
        }
    },
});

export const {
    setPNGDialogOpen,
    setSVGDialogOpen,
    setLoadDialogOpen,
    setSaveAsDialogOpen,
    setLoginDialogOpen,
    setUserDialogOpen,
    setDiagramsDialogOpen,
    setDebugLayerDialogOpen,
    setAssetStoreDialogOpen,
    setNewDiagramAlertOpen,
    setUnsavedDiagramLogoutAlertOpen,
    setAboutDialogOpen,
    pushRoleSubform,
    popRoleSubform,
    closeAllRoleSubforms
} = dialogSlice.actions;

export default dialogSlice.reducer;
