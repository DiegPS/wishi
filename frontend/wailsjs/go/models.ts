export namespace main {
	
	export class BannerStats {
	    totalWishes: number;
	    pity5: number;
	    maxPity5: number;
	    pity4: number;
	    maxPity4: number;
	
	    static createFrom(source: any = {}) {
	        return new BannerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalWishes = source["totalWishes"];
	        this.pity5 = source["pity5"];
	        this.maxPity5 = source["maxPity5"];
	        this.pity4 = source["pity4"];
	        this.maxPity4 = source["maxPity4"];
	    }
	}
	export class GlobalStats {
	    lifetimeWishes: number;
	    primogems: number;
	    luck5Star: number;
	    luck4Star: number;
	
	    static createFrom(source: any = {}) {
	        return new GlobalStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.lifetimeWishes = source["lifetimeWishes"];
	        this.primogems = source["primogems"];
	        this.luck5Star = source["luck5Star"];
	        this.luck4Star = source["luck4Star"];
	    }
	}
	export class DashboardData {
	    character: BannerStats;
	    weapon: BannerStats;
	    standard: BannerStats;
	    chronicled: BannerStats;
	    global: GlobalStats;
	
	    static createFrom(source: any = {}) {
	        return new DashboardData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.character = this.convertValues(source["character"], BannerStats);
	        this.weapon = this.convertValues(source["weapon"], BannerStats);
	        this.standard = this.convertValues(source["standard"], BannerStats);
	        this.chronicled = this.convertValues(source["chronicled"], BannerStats);
	        this.global = this.convertValues(source["global"], GlobalStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SyncResult {
	    success: boolean;
	    url: string;
	    error: string;
	    stats: DashboardData;
	
	    static createFrom(source: any = {}) {
	        return new SyncResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.url = source["url"];
	        this.error = source["error"];
	        this.stats = this.convertValues(source["stats"], DashboardData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

