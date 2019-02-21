import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AppService1 {
  removeHighlight: any;


  private accountSetting = new Subject<any>();


  updateAccountSetting1(accountSetting: any) {    
    this.accountSetting.next(accountSetting);
  }
  shouldUpdateAccountSetting1(): Observable<any> {
    return this.accountSetting.asObservable();
  }
}

