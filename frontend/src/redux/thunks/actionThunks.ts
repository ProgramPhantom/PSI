import { createAsyncThunk } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";
import localforage from "localforage";
import { appToaster } from "../../app/Toaster";
import { saveDiagramFile } from "../../fileCreation/createDiagramFile";
import ENGINE from "../../logic/engine";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { ClearIDs } from "../../logic/collection";
import Visual, { IVisual } from "../../logic/visual";
import LineLike, { ILineLike, isLineLike } from "../../logic/lineLike";
import Channel from "../../logic/hasComponents/channel";
import { RootState } from "../rootReducer";
import { setNewDiagramAlertOpen, setUnsavedDiagramLogoutAlertOpen } from "../slices/dialogSlice";
import { setSelectedElementId, setSelectedElementIds, selectSelectedElementId, clearSelection } from "../slices/applicationSlice";
import { api } from "../api/api";
import { newDiagram, saveDiagram } from "./diagramThunks";
import { selectCurrentAuthor, selectCurrentFileName, selectCurrentInstitution } from "../selectors/diagramSelectors";
import { determineBindingPlacementModeType, isGridBindingRule } from "../../logic/bindingUtil";
import { IPlacementBindingRule, ISequenceBindingRule } from "../../logic/spacial";

export interface CopiedElementsPayload {
    version: 1;
    type: "psi/elements";
    elements: IVisual[];
}

let inMemoryCopiedElements: IVisual[] | null = null;
let inMemoryCopiedElementState: IVisual | null = null;

function canCopyElement(element: Visual): boolean {
    if (element.type === "channel" || element instanceof Channel) {
        return false;
    }
    if (element.type === "diagram" || element.type === "sequence-aligner" || element.type === "sequence") {
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
        const selectedElementIds = state.application.selectedElementIds;
        if (!selectedElementIds || selectedElementIds.length === 0) return;

        const rawElements = selectedElementIds
            .map((id) => ENGINE.handler.identifyElement(id))
            .filter((el): el is Visual => el !== undefined);

        if (rawElements.length === 0) return;

        const copyableElements = rawElements.filter(canCopyElement);
        if (copyableElements.length === 0) {
            if (rawElements.some((el) => el.type === "channel" || el instanceof Channel)) {
                appToaster.show({
                    message: "Channels cannot be copied",
                    intent: "warning"
                });
            }
            return;
        }

        const stateObjects: IVisual[] = copyableElements.map((el) => structuredClone(el.state));
        inMemoryCopiedElements = stateObjects;
        inMemoryCopiedElementState = stateObjects[0] ?? null;

        let stateString: string;
        if (stateObjects.length === 1) {
            stateString = JSON.stringify(stateObjects[0], undefined, 4);
        } else {
            const payload: CopiedElementsPayload = {
                version: 1,
                type: "psi/elements",
                elements: stateObjects
            };
            stateString = JSON.stringify(payload, undefined, 4);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(stateString).catch((err) => {
                console.warn("Could not write element(s) to navigator.clipboard", err);
            });
        }

        appToaster.show({
            message: stateObjects.length === 1 ? "Element copied to clipboard" : `${stateObjects.length} elements copied to clipboard`,
            intent: "success",
            timeout: 1000
        });
    }
);

export const deleteSelectedElements = createAsyncThunk<void, string[] | void>(
    'actions/deleteSelectedElements',
    async (targetIds, { dispatch, getState }) => {
        const state = getState() as RootState;
        const ids = targetIds ?? state.application.selectedElementIds;
        if (!ids || ids.length === 0) return;

        const elements = ids
            .map((id) => ENGINE.handler.identifyElement(id))
            .filter((el): el is Visual => el !== undefined && el.parentId !== undefined);

        if (elements.length === 0) return;

        if (elements.length === 1) {
            const el = elements[0];
            ENGINE.handler.act({
                type: "remove",
                input: {
                    child: el
                }
            });
            appToaster.show({
                message: `Deleted element '${el.ref || el.id}'`,
                intent: "danger",
                timeout: 1000
            });
        } else {
            const batchItems = elements.map((el) => ({
                type: "remove" as const,
                input: {
                    child: el
                }
            }));
            ENGINE.handler.act({
                type: "batch",
                input: batchItems
            });
            appToaster.show({
                message: `Deleted ${elements.length} elements`,
                intent: "danger",
                timeout: 1000
            });
        }

        dispatch(clearSelection());
    }
);

