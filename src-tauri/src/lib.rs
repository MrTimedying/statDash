mod simulations;

use simulations::{SimulationParams, AggregatedResults, run_simulation, export_to_csv};
use tauri::command;

#[command]
async fn run_statistical_simulation(params: SimulationParams) -> Result<AggregatedResults, String> {
    // Run simulation in a separate thread to avoid blocking the UI
    tokio::task::spawn_blocking(move || {
        run_simulation(params)
    }).await.map_err(|e| format!("Task execution error: {}", e))?
}

#[command]
async fn get_simulation_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "version": "1.0.0",
        "capabilities": [
            "statistical_simulations",
            "p_value_analysis",
            "confidence_intervals",
            "s_value_computation",
            "csv_export"
        ],
        "max_simulations": 100000,
        "supported_distributions": ["normal"]
    }))
}

#[command]
async fn export_simulation_csv(results: AggregatedResults) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        export_to_csv(&results)
    }).await.map_err(|e| format!("Task execution error: {}", e))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        run_statistical_simulation,
        get_simulation_info,
        export_simulation_csv
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
