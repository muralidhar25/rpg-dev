import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap";

import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { AuthService } from "../../core/auth/auth.service";
import { ConfigurationService } from '../../core/common/configuration.service';
import { UserService } from "../../core/common/user.service";
import { Utilities } from '../../core/common/utilities';
import { UserRegister, EmailConfirmationContent } from '../../core/models/user-register.model';
import { SocialLoginService, Provider } from 'ngx-social-login';
import { DBkeys } from "../../core/common/db-keys";
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AccountTermsComponent } from "../account-terms/account-terms.component";
import { User } from "../../core/models/user.model";

@Component({
    selector: "app-register",
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit, OnDestroy {

  bsModalRef: BsModalRef;
  userRegisterModel: UserRegister = new UserRegister();
  emailConfirmationContent = new EmailConfirmationContent();
  isLoading = false;
  _email: string;
  formResetToggle = true;
  modalClosedCallback: () => void;
  appLogo = "../assets/images/" + Utilities.LogoImage; //"../assets/images/logo-full.png";
  @Input()
  isModal = false;
  newsletter: boolean = false;
  fileToUpload: File = null;
  profileImg: string;
  error: number = 0;

  constructor(
    private modalService: BsModalService,
    private router: Router, private localStorage: LocalStoreManager,
    private socialService: SocialLoginService, private alertService: AlertService,
    private authService: AuthService, private configurations: ConfigurationService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  showErrorAlert(caption: string, message: string, isValidPassword = true) {
    if (!isValidPassword) {
      this.alertService.showStickyMessage(caption, message, MessageSeverity.error);
    } else {
      this.alertService.showMessage(caption, message, MessageSeverity.error);
    }    
  }

  closeModal() {
    if (this.modalClosedCallback) {
      this.modalClosedCallback();
    }
  }

  fileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  registerForm() {
    if (this.fileToUpload != null && this.userRegisterModel.profileImage == undefined) {
      this.fileUpload();
    }
    else {
      this.bsModalRef = this.modalService.show(AccountTermsComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.event.subscribe(data => {
        this.newsletter = data.newsletter;
        if (data.termsCondition && data.checkEmail) {
          this.register(true);
        }
      });
    }
  }

  private fileUpload() {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Creating Account...");
    //file upload
    this.userService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          //console.log(data);
          this.userRegisterModel.profileImage = data.ProfileImage;
          this.register(false);
        },
        error => { this.register(false); });
  }


  private register(loadingMsg: boolean) {

    if (loadingMsg) {
      this.isLoading = true;
      this.alertService.startLoadingMessage("", "Creating Account...");
    }

    this._email = this.userRegisterModel.email;
    this.userRegisterModel.hasSubscribedNewsletter = this.newsletter;
    this.emailConfirmationContent.emailSubject = 'Confirm your account';
    this.emailConfirmationContent.emailBody = 'Please confirm your account by clicking this link';
    this.emailConfirmationContent.urlLink = window.location.origin;

    this.userService.register(this.userRegisterModel, this.emailConfirmationContent)
      .subscribe(
        user => {
          this.alertService.stopLoadingMessage();
          this.isLoading = false;
          this.alertService.showMessage("User has been registered successfully", "", MessageSeverity.success);
          this.router.navigate(['/register-email-confirmation'], { queryParams: { email: this._email } });
        },
        error => {
          this.alertService.stopLoadingMessage();
          setTimeout(() => { this.isLoading = false; }, 500);
          let Errors = Utilities.ErrorDetail("Unable to register", error);
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });

  }

  loginWithFacebook(): void {
    try {
      this.socialService.login(Provider.FACEBOOK).subscribe(user => {
        this.loginSocialPlatform(user.accessToken, this.configurations.grantTypeFacebook, Provider.FACEBOOK);
      },
        error => {
          //this.alertService.showStickyMessage("Unable to login", "Something went wrong, please try again later.", MessageSeverity.error, error);
        });
    } catch (err) { }
  }

  loginWithGoogle(): void {
    try {
      this.socialService.login(Provider.GOOGLE).subscribe(user => {
        this.loginSocialPlatform(user.accessToken, this.configurations.grantTypeGoogle, Provider.GOOGLE);
      },
        error => {
          //this.alertService.showStickyMessage("Unable to login", "Something went wrong, please try again later.", MessageSeverity.error, error);
        });
    } catch (err) { }
  }

  loginSocialPlatform(token: string, grantType: string, provider: string) {

    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Logging " + provider + " login...");

    this.authService.loginSocialPlatform(token, grantType)
      .subscribe(
        data => {
          try { this.localStorage.saveSyncedSessionData(provider, DBkeys.SOCIAL_LOGIN); } catch (err) { }
          if (provider == Provider.GOOGLE) window.location.reload();
          this.authService.redirectLoginUser();

          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

          this.redirectToHome();
          setTimeout(() => {
            this.alertService.stopLoadingMessage();
            this.isLoading = false;

            if (!this.isModal) {
              //this.alertService.showMessage("Login", `Welcome ${data.fullName}!`, MessageSeverity.success);
            }
            else {
              this.alertService.showMessage("Login", `Session for ${data.fullName} restored!`, MessageSeverity.success);
              setTimeout(() => {
                this.alertService.showStickyMessage("Session Restored", "Please try your last operation again", MessageSeverity.default);
              }, 500);

              this.closeModal();
            }
          }, 500);
        },
        error => {
          this.alertService.stopLoadingMessage();

          if (Utilities.checkNoNetwork(error)) {
            this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
            this.offerAlternateHost();
          }
          else {
            let errorMessage = Utilities.findHttpResponseMessage("error_description", error);

            if (errorMessage)
              this.alertService.showStickyMessage("Unable to login", errorMessage, MessageSeverity.error, error);
            else if (error.message)
              this.alertService.showStickyMessage("Unable to login", error.message, MessageSeverity.error, '');
            else
              this.alertService.showStickyMessage("Unable to login", "An error occured while logging in, please try again later.\nError: " + error.statusText || error.status, MessageSeverity.error, error);
          }

          setTimeout(() => { this.isLoading = false; }, 500);
        });
  }


  offerAlternateHost() {

    if (Utilities.checkIsLocalHost(location.origin) && Utilities.checkIsLocalHost(this.configurations.baseUrl)) {
      this.alertService.showDialog("Dear Developer!\nIt appears your backend Web API service is not running...\n" +
        "Would you want to temporarily switch to the online Demo API below?(Or specify another)",
        DialogType.prompt,
        (value: string) => {
          this.configurations.baseUrl = value;
          this.alertService.showStickyMessage("API Changed!", "The target Web API has been changed to: " + value, MessageSeverity.warn);
        },
        null,
        null,
        null,
        this.configurations.fallbackBaseUrl);
    }
  }

  reset() {
    this.formResetToggle = false;

    setTimeout(() => {
      this.formResetToggle = true;
    });
  }
  redirectToHome() {
    this.router.navigate(['/characters']);
  }

  readTempImageUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.profileImg = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

}

