import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    setLoadDialogOpen,
    setPNGDialogOpen,
    setSaveAsDialogOpen,
    setLoginDialogOpen,
    setUserDialogOpen,
    setDiagramsDialogOpen,
    setAssetStoreDialogOpen
} from "../../redux/slices/dialogSlice";
import { PNGExportDialog } from "./PNGExportDialog";
import { LoadDiagramFileDialog } from "./LoadDiagramFileDialog";
import { LoginDialog } from "./LoginDialog";
import { UserDialog } from "../banner/UserDrawer";
import { DiagramsDialog } from "./DiagramsDialog";
import { AssetStoreDialog } from "./AssetStoreDialog";
import { SaveAsDialog } from "./SaveAsDialog";
import { WelcomeDialog } from "./WelcomeDialog";
import { UnsavedDiagramAlert } from "./UnsavedDiagramAlert";

export const GlobalDialogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        isPNGDialogOpen,
        isLoadDialogOpen,
        isSaveAsDialogOpen,
        isLoginDialogOpen,
        isUserDialogOpen,
        isDiagramsDialogOpen,
        isAssetStoreDialogOpen
    } = useAppSelector((state) => state.dialog);

    return (
        <>
            <WelcomeDialog></WelcomeDialog>

            <PNGExportDialog
                close={() => dispatch(setPNGDialogOpen(false))}
                isOpen={isPNGDialogOpen}
            />

            <LoadDiagramFileDialog
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

            <AssetStoreDialog
                isOpen={isAssetStoreDialogOpen}
                onClose={() => dispatch(setAssetStoreDialogOpen(false))}
            />

            <SaveAsDialog
                isOpen={isSaveAsDialogOpen}
                onClose={() => dispatch(setSaveAsDialogOpen(false))}
            />

            <UnsavedDiagramAlert />
        </>
    );
};
