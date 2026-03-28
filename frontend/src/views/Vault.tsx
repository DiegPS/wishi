import React from 'react';

export function Vault() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ padding: '0 8px' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>The Astral Vault</h2>
                <p style={{ color: 'var(--text-muted)' }}>Celebration of Obtained Collection</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Inventory Gallery under construction...</p>
            </div>
        </div>
    );
}
