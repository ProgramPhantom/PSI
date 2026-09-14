import React from "react";
import { Alert } from "@blueprintjs/core";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { confirmResetApp } from "../../redux/thunks/actionThunks";
import { setResetAppAlertOpen } from "../../redux/slices/dialogSlice";

export const ResetAppAlert: React.FC = () => {
    const dispatch = useAppDispatch();
    const isResetAppAlertOpen = useAppSelector((state) => state.dialog.isResetAppAlertOpen);

    return (
        <Alert
            cancelButtonText="Cancel"
            confirmButtonText="Reset App"
            icon="warning-sign"
            intent="warning"
            isOpen={isResetAppAlertOpen}
            onCancel={() => dispatch(setResetAppAlertOpen(false))}
            onConfirm={() => {
                dispatch(confirmResetApp());
                dispatch(setResetAppAlertOpen(false));
            }}
        >
            <p>
                Are you sure you want to reset the application? This will permanently delete all local diagrams, settings, and cached state, and reload the page.
            </p>
        </Alert>
    );
};
