import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { ConfigurationService } from '../../../services/configuration.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Utilities } from '../../../services/utilities';
import { User } from '../../../models/user.model';
import { DBkeys } from '../../../services/db-Keys';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { CharactersService } from "../../../services/characters.service";
import { Characters } from '../../../models/view-models/characters.model';
import { VIEW, TILES } from '../../../models/enums';
import { FileUploadService } from "../../../services/file-upload.service";
import { RulesetService } from "../../../services/ruleset.service";
import { SharedService } from "../../../services/shared.service";
import { CommonService } from "../../../services/shared/common.service";
import { AuthService } from "../../../services/auth.service";
import { BingSearchComponent } from '../../image-interface/bing-search/bing-search.component';
import { ImageSelectorComponent } from '../../image-interface/image-selector/image-selector.component';
import { ImageSearchService } from "../../../services/shared/image-search.service";

@Component({
    selector: 'app-characters-form',
    templateUrl: './characters-form.component.html',
    styleUrls: ['./characters-form.component.scss']
})
export class CharactersFormComponent implements OnInit {

    charactersModel = new Characters();
    charactersFormModal: any = new Characters();
    charactersForm: FormGroup;
    isLoading = false;
    showWebButtons: boolean = false;
    fileToUpload: File = null;
    page: number = 1;
    pageSize: number = 7;
    offset = (this.page - 1) * this.pageSize;
    bingImageUrl: string;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    imageErrorMessage: string = 'High resolution images will affect loading times and diminish performance. Do you still want to upload ?';
    title: string
    button: string
    rulesets:any
    options(placeholder?: string, initOnClick?: boolean): Object {
        return Utilities.optionsFloala(160, placeholder, initOnClick);
    }

