import React, { useState } from "react";
import { Button, Dialog, DialogBody, DialogFooter, Icon, Tab, Tabs } from "@blueprintjs/core";
import styles from "./styles/AboutDialog.module.scss";

const logoUrl = `${import.meta.env.BASE_URL}Logo1_white.svg`;

interface IAboutDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AboutDialog(props: IAboutDialogProps) {
	const [currentTabId, setCurrentTabId] = useState<string>("overview");

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
							<Tab id="overview" title="Overview" />
							<Tab id="features" title="Key Features" />
							<Tab id="technical" title="Technical Details" />
							<Tab id="credits" title="Credits & Team" />
						</Tabs>
					</div>

					<div className={styles.tabContent}>
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
											<td>v0.7.5-beta (Vite Development Server)</td>
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
								</div>

								{/* <div className={styles.copyright}>
									© {new Date().getFullYear()} Pulse Sequence Interface project. All rights reserved.
								</div> */}
							</div>
						)}
					</div>
				</div>
			</DialogBody>

		</Dialog>
	);
}
