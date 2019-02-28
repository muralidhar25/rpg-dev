import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
    imageUrl: string;
    imageAlt: string;
    DestroyOtherModals: boolean = true;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {
        setTimeout(() => {            
            this.Initialize();
        }, 0);        
    }
    Initialize() {
        this.imageUrl = this.bsModalRef.content.ViewImageUrl;
        this.imageAlt = this.bsModalRef.content.ViewImageAlt;
        this.DestroyOtherModals = this.bsModalRef.content.DestroyOtherModals ? this.bsModalRef.content.DestroyOtherModals : true;
    }
    close() {
        this.bsModalRef.hide();
        if (this.DestroyOtherModals) {
            this.destroyModal();
        }
    }
    private destroyModal(): void {
        try {
            for (var i = 0; i < document.getElementsByClassName('selectPopUpModal').length; i++) {
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('modal')
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('fade')
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('show')
                //document.getElementsByClassName('selectPopUpModal')[i].parentElement.remove()
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.style.display = 'none'
            }
        } catch (err) { }
    }
}
