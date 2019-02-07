import {VIEW} from '../enums';

import { RulesetDashboardLayout } from './ruleset-dashboard-layout.model';
import { Ruleset } from './ruleset.model';


export class RulesetDashboardPage {

    constructor(rulesetDashboardPageId?: number, rulesetDashboardLayoutId?: number, rulesetId?: number, name?: string, sortOrder?: number, isDeleted?: boolean,
        containerHeight?: number, containerWidth?: number, view?: VIEW, showIcon?: boolean, rulesetDashboardLayout?: RulesetDashboardLayout, ruleset?: Ruleset,
        titleTextColor?: string, titleBgColor?: string, bodyTextColor?: string, bodyBgColor?: string
    ) {

        this.rulesetDashboardPageId = rulesetDashboardPageId;
        this.rulesetDashboardLayoutId = rulesetDashboardLayoutId;
        this.rulesetId = rulesetId;
        this.name = name;
        this.sortOrder = sortOrder;
        this.isDeleted = isDeleted;
        this.showIcon = showIcon;
        this.containerHeight = containerHeight;
        this.containerWidth = containerWidth;
        this.ruleset = ruleset;

        this.titleTextColor = titleTextColor;
        this.titleBgColor = titleBgColor;
        this.bodyTextColor = bodyTextColor;
        this.bodyBgColor = bodyBgColor;
        this.view = view;
    }

    public rulesetDashboardPageId: number;
    public rulesetDashboardLayoutId: number;
    public rulesetId: number;
    public name: string;
    public sortOrder: number;
    public showIcon: boolean;
    public isDeleted: boolean;
    public containerHeight: number;
    public containerWidth: number;
    public rulesetDashboardLayout: RulesetDashboardLayout;
    public ruleset: Ruleset;

    public titleTextColor: string;
    public titleBgColor: string;
    public bodyTextColor: string;
    public bodyBgColor: string;
    public view: VIEW;
}


