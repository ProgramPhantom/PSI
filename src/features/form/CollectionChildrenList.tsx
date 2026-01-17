import { Button } from "@blueprintjs/core";
import React from "react";
import Collection from "../../logic/collection";
import Visual from "../../logic/visual";
import FormDivider from "./FormDivider";
import { ID, AllComponentTypes } from "../../logic/point";
import { IconName } from "@blueprintjs/core";

interface CollectionChildrenListProps {
    target: Collection;
    changeTarget: (val: Visual | undefined) => void;
}

const ChildIcons: Partial<Record<AllComponentTypes, IconName>> = {
    "svg": "draw",
    "rect": "square",
    "space": "maximize",
    "label-group": "tag",
    "label": "tag",
    "text": "font",
    "line": "slash",
    "channel": "git-merge",
    "sequence-aligner": "sort",
    "sequence": "series-add",
    "diagram": "diagram-tree",
    "aligner": "alignment-left",
    "collection": "layers",
    "lower-abstract": "selection",
    "visual": "eye-open",
    "grid": "grid"
};

export const CollectionChildrenList: React.FC<CollectionChildrenListProps> = ({ target, changeTarget }) => {
    const displayedIds = new Set<ID>();
    const roleElements: React.ReactNode[] = [];

    // Process roles
    Object.entries(target.roles).forEach(([roleName, roleData]) => {
        if (roleData.object) {
            displayedIds.add(roleData.object.id);
            roleElements.push(
                <React.Fragment key={roleName}>

                    <Button
                        alignText="left"
                        text={roleData.object.ref || roleName}
                        icon={ChildIcons[roleData.object.type] || "cube"}
                        fill={true}
                        onClick={() => changeTarget(roleData.object)}
                    />
                </React.Fragment>
            );
        }
    });

    // Process remaining children
    const remainingChildren = target.children.filter(child => !displayedIds.has(child.id));

    return (
        <div style={{ padding: "0px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <FormDivider title={"Components"} topMargin={0} />
            {roleElements}

            {remainingChildren.length > 0 && (
                <>
                    <FormDivider title="Children" />
                    {remainingChildren.map((child, index) => (
                        <Button
                            alignText="left"
                            key={child.id}
                            text={child.ref || `Child ${index + 1}`}
                            icon={ChildIcons[child.type] || "cube"}
                            fill={true}
                            onClick={() => changeTarget(child)}
                        />
                    ))}
                </>
            )}
        </div>
    );
};
