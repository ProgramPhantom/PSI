import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from './api/api';

export interface DiagramDTO {
    name?: string;
    diagram_id?: string;
}

interface DiagramState {
    diagramList: DiagramDTO[];
}

const initialState: DiagramState = {
    diagramList: [],
};

const diagramSlice = createSlice({
    name: 'diagram',
    initialState,
    reducers: {

    },

});

export default diagramSlice.reducer;
