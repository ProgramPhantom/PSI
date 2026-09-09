import React, { useEffect, useState, ReactNode } from "react";
import { Icon } from "@blueprintjs/core";
import { appToaster } from "../app/Toaster";

export interface QuietUploadAreaProps {
    children: ReactNode;
    onDrop: (file: File, event?: React.DragEvent) => void;
    acceptExtension?: string; // e.g. ".nmrs"
    showOverlay?: boolean;
    shouldShowOverlay?: (e: DragEvent) => boolean;
}

const QuietUploadArea: React.FC<QuietUploadAreaProps> = ({ children, onDrop, acceptExtension, showOverlay = true, shouldShowOverlay }) => {
    const [isDraggingInWindow, setIsDraggingInWindow] = useState(false);
    const [isDirectlyOver, setIsDirectlyOver] = useState(false);

    useEffect(() => {
        if (!showOverlay) {
            return;
        }

        let dragCounter = 0;

        const handleDragEnter = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes("Files")) {
                if (shouldShowOverlay && !shouldShowOverlay(e)) {
                    return;
                }
                dragCounter++;
                setIsDraggingInWindow(true);
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes("Files")) {
                dragCounter--;
                if (dragCounter === 0) {
                    setIsDraggingInWindow(false);
                }
            }
        };

        const handleDrop = (e: DragEvent) => {
            dragCounter = 0;
            setIsDraggingInWindow(false);
            setIsDirectlyOver(false);
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDragEnd = () => {
            dragCounter = 0;
            setIsDraggingInWindow(false);
            setIsDirectlyOver(false);
        };

        window.addEventListener("dragenter", handleDragEnter);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("drop", handleDrop, true);
        window.addEventListener("dragend", handleDragEnd, true);
        window.addEventListener("mouseup", handleDragEnd, true);

        return () => {
            window.removeEventListener("dragenter", handleDragEnter);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("drop", handleDrop, true);
            window.removeEventListener("dragend", handleDragEnd, true);
            window.removeEventListener("mouseup", handleDragEnd, true);
        };
    }, [showOverlay, shouldShowOverlay]);

    const handleDropAreaDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingInWindow(false);
        setIsDirectlyOver(false);
        const files = Array.from(e.dataTransfer.files);

        if (files.length > 0) {
            const file = files[0];
            if (!acceptExtension || file.name.toLowerCase().endsWith(acceptExtension.toLowerCase())) {
                onDrop(file, e);
            } else {
                appToaster.show({
                    message: `Please upload a ${acceptExtension} file`,
                    intent: "warning"
                })
            }
        }
    };

    return (
        <div
            style={{ position: "relative", width: "100%", height: "100%" }}
            onDragOver={(e) => {
                // If overlay is disabled, allow dropping directly onto the container if files are dragged
                if (!showOverlay && e.dataTransfer?.types.includes("Files")) {
                    e.preventDefault();
                }
            }}
            onDrop={(e) => {
                if (!showOverlay) {
                    handleDropAreaDrop(e);
                }
            }}
        >
            {children}

            {showOverlay && (
                <div
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDragEnter={() => setIsDirectlyOver(true)}
                    onDragLeave={() => setIsDirectlyOver(false)}
                    onDrop={handleDropAreaDrop}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isDirectlyOver ? "rgba(180, 210, 255, 0.8)" : "rgba(240, 248, 255, 0.7)",
                        opacity: isDraggingInWindow ? 1 : 0,
                        pointerEvents: isDraggingInWindow ? "all" : "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        backdropFilter: "blur(2px)",
                        transition: "all 0.1s ease-in",
                    }}
                >
                    <div
                        style={{
                            padding: "32px 48px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            pointerEvents: "none"
                        }}
                    >
                        <Icon icon="upload" size={48} style={{ marginBottom: "16px", color: "#137cbd" }} />
                        <h2 style={{ color: "#137cbd", margin: 0 }}>Drop {acceptExtension} File Here</h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuietUploadArea;
