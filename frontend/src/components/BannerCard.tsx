import React from 'react';
import styles from './BannerCard.module.css';

interface BannerCardProps {
    title: string;
    totalWishes: number;
    pity5: number;
    maxPity5: number;
    pity4: number;
    maxPity4: number;
}

export function BannerCard({ title, totalWishes, pity5, maxPity5, pity4, maxPity4 }: BannerCardProps) {
    const p5Percent = (pity5 / maxPity5) * 100;
    const p4Percent = (pity4 / maxPity4) * 100;
    
    // Soft pity indicator (turns red/gold when close to pity)
    const isSoftPity5 = pity5 >= 74;

    return (
        <div className={`glass-panel ${styles.cardContainer}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.totalBadge}>{totalWishes}</span>
            </div>
            
            <div className={styles.pitySection}>
                <div className={styles.pityRow}>
                    <div className={styles.pityLabel}>
                        <span className="text-gold">★ 5 Pity</span>
                        <span className={`${styles.pityNumbers} ${isSoftPity5 ? styles.softPityGlow : ''}`}>
                            {pity5} / {maxPity5}
                        </span>
                    </div>
                    <div className={styles.progressBarBg}>
                        <div 
                            className={styles.progressBarFill5} 
                            style={{width: `${p5Percent}%`}}
                        />
                    </div>
                </div>

                <div className={styles.pityRow}>
                    <div className={styles.pityLabel}>
                        <span className="text-purple">★ 4 Pity</span>
                        <span className={styles.pityNumbers}>{pity4} / {maxPity4}</span>
                    </div>
                    <div className={styles.progressBarBg}>
                        <div 
                            className={styles.progressBarFill4} 
                            style={{width: `${p4Percent}%`}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
