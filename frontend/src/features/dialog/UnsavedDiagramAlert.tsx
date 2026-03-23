import React from "react";
import { Alert } from "@blueprintjs/core";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { newDiagram } from "../../redux/thunks/diagramThunks";
import { setNewDiagramAlertOpen } from "../../redux/slices/dialogSlice";

export const UnsavedDiagramAlert: React.FC = () => {
    const dispatch = useAppDispatch();
    const isNewDiagramAlertOpen = useAppSelector((state) => state.dialog.isNewDiagramAlertOpen);

    return (
        <Alert
            cancelButtonText="Cancel"
            confirmButtonText="Create New Diagram"
            icon="warning-sign"
            intent="warning"
            isOpen={isNewDiagramAlertOpen}
            onCancel={() => dispatch(setNewDiagramAlertOpen(false))}
            onConfirm={() => {
                dispatch(newDiagram());
                dispatch(setNewDiagramAlertOpen(false));
            }}
        >
            <p>
                The current diagram has unsaved changes. Are you sure you want to create a new one? Unsaved changes will be lost.
            </p>
        </Alert>
    );
};
