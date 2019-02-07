
// ====================================================
// Decleration of Change password model
// ====================================================

export class ChangePassword {
    constructor(userId?: string, oldPassword?: string, newPassword?: string, confirmPassword?: string) {
        this.userId = userId;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }

    public userId: string;
    public oldPassword: string;
    public newPassword: string;
    public confirmPassword: string;
}
