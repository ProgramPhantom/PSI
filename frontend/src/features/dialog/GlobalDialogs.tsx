import React, { Suspense } from "react";
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
import { UnsavedDiagramAlert } from "./UnsavedDiagramAlert";
import { UnsavedDiagramLogoutAlert } from "./UnsavedDiagramLogoutAlert";
import { ResetAppAlert } from "./ResetAppAlert";

const PNGExportDialog = React.lazy(() =>
    import("./PNGExportDialog").then((m) => ({ default: m.PNGExportDialog }))
);
const SVGExportDialog = React.lazy(() =>
    import("./SVGExportDialog").then((m) => ({ default: m.SVGExportDialog }))
);
const LoadDiagramFileDialog = React.lazy(() =>
    import("./LoadDiagramFileDialog").then((m) => ({ default: m.LoadDiagramFileDialog }))
);
const LoginDialog = React.lazy(() =>
    import("./LoginDialog").then((m) => ({ default: m.LoginDialog }))
);
const UserDialog = React.lazy(() =>
    import("../banner/UserDrawer").then((m) => ({ default: m.UserDialog }))
);
const DiagramsDialog = React.lazy(() =>
    import("./DiagramsDialog").then((m) => ({ default: m.DiagramsDialog }))
);
const AssetStoreDialog = React.lazy(() =>
    import("./AssetStoreDialog").then((m) => ({ default: m.AssetStoreDialog }))
);
const SaveAsDialog = React.lazy(() =>
    import("./SaveAsDialog").then((m) => ({ default: m.SaveAsDialog }))
);
const AboutDialog = React.lazy(() =>
    import("./AboutDialog").then((m) => ({ default: m.AboutDialog }))
);
const CiteDialog = React.lazy(() =>
    import("./CiteDialog").then((m) => ({ default: m.CiteDialog }))
);
const KeyboardShortcutsDialog = React.lazy(() =>
    import("./KeyboardShortcutsDialog").then((m) => ({ default: m.KeyboardShortcutsDialog }))
);

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
        <Suspense fallback={null}>
            {isPNGDialogOpen && (
                <PNGExportDialog
                    close={() => dispatch(setPNGDialogOpen(false))}
                    isOpen={isPNGDialogOpen}
                />
            )}

            {isSVGDialogOpen && (
                <SVGExportDialog
                    close={() => dispatch(setSVGDialogOpen(false))}
                    isOpen={isSVGDialogOpen}
                />
            )}

            {isLoadDialogOpen && (
                <LoadDiagramFileDialog
                    close={() => dispatch(setLoadDialogOpen(false))}
                    isOpen={isLoadDialogOpen}
                />
            )}

            {isLoginDialogOpen && (
                <LoginDialog
                    isOpen={isLoginDialogOpen}
                    onClose={() => dispatch(setLoginDialogOpen(false))}
                />
            )}

            {isUserDialogOpen && (
                <UserDialog
                    isOpen={isUserDialogOpen}
                    onClose={() => dispatch(setUserDialogOpen(false))}
                />
            )}

            {isDiagramsDialogOpen && (
                <DiagramsDialog
                    isOpen={isDiagramsDialogOpen}
                    onClose={() => dispatch(setDiagramsDialogOpen(false))}
                />
            )}

            {isAssetStoreDialogOpen && (
                <AssetStoreDialog
                    isOpen={isAssetStoreDialogOpen}
                    onClose={() => dispatch(setAssetStoreDialogOpen(false))}
                />
            )}

            {isSaveAsDialogOpen && (
                <SaveAsDialog
                    isOpen={isSaveAsDialogOpen}
                    onClose={() => dispatch(setSaveAsDialogOpen(false))}
                />
            )}

            {isAboutDialogOpen && (
                <AboutDialog
                    isOpen={isAboutDialogOpen}
                    onClose={() => dispatch(setAboutDialogOpen(false))}
                />
            )}

            {isCiteDialogOpen && (
                <CiteDialog
                    isOpen={isCiteDialogOpen}
                    onClose={() => dispatch(setCiteDialogOpen(false))}
                />
            )}

            {isKeyboardShortcutsDialogOpen && (
                <KeyboardShortcutsDialog
                    isOpen={isKeyboardShortcutsDialogOpen}
                    onClose={() => dispatch(setKeyboardShortcutsDialogOpen(false))}
                />
            )}

            <UnsavedDiagramAlert />
            <UnsavedDiagramLogoutAlert />
            <ResetAppAlert />
        </Suspense>
    );
};
