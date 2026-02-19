
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { GoogleLogin } from "@react-oauth/google";
import {login} from '../../logic/login'

export interface ILoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginDialog(props: ILoginDialogProps) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Log in"
            style={{ width: "800px", height: "500px" }}
        >
            <DialogBody>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <GoogleLogin useOneTap={false} ux_mode="popup"
                        onSuccess={(credentialResponse) => {
                            login(credentialResponse)
                        }}
                        onError={() => {console.log("Login failed")}}
                        >
                    </GoogleLogin>
                </div>
            </DialogBody>
            <DialogFooter
                actions={
                    <Button
                        text="Cancel"
                        onClick={props.onClose}
                    />
                }
            />
        </Dialog>
    );
}
