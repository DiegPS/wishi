import { useState, useEffect } from 'react';
import './style.css'; // Global styles
import { SyncHistory, GetInitialStats, LoadDataFromFrontend, GetAllWishes } from '../wailsjs/go/main/App';
import {
    EventsOn,
    EventsOff,
    Quit,
    WindowIsMaximised,
    WindowMinimise,
    WindowToggleMaximise,
} from '../wailsjs/runtime/runtime';
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
    const [isMaximised, setIsMaximised] = useState(false);
    
    // Default empty state
    const [stats, setStats] = useState<DashboardData | null>(null);

    useEffect(() => {
        // Load stats on mount from localStorage if it exists
        const savedData = localStorage.getItem('wishi_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                LoadDataFromFrontend(parsed).then(data => {
                    if (data && data.global && data.global.lifetimeWishes > 0) {
                        setStats(data);
                    }
                }).catch(err => console.error(err));
            } catch (err) {
                console.error("Failed parsing localStorage wishi_data", err);
            }
        } else {
            GetInitialStats().then(data => {
                if (data && data.global && data.global.lifetimeWishes > 0) {
                    setStats(data);
                }
            }).catch(err => console.error(err));
        }

        WindowIsMaximised()
            .then(setIsMaximised)
            .catch(err => console.error(err));

        // Listen for Go Events
        EventsOn("syncProgress", (msg: string) => {
            setProgressMsg(msg);
        });

        // Event for Server-Sent-Events style real-time updating of Dashboard
        EventsOn("syncStats", (currentStats: DashboardData) => {
            if (currentStats && currentStats.global) {
                setStats(currentStats);
            }
        });

        return () => {
            EventsOff("syncProgress");
            EventsOff("syncStats");
        }
    }, []);

    const handleToggleMaximise = async () => {
        WindowToggleMaximise();
        try {
            const maximised = await WindowIsMaximised();
            setIsMaximised(maximised);
        } catch (err) {
            console.error(err);
        }
    };

    // Handler for Sync Button
    const handleSync = async () => {
        setIsSyncing(true);
        setProgressMsg('Iniciando...');
        try {
            const result = await SyncHistory();
            if (result.success) {
                setStats(result.stats);
                // Save fully synced database to localStorage
                const allWishes = await GetAllWishes();
                localStorage.setItem('wishi_data', JSON.stringify(allWishes || []));
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Titlebar fixed and full width at the top */}
            <div className="wails-titlebar wails-drag-region" onDoubleClick={handleToggleMaximise}>
                <div className="wails-title">WISHI</div>
                <div className="wails-window-controls wails-no-drag">
                    <button
                        className="wails-window-button"
                        onClick={() => WindowMinimise()}
                        aria-label="Minimizar"
                        title="Minimizar"
                    >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 5.5H10.5" stroke="currentColor" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <button
                        className="wails-window-button"
                        onClick={handleToggleMaximise}
                        aria-label={isMaximised ? 'Restaurar' : 'Maximizar'}
                        title={isMaximised ? 'Restaurar' : 'Maximizar'}
                    >
                        {isMaximised ? (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2.5" y="0.5" width="8" height="8" stroke="currentColor"/>
                                <path d="M0.5 2.5V10.5H8.5" stroke="currentColor"/>
                            </svg>
                        ) : (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.5" y="0.5" width="10" height="10" stroke="currentColor"/>
                            </svg>
                        )}
                    </button>
                    <button
                        className="wails-window-button wails-window-button-close"
                        onClick={() => Quit()}
                        aria-label="Cerrar"
                        title="Cerrar"
                    >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* Scrollable container for the app content */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
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
                </div>
            </div>
        </div>
    );
}

export default App;

