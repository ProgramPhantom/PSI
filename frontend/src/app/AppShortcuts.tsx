import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";
import React, { useCallback, useMemo } from "react";
import Collection from "../logic/collection";
import ENGINE from "../logic/engine";
import { IVisual } from "../logic/visual";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedElementId } from "../redux/slices/applicationSlice";
import { setDebugLayerDialogOpen, setLoadDialogOpen, setPNGDialogOpen, setSaveAsDialogOpen } from "../redux/slices/dialogSlice";
import * as Actions from "../redux/thunks/actionThunks";

export const AppShortcuts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const selectedElementId = useAppSelector((state) => state.application.selectedElementId);
    const isDebugLayerDialogOpen = useAppSelector((state) => state.dialog.isDebugLayerDialogOpen);

    const selectedElement = useMemo(() => ENGINE.handler.identifyElement(selectedElementId ?? ""), [selectedElementId]);

    const handleNudge = useCallback((e: KeyboardEvent, dx: number, dy: number) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
        }

        if (!selectedElementId) return;
        const element = ENGINE.handler.identifyElement(selectedElementId);
        if (!element) return;

        const isCollection = Collection.isCollection(element) || Collection.isICollection(element.state);

        if (element.placementMode.type === "free") {
            const newState: IVisual = {
                ...element.state,
                x: element.x + dx,
                y: element.y + dy
            };
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
    }, [selectedElementId]);

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
                label: "Delete selected element",
                onKeyDown: () => {
                    if (selectedElement) {
                        ENGINE.handler.act({
                            type: "remove",
                            input: {
                                child: selectedElement
                            }
                        });
                        dispatch(setSelectedElementId(undefined));
                    }
                },
                preventDefault: true
            },
            {
                combo: "backspace",
                global: true,
                label: "Delete selected element",
                onKeyDown: () => {
                    if (selectedElement) {
                        ENGINE.handler.act({
                            type: "remove",
                            input: {
                                child: selectedElement
                            }
                        });
                        dispatch(setSelectedElementId(undefined));
                    }
                },
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
                    dispatch(Actions.handleSaveSVG());
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
        ],
        [dispatch, handleNudge, handleResetOffset, isDebugLayerDialogOpen, selectedElement]
    );

    useHotkeys(hotkeys);

    return <>{children}</>;
};
