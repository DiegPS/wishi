import React from 'react';
import { BannerCard } from '../components/BannerCard';
import { WishStats } from '../components/WishStats';
import { DashboardData } from '../store/useWishesStore';

interface DashboardProps {
    stats: DashboardData | null;
}

export function Dashboard({ stats }: DashboardProps) {
    const charStats = stats?.character || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const weaponStats = stats?.weapon || { totalWishes: 0, pity5: 0, maxPity5: 80, pity4: 0, maxPity4: 10 };
    const standardStats = stats?.standard || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const chronicledStats = stats?.chronicled || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const globalStats = stats?.global || { lifetimeWishes: 0, primogems: 0, luck5Star: 0, luck4Star: 0 };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* Header / Global KPIs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
                        Omnipresent Observation
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, marginTop: '8px' }}>
                        Real-time Astral Manifestation Summary
                    </p>
                </div>

                <button 
                    className="button-primary" 
                    style={{ 
                        padding: '14px 32px', 
                        fontSize: '1rem', 
                        borderWidth: '2px', 
                        boxShadow: '0 0 30px rgba(233, 193, 122, 0.1)',
                        fontWeight: 800
                    }}
                    onClick={() => alert("Simulation module syncing with Celestial Leylines...")}
                >
                    ✦ SIMULATE WISH
                </button>
            </div>

            {/* Quick KPI Cards (Small stats box) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Wishes</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-gold)' }}>{globalStats.lifetimeWishes.toLocaleString()}</span>
                </div>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invested Primogems</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{globalStats.primogems.toLocaleString()} ✦</span>
                </div>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Luck Accuracy</span>
                    <span className="text-gold" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{globalStats.luck5Star > 0 ? globalStats.luck5Star.toFixed(1) : '—'}</span>
                </div>
            </div>

            {/* Banners Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '32px' 
            }}>
                <BannerCard 
                    title="Character Banner" 
                    totalWishes={charStats.totalWishes} 
                    pity5={charStats.pity5} maxPity5={charStats.maxPity5} 
                    pity4={charStats.pity4} maxPity4={charStats.maxPity4} 
                />
                <BannerCard 
                    title="Weapon Invocation" 
                    totalWishes={weaponStats.totalWishes} 
                    pity5={weaponStats.pity5} maxPity5={weaponStats.maxPity5} 
                    pity4={weaponStats.pity4} maxPity4={weaponStats.maxPity4} 
                />
                <BannerCard 
                    title="Wanderlust Invocation" 
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

            {/* Detailed Stats Widget */}
            <WishStats 
                lifetimeWishes={globalStats.lifetimeWishes}
                primogems={globalStats.primogems}
                luck5Star={globalStats.luck5Star > 0 ? globalStats.luck5Star.toFixed(1) : 'N/A'}
                luck4Star={globalStats.luck4Star > 0 ? globalStats.luck4Star.toFixed(1) : 'N/A'}
            />
        </div>
    );
}