export const handlePasteElement = createAsyncThunk(
    'actions/handlePasteElement',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const isOverCanvas = state.application.isMouseOverCanvas;
        const mousePos = state.application.canvasMousePosition;

        const parseClipboardText = (text: string): IVisual[] | null => {
            try {
                const parsed = JSON.parse(text);
                if (!parsed || typeof parsed !== "object") return null;

                if (parsed.type === "psi/elements" && Array.isArray(parsed.elements)) {
                    return parsed.elements.filter(
                        (el: any) => el && typeof el === "object" && el.type !== "channel" && el.type !== "diagram"
                    );
                }
                if (Array.isArray(parsed)) {
                    return parsed.filter(
                        (el: any) => el && typeof el === "object" && el.type !== "channel" && el.type !== "diagram"
                    );
                }
                if (parsed.type && parsed.type !== "channel" && parsed.type !== "diagram") {
                    return [parsed];
                }
            } catch {
                return null;
            }
            return null;
        };

        const doPaste = (elementsToPaste: IVisual[]) => {
            if (!elementsToPaste || elementsToPaste.length === 0) return;

            // Compute collective bounding box origin (minX, minY)
            let minX = Infinity;
            let minY = Infinity;
            for (const el of elementsToPaste) {
                if (isLineLike(el)) {
                    minX = Math.min(minX, el.x ?? 0, el.startX ?? 0, el.endX ?? 0);
                    minY = Math.min(minY, el.y ?? 0, el.startY ?? 0, el.endY ?? 0);
                } else {
                    minX = Math.min(minX, el.x ?? 0);
                    minY = Math.min(minY, el.y ?? 0);
                }
            }
            if (!isFinite(minX)) minX = 0;
            if (!isFinite(minY)) minY = 0;

            let deltaX: number;
            let deltaY: number;

            if (isOverCanvas && mousePos) {
                deltaX = mousePos.x - minX;
                deltaY = mousePos.y - minY;
            } else {
                deltaX = 20;
                deltaY = 20;
            }

            // Deep clone, assign new IDs, shift positions, and prepare idMap for peer bindings
            const idMap = new Map<string, string>();
            const preparedElements: IVisual[] = elementsToPaste.map((el) => {
                const cloned = structuredClone(el);
                const oldId = cloned.id;
                ClearIDs(cloned);
                const newId = Math.random().toString(16).slice(2);
                cloned.id = newId;
                if (oldId) {
                    idMap.set(oldId, newId);
                }
                cloned.ref = `${cloned.type || "element"}-${Date.now().toString(36)}-${newId.slice(0, 4)}`;
                cloned.parentId = ENGINE.handler.diagram.id;
                cloned.placementControl = "user";

                if (isLineLike(cloned)) {
                    cloned.startX = (cloned.startX ?? 0) + deltaX;
                    cloned.startY = (cloned.startY ?? 0) + deltaY;
                    cloned.endX = (cloned.endX ?? 0) + deltaX;
                    cloned.endY = (cloned.endY ?? 0) + deltaY;
                    cloned.x = (cloned.x ?? 0) + deltaX;
                    cloned.y = (cloned.y ?? 0) + deltaY;
                } else {
                    cloned.x = (cloned.x ?? 0) + deltaX;
                    cloned.y = (cloned.y ?? 0) + deltaY;
                }
                return cloned;
            });

            // Remap peer bindings within the copied group, reset external bindings to free
            for (const el of preparedElements) {
                if (el.placementMode?.type === "binds" || el.placementMode?.type === "sequenceBind") {
                    const rules = el.placementMode.config as ISequenceBindingRule[] | undefined;
                    if (rules && Array.isArray(rules)) {
                        const updatedRules: ISequenceBindingRule[] = [];
                        for (const rule of rules) {
                            if (isGridBindingRule(rule)) {
                                updatedRules.push(rule);
                            } else {
                                const anchorId = rule.targetId || rule.anchorId;
                                if (anchorId && idMap.has(anchorId)) {
                                    const remappedRule: IPlacementBindingRule = {
                                        ...rule,
                                        targetId: idMap.get(rule.targetId) ?? rule.targetId,
                                        ...(rule.anchorId && idMap.has(rule.anchorId)
                                            ? { anchorId: idMap.get(rule.anchorId) }
                                            : {})
                                    };
                                    updatedRules.push(remappedRule);
                                }
                            }
                        }
                        el.placementMode = determineBindingPlacementModeType(updatedRules);
                    } else {
                        el.placementMode = { type: "free" };
                    }
                } else {
                    el.placementMode = { type: "free" };
                }
            }

            if (preparedElements.length === 1) {
                ENGINE.handler.act({
                    type: "add",
                    input: {
                        child: preparedElements[0]
                    }
                });
            } else {
                ENGINE.handler.act({
                    type: "batch",
                    input: preparedElements.map((child) => ({
                        type: "add",
                        input: { child }
                    }))
                });
            }

            const newIds = preparedElements.map((el) => el.id).filter((id): id is string => Boolean(id));
            dispatch(setSelectedElementIds(newIds));

            appToaster.show({
                message: preparedElements.length === 1 ? "Element pasted" : `Pasted ${preparedElements.length} elements`,
                intent: "success",
                timeout: 1000
            });
        };

        if (navigator.clipboard && navigator.clipboard.readText) {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const parsedElements = parseClipboardText(text);
                    if (parsedElements && parsedElements.length > 0) {
                        doPaste(parsedElements);
                        return;
                    }
                }
            } catch {
                // Ignore reading clipboard error, fall back below
            }
        }

        if (inMemoryCopiedElements && inMemoryCopiedElements.length > 0) {
            doPaste(inMemoryCopiedElements);
        } else if (inMemoryCopiedElementState && inMemoryCopiedElementState.type !== "channel") {
            doPaste([inMemoryCopiedElementState]);
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

function unrollSVGUseElements(doc: Document) {
    const useElements = Array.from(doc.querySelectorAll("use"));

    useElements.forEach((useEl) => {
        const href = useEl.getAttribute("href") || useEl.getAttribute("xlink:href");
        if (!href || !href.startsWith("#")) return;

        const targetId = href.slice(1);
        const targetEl = doc.getElementById(targetId);
        if (!targetEl) return;

        // Clone target element
        const clone = targetEl.cloneNode(true) as Element;
        clone.removeAttribute("id"); // Avoid ID conflicts

        // Extract positional and transform attributes from <use>
        const x = parseFloat(useEl.getAttribute("x") || "0");
        const y = parseFloat(useEl.getAttribute("y") || "0");
        const useTransform = useEl.getAttribute("transform");
        const targetTransform = clone.getAttribute("transform");

        // Build combined transform list
        const transforms: string[] = [];
        if (x !== 0 || y !== 0) {
            transforms.push(`translate(${x}, ${y})`);
        }
        if (useTransform) {
            transforms.push(useTransform);
        }
        if (targetTransform) {
            transforms.push(targetTransform);
        }

        if (transforms.length > 0) {
            clone.setAttribute("transform", transforms.join(" "));
        }

        // Copy fill/stroke/style if present on <use>
        ["fill", "stroke", "style", "class"].forEach((attr) => {
            if (useEl.hasAttribute(attr) && !clone.hasAttribute(attr)) {
                clone.setAttribute(attr, useEl.getAttribute(attr)!);
            }
        });

        // Replace <use> with clone
        useEl.parentNode?.replaceChild(clone, useEl);
    });
}

function flattenNestedSVGElements(doc: Document) {
    const rootSvg = doc.querySelector("svg");
    if (!rootSvg) return;

    // Get all nested <svg> elements (excluding the root document <svg>)
    const allSvgs = Array.from(doc.querySelectorAll("svg"));
    const nestedSvgs = allSvgs.filter((el) => el !== rootSvg);

    nestedSvgs.forEach((svgEl) => {
        const xStr = svgEl.getAttribute("x") || "0";
        const yStr = svgEl.getAttribute("y") || "0";
        const x = parseFloat(xStr) || 0;
        const y = parseFloat(yStr) || 0;

        const wStr = svgEl.getAttribute("width");
        const hStr = svgEl.getAttribute("height");
        const width = wStr ? parseFloat(wStr) : NaN;
        const height = hStr ? parseFloat(hStr) : NaN;

        const viewBox = svgEl.getAttribute("viewBox");

        const gEl = doc.createElementNS("http://www.w3.org/2000/svg", "g");

        // Copy all attributes except positioning/viewBox attributes
        Array.from(svgEl.attributes).forEach((attr) => {
            const attrName = attr.name.toLowerCase();
            if (!["x", "y", "width", "height", "viewbox", "xmlns", "xmlns:xlink", "version"].includes(attrName)) {
                gEl.setAttribute(attr.name, attr.value);
            }
        });

        const transforms: string[] = [];

        if (viewBox) {
            const vbParts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
            if (vbParts.length === 4 && !vbParts.some(isNaN)) {
                const [vbX, vbY, vbW, vbH] = vbParts;
                let scaleX = 1;
                let scaleY = 1;

                if (!isNaN(width) && vbW > 0) {
                    scaleX = width / vbW;
                }
                if (!isNaN(height) && vbH > 0) {
                    scaleY = height / vbH;
                } else if (!isNaN(width) && vbW > 0) {
                    scaleY = scaleX;
                } else if (!isNaN(height) && vbH > 0 && isNaN(width)) {
                    scaleX = scaleY;
                }

                transforms.push(`translate(${x}, ${y})`);
                transforms.push(`scale(${scaleX}, ${scaleY})`);
                if (vbX !== 0 || vbY !== 0) {
                    transforms.push(`translate(${-vbX}, ${-vbY})`);
                }
            } else if (x !== 0 || y !== 0) {
                transforms.push(`translate(${x}, ${y})`);
            }
        } else if (x !== 0 || y !== 0) {
            transforms.push(`translate(${x}, ${y})`);
        }

        const existingTransform = gEl.getAttribute("transform");
        if (existingTransform) {
            transforms.push(existingTransform);
        }

        if (transforms.length > 0) {
            gEl.setAttribute("transform", transforms.join(" "));
        }

        // Move all children from svgEl to gEl
        while (svgEl.firstChild) {
            gEl.appendChild(svgEl.firstChild);
        }

        // Replace nested <svg> with <g>
        svgEl.parentNode?.replaceChild(gEl, svgEl);
    });
}

export interface SaveSVGOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    fileName?: string;
}

