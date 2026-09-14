import { Button, Position, Tooltip } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleColumnMode } from "../../redux/slices/applicationSlice";
import styles from "./styles/OverlaySelector.module.scss";

export const ColumnModeButton: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const columnMode = useAppSelector((state) => state.application.columnMode);

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <Tooltip hoverOpenDelay={1000} content="Toggle Column Mode (Alt+C)" position={Position.BOTTOM}>
                <Button
                    className={`${styles["column-mode-button"]} ${columnMode ? styles["active"] : ""}`}
                    icon="column-layout"
                    text="Columns"
                    onClick={() => dispatch(toggleColumnMode())}
                    variant="minimal"
                />
            </Tooltip>
        </div>
    );
});

export default ColumnModeButton;
