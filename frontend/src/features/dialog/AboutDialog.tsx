import React, { useEffect, useState } from "react";
import { AnchorButton, Button, Dialog, DialogBody, DialogFooter, Icon, Tab, Tabs } from "@blueprintjs/core";
import { useAppDispatch } from "../../redux/hooks";
import { setAboutDialogOpen } from "../../redux/slices/dialogSlice";
import styles from "./styles/AboutDialog.module.scss";

const logoUrl = `${import.meta.env.BASE_URL}Logo1_white.svg`;
const wikiUrl = `${import.meta.env.BASE_URL}wiki/`;

interface IAboutDialogProps {
	isOpen: boolean;
	onClose: () => void;
	initialTab?: string;
}

export function AboutDialog(props: IAboutDialogProps) {
	const dispatch = useAppDispatch();
	const [currentTabId, setCurrentTabId] = useState<string>(props.initialTab || "welcome");

	useEffect(() => {
		const hasSeen = localStorage.getItem("hasSeenWelcome");
		if (hasSeen !== "true") {
			dispatch(setAboutDialogOpen(true));
			localStorage.setItem("hasSeenWelcome", "true");
		}
	}, [dispatch]);

	useEffect(() => {
		if (props.isOpen) {
			setCurrentTabId(props.initialTab || "welcome");
		}
	}, [props.isOpen, props.initialTab]);

	return (
		<Dialog
			isOpen={props.isOpen}
			onClose={props.onClose}
			title="About Pulse Planner"
			icon="info-sign"
			className={styles.dialog}
		>
			<DialogBody className={styles.dialogBody} useOverflowScrollContainer={false}>
				{/* Splash Header Area */}
				<div className={styles.splashHeader}>
					<img
						src={logoUrl}
						width={70}
						height={50}
						className={styles.logo}
						alt="Pulse Planner Logo"
					/>
					<div>
						<h1 className={styles.title}>Pulse Planner</h1>
						<p className={styles.subtitle}>
							Interactive Pulse Sequence Designer • Version 0.7.5 (BETA)
						</p>
					</div>
					<div className={styles.headerRight}>
						<AnchorButton
							href={wikiUrl}
							target="_blank"
							rel="noopener noreferrer"
							intent="primary"
							icon="book"
							rightIcon="share"
							large
							className={styles.wikiButton}
							text="PSI / Wiki 📖"
						/>
					</div>
				</div>

				{/* Tabs Navigation and Content */}
				<div className={styles.contentContainer}>
					<div className={styles.tabsSidebar}>
						<Tabs
							id="AboutTabs"
							onChange={(tabId) => setCurrentTabId(tabId as string)}
							selectedTabId={currentTabId}
							vertical={true}
						>
							<Tab id="welcome" title="Welcome" />
							<Tab id="overview" title="Overview" />
							<Tab id="features" title="Key Features" />
							<Tab id="technical" title="Technical Details" />
							<Tab id="credits" title="Credits & Team" />
						</Tabs>
					</div>

					<div className={styles.tabContent}>
						{currentTabId === "welcome" && (
							<div className={styles.fadeIn}>
								<h3 className={styles.tabHeader}>Welcome to Pulse Planner (PSI)</h3>
								<p className={styles.paragraphText}>
									Welcome to PSI! This application allows you to create, edit, and export
									pulse sequence diagrams easily and intuitively.
								</p>

								<div className={styles.infoCallout}>
									<h4 className={styles.infoCalloutTitle}>Quick Start Guide</h4>
									<ul className={styles.infoCalloutList}>
										<li className={styles.infoCalloutListItem}>
											<strong>Toolbar:</strong> Use the toolbar at the top to save your diagrams as SVG or PNG, manage files, and customize view settings.
										</li>
										<li className={styles.infoCalloutListItem}>
											<strong>Channels & Elements:</strong> Create a channel on the canvas or right menu, select elements from the library, and drag them onto the channel.
										</li>
										<li className={styles.infoCalloutListItem}>
											<strong>Inspector:</strong> Edit individual elements and channels by clicking to select them and using the inspector panel on the right.
										</li>
									</ul>
								</div>

								<div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
									<Button intent="primary" icon="play" text="Get Started" onClick={props.onClose} />
									<Button minimal text="Learn More" icon="arrow-right" onClick={() => setCurrentTabId("overview")} />
								</div>
							</div>
						)}

						{currentTabId === "overview" && (
							<div className={styles.fadeIn}>
								<h3 className={styles.tabHeader}>What is Pulse Planner?</h3>
								<p className={styles.paragraphText}>
									"Pulse Planner" is a cutting-edge SVG editing environment designed for
									scientists and researchers working with Magnetic Resonance Imaging (MRI)
									and Nuclear Magnetic Resonance (NMR).
								</p>
								<p className={styles.paragraphText}>
									It is designed to bring an end to the tedious and time-consuming process of creating pulse sequence diagrams.
									It comes equipped with an intuitive, drag-and-drop visual canvas, enabling fast prototyping, and publication-ready
									vector graphic export.
								</p>
								<div className={styles.infoCallout}>
									<h4 className={styles.infoCalloutTitle}>Getting Started Quickly</h4>
									<ul className={styles.infoCalloutList}>
										<li className={styles.infoCalloutListItem}>Add a new channel using the buttons in the top right of the canvas</li>
										<li className={styles.infoCalloutListItem}>Drag pulse elements from the library onto the appropriate channel</li>
										<li >Export your design to high-quality SVG or PNG using the export menu</li>
									</ul>
								</div>
							</div>
						)}

						{currentTabId === "features" && (
							<div className={styles.fadeIn}>
								<h3 className={styles.tabHeader}>Key Capabilities</h3>

								<div className={styles.featuresGrid}>
									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="locate" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Automatic Layout Engine (PLACE)</strong>
										</div>
										<span className={styles.featureCardDesc}>
											The custom-built PLACE (Positional Logic And Computation Engine) library means layout is sorted for you.
										</span>
									</div>

									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="style" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Native SVG Support</strong>
										</div>
										<span className={styles.featureCardDesc}>
											Diagrams are edited directly in SVG for pixel perfect, publication-ready exports.
										</span>
									</div>

									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="share" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Portable diagrams</strong>
										</div>
										<span className={styles.featureCardDesc}>
											We developed a propriatory "NMRD" file type for the sharing of NMR diagram projects.
										</span>
									</div>

									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="database" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Asset Library</strong>
										</div>
										<span className={styles.featureCardDesc}>
											Comes with a collection of beautiful built-in pulse assets so you can jump right in with design.
										</span>
									</div>
								</div>
							</div>
						)}

						{currentTabId === "technical" && (
							<div className={styles.fadeIn}>
								<h3 className={styles.tabHeader}>Technical Stack & Diagnostics</h3>
								<p className={styles.technicalDesc}>
									Pulse Planner runs natively as a static React single-page application, compiled with Vite
									and managed via Redux Toolkit.
								</p>

								<table className={`bp5-html-table bp5-html-table-bordered bp5-html-table-striped ${styles.technicalTable}`}>
									<tbody>
										<tr>
											<td><strong>User Agent</strong></td>
											<td>{navigator.userAgent}</td>
										</tr>
										<tr>
											<td><strong>Rendering Engine</strong></td>
											<td>React 18 / SVG.js v3</td>
										</tr>
										<tr>
											<td><strong>UI Components</strong></td>
											<td>@blueprintjs/core v5</td>
										</tr>
										<tr>
											<td><strong>State Management</strong></td>
											<td>Redux Toolkit & Redux Persist</td>
										</tr>
										<tr>
											<td><strong>Development Version</strong></td>
											<td>v0.9.9 (Pre-release)</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}

						{currentTabId === "credits" && (
							<div className={styles.fadeIn}>
								<h3 className={styles.tabHeader}>Team & Contributions</h3>
								<p className={styles.paragraphText}>
									This software was initiated and designed to make pulse sequence authoring more visual and accessible.
								</p>

								<div className={styles.teamList}>
									<div className={styles.teamMember}>
										<div className={`${styles.avatar} ${styles.avatarBlue}`}>HV</div>
										<div>
											<strong className={styles.memberName}>Henry Varley</strong>
											<div className={styles.memberRole}>Primary Developer</div>
										</div>
									</div>

									<div className={styles.teamMember}>
										<div className={`${styles.avatar} ${styles.avatarGreen}`}>CR</div>
										<div>
											<strong className={styles.memberName}>Conrad Robinson</strong>
											<div className={styles.memberRole}>Started construction of the backend</div>
										</div>
									</div>

									<div className={styles.teamMember}>
										<div className={`${styles.avatar} ${styles.avatarOrange}`}>GV</div>
										<div>
											<strong className={styles.memberName}>Gabriel Vilella Nilsson</strong>
											<div className={styles.memberRole}>Contributor</div>
										</div>
									</div>
								</div>

								{/* <div className={styles.copyright}>
									© {new Date().getFullYear()} Pulse Sequence Interface project. All rights reserved.
								</div> */}
							</div>
						)}
					</div>
				</div>
			</DialogBody>

			<DialogFooter
				actions={
					<Button intent="primary" onClick={props.onClose}>
						{currentTabId === "welcome" ? "Got it!" : "Close"}
					</Button>
				}
			/>
		</Dialog>
	);
}
