import ClientOAuth2  = require("client-oauth2");
import {Data, Token} from "client-oauth2";
import {Promise} from "core-js";
import popsicle = require("popsicle/dist/common");
import {Request, RequestOptions} from "popsicle/dist/request";
import { Response } from "popsicle/dist/response";

const AUTH_URL = "https://drchrono.com/o/authorize/";
const TOKEN_URL = "https://drchrono.com/o/token/";

export class Base {
  public auth: ClientOAuth2;
  public currentToken: ClientOAuth2.Token;
  public clientId: string;
  public clientSecret: string;
  public redirectUrl: string;

  constructor(
    public proxyApiUrl: string,
    authOpts: ClientOAuth2.Options = {},
  ) {
    this.clientId = authOpts.clientId || "";
    this.clientSecret = authOpts.clientSecret || "";
    this.redirectUrl = authOpts.redirectUri || "";

    this.auth = new ClientOAuth2({
      accessTokenUri: TOKEN_URL,
      authorizationUri: AUTH_URL,
      ...authOpts,
    });
  }

  public requestAccess() {
    window.location.href = this.auth.code.getUri();
  }

  public callResource(resource: string, method: "GET", body: {}): Request {
    return popsicle.request({
      body: {
        access_token: this.currentToken.accessToken,
        body,
        method,
        resource,
      },
      method: "POST",
      url: `${this.proxyApiUrl}callResource`,
    });
  }

  public getToken(): Promise<ClientOAuth2.Token> {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    const code = searchParams.get("code");

    return popsicle.post({
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUrl,
      },
      url: `${this.proxyApiUrl}createToken`,
    }).then((response: Response) => {
      this.currentToken = this.auth.createToken(JSON.parse(response.toJSON().body));
      return this.currentToken;
    });
  }
}
