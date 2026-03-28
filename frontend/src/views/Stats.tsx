import React, { useEffect, useState, useMemo } from 'react';
import { GetWishHistory } from '../../wailsjs/go/main/App';
import type { main } from '../../wailsjs/go/models';

const ProgressBar = ({ label, value, main, global }: { label: string; value: string; main: number; global: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</span>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
            {/* Global average track */}
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${global}%`, background: 'rgba(255,255,255,0.15)', borderRadius: '4px', zIndex: 1 }} />
            {/* Main user track */}
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${main}%`, background: 'var(--color-gold)', borderRadius: '4px', zIndex: 2 }} />
        </div>
    </div>
);

const LegendRow = ({ color, label, value }: { color: string; label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: color, fontWeight: 700 }}>{value}</span>
    </div>
);

export function Stats() {
    const [history, setHistory] = useState<main.WishRecord[]>([]);
    const [chartTab, setChartTab] = useState<'Event' | 'Weapon'>('Event');

    useEffect(() => {
        GetWishHistory(0, 0).then(data => {
            if (data) {
                // Backend returns DESC by default. Reverse to oldest -> newest for accurate pity calculation
                setHistory([...data].reverse());
            }
        });
    }, []);

    const graphData = useMemo(() => {
        let pityMap: Record<string, number> = {};
        let fiveStars: { date: string, pity: number, banner: string, id: number }[] = [];

        // Compute pity sequentially
        history.forEach(w => {
            const banner = w.gacha_type === '400' ? '301' : w.gacha_type;
            pityMap[banner] = (pityMap[banner] || 0) + 1;

            if (w.rank_type === '5') {
                fiveStars.push({
                    id: w.id,
                    date: w.time,
                    pity: pityMap[banner],
                    banner: banner
                });
                pityMap[banner] = 0; // Reset pity for this banner
            }
        });

        const targetBanner = chartTab === 'Event' ? '301' : '302';
        const active = fiveStars.filter(f => f.banner === targetBanner);

        const svgW = 320;
        const maxPity = 90;

        let points = active.map((v, i) => {
            const x = active.length === 1 ? svgW / 2 : (i / (active.length - 1)) * svgW;
            const y = (1 - (v.pity / maxPity)) * 130 + 10; // invert Y: 90 pity is near top (y=10)
            return { x, y, ...v };
        });

        let dLine = `M 0 140 L 320 140`;
        let dFill = `M 0 140 L 320 140 L 320 150 L 0 150 Z`;
        let labels: string[] = [];

        if (points.length === 1) {
            dLine = `M 0 ${points[0].y} L 320 ${points[0].y}`;
            dFill = `M 0 ${points[0].y} L 320 ${points[0].y} L 320 150 L 0 150 Z`;
            labels = [points[0].date];
        } else if (points.length > 1) {
            dLine = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i+1];
                const cpX = (curr.x + next.x) / 2;
                dLine += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
            }
            dFill = dLine + ` L ${points[points.length-1].x} 150 L ${points[0].x} 150 Z`;

            if (points.length <= 4) {
                labels = points.map(p => p.date);
            } else {
                for(let i = 0; i < 4; i++) {
                    const idx = Math.floor(i * (points.length - 1) / 3);
                    labels.push(points[idx].date);
                }
            }
        }

        labels = labels.map(d => {
            const dt = new Date(d);
            return dt.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).toUpperCase();
        });

        // Ensure 4 empty labels if no data
        while (labels.length > 0 && labels.length < 4) labels.push('');
        if (labels.length === 0) labels = ['NO DATA', '', '', ''];

        return { dLine, dFill, points, labels };
    }, [history, chartTab]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
            
            {/* Top Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        Astral Probability <span style={{ color: 'var(--color-gold)', fontStyle: 'italic', fontWeight: 700 }}>Insights</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '12px', lineHeight: 1.6 }}>
                        A comprehensive overview of your journey through the stars. We've analyzed 2,458 wishes across all active banners to determine your cosmic resonance.
                    </p>
                </div>
                
                <div className="glass-panel" style={{ 
                    padding: '20px 28px', 
                    display: 'flex', 
                    gap: '32px',
                    borderLeft: '4px solid var(--color-gold)',
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    borderRadius: '0 8px 8px 0',
                    minWidth: '240px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Luck Rating</span>
                        <span style={{ fontSize: '2.4rem', color: 'var(--color-gold)', fontWeight: 800, lineHeight: 1.2 }}>Top 4.2%</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>↗ +12.5%</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>Compared to<br/>all Travelers</span>
                    </div>
                </div>
            </div>

            {/* Middle Section Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
                
                {/* Chart Left */}
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gridColumn: '1 / span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Pull Luck Variance</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Probability trend over the last 12 months</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '24px' }}>
                            <button 
                                onClick={() => setChartTab('Event')}
                                style={{ 
                                    background: chartTab === 'Event' ? 'rgba(255,255,255,0.1)' : 'transparent', 
                                    color: chartTab === 'Event' ? 'var(--text-primary)' : 'var(--text-muted)', 
                                    border: 'none', padding: '6px 18px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                                }}>
                                Event
                            </button>
                            <button 
                                onClick={() => setChartTab('Weapon')}
                                style={{ 
                                    background: chartTab === 'Weapon' ? 'rgba(255,255,255,0.1)' : 'transparent', 
                                    color: chartTab === 'Weapon' ? 'var(--text-primary)' : 'var(--text-muted)', 
                                    border: 'none', padding: '6px 18px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                                }}>
                                Weapon
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative', minHeight: '220px', display: 'flex', gap: '16px' }}>
                        {/* Y Axis Guide */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '50px', paddingBottom: '24px', paddingTop: '10px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PITY 90</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PITY 45</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PITY 0</span>
                        </div>

                        {/* Chart Area */}
                        <div style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
                            <svg viewBox="0 0 320 150" preserveAspectRatio="none" style={{ width: '100%', height: 'calc(100% - 30px)', overflow: 'visible' }}>
                                <defs>
                                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                
                                {/* Fill path */}
                                <path d={graphData.dFill} fill="url(#goldGrad)" style={{ mixBlendMode: 'plus-lighter', transition: 'd 0.5s ease' }} />
                                
                                {/* Line path */}
                                <path d={graphData.dLine} fill="none" stroke="var(--color-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 2px 12px rgba(233, 193, 122, 0.7))', transition: 'd 0.5s ease' }} />
                                
                                {/* Points */}
                                {graphData.points.map((p, i) => (
                                    <circle key={p.id} cx={p.x} cy={p.y} r="4" fill="var(--bg-card)" stroke="var(--color-gold)" strokeWidth="2" style={{ transition: 'all 0.5s ease' }}>
                                        <title>{`Pity: ${p.pity} \nDate: ${new Date(p.date).toLocaleDateString()}`}</title>
                                    </circle>
                                ))}
                            </svg>

                            {/* X Axis Guide */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '0 10px' }}>
                                {graphData.labels.map((lbl, i) => (
                                    <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>{lbl}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donut Chart Right */}
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Rarity Sphere</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '32px', fontWeight: 500 }}>Overall wish distribution</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                            <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
                                {/* 3-star (Background/Base) */}
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                                {/* 4-star (Purple ~14.8%) */}
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--rarity-4)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.148)} /> 
                                {/* 5-star (Gold ~1.6%) */}
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-gold)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.016)} />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>2.4k</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginTop: '4px' }}>TOTAL</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
                        <LegendRow color="var(--color-gold)" label="5-Star Manifests" value="1.6%" />
                        <LegendRow color="var(--rarity-4)" label="4-Star Manifests" value="13.2%" />
                        <LegendRow color="var(--text-muted)" label="3-Star Manifests" value="85.2%" />
                    </div>
                </div>
            </div>

            {/* Bottom Card */}
            <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Luck Calibration</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', fontWeight: 500 }}>Efficiency across different celestial paths.</p>
                        </div>
                        
                        <div style={{ 
                            background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1), transparent)', 
                            padding: '24px', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(168, 85, 247, 0.15)', 
                            borderLeft: '4px solid var(--rarity-4)' 
                        }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--rarity-4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Luckiest Banner</span>
                            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.01em' }}>Incarnation</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>Average 5★ at 58 pulls</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Efficiency vs Global Avg</span>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)' }}></div>You</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>Global</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <ProgressBar label="Character Event" value="+18% Over Avg" main={65} global={80} />
                            <ProgressBar label="Weapon Event" value="+5% Over Avg" main={55} global={50} />
                            <ProgressBar label="Standard Permanent" value="-2% Under Avg" main={40} global={50} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
