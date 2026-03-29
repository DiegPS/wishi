import React, { useEffect, useState, useMemo } from 'react';
import { useWishesStore } from '../store/useWishesStore';

export function Archive() {
    const allHistory = useWishesStore(state => state.wishes);
    const isLoading = false; // Zustand state is synchronous from localStorage
    
    // Filters and Settings
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRarity, setFilterRarity] = useState('All');
    const [filterBanner, setFilterBanner] = useState('All');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRarity, filterBanner, sortOrder, itemsPerPage]);

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

    // Client-side processing (Filter & Sort)
    const filteredAndSortedHistory = useMemo(() => {
        let results = [...allHistory];

        // Filter by Rarity
        if (filterRarity !== 'All') {
            results = results.filter(w => w.rank_type === filterRarity);
        }

        // Filter by Banner
        if (filterBanner !== 'All') {
            // Note: 301 and 400 are usually treated together, but if user picks specific we filter exactly
            // If they pick Character we can match both, or just exact match. Let's do exact match for now, or group.
            if (filterBanner === 'Character') {
                results = results.filter(w => w.gacha_type === '301' || w.gacha_type === '400');
            } else {
                results = results.filter(w => w.gacha_type === filterBanner);
            }
        }

        // Search Term
        if (searchTerm.trim() !== '') {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(w => w.name.toLowerCase().includes(lowerTerm));
        }

        // Sorting
        results.sort((a, b) => {
            // Dates are typically "YYYY-MM-DD HH:MM:SS"
            const dateA = new Date(a.time).getTime();
            const dateB = new Date(b.time).getTime();
            
            if (sortOrder === 'newest') return dateB - dateA;
            return dateA - dateB;
        });

        return results;
    }, [allHistory, filterRarity, filterBanner, searchTerm, sortOrder]);

    // Pagination Calculation
    const totalItems = filteredAndSortedHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredAndSortedHistory.slice(startIndex, startIndex + itemsPerPage);

    // Common styling for Selects/Inputs
    const controlStyle: React.CSSProperties = {
        background: 'rgba(25, 27, 35, 0.8)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '0.85rem',
        outline: 'none',
        fontFamily: 'inherit',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.01em' }}>
                        Astral Archive
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                        Comprehensive Record of Celestial Manifestations
                    </p>
                </div>
                
                {/* Global Stats Summary */}
                <div style={{ display: 'flex', gap: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Total Records</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gold)' }}>{allHistory.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Found</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalItems}</span>
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="Search name..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ ...controlStyle, flex: '1', minWidth: '200px' }}
                />

                <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} style={controlStyle}>
                    <option value="All">All Rarities</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                </select>

                <select value={filterBanner} onChange={e => setFilterBanner(e.target.value)} style={controlStyle}>
                    <option value="All">All Banners</option>
                    <option value="Character">Character Event</option>
                    <option value="302">Weapon Event</option>
                    <option value="200">Standard</option>
                    <option value="500">Chronicled</option>
                </select>

                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} style={controlStyle}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
                
                <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} style={controlStyle}>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowX: 'auto', minHeight: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-subtle)' }}>
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
                                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gold)', fontWeight: 600 }}>
                                        ✦ Reading the Stars...
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No manifestations found for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item, idx) => (
                                    <tr key={item.id} style={{ 
                                        borderBottom: '1px solid var(--border-subtle)', 
                                        transition: 'background 0.2s ease',
                                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                                    }}>
                                        <td style={{ padding: '14px 24px', fontWeight: 600 }} className={getRarityClass(item.rank_type)}>
                                            {item.name}
                                        </td>
                                        <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{item.item_type}</td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                gap: '2px', 
                                                fontSize: '0.9rem',
                                                color: item.rank_type === '5' ? 'var(--rarity-5)' : item.rank_type === '4' ? 'var(--rarity-4)' : 'var(--rarity-3)'
                                            }}>
                                                {'★'.repeat(parseInt(item.rank_type))}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <span style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {getBannerName(item.gacha_type)}
                                            </span>
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
                
                {/* Pagination Controls */}
                {!isLoading && totalPages > 1 && (
                    <div style={{ 
                        padding: '16px 24px', 
                        borderTop: '1px solid var(--border-subtle)', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0, 0, 0, 0.1)'
                    }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    ...controlStyle,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                ← Prev
                            </button>
                            
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 8px', fontWeight: 600 }}>
                                Page {currentPage} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>of {totalPages}</span>
                            </span>

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    ...controlStyle,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
