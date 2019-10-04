import { Component, OnInit, HostListener } from '@angular/core';
import { AppService1 } from '../../app.service';


@Component({
  selector: 'app-full-screen-chat',
  templateUrl: './full-screen-chat.component.html',
  styleUrls: ['./full-screen-chat.component.scss']
})
export class FullScreenChatComponent implements OnInit {
  @HostListener('window:beforeunload', ['$event'])  beforeUnloadHander(event) {    this.appService.updateOpenChatInPreviousTab(true);  }

  constructor(private appService: AppService1) {
    this.appService.updateStartChatInNewTab(true);
  }

  ngOnInit() {
  }

}
