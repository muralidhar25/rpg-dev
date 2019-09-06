import { Component, OnInit, OnDestroy, Input, EventEmitter } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { BingImage } from "../../../core/models/bing-image.model";
import { AlertService, MessageSeverity } from "../../../core/common/alert.service";
import { ConfigurationService } from "../../../core/common/configuration.service";
import { SharedService } from "../../../core/services/shared.service";
import { ImageSearchService } from "../../../core/services/shared/image-search.service";
import { AuthService } from "../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { User } from "../../../core/models/user.model";
import { IMAGE } from "../../../core/models/enums";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { PlatformLocation } from "@angular/common";
import { Fa5Icons } from "../../../core/common/fontawesome.service";

@Component({
    selector: 'app-bing-search',
    templateUrl: './bing-search.component.html',
    styleUrls: ['./bing-search.component.scss']
})
export class BingSearchComponent implements OnInit {

    query: string;
    title: string;
    
    page?: number = -1;
    pagesize?: number = -1;
    isLoading = false;
    bingImages = new Array<BingImage>();
    blobStockImages: any = [];
    blobStockImagesBLOB: any = [];
    blobMyImages: any = [];
    blobMyImagesBLOB: any = [];
    Options: any;
    defaultText: string = 'Web';
    userid: string;
    noOfImagesShow: number = 39;
    StockImageCount: number = 39;
    StockImagepreviousContainerNumber: number = 0;
    previousContainerImageNumber: number = 0;
    hideShowMoreStockImge: boolean = false;
    isStockImagesLoaging: boolean = false;

    MyImageCount: number = 39;    
    previousContainerMyImageNumber: number = 0;
    isMyImagesLoading: boolean = false;
    hideShowMoreMyImage: boolean = false;
  fontAwesomeIcons: any[] = [];
  SearchedFontAwesomeIcons: any[] = []
  isSearchingStockImages: boolean = false;

