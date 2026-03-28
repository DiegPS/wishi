import { useState, useEffect } from 'react';
import './style.css'; // Global styles
import { BannerCard } from './components/BannerCard';
import { WishStats } from './components/WishStats';
import { SyncHistory, GetInitialStats } from '../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../wailsjs/runtime/runtime';
import type { main } from '../wailsjs/go/models';

type DashboardData = main.DashboardData;

// App component
function App() {
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

    const charStats = stats?.character || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const weaponStats = stats?.weapon || { totalWishes: 0, pity5: 0, maxPity5: 80, pity4: 0, maxPity4: 10 };
    const standardStats = stats?.standard || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const chronicledStats = stats?.chronicled || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const globalStats = stats?.global || { lifetimeWishes: 0, primogems: 0, luck5Star: 0, luck4Star: 0 };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Wishi Tracker</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Genshin Impact Pull Statistics</p>
                </div>
                <button 
                    className="button-primary" 
                    onClick={handleSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? (progressMsg || 'Syncing...') : 'Sync History'}
                </button>
            </div>

            {/* Banners Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '24px' 
            }}>
                <BannerCard 
                    title="Character Event" 
                    totalWishes={charStats.totalWishes} 
                    pity5={charStats.pity5} maxPity5={charStats.maxPity5} 
                    pity4={charStats.pity4} maxPity4={charStats.maxPity4} 
                />
                <BannerCard 
                    title="Weapon Event" 
                    totalWishes={weaponStats.totalWishes} 
                    pity5={weaponStats.pity5} maxPity5={weaponStats.maxPity5} 
                    pity4={weaponStats.pity4} maxPity4={weaponStats.maxPity4} 
                />
                <BannerCard 
                    title="Standard Banner" 
                    totalWishes={standardStats.totalWishes} 
                    pity5={standardStats.pity5} maxPity5={standardStats.maxPity5} 
                    pity4={standardStats.pity4} maxPity4={standardStats.maxPity4} 
                />
                <BannerCard 
                    title="Chronicled Wish" 
                    totalWishes={chronicledStats.totalWishes} 
                    pity5={chronicledStats.pity5} maxPity5={chronicledStats.maxPity5} 
                    pity4={chronicledStats.pity4} maxPity4={chronicledStats.maxPity4} 
                />
            </div>

            {/* Global Stats Section */}
            <WishStats 
                lifetimeWishes={globalStats.lifetimeWishes}
                primogems={globalStats.primogems}
                luck5Star={globalStats.luck5Star > 0 ? globalStats.luck5Star.toFixed(1) : 'N/A'}
                luck4Star={globalStats.luck4Star > 0 ? globalStats.luck4Star.toFixed(1) : 'N/A'}
            />
        </div>
    );
}

export default App;
