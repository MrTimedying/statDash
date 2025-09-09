# Project Plan: Interactive Statistical Simulations Dashboard

Goal: Build a high-performance, cross-platform desktop app (Windows, macOS, Linux) that enables users to run and visualize statistical simulations in real time to learn statistical principles.
Tech stack:
Application framework: Tauri
Frontend: React + Vite, written in TypeScript
Backend/Core logic: Rust
Charts: Recharts or D3.js (unspecified which one)
Core features:
Interactive simulation controls: group means, standard deviations (two groups), sample sizes (per group), number of simulations, hypothesized effect size, alpha level.
Real-time visualizations:
P-value distribution histogram with alpha threshold indicator and color-coding for significance.
Confidence Interval (CI) Explorer: distribution of effect sizes and the “dance” of confidence intervals across many simulated experiments.
S-Value information dashboard: interpretation of p-values as Shannon information (bits) against the null.
CI precision vs. sample size plot: CI width narrows with larger N.
Performance: Run thousands of simulations in seconds using Rust.
Data export: Export results (p-values, effect sizes, CIs) to CSV.
Architecture (as stated):
Frontend (React/TS): ControlPanel.tsx; DashboardView.tsx; PValueChart.tsx; CIChart.tsx; state management to pass params to backend and feed charts from results.
Backend (Rust/Tauri): simulations.rs for simulation logic; main.rs to expose Tauri commands to JS.
UI/UX flow:
Sidebar to set two populations (means, SDs), sample sizes, number of simulations.
Tabs: “P-Value Distribution”, “Confidence Intervals”, “S-Value Analysis”.
“Run Simulation” triggers charts; histogram shows alpha line and significance coloring; CI tab shows 95% CIs and effect sizes.
Open decisions and gaps (must be resolved by owner)

Charting library choice: Recharts vs D3.js (not specified).
Statistical specifics:
t-test variant (e.g., equal variances vs unequal variances) not specified.
CI computation method (exact form, confidence level defaults beyond “95% CIs in UI flow”) not comprehensively specified.
S-Value exact formula/definition not specified beyond concept description.
IPC shape and streaming model: whether results are streamed incrementally or returned in batches not specified.
CSV schema: exact columns and formatting not specified.
Testing strategy and tooling: not specified.
Packaging/signing/distribution specifics: not specified beyond “package the application for multi-platform distribution.”
Phased execution plan (agent-ready)

Phase 0 — Project bootstrap Objective

Create baseline Tauri app with React + Vite + TypeScript front-end and Rust backend.
Tasks

T0.1 Initialize new Tauri project using the react-ts template.
T0.2 Verify development build and hot reload for frontend; ensure Rust builds for the target OS.
T0.3 Add TypeScript configuration and linting consistent with the template (already implied by template).
T0.4 Create a placeholder “DashboardView” with tabs and a left sidebar scaffold (no functionality yet).
Inputs/Outputs

Inputs: Tauri CLI with react-ts template.
Outputs: Running desktop shell app with empty UI scaffold.
Files (as per document and typical Tauri layout)

src-tauri/src/main.rs
src-tauri/src/simulations.rs (empty stub at this phase)
Frontend TSX files: ControlPanel.tsx, DashboardView.tsx, PValueChart.tsx, CIChart.tsx (stubs)
Acceptance criteria

App launches on desktop for the development machine.
Tabs and sidebar render, no runtime errors.
Notes

Directory structure beyond filenames is not specified in the source; use a conventional layout. If a different layout is desired, specify it before proceeding.
Phase 1 — Rust simulation engine Objective

Implement high-performance core simulation logic in Rust to support required statistics.
Tasks

T1.1 Implement random data generation for two groups given means, SDs, and sample sizes.
T1.2 Implement statistical tests (t-tests) to compute p-values per simulated experiment.
T1.3 Implement confidence interval computation for effect sizes; support producing “dance of the CIs” data.
T1.4 Implement S-Value computation to translate p-values to Shannon information.
T1.5 Aggregate results across N simulations and prepare data structures for charts: p-value histogram, effect sizes with CIs, s-value summaries, CI width vs. N.
T1.6 Add unit-level validations on basic inputs (non-negative SDs, positive N, etc.).
Inputs/Outputs

Inputs: Parameters from UI: group1 mean, group1 SD, group2 mean, group2 SD, sample sizes per group, number of simulations, hypothesized effect size, alpha level.
Outputs: Aggregated results necessary for frontend charts and export.
Files

src-tauri/src/simulations.rs
Acceptance criteria

Given valid parameters, functions return data suitable for:
Histogram of p-values with counts per bin.
A collection of simulated effect sizes and their 95% CIs.
S-Value metrics per simulation and/or aggregated.
CI width vs sample size data series.
Engine runs “thousands of simulations in seconds” on a typical development machine, consistent with the performance goal in the document.
Notes

Specific test type and formulas are not specified in the source document; choose consistent, standard approaches and document choices for review.
Phase 2 — Expose Rust via Tauri commands Objective

Make Rust simulation functions callable from the React frontend.
Tasks

