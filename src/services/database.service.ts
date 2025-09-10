import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { SimulationSession, SamplePair, MultiPairResults } from '../types/simulation.types';

class DatabaseService {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize SQL.js
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });

      // Create database
      this.db = new this.SQL.Database();

      // Create tables
      await this.createTables();

      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      // Sessions table
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        parameters TEXT NOT NULL,
        results TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 0
      )`,

      // Sample pairs table
      `CREATE TABLE IF NOT EXISTS sample_pairs (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        group1_params TEXT NOT NULL,
        group2_params TEXT NOT NULL,
        sample_size INTEGER NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )`,

      // Simulation results table
      `CREATE TABLE IF NOT EXISTS simulation_results (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        pair_id TEXT NOT NULL,
        result_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (pair_id) REFERENCES sample_pairs(id) ON DELETE CASCADE
      )`,

      // UI preferences table
      `CREATE TABLE IF NOT EXISTS ui_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_sample_pairs_session ON sample_pairs(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_simulation_results_session ON simulation_results(session_id)`,
    ];

    for (const query of queries) {
      this.db.run(query);
    }
  }

  // Session management
  async saveSession(session: SimulationSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const parameters = JSON.stringify(session.parameters);
    const results = session.results ? JSON.stringify(session.results) : null;

    this.db.run(
      `INSERT OR REPLACE INTO sessions
       (id, name, description, parameters, results, created_at, updated_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.name,
        session.description || null,
        parameters,
        results,
        session.created_at.toISOString(),
        session.updated_at.toISOString(),
        session.is_active ? 1 : 0,
      ]
    );

    // Save sample pairs
    await this.saveSamplePairs(session.id, session.parameters.pairs);
  }

  private async saveSamplePairs(sessionId: string, pairs: SamplePair[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete existing pairs for this session
    this.db.run('DELETE FROM sample_pairs WHERE session_id = ?', [sessionId]);

    // Insert new pairs
    for (const pair of pairs) {
      const group1Params = JSON.stringify(pair.group1);
      const group2Params = JSON.stringify(pair.group2);

      this.db.run(
        `INSERT INTO sample_pairs
         (id, session_id, name, group1_params, group2_params, sample_size, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          pair.id,
          sessionId,
          pair.name,
          group1Params,
          group2Params,
          pair.sample_size_per_group,
          pair.enabled ? 1 : 0,
        ]
      );
    }
  }

  async loadSession(sessionId: string): Promise<SimulationSession | null> {
    if (!this.db) throw new Error('Database not initialized');

    // Load session
    const sessionResult = this.db.exec(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );

    if (sessionResult.length === 0 || sessionResult[0].values.length === 0) {
      return null;
    }

    const sessionRow = sessionResult[0].values[0] as any[];
    const sessionData = {
      id: sessionRow[0],
      name: sessionRow[1],
      description: sessionRow[2],
      parameters: JSON.parse(sessionRow[3]),
      results: sessionRow[4] ? JSON.parse(sessionRow[4]) : null,
      created_at: new Date(sessionRow[5]),
      updated_at: new Date(sessionRow[6]),
      is_active: sessionRow[7] === 1,
    };

    // Load sample pairs
    const pairsResult = this.db.exec(
      'SELECT * FROM sample_pairs WHERE session_id = ?',
      [sessionId]
    );

    if (pairsResult.length > 0 && pairsResult[0].values.length > 0) {
      const pairs: SamplePair[] = pairsResult[0].values.map((row: any[]) => ({
        id: row[0],
        name: row[2],
        group1: JSON.parse(row[3]),
        group2: JSON.parse(row[4]),
        sample_size_per_group: row[5],
        enabled: row[6] === 1,
      }));

      sessionData.parameters.pairs = pairs;
    }

    return sessionData;
  }

  async getSessionHistory(limit: number = 50): Promise<SimulationSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT id FROM sessions ORDER BY updated_at DESC LIMIT ?',
      [limit]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const sessionIds = result[0].values.map((row: any[]) => row[0] as string);
    const sessions: SimulationSession[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.loadSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
    // Foreign key constraints will handle cascading deletes
  }

  // UI Preferences
  async saveUIPreference(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const valueStr = JSON.stringify(value);

    this.db.run(
      'INSERT OR REPLACE INTO ui_preferences (key, value, updated_at) VALUES (?, ?, ?)',
      [key, valueStr, new Date().toISOString()]
    );
  }

  async loadUIPreference(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT value FROM ui_preferences WHERE key = ?',
      [key]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const valueStr = result[0].values[0][0] as string;
    return JSON.parse(valueStr);
  }

  async loadAllUIPreferences(): Promise<Record<string, any>> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT key, value FROM ui_preferences');

    if (result.length === 0 || result[0].values.length === 0) {
      return {};
    }

    const preferences: Record<string, any> = {};
    for (const row of result[0].values) {
      const [key, valueStr] = row as [string, string];
      preferences[key] = JSON.parse(valueStr);
    }

    return preferences;
  }

  // Database maintenance
  async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.SQL) throw new Error('SQL.js not initialized');

    this.db = new this.SQL.Database(data);
    this.initialized = true;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = ['simulation_results', 'sample_pairs', 'sessions', 'ui_preferences'];
    for (const table of tables) {
      this.db.run(`DELETE FROM ${table}`);
    }
  }

  // Status check
  isInitialized(): boolean {
    return this.initialized && this.db !== null;
  }

  // Cleanup
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService();

// Helper hook for React components
export const useDatabase = () => {
  const initialize = () => databaseService.initialize();
  const saveSession = (session: SimulationSession) => databaseService.saveSession(session);
  const loadSession = (sessionId: string) => databaseService.loadSession(sessionId);
  const getSessionHistory = (limit?: number) => databaseService.getSessionHistory(limit);
  const deleteSession = (sessionId: string) => databaseService.deleteSession(sessionId);

  return {
    initialize,
    saveSession,
    loadSession,
    getSessionHistory,
    deleteSession,
  };
};