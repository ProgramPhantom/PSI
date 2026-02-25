
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { GoogleLogin } from "@react-oauth/google";
import { useLoginUserMutation } from "../../redux/api/api";

export interface ILoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginDialog(props: ILoginDialogProps) {
    const [loginUserMutation] = useLoginUserMutation();

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
                            loginUserMutation(credentialResponse).then((response) => {
                                if ('error' in response) {
                                    //TODO show failiure banner?
                                    console.log(response.error)
                                    return
                                }
                                console.log(response.data?.message)
                            }
                            )
                        }}
                        onError={() => { console.log("Login failed") }}
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
