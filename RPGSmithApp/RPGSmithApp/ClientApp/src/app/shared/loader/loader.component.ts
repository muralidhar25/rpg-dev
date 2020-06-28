import { Component, Input } from '@angular/core';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { DBkeys } from '../../core/common/db-keys';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
	@Input() isLoading = false;
  @Input() isCharacterLoading:boolean=false;
  //@Input() isPlayerCharacterLoading: boolean = false;
  @Input() isCampaignLoading: boolean = false;
  loadingMessage: string = '';

  constructor(private localStorage: LocalStoreManager) {

  }

  ngOnInit() {
    //debugger
    //console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    //console.log("this.isCharacterLoading=>", this.isCharacterLoading)
    //console.log("DBkeys.IsPlayerCharacterLoading=>", this.localStorage.localStorageGetItem(DBkeys.IsPlayerCharacterLoading))
    //console.log("DBkeys.IsCharacterLoading=>", this.localStorage.localStorageGetItem(DBkeys.IsCharacterLoading))
    //console.log("------------------------------------------------------------------------------------------------")
    //console.log("this.isCampaignLoading=>", this.isCampaignLoading)
    //console.log("this.IsLoadingCampaign=>", this.localStorage.localStorageGetItem(DBkeys.IsLoadingCampaign))
    //console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");

    if (this.isCharacterLoading && this.localStorage.localStorageGetItem(DBkeys.IsPlayerCharacterLoading)) {
      this.loadingMessage = 'Loading Character Stats...';      

      setTimeout(() => {        
          this.loadingMessage = 'Gathering Items...';        
      }, 1200);
      setTimeout(() => {
        this.loadingMessage = 'Creating the Dashboard...';
      }, 2700);
      setTimeout(() => {
        this.loadingMessage = 'Launching Chat...';
      }, 4200);
      this.localStorage.localStorageSetItem(DBkeys.IsPlayerCharacterLoading, false);
    }

    else if (this.isCharacterLoading && this.localStorage.localStorageGetItem(DBkeys.IsCharacterLoading)) {
      this.loadingMessage = 'Loading Character Stats...';

      setTimeout(() => {
        this.loadingMessage = 'Gathering Items...';
      }, 2100);
      setTimeout(() => {
        this.loadingMessage = 'Creating the Dashboard...';
      }, 4200);
      this.localStorage.localStorageSetItem(DBkeys.IsCharacterLoading, false);
    }

    else if (this.isCampaignLoading && this.localStorage.localStorageGetItem(DBkeys.IsLoadingCampaign)) {
      this.loadingMessage = 'Getting Handouts...';
      setTimeout(() => {
        this.loadingMessage = 'Loading Templates...';
      }, 1200);
      setTimeout(() => {
        this.loadingMessage = 'Corralling Monsters...';
      }, 2700);
      setTimeout(() => {
        this.loadingMessage = 'Sharpening Teeth...';
      }, 4200);
      setTimeout(() => {
        this.loadingMessage = 'Launching Chat...';
      }, 5700);
      setTimeout(() => {
        this.loadingMessage = 'Loading Records...';
      }, 7200);
      this.localStorage.localStorageSetItem(DBkeys.IsLoadingCampaign, false);
    }
  }
}
