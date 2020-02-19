// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable } from '@angular/core';
import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { forEach } from '@angular/router/src/utils/collection';
import { CharacterStatConditionViewModel } from '../models/view-models/character-stats.model';
import { STAT_TYPE } from '../models/enums';
import { Router } from '@angular/router';
import { HeaderValues } from '../models/headers.model';
import { LocalStoreManager } from './local-store-manager.service';
//import * as FroalaEditor from 'froala-editor';

@Injectable()
export class Utilities {

  public static readonly captionAndMessageSeparator = ":";
  public static readonly noNetworkMessageCaption = "No Network";
  public static readonly noNetworkMessageDetail = "The server cannot be reached";
  public static readonly accessDeniedMessageCaption = "Access Denied!";
  public static readonly accessDeniedMessageDetail = "";
  public static readonly notifyForPendingInvitesMessage: string = "You have at least 1 invite to join a campaign. Select the envelope icon at the top of this screen to see the details and accept or reject this offer.";
  public static getHttpResponseMessage(data: HttpResponseBase | any): string[] {

    let responses: string[] = [];

    if (data instanceof HttpResponseBase) {

      if (this.checkNoNetwork(data)) {
        responses.push(`${this.noNetworkMessageCaption}${this.captionAndMessageSeparator} ${this.noNetworkMessageDetail}`);
      }
      else {
        let responseObject = this.getResponseBody(data);

        if (responseObject && (typeof responseObject === 'object' || responseObject instanceof Object)) {

          for (let key in responseObject) {
            if (key)
              responses.push(`${key}${this.captionAndMessageSeparator} ${responseObject[key]}`);
            else if (responseObject[key])
              responses.push(responseObject[key].toString());
          }
        }
      }

      if (!responses.length && this.getResponseBody(data))
        responses.push(`${data.statusText}: ${this.getResponseBody(data).toString()}`);
    }

    if (!responses.length)
      responses.push(data.toString());

    if (this.checkAccessDenied(data))
      responses.splice(0, 0, `${this.accessDeniedMessageCaption}${this.captionAndMessageSeparator} ${this.accessDeniedMessageDetail}`);


    return responses;
  }

  public static IsIEorEdge: boolean = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  public static IsCrome: boolean = (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) || (navigator.userAgent.match('CriOS') !== null);


  public static mobileToolbarButton = ['bold', 'italic', 'underline', 'paragraphStyle', 'paragraphFormat', 'undo', 'redo', 'lineHeight'];
  //'strikeThrough', 'subscript', 'superscript',
  //'|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 
  //'|',  'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertLink', 'insertTable',
  //'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable',
  //'|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting',
  //'|', 'print', 'spellChecker', 'html',

