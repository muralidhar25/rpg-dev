// ====================================================
// Account settings modal
// ====================================================

export class AccountSettings {
    constructor(emailId?: string, firstName?: string, lastName?: string, accountCreated?: Date, accounType?: string, profileImage?: string) {
        this.emailId = emailId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.accountCreated = accountCreated;
        this.accountType = accounType;
        this.profileImage = profileImage;
    }

    public emailId: string;
    public firstName: string;
    public lastName: string;
    public accountCreated: Date;
    public accountType: string;
    public profileImage: string;

}

export class ChangePassword {
    constructor(oldPassword?: string, newPassword?: string, confirmPassword?: string){
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword
    }

    public oldPassword: string;
    public newPassword: string;
    public confirmPassword: string;
}
