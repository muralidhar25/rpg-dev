import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
//import { ImagesSearchComponent } from '../image-interface/images-search/images-search.component';

@Component({
  selector: 'image-interface',
  templateUrl: './image-interface.component.html',
  styleUrls: ['./image-interface.component.scss']
})
export class ImageInterfaceComponent implements OnInit {
    userFormModal: any;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); }

  ngOnInit() {
  }
    close() {
        this.bsModalRef.hide();        
    }
    selectImage(model:any) { }
    submitForm() { }
    openWeb(model: any) {

        //this.bsModalRef = this.modalService.show(ImagesSearchComponent, {
        //    class: 'modal-primary modal-lg',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.title = 'Search Image';
    }
}
