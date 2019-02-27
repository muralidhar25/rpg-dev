
export class HeaderValues {
    // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
    constructor(headerId?: number, headerImage?: string, headerName?: string, hasHeader?: boolean,
        headerLink?: string) {

        this.headerId = headerId;
        this.headerLink = headerLink;
        this.headerImage = headerImage;
        this.headerName = headerName;
        this.hasHeader = hasHeader;
    }
    

    public headerId: number;
    public headerImage: string;
    public headerName: string;
    public headerLink: string;
    public hasHeader: boolean;
}
