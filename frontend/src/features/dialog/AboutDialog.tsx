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
			<DialogBody className={styles.dialogBody}>
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
									Pulse Planner (PSI) is a cutting-edge visual editing environment designed for
									scientists, developers, and researchers working with Magnetic Resonance Imaging (MRI)
									and Nuclear Magnetic Resonance (NMR).
								</p>
								<p className={styles.paragraphText}>
									It replaces tedious code-based pulse sequence descriptions with an intuitive, drag-and-drop
									visual canvas, enabling fast prototyping, sequence inspection, and publication-ready
									vector graphic export.
								</p>
								<div className={styles.infoCallout}>
									<h4 className={styles.infoCalloutTitle}>Getting Started Quickly</h4>
									<ul className={styles.infoCalloutList}>
										<li className={styles.infoCalloutListItem}>Use the left sidebar to add new channels (RF, Gradients, ADC).</li>
										<li className={styles.infoCalloutListItem}>Drag sequence elements from the library onto the appropriate channel timeline.</li>
										<li className={styles.infoCalloutListItem}>Select any block to configure detailed parameters (amplitude, duration, phase).</li>
										<li>Export your design to high-quality SVG or PNG using the top-level Export menu.</li>
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
											<Icon icon="timeline-events" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Multi-Channel Timelines</strong>
										</div>
										<span className={styles.featureCardDesc}>
											Manage complex multi-channel sequence logic with millisecond-precision alignment controls.
										</span>
									</div>

									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="style" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Vector SVG Rendering</strong>
										</div>
										<span className={styles.featureCardDesc}>
											All waveforms are rendered as high-fidelity SVG paths, ensuring perfect sharpness at any zoom level.
										</span>
									</div>

									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="code" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>NMRD Standard Export</strong>
										</div>
										<span className={styles.featureCardDesc}>
											Export sequence metadata directly into `.nmrd` file formats for integration with downstream engines.
										</span>
									</div>

									<div className={styles.featureCard}>
										<div className={styles.featureCardHeader}>
											<Icon icon="database" intent="primary" size={20} style={{ marginRight: "10px" }} />
											<strong className={styles.featureCardTitle}>Asset Libraries</strong>
										</div>
										<span className={styles.featureCardDesc}>
											Browse and import custom composite pulses, gradient waveforms, and pre-packaged sequences.
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
											<div className={styles.memberRole}>Lead Architect & Primary Developer</div>
										</div>
									</div>

									<div className={styles.teamMember}>
										<div className={`${styles.avatar} ${styles.avatarGreen}`}>CR</div>
										<div>
											<strong className={styles.memberName}>Conrad Robinson</strong>
											<div className={styles.memberRole}>Sequence Modeling & Calculation Engine</div>
										</div>
									</div>

									<div className={styles.teamMember}>
										<div className={`${styles.avatar} ${styles.avatarOrange}`}>GN</div>
										<div>
											<strong className={styles.memberName}>Gabriel Vilella Nilsson</strong>
											<div className={styles.memberRole}>UI/UX Contributor & Graphics Styling</div>
										</div>
									</div>
								</div>

								<div className={styles.copyright}>
									© {new Date().getFullYear()} Pulse Sequence Interface project. All rights reserved.
								</div>
							</div>
						)}
					</div>
				</div>
			</DialogBody>

		</Dialog>
	);
}
