import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    setLoadDialogOpen,
    setPNGDialogOpen,
    setSVGDialogOpen,
    setSaveAsDialogOpen,
    setLoginDialogOpen,
    setUserDialogOpen,
    setDiagramsDialogOpen,
    setAssetStoreDialogOpen,
    setAboutDialogOpen,
    setCiteDialogOpen,
    setKeyboardShortcutsDialogOpen
} from "../../redux/slices/dialogSlice";
import { PNGExportDialog } from "./PNGExportDialog";
import { SVGExportDialog } from "./SVGExportDialog";
import { LoadDiagramFileDialog } from "./LoadDiagramFileDialog";
import { LoginDialog } from "./LoginDialog";
import { UserDialog } from "../banner/UserDrawer";
import { DiagramsDialog } from "./DiagramsDialog";
import { AssetStoreDialog } from "./AssetStoreDialog";
import { SaveAsDialog } from "./SaveAsDialog";
import { UnsavedDiagramAlert } from "./UnsavedDiagramAlert";
import { UnsavedDiagramLogoutAlert } from "./UnsavedDiagramLogoutAlert";
import { ResetAppAlert } from "./ResetAppAlert";
import { AboutDialog } from "./AboutDialog";
import { CiteDialog } from "./CiteDialog";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";

export const GlobalDialogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        isPNGDialogOpen,
        isSVGDialogOpen,
        isLoadDialogOpen,
        isSaveAsDialogOpen,
        isLoginDialogOpen,
        isUserDialogOpen,
        isDiagramsDialogOpen,
        isAssetStoreDialogOpen,
        isAboutDialogOpen,
        isCiteDialogOpen,
        isKeyboardShortcutsDialogOpen
    } = useAppSelector((state) => state.dialog);

    return (
        <>

            <PNGExportDialog
                close={() => dispatch(setPNGDialogOpen(false))}
                isOpen={isPNGDialogOpen}
            />

            <SVGExportDialog
                close={() => dispatch(setSVGDialogOpen(false))}
                isOpen={isSVGDialogOpen}
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

            <AboutDialog
                isOpen={isAboutDialogOpen}
                onClose={() => dispatch(setAboutDialogOpen(false))}
            />

            <CiteDialog
                isOpen={isCiteDialogOpen}
                onClose={() => dispatch(setCiteDialogOpen(false))}
            />

            <KeyboardShortcutsDialog
                isOpen={isKeyboardShortcutsDialogOpen}
                onClose={() => dispatch(setKeyboardShortcutsDialogOpen(false))}
            />

            <UnsavedDiagramAlert />
            <UnsavedDiagramLogoutAlert />
            <ResetAppAlert />
        </>
    );
};
