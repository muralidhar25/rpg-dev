
export class PageLastViews {
    constructor(pageLastViewId?: number, pageName?: string, viewType?: string, UserId?: string) {
        this.pageLastViewId = pageLastViewId;
        this.pageName = pageName;
        this.viewType = viewType;
        this.UserId = UserId;
    }
    public pageLastViewId: number;
    public pageName: string;
    public viewType: string;
    public UserId: string;
}
