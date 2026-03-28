import React, { useEffect, useState } from 'react';
import { GetWishHistory } from '../../wailsjs/go/main/App';
import type { main } from '../../wailsjs/go/models';

type WishRecord = main.WishRecord;

export function Archive() {
    const [history, setHistory] = useState<WishRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await GetWishHistory(50, 0);
                setHistory(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, []);

    const getRarityClass = (rank: string) => {
        if (rank === '5') return 'text-5star';
        if (rank === '4') return 'text-purple';
        return 'text-blue';
    };

    const getBannerName = (gt: string) => {
        const names: Record<string, string> = {
            '301': 'Character (1)',
            '400': 'Character (2)',
            '302': 'Weapon',
            '200': 'Standard',
            '500': 'Chronicled',
        };
        return names[gt] || gt;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ padding: '0 8px' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.01em' }}>
                    Astral Archive
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Historical Audit of Celestial Manifestations
                </p>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Type</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rarity</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Banner</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Reading the Stars...
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No manifestations found in the records.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item, idx) => (
                                    <tr key={item.id} style={{ 
                                        borderBottom: '1px solid var(--border-subtle)', 
                                        transition: 'background 0.2s ease',
                                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'
                                    }}>
                                        <td style={{ padding: '14px 24px', fontWeight: 600 }} className={getRarityClass(item.rank_type)}>
                                            {item.name}
                                        </td>
                                        <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{item.item_type}</td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                gap: '2px', 
                                                color: item.rank_type === '5' ? 'var(--rarity-5)' : item.rank_type === '4' ? 'var(--rarity-4)' : 'var(--rarity-3)'
                                            }}>
                                                {'★'.repeat(parseInt(item.rank_type))}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {getBannerName(item.gacha_type)}
                                        </td>
                                        <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                            {item.time}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Showing latest 50 results
                    </p>
                </div>
            </div>
        </div>
    );
}