T2.1 In main.rs, register Tauri commands that wrap the simulations.rs functions.
T2.2 Define a request payload that includes all parameters listed in the document.
T2.3 Define response payloads that provide data for each visualization.
T2.4 Implement error handling for invalid input and computation failures.
Inputs/Outputs

Inputs: Parameter payload (as above).
Outputs: Structured results for P-Value Distribution, CIs dance, S-Value analysis, CI precision vs sample size.
Files

src-tauri/src/main.rs
Acceptance criteria

Frontend can call Tauri commands and receive results for rendering without crashes.
Errors are propagated with informative messages (e.g., invalid parameter ranges).
Notes

Command names and payload schemas are not specified in the source; define them and mark as “proposed” for confirmation.
Phase 3 — Frontend scaffolding and state management Objective

Implement UI components and state flow for parameters and results.
Tasks

T3.1 Build ControlPanel.tsx with inputs:
Two population means, two SDs, sample sizes (per group), number of simulations, hypothesized effect size, alpha level.
T3.2 Build DashboardView.tsx with tabs:
“P-Value Distribution”, “Confidence Intervals”, “S-Value Analysis”.
T3.3 Establish state management to hold parameters; wire “Run Simulation” button to trigger Tauri command(s).
T3.4 Implement loading/error states.
Inputs/Outputs

Inputs: User-adjusted parameters from controls.
Outputs: Invocation of backend and receipt of results.
Files

Frontend TSX files per architecture section.
Acceptance criteria

Users can set all parameters and trigger a simulation run.
UI reflects loading and errors clearly.
Notes

State management library is not specified; use any reasonable approach consistent with React + TypeScript.
Phase 4 — Visualizations Objective

Implement interactive charts per feature set.
Tasks

T4.1 P-Value Distribution:
Histogram that updates from results.
Vertical line at alpha; color bars to distinguish significant vs non-significant results.
T4.2 Confidence Interval Explorer:
Plot effect sizes with their 95% CIs across simulations.
T4.3 S-Value Information Dashboard:
View translating p-values to bits of information against the null (based on backend outputs).
T4.4 CI Precision vs Sample Size:
Interactive plot demonstrating narrowing CI width as sample size increases.
Inputs/Outputs

Inputs: Result datasets from backend.
Outputs: Rendered charts with interactivity.
Files

PValueChart.tsx, CIChart.tsx, and additional dedicated chart components for S-Value and precision vs N if needed.
Acceptance criteria

Charts render correctly given backend outputs.
P-Value histogram shows alpha threshold line and color coding as described.
CI Explorer displays simulated effect sizes with 95% CIs.
Notes

Charting library is not fixed in the document; select Recharts or D3.js and proceed.
Phase 5 — Integration and real-time behavior Objective

Provide responsive, near real-time feedback when running simulations.
Tasks

T5.1 Ensure results populate the P-value histogram immediately after runs are initiated, consistent with the mock flow.
T5.2 If streaming is chosen, render partial updates; if batching is chosen, ensure quick turnaround.
T5.3 Optimize rendering and data handling to maintain UI responsiveness.
Inputs/Outputs

Inputs: Finalized IPC pattern (stream vs batch).
Outputs: Progressive UI updates or quick completion with final data.
Files

Frontend and backend where needed.
Acceptance criteria

Users perceive immediate feedback on “Run Simulation” per the mock flow.
No frozen UI during computation on typical workloads.
Notes

Streaming vs batching is not specified; either approach is acceptable if it matches the “updates in real time” intent.
Phase 6 — Data export to CSV Objective

Allow users to export simulation outputs to CSV.
Tasks

T6.1 Define CSV schema covering p-values, effect sizes, and CIs as described.
T6.2 Implement export action in frontend and backend.
T6.3 Validate export on multiple OSes.
Inputs/Outputs

Inputs: Current results in memory.
Outputs: CSV file on disk.
Files

Frontend export UI; backend file writing if needed.
Acceptance criteria

Exported CSV includes p-values, effect sizes, and CIs as stated in the document.
Export succeeds without errors on supported platforms.
Notes

Specific CSV columns are not defined in the source; decide and document.
Phase 7 — Refinement and packaging Objective

Polish UI/UX and package app for multi-platform distribution.
Tasks

T7.1 Refine styling and usability across controls and charts.
T7.2 Package app builds for Windows, macOS, and Linux.
T7.3 Address performance profiling outcomes if required.
Inputs/Outputs

Inputs: Completed app.
Outputs: Installable packages per OS.
Files

Packaging configurations and assets as appropriate for Tauri.
Acceptance criteria

Application packages successfully for all three platforms.
UI is polished and consistent with the mock flow.
Notes

The document does not specify signing/notarization or store distribution steps.
Agent task matrix (IDs, dependencies, deliverables)

Phase 0

T0.1 → none; Deliverable: baseline Tauri + React-TS project.
T0.2 → T0.1; Deliverable: verified dev build.
T0.3 → T0.2; Deliverable: TS config and linting (if applicable).
T0.4 → T0.2; Deliverable: sidebar + tabs scaffold.
Phase 1

