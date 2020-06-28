import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Color } from '../../core/models/tiles/color.model';
import { ColorService } from '../../core/services/tiles/color.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
@Component({
    selector: 'app-colors',
    templateUrl: './colors.component.html',
    styleUrls: ['./colors.component.scss']
})
export class ColorsComponent implements OnInit {
    colorList: Color[] = [];
    colorModel: Color = new Color();
    view: any; 
    showDemo: boolean = false;
    tile: number;
    isLoading: boolean = false;
    selectedStatType: number = 0;
    selectedIndex: number;
    constructor(private bsModalRef: BsModalRef, private colorService: ColorService, private localStorage: LocalStoreManager,) {
    }

    public event: EventEmitter<any> = new EventEmitter();
    ngOnInit() {
        this.Initialize();
    }

    private Initialize() {
        setTimeout(() => {
            this.colorModel = this.bsModalRef.content.colorModel ? this.bsModalRef.content.colorModel : new Color();
            this.tile = this.bsModalRef.content.tile ? +this.bsModalRef.content.tile : -1;
            this.selectedStatType = this.bsModalRef.content.selectedStatType;
            //this.colorModel.color = this.bsModalRef.content.color ? this.bsModalRef.content.color : '#343038';
            this.view = this.bsModalRef.content.view ? this.bsModalRef.content.view : 'add';
            // this.setColorOnInit(this.colorModel);
            this.setColorOnInit();
        }, 0);

    }

    private setColorOnInit() {
        //let colorExist = false;
        this.isLoading = true;
        this.colorList = this.colorService.setDefaultRPGColors(this.view);        
        
        setTimeout(() => {           
            this.colorService.AllReadyHaveColor(this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id).subscribe(
                data => {
                    let clrList: Color[] = this.colorList.map((clr, index) => {
                        clr.selected = false
                        if (!data) {
                            if (clr.bodyBgColor == '#6094BE'
                                && clr.titleBgColor == '#2973A8' && clr.titleTextColor == '#FFFFFF') {
                                clr.selected = true
                            }
                        }
                        else if (clr.bodyBgColor == this.colorModel.bodyBgColor && clr.bodyTextColor == this.colorModel.bodyTextColor
                            && clr.titleBgColor == this.colorModel.titleBgColor && clr.titleTextColor == this.colorModel.titleTextColor) {
                            clr.selected = true
                        }
                        return clr;
                    })
                    clrList.map((clr, index) => {
                        if (clr.selected) {
                            this.setColor(clr);
                        }
                    })
                    this.colorList = clrList;
                    this.isLoading = false; 
                },
                error => {
                    this.isLoading = false; 
                });
            
        }, 600);
    }

    close() {
        this.bsModalRef.hide();
        // this.destroyModalOnInit();
    }

    setColor(color: Color) {
        this.showDemo = true;
        this.colorList.forEach(function (val) {
            val.selected = false;
        });
        color.selected = true;
        this.colorModel.titleTextColor = color.titleTextColor.startsWith('#') ? color.titleTextColor : '#' + color.titleTextColor;
        this.colorModel.titleBgColor = color.titleBgColor.startsWith('#') ? color.titleBgColor : '#' + color.titleBgColor;;
        this.colorModel.bodyTextColor = color.bodyTextColor.startsWith('#') ? color.bodyTextColor : '#' + color.bodyTextColor;
        this.colorModel.bodyBgColor = color.bodyBgColor.startsWith('#') ? color.bodyBgColor : '#' + color.bodyBgColor;
    }

    saveColor() {
        this.destroyModal();
        this.event.emit(this.colorModel);
    }

    private destroyModal(): void {
        try {
            // this.modalService.hide(1);
            //document.body.classList.remove('modal-open');
            for (var i = 0; i < document.getElementsByClassName('selectPopUpModal').length; i++) {
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('modal')
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('fade')
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('show')
                //document.getElementsByClassName('selectPopUpModal')[i].parentElement.remove()
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.style.display = 'none'
            }
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

}
