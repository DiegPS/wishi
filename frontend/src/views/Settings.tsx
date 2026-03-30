import React from 'react';

export function Settings() {
    const handleClearLocalStorage = () => {
        if (confirm("Are you sure you want to clear all local storage? This action cannot be undone.")) {
            localStorage.clear();
            alert("Local storage cleared.");
            window.location.reload();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--color-gold)', margin: 0, fontSize: '2rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>✦</span> CONFIGURATION
            </h1>

            <div style={{
                padding: '30px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--border-radius-base)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'var(--glass-blur)'
            }}>
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
                        justifyContent: 'center'
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
