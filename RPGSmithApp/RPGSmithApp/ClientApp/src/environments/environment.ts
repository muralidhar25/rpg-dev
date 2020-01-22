
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  useMockdata: false,
  baseUrl: 'http://localhost:57253', //Change this to the address of your backend API if different from frontend address
  //baseUrl: 'https://app.rpgsmith.com',
  //baseUrl: 'https://rpgsmithappwc-dev.azurewebsites.net',
  //baseUrl: 'https://rpgsmithappwc-stage.azurewebsites.net',
  //baseUrl: 'https://rpgsmithappwc-pilot.azurewebsites.net',
  appVersion: '1.2.14',
  appBuildNo: '0065',
  PublishedDate: '20 January, 2020',
  loginUrl: '/login',
  registerUrl: '/register',
  loginApi: '/connect/token',
  // loginApi: "/myconnect/token", //for mock data
  registerApi: '/api/account/Registration',
  // registerApi: '/myconnect/register', // for mock data
  forgotPassApi: '/api/account/ForgotPassword',
  resetPassApi: '/api/account/ResetPassword',
  grantType: {
    facebook: 'urn:ietf:params:oauth:grant-type:facebook_identity_token',
    google: 'urn:ietf:params:oauth:grant-type:google_identity_token'
  }
};
