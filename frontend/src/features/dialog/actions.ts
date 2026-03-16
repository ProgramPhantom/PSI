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
import { RootState } from "../../redux/rootReducer";

// --- Logic Handlers ---

export const handleNewDiagram = () => (dispatch: AppDispatch) => {
    ENGINE.resetDiagram();
};

export const handleSaveDiagram = () => (dispatch: AppDispatch) => {
    dispatch(saveDiagram(false));
};

export const handleExportDiagramFile = () => (dispatch: AppDispatch) => {
    saveDiagramFile();
    appToaster.show({
        message: "Diagram file downloaded",
        intent: "success"
    });
};

export const handleUndo = () => (dispatch: AppDispatch) => {
    if (ENGINE.handler.canUndo) {
        ENGINE.handler.undo();
    }
};

export const handleRedo = () => (dispatch: AppDispatch) => {
    if (ENGINE.handler.canRedo) {
        ENGINE.handler.redo();
    }
};

export const handleClearState = () => (dispatch: AppDispatch) => {
    ENGINE.clearState();
    appToaster.show({
        message: "State cleared from localStorage",
        intent: "success"
    });
};

export const handleCopyState = () => (dispatch: AppDispatch) => {
    const stateObject: IDiagram = ENGINE.handler.diagram.state;
    const stateString = JSON.stringify(stateObject, undefined, 4);
    navigator.clipboard.writeText(stateString);
    appToaster.show({
        message: "State copied to clipboard",
        intent: "success"
    });
};

export const handleDownloadState = () => (dispatch: AppDispatch) => {
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

export const handleSaveSVG = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        const state = getState();
        const fileNameFromRedux = state.diagram.fileName;

        const surface = ENGINE.surface;
        const svgClone = surface.clone(true, false);
        const hitboxElements = svgClone.find('[data-editor="hitbox"]');
        hitboxElements.forEach((element) => {
            element.remove();
        });
        const svgString = svgClone.svg();
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const fileName = fileNameFromRedux || `pulse-diagram-${Date.now()}.svg`;
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

export const handleDebugIssue = () => (dispatch: AppDispatch) => {
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


export const SavePNG = () => (dispatch: AppDispatch, getState: () => RootState, dimensions: { width: number, height: number }) => {
    try {
        const width = dimensions.width
        const height = dimensions.height

        const state = getState();
        const fileName = state.diagram.fileName;

        // Get the current SVG surface from the ENGINE
        const surface = ENGINE.surface;

        // Create a clone of the surface to avoid modifying the original
        const svgClone = surface.clone(true, false);

        // Remove all elements with data-editor="hitbox" attribute
        const hitboxElements = svgClone.find('[data-editor="hitbox"]');
        hitboxElements.forEach((element) => {
            element.remove();
        });

        // Get the SVG as a string
        const svgString = svgClone.svg();

        // Create a canvas element to convert SVG to PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Could not get canvas context");
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Create an image from the SVG
        const img = new Image();
        const svgBlob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8"
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            try {
                // Clear canvas and draw the image
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to blob and save
                canvas.toBlob((blob) => {
                    if (blob) {
                        saveAs(blob, fileName);

                        // Show success message
                        appToaster.show({
                            message: `PNG saved successfully as ${fileName}`,
                            intent: "success",
                            icon: "tick-circle"
                        });
                    } else {
                        throw new Error("Failed to create PNG blob");
                    }
                }, "image/png");

                // Clean up
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Error in PNG conversion:", error);
                URL.revokeObjectURL(url);

                appToaster.show({
                    message: `Failed to save PNG: ${error instanceof Error ? error.message : "Unknown error"}`,
                    intent: "danger",
                    icon: "error"
                });
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            throw new Error("Failed to load SVG image");
        };

        img.src = url;
    } catch (error) {
        console.error("Error saving PNG:", error);

        // Show error message
        appToaster.show({
            message: `Failed to save PNG: ${error instanceof Error ? error.message : "Unknown error"}`,
            intent: "danger",
            icon: "error"
        });
    }
};