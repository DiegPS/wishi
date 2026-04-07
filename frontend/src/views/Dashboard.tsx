import React from 'react';
import { BannerCard } from '../components/BannerCard';
import { DashboardData } from '../store/useWishesStore';
import { useAlerts } from '../components/alerts/AlertsProvider';

interface DashboardProps {
    stats: DashboardData | null;
}

export function Dashboard({ stats }: DashboardProps) {
    const { notify } = useAlerts();
    const charStats = stats?.character || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const weaponStats = stats?.weapon || { totalWishes: 0, pity5: 0, maxPity5: 80, pity4: 0, maxPity4: 10 };
    const standardStats = stats?.standard || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const chronicledStats = stats?.chronicled || { totalWishes: 0, pity5: 0, maxPity5: 90, pity4: 0, maxPity4: 10 };
    const globalStats = stats?.global || { lifetimeWishes: 0, promotionalWishes: 0, standardWishes: 0, promotionalPrimogems: 0, luck5Star: 0, luck4Star: 0 };

    // Calculate which banner is closest to hitting pity
    const banners = [
        { name: 'Character Banner', pity: charStats.pity5, max: charStats.maxPity5, soft: 74 },
        { name: 'Weapon Invocation', pity: weaponStats.pity5, max: weaponStats.maxPity5, soft: 63 },
        { name: 'Wanderlust Invocation', pity: standardStats.pity5, max: standardStats.maxPity5, soft: 74 },
        { name: 'Chronicled Wish', pity: chronicledStats.pity5, max: chronicledStats.maxPity5, soft: 74 },
    ];

    const closestBanner = banners.reduce((prev, current) => {
        return (prev.pity / prev.max) > (current.pity / current.max) ? prev : current;
    });

    const pullsToSoftPity = Math.max(0, closestBanner.soft - closestBanner.pity);
    const pullsToHardPity = closestBanner.max - closestBanner.pity;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* Header / Global KPIs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
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
                    onClick={() => notify({
                        type: 'info',
                        title: 'Simulation pending',
                        message: 'Wish simulation module is not available yet.',
                    })}
                >
                    ✦ SIMULATE WISH
                </button>
            </div>

            {/* Expanded KPI Grid (Replacing bottom WishStats) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.03, fontSize: '120px', pointerEvents: 'none' }}>✦</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Wishes</span>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{globalStats.lifetimeWishes.toLocaleString()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lifetime manifestations</span>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Promo Investment</span>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {globalStats.promotionalPrimogems.toLocaleString()} <span style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}>✦</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{globalStats.promotionalWishes.toLocaleString()} promo · {globalStats.standardWishes.toLocaleString()} std</span>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>5★ Resonance (Luck)</span>
                    <span className="text-5star" style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{globalStats.luck5Star > 0 ? globalStats.luck5Star.toFixed(1) : '—'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg pulls per 5★</span>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>4★ Resonance (Luck)</span>
                    <span className="text-purple" style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{globalStats.luck4Star > 0 ? globalStats.luck4Star.toFixed(1) : '—'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg pulls per 4★</span>
                </div>
            </div>

            {/* Actionable Insight */}
            {closestBanner.pity > 0 && (
                <div className="glass-panel" style={{ 
                    padding: '20px 24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    borderLeft: '4px solid var(--color-gold)',
                    background: 'linear-gradient(90deg, rgba(233, 193, 122, 0.08) 0%, rgba(25, 27, 35, 0.4) 100%)'
                }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(233, 193, 122, 0.15)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' 
                    }}>
                        ★
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: 0, marginBottom: '4px' }}>
                            Closest to Pity: <span className="text-gold">{closestBanner.name}</span>
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            Currently at <strong>{closestBanner.pity}</strong> pulls. 
                            {pullsToSoftPity > 0 
                                ? ` Just ${pullsToSoftPity} more pulls until soft pity begins!` 
                                : ` You are in soft pity territory! Hard pity in ${pullsToHardPity} pulls.`}
                        </p>
                    </div>
                </div>
            )}

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
        </div>
    );
}
