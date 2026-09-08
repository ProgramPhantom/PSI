import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";
import React, { useCallback, useMemo } from "react";
import Collection from "../logic/collection";
import ENGINE from "../logic/engine";
import Visual, { IVisual } from "../logic/visual";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearSelection, setSelectedElementId, toggleColumnMode } from "../redux/slices/applicationSlice";
import { setDebugLayerDialogOpen, setLoadDialogOpen, setPNGDialogOpen, setSaveAsDialogOpen, setSVGDialogOpen } from "../redux/slices/dialogSlice";
import * as Actions from "../redux/thunks/actionThunks";
import { useSelectedElement, useSelectedElements } from "../hooks/useSelectedElements";

export const AppShortcuts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const isDebugLayerDialogOpen = useAppSelector((state) => state.dialog.isDebugLayerDialogOpen);

    const selectedElements = useSelectedElements();
    const selectedElement = useSelectedElement();
    const selectedElementId = selectedElement?.id;

    const handleNudge = useCallback((e: KeyboardEvent, dx: number, dy: number) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
        }

        if (selectedElements.length === 0) return;

        if (selectedElements.length === 1) {
            const element = selectedElements[0];
            const isCollection = Collection.isCollection(element) || Collection.isICollection(element.state);

            if (element.placementMode.type === "free") {
                const newState = element.getShiftedState(dx, dy);

                ENGINE.handler.act({
                    type: "modify",
                    input: {
                        target: element,
                        child: newState
                    }
                });
            } else {
                // Collections do not support offset positioning when not in free placement mode
                if (isCollection) {
                    return;
                }

                const [ox, oy] = element.offset ?? [0, 0];
                const newState: IVisual = {
                    ...element.state,
                    offset: [ox + dx, oy + dy]
                };
                ENGINE.handler.act({
                    type: "modify",
                    input: {
                        target: element,
                        child: newState
                    }
                });
            }
        } else {
            // Multi-element batch nudge
            const batchItems = selectedElements
                .filter((el) => el.placementMode.type === "free")
                .map((el) => {
                    const newState = el.getShiftedState(dx, dy);
                    return {
                        type: "modify" as const,
                        input: {
                            target: el,
                            child: newState
                        }
                    };
                });

            if (batchItems.length > 0) {
                ENGINE.handler.act({
                    type: "batch",
                    input: batchItems
                });
            }
        }
    }, [selectedElements]);

    const handleDelete = useCallback((e?: KeyboardEvent) => {
        const target = e?.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
        }
        dispatch(Actions.deleteSelectedElements());
    }, [dispatch]);

    const handleResetOffset = useCallback((e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
        }

        if (!selectedElementId) return;
        const element = ENGINE.handler.identifyElement(selectedElementId);
        if (!element) return;

        if (element.placementMode.type !== "free") {
            const isCollection = Collection.isCollection(element) || Collection.isICollection(element.state);
            if (isCollection) return;

            const [ox, oy] = element.offset ?? [0, 0];
            if (ox === 0 && oy === 0) return;

            const newState: IVisual = {
                ...element.state,
                offset: [0, 0]
            };

            ENGINE.handler.act({
                type: "modify",
                input: {
                    target: element,
                    child: newState
                }
            });
        }
    }, [selectedElementId]);

    const hotkeys: HotkeyConfig[] = useMemo<HotkeyConfig[]>(
        () => [
            {
                combo: "ctrl+d",
                global: true,
                label: "Open debug dialog",
                onKeyDown: () => {
                    dispatch(setDebugLayerDialogOpen(!isDebugLayerDialogOpen));
                },
                preventDefault: true
            },
            {
                combo: "delete",
                global: true,
                label: "Delete selected element(s)",
                onKeyDown: (e) => handleDelete(e),
                preventDefault: true
            },
            {
                combo: "backspace",
                global: true,
                label: "Delete selected element(s)",
                onKeyDown: (e) => handleDelete(e),
                preventDefault: true
            },
            {
                combo: "escape",
                global: true,
                label: "Clear selection",
                onKeyDown: () => dispatch(clearSelection()),
                preventDefault: true
            },
            {
                combo: "r",
                global: true,
                label: "Reset element offset",
                onKeyDown: (e) => handleResetOffset(e),
                preventDefault: true
            },
            {
                combo: "up",
                global: true,
                label: "Move element up",
                onKeyDown: (e) => handleNudge(e, 0, -1),
                preventDefault: true
            },
            {
                combo: "shift+up",
                global: true,
                label: "Move element up (large step)",
                onKeyDown: (e) => handleNudge(e, 0, -10),
                preventDefault: true
            },
            {
                combo: "down",
                global: true,
                label: "Move element down",
                onKeyDown: (e) => handleNudge(e, 0, 1),
                preventDefault: true
            },
            {
                combo: "shift+down",
                global: true,
                label: "Move element down (large step)",
                onKeyDown: (e) => handleNudge(e, 0, 10),
                preventDefault: true
            },
            {
                combo: "left",
                global: true,
                label: "Move element left",
                onKeyDown: (e) => handleNudge(e, -1, 0),
                preventDefault: true
            },
            {
                combo: "shift+left",
                global: true,
                label: "Move element left (large step)",
                onKeyDown: (e) => handleNudge(e, -10, 0),
                preventDefault: true
            },
            {
                combo: "right",
                global: true,
                label: "Move element right",
                onKeyDown: (e) => handleNudge(e, 1, 0),
                preventDefault: true
            },
            {
                combo: "shift+right",
                global: true,
                label: "Move element right (large step)",
                onKeyDown: (e) => handleNudge(e, 10, 0),
                preventDefault: true
            },
            {
                combo: "ctrl+z",
                global: true,
                label: "Undo",
                onKeyDown: () => {
                    if (ENGINE.handler.canUndo) {
                        ENGINE.handler.undo();
                    }
                },
                preventDefault: true
            },
            {
                combo: "ctrl+y",
                global: true,
                label: "Redo",
                onKeyDown: () => {
                    if (ENGINE.handler.canRedo) {
                        ENGINE.handler.redo();
                    }
                },
                preventDefault: true
            },
            {
                combo: "ctrl+n",
                global: true,
                label: "New",
                onKeyDown: () => {
                    dispatch(Actions.handleNewDiagram());
                },
                preventDefault: true
            },
            {
                combo: "ctrl+o",
                global: true,
                label: "Open",
                onKeyDown: () => {
                    dispatch(setLoadDialogOpen(true));
                },
                preventDefault: true
            },
            {
                combo: "ctrl+s",
                global: true,
                label: "Save",
                onKeyDown: () => {
                    dispatch(Actions.handleSaveDiagram());
                },
                preventDefault: true
            },
            {
                combo: "ctrl+shift+s",
                global: true,
                label: "Save As",
                onKeyDown: () => {
                    dispatch(setSaveAsDialogOpen(true));
                },
                preventDefault: true
            },
            {
                combo: "ctrl+c",
                global: true,
                label: "Copy selected element",
                onKeyDown: (e) => {
                    const target = e.target as HTMLElement | null;
                    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
                        return;
                    }
                    dispatch(Actions.handleCopyElement());
                },
                preventDefault: true
            },
            {
                combo: "ctrl+v",
                global: true,
                label: "Paste element",
                onKeyDown: (e) => {
                    const target = e.target as HTMLElement | null;
                    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
                        return;
                    }
                    dispatch(Actions.handlePasteElement());
                },
                preventDefault: true
            },
            {
                combo: "ctrl+shift+c",
                global: true,
                label: "Copy state",
                onKeyDown: () => {
                    dispatch(Actions.handleCopyState());
                },
                preventDefault: true
            },
            {
                combo: "shift+alt+s",
                global: true,
                label: "Export SVG",
                onKeyDown: () => {
                    dispatch(setSVGDialogOpen(true))
                },
                preventDefault: true
            },
            {
                combo: "ctrl+e",
                global: true,
                label: "Export PNG",
                onKeyDown: () => {
                    dispatch(setPNGDialogOpen(true));
                },
                preventDefault: true
            },
            {
                combo: "ctrl+alt+s",
                global: true,
                label: "Export .nmrd",
                onKeyDown: () => {
                    dispatch(Actions.handleExportDiagramFile());
                },
                preventDefault: true
            },
            {
                combo: "ctrl+b",
                global: true,
                label: "Report bug (Github)",
                onKeyDown: () => {
                    dispatch(Actions.handleDebugIssue());
                },
                preventDefault: true
            },
            {
                combo: "ctrl+alt+b",
                global: true,
                label: "Report bug (Email)",
                onKeyDown: () => {
                    dispatch(Actions.handleReportBugEmail());
                },
                preventDefault: true
            },
            {
                combo: "alt+c",
                global: true,
                label: "Toggle column mode",
                onKeyDown: () => {
                    dispatch(toggleColumnMode());
                },
                preventDefault: true
            },
        ],
        [dispatch, handleNudge, handleDelete, handleResetOffset, isDebugLayerDialogOpen, selectedElement]
    );

    useHotkeys(hotkeys);

    return <>{children}</>;
};
