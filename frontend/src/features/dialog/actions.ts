import { AppDispatch } from "../../redux/store";
import ENGINE from "../../logic/engine";
import { appToaster } from "../../app/Toaster";
import { saveDiagramFile } from "../../fileCreation/createDiagramFile";
import { saveDiagram } from "../../redux/thunks/diagramThunks";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { 
    setPNGDialogOpen, 
    setLoadDialogOpen, 
    setSaveAsDialogOpen, 
    setLoginDialogOpen, 
    setUserDialogOpen, 
    setDiagramsDialogOpen 
} from "../../redux/slices/dialogSlice";
import { saveAs } from "file-saver";

// --- Dialog Triggers ---

export const openPNGDialog = (dispatch: AppDispatch) => dispatch(setPNGDialogOpen(true));
export const openLoadDialog = (dispatch: AppDispatch) => dispatch(setLoadDialogOpen(true));
export const openSaveAsDialog = (dispatch: AppDispatch) => dispatch(setSaveAsDialogOpen(true));
export const openLoginDialog = (dispatch: AppDispatch) => dispatch(setLoginDialogOpen(true));
export const openUserDialog = (dispatch: AppDispatch) => dispatch(setUserDialogOpen(true));
export const openDiagramsDialog = (dispatch: AppDispatch) => dispatch(setDiagramsDialogOpen(true));

// --- Logic Handlers ---

export const handleNewDiagram = () => {
    ENGINE.resetDiagram();
};

export const handleSaveDiagram = (dispatch: AppDispatch) => {
    dispatch(saveDiagram(false));
};

export const handleExportDiagramFile = () => {
    saveDiagramFile();
    appToaster.show({
        message: "Diagram file downloaded",
        intent: "success"
    });
};

export const handleUndo = () => {
    if (ENGINE.handler.canUndo) {
        ENGINE.handler.undo();
    }
};

export const handleRedo = () => {
    if (ENGINE.handler.canRedo) {
        ENGINE.handler.redo();
    }
};

export const handleClearState = () => {
    ENGINE.clearState();
    appToaster.show({
        message: "State cleared from localStorage",
        intent: "success"
    });
};

export const handleCopyState = () => {
    const stateObject: IDiagram = ENGINE.handler.diagram.state;
    const stateString = JSON.stringify(stateObject, undefined, 4);
    navigator.clipboard.writeText(stateString);
    appToaster.show({
        message: "State copied to clipboard",
        intent: "success"
    });
};

export const handleDownloadState = () => {
    const stateObject: IDiagram = ENGINE.handler.diagram.state;
    const stateString = JSON.stringify(stateObject, undefined, 4);
    const blob = new Blob([stateString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "psi_state.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    appToaster.show({
        message: "State downloaded",
        intent: "success"
    });
};

export const handleSaveSVG = () => {
    try {
        const surface = ENGINE.surface;
        const svgClone = surface.clone(true, false);
        const hitboxElements = svgClone.find('[data-editor="hitbox"]');
        hitboxElements.forEach((element) => {
            element.remove();
        });
        const svgString = svgClone.svg();
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const fileName = ENGINE.currentImageName || `pulse-diagram-${Date.now()}.svg`;
        saveAs(blob, fileName);
        appToaster.show({
            message: `SVG saved successfully as ${fileName}`,
            intent: "success",
            icon: "tick-circle"
        });
    } catch (error) {
        console.error("Error saving SVG:", error);
        appToaster.show({
            message: `Failed to save SVG: ${error instanceof Error ? error.message : "Unknown error"}`,
            intent: "danger",
            icon: "error"
        });
    }
};

export const handleDebugIssue = () => {
    const stateObject: IDiagram = ENGINE.handler.diagram.state;
    const stateString = JSON.stringify(stateObject, undefined, 4);
    const blob = new Blob([stateString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "psi_debug_state.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const issueBody = `
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

(Preferable)
Load the attached state file 'psi_debug_state.json'

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Desktop (please complete the following information):**
 - OS: [e.g. Windows]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
`.trim();

    const issueUrl = `https://github.com/ProgramPhantom/PSI/issues/new?body=${encodeURIComponent(issueBody)}`;
    window.open(issueUrl, "_blank");
};
