
export class BingImage {
    constructor(
        name?: string,
        webSearchUrl?: string,
        webSearchUrlPingSuffix?: string,
        thumbnailUrl?: string,
        datePublished?: string,
        contentUrl?: string,
        hostPageUrl?: string,
        hostPageUrlPingSuffix?: string,
        contentSize?: string,
        encodingFormat?: string,
        hostPageDisplayUrl?: string,
        width?: number,
        height?: number,
        imageInsightsToken?: string,
        imageId?: string,
        accentColor?: string,
    ) {
        this.name = name;
        this.webSearchUrl = webSearchUrl;
        this.webSearchUrlPingSuffix = webSearchUrlPingSuffix;
        this.thumbnailUrl = thumbnailUrl;
        this.datePublished = datePublished;
        this.contentUrl = contentUrl;
        this.hostPageUrl = hostPageUrl;
        this.hostPageUrlPingSuffix = hostPageUrlPingSuffix;
        this.contentSize = contentSize;
        this.encodingFormat = encodingFormat;
        this.hostPageDisplayUrl = hostPageDisplayUrl;
        this.width = width;
        this.height = height;
        this.imageInsightsToken = imageInsightsToken;
        this.imageId = imageId;
        this.accentColor = accentColor;

    }

    public name: string;
    public webSearchUrl: string;
    public webSearchUrlPingSuffix: string;
    public thumbnailUrl: string;
    public datePublished: string;
    public contentUrl: string;
    public hostPageUrl: string;
    public hostPageUrlPingSuffix: string;
    public contentSize: string;
    public encodingFormat: string;
    public hostPageDisplayUrl: string;
    public width: number;
    public height: number;
    public imageInsightsToken: string;
    public imageId: string;
    public accentColor: string;

}


