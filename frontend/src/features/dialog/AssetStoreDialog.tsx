import { Button, Dialog, DialogBody, DialogFooter, HTMLTable, Icon, IconName, NonIdealState, Tooltip } from "@blueprintjs/core";
import { useSelector } from "react-redux";
import { selectAssets } from "../../redux/slices/assetSlice";

export interface IAssetStoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ICONS: Record<string, IconName> = {
    "builtin": "target",
    "server": "cloud",
    "local": "geofence",
    "diagram": "draw"
}

export function AssetStoreDialog(props: IAssetStoreDialogProps) {
    const assets = useSelector(selectAssets);
    const assetList = Object.values(assets);


    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Asset Store"
            style={{ width: "800px", height: "600px" }}
        >
            <DialogBody style={{ padding: "8px", overflowY: "auto" }}>
                {assetList.length > 0 ? (
                    <HTMLTable bordered striped style={{ width: "100%" }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--pt-app-background-color, #fff)" }}>
                            <tr>
                                <th>Reference</th>
                                <th>Id</th>
                                <th>Size</th>
                                <th style={{ width: "40px" }}></th>
                                <th style={{ width: "40px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {assetList.map((asset) => (
                                <tr key={asset.id}>
                                    <td style={{ paddingTop: 4, paddingBottom: 4 }}>{asset.reference}</td>
                                    <td style={{ paddingTop: 4, paddingBottom: 4 }}>{asset.id}</td>
                                    <td style={{ paddingTop: 4, paddingBottom: 4 }}>{asset.size}</td>
                                    <td style={{ paddingTop: 4, paddingBottom: 4, textAlign: "center" }}>
                                        <Tooltip content={asset.source}
                                            placement="bottom"
                                        >
                                            <Icon icon={ICONS[asset.source]} size={16} style={{ cursor: "help" }} />
                                        </Tooltip>
                                    </td>
                                    <td style={{ paddingTop: 4, paddingBottom: 4, textAlign: "center" }}>
                                        <Tooltip
                                            content={
                                                <div>
                                                    <strong>Dependants:</strong>
                                                    <br />
                                                    {asset.dependents.length > 0
                                                        ? asset.dependents.join(", ")
                                                        : "None"}
                                                </div>
                                            }
                                            placement="bottom"
                                        >
                                            <Icon icon={"info-sign"} size={16} style={{ cursor: "help" }} />
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </HTMLTable>
                ) : (
                    <NonIdealState
                        description="No assets loaded in the store."
                        icon="database"
                    />
                )}
            </DialogBody>
            <DialogFooter
                actions={
                    <Button text="Close" onClick={props.onClose} />
                }
            />
        </Dialog>
    );
}
