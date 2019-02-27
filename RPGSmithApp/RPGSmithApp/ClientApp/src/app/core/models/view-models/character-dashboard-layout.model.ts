import {VIEW} from '../enums';

import { CharacterDashboardPage } from './character-dashboard-page.model';

export class CharacterDashboardLayout {

    constructor(characterDashboardLayoutId?: number, characterId?: number, name?: string, sortOrder?: number, 
        defaultPageId?: number, view?: VIEW, showIcon?: boolean,layoutPages?: CharacterDashboardPage[],
        imageUrl?: string, thumbnailUrl?: string, layoutWidth?: number, layoutHeight?: number
    ) {

        this.characterDashboardLayoutId = characterDashboardLayoutId;
        this.characterId = characterId;
        this.name = name;
        this.defaultPageId = defaultPageId;
        this.sortOrder = sortOrder;
        this.showIcon = showIcon;
        this.layoutWidth = layoutWidth;
        this.layoutHeight = layoutHeight;
        this.view = view;
        this.layoutPages = layoutPages
    }

    public characterDashboardLayoutId: number;
    public characterId: number;
    public name: string;
    public defaultPageId: number;
    public sortOrder: number;
    public showIcon: boolean;
    public isDeleted: boolean;
    public view: VIEW;
    public layoutHeight: number; 
    public layoutWidth: number; 
    public layoutPages: CharacterDashboardPage[];
    
}


