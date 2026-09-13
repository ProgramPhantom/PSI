import React, { useState } from "react";
import {
	Button,
	Card,
	Dialog,
	DialogBody,
	HTMLSelect,
	ProgressBar,
	SegmentedControl,
	Tag
} from "@blueprintjs/core";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setPerfDialogOpen } from "../../../redux/slices/dialogSlice";
import {
	BenchmarkProgress,
	ChannelBenchmarkResult,
	FreeElementBenchmarkResult,
	FreeElementType,
	runChannelAddBenchmark,
	runFreeElementBenchmark
} from "../../../test/perfTests";
import { ChannelPerfChart } from "./ChannelPerfChart";

type BenchmarkTab = "channel" | "free";

export function PerfDialog() {
	const dispatch = useAppDispatch();
	const open = useAppSelector((state) => state.dialog.isPerfDialogOpen);

	const [activeTab, setActiveTab] = useState<BenchmarkTab>("channel");

	// Channel Benchmark State
	const [channelCount, setChannelCount] = useState<number>(10);
	const [channelResult, setChannelResult] = useState<ChannelBenchmarkResult | null>(null);

	// Free Element Benchmark State
	const [freeElementType, setFreeElementType] = useState<FreeElementType>("svg");
	const [freeElementCount, setFreeElementCount] = useState<number>(10);
	const [freeResult, setFreeResult] = useState<FreeElementBenchmarkResult | null>(null);

	// Shared execution state
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [progress, setProgress] = useState<BenchmarkProgress | null>(null);

	// Run Channel benchmark (always includes removals)
	const handleRunChannelBenchmark = async () => {
		setIsRunning(true);
		setChannelResult(null);
		setProgress({ current: 0, total: channelCount * 2, message: "Starting channel additions...", percent: 0 });

		try {
			const result = await runChannelAddBenchmark(channelCount, {
				onProgress: (p) => setProgress(p)
			});
			setChannelResult(result);
		} catch (error) {
			console.error("Channel benchmark error:", error);
		} finally {
			setIsRunning(false);
			setProgress(null);
		}
	};

	// Run Free Element benchmark (always includes removals)
	const handleRunFreeBenchmark = async () => {
		setIsRunning(true);
		setFreeResult(null);
		setProgress({ current: 0, total: freeElementCount * 2, message: `Starting ${freeElementType} additions...`, percent: 0 });

		try {
			const result = await runFreeElementBenchmark(freeElementType, freeElementCount, {
				onProgress: (p) => setProgress(p)
			});
			setFreeResult(result);
		} catch (error) {
			console.error("Free element benchmark error:", error);
		} finally {
			setIsRunning(false);
			setProgress(null);
		}
	};

	const currentResult = activeTab === "channel" ? channelResult : freeResult;
	const addMetrics = activeTab === "channel" ? channelResult?.addMetrics : freeResult?.addMetrics;
	const removeMetrics = activeTab === "channel" ? channelResult?.removeMetrics : freeResult?.removeMetrics;

	return (
		<Dialog
			style={{ width: "740px", maxWidth: "96vw" }}
			isOpen={open}
			onClose={() => {
				dispatch(setPerfDialogOpen(false));
			}}
			title="Performance Benchmarks"
			canOutsideClickClose={true}
			canEscapeKeyClose={true}
			icon="timeline-line-chart">
			<DialogBody>
				{/* Tab Selector */}
				<div style={{ marginBottom: "14px" }}>
					<SegmentedControl
						fill
						size="small"
						value={activeTab}
						onValueChange={(val) => setActiveTab(val as BenchmarkTab)}
						options={[
							{ label: "Channel Benchmarks", value: "channel" },
							{ label: "Free Element Benchmarks", value: "free" }
						]}
					/>
				</div>

				{/* TAB 1: Channel Benchmark */}
				{activeTab === "channel" && (
					<div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div style={{ fontWeight: 600, fontSize: "14px" }}>
								Sequence Channel Additions & Removals
							</div>
							{channelResult && (
								<Tag intent="success" round minimal>
									{channelResult.channelCount} Channels Benchmarked (Add & Remove)
								</Tag>
							)}
						</div>
						<div style={{ color: "#5c7080", fontSize: "12px", marginTop: "2px", marginBottom: "12px" }}>
							Sequentially adds channels to the sequence grid, then removes each channel, capturing execution
							metrics from each .act() call and plotting addition and removal durations side by side.
						</div>

						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								gap: "12px",
								marginBottom: "12px"
							}}>
							<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
								<span style={{ fontSize: "12px", fontWeight: 500 }}>Channel Count:</span>
								<HTMLSelect
									value={channelCount}
									disabled={isRunning}
									onChange={(e) => setChannelCount(Number(e.target.value))}
									options={[
										{ label: "5 channels", value: 5 },
										{ label: "10 channels", value: 10 },
										{ label: "15 channels", value: 15 },
										{ label: "20 channels", value: 20 },
										{ label: "30 channels", value: 30 },
										{ label: "50 channels", value: 50 },
										{ label: "100 channels", value: 100 }
									]}
								/>
							</div>

							<div style={{ marginLeft: "auto" }}>
								<Button
									icon="play"
									intent="primary"
									text="Run Channel Benchmark"
									loading={isRunning}
									onClick={handleRunChannelBenchmark}
								/>
							</div>
						</div>
					</div>
				)}

				{/* TAB 2: Free Element Benchmark */}
				{activeTab === "free" && (
					<div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div style={{ fontWeight: 600, fontSize: "14px" }}>
								Free Canvas Elements Additions & Removals
							</div>
							{freeResult && (
								<Tag intent="success" round minimal>
									{freeResult.elementCount} {freeResult.elementType.toUpperCase()} Elements Benchmarked
								</Tag>
							)}
						</div>
						<div style={{ color: "#5c7080", fontSize: "12px", marginTop: "2px", marginBottom: "12px" }}>
							Sequentially adds freely-placed elements (SVG, Rect, or Label) directly to the diagram canvas,
							then removes each element, measuring addition and removal performance side by side.
						</div>

						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								gap: "12px",
								marginBottom: "12px"
							}}>
							<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
								<span style={{ fontSize: "12px", fontWeight: 500 }}>Type:</span>
								<HTMLSelect
									value={freeElementType}
									disabled={isRunning}
									onChange={(e) => setFreeElementType(e.target.value as FreeElementType)}
									options={[
										{ label: "SVG Element (180Soft)", value: "svg" },
										{ label: "Rect Element (Rect)", value: "rect" },
										{ label: "Label Component (LaTeX)", value: "label" }
									]}
								/>
							</div>

							<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
								<span style={{ fontSize: "12px", fontWeight: 500 }}>Count:</span>
								<HTMLSelect
									value={freeElementCount}
									disabled={isRunning}
									onChange={(e) => setFreeElementCount(Number(e.target.value))}
									options={[
										{ label: "5 elements", value: 5 },
										{ label: "10 elements", value: 10 },
										{ label: "15 elements", value: 15 },
										{ label: "20 elements", value: 20 },
										{ label: "30 elements", value: 30 },
										{ label: "50 elements", value: 50 },
										{ label: "100 elements", value: 100 }
									]}
								/>
							</div>

							<div style={{ marginLeft: "auto" }}>
								<Button
									icon="play"
									intent="primary"
									text="Run Free Element Benchmark"
									loading={isRunning}
									onClick={handleRunFreeBenchmark}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Progress bar */}
				{isRunning && progress && (
					<div style={{ marginBottom: "12px" }}>
						<ProgressBar
							value={progress.percent / 100}
							intent="primary"
							stripes
							animate
						/>
						<div
							style={{
								fontSize: "11px",
								color: "#5c7080",
								marginTop: "4px",
								textAlign: "center"
							}}>
							{progress.message}
						</div>
					</div>
				)}

				{/* Summary metrics: Additions AND Removals */}
				{currentResult && (
					<Card style={{ padding: "12px", marginTop: "8px", backgroundColor: "#f5f8fa" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
							<span style={{ fontWeight: 600, fontSize: "13px" }}>Benchmark Metrics Summary</span>
							<Tag intent="primary" minimal>
								Total Cycle: {(currentResult.totalAddDurationMs + currentResult.totalRemoveDurationMs).toFixed(1)} ms
							</Tag>
						</div>

						{/* Additions Row */}
						<div style={{ marginBottom: "8px" }}>
							<div style={{ fontSize: "11px", fontWeight: 600, color: "#106ba3", marginBottom: "4px" }}>
								ADDITIONS ({currentResult.addMetrics.length} steps)
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: "8px",
									textAlign: "center",
									backgroundColor: "#ffffff",
									padding: "6px",
									borderRadius: "3px",
									border: "1px solid #e1e8ed"
								}}>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>TOTAL TIME</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#106ba3" }}>
										{currentResult.totalAddDurationMs.toFixed(1)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>AVG / STEP</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#0f9960" }}>
										{currentResult.avgAddDurationMs.toFixed(2)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>MIN / STEP</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#5c7080" }}>
										{currentResult.minAddDurationMs.toFixed(1)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>MAX / STEP</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#d9822b" }}>
										{currentResult.maxAddDurationMs.toFixed(1)} ms
									</div>
								</div>
							</div>
						</div>

						{/* Removals Row */}
						<div>
							<div style={{ fontSize: "11px", fontWeight: 600, color: "#db3737", marginBottom: "4px" }}>
								REMOVALS ({currentResult.removeMetrics.length} steps)
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: "8px",
									textAlign: "center",
									backgroundColor: "#ffffff",
									padding: "6px",
									borderRadius: "3px",
									border: "1px solid #e1e8ed"
								}}>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>TOTAL TIME</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#db3737" }}>
										{currentResult.totalRemoveDurationMs.toFixed(1)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>AVG / STEP</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#0f9960" }}>
										{currentResult.avgRemoveDurationMs.toFixed(2)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>MIN / STEP</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#5c7080" }}>
										{currentResult.minRemoveDurationMs.toFixed(1)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "10px", color: "#5c7080" }}>MAX / STEP</div>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#d9822b" }}>
										{currentResult.maxRemoveDurationMs.toFixed(1)} ms
									</div>
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* Two Benchmark Graphs Along Side Each Other */}
				{addMetrics && addMetrics.length > 0 && removeMetrics && removeMetrics.length > 0 && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px",
							marginTop: "12px"
						}}>
						{/* Graph 1: Additions */}
						<ChannelPerfChart
							metrics={addMetrics}
							title={
								activeTab === "channel"
									? `Channel Additions (${addMetrics.length})`
									: `Free ${freeResult?.elementType.toUpperCase()} Additions (${addMetrics.length})`
							}
							xAxisLabel="Addition Step (#)"
							lineColor="#2d72d2"
							fillColor="rgba(45, 114, 210, 0.12)"
							computeLineColor="#d9822b"
							downloadFilenamePrefix="additions-benchmark"
						/>

						{/* Graph 2: Removals Along Side Additions */}
						<ChannelPerfChart
							metrics={removeMetrics}
							title={
								activeTab === "channel"
									? `Channel Removals (${removeMetrics.length})`
									: `Free ${freeResult?.elementType.toUpperCase()} Removals (${removeMetrics.length})`
							}
							xAxisLabel="Removal Step (#)"
							lineColor="#db3737"
							fillColor="rgba(219, 55, 55, 0.12)"
							computeLineColor="#d9822b"
							downloadFilenamePrefix="removals-benchmark"
						/>
					</div>
				)}
			</DialogBody>
		</Dialog>
	);
}
export default PerfDialog;
