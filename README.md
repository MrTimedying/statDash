# StatDash - Statistical Simulations Dashboard

StatDash is a high-performance, cross-platform desktop application that enables users to run and visualize statistical simulations in real time to learn statistical principles.

## Features

- Interactive simulation controls for setting population parameters
- Real-time visualizations including:
  - P-value distribution histogram with alpha threshold indicator
  - Confidence Interval (CI) Explorer showing the "dance" of confidence intervals
  - S-Value information dashboard for interpreting p-values as Shannon information
  - CI precision vs. sample size plot
- High-performance simulations using Rust backend
- Export simulation results to CSV

## Tech Stack

- **Application Framework**: Tauri
- **Frontend**: React + Vite with TypeScript
- **Backend/Core Logic**: Rust
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Rust and Cargo (latest stable)
- Tauri CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/statdash.git
   cd statdash
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Tauri CLI globally:
   ```bash
   npm install -g @tauri-apps/cli
   ```

### Development

To run the development server:
```bash
npm run dev
```

To build the application:
```bash
npm run build
```

### Building for Production

To build the desktop application for your platform:
```bash
tauri build
```

## Project Structure

- `src/` - Frontend React components
- `src-tauri/` - Tauri backend code (Rust)
- `src-tauri/src/simulations.rs` - Core simulation logic
- `src-tauri/src/main.rs` - Tauri command handlers

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE.md](LICENSE.md) file for details.