export const handleSaveSVG = createAsyncThunk<void, SaveSVGOptions | void>(
    'actions/handleSaveSVG',
    async (options, { getState }) => {
        try {
            const state = getState() as RootState;
            const defaultName = selectCurrentFileName(state);
            const rawName = options?.fileName?.trim() || defaultName || "pulse-diagram";
            const fileName = rawName.endsWith(".svg") ? rawName : `${rawName}.svg`;

            const surface = ENGINE.surface;
            const svgClone = surface.clone(true, false);
            const hitboxElements = svgClone.find('[data-editor="hitbox"]');
            hitboxElements.forEach((element) => {
                element.remove();
            });

            const svgString = svgClone.svg();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgString, "image/svg+xml");
            const svgEl = doc.querySelector("svg");

            if (svgEl) {
                // 1. Dereference / unroll all <use> tags for vector editor compatibility
                unrollSVGUseElements(doc);

                // 2. Flatten nested <svg> elements into <g transform="..."> for Figma / Illustrator / Inkscape compatibility
                flattenNestedSVGElements(doc);

                // 3. Add background fill if requested
                if (options?.backgroundColor && options.backgroundColor !== "transparent") {
                    const viewBoxAttr = svgEl.getAttribute("viewBox");
                    let bgX = ENGINE.handler.diagram?.x ?? 0;
                    let bgY = ENGINE.handler.diagram?.y ?? 0;
                    let bgW = ENGINE.handler.diagram?.width ?? 800;
                    let bgH = ENGINE.handler.diagram?.height ?? 600;

                    if (viewBoxAttr) {
                        const vbParts = viewBoxAttr.trim().split(/[\s,]+/).map(parseFloat);
                        if (vbParts.length === 4 && !vbParts.some(isNaN)) {
                            bgX = vbParts[0];
                            bgY = vbParts[1];
                            bgW = vbParts[2];
                            bgH = vbParts[3];
                        }
                    }

                    const bgRect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
                    bgRect.setAttribute("x", `${bgX}`);
                    bgRect.setAttribute("y", `${bgY}`);
                    bgRect.setAttribute("width", `${bgW}`);
                    bgRect.setAttribute("height", `${bgH}`);
                    bgRect.setAttribute("fill", options.backgroundColor);
                    if (svgEl.firstChild) {
                        svgEl.insertBefore(bgRect, svgEl.firstChild);
                    } else {
                        svgEl.appendChild(bgRect);
                    }
                }

                // Adjust dimensions if specified
                if (options?.width && options.width > 0) {
                    const currentW = ENGINE.handler.diagram?.width || 800;
                    const currentH = ENGINE.handler.diagram?.height || 600;
                    const ratio = currentW / currentH;
                    const targetW = options.width;
                    const targetH = options.height || Math.round(targetW / ratio);

                    svgEl.setAttribute("width", `${targetW}px`);
                    svgEl.setAttribute("height", `${targetH}px`);
                }
            }

            const serializer = new XMLSerializer();
            const finalSvgString = svgEl ? serializer.serializeToString(doc) : svgString;
            const blob = new Blob([finalSvgString], { type: "image/svg+xml;charset=utf-8" });

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

export const SavePNG = createAsyncThunk<void, { width: number, height: number, fileName?: string }>(
    'actions/SavePNG',
    async (dimensions, { getState }) => {
        try {
            const width = dimensions.width;
            const height = dimensions.height;

            const state = getState() as RootState;
            const defaultName = selectCurrentFileName(state);
            const rawFileName = dimensions.fileName?.trim() || defaultName || "pulse-diagram";
            const exportFileName = rawFileName.endsWith(".png") ? rawFileName : `${rawFileName}.png`;

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
                            saveAs(blob, exportFileName);

                            // Show success message
                            appToaster.show({
                                message: `PNG saved successfully as ${exportFileName}`,
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