    layoutHeight: number;
    layoutWidth: number;
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.layoutHeight = window.innerHeight;
        this.layoutWidth = window.innerWidth;
    }

    constructor(
        private router: Router, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, private charactersService: CharactersService,
        private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager,
        private fileUploadService: FileUploadService, private rulesetService: RulesetService,
        private sharedService: SharedService, private commonService: CommonService, private imageSearchService: ImageSearchService,
    ) {
        this.onResize();
    }

    ngOnInit() {

        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            let modalContentButton = this.button = this.bsModalRef.content.button;
            let _charactersModel = this.bsModalRef.content.charactersModel;
            _charactersModel.ruleSets = this.bsModalRef.content.ruleSet;
            this.charactersFormModal = this.charactersService.characterModelData(_charactersModel, modalContentButton);
            this.bingImageUrl = this.charactersFormModal.imageUrl;
            if (this.charactersFormModal.view == VIEW.ADD) {
                this.initialize();
                //this.charactersFormModal.ruleSets = this.bsModalRef.content.ruleSet;
                //this.charactersFormModal.hasRuleset = this.charactersFormModal.ruleSets == undefined ? false : this.charactersFormModal.ruleSets.length == 0 ? false : true;
            }
        }, 0);
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            // this.rulesetService.getRulesetsByUserId(user.id)
            //     .subscribe(data => {
            //         this.charactersFormModal.ruleSets = data;
            //         this.charactersFormModal.hasRuleset = data == undefined ? false : data.length == 0 ? false : true;
            //         this.isLoading = false;
            //     }, error => { }, () => { });
            this.rulesetService.getAllRuleSetByUserId(user.id, this.page, this.pageSize)
                .subscribe(data => {
                    this.charactersFormModal.ruleSets = data;
                    this.charactersFormModal.hasRuleset = data == undefined ? false : data.length == 0 ? false : true;
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Error", error);
                    if (Errors.sessionExpire) this.authService.logout(true);
                }, () => { });

        }
    }
    fileInput(_files: FileList) {
        this.fileToUpload = _files.item(0);
        this.showWebButtons = false;
    }

    setCharacterRuleset(_ruleset: any) {
        this.charactersFormModal.ruleSetId = _ruleset.ruleSetId;
    }
    validateImageSize() {
        if ((this.fileToUpload.size / 1024) <= 250) {
            return true;
        }
        return false;
    }
    validateSubmit() {
        if (this.charactersFormModal.ruleSetId == 0 || this.charactersFormModal.ruleSetId == undefined) {
            this.alertService.showMessage("Please select ruleset.", "Ruleset is required for adding a character.", MessageSeverity.error);
        }
        else {
            this.isLoading = true;
            let _msg = this.charactersFormModal.characterId == 0 || this.charactersFormModal.characterId === undefined ? "Creating Character..." : "Updating Character...";
            if (this.charactersFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Character...";
            this.alertService.startLoadingMessage("", _msg);

            if (this.fileToUpload != null) {
                /*image upload then submit */
                this.fileUpload();
            }
            else if (this.bingImageUrl !== this.charactersFormModal.imageUrl) {
                try {
                    var regex = /(?:\.([^.]+))?$/;
                    var extension = regex.exec(this.charactersFormModal.imageUrl)[1];
                    extension = extension ? extension : 'jpg';
                } catch{ }
                this.fileUploadFromBing(this.charactersFormModal.imageUrl, extension);
            }
            else {
                this.submit();
            }
        }
    }
    submitForm() {
        //if (this.fileToUpload != null) {
        //    if (this.validateImageSize()) {
        //        this.validateSubmit();
        //    }
        //    else {
        //        this.alertService.showDialog(this.imageErrorMessage, DialogType.confirm, ((value) => {
        //            this.validateSubmit();
        //        }), null, 'Yes', 'No');
        //    }
        //}
        //else {
        //    this.validateSubmit();
        //}
        this.validateSubmit();
    }

    private fileUpload() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
                .subscribe(
                    data => {
                        this.charactersFormModal.imageUrl = data.ImageUrl;
                        this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
                        this.submit();
                    },
                    error => {
                        let Errors = Utilities.ErrorDetail('Error', error);
                        if (Errors.sessionExpire) {
                            this.authService.logout(true);
                        } else this.submit();
                    });
        }
    }

    private fileUploadOLD() {
        //file upload
        this.charactersService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                    this.charactersFormModal.imageUrl = data.ImageUrl;
                    this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
                    this.submit();
                },
                error => {
                    console.log(error);
                    this.submit();
                });
    }

    private fileUploadFromBing(file: string, ext: string) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
                .subscribe(
                    data => {
                        this.charactersFormModal.imageUrl = data.ImageUrl;
                        this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
                        this.submit();
                    },
                    error => {
                        let Errors = Utilities.ErrorDetail('Error', error);
                        if (Errors.sessionExpire) {
                            this.authService.logout(true);
                        } else this.submit();
                    });
        }
    }

    private submit() {
        if (this.charactersFormModal.view === VIEW.DUPLICATE) {
            this.duplicateCharacters(this.charactersFormModal);
        }
        else {
            if (!this.charactersFormModal.imageUrl) {
                //if (!this.charactersFormModal.imageUrl) {
                this.imageSearchService.getDefaultImage<any>('char')
                    .subscribe(data => {
                        let model = Object.assign({}, this.charactersFormModal)                        
                        model.imageUrl = data.imageUrl.result
                        this.addEditCharacters(model);
                    }, error => {
                        this.addEditCharacters(this.charactersFormModal);
                    },
                        () => { });
                //}
            }
            else {
                this.addEditCharacters(this.charactersFormModal);
            }
        }
    }

    private addEditCharacters(modal) {
        modal.layoutHeight = this.layoutHeight;
        modal.layoutWidth = this.layoutWidth;

        this.isLoading = true;
        this.charactersService.createCharacter(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message = modal.characterId == 0 || modal.characterId === undefined ? "Character has been added successfully." : "Character has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.commonService.UpdateCounts(); /*update charaters count*/
                    this.close();
                    this.sharedService.updateCharacterList(true);
                    this.sharedService.updateCharactersCount(true);
                    //this.router.navigateByUrl('/rulesets', { skipLocationChange: true }).then(() => this.router.navigate(['/ruleset']));
                    // window.location.reload();
                },
                error => {

                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = modal.characterId == 0 || modal.characterId === undefined ? "Unable to Add " : "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
            );
    }

    private duplicateCharacters(modal) {
        this.isLoading = true;
        this.charactersService.duplicateCharacters(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Character has been duplicated successfully.", "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterList(true);
                    // window.location.reload();
                },
                error => {
                    let _message = "Unable to Duplicate ";
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }
    showButtons() {
        this.showWebButtons = true;
    }

    hideButtons() {
        this.showWebButtons = false;
    }

    close() {
        this.bsModalRef.hide();
        this.destroyModalOnInit();
    }

    manageRuleSets() {
        this.bsModalRef.hide();
        this.router.navigate(['/rulesets']);
    }

    readTempUrl(event: any) {
        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();

            reader.onload = (event: any) => {
                this.charactersFormModal.imageUrl = event.target.result;
            }

            reader.readAsDataURL(event.target.files[0]);
            this.imageChangedEvent = event;
        }
    }

    onScroll() {
        ++this.page;
        this.offset = (this.page - 1) * this.pageSize;
        this.isLoading = false;
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        this.rulesetService.getAllRuleSetByUserId(user.id, this.page, this.pageSize)
            .subscribe(data => {
                let results = data;
                if (results) {
                    if (results.length) {
                        results.map((Rset) => {
                            this.charactersFormModal.ruleSets.push(Rset);
                        })
                    }
                }
                //this.charactersFormModal.ruleSets = data;
                //this.charactersFormModal.hasRuleset = data == undefined ? false : data.length == 0 ? false : true;
                this.isLoading = false;
            }, error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Error", error);
                if (Errors.sessionExpire) this.authService.logout(true);
            }, () => { });
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }


    cropImage(img: string, OpenDirectPopup: boolean, view: string) {
        this.bsModalRef = this.modalService.show(ImageSelectorComponent, {
            class: 'modal-primary modal-sm selectPopUpModal',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'char';
        this.bsModalRef.content.image = img;
        this.bsModalRef.content.view = view;
        this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Character.jpg';
        //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
        this.bsModalRef.content.event.subscribe(data => {

            this.charactersFormModal.imageUrl = data.base64;
            this.fileToUpload = data.file;
            this.showWebButtons = false;
        });
    }
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(image: string) {
        this.croppedImage = image;
    }
    imageLoaded() {
        // show cropper
    }
    loadImageFailed() {
        // show message
    }
}
