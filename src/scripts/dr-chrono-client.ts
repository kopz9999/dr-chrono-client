import ClientOAuth2  = require("client-oauth2");
const AUTH_URL = "https://drchrono.com/o/authorize/";
const TOKEN_URL = "https://drchrono.com/o/token/";

export class DrChronoClient {
  public auth: ClientOAuth2;

  constructor(authOpts = {}) {
    this.auth = new ClientOAuth2({
      accessTokenUri: AUTH_URL,
      authorizationUri: TOKEN_URL,
      ...authOpts,
    });
  }

  public requestAccess() {
    window.location.replace(this.auth.code.getUri());
  }

  
}
