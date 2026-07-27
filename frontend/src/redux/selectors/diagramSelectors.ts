import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';
import { recentDiagramsAdapter } from '../slices/diagramSlice';

const selectDiagramState = (state: RootState) => state.diagram;

export const recentDiagramsSelectors = recentDiagramsAdapter.getSelectors(selectDiagramState);

export const selectCurrentDiagramUUID = (state: RootState) => selectDiagramState(state).diagramUUID;

export const selectCurrentFileName = createSelector(
    [recentDiagramsSelectors.selectEntities, selectCurrentDiagramUUID],
    (entities, uuid) => {
        if (uuid) {
            const diagram = entities[uuid];
            if (diagram) return diagram.name;
        }
        return "unnamed";
    }
);

export const selectCurrentDiagramSource = createSelector(
    [recentDiagramsSelectors.selectEntities, selectCurrentDiagramUUID],
    (entities, uuid) => {
        if (uuid) {
            const diagram = entities[uuid];
            if (diagram) return diagram.diagramSource;
        }
        return "local";
    }
);

export const selectCurrentAuthor = createSelector(
    [recentDiagramsSelectors.selectEntities, selectCurrentDiagramUUID],
    (entities, uuid) => {
        if (uuid) {
            const diagram = entities[uuid];
            if (diagram) return diagram.author ?? "";
        }
        return "";
    }
);

export const selectCurrentInstitution = createSelector(
    [recentDiagramsSelectors.selectEntities, selectCurrentDiagramUUID],
    (entities, uuid) => {
        if (uuid) {
            const diagram = entities[uuid];
            if (diagram) return diagram.institution ?? "";
        }
        return "";
    }
);

export const selectLocalRecentDiagrams = createSelector(
    recentDiagramsSelectors.selectAll,
    (diagrams) => diagrams.filter((d) => d.diagramSource === "local")
);
