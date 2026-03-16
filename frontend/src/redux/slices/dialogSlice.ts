import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DialogState {
    isPNGDialogOpen: boolean;
    isLoadDialogOpen: boolean;
    isSaveAsDialogOpen: boolean;
    isLoginDialogOpen: boolean;
    isUserDialogOpen: boolean;
    isDiagramsDialogOpen: boolean;
}

const initialState: DialogState = {
    isPNGDialogOpen: false,
    isLoadDialogOpen: false,
    isSaveAsDialogOpen: false,
    isLoginDialogOpen: false,
    isUserDialogOpen: false,
    isDiagramsDialogOpen: false,
};

export const dialogSlice = createSlice({
    name: 'dialog',
    initialState,
    reducers: {
        setPNGDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isPNGDialogOpen = action.payload;
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
    },
});

export const {
    setPNGDialogOpen,
    setLoadDialogOpen,
    setSaveAsDialogOpen,
    setLoginDialogOpen,
    setUserDialogOpen,
    setDiagramsDialogOpen
} = dialogSlice.actions;

export default dialogSlice.reducer;
