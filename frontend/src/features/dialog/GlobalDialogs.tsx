import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    setLoadDialogOpen,
    setPNGDialogOpen,
    setSaveAsDialogOpen,
    setLoginDialogOpen,
    setUserDialogOpen,
    setDiagramsDialogOpen
} from "../../redux/slices/dialogSlice";
import { PNGExportDialog } from "./PNGExportDialog";
import { LoadStateDialog } from "./LoadStateDialog";
import { LoginDialog } from "./LoginDialog";
import { UserDialog } from "../banner/UserDrawer";
import { DiagramsDialog } from "./DiagramsDialog";
import { SaveAsDialog } from "./SaveAsDialog";
import { WelcomeDialog } from "./WelcomeDialog";

export const GlobalDialogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        isPNGDialogOpen,
        isLoadDialogOpen,
        isSaveAsDialogOpen,
        isLoginDialogOpen,
        isUserDialogOpen,
        isDiagramsDialogOpen
    } = useAppSelector((state) => state.dialog);

    return (
        <>
            <WelcomeDialog></WelcomeDialog>

            <PNGExportDialog
                close={() => dispatch(setPNGDialogOpen(false))}
                isOpen={isPNGDialogOpen}
            />

            <LoadStateDialog
                close={() => dispatch(setLoadDialogOpen(false))}
                isOpen={isLoadDialogOpen}
            />

            <LoginDialog
                isOpen={isLoginDialogOpen}
                onClose={() => dispatch(setLoginDialogOpen(false))}
            />

            <UserDialog
                isOpen={isUserDialogOpen}
                onClose={() => dispatch(setUserDialogOpen(false))}
            />

            <DiagramsDialog
                isOpen={isDiagramsDialogOpen}
                onClose={() => dispatch(setDiagramsDialogOpen(false))}
            />

            <SaveAsDialog
                isOpen={isSaveAsDialogOpen}
                onClose={() => dispatch(setSaveAsDialogOpen(false))}
            />
        </>
    );
};
