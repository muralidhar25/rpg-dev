
export class User {
    // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
    constructor(id?: string, userName?: string, fullName?: string, email?: string, jobTitle?: string,
        phoneNumber?: string, profileImage?: string, roles?: string[], password?: string, createdDate?: Date, url?: string,
        isSocialLogin?: boolean, hasSubscribedNewsletter?: boolean, isAdmin?: boolean) {

        this.id = id;
        this.userName = userName;
        this.fullName = fullName;
        this.email = email;
        this.jobTitle = jobTitle;
        this.phoneNumber = phoneNumber;
        this.profileImage = profileImage;
        this.roles = roles;
        this.password = password;
        this.createdDate = createdDate;
        this.url = url;
        this.isSocialLogin = isSocialLogin;
        this.hasSubscribedNewsletter = hasSubscribedNewsletter;
        this.isAdmin = isAdmin;
    }


    get friendlyName(): string {
        let name = this.fullName || this.userName;

        if (this.jobTitle)
            name = this.jobTitle + " " + name;

        return name;
    }


    public id: string;
    public userName: string;
    public fullName: string;
    public email: string;
    public jobTitle: string;
    public phoneNumber: string;
    public profileImage: string;
    public isEnabled: boolean;
    public isLockedOut: boolean;
    public isSocialLogin: boolean;
    public hasSubscribedNewsletter: boolean;
    public roles: string[];
    public password: string;
    public createdDate: Date;
    public url: string;
    public isAdmin: boolean;
}
