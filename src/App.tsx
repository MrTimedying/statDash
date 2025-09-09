import ControlPanel, { AppProvider } from './ControlPanel'
import DashboardView from './DashboardView'
import './App.css'

function App() {
  return (
    <AppProvider>
      <div className="App">
        <header className="app-header">
          <h1>StatDash - Statistical Simulations Dashboard</h1>
        </header>
        <div className="app-main">
          <aside className="app-sidebar">
            <ControlPanel />
          </aside>
          <main className="app-content">
            <DashboardView />
          </main>
        </div>
      </div>
    </AppProvider>
  )
}

export default App