    constructor(
        private router: Router, private alertService: AlertService, private bsModalRef: BsModalRef,
        private authService: AuthService, private configurations: ConfigurationService,
        private modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private imageSearchService: ImageSearchService
      , private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));

        this.sharedService.shouldUpdateCharacterList().subscribe(serviceJson => {
            if (serviceJson) { this.Initialize(); }
        });
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title ? this.bsModalRef.content.title : 'Search Images';
            this.query = this.bsModalRef.content.query ? this.bsModalRef.content.query : '';
            this.defaultText = this.bsModalRef.content.defaultText ? this.bsModalRef.content.defaultText : 'Web';
          this.Initialize();
          this.fontAwesomeIcons = Fa5Icons;
        }, 0);
    }

    private Initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.userid = user.id;
            //this.searchBing(this.query);
            this.Options = [{ value: IMAGE.WEB, selected: true },
            { value: IMAGE.MYIMAGES, selected: false },
            { value: IMAGE.STOCK, selected: false }];

            if (this.defaultText === IMAGE.STOCK) {
                this.Options.map((ele) => {
                    ele.selected = ele.value == IMAGE.STOCK ? true : false;
                })
                this.searchBlobStock(this.query);
            }
            if (this.defaultText === IMAGE.MYIMAGES) {
                this.Options.map((ele) => {
                    ele.selected = ele.value == IMAGE.MYIMAGES ? true : false;
                })
                this.searchMyImages(this.query, user.id);
            }
        }
    }

    submitForm() {
      this.isSearchingStockImages = false;
        if (this.defaultText === IMAGE.WEB && this.query.trim() !== '')
            this.searchBing(this.query);
        else if (this.defaultText === IMAGE.STOCK) {
          //this.SearchedFontAwesomeIcons = [];
          if (this.query) {
            this.isSearchingStockImages = true;
            this.SearchedFontAwesomeIcons = this.fontAwesomeIcons.filter(x => {
              if (x.filter ? x.filter.filter(y => y.toLowerCase().indexOf(this.query.toLowerCase()) > -1).length : false) {
                
                return true;
              }
              else if (x.aliases ? x.aliases.filter(y => y.toLowerCase().indexOf(this.query.toLowerCase()) > -1).length : false) {
                
                return true;
              }
              else if (x.name ? x.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1 : false) {
                
                return true;
              }
              else {
                return false;
              }
                
              
            })
          }
          else {
            this.isSearchingStockImages = false;
            this.SearchedFontAwesomeIcons = [];
          }
          

            let q = this.query;
            let _blobStockImages = this.blobStockImagesBLOB;
          this.blobStockImages = _blobStockImages.filter(function (item) {

          
           let absoluteUri = item.absoluteUri ? item.absoluteUri.toLowerCase() : '';
            let absolutePath = item.absolutePath ? item.absolutePath.toLowerCase() : '';
           
            return (absoluteUri.indexOf(q) > -1) || (absolutePath.indexOf(q) > -1);
            });
        }
        else if (this.defaultText === IMAGE.MYIMAGES) {
            //searchMyImages
            let q = this.query;
            let _myImages = this.blobMyImagesBLOB;
            this.blobMyImages = _myImages.filter(function (item) {
                return (item.absoluteUri.indexOf(q) > -1) || (item.absolutePath.indexOf(q) > -1);
            });
        }
    }

    searchBing(_query) {
        this.isLoading = true;
        this.bingImages = new Array<BingImage>();
        this.noOfImagesShow = 39;

        this.imageSearchService.getBingSearch<any>(_query, this.noOfImagesShow)
            .subscribe(data => {
              this.bingImages = data.value;
              if (this.bingImages && this.bingImages.length) {
                this.bingImages.map((x) => {
                  if (x.contentUrl) {
                    x.contentUrl = x.contentUrl.split('?')[0];
                  }                  
                });
              }
                this.isLoading = false;
            }, error => {
                console.log("Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Bing Image Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
                () => { });
    }
    
    searchBlobStock(_query) {
        this.isLoading = true;
        this.blobMyImages = [];
        this.blobStockImages = [];

        //this.imageSearchService.getBlobStockSearch<any>(_query)
        //    .subscribe(data => {
        //        this.blobStockImages = this.blobStockImagesBLOB = data.result.items;
        //        this.isLoading = false;
        //    }, error => {
        //        console.log("searchBlobStock Error: ", error);
        //        this.isLoading = false;
        //        this.alertService.stopLoadingMessage();
        //        let Errors = Utilities.ErrorDetail("Stock Images Api", error);
        //        if (Errors.sessionExpire) this.authService.logout(true);
        //        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //    },
        //    () => { });
        this.StockImageCount = 39;
        this.StockImagepreviousContainerNumber = 0;
        this.previousContainerImageNumber = 0;
        this.imageSearchService.getBlobStockPagingSearch<any>(this.StockImageCount, this.StockImagepreviousContainerNumber, this.previousContainerImageNumber)
            .subscribe(data => {
                this.blobStockImages = this.blobStockImagesBLOB = data.result.blobResponse.items;
                this.StockImagepreviousContainerNumber = data.result.previousContainerNumber;
                this.previousContainerImageNumber = data.result.previousContainerImageNumber;
                this.isLoading = false;
                if (data.result.blobResponse.items.length < 39) {
                    this.hideShowMoreStockImge = true;
                }
            }, error => {
                console.log("searchBlobStock Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Stock Images Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
                () => { });

    }
    moreStockImages() {
        //console.log('scrolled')
        this.isStockImagesLoaging = true;
        this.imageSearchService.getBlobStockPagingSearch<any>(this.StockImageCount, this.StockImagepreviousContainerNumber, this.previousContainerImageNumber)
            .subscribe(data => {
                this.blobStockImages = this.blobStockImages.concat(data.result.blobResponse.items);
                this.blobStockImagesBLOB = this.blobStockImagesBLOB.concat(data.result.blobResponse.items);
                this.StockImagepreviousContainerNumber = data.result.previousContainerNumber;
                this.previousContainerImageNumber = data.result.previousContainerImageNumber;
                this.isLoading = false;
                if (data.result.blobResponse.items.length < 39) {
                    this.hideShowMoreStockImge = true;
                }
                this.isStockImagesLoaging = false;
            }, error => {
                this.isStockImagesLoaging = false;
                //console.log("searchBlobStock Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Stock Images Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            },
                () => { });
    }

    onScroll() {
        if (this.defaultText === 'Stock Images') {
            if (!this.hideShowMoreStockImge && !this.isSearchingStockImages) {
                this.moreStockImages();
            }
           
        }
        if (this.defaultText === 'My Images') {
            if (!this.hideShowMoreMyImage) {
                this.moreMyImages();
            }
        }  
    }

    searchMyImages(_query:string, userId:string) {
        this.isLoading = true;
        this.blobStockImages = [];
        this.blobMyImages = [];

        this.MyImageCount = 39;
        this.previousContainerMyImageNumber = 0;

        //this.imageSearchService.getBlobMyImagesSearch<any>(_query, userId)  //old
        //    .subscribe(data => {
        //        this.blobMyImagesBLOB = this.blobMyImages = data.result.items;
        //        this.isLoading = false;
        //    }, error => {
        //        console.log("searchMyImages Error: ", error);
        //        this.isLoading = false;
        //        this.alertService.stopLoadingMessage();
        //        let Errors = Utilities.ErrorDetail("My Images Api", error);
        //        if (Errors.sessionExpire) this.authService.logout(true);
        //        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //    },
        //        () => { });

        this.imageSearchService.getBlobMyImagesSearchPaging<any>(_query, userId, this.MyImageCount, this.previousContainerMyImageNumber)        
            .subscribe(data => {                
                this.blobMyImagesBLOB = this.blobMyImages = data.result.blobResponse.items;
                this.isLoading = false;
                this.previousContainerMyImageNumber = data.result.previousContainerImageNumber;
                if (data.result.blobResponse.items.length < 39) {
                    this.hideShowMoreMyImage = true;
                }
            }, error => {
                console.log("searchMyImages Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("My Images Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
                () => { });
    }
    moreMyImages() {
        //console.log('scrolled')
        let _query = "";
        this.isMyImagesLoading = true;
        this.imageSearchService.getBlobMyImagesSearchPaging<any>(_query, this.userid, this.MyImageCount, this.previousContainerMyImageNumber)
            .subscribe(data => {
                this.blobMyImagesBLOB = this.blobMyImagesBLOB.concat(data.result.blobResponse.items);
                this.blobMyImages = this.blobMyImages.concat(data.result.blobResponse.items);
                this.isLoading = false;
                this.previousContainerMyImageNumber = data.result.previousContainerImageNumber;              
                this.isLoading = false;
                this.isMyImagesLoading = false;
                if (data.result.blobResponse.items.length < 39) {
                    this.hideShowMoreMyImage = true;
                }
            }, error => {
                this.isMyImagesLoading = false;
                console.log("searchMyImages Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("My Images Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            },
                () => { });
    }
    public event: EventEmitter<any> = new EventEmitter();
    useBingImage(bingImg) {
        this.bsModalRef.hide();
        this.event.emit({ image: bingImg, type: 1 });
    }

  useBlobStockImage(stockImg) {
      
        this.bsModalRef.hide();
        this.event.emit({ image: stockImg, type: 2 });
    }

    setSearchOption(option: any) {
        this.Options.forEach(function (val) {
            val.selected = false;
        });
        option.selected = true;
        this.defaultText = option.value;
        this.bingImages = new Array<BingImage>();
        if (this.defaultText === IMAGE.STOCK)
            this.searchBlobStock(this.query);
        else if (this.defaultText === IMAGE.MYIMAGES)
            this.searchMyImages(this.query, this.userid);
    }

    close() {
        this.bsModalRef.hide();
        //    this.destroyModalOnInit()
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //const modalContainer = document.querySelector('modal-container');
            //if (modalContainer !== null) {
            //    modalContainer.parentNode.removeChild(modalContainer);
            //}
        } catch (err) { }
    }
    getMoreResults() {
        this.noOfImagesShow = this.noOfImagesShow + 40;
        this.imageSearchService.getBingSearch<any>(this.query, this.noOfImagesShow)
            .subscribe(data => {
              this.bingImages = data.value;
              if (this.bingImages && this.bingImages.length) {
                this.bingImages.map((x) => {
                  if (x.contentUrl) {
                    x.contentUrl = x.contentUrl.split('?')[0];
                  }
                });
              }
                this.isLoading = false;
            }, error => {
                console.log("Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Bing Image Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
                () => { });
  }
  useFontAwesomeIcon(icon) {
    let iconName = icon.name ? icon.name.toLowerCase() : '';
    let iconUrl = '';
    if (icon.id.indexOf('far ') > -1) {
      iconUrl = "../../../../assets/fontawesome-free/pngs/regular/" + iconName +".png";
    } else if (icon.id.indexOf('fab ') > -1) {
      iconUrl = "../../../../assets/fontawesome-free/pngs/brands/" + iconName + ".png";
    } else if (icon.id.indexOf('fas ') > -1) {
      iconUrl = "../../../../assets/fontawesome-free/pngs/solid/" + iconName + ".png";
    }
    
    this.bsModalRef.hide();
    this.event.emit({ image: iconUrl, type: 4 });
  }

}
