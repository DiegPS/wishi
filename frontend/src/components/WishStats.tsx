import React from 'react';
import styles from './WishStats.module.css';

interface WishStatsProps {
    lifetimeWishes: number;
    promotionalWishes: number;
    standardWishes: number;
    promotionalPrimogems: number;
    luck5Star: number | string;
    luck4Star: number | string;
}

export function WishStats({
    lifetimeWishes,
    promotionalWishes,
    standardWishes,
    promotionalPrimogems,
    luck5Star,
    luck4Star,
}: WishStatsProps) {
    return (
        <div className={`glass-panel ${styles.statsContainer}`}>
            <h3 className={styles.sectionTitle}>Astral Summary</h3>
            
            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <span className={styles.label}>Total Manifestations</span>
                    <span className={styles.value}>{lifetimeWishes.toLocaleString()}</span>
                    <span className={styles.subtext}>Lifetime wishes tracked</span>
                </div>
                
                <div className={styles.statBox}>
                    <span className={styles.label}>Promo Investment</span>
                    <span className={styles.value}>{promotionalPrimogems.toLocaleString()} <span className={styles.currency}>✦</span></span>
                    <span className={styles.subtext}>{promotionalWishes.toLocaleString()} promo pulls (standard: {standardWishes.toLocaleString()})</span>
                </div>
                
                <div className={`${styles.statBox} ${styles.luckBox}`}>
                    <span className={styles.label}>Resonance Efficiency (5★)</span>
                    <span className={`${styles.value} text-gold`}>{luck5Star}</span>
                    <span className={styles.subtext}>Average pulls for 5★ drop</span>
                </div>
                
                <div className={`${styles.statBox} ${styles.luckBox}`}>
                    <span className={styles.label}>Resonance Efficiency (4★)</span>
                    <span className={`${styles.value} text-purple`}>{luck4Star}</span>
                    <span className={styles.subtext}>Average pulls for 4★ drop</span>
                </div>
            </div>
        </div>
    );
}
