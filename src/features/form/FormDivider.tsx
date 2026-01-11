import { Divider } from "@blueprintjs/core";

export default function FormDivider(props: { title: string, topMargin?: number }) {
    return (
        <>
            <div style={{ display: "flex", alignItems: "center", margin: `${props.topMargin ?? 16}px 0 8px 0` }}>
                <Divider style={{ width: "16px", margin: "0 8px 0 0", flexShrink: 0 }} />
                <div style={{ color: "#5C7080", fontSize: "12px" }}>{props.title}</div>
                <Divider style={{ flexGrow: 1, margin: "0 0 0 8px" }} />
            </div>
        </>
    );
}