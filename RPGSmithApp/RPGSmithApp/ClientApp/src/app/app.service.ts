import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AppService1 {
  removeHighlight: any;


  private accountSetting = new Subject<any>();
  private text = new Subject<any>();


  updateAccountSetting1(accountSetting: any) {    
    this.accountSetting.next(accountSetting);
  }
  shouldUpdateAccountSetting1(): Observable<any> {
    return this.accountSetting.asObservable();
  }
  updateSearchText(text: string) {
    this.text.next(text);
  }
  shouldUpdateSearchText(): Observable<any> {
    return this.text.asObservable();
  }
}

