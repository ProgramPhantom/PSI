import React, { useState } from "react";
import {
	Button,
	ButtonGroup,
	Card,
	Checkbox,
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
	removeBenchmarkElements,
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
	const [channelAutoRemove, setChannelAutoRemove] = useState<boolean>(true);
	const [channelResult, setChannelResult] = useState<ChannelBenchmarkResult | null>(null);
	const [activeChannelIds, setActiveChannelIds] = useState<string[]>([]);

	// Free Element Benchmark State
	const [freeElementType, setFreeElementType] = useState<FreeElementType>("svg");
	const [freeElementCount, setFreeElementCount] = useState<number>(10);
	const [freeAutoRemove, setFreeAutoRemove] = useState<boolean>(true);
	const [freeResult, setFreeResult] = useState<FreeElementBenchmarkResult | null>(null);
	const [activeFreeElementIds, setActiveFreeElementIds] = useState<string[]>([]);

	// Shared execution state
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [progress, setProgress] = useState<BenchmarkProgress | null>(null);
	const [isCleaningUp, setIsCleaningUp] = useState<boolean>(false);

	// Run Channel benchmark
	const handleRunChannelBenchmark = async () => {
		setIsRunning(true);
		setChannelResult(null);
		setProgress({ current: 0, total: channelCount, message: "Starting channel benchmark...", percent: 0 });

		try {
			const result = await runChannelAddBenchmark(channelCount, {
				autoRemove: channelAutoRemove,
				onProgress: (p) => setProgress(p)
			});

			setChannelResult(result);
			if (!channelAutoRemove) {
				setActiveChannelIds(result.addedChannelIds);
			} else {
				setActiveChannelIds([]);
			}
		} catch (error) {
			console.error("Channel benchmark error:", error);
		} finally {
			setIsRunning(false);
			setProgress(null);
		}
	};

	// Run Free Element benchmark
	const handleRunFreeBenchmark = async () => {
		setIsRunning(true);
		setFreeResult(null);
		setProgress({ current: 0, total: freeElementCount, message: `Starting ${freeElementType} benchmark...`, percent: 0 });

		try {
			const result = await runFreeElementBenchmark(freeElementType, freeElementCount, {
				autoRemove: freeAutoRemove,
				onProgress: (p) => setProgress(p)
			});

			setFreeResult(result);
			if (!freeAutoRemove) {
				setActiveFreeElementIds(result.addedElementIds);
			} else {
				setActiveFreeElementIds([]);
			}
		} catch (error) {
			console.error("Free element benchmark error:", error);
		} finally {
			setIsRunning(false);
			setProgress(null);
		}
	};

	// Cleanup channels
	const handleRemoveChannels = async () => {
		if (activeChannelIds.length === 0) return;
		setIsCleaningUp(true);
		try {
			await removeBenchmarkElements(activeChannelIds, (p) => {
				setProgress({
					current: p.current,
					total: p.total,
					message: `Cleaning up channel ${p.current}/${p.total}...`,
					percent: p.percent
				});
			});
			setActiveChannelIds([]);
		} catch (error) {
			console.error("Error removing channels:", error);
		} finally {
			setIsCleaningUp(false);
			setProgress(null);
		}
	};

	// Cleanup free elements
	const handleRemoveFreeElements = async () => {
		if (activeFreeElementIds.length === 0) return;
		setIsCleaningUp(true);
		try {
			await removeBenchmarkElements(activeFreeElementIds, (p) => {
				setProgress({
					current: p.current,
					total: p.total,
					message: `Cleaning up element ${p.current}/${p.total}...`,
					percent: p.percent
				});
			});
			setActiveFreeElementIds([]);
		} catch (error) {
			console.error("Error removing free elements:", error);
		} finally {
			setIsCleaningUp(false);
			setProgress(null);
		}
	};

	const currentResult = activeTab === "channel" ? channelResult : freeResult;
	const currentMetrics = activeTab === "channel" ? channelResult?.addMetrics : freeResult?.addMetrics;

	return (
		<Dialog
			style={{ width: "580px", maxWidth: "95vw" }}
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
								Sequence Channel Additions
							</div>
							{channelResult && (
								<Tag intent="success" round minimal>
									{channelResult.channelCount} Channels Benchmarked
								</Tag>
							)}
						</div>
						<div style={{ color: "#5c7080", fontSize: "12px", marginTop: "2px", marginBottom: "12px" }}>
							Sequentially adds channels to the sequence grid, captures execution metrics from each .act() call,
							and plots the time taken per addition.
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
								<span style={{ fontSize: "12px", fontWeight: 500 }}>Count:</span>
								<HTMLSelect
									value={channelCount}
									disabled={isRunning || isCleaningUp}
									onChange={(e) => setChannelCount(Number(e.target.value))}
									options={[
										{ label: "5 channels", value: 5 },
										{ label: "10 channels", value: 10 },
										{ label: "15 channels", value: 15 },
										{ label: "20 channels", value: 20 },
										{ label: "30 channels", value: 30 },
										{ label: "50 channels", value: 50 }
									]}
								/>
							</div>

							<Checkbox
								label="Auto-remove channels"
								checked={channelAutoRemove}
								disabled={isRunning || isCleaningUp}
								style={{ marginBottom: 0 }}
								onChange={(e) => setChannelAutoRemove((e.target as HTMLInputElement).checked)}
							/>

							<ButtonGroup style={{ marginLeft: "auto" }}>
								{activeChannelIds.length > 0 && (
									<Button
										icon="trash"
										intent="warning"
										text={`Remove Channels (${activeChannelIds.length})`}
										loading={isCleaningUp}
										disabled={isRunning}
										onClick={handleRemoveChannels}
									/>
								)}
								<Button
									icon="play"
									intent="primary"
									text="Run Benchmark"
									loading={isRunning}
									disabled={isCleaningUp}
									onClick={handleRunChannelBenchmark}
								/>
							</ButtonGroup>
						</div>
					</div>
				)}

				{/* TAB 2: Free Element Benchmark */}
				{activeTab === "free" && (
					<div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div style={{ fontWeight: 600, fontSize: "14px" }}>
								Free Canvas Elements
							</div>
							{freeResult && (
								<Tag intent="success" round minimal>
									{freeResult.elementCount} {freeResult.elementType.toUpperCase()} Elements Benchmarked
								</Tag>
							)}
						</div>
						<div style={{ color: "#5c7080", fontSize: "12px", marginTop: "2px", marginBottom: "12px" }}>
							Sequentially adds freely-placed elements (SVG, Rect, or Label) directly to the diagram canvas,
							captures execution metrics from each .act() call, and plots the time taken.
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
									disabled={isRunning || isCleaningUp}
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
									disabled={isRunning || isCleaningUp}
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

							<Checkbox
								label="Auto-remove elements"
								checked={freeAutoRemove}
								disabled={isRunning || isCleaningUp}
								style={{ marginBottom: 0 }}
								onChange={(e) => setFreeAutoRemove((e.target as HTMLInputElement).checked)}
							/>

							<ButtonGroup style={{ marginLeft: "auto" }}>
								{activeFreeElementIds.length > 0 && (
									<Button
										icon="trash"
										intent="warning"
										text={`Remove Elements (${activeFreeElementIds.length})`}
										loading={isCleaningUp}
										disabled={isRunning}
										onClick={handleRemoveFreeElements}
									/>
								)}
								<Button
									icon="play"
									intent="primary"
									text="Run Benchmark"
									loading={isRunning}
									disabled={isCleaningUp}
									onClick={handleRunFreeBenchmark}
								/>
							</ButtonGroup>
						</div>
					</div>
				)}

				{/* Progress bar */}
				{(isRunning || isCleaningUp) && progress && (
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

				{/* Summary metrics */}
				{currentResult && (
					<Card style={{ padding: "10px", marginTop: "8px", backgroundColor: "#f5f8fa" }}>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(4, 1fr)",
								gap: "8px",
								textAlign: "center"
							}}>
							<div>
								<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
									Total Add Time
								</div>
								<div style={{ fontSize: "16px", fontWeight: "bold", color: "#106ba3" }}>
									{currentResult.totalAddDurationMs.toFixed(1)} ms
								</div>
							</div>
							<div>
								<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
									Avg / Add
								</div>
								<div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f9960" }}>
									{currentResult.avgAddDurationMs.toFixed(2)} ms
								</div>
							</div>
							<div>
								<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
									Min / Add
								</div>
								<div style={{ fontSize: "16px", fontWeight: "bold", color: "#5c7080" }}>
									{currentResult.minAddDurationMs.toFixed(1)} ms
								</div>
							</div>
							<div>
								<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
									Max / Add
								</div>
								<div style={{ fontSize: "16px", fontWeight: "bold", color: "#d9822b" }}>
									{currentResult.maxAddDurationMs.toFixed(1)} ms
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* Benchmark Chart with integrated Download Button */}
				{currentMetrics && currentMetrics.length > 0 && (
					<ChannelPerfChart
						metrics={currentMetrics}
						title={
							activeTab === "channel"
								? `Channel Addition Benchmark (${channelResult?.channelCount} Channels)`
								: `Free ${freeResult?.elementType.toUpperCase()} Elements Benchmark (${freeResult?.elementCount} Elements)`
						}
						xAxisLabel={
							activeTab === "channel"
								? "Channel Addition Step (#)"
								: `Free ${freeResult?.elementType.toUpperCase()} Addition Step (#)`
						}
					/>
				)}
			</DialogBody>
		</Dialog>
	);
}
export default PerfDialog;
