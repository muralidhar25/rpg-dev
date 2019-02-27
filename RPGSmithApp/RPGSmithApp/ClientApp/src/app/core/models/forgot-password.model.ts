// ====================================================
// Decleration of Forgot password model
// ====================================================

export class ForgotPassword {
    constructor(email?: string) {
        this.email = email;
    }

    email: string;
}

// ====================================================
// Decleration of Reset password model
// ====================================================

export class ResetPassword{
    constructor(userid?: string, newPassword?: string, confirmPassword?: string){
        this.userid = userid;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }

    public userid: string;
    public newPassword: string;
    public confirmPassword: string;
}
