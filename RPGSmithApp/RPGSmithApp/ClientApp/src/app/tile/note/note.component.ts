import { Component, OnInit, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { CharacterTile } from '../../core/models/tiles/character-tile.model';
import { NoteTile } from '../../core/models/tiles/note-tile.model';
import { CharacterDashboardPage } from '../../core/models/view-models/character-dashboard-page.model';
import { Color } from '../../core/models/tiles/color.model';
import { ColorService } from '../../core/services/tiles/color.service';
import { NoteTileService } from '../../core/services/tiles/note-tile.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { SharedService } from '../../core/services/shared.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { SHAPE_CLASS, SHAPE, VIEW, TILES } from '../../core/models/enums';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../colors/colors.component';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteTileComponent implements OnInit {
  shapeClass: string;
  isLoading: boolean;
  characterTileModel = new CharacterTile();
  noteFormModel = new NoteTile();
  pageId: number;
  characterId: number;
  title: string;
  colorList: Color[] = [];
  view: string;
  userId: string;

  selectedColor: string = '';
  selected: boolean;
  tileColor: string;
  pageDefaultData = new CharacterDashboardPage();
  showMoreLessColorText: string = "Advanced";
  showMoreLessColorToggle: boolean = true;
  defaultColorList: any = [];
  colorModel: Color = new Color();
  showDemo: boolean = false;
  tile: number;
  selectedStatType: number = 0;
  selectedIndex: number;
  public event: EventEmitter<any> = new EventEmitter();
  //options: Object = Utilities.optionsNoteTile;
  uploadingFile: boolean = false;
  autoFocusEditor: boolean = false;

  isManual: boolean = true;
  fontOptions = [
    { id: 1, value: 8 },
    { id: 2, value: 9 },
    { id: 3, value: 10 },
    { id: 4, value: 11 },
    { id: 5, value: 12 },
    { id: 6, value: 14 },
    { id: 7, value: 16 },
    { id: 8, value: 18 },
    { id: 9, value: 20 },
    { id: 10, value: 22 },
    { id: 11, value: 24 },
    { id: 12, value: 26 },
    { id: 13, value: 28 },
    { id: 14, value: 36 },
    { id: 15, value: 48 },
    { id: 16, value: 72 }];
  selectedFontSize = [];
  selectedFontSizeTitle = [];

  public mobileToolbarButton = ['bold', 'italic', 'underline', 'insertImage', 'paragraphStyle', 'paragraphFormat', 'undo', 'redo', 'lineHeight'];
  public options: Object = {

    /////////////////////////////////
    // key: '9H4B3G3C6A2B3F-11D2C2D2G2C3B3C4D6E1D1rB-8i1vaC-16C-13aB-9A1H-8vw==',
    ////key: 'Fwvh1H-8dcC-21dA6mg1B-8==',
    //toolbarInline: false,
    //height: 300,
    //charCounterCount: true,
    //toolbarVisibleWithoutSelection: false,
    //toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
    //    '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle',
    //    '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertLink',
    //    //'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable',
    //    '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting',
    //    '|', 'print', 'spellChecker', 'html',
    //    '|', 'undo', 'redo'],
    //quickInsertButtons: ['embedly', 'table', 'ul', 'ol', 'hr'], //'image', 'video',
    ////quickInsertTags: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'],
    ////pluginsEnabled: ['quickInsert', 'image', 'table', 'lists']
    /////////////////////////////////

    key: '9H4B3G3C6A2B3F-11D2C2D2G2C3B3C4D6E1D1rB-8i1vaC-16C-13aB-9A1H-8vw==',
    //key: 'Fwvh1H-8dcC-21dA6mg1B-8==',
    charCounterCount: true,
    heightMax: 200,
    toolbarButtons: Utilities.IsMobileScreen() ? this.mobileToolbarButton : ['fullscreen', 'my_dropdown', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
      '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle',
      '|', 'paragraphFormat', 'align', 'lineHeight', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote',
      //'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertTable',
      'insertLink', 'insertImage', 'embedly', 'insertTable',
      '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting',
      '|', 'print', 'spellChecker', 'html',
      '|', 'undo', 'redo'],
    // Set the image upload parameter.
    imageUploadParam: 'image_param',
    // Set the image upload URL.
    imageUploadURL: this.configuration.baseUrl + '/api/Image/uploadEditorImageByUserId',
    // Additional upload params.
    imageUploadParams: { userId: this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id },
    imageUploadMethod: 'POST',
    imageMaxSize: 1024 * 1024 * 10,
    // Allow to upload PNG and JPG.
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],

    videoPaste: false,
    videoUpload: false,
    videoAllowDragAndDrop: false,
    videoInsertingStrategy: "url",
    //// Set the video upload parameter.
    //videoUploadParam: 'video_param',
    //// Set the video upload URL.
    //videoUploadURL: this.configuration.baseUrl +'/api/Image/uploadVideoByUserId',
    //// Additional upload params.
    //videoUploadParams: { userId: this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id },
    //// Set request type.
    //videoUploadMethod: 'POST',
    //// Set max video size to 50MB.
    //videoMaxSize: 50 * 1024 * 1024,
    //videoAllowedTypes: ['webm', 'ogg', 'mp4'],
    //lineBreakerTags: ['table', 'hr', 'form'],
    events: {
      'froalaEditor.initialized': (e, editor) => {
        if (this.autoFocusEditor) {
          editor.events.focus(true);
        }
        console.log('froalaEditor.initialized');
      },
      'froalaEditor.image.uploaded': (e, editor, response) => {
        let responseobj = { "link": response }
        // Parse response to get image url.
        var img_url = response;

        // Insert image.
        editor.image.insert(img_url, false, null, editor.image.get(), responseobj);
        //editor.image.insert(response, null, null, editor.image.get());                
        //editor.image.get()[0].src = response;
        console.log('froalaEditor.image.uploaded');
        this.uploadingFile = false;
        return false;
      },
      'froalaEditor.image.inserted': (e, editor, images, response) => {
        this.uploadingFile = false;
        console.log('froalaEditor.image.inserted');
      },
      'froalaEditor.image.beforeUpload': (e, editor, images) => {
        this.uploadingFile = true;
        console.log('froalaEditor.image.beforeUpload');
        //if (images.length) {
        //    // Create a File Reader.
        //    const reader = new FileReader();
        //    // Set the reader to insert images when they are loaded.
        //    reader.onload = (ev) => {
        //        const result = ev.target['result'];
        //        // images[0].src = result;
        //       // console.log('aaa', editor.image.get())
        //        
        //         //editor.image.insert(result, null, null, editor.image.get());
        //       // console.log(ev, editor.image, ev.target['result'])
        //    };
        //    // Read image as base64.
        //    reader.readAsDataURL(images[0]);
        //    //this.fileUpload(images[0]);
        //}
      },
      'froalaEditor.image.error': (e, editor, error, response) => {
        this.uploadingFile = false;
        //console.log('froalaEditor.image.error', error);
      },
      //'froalaEditor.video.uploaded': (e, editor, response) => {                
      //    let responseobj = { "link": response }
      //    // Parse response to get image url.
      //    var vid_url = response;

      //    //let vidType = '';
      //    //if (response.) {

      //    //}
      //    // Insert image.

      //    //editor.events.focus(true);
      //    //editor.selection.restore();

      //    //let embdedString = '<iframe width="560" height="315" src="' + response+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      //    let string = '<video controls src="' + response +'"   class="fr-draggable">Your browser does not support HTML5 video.</video>';
      //    //editor.html.insert('<span contenteditable="false" class="fr-jiv fr-video fr-dv' + (editor.opts.videoDefaultDisplay[0]) + (editor.opts.videoDefaultAlign != 'center' ? ' fr-fv' + editor.opts.videoDefaultAlign[0] : '') + '">' + string + '<span>');
      //    editor.video.insert(string);
      //    this.uploadingFile = false;
      //    //editor.video.insert(response, null, null, editor.video.get());
      //    console.log('froalaEditor.video.uploaded');
      //    return false;

      //},
      //'froalaEditor.video.inserted': (e, editor, img, response) => {
      //    this.uploadingFile = false;
      //    //
      //    //images.map((img) => {
      //    //    editor.image.insert(img, null, null, editor.image.get());
      //    //})
      //   // editor.video.insert(img[0], null, null, editor.video.get());
      //    console.log('froalaEditor.video.inserted');
      //},
      //'froalaEditor.video.beforeUpload': (e, editor, images) =>{
      //    this.uploadingFile = true;
      //    //if (images.length) {
      //    //    // Create a File Reader.
      //    //    const reader = new FileReader();
      //    //    // Set the reader to insert images when they are loaded.
      //    //    reader.onload = (ev) => {
      //    //        const result = ev.target['result'];
      //    //        // images[0].src = result;
      //    //       // console.log('aaa', editor.image.get())
      //    //        
      //    //        editor.video.insert(result, null, null, editor.video.get());
      //    //       // console.log(ev, editor.image, ev.target['result'])
      //    //    };
      //    //    // Read image as base64.
      //    //    reader.readAsDataURL(images[0]);
      //    //    //this.fileUpload(images[0]);
      //    //}
      //    console.log('froalaEditor.video.beforeUpload');
      //},
      //'froalaEditor.video.error': (e, editor, error, response) => {
      //    this.uploadingFile = false;
      //    console.log('froalaEditor.video.error', error);
      //}
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.submitForm();
    }
  }

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private colorService: ColorService,
    private alertService: AlertService, private noteTileService: NoteTileService, private localStorage: LocalStoreManager,
    private authService: AuthService, private sharedService: SharedService, private fileUploadService: FileUploadService,
    private configuration: ConfigurationService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {

    setTimeout(() => {
      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      this.view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.characterTileModel = this.noteTileService.noteTileModelData(model, this.characterId, this.pageId, this.view, this.pageDefaultData);
      this.noteFormModel = Object.assign({}, this.characterTileModel.noteTile);
      this.noteFormModel.color = this.characterTileModel.color;
      this.noteFormModel.shape = this.characterTileModel.shape;
      this.shapeClass = this.characterTileModel.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.characterTileModel.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
      this.autoFocusEditor = this.bsModalRef.content.autoFocusEditor ? this.bsModalRef.content.autoFocusEditor : false;

      this.isManual = this.noteFormModel.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.noteFormModel.fontSizeTitle);
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.noteFormModel.fontSize);
      }

      this.Initialize(this.noteFormModel);
    }, 0);
  }

  private Initialize(Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
      this.userId = user.id;
      this.colorService.getRecentColors<any>()
        .subscribe(data => {
          let _colorList = [];
          let _hasSame = 0;
          data.forEach((val, index) => {
            let _selected = false;
            if (index == 0 && Tile.view == VIEW.ADD) {
              _selected = true;
            }
            else if (_hasSame == 0 && Tile.view != VIEW.ADD) {
              _hasSame = (Tile.titleBgColor == val.titleBgColor
                && Tile.bodyBgColor == val.bodyBgColor) ? 1 : 0;
              _selected = _hasSame ? true : false;
            }
            _colorList.push({
              titleBgColor: val.titleBgColor,
              titleTextColor: val.titleTextColor,
              bodyBgColor: val.bodyBgColor,
              bodyTextColor: val.bodyTextColor,
              selected: _selected
            });
          });
          let colorDelectedforTile = false;
          _colorList.map((clr, index) => {
            if (clr.selected) {
              colorDelectedforTile = true;
              this.setColor(clr);
            }
          })
          if (!colorDelectedforTile) {

            let newColor = {
              titleBgColor: Tile.titleBgColor,
              titleTextColor: Tile.titleTextColor,
              bodyBgColor: Tile.bodyBgColor,
              bodyTextColor: Tile.bodyTextColor,
              selected: true
            }
            _colorList.splice(0, 0, newColor);
            if (_colorList.length > 6) {
              _colorList.splice(6, _colorList.length - 6)
            }
            this.setColor(newColor)


          }
          this.colorList = _colorList;
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Error getting recent colors", error);
          if (Errors.sessionExpire) this.authService.logout(true);
          else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }, () => { });
    }

  }
  showMoreColorFields() {
    if (this.showMoreLessColorToggle) {
      this.showMoreLessColorText = "Show Less";

    } else {
      this.showMoreLessColorText = "Advanced";
    }
    this.showMoreLessColorToggle = !this.showMoreLessColorToggle;
  }

  setColor(color: any) {
    // console.log(color);

    this.tileColor = color.bgColor;
    this.selectedColor = color.bgColor;
    this.colorList.forEach(function (val) {
      val.selected = false;
    });
    this.noteFormModel.titleTextColor = color.titleTextColor;
    this.noteFormModel.titleBgColor = color.titleBgColor;
    this.noteFormModel.bodyTextColor = color.bodyTextColor;
    this.noteFormModel.bodyBgColor = color.bodyBgColor;
    color.selected = true;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.noteFormModel.titleTextColor,
      titleBgColor: this.noteFormModel.titleBgColor,
      bodyTextColor: this.noteFormModel.bodyTextColor,
      bodyBgColor: this.noteFormModel.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }
  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.noteFormModel.titleTextColor = color.titleTextColor;
    this.noteFormModel.titleBgColor = color.titleBgColor;
    this.noteFormModel.bodyTextColor = color.bodyTextColor;
    this.noteFormModel.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.noteFormModel.titleTextColor,
      titleBgColor: this.noteFormModel.titleBgColor,
      bodyTextColor: this.noteFormModel.bodyTextColor,
      bodyBgColor: this.noteFormModel.bodyBgColor
    }
    this.colorList.map((val) => { val.selected = false; });
  }

  setColorOnInit() {
    //let colorExist = false;
    this.isLoading = true;
    this.colorService.getRPGCoreColors<any>().subscribe(data => {
      data.forEach((val, index) => {
        this.defaultColorList.push({
          titleBgColor: val.titleBgColor,
          titleTextColor: val.titleTextColor,
          bodyBgColor: val.bodyBgColor,
          bodyTextColor: val.bodyTextColor,
          selected: index == 0 ? true : false
        });
      });
    }, error => { }, () => { });

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


  setShape(value: number) {
    this.noteFormModel.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  openColorPopup() {
    this.bsModalRef = this.modalService.show(ColorsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Select Tile Colors";
    this.bsModalRef.content.tile = TILES.NOTE;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.noteFormModel.titleTextColor,
      titleBgColor: this.noteFormModel.titleBgColor,
      bodyTextColor: this.noteFormModel.bodyTextColor,
      bodyBgColor: this.noteFormModel.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.tileColor = data.color;
      this.noteFormModel.titleTextColor = data.titleTextColor;
      this.noteFormModel.titleBgColor = data.titleBgColor;
      this.noteFormModel.bodyTextColor = data.bodyTextColor;
      this.noteFormModel.bodyBgColor = data.bodyBgColor;

      this.colorList.forEach(function (val) {
        val.selected = false;
      });
      this.colorList.push({
        titleBgColor: data.titleBgColor,
        titleTextColor: data.titleTextColor,
        bodyBgColor: data.bodyBgColor,
        bodyTextColor: data.bodyTextColor,
        selected: true
      });
      if (this.colorList.length > 1)
        this.colorList.splice(0, 1);
      this.bsModalRef.hide();
    });

  }

  submitForm() {
    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Note tile is not selected.", MessageSeverity.error);
    }
    else {
      //  this.selectedColor = data.color;
      this.noteFormModel.color = this.tileColor ? this.tileColor : '#343038';
      this.characterTileModel.color = this.noteFormModel.color;
      this.characterTileModel.shape = this.noteFormModel.shape;
      this.characterTileModel.noteTile = this.noteFormModel;

      let _msg = this.noteFormModel.noteTileId == 0 || this.noteFormModel.noteTileId === undefined ? "Creating Note Tile..." : "Updating Note Tile...";
      this.alertService.startLoadingMessage("", _msg);
      this.addEditNoteTile(this.characterTileModel);
    }
  }

  private addEditNoteTile(modal) {

    if (this.isManual) {
      this.noteFormModel.isManual = true;
      this.noteFormModel.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.noteFormModel.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.noteFormModel.isManual = false;
    }

    this.isLoading = true;
    this.noteTileService.createNoteTile(modal)
      .subscribe(
        data => {
          //   console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.noteTile.noteTileId == 0 || modal.noteTile.noteTileId === undefined ? "Note Tile has been added successfully." : "Note Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateCharacterList(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.noteTile.noteTileId == 0 || modal.noteTile.noteTileId === undefined ? "Unable to Add " : "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        },
      );
  }

  close() {
    this.bsModalRef.hide();
    this.event.emit(true);
    this.destroyModalOnInit();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  private fileUpload(fileToUpload) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, fileToUpload)
        .subscribe(
          data => {

          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          });
    }
  }

  setFontSizeType(fontStyle: boolean) {
    this.isManual = fontStyle;
  }

  get fontSettings() {
    return {
      primaryKey: "id",
      labelKey: "value",
      text: "Size",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class",
      showCheckbox: false,
      position: "bottom"
    };
  }

  get fontSettingsTitle() {
    return {
      primaryKey: "id",
      labelKey: "value",
      text: "Size",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class",
      showCheckbox: false,
      position: "bottom"
    };
  }

}
