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
	Tag
} from "@blueprintjs/core";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setPerfDialogOpen } from "../../../redux/slices/dialogSlice";
import {
	BenchmarkProgress,
	ChannelBenchmarkResult,
	removeBenchmarkChannels,
	runChannelAddBenchmark
} from "../../../test/perfTests";
import { ChannelPerfChart } from "./ChannelPerfChart";

export function PerfDialog() {
	const dispatch = useAppDispatch();
	const open = useAppSelector((state) => state.dialog.isPerfDialogOpen);

	// Benchmark state
	const [channelCount, setChannelCount] = useState<number>(10);
	const [autoRemove, setAutoRemove] = useState<boolean>(true);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [progress, setProgress] = useState<BenchmarkProgress | null>(null);
	const [benchmarkResult, setBenchmarkResult] = useState<ChannelBenchmarkResult | null>(null);
	const [activeBenchmarkIds, setActiveBenchmarkIds] = useState<string[]>([]);
	const [isCleaningUp, setIsCleaningUp] = useState<boolean>(false);

	const handleRunBenchmark = async () => {
		setIsRunning(true);
		setBenchmarkResult(null);
		setProgress({ current: 0, total: channelCount, message: "Starting benchmark...", percent: 0 });

		try {
			const result = await runChannelAddBenchmark(channelCount, {
				autoRemove,
				onProgress: (p) => setProgress(p)
			});

			setBenchmarkResult(result);
			if (!autoRemove) {
				setActiveBenchmarkIds(result.addedChannelIds);
			} else {
				setActiveBenchmarkIds([]);
			}
		} catch (error) {
			console.error("Benchmark error:", error);
		} finally {
			setIsRunning(false);
			setProgress(null);
		}
	};

	const handleRemoveChannels = async () => {
		if (activeBenchmarkIds.length === 0) return;
		setIsCleaningUp(true);
		try {
			await removeBenchmarkChannels(activeBenchmarkIds, (p) => {
				setProgress({
					current: p.current,
					total: p.total,
					message: `Cleaning up channel ${p.current}/${p.total}...`,
					percent: p.percent
				});
			});
			setActiveBenchmarkIds([]);
		} catch (error) {
			console.error("Error removing channels:", error);
		} finally {
			setIsCleaningUp(false);
			setProgress(null);
		}
	};

	return (
		<Dialog
			style={{ width: "560px", maxWidth: "95vw" }}
			isOpen={open}
			onClose={() => {
				dispatch(setPerfDialogOpen(false));
			}}
			title="Performance Benchmarks"
			canOutsideClickClose={true}
			canEscapeKeyClose={true}
			icon="timeline-line-chart">
			<DialogBody>
				<div>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<div style={{ fontWeight: 600, fontSize: "14px" }}>
							Layout Engine Channel Benchmark
						</div>
						{benchmarkResult && (
							<Tag intent="success" round minimal>
								{benchmarkResult.channelCount} Channels Benchmarked
							</Tag>
						)}
					</div>
					<div style={{ color: "#5c7080", fontSize: "12px", marginTop: "2px", marginBottom: "12px" }}>
						Sequentially adds channels to the diagram, captures execution metrics from each .act() call,
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
							<span style={{ fontSize: "12px", fontWeight: 500 }}>Channels:</span>
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
							checked={autoRemove}
							disabled={isRunning || isCleaningUp}
							style={{ marginBottom: 0 }}
							onChange={(e) => setAutoRemove((e.target as HTMLInputElement).checked)}
						/>

						<ButtonGroup style={{ marginLeft: "auto" }}>
							{activeBenchmarkIds.length > 0 && (
								<Button
									icon="trash"
									intent="warning"
									text={`Remove Channels (${activeBenchmarkIds.length})`}
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
								onClick={handleRunBenchmark}
							/>
						</ButtonGroup>
					</div>

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
					{benchmarkResult && (
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
										{benchmarkResult.totalAddDurationMs.toFixed(1)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
										Avg / Add
									</div>
									<div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f9960" }}>
										{benchmarkResult.avgAddDurationMs.toFixed(2)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
										Min / Add
									</div>
									<div style={{ fontSize: "16px", fontWeight: "bold", color: "#5c7080" }}>
										{benchmarkResult.minAddDurationMs.toFixed(1)} ms
									</div>
								</div>
								<div>
									<div style={{ fontSize: "11px", color: "#5c7080", textTransform: "uppercase" }}>
										Max / Add
									</div>
									<div style={{ fontSize: "16px", fontWeight: "bold", color: "#d9822b" }}>
										{benchmarkResult.maxAddDurationMs.toFixed(1)} ms
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Benchmark Chart with integrated Download Button */}
					{benchmarkResult && (
						<ChannelPerfChart
							metrics={benchmarkResult.addMetrics}
							title={`Channel Addition Benchmark (${benchmarkResult.channelCount} Channels)`}
						/>
					)}
				</div>
			</DialogBody>
		</Dialog>
	);
}
export default PerfDialog;
