
export const environment = {
  production: true,
  useMockdata: false,
  loginUrl: '/Login',
  //baseUrl: 'https://app.rpgsmith.com', //Change this to the address of your backend API if different from frontend address
  baseUrl: 'https://rpgsmithappwc-dev.azurewebsites.net',
  //baseUrl: 'https://rpgsmithappwc-stage.azurewebsites.net',
  appVersion: '1.2.3',
  appBuildNo: '0054',
  PublishedDate: '20 September, 2019',
  registerUrl: '/register',
  loginApi: '/connect/token',
  registerApi: '/api/account/Registration',
  forgotPassApi: '/api/account/ForgotPassword',
  resetPassApi: '/api/account/ResetPassword',
  grantType: {
    facebook: 'urn:ietf:params:oauth:grant-type:facebook_identity_token',
    google: 'urn:ietf:params:oauth:grant-type:google_identity_token'
  }
};
