import React from "react";
import { Alert } from "@blueprintjs/core";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/thunks/actionThunks";
import { setUnsavedDiagramLogoutAlertOpen } from "../../redux/slices/dialogSlice";

export const UnsavedDiagramLogoutAlert: React.FC = () => {
    const dispatch = useAppDispatch();
    const isUnsavedDiagramLogoutAlertOpen = useAppSelector((state) => state.dialog.isUnsavedDiagramLogoutAlertOpen);

    return (
        <Alert
            cancelButtonText="Cancel"
            confirmButtonText="Logout"
            icon="warning-sign"
            intent="danger"
            isOpen={isUnsavedDiagramLogoutAlertOpen}
            onCancel={() => dispatch(setUnsavedDiagramLogoutAlertOpen(false))}
            onConfirm={() => {
                dispatch(logout(true));
                dispatch(setUnsavedDiagramLogoutAlertOpen(false));
            }}
        >
            <p>
                The current diagram has unsaved changes. Are you sure you want to logout? Unsaved changes will be lost.
            </p>
        </Alert>
    );
};