  public static webToolbarButton = ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
    '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle',
    '|', 'paragraphFormat', 'align', 'lineHeight', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertLink', 'insertTable',
    //'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable',
    '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting',
    '|', 'print', 'spellChecker', 'html',
    '|', 'undo', 'redo'];
  public static options: Object = {
    key: '9H4B3G3C6A2B3F-11D2C2D2G2C3B3C4D6E1D1rB-8i1vaC-16C-13aB-9A1H-8vw==',
    //key: 'Fwvh1H-8dcC-21dA6mg1B-8==',
    toolbarInline: false,
    height: 300,
    charCounterCount: true,
    charCounterMax: 4000,
    toolbarVisibleWithoutSelection: false,
    imagePaste: false,
    imageUpload: false,
    imageAllowDragAndDrop: false,
    imageInsertingStrategy: "url",
    videoPaste: false,
    videoUpload: false,
    videoAllowDragAndDrop: false,
    videoInsertingStrategy: "url",
    toolbarButtons: Utilities.IsMobileScreen() ? Utilities.mobileToolbarButton : Utilities.webToolbarButton,
    quickInsertButtons: ['embedly', 'table', 'ul', 'ol', 'hr'], //'image', 'video',
    //quickInsertTags: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'],
    //pluginsEnabled: ['quickInsert', 'image', 'table', 'lists']
  }
  public static optionsNoteTile: Object = {
    key: '9H4B3G3C6A2B3F-11D2C2D2G2C3B3C4D6E1D1rB-8i1vaC-16C-13aB-9A1H-8vw==',
    //key: 'Fwvh1H-8dcC-21dA6mg1B-8==',
    toolbarInline: false,
    height: 300,
    charCounterCount: true,
    charCounterMax: 4000,
    toolbarVisibleWithoutSelection: false,
    imagePaste: false,
    imageUpload: false,
    imageAllowDragAndDrop: false,
    imageInsertingStrategy: "url",
    videoPaste: false,
    videoUpload: false,
    videoAllowDragAndDrop: false,
    videoInsertingStrategy: "url",
    toolbarButtons: Utilities.IsMobileScreen() ? Utilities.mobileToolbarButton : Utilities.webToolbarButton,
    quickInsertButtons: ['embedly', 'table', 'ul', 'ol', 'hr'], //'image', 'video',
    //quickInsertTags: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'],
    //pluginsEnabled: ['quickInsert', 'image', 'table', 'lists']
  }
  public static optionsFloala(height: number = 300, placeholder: string = 'Type something..', initOnClick: boolean = false, FocusOnInitialize: boolean = false, IncludeVariableLinks: boolean = true): Object {
    let btnArr = [];
    if (IncludeVariableLinks) {
      btnArr = ['fullscreen', 'my_dropdown2', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
        '|', 'fontFamily', 'fontSize', 'color', //  '|', 'paragraphStyle', 'inlineStyle', 'paragraphFormat',
        'align', 'lineHeight', 'formatOL', 'insertLink', //'formatUL', 'quote', 'outdent', 'indent', 
        //'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable',
        '|', 'emoticons', 'specialCharacters', 'selectAll', 'clearFormatting',
        //'|', 'print', 'spellChecker', 'html','insertHR',
        '|', 'undo', 'redo', 'inlineClass'];
    } else {
      btnArr = ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
        '|', 'fontFamily', 'fontSize', 'color', //  '|', 'paragraphStyle', 'inlineStyle', 'paragraphFormat',
        'align', 'lineHeight', 'formatOL', 'insertLink', //'formatUL', 'quote', 'outdent', 'indent', 
        //'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable',
        '|', 'emoticons', 'specialCharacters', 'selectAll', 'clearFormatting',
        //'|', 'print', 'spellChecker', 'html','insertHR',
        '|', 'undo', 'redo', 'inlineClass'];
    }
    return {
      key: '9H4B3G3C6A2B3F-11D2C2D2G2C3B3C4D6E1D1rB-8i1vaC-16C-13aB-9A1H-8vw==',
      //key: 'Fwvh1H-8dcC-21dA6mg1B-8==',
      toolbarInline: false,
      height: height,
      placeholderText: placeholder,
      charCounterCount: true,
      charCounterMax: 4000,
      initOnClick: initOnClick,
      theme: 'royal',
      toolbarVisibleWithoutSelection: false,
      imagePaste: false,
      imageUpload: false,
      imageAllowDragAndDrop: false,
      imageInsertingStrategy: "url",
      videoPaste: false,
      videoUpload: false,
      videoAllowDragAndDrop: false,
      videoInsertingStrategy: "url",
      toolbarButtons: Utilities.IsMobileScreen() ? Utilities.mobileToolbarButton : btnArr,
      quickInsertButtons: ['embedly', 'table', 'ul', 'ol'], //'image', 'video', , 'hr'
      //quickInsertTags: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'],
      //pluginsEnabled: ['quickInsert', 'image', 'table', 'lists']
      events: [this.FocusOnInitializeEditor(FocusOnInitialize)]
    }
  }

  public static responseData(data: any, pageSize: number): any {
    try {
      if (data) return data.slice(0, pageSize)
      else return data;
    }
    catch (err) {
      return data;
    }
  }

  public static RedirectBack() {
    window.history.back();
  }

  public static copyToClipboard(value: string) {
    let copiedBox = document.createElement('textarea');
    copiedBox.style.position = 'fixed';
    copiedBox.style.left = '0';
    copiedBox.style.top = '0';
    copiedBox.style.opacity = '0';
    copiedBox.value = value;
    document.body.appendChild(copiedBox);
    copiedBox.focus();
    copiedBox.select();
    document.execCommand('copy');
    document.body.removeChild(copiedBox);
  }

  public static findHttpResponseMessage(messageToFind: string, data: HttpResponse<any> | any, seachInCaptionOnly = true, includeCaptionInResult = false): string {

    let searchString = messageToFind.toLowerCase();
    let httpMessages = this.getHttpResponseMessage(data);

    for (let message of httpMessages) {
      let fullMessage = Utilities.splitInTwo(message, this.captionAndMessageSeparator);

      if (fullMessage.firstPart && fullMessage.firstPart.toLowerCase().indexOf(searchString) != -1) {
        return includeCaptionInResult ? message : fullMessage.secondPart || fullMessage.firstPart;
      }
    }

    if (!seachInCaptionOnly) {
      for (let message of httpMessages) {

        if (message.toLowerCase().indexOf(searchString) != -1) {
          if (includeCaptionInResult) {
            return message;
          }
          else {
            let fullMessage = Utilities.splitInTwo(message, this.captionAndMessageSeparator);
            return fullMessage.secondPart || fullMessage.firstPart;
          }
        }
      }
    }

    return null;
  }

  public static ErrorDetail(summary: string, error: any): any {

    let sessionExpire: boolean = false;
    let errorMessage: string = 'Something went wrong. Please try again.';

    let findHttpResponseMessage = Utilities.findHttpResponseMessage("error_description", error);
    //let httpMessages = this.getHttpResponseMessage(error);
    if (error == null) { }
    else if (this.IsUsernameNullError(error))
      sessionExpire = true;
    else if (findHttpResponseMessage)
      errorMessage = findHttpResponseMessage;
    else if (error.error.error) {
      if (error.error.error.message)
        errorMessage = error.error.error.message;
      else
        errorMessage = error.error.error;
    }
    else if (error.error) {
      if (error.error.message)
        errorMessage = error.error.message;
      else
        errorMessage = error.error;
    }
    else
      errorMessage = error.statusText + ' ' + error.status;

    return { summary: summary, errorMessage: errorMessage, sessionExpire: sessionExpire };
  }

  public static IsUsernameNullError(error: any): boolean {

    let IsUsernameNull: boolean = false;
    let __error: any = error;
    try {

      if (__error.error.error) {
        if (__error.error.error.message) {
          IsUsernameNull = this.IsSessionEndError(__error.error.error.message);
          if (IsUsernameNull) return IsUsernameNull;
        }
        IsUsernameNull = this.IsSessionEndError(__error.error.error);
        if (IsUsernameNull) return IsUsernameNull;
      }
      if (__error.error) {
        if (__error.error.message) {
          IsUsernameNull = this.IsSessionEndError(__error.error.message);
          if (IsUsernameNull) return IsUsernameNull;
        }
        IsUsernameNull = this.IsSessionEndError(__error.error);
        if (IsUsernameNull) return IsUsernameNull;
      }
      if (__error.message) {
        IsUsernameNull = this.IsSessionEndError(__error.message);
        if (IsUsernameNull) return IsUsernameNull;
      }
    } catch (err) { }
    return IsUsernameNull;
  }

  public static IsSessionEndError(error: string): boolean {
    let NullObject: string = "object reference not set to an instance of an object.";
    let NullValue: string = "value cannot be null";
    let NullIdentity: string = "parameter name: username";

    try {
      if (error.toLowerCase().includes(NullObject)) return true;
    } catch (err) { }
    try {
      if (error.toLowerCase().includes(NullValue)) return true;
    } catch (err) { }
    try {
      if (error.toLowerCase().includes(NullIdentity)) {
        //alert("Auto Logout Occurred Due to Session Inactivity")
        return true;
      }
    } catch (err) { }
    return false;
  }

  public static getResponseBody(response: HttpResponseBase) {
    if (response instanceof HttpResponse)
      return response.body;

    if (response instanceof HttpErrorResponse)
      return response.error || response.message || response.statusText;
  }

  public static checkNoNetwork(response: HttpResponseBase) {
    if (response instanceof HttpResponseBase) {
      return response.status == 0;
    }

    return false;
  }

  public static checkAccessDenied(response: HttpResponseBase) {
    if (response instanceof HttpResponseBase) {
      return response.status == 403;
    }

    return false;
  }

  public static checkNotFound(response: HttpResponseBase) {
    if (response instanceof HttpResponseBase) {
      return response.status == 404;
    }

    return false;
  }

  public static checkIsLocalHost(url: string, base?: string) {
    if (url) {
      let location = new URL(url, base);
      return location.hostname === "localhost" || location.hostname === "127.0.0.1";
    }

    return false;
  }

  public static getQueryParamsFromString(paramString: string) {

    if (!paramString)
      return null;

    let params: { [key: string]: string } = {};

    for (let param of paramString.split("&")) {
      let keyValue = Utilities.splitInTwo(param, "=");
      params[keyValue.firstPart] = keyValue.secondPart;
    }

    return params;
  }

  public static splitInTwo(text: string, separator: string): { firstPart: string, secondPart: string } {
    let separatorIndex = text.indexOf(separator);

    if (separatorIndex == -1)
      return { firstPart: text, secondPart: null };

    let part1 = text.substr(0, separatorIndex).trim();
    let part2 = text.substr(separatorIndex + 1).trim();

    return { firstPart: part1, secondPart: part2 };
  }

  public static safeStringify(object) {

    let result: string;

    try {
      result = JSON.stringify(object);
      return result;
    }
    catch (error) {

    }

    let simpleObject = {};

    for (let prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }
      if (typeof (object[prop]) == 'object') {
        continue;
      }
      if (typeof (object[prop]) == 'function') {
        continue;
      }
      simpleObject[prop] = object[prop];
    }

    result = "[***Sanitized Object***]: " + JSON.stringify(simpleObject);

    return result;
  }

  public static JSonTryParse(value: string) {
    try {
      return JSON.parse(value);
    }
    catch (e) {
      if (value === "undefined")
        return void 0;

      return value;
    }
  }

  public static TestIsObjectEmpty(obj: any) {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
  }

  public static TestIsUndefined(value: any) {
    return typeof value === 'undefined';
    //return value === undefined;
  }

  public static TestIsString(value: any) {
    return typeof value === 'string' || value instanceof String;
  }

  public static capitalizeFirstLetter(text: string) {
    if (text)
      return text.charAt(0).toUpperCase() + text.slice(1);
    else
      return text;
  }

  public static toTitleCase(text: string) {
    return text.replace(/\w\S*/g, (subString) => {
      return subString.charAt(0).toUpperCase() + subString.substr(1).toLowerCase();
    });
  }

  public static toLowerCase(items: string)
  public static toLowerCase(items: string[])
  public static toLowerCase(items: any): string | string[] {

    if (items instanceof Array) {
      let loweredRoles: string[] = [];

      for (let i = 0; i < items.length; i++) {
        loweredRoles[i] = items[i].toLowerCase();
      }

      return loweredRoles;
    }
    else if (typeof items === 'string' || items instanceof String) {
      return items.toLowerCase();
    }
  }

  public static uniqueId() {
    return this.randomNumber(1000000, 9000000).toString();
  }

  public static randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public static baseUrl() {
    let base = '';

    if (window.location.origin)
      base = window.location.origin;
    else
      base = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    return base.replace(/\/$/, '');
  }

  public static printDateOnly(date: Date) {

    date = new Date(date);

    let dayNames = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
    let monthNames = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

    let dayOfWeek = date.getDay();
    let dayOfMonth = date.getDate();
    let sup = "";
    let month = date.getMonth();
    let year = date.getFullYear();

    if (dayOfMonth == 1 || dayOfMonth == 21 || dayOfMonth == 31) {
      sup = "st";
    }
    else if (dayOfMonth == 2 || dayOfMonth == 22) {
      sup = "nd";
    }
    else if (dayOfMonth == 3 || dayOfMonth == 23) {
      sup = "rd";
    }
    else {
      sup = "th";
    }

    let dateString = dayNames[dayOfWeek] + ", " + dayOfMonth + sup + " " + monthNames[month] + " " + year;

    return dateString;
  }

  public static printTimeOnly(date: Date) {

    date = new Date(date);

    let period = "";
    let minute = date.getMinutes().toString();
    let hour = date.getHours();

    period = hour < 12 ? "AM" : "PM";

    if (hour == 0) {
      hour = 12;
    }
    if (hour > 12) {
      hour = hour - 12;
    }

    if (minute.length == 1) {
      minute = "0" + minute;
    }

    let timeString = hour + ":" + minute + " " + period;


    return timeString;
  }

  public static printDate(date: Date, separator = "at") {
    return `${Utilities.printDateOnly(date)} ${separator} ${Utilities.printTimeOnly(date)}`;
  }

  public static printFriendlyDate(date: Date, separator = "-") {
    let today = new Date(); today.setHours(0, 0, 0, 0);
    let yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let test = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (test.toDateString() == today.toDateString())
      return `Today ${separator} ${Utilities.printTimeOnly(date)}`;
    if (test.toDateString() == yesterday.toDateString())
      return `Yesterday ${separator} ${Utilities.printTimeOnly(date)}`;
    else
      return Utilities.printDate(date, separator);
  }

  public static printShortDate(date: Date, separator = "/", dateTimeSeparator = "-") {

    var day = date.getDate().toString();
    var month = (date.getMonth() + 1).toString();
    var year = date.getFullYear();

    if (day.length == 1)
      day = "0" + day;

    if (month.length == 1)
      month = "0" + month;

    return `${month}${separator}${day}${separator}${year} ${dateTimeSeparator} ${Utilities.printTimeOnly(date)}`;
  }

  public static parseDate(date) {

    if (date) {

      if (date instanceof Date) {
        return date;
      }

      if (typeof date === 'string' || date instanceof String) {
        if (date.search(/[a-su-z+]/i) == -1)
          date = date + "Z";

        return new Date(date);
      }

      if (typeof date === 'number' || date instanceof Number) {
        return new Date(<any>date);
      }
    }
  }

  public static printDuration(start: Date, end: Date) {

    start = new Date(start);
    end = new Date(end);

    // get total seconds between the times
    let delta = Math.abs(start.valueOf() - end.valueOf()) / 1000;

    // calculate (and subtract) whole days
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    let minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    let seconds = delta % 60;  // in theory the modulus is not required


    let printedDays = "";

    if (days)
      printedDays = `${days} days`;

    if (hours)
      printedDays += printedDays ? `, ${hours} hours` : `${hours} hours`;

    if (minutes)
      printedDays += printedDays ? `, ${minutes} minutes` : `${minutes} minutes`;

    if (seconds)
      printedDays += printedDays ? ` and ${seconds} seconds` : `${seconds} seconds`;


    if (!printedDays)
      printedDays = "0";

    return printedDays;
  }

  public static getAge(birthDate, otherDate) {
    birthDate = new Date(birthDate);
    otherDate = new Date(otherDate);

    let years = (otherDate.getFullYear() - birthDate.getFullYear());

    if (otherDate.getMonth() < birthDate.getMonth() ||
      otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
      years--;
    }

    return years;
  }

  public static searchArray(searchTerm: string, caseSensitive: boolean, ...values: any[]) {

    if (!searchTerm)
      return true;


    if (!caseSensitive)
      searchTerm = searchTerm.toLowerCase();

    for (let value of values) {

      if (value != null) {
        let strValue = value.toString();

        if (!caseSensitive)
          strValue = strValue.toLowerCase();

        if (strValue.indexOf(searchTerm) !== -1)
          return true;
      }
    }

    return false;
  }

  public static moveArrayItem(array: any[], oldIndex, newIndex) {

    while (oldIndex < 0) {
      oldIndex += this.length;
    }

    while (newIndex < 0) {
      newIndex += this.length;
    }

    if (newIndex >= this.length) {
      var k = newIndex - this.length;
      while ((k--) + 1) {
        array.push(undefined);
      }
    }

    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  }

  public static expandCamelCase(text: string) {

    if (!text)
      return text;

    return text.replace(/([A-Z][a-z]+)/g, " $1")
      .replace(/([A-Z][A-Z]+)/g, " $1")
      .replace(/([^A-Za-z ]+)/g, " $1");
  }

  public static testIsAbsoluteUrl(url: string) {

    let r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(url);
  }

  public static convertToAbsoluteUrl(url: string) {

    return Utilities.testIsAbsoluteUrl(url) ? url : '//' + url;
  }

  public static removeNulls(obj) {
    let isArray = obj instanceof Array;

    for (let k in obj) {
      if (obj[k] === null) {
        isArray ? obj.splice(k, 1) : delete obj[k];
      }
      else if (typeof obj[k] == "object") {
        Utilities.removeNulls(obj[k]);
      }

      if (isArray && obj.length == k) {
        Utilities.removeNulls(obj);
      }
    }

    return obj;
  }

  public static debounce(func: (...args) => any, wait: number, immediate?: boolean) {
    var timeout;

    return function () {
      var context = this;
      var args_ = arguments;

      var later = function () {
        timeout = null;
        if (!immediate)
          func.apply(context, args_);
      };

      var callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow)
        func.apply(context, args_);
    };
  }

  public static cookies = {
    getItem: (sKey) => {
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: (sKey, sValue, vEnd, sPath, sDomain, bSecure) => {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
        return false;
      }

      var sExpires = "";

      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
          case String:
            sExpires = "; expires=" + vEnd;
            break;
          case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
            break;
        }
      }

      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    },
    removeItem: (sKey, sPath, sDomain) => {
      if (!sKey) {
        return false;
      }
      document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
      return true;
    },
    hasItem: (sKey) => {
      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: () => {
      var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
      for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
      return aKeys;
    }
  }

  public static getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public static IsMobileScreen(): boolean {
    if (window.outerWidth > 767) {
      return false;
    }
    return true;
  }
  public static FocusOnInitializeEditor(flag): any {
    if (flag) {
      return {
        'froalaEditor.initialized': (e, editor) => {
          console.log('froalaEditor.initialized');
          editor.events.focus(true);
        }
      }
    }
    return {};
  }

  public static RefreshPage(url: string, router: Router, headers: HeaderValues, rulesetID: number, localStorage: LocalStoreManager) {

    let NewUrl = url;
    if (+url.split('/')[url.split('/').length - 1]) {
      NewUrl = url.replace('/' + url.split('/')[url.split('/').length - 1], '')
    }

    let lastPageAccessed = localStorage.localStorageGetItem("LastAccessedPage");

    if (lastPageAccessed) {
      let GoToAddress = localStorage.localStorageGetItem("LastAccessedPage");
      if (+lastPageAccessed.split('/')[lastPageAccessed.split('/').length - 1]) {
        lastPageAccessed = lastPageAccessed.replace('/' + lastPageAccessed.split('/')[lastPageAccessed.split('/').length - 1], '')
      }
      if (lastPageAccessed == url) {
        let NewUrl = lastPageAccessed;
        localStorage.localStorageSetItem("LastAccessedPage", GoToAddress);
        //this.RefreshURLFlag = true;

        this.RedriectToPageWithoutId(GoToAddress, NewUrl, router, 5);
        //router.navigate([GoToAddress], { skipLocationChange: true });
        //window.history.pushState('', '', NewUrl)
      }
      else if (lastPageAccessed.indexOf(url) > -1) {
        let NewUrl = lastPageAccessed;
        localStorage.localStorageSetItem("LastAccessedPage", GoToAddress);
        //this.RefreshURLFlag = true;

        this.RedriectToPageWithoutId(GoToAddress, NewUrl, router, 6);
        //router.navigate([GoToAddress], { skipLocationChange: true });
        //window.history.pushState('', '', NewUrl)
      }
    }


    if (headers) {
      if (headers.headerId) {
        url = url + "/" + headers.headerId;
        if (headers.headerLink == 'ruleset') {
          if (url.toUpperCase().indexOf('/RULESET/ABILITY/') > -1
            || url.toUpperCase().indexOf('/RULESET/SPELL/') > -1
            || url.toUpperCase().indexOf('/RULESET/ITEM-MASTER/') > -1
            || url.toUpperCase().indexOf('/RULESET/CHARACTER-STATS/') > -1
            || url.toUpperCase().indexOf('/RULESET/DASHBOARD/') > -1
          ) {
            this.RedriectToPageWithoutId(url, NewUrl, router, 7);
            //  router.navigate([url], { skipLocationChange: true });
            //window.history.pushState('', '', NewUrl)
          }
        }
        else if (headers.headerLink == 'character') {
          if (
            url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1
            || url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1
            || url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1
            || url.toUpperCase().indexOf('/CHARACTER/CHARACTER-STATS/') > -1
            || url.toUpperCase().indexOf('/CHARACTER/DASHBOARD/') > -1
            || url.toUpperCase().indexOf('/CHARACTER/TILES/') > -1
          ) {
            this.RedriectToPageWithoutId(url, NewUrl, router, 8);
            //router.navigate([url], { skipLocationChange: true });
            //window.history.pushState('', '', NewUrl)
          }

          else if (
            url.toUpperCase().indexOf('/CHARACTER/RULESET') > -1
            && url.toUpperCase().indexOf('DETAILS') == -1
          ) {

            url = url.replace("/" + headers.headerId, ' ');
            url = url.trim() + "/" + rulesetID;
            this.RedriectToPageWithoutId(url, NewUrl, router, 9);
            //router.navigate([url], { skipLocationChange: true });
            //window.history.pushState('', '', NewUrl)

          }
        }
      }

    }
  }

  public static RedriectToPageWithoutId(originalUrl: string, displayUrl: string, router: Router, RedriectFromCode: number) {
    if (originalUrl.indexOf('/search/')>-1) {
      displayUrl = originalUrl;
    }
    router.navigate([originalUrl], { skipLocationChange: true });
    window.history.pushState('', '', displayUrl);
  }

  public static InvalidValueForConditionStats: number = -25163711;


  public static setCharacterRedirection(routerUrl, characterID, rulesetID, characterNavigation) {

    if (routerUrl.toUpperCase().indexOf('/CHARACTER/DASHBOARD') > -1 && (typeof (characterNavigation[characterID]) == 'undefined')) {
      characterNavigation[characterID] = {
        'items': '/character/inventory/' + characterID,
        'spells': '/character/spell/' + characterID,
        'abilities': '/character/ability/' + characterID
      };
    }
    else if (characterID && characterNavigation && characterNavigation[characterID]) {
      if (routerUrl.toUpperCase().indexOf('/CHARACTER/RULESET/ITEMS') > -1) {
        characterNavigation[characterID].items = '/character/ruleset/items/' + rulesetID;
      }
      else if (routerUrl.toUpperCase().indexOf('/CHARACTER/RULESET/SPELLS') > -1) {
        characterNavigation[characterID].spells = '/character/ruleset/spells/' + rulesetID;
      }
      else if (routerUrl.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITIES') > -1) {
        characterNavigation[characterID].abilities = '/character/ruleset/abilities/' + rulesetID;
      }
      else if (routerUrl.toUpperCase().indexOf('/CHARACTER/INVENTORY') > -1) {
        characterNavigation[characterID].items = '/character/inventory/' + characterID;
      }
      else if (routerUrl.toUpperCase().indexOf('/CHARACTER/SPELL') > -1) {
        characterNavigation[characterID].spells = '/character/spell/' + characterID;
      }
      else if (routerUrl.toUpperCase().indexOf('/CHARACTER/ABILITY') > -1) {
        characterNavigation[characterID].abilities = '/character/ability/' + characterID;
      }

    }

    return characterNavigation;

  }
  public static isGoingToAppNonLoginRoutes(url: string): boolean {
    if (
      url.toUpperCase().indexOf('/LOGIN') != -1
      || url.toUpperCase().indexOf('/REGISTER') != -1
      || url.toUpperCase().indexOf('/FORGOTPASSWORD') != -1
      || url.toUpperCase().indexOf('/FORGOT-PASSWORD-EMAIL') != -1
      || url.toUpperCase().indexOf('/RESETPASSWORD') != -1
      || url.toUpperCase().indexOf('/RESET-PASSWORD-SUCCESS') != -1
      || url.toUpperCase().indexOf('/REGISTER-EMAIL-CONFIRMATION') != -1
      || url.toUpperCase().indexOf('/EMAIL-CONFIRMATION') != -1
      || url.toUpperCase().indexOf('/EMAIL-CONFIRMATION-SUCCESS') != -1
      || url.toUpperCase().indexOf('/PRIVACYPOLICY') != -1
      || url.toUpperCase().indexOf('/TERMSCONDITION') != -1
      || url.toUpperCase().indexOf('/LOGONWARNING') != -1
    ) {
      return true;
    }
    return false;
  }
  public static Kickstarterlink() {

    let url = 'https://www.kickstarter.com/projects/rpgsmith/rpgsmith-gm-campaigns';
    window.open(url, "_blank");
  }

  public static getHelpLinkUrl(url) {
    if (url.toUpperCase() == '/CHARACTERS' || url.toUpperCase() == '/CHARACTER') {
      return 'https://rpgsmith.com/helpa/#a11';
    }
    else if (url.toUpperCase() == '/RULESETS' || url.toUpperCase() == '/RULESET') {
      return 'https://rpgsmith.com/helpa/#a12';
    }
    else if (url.toUpperCase() == '/RULESETS/CAMPAIGNS' || url.toUpperCase() == '/RULESET/CAMPAIGNS') {
      return 'https://rpgsmith.com/helpa/#a13';
    }
    else if (url.toUpperCase().indexOf('/RULESET/CAMPAIGN-DETAILS/') > -1) {
      return 'https://rpgsmith.com/helpc/#c1a ';
    }
    else if (url.toUpperCase().indexOf('RULESET/COMBAT/') > -1 || url.toUpperCase().indexOf('CHARACTER/COMBATPLAYER/') > -1) {
      return 'https://rpgsmith.com/helpg/#g1';
    }
    else if (url.toUpperCase().indexOf('/RULESET/MONSTER/') > -1) {
      return 'https://rpgsmith.com/helpe/#e6';
    }
    else if (url.toUpperCase().indexOf('RULESET/MONSTER-DETAILS/') > -1) {
      return 'https://rpgsmith.com/helpe/#e6a';
    }
    else if (url.toUpperCase().indexOf('/RULESET/MONSTER-TEMPLATE/') > -1) {
      return 'https://rpgsmith.com/helpe/#e5';
    }
    else if (url.toUpperCase().indexOf('/RULESET/MONSTER-TEMPLATE-DETAILS/') > -1) {
      return 'https://rpgsmith.com/helpe/#e5a';
    }
    else if (url.toUpperCase().indexOf('/RULESET/LOOT/') > -1) {
      return 'https://rpgsmith.com/helpe/#e9';
    }
    else if (url.toUpperCase().indexOf('/RULESET/LOOT-DETAILS/') > -1) {
      return 'https://rpgsmith.com/helpe/#e9a';
    }
    else if (url.toUpperCase().indexOf('/RULESET/LOOT-PILE-TEMPLATE/') > -1) {
      return 'https://rpgsmith.com/helpe/#e8';
    }
    else if (url.toUpperCase().indexOf('/RULESET/LOOT-PILE-TEMPLATE-DETAILS/') > -1) {
      return 'https://rpgsmith.com/helpe/#e8a';
    }
    else if (url.toUpperCase().indexOf('/RULESET/ADD') > -1) {
      return 'https://rpgsmith.com/helpa/#a13a';
    }
    else if (url.toUpperCase().indexOf('/MARKETPLACE') > -1) {
      return 'https://rpgsmith.com/helpa/#a6';
    }
    else if (url.toUpperCase().indexOf('/CHARACTER/DASHBOARD/') > -1 || url.toUpperCase().indexOf('/RULESET/CAMPAIGN-DASHBOARD/') > -1) {
      return 'https://rpgsmith.com/helpb/#b2';
    }
    else if (url.toUpperCase().indexOf('/RULESET/DASHBOARD/') > -1) {
      return 'https://rpgsmith.com/helpc/#c3';
    }
    else if (url.toUpperCase().indexOf('/CHARACTER/TILES/') > -1) {
      return 'https://rpgsmith.com/helpb/#b4';
    }
    else if (url.toUpperCase().indexOf('/SEARCH/') > -1) {
      return 'https://rpgsmith.com/helph/#h';
    }
    else if (url.toUpperCase().indexOf('/CHARACTER/CHARACTER-STATS/') > -1) {
      return 'https://rpgsmith.com/helpb/#b6';
    } 
    else if (url.toUpperCase().indexOf('/RULESET/CHARACTER-STATS/') > -1) {
      return 'https://rpgsmith.com/helpc/#c2';
    }
    else if (url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1) {
      return 'https://rpgsmith.com/helpe/#e2';
    }
    else if (url.toUpperCase().indexOf('/CHARACTER/INVENTORY-DETAILS/') > -1) {
      return 'https://rpgsmith.com/helpe/#e2c';
    }
    else if ((url.toUpperCase().indexOf('/RULESET/ITEM-MASTER/') > -1 ||
      url.toUpperCase().indexOf('/RULESET/ITEM-DETAILS/') > -1 ||
      url.toUpperCase().indexOf('/RULESET/BUNDLE-DETAILS/') > -1)
      && url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
      return 'https://rpgsmith.com/helpe/#e1';
    }
    else if ((url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1) ||
      (url.toUpperCase().indexOf('/RULESET/SPELL/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELLS/') > -1)) {
      return 'https://rpgsmith.com/helpe/#e3';
    }
    else if ((url.toUpperCase().indexOf('/CHARACTER/SPELL-DETAILS/') > -1) ||
      (url.toUpperCase().indexOf('/RULESET/SPELL-DETAILS/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELL-DETAILS/') > -1)) {
      return 'https://rpgsmith.com/helpe/#e3c';
    }
    else if ((url.toUpperCase().indexOf('/RULESET/BUFF-EFFECT/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT/') > -1)){
      return 'https://rpgsmith.com/helpe/#e7';
    }
    else if ((url.toUpperCase().indexOf('/RULESET/BUFF-EFFECT-DETAILS/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAILS/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAIL/') > -1)) {
      return 'https://rpgsmith.com/helpe/#e7a';
    }
    else if ((url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1) ||
      (url.toUpperCase().indexOf('/RULESET/ABILITY/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITIES/') > -1)) {
      return 'https://rpgsmith.com/helpe/#e4';
    }
    else if ((url.toUpperCase().indexOf('/CHARACTER/ABILITY-DETAILS/') > -1) ||
      (url.toUpperCase().indexOf('/RULESET/ABILITY-DETAILS/') > -1) ||
      (url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITY-DETAILS/') > -1)) {
      return 'https://rpgsmith.com/helpe/#e4c';
    }

    else if (url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEMS/') > -1 ||
      url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEM-DETAIL/') > -1) {
      return 'https://rpgsmith.com/helpe/#e1';
    }
  }

  //public static LogoImage: string = 'logo-full.png'; //for prod //beta //--Not used now
  public static LogoImage: string = 'logo-full.svg'; // for prod //non-beta

  public static DecimalNumber = (number: number) => (number % 1 == 0) ? number : parseFloat(number.toFixed(3));
    
  

}
