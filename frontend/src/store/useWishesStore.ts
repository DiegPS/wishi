import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishData {
    id: string;
    uid: string;
    gacha_type: string;
    item_id: string;
    count: string;
    time: string;
    name: string;
    lang: string;
    item_type: string;
    rank_type: string;
}

export interface BannerStats {
    totalWishes: number;
    pity5: number;
    maxPity5: number;
    pity4: number;
    maxPity4: number;
}

export interface GlobalStats {
    lifetimeWishes: number;
    promotionalWishes: number;
    standardWishes: number;
    promotionalPrimogems: number;
    luck5Star: number;
    luck4Star: number;
}

export interface DashboardData {
    character: BannerStats;
    weapon: BannerStats;
    standard: BannerStats;
    chronicled: BannerStats;
    global: GlobalStats;
}

interface WishesState {
    wishes: WishData[];
    addWishes: (newWishes: WishData[]) => void;
    clearWishes: () => void;
    getStats: () => DashboardData;
    getWishHistory: (limit?: number, offset?: number) => WishData[];
}

// Stats calculator utility identical to the old Go stats.go
const calculateBannerStats = (wishes: WishData[], gachaTypes: string[], maxPity5: number): BannerStats => {
    const stats: BannerStats = { totalWishes: 0, pity5: 0, maxPity5, pity4: 0, maxPity4: 10 };
    
    const relevant = wishes.filter(w => gachaTypes.includes(w.gacha_type));
    stats.totalWishes = relevant.length;
    
    if (stats.totalWishes === 0) return stats;

    const sorted = [...relevant].sort((a, b) => {
        if (a.id.length === b.id.length) {
            return a.id > b.id ? -1 : 1; 
        }
        return a.id.length > b.id.length ? -1 : 1;
    });

    let found5 = false;
    let found4 = false;

    for (const w of sorted) {
        if (!found5) {
            if (w.rank_type === "5") found5 = true;
            else stats.pity5++;
        }
        if (!found4) {
            if (w.rank_type === "4" || w.rank_type === "5") found4 = true;
            else stats.pity4++;
        }
        if (found5 && found4) break;
    }

    return stats;
};

const calculateAllStats = (wishes: WishData[]): DashboardData => {
    let count5 = 0;
    let count4 = 0;
    for (const w of wishes) {
        if (w.rank_type === "5") count5++;
        else if (w.rank_type === "4") count4++;
    }

    const lifetimeWishes = wishes.length;
    const promotionalWishes = wishes.filter((w) => ["301", "302", "400", "500"].includes(w.gacha_type)).length;
    const standardWishes = wishes.filter((w) => w.gacha_type === "200").length;
    const global: GlobalStats = {
        lifetimeWishes,
        promotionalWishes,
        standardWishes,
        promotionalPrimogems: promotionalWishes * 160,
        luck5Star: count5 > 0 ? lifetimeWishes / count5 : 0,
        luck4Star: count4 > 0 ? lifetimeWishes / count4 : 0,
    };

    return {
        character: calculateBannerStats(wishes, ["301", "400"], 90),
        weapon: calculateBannerStats(wishes, ["302"], 80),
        standard: calculateBannerStats(wishes, ["200"], 90),
        chronicled: calculateBannerStats(wishes, ["500"], 90),
        global,
    };
};

export const useWishesStore = create<WishesState>()(
    persist(
        (set, get) => ({
            wishes: [],
            
            // Upsert mechanism like IGNORE INTO
            addWishes: (newWishes) => set((state) => {
                const existing = new Set(state.wishes.map(w => w.id));
                const uniqueNewWishes = newWishes.filter(w => !existing.has(w.id));
                
                if (uniqueNewWishes.length === 0) return state; // Avoid unnecessary re-renders
                
                return { wishes: [...state.wishes, ...uniqueNewWishes] };
            }),

            clearWishes: () => set({ wishes: [] }),

            getStats: () => {
                return calculateAllStats(get().wishes);
            },

            getWishHistory: (limit = 0, offset = 0) => {
                // sort by time descending
                const results = [...get().wishes].sort((a, b) => a.time > b.time ? -1 : 1);
                
                if (limit > 0) {
                    return results.slice(offset, offset + limit);
                }
                return results;
            }
        }),
        {
            name: 'wishi_data', // matches old localStorage key
            version: 1,
        }
    )
);
