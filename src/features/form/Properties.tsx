import {Card, Divider, EditableText, Section, SectionCard, Text} from "@blueprintjs/core";
import {Visual} from "../../logic/visual";

interface IProperties {
	target: Visual;
}

function Properties(props: IProperties) {
	return (
		<Section
			style={{
				display: "flex",
				flexDirection: "column",
				margin: "0px",
				overflow: "hidden",
				padding: "4px 4px"
			}}
			collapsible={true}
			title="Properties"
			compact={true}
			collapseProps={{defaultIsOpen: false}}
			icon="wrench">
			<SectionCard style={{padding: "8px 0px", overflow: "hidden"}} padded={false}>
				<div style={{margin: "4px 4px"}}>
					<Text style={{padding: "0px 4px 8px 4px", fontWeight: "400"}}>Position</Text>

					<div
						style={{
							width: "80%",
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between"
						}}>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}>
							<Text style={{padding: "0px 4px", fontWeight: "600"}}>X:</Text>
							<Card style={{padding: "4px"}}>
								<EditableText
									disabled={true}
									value={`${props.target.x}`}></EditableText>
							</Card>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}>
							<Text style={{padding: "0px 4px", fontWeight: "600"}}>Y:</Text>
							<Card style={{padding: "4px"}}>
								<EditableText
									disabled={true}
									value={`${props.target.y}`}></EditableText>
							</Card>
						</div>
					</div>
				</div>

				<Divider style={{display: "inline-block", width: "100%"}}></Divider>

				<div style={{margin: "0px 4px"}}>
					<Text style={{padding: "0px 4px 8px 4px", fontWeight: "400"}}>
						Content Size
					</Text>

					<div
						style={{
							width: "80%",
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between"
						}}>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}>
							<Text style={{padding: "0px 4px", fontWeight: "600"}}>W:</Text>
							<Card style={{padding: "4px"}}>
								<EditableText
									disabled={true}
									value={`${props.target.contentWidth}`}></EditableText>
							</Card>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}>
							<Text style={{padding: "0px 4px", fontWeight: "600"}}>H:</Text>
							<Card style={{padding: "4px"}}>
								<EditableText
									disabled={true}
									value={`${props.target.contentHeight}`}></EditableText>
							</Card>
						</div>
					</div>
				</div>

				<Divider style={{display: "inline-block", width: "100%"}}></Divider>

				<div style={{margin: "0px 4px"}}>
					<Text style={{padding: "0px 4px 8px 4px", fontWeight: "400"}}>Size</Text>

					<div
						style={{
							width: "80%",
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between"
						}}>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}>
							<Text style={{padding: "0px 4px", fontWeight: "600"}}>W:</Text>
							<Card style={{padding: "4px"}}>
								<EditableText
									disabled={true}
									value={`${props.target.width}`}></EditableText>
							</Card>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}>
							<Text style={{padding: "0px 4px", fontWeight: "600"}}>H:</Text>
							<Card style={{padding: "4px"}}>
								<EditableText
									disabled={true}
									value={`${props.target.height}`}></EditableText>
							</Card>
						</div>
					</div>
				</div>
			</SectionCard>
		</Section>
	);
}
