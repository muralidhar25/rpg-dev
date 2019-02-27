export class UserRegister {
    constructor(username?: string, fullname?: string, email?: string, jobTitle?: string, phoneNumber?: string,
        configuration?: string, isEnabled?: boolean, isLockedOut?: boolean, roleName?: string,
        password?: string, confirmPassword?: string, profileImage?: string, hasSubscribedNewsletter?: boolean)
    {
        this.username = username;
        this.fullname = fullname;
        this.email = email;
        this.jobTitle = jobTitle;
        this.phoneNumber = phoneNumber;
        this.configuration = configuration;
        this.isEnabled = isEnabled;
        this.isLockedOut = isLockedOut;
        this.roleName = roleName;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.profileImage = profileImage;
        this.hasSubscribedNewsletter = hasSubscribedNewsletter;
    }

    username: string;
    fullname: string;
    email: string;
    jobTitle: string;
    phoneNumber: string;
    configuration: string;
    isEnabled: boolean;
    isLockedOut: boolean;
    password: string;
    confirmPassword: string;
    roleName: string;
    profileImage: string;
    hasSubscribedNewsletter: boolean;
}

export class UserRegisterOld {
    constructor(username?: string, email?: string, password?: string, confirmPassword?: string, profileImage?: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.profileImage = profileImage;
    }
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    profileImage: string;
}

export class EmailConfirmationContent{
    constructor(emailSubject?: string, emailBody?: string, urlLink?:string){
        this.emailSubject = emailSubject;
        this.emailBody = emailBody;
        this.urlLink = urlLink;
    }

    public emailSubject: string;
    public emailBody: string;
    public urlLink: string;
}

