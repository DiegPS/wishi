import React from 'react';
import styles from './WishStats.module.css';

interface WishStatsProps {
    lifetimeWishes: number;
    primogems: number;
    luck5Star: number | string; // 75 or "N/A"
    luck4Star: number | string;
}

export function WishStats({ lifetimeWishes, primogems, luck5Star, luck4Star }: WishStatsProps) {
    return (
        <div className={`glass-panel ${styles.statsContainer}`}>
            <h3 className={styles.sectionTitle}>Wish Stats</h3>
            
            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <span className={styles.label}>Lifetime Wishes</span>
                    <span className={styles.value}>{lifetimeWishes.toLocaleString()}</span>
                </div>
                
                <div className={styles.statBox}>
                    <span className={styles.label}>Primogems Spent</span>
                    <span className={styles.value}>{primogems.toLocaleString()} <span className={styles.currency}>✦</span></span>
                </div>
                
                <div className={`${styles.statBox} ${styles.luckBox}`}>
                    <span className={styles.label}>5★ Luck</span>
                    <span className={`${styles.value} text-gold`}>{luck5Star}</span>
                    <span className={styles.subtext}>Avg pulls for 5★</span>
                </div>
                
                <div className={`${styles.statBox} ${styles.luckBox}`}>
                    <span className={styles.label}>4★ Luck</span>
                    <span className={`${styles.value} text-purple`}>{luck4Star}</span>
                    <span className={styles.subtext}>Avg pulls for 4★</span>
                </div>
            </div>
        </div>
    );
}
