import { createAsyncThunk } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";
import { appToaster } from "../../app/Toaster";
import { saveDiagramFile } from "../../fileCreation/createDiagramFile";
import ENGINE from "../../logic/engine";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { RootState } from "../rootReducer";
import { saveDiagram } from "./diagramThunks";
import { v4 as uuidv4 } from "uuid";
import { setDiagramUUID } from "../slices/diagramSlice";


// --- Logic Handlers ---

export const handleNewDiagram = createAsyncThunk(
    'actions/handleNewDiagram',
    async (_, thunkAPI) => {
        ENGINE.resetDiagram();
        const newUUID = uuidv4()

        thunkAPI.dispatch(setDiagramUUID(newUUID))

        appToaster.show({
            "message": "New diagram created",
            "intent": "success",
            "icon": "clean"
        })
    }
);

export const handleSaveDiagram = createAsyncThunk(
    'actions/handleSaveDiagram',
    async (_, { dispatch }) => {
        dispatch(saveDiagram(false) as any);
    }
);

export const handleExportDiagramFile = createAsyncThunk(
    'actions/handleExportDiagramFile',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const fileName = state.diagram.fileName;
        const UUID = state.diagram.diagramUUID

        if (UUID === undefined) {
            appToaster.show({
                "message": "No diagram loaded",
                "intent": "warning"
            })
            return
        }

        saveDiagramFile(fileName, UUID);

        appToaster.show({
            message: `Diagram file downloaded as ${fileName}.nmrd`,
            intent: "success"
        });
    }
);

export const handleUndo = createAsyncThunk(
    'actions/handleUndo',
    async () => {
        if (ENGINE.handler.canUndo) {
            ENGINE.handler.undo();
        }
    }
);

export const handleRedo = createAsyncThunk(
    'actions/handleRedo',
    async () => {
        if (ENGINE.handler.canRedo) {
            ENGINE.handler.redo();
        }
    }
);

export const handleClearState = createAsyncThunk(
    'actions/handleClearState',
    async () => {
        ENGINE.clearState();
        appToaster.show({
            message: "State cleared from localStorage",
            intent: "success"
        });
    }
);

export const handleCopyState = createAsyncThunk(
    'actions/handleCopyState',
    async () => {
        const stateObject: IDiagram = ENGINE.handler.diagram.state;
        const stateString = JSON.stringify(stateObject, undefined, 4);
        navigator.clipboard.writeText(stateString);
        appToaster.show({
            message: "State copied to clipboard",
            intent: "success"
        });
    }
);

export const handleDownloadState = createAsyncThunk(
    'actions/handleDownloadState',
    async () => {
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
    }
);

export const handleSaveSVG = createAsyncThunk(
    'actions/handleSaveSVG',
    async (_, { getState }) => {
        try {
            const state = getState() as RootState;
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
    }
);

export const handleDebugIssue = createAsyncThunk(
    'actions/handleDebugIssue',
    async () => {
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
    }
);

export const SavePNG = createAsyncThunk<void, { width: number, height: number }>(
    'actions/SavePNG',
    async (dimensions, { getState }) => {
        try {
            const width = dimensions.width;
            const height = dimensions.height;

            const state = getState() as RootState;
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
    }
);