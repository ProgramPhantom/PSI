import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";
import React, { useMemo } from "react";
import ENGINE from "../logic/engine";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedElementId } from "../redux/slices/applicationSlice";
import { setDebugLayerDialogOpen } from "../redux/slices/dialogSlice";

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
        ],
        [dispatch, isDebugLayerDialogOpen, selectedElement, selectedElementId]
    );

    useHotkeys(hotkeys);

    return <>{children}</>;
};
