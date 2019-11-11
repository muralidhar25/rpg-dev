import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Characters } from '../../../core/models/view-models/characters.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { DBkeys } from '../../../core/common/db-keys';
import { IMAGE, VIEW } from '../../../core/models/enums';
import { User } from '../../../core/models/user.model';
import { Utilities } from '../../../core/common/utilities';
import { BingSearchComponent } from '../bing-search/bing-search.component';
import { PlatformLocation } from '@angular/common';


@Component({
    selector: 'app-image-selector',
    templateUrl: './image-selector.component.html',
    styleUrls: ['./image-selector.component.scss'],

})

export class ImageSelectorComponent implements OnInit {
    flag: boolean = true
    isInitial: boolean = true;
    enumImage: any = {};
    Undo: string = 'Undo';
    Crop: string = 'Crop';
    SearchImage: string = 'Search Image';
    CropImage: string = 'Crop Image';
    title: string;
    image: string;
    imageBase64: string;
    errorImage: string = '../assets/images/DefaultImages/ability.jpg';
    imageChangedEvent: any = '';
    croppedFile: any = '';
    croppedImage: any = '';
    bingImageUrl: string;
    bingImageExt: string;
    uploadFromBing: boolean = false;
    charactersFormModal: any = new Characters();
    fileToUpload: File = null;
    Old_fileToUpload: File = null;
    Old_imageUrl: string = '';
    isCropable: boolean = true;
    isCropableUndo: boolean = false;
    cropBtnText: string = this.Crop;
    data: any;
    isImageLoadong: boolean = false;
    constructor(
        protected http: HttpClient,
        private bsModalRef: BsModalRef,
        private authService: AuthService,
        private modalService: BsModalService,
        private localStorage: LocalStoreManager,
        private imageSearchService: ImageSearchService,
        private alertService: AlertService,
     private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {
        setTimeout(() => {
            // this.isInitial = true;
            this.Initialize();
        }, 0);
    }
    private async  getBase64ImageFromUrl(imageUrl) {
        
        var res = await fetch(imageUrl);
        var blob = await res.blob();
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.addEventListener("load", () => {
                resolve(reader.result);
            }, false);

            reader.onerror = () => {
                return reject(this);
            };
            reader.readAsDataURL(blob);
        })
    }
    private LoadImage(ImageUrl, fromLocal) {
        
        this.isImageLoadong = true;
        //var imageBase64 = '';
        try {
            if (fromLocal) {
                
                this.getBase64ImageFromUrl(ImageUrl)
                    .then((result) => {
                        this.imageBase64 = result.toString()
                        this.isImageLoadong = false;
                    })
                    .catch((err) => { console.log('ImageConversionError', err) });
            }
            else {
                if ((ImageUrl.toLowerCase().indexOf('http://') > -1) || (ImageUrl.toLowerCase().indexOf('https://') > -1)) {
                    fetch(new Request("/api/Image/ConvertImageURLToBase64?url=" + ImageUrl)).then((response) => {

                        response.text().then((base64) => {

                            this.imageBase64 = base64;
                            this.isImageLoadong = false;
                        });
                    });
                }
                else {
                    
                    this.getBase64ImageFromUrl(ImageUrl)
                        .then((result) => {
                            this.imageBase64 = result.toString()
                            this.isImageLoadong = false;
                        })
                        .catch((err) => { console.log('ImageConversionError1', err) });
                }
            }
        }
        catch (e) {
            console.log('errLoadImage', e)
        }
    }
    private Initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.title = this.bsModalRef.content.title ? this.bsModalRef.content.title : this.CropImage;
            //this.charactersFormModal.imageUrl = '../assets/images/DefaultImages/ability.jpg'
            this.enumImage = IMAGE;
            if (this.bsModalRef.content.errorImage) {
                this.errorImage = this.bsModalRef.content.errorImage;
            }
            this.charactersFormModal.imageUrl = this.bsModalRef.content.image != null ? this.bsModalRef.content.image : this.errorImage;
            this.charactersFormModal.Old_imageUrl = this.bsModalRef.content.image != null ? this.bsModalRef.content.image : this.errorImage;
            //this.imageChangedEvent = this.bsModalRef.content.imageChangedEvent ? this.bsModalRef.content.imageChangedEvent : '';

            if (this.bsModalRef.content.image) {
                if (this.bsModalRef.content.image.indexOf('data:image')>-1) {
                    this.imageBase64 = this.bsModalRef.content.image;
                }
                else {
                    this.LoadImage(this.bsModalRef.content.image, this.bsModalRef.content.view == VIEW.ADD ? true : false);
                }
            }
            else {
                if (this.bsModalRef.content.title == 'default') {
                    this.LoadImage(this.errorImage, true);
                }
                else {
                    this.isImageLoadong = true;
                    if (this.bsModalRef.content.title != 'none') {
                        this.imageSearchService.getDefaultImage<any>(this.bsModalRef.content.title ? this.bsModalRef.content.title : '')
                            .subscribe(data => {
                                this.charactersFormModal.imageUrl = data.imageUrl.result
                                this.charactersFormModal.Old_imageUrl = data.imageUrl.result

                                this.LoadImage(data.imageUrl.result, false);
                                //this.isImageLoadong = false;
                            }, error => {
                              console.log("Error: ", error);
                              this.isImageLoadong = false;
                                this.alertService.stopLoadingMessage();
                                let Errors = Utilities.ErrorDetail("Default Image Api", error);
                                if (Errors.sessionExpire) this.authService.logout(true);
                                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                            },
                                () => { });
                    }
                    else {
                        this.charactersFormModal.imageUrl = null
                        this.charactersFormModal.Old_imageUrl = null
                        this.imageBase64 = null;
                        this.isImageLoadong = false;
                        this.isCropable = false;
                    }
                }
            }
        }
    }
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCroppedBase64(file: string) {
        this.croppedImage = file;
        this.charactersFormModal.imageUrl = this.croppedImage;
    }
    imageCroppedFile(file: File) {
        if (this.isInitial) {
            this.isInitial = false;
            this.flag = true
        }

        this.croppedFile = file;

    }
    imageLoaded() {
        // show cropper
    }
    loadImageFailed() {
        // show message
    }

    public event: EventEmitter<any> = new EventEmitter();

  saveImageFile() {
      
        if (this.flag) {
            this.event.emit({ base64: this.charactersFormModal.Old_imageUrl, file: this.Old_fileToUpload, isUrl: this.Old_fileToUpload ? false : true });
        }
        else {
            this.event.emit({ base64: this.charactersFormModal.imageUrl, file: this.fileToUpload, isUrl: this.fileToUpload ? false : true });
        }
        this.close();
    }

    removeImageFile() {
        this.event.emit({ base64: null, file: null, isUrl: false });
        this.close();
    }

    close() {
        this.bsModalRef.hide();
        this.destroyModal();
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
    openWeb(type) {
        this.bsModalRef = this.modalService.show(BingSearchComponent, {
            class: 'modal-primary modal-lg',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = this.SearchImage;
        this.bsModalRef.content.query = '';
        this.bsModalRef.content.defaultText = type == 1 ? IMAGE.WEB : type == 2 ? IMAGE.STOCK : type == 3 ? IMAGE.MYIMAGES : IMAGE.WEB
        this.bsModalRef.content.event.subscribe(data => {
            //this.isImageLoadong = true;
            
            this.cropBtnText = this.Crop;
            this.isCropable = true;
            this.isInitial = true;
            this.uploadFromBing = false;
            if (data.type == 1) {
                this.bingImageExt = data.image.encodingFormat;
                this.bingImageUrl = data.image.contentUrl;
                this.charactersFormModal.Old_imageUrl = data.image.contentUrl;
                this.charactersFormModal.imageUrl = data.image.contentUrl;
                this.uploadFromBing = true;
                this.LoadImage(data.image.contentUrl, false);
            }
            else if (data.type == 2) {
                this.charactersFormModal.Old_imageUrl = data.image.absoluteUri;
                this.charactersFormModal.imageUrl = data.image.absoluteUri;
                this.LoadImage(data.image.absoluteUri, false);
            }
            else if (data.type == 3) {
                this.charactersFormModal.Old_imageUrl = data.image;
                this.charactersFormModal.imageUrl = data.image;
                this.LoadImage(data.image.absoluteUri, false);
          }
            else if (data.type == 4) { //Font awesome icons
              
              this.charactersFormModal.Old_imageUrl = data.image;
              this.charactersFormModal.imageUrl = data.image;
              this.LoadImage(data.image, true);
              
            }
            //this.cropBtnText = this.Crop;
            //this.Old_imageUrl = this.charactersFormModal.imageUrl;

        });
    }
    selectFile(event: any) {
        
        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();

            reader.onload = (event: any) => {
                this.charactersFormModal.Old_imageUrl = event.target.result;
                this.charactersFormModal.imageUrl = event.target.result;
            }

            reader.readAsDataURL(event.target.files[0]);
        }
        this.fileToUpload = event.target.files.item(0);
        this.fileChangeEvent(event);
        this.isCropable = true;
        this.isInitial = true;
        this.cropBtnText = this.Crop;
        this.Old_fileToUpload = this.fileToUpload;
        this.Old_imageUrl = this.charactersFormModal.imageUrl;
    }
    cropImage() {
        if (this.cropBtnText === this.Crop) {
            this.flag = false;
            this.charactersFormModal.imageUrl = this.croppedImage;

            this.fileToUpload = this.croppedFile;
            this.isCropable = false;
            this.cropBtnText = this.Undo;
        }
        else if (this.cropBtnText === this.Undo) {
            this.fileToUpload = this.Old_fileToUpload;
            this.charactersFormModal.imageUrl = this.Old_imageUrl;
            this.isCropable = true;
            this.cropBtnText = this.Crop;
        }

    }
}
