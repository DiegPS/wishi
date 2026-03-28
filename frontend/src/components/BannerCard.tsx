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
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const p5Offset = circumference - (pity5 / maxPity5) * circumference;
    const p4Offset = circumference - (pity4 / maxPity4) * circumference;
    
    // Soft pity indicator (turns gold when close to pity)
    const isSoftPity5 = pity5 >= 74;

    return (
        <div className={`glass-panel ${styles.cardContainer}`}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <span className={styles.totalBadge}>{totalWishes}</span>
            </div>
            
            <div className={`${styles.pityMain} ${isSoftPity5 ? styles.softPityGlow : ''}`}>
                <div className={styles.radialContainer}>
                    <svg className={styles.svgRing} width="160" height="160">
                        {/* Background ring */}
                        <circle
                            className={styles.ringBg}
                            cx="80"
                            cy="80"
                            r={radius}
                        />
                        {/* 5-star progress ring */}
                        <circle
                            className={styles.ringFill5}
                            cx="80"
                            cy="80"
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={p5Offset}
                        />
                    </svg>
                    
                    <div className={styles.pityCenter}>
                        <span className={styles.pityValue}>{pity5}</span>
                        <span className={styles.pityLabel}>Pity 5★</span>
                    </div>
                </div>
            </div>

            <div className={styles.footerInfo}>
                <div className={styles.fourStarPity}>
                    <span className={styles.fourStarLabel}>Current 4★ Pity</span>
                    <span className={styles.fourStarValue}>{pity4} / {maxPity4}</span>
                </div>
                
                {/* Visual mini-status for 4-star */}
                <svg width="40" height="40" className={styles.svgRingMini}>
                    <circle
                        className={styles.ringBg}
                        cx="20"
                        cy="20"
                        r="15"
                        strokeWidth="3"
                    />
                    <circle
                        className={styles.ringFill4}
                        cx="20"
                        cy="20"
                        r="15"
                        strokeWidth="3"
                        strokeDasharray={2 * Math.PI * 15}
                        strokeDashoffset={ (2 * Math.PI * 15) - (pity4/maxPity4) * (2 * Math.PI * 15) }
                    />
                </svg>
            </div>
        </div>
    );
}
