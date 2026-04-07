import React, { useState } from 'react';
import { useAlerts } from '../components/alerts/AlertsProvider';
import { useWishesStore, WishData } from '../store/useWishesStore';
import { ExportWishes } from '../../wailsjs/go/main/App';

const BANNER_NAMES: Record<string, string> = {
    '301': 'Character Event (1)',
    '400': 'Character Event (2)',
    '302': 'Weapon Event',
    '200': 'Standard',
    '500': 'Chronicled',
};

function escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function generateCSV(wishes: WishData[]): string {
    const headers = ['id', 'uid', 'gacha_type', 'banner_name', 'item_type', 'name', 'rank_type', 'time'];
    const rows = wishes.map(w => [
        w.id,
        w.uid,
        w.gacha_type,
        BANNER_NAMES[w.gacha_type] ?? w.gacha_type,
        w.item_type,
        w.name,
        w.rank_type,
        w.time,
    ].map(escapeCsvField).join(','));
    return [headers.join(','), ...rows].join('\n');
}

const cardStyle: React.CSSProperties = {
    padding: '30px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--border-radius-base)',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--glass-shadow)',
    backdropFilter: 'var(--glass-blur)',
};

export function Settings() {
    const { confirm, notify } = useAlerts();
    const wishes = useWishesStore(state => state.wishes);
    const clearWishes = useWishesStore(state => state.clearWishes);
    const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

    const handleExport = async (format: 'csv' | 'json') => {
        if (wishes.length === 0) {
            notify({ type: 'warning', title: 'Nothing to export', message: 'Sync your wish history first.' });
            return;
        }

        setExporting(format);
        try {
            const content = format === 'csv'
                ? generateCSV(wishes)
                : JSON.stringify(wishes, null, 2);

            const savedPath = await ExportWishes(format, content);
            if (savedPath) {
                notify({
                    type: 'success',
                    title: 'Export complete',
                    message: `${wishes.length.toLocaleString()} wishes saved as ${format.toUpperCase()}.`,
                });
            }
            // empty savedPath = user cancelled the dialog, no notification needed
        } catch (e) {
            notify({ type: 'error', title: 'Export failed', message: String(e) });
        } finally {
            setExporting(null);
        }
    };

    const handleClearLocalStorage = async () => {
        const accepted = await confirm({
            title: 'Clear app data?',
            message: 'This will remove all locally saved Wishi data. This action cannot be undone.',
            confirmText: 'Clear data',
            cancelText: 'Keep data',
            danger: true,
        });

        if (!accepted) {
            return;
        }

        clearWishes();
        localStorage.removeItem('wishi_data');
        notify({
            type: 'success',
            title: 'Data cleared',
            message: 'Local Wishi data was removed successfully.',
        });
        window.location.reload();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--color-gold)', margin: 0, fontSize: '2rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>✦</span> CONFIGURATION
            </h1>

            {/* Export Data */}
            <div style={cardStyle}>
                <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                    Export Data
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                    Save your wish history to a local file.{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>CSV</strong> is compatible with Excel and Google Sheets.{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>JSON</strong> preserves all raw fields for external tools.
                </p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="button-primary"
                        onClick={() => handleExport('csv')}
                        disabled={exporting !== null}
                        style={{ minWidth: '140px' }}
                    >
                        {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button
                        className="button-primary"
                        onClick={() => handleExport('json')}
                        disabled={exporting !== null}
                        style={{ minWidth: '140px' }}
                    >
                        {exporting === 'json' ? 'Exporting...' : 'Export JSON'}
                    </button>
                    {wishes.length > 0 && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {wishes.length.toLocaleString()} wishes available
                        </span>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div style={cardStyle}>
                <h2 style={{ margin: '0 0 16px', color: '#ff4d4f', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Danger Zone
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                    Clear all locally saved app data. This will clear the synchronization state but will not affect the data on the HoYoverse server. You will need to re-sync your history afterwards.
                </p>

                <button
                    onClick={handleClearLocalStorage}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#ff4d4f',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--border-radius-base)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#d9363e';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4d4f';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    CLEAR LOCAL STORAGE
                </button>
            </div>
        </div>
    );
}
