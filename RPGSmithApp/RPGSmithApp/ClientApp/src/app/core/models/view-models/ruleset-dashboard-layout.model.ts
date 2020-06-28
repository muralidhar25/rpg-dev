import {VIEW} from '../enums';
import { RulesetDashboardPage } from './ruleset-dashboard-page.model';

export class RulesetDashboardLayout {

    constructor(rulesetDashboardLayoutId?: number, rulesetId?: number, name?: string, sortOrder?: number, 
      defaultPageId?: number, view?: VIEW, showIcon?: boolean, layoutPages?: RulesetDashboardPage[],
      imageUrl?: string, thumbnailUrl?: string, layoutWidth?: number, layoutHeight?: number, isSharedLayout?: boolean
    ) {

        this.rulesetDashboardLayoutId = rulesetDashboardLayoutId;
        this.rulesetId = rulesetId;
        this.name = name;
        this.defaultPageId = defaultPageId;
        this.sortOrder = sortOrder;
        this.showIcon = showIcon;
        this.layoutWidth = layoutWidth;
        this.layoutHeight = layoutHeight;
        this.view = view;
      this.layoutPages = layoutPages
      this.isSharedLayout = isSharedLayout
      
    }

    public rulesetDashboardLayoutId: number;
    public rulesetId: number;
    public name: string;
    public defaultPageId: number;
    public sortOrder: number;
    public showIcon: boolean;
    public isDeleted: boolean;
    public view: VIEW;
    public layoutHeight: number; 
    public layoutWidth: number; 
    public layoutPages: RulesetDashboardPage[];
  public isSharedLayout: boolean;
    
}


