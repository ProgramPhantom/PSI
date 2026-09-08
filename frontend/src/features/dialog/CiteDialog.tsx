import React, { useState } from "react";
import { Button, Dialog, DialogBody, DialogFooter, Tab, Tabs, Callout, Intent } from "@blueprintjs/core";

interface ICiteDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

const CITATION_DATA = {
	bibtex: `@misc{varley_pulseplanner,
  author = {Varley, Henry},
  title = {Pulse Planner: Interactive Pulse Sequence Designer for NMR and MRI},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\\url{https://github.com/ProgramPhantom/PSI}}
}`,
	apa: `Varley, H. (2024). Pulse Planner: Interactive Pulse Sequence Designer for NMR and MRI [Computer software]. GitHub. https://github.com/ProgramPhantom/PSI`,
	ieee: `H. Varley, "Pulse Planner: Interactive Pulse Sequence Designer for NMR and MRI," 2024. [Online]. Available: https://github.com/ProgramPhantom/PSI.`,
	mla: `Varley, Henry. "Pulse Planner: Interactive Pulse Sequence Designer for NMR and MRI." GitHub, 2024, https://github.com/ProgramPhantom/PSI.`
};

export function CiteDialog(props: ICiteDialogProps) {
	const [currentFormat, setCurrentFormat] = useState<string>("bibtex");
	const [copied, setCopied] = useState<boolean>(false);

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const getActiveCitation = (): string => {
		return CITATION_DATA[currentFormat as keyof typeof CITATION_DATA] || CITATION_DATA.bibtex;
	};

	return (
		<Dialog
			isOpen={props.isOpen}
			onClose={props.onClose}
			title="Cite Pulse Planner"
			icon="citation"
			style={{ width: "620px", maxWidth: "90vw" }}
		>
			<DialogBody>
				<p style={{ marginBottom: "14px", color: "var(--bp-text-color-muted, #5f6b7c)" }}>
					If you use Pulse Planner in academic work, research papers, publications, or presentations, please consider citing it using one of the academic standards below:
				</p>

				<Tabs
					id="CitationFormatTabs"
					selectedTabId={currentFormat}
					onChange={(tabId) => {
						setCurrentFormat(tabId as string);
						setCopied(false);
					}}
					animate={true}
				>
					<Tab id="bibtex" title="BibTeX" />
					<Tab id="apa" title="APA (7th ed.)" />
					<Tab id="ieee" title="IEEE" />
					<Tab id="mla" title="MLA (9th ed.)" />
				</Tabs>

				<div style={{ marginTop: "16px" }}>
					<Callout
						intent={Intent.NONE}
						style={{
							fontFamily: currentFormat === "bibtex" ? "monospace" : "inherit",
							fontSize: currentFormat === "bibtex" ? "12px" : "13px",
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
							lineHeight: 1.5,
							background: "rgba(0, 0, 0, 0.04)",
							userSelect: "all",
							padding: "14px",
							borderRadius: "4px"
						}}
					>
						{getActiveCitation()}
					</Callout>
				</div>
			</DialogBody>

			<DialogFooter
				actions={
					<>
						<Button
							icon={copied ? "tick" : "clipboard"}
							intent={copied ? "success" : "primary"}
							text={copied ? "Copied to Clipboard!" : "Copy Citation"}
							onClick={() => handleCopy(getActiveCitation())}
						/>
						<Button text="Close" onClick={props.onClose} />
					</>
				}
			/>
		</Dialog>
	);
}
