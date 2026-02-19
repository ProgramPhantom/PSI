import {Button, Dialog, DialogBody, DialogFooter} from "@blueprintjs/core";
import {useEffect, useState} from "react";

interface IWelcomeSplashProps {}

export function WelcomeSplash(props: IWelcomeSplashProps) {
	const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(false);

	useEffect(() => {
		const hasSeen = localStorage.getItem("hasSeenWelcome");
		if (hasSeen !== "true") {
			setIsWelcomeOpen(true);
			localStorage.setItem("hasSeenWelcome", "true");
		}
	}, []);

	return (
		<Dialog
			isOpen={isWelcomeOpen}
			onClose={() => setIsWelcomeOpen(false)}
			title="Welcome to PSI"
			canEscapeKeyClose={true}
			canOutsideClickClose={true}>
			<DialogBody>
				<p>
					Welcome to PSI! This application allows you to create and edit pulse sequence
					diagrams easily.
				</p>
				<p>
					Use the toolbar at the top to save your diagrams as SVG or PNG. Create a channel
					on the right menu and select elements and drag them onto the channel. Edit
					individual elements by clicking to select them and using the right menu.{" "}
				</p>
				<p>
					<strong>Credits:</strong> Developed by Henry Varley with contributions from:
					Gabriel Vilella Nilsson
				</p>
			</DialogBody>

			<DialogFooter>
				<Button intent="primary" onClick={() => setIsWelcomeOpen(false)}>
					Got it!
				</Button>
			</DialogFooter>
		</Dialog>
	);
}
