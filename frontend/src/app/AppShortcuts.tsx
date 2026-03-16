import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";
import React, { useMemo } from "react";
import ENGINE from "../logic/engine";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedElementId } from "../redux/slices/applicationSlice";
import { setDebugLayerDialogOpen, setLoadDialogOpen, setPNGDialogOpen, setSaveAsDialogOpen } from "../redux/slices/dialogSlice";
import * as Actions from "../redux/thunks/actionThunks";

export const AppShortcuts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const selectedElementId = useAppSelector((state) => state.application.selectedElementId);
    const isDebugLayerDialogOpen = useAppSelector((state) => state.dialog.isDebugLayerDialogOpen);

    const selectedElement = useMemo(() => ENGINE.handler.identifyElement(selectedElementId ?? ""), [selectedElementId]);

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
                label: "Report bug",
                onKeyDown: () => {
                    dispatch(Actions.handleDebugIssue());
                },
                preventDefault: true
            },
        ],
        [dispatch, isDebugLayerDialogOpen, selectedElement, selectedElementId]
    );

    useHotkeys(hotkeys);

    return <>{children}</>;
};
