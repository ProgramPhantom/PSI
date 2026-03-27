import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Card, Elevation, H4, Label, Drawer } from "@blueprintjs/core";
import { useGetMeQuery } from "../../redux/api/api";
import { useAppDispatch } from "../../redux/hooks";
import { logout } from "../../redux/thunks/actionThunks";

export interface IUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserDialog(props: IUserDialogProps) {
    const dispatch = useAppDispatch();
    const { data: user, isLoading, isError } = useGetMeQuery();

    const handleLogout = () => {
        dispatch(logout());
        props.onClose();
    };

    return (
        <Drawer
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="User Profile"
            icon="user" size="20%"
        >

            {isLoading && <div>Loading user profile...</div>}
            {isError && <div>Error loading user profile.</div>}
            {!isError && user && (
                <div style={{ padding: "10px" }}>
                    <Card elevation={Elevation.ONE} style={{ marginBottom: "20px", textAlign: "center" }}>
                        {user.picture && (
                            <img
                                src={user.picture}
                                alt="Profile"
                                style={{ borderRadius: "50%", width: "100px", height: "100px", marginBottom: "10px" }}
                            />
                        )}
                        <H4>{user.firstname} {user.surname}</H4>
                        <div className="bp5-text-muted">{user.email}</div>
                    </Card>

                    <FormGroup
                        label="First Name"
                        labelFor="firstname"
                    >
                        <InputGroup id="firstname" value={user.firstname} readOnly />
                    </FormGroup>

                    <FormGroup
                        label="Last Name"
                        labelFor="surname"
                    >
                        <InputGroup id="surname" value={(user.surname) || ""} readOnly />
                    </FormGroup>

                    <FormGroup
                        label="Email"
                        labelFor="email"
                    >
                        <InputGroup id="email" value={user.email || ""} readOnly />
                    </FormGroup>

                    <Button
                        intent="danger"
                        icon="log-out"
                        text="Logout"
                        onClick={handleLogout}
                        fill={true}
                        style={{ marginTop: "16px" }}
                    />
                </div>
            )}

        </Drawer>
    );
}
