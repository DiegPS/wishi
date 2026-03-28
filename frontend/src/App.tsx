import { useState, useEffect } from 'react';
import './style.css'; // Global styles
import { SyncHistory, GetInitialStats } from '../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../wailsjs/runtime/runtime';
import type { main } from '../wailsjs/go/models';

// Views
import { Dashboard } from './views/Dashboard';
import { Archive } from './views/Archive';
import { Stats } from './views/Stats';
import { Vault } from './views/Vault';

type DashboardData = main.DashboardData;
type ViewType = 'dashboard' | 'archive' | 'stats' | 'vault';

// App component
function App() {
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [isSyncing, setIsSyncing] = useState(false);
    const [progressMsg, setProgressMsg] = useState('');
    
    // Default empty state
    const [stats, setStats] = useState<DashboardData | null>(null);

    useEffect(() => {
        // Load stats on mount
        GetInitialStats().then(data => {
            if (data && data.global && data.global.lifetimeWishes > 0) {
                setStats(data);
            }
        }).catch(err => console.error(err));

        // Listen for Go Events
        EventsOn("syncProgress", (msg: string) => {
            setProgressMsg(msg);
        });

        return () => {
            EventsOff("syncProgress");
        }
    }, []);

    // Handler for Sync Button
    const handleSync = async () => {
        setIsSyncing(true);
        setProgressMsg('Iniciando...');
        try {
            const result = await SyncHistory();
            if (result.success) {
                setStats(result.stats);
            } else {
                alert("Error: " + result.error);
            }
        } catch (e) {
            alert("Exception calling Go backend: " + String(e));
        } finally {
            setIsSyncing(false);
            setProgressMsg('');
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard stats={stats} />;
            case 'archive': return <Archive />;
            case 'stats': return <Stats />;
            case 'vault': return <Vault />;
            default: return <Dashboard stats={stats} />;
        }
    };

    return (
        <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Celestial Top Navigation */}
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '24px 40px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(16, 19, 26, 0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                    <div onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)', letterSpacing: '-0.02em' }}>
                            CELESTIAL ARCHIVIST
                        </h1>
                    </div>
                    
                    <nav style={{ display: 'flex', gap: '32px' }}>
                        {(['dashboard', 'archive', 'stats', 'vault'] as ViewType[]).map((view) => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: currentView === view ? 'var(--color-gold)' : 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    padding: '8px 0',
                                    borderBottom: `2px solid ${currentView === view ? 'var(--color-gold)' : 'transparent'}`,
                                }}
                            >
                                {view}
                            </button>
                        ))}
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {isSyncing && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {progressMsg}
                        </span>
                    )}
                    <button 
                        className="button-primary" 
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync History'}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ padding: '40px', flex: 1 }}>
                {renderView()}
            </main>

            {/* Footer */}
            <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Aetheric Horizon System v1.0 • Built with Wails & React
                </p>
            </footer>
        </div>
    );
}

export default App;

