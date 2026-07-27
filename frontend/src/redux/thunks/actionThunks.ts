import { createAsyncThunk } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";
import localforage from "localforage";
import { appToaster } from "../../app/Toaster";
import { saveDiagramFile } from "../../fileCreation/createDiagramFile";
import ENGINE from "../../logic/engine";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { ClearIDs } from "../../logic/collection";
import Visual, { IVisual } from "../../logic/visual";
import Channel from "../../logic/hasComponents/channel";
import { RootState } from "../rootReducer";
import { setNewDiagramAlertOpen, setUnsavedDiagramLogoutAlertOpen } from "../slices/dialogSlice";
import { setSelectedElementId } from "../slices/applicationSlice";
import { api } from "../api/api";
import { newDiagram, saveDiagram } from "./diagramThunks";
import { selectCurrentAuthor, selectCurrentFileName, selectCurrentInstitution } from "../selectors/diagramSelectors";

let inMemoryCopiedElementState: IVisual | null = null;

function canCopyElement(element: Visual): boolean {
    if (element.type === "channel" || element instanceof Channel) {
        appToaster.show({
            message: "Channels cannot be copied",
            intent: "warning"
        });
        return false;
    }
    return true;
}



// --- Logic Handlers ---

export const resetApp = createAsyncThunk(
    'actions/resetApp',
    async () => {
        localStorage.clear();
        await localforage.clear();
        window.location.reload();
    }
);

export const handleNewDiagram = createAsyncThunk(
    'actions/handleNewDiagram',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        if (state.diagram.saveState === 'unsaved') {
            dispatch(setNewDiagramAlertOpen(true));
        } else {
            dispatch(newDiagram());
        }
    }
);

export const handleSaveDiagram = createAsyncThunk(
    'actions/handleSaveDiagram',
    async (_, { dispatch }) => {
        dispatch(saveDiagram({}));
    }
);

export const logout = createAsyncThunk<void, boolean | void>(
    'actions/logout',

    async (force, { dispatch, getState }) => {
        const state = getState() as RootState;

        if (state.diagram.saveState === 'unsaved' && !force) {
            dispatch(setUnsavedDiagramLogoutAlertOpen(true));
            return;
        }

        try {
            await dispatch(api.endpoints.logoutUser.initiate()).unwrap();
            dispatch(newDiagram());
            appToaster.show({
                message: "Logged out",
                intent: "success"
            });
        } catch (error) {
            appToaster.show({
                message: "Failed to logout",
                intent: "danger"
            });
            console.error(error);
        }
    },

);

export const handleExportDiagramFile = createAsyncThunk(
    'actions/handleExportDiagramFile',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const fileName = selectCurrentFileName(state);
        const author = selectCurrentAuthor(state);
        const institution = selectCurrentInstitution(state);
        const UUID = state.diagram.diagramUUID

        if (UUID === undefined) {
            appToaster.show({
                "message": "No diagram loaded",
                "intent": "warning"
            })
            return
        }

        saveDiagramFile(fileName, {
            UUID: UUID,
            source: "local",
            diagramName: fileName,
            originalAuthor: author || undefined,
            institution: institution || undefined,
            dateCreated: new Date().toISOString()
        });

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

export const handleCopyElement = createAsyncThunk(
    'actions/handleCopyElement',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const selectedElementId = state.application.selectedElementId;
        if (!selectedElementId) return;

        const element = ENGINE.handler.identifyElement(selectedElementId);
        if (!element) return;

        if (!canCopyElement(element)) {
            return;
        }

        const stateObject: IVisual = element.state;
        inMemoryCopiedElementState = structuredClone(stateObject);

        const stateString = JSON.stringify(stateObject, undefined, 4);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(stateString).catch((err) => {
                console.warn("Could not write element to navigator.clipboard", err);
            });
        }

        appToaster.show({
            message: "Element copied to clipboard",
            intent: "success"
        });
    }
);

export const handlePasteElement = createAsyncThunk(
    'actions/handlePasteElement',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const isOverCanvas = state.application.isMouseOverCanvas;
        const mousePos = state.application.canvasMousePosition;

        const doPaste = (stateObject: IVisual) => {
            if (stateObject.type === "channel") {
                appToaster.show({
                    message: "Channels cannot be copied",
                    intent: "warning"
                });
                return;
            }

            const newElementState: IVisual = structuredClone(stateObject);
            ClearIDs(newElementState);

            let targetX: number;
            let targetY: number;

            if (isOverCanvas && mousePos) {
                targetX = mousePos.x;
                targetY = mousePos.y;
            } else {
                const baseX = typeof newElementState.x === "number" ? newElementState.x : 0;
                const baseY = typeof newElementState.y === "number" ? newElementState.y : 0;
                targetX = baseX + 20;
                targetY = baseY + 20;
            }

            newElementState.x = targetX;
            newElementState.y = targetY;
            newElementState.placementMode = {
                type: "free"
            };
            newElementState.parentId = ENGINE.handler.diagram.id;

            ENGINE.handler.act({
                type: "add",
                input: {
                    child: newElementState
                }
            });
        };

        if (navigator.clipboard && navigator.clipboard.readText) {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const parsed = JSON.parse(text);
                    if (parsed && typeof parsed === "object" && parsed.type && parsed.type !== "diagram" && parsed.type !== "channel") {
                        doPaste(parsed);
                        return;
                    }
                }
            } catch {
                // Ignore reading clipboard error, fall back below
            }
        }

        if (inMemoryCopiedElementState && inMemoryCopiedElementState.type !== "channel") {
            doPaste(inMemoryCopiedElementState);
        }
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
            const fileNameFromRedux = selectCurrentFileName(state);

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

export const handleReportBugEmail = createAsyncThunk(
    'actions/handleReportBugEmail',
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

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const subject = `PSI Bug Report - ${timestamp}`;

        const emailBody = `
Dear Henry,

Please fill in the bug report details below:

**Describe the bug**
[A description of what the bug is]

**To Reproduce**
Steps to reproduce the behavior :
1. Add '...'
2. change '...'
3. Scroll down to '...'
4. See error
(Example)

**Expected behavior**
[A description of what you expected to happen]

**State File**
[Please attach the downloaded 'psi_debug_state.json' file to this email]

**Desktop / System Information**
- User Agent: ${navigator.userAgent}
- Screen: ${window.screen.width}x${window.screen.height}
- URL: ${window.location.href}
`.trim();

        const mailtoUrl = `mailto:henry.varley@manchester.ac.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoUrl;
    }
);

export const SavePNG = createAsyncThunk<void, { width: number, height: number }>(
    'actions/SavePNG',
    async (dimensions, { getState }) => {
        try {
            const width = dimensions.width;
            const height = dimensions.height;

            const state = getState() as RootState;
            const fileName = selectCurrentFileName(state);

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