T1.1 → T0.1; Deliverable: data generation functions.
T1.2 → T1.1; Deliverable: t-tests and p-values.
T1.3 → T1.2; Deliverable: CI calculations and structures.
T1.4 → T1.2; Deliverable: s-value computations.
T1.5 → T1.3/T1.4; Deliverable: aggregated result structures.
T1.6 → T1.1–T1.5; Deliverable: input validation.
Phase 2

T2.1 → T1.5; Deliverable: Tauri commands in main.rs.
T2.2 → T2.1; Deliverable: input payload schema (parameters).
T2.3 → T2.1; Deliverable: result payload schemas.
T2.4 → T2.1–T2.3; Deliverable: error handling.
Phase 3

T3.1 → T0.4; Deliverable: ControlPanel.tsx with all inputs.
T3.2 → T0.4; Deliverable: DashboardView.tsx with tabs.
T3.3 → T2.1, T3.1; Deliverable: state wiring and run action.
T3.4 → T3.3; Deliverable: loading/error states.
Phase 4

T4.1 → T2.3, T3.2; Deliverable: PValueChart.tsx.
T4.2 → T2.3, T3.2; Deliverable: CI visualization.
T4.3 → T2.3, T3.2; Deliverable: S-Value view.
T4.4 → T2.3, T3.2; Deliverable: CI precision vs N chart.
Phase 5

T5.1 → T4.1; Deliverable: immediate histogram updates.
T5.2 → T5.1; Deliverable: streaming/batch implementation.
T5.3 → T5.1; Deliverable: optimized UI responsiveness.
Phase 6

T6.1 → T2.3, T4.*; Deliverable: CSV schema (documented).
T6.2 → T6.1; Deliverable: export action and file.
T6.3 → T6.2; Deliverable: cross-OS validation.
Phase 7

T7.1 → Phase 4/5/6; Deliverable: polished UI/UX.
T7.2 → all prior; Deliverable: packaged binaries for three OSes.
T7.3 → profiling; Deliverable: performance notes/fixes.
Proposed module and file mapping (source-backed names; locations indicative)

Backend (Rust/Tauri)
src-tauri/src/main.rs — exposes Tauri commands to JS.
src-tauri/src/simulations.rs — simulation logic: sampling, t-tests, CIs, S-values.
Frontend (React/TypeScript)
ControlPanel.tsx — all parameter inputs and “Run Simulation”.
DashboardView.tsx — tabs: P-Value Distribution, Confidence Intervals, S-Value Analysis.
PValueChart.tsx — histogram view with alpha threshold line and significance coloring.
CIChart.tsx — effect sizes with 95% CIs.
Additional chart components as needed for S-Value and CI precision vs sample size.
Frontend–backend interface (to be finalized)

Inputs from UI to backend must include:
Two group means and SDs, per-group sample sizes, number of simulations, hypothesized effect size, alpha level.
Outputs from backend must support:
P-value histogram rendering and significance counts vs alpha.
Effect sizes with associated 95% CIs for each simulation.
S-Value interpretation dataset.
CI width vs sample size data for visualization.
Note: Exact command names, streaming vs batch, and payload schemas are not specified in the source and must be agreed before implementation proceeds.
UI/UX behaviors (grounded by the document)

Sidebar allows setting both populations (means, SDs), per-group sample sizes, and number of simulations.
Main area has tabs: P-Value Distribution, Confidence Intervals, S-Value Analysis.
“Run Simulation” starts the process:
P-value histogram populates immediately.
Vertical line marks alpha; bars colored by significance.
CI tab shows a plot of effect sizes with their 95% CIs across simulations.
Testing and packaging (what is and isn’t specified)

Testing: The document does not specify a testing strategy. You may add unit tests for Rust computations and basic UI validation, but this is not described in the source.
Packaging: The document requires packaging for multi-platform distribution but does not specify signing, notarization, or distribution channels. Success criteria: builds produce installable artifacts for Windows, macOS, and Linux.
Deliverables checklist per phase

Phase 0: Running desktop shell; UI scaffold (sidebar, tabs).
Phase 1: simulations.rs with sampling, t-tests, CIs, S-values; validated and performant.
Phase 2: main.rs Tauri commands; defined request/response; error handling.
Phase 3: ControlPanel.tsx, DashboardView.tsx; state wiring; run action; loading/error UX.
Phase 4: PValueChart.tsx with alpha line and coloring; CI visualization; S-Value view; CI precision plot.
Phase 5: Immediate histogram updates; streaming/batch behavior; responsive UI under load.
Phase 6: CSV export of p-values, effect sizes, CIs.
Phase 7: Polished UI; packaged builds for Windows/macOS/Linux.
Summary

This plan restructures the source document into a phased, task-driven roadmap suitable for a coding agent. It preserves all features, architecture elements, and implementation steps explicitly stated, and highlights areas where the original document does not provide specifics. Before execution, resolve the noted open decisions (charting library, statistical details, IPC/streaming model, CSV schema) to avoid rework and ensure consistent implementations.