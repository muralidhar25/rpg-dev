
export class Color {
    constructor(
        //color?: string,
        //bgColor?: string,
        titleTextColor?: string,
        titleBgColor?: string,
        bodyTextColor?: string,
        bodyBgColor?: string,
        selected?: boolean
    ) {
        //this.color = color;
        //this.bgColor = bgColor;
        this.titleTextColor = titleTextColor;
        this.titleBgColor = titleBgColor;
        this.bodyTextColor = bodyTextColor;
        this.bodyBgColor = bodyBgColor;
        this.selected = selected;
    }
    //public color: string;
    //public bgColor: string;
    public titleTextColor: string;
    public titleBgColor: string;
    public bodyTextColor: string;
    public bodyBgColor: string;
    public selected: boolean;
}
