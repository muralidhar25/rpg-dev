import {VIEW} from '../enums';

import { CharacterDashboardLayout } from './character-dashboard-layout.model';
import { Characters } from './characters.model';


export class CharacterDashboardPage {

    constructor(characterDashboardPageId?: number, characterDashboardLayoutId?: number, characterId?: number, name?: string, sortOrder?: number, isDeleted?: boolean,
        containerHeight?: number, containerWidth?: number, view?: VIEW, showIcon?: boolean, characterDashboardLayout?: CharacterDashboardLayout, character?: Characters,
        titleTextColor?: string, titleBgColor?: string, bodyTextColor?: string, bodyBgColor?: string
    ) {

        this.characterDashboardPageId = characterDashboardPageId;
        this.characterDashboardLayoutId = characterDashboardLayoutId;
        this.characterId = characterId;
        this.name = name;
        this.sortOrder = sortOrder;
        this.isDeleted = isDeleted;
        this.showIcon = showIcon;
        this.containerHeight = containerHeight;
        this.containerWidth = containerWidth;
        this.character = character;

        this.titleTextColor = titleTextColor;
        this.titleBgColor = titleBgColor;
        this.bodyTextColor = bodyTextColor;
        this.bodyBgColor = bodyBgColor;
        this.view = view;
    }

    public characterDashboardPageId: number;
    public characterDashboardLayoutId: number;
    public characterId: number;
    public name: string;
    public sortOrder: number;
    public showIcon: boolean;
    public isDeleted: boolean;
    public containerHeight: number;
    public containerWidth: number;
    public characterDashboardLayout: CharacterDashboardLayout;
    public character: Characters;

    public titleTextColor: string;
    public titleBgColor: string;
    public bodyTextColor: string;
    public bodyBgColor: string;
    public view: VIEW;
}


