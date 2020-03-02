import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-add-abilities',
  templateUrl: './add-abilities.component.html',
  styleUrls: ['./add-abilities.component.scss']
})
export class AddAbilitiesComponent implements OnInit {

  constructor(
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {

  }

  close() {
    this.bsModalRef.hide();
  }

}
