import { Component, OnInit, HostListener } from '@angular/core';
import { AppService1 } from '../../app.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { Router } from '@angular/router';
import { DBkeys } from '../../core/common/db-keys';


@Component({
  selector: 'app-full-screen-chat',
  templateUrl: './full-screen-chat.component.html',
  styleUrls: ['./full-screen-chat.component.scss']
})
export class FullScreenChatComponent implements OnInit {

refreshKeyPressed = false;modifierPressed = false;f5key = 116;rkey = 82;modkey = [17, 224, 91, 93];
  @HostListener('window:beforeunload', ['$event'])  beforeUnloadHander(event) {    if (!this.refreshKeyPressed) {      this.appService.updateOpenChatInPreviousTab(true);    }  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(evt: any) {
    if (evt.which == this.f5key || evt.which == this.rkey) {      this.refreshKeyPressed = true;    }    // Check for modifier    if (this.modkey.indexOf(evt.which) >= 0) {      this.modifierPressed = true;    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent1(evt: any) {
    if (evt.which == this.f5key || evt.which == this.rkey) {      this.refreshKeyPressed = false;    }    // Check for modifier    if (this.modkey.indexOf(evt.which) >= 0) {      this.modifierPressed = false;    }
  }

  constructor(private appService: AppService1, private localStorage: LocalStoreManager,
    private router: Router) {
  }

  ngOnInit() {
    let headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    this.appService.updateAccountSetting1(headers);
    this.appService.updateStartChatInNewTab(true);
  }

}
