export namespace main {
	
	export class SyncResult {
	    success: boolean;
	    url: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new SyncResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.url = source["url"];
	        this.error = source["error"];
	    }
	}

}

