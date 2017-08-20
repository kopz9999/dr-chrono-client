import ClientOAuth2  = require("client-oauth2");
import {Data, Token} from "client-oauth2";
import {Promise} from "core-js";
import popsicle = require("popsicle/dist/common");
import {Request, RequestOptions} from "popsicle/dist/request";
import { Response } from "popsicle/dist/response";
import {error} from "util";

const AUTH_URL = "https://drchrono.com/o/authorize/";
const TOKEN_URL = "https://drchrono.com/o/token/";

const ACCESS_TOKEN_NAME = "accessToken";

export class Base {
  public auth: ClientOAuth2;
  public currentToken: ClientOAuth2.Token | null;
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
    if (!this.currentToken) {
      throw new Error("No Access Token");
    }
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

  public get currentCode():string {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    return searchParams.get("code") || "";
  }

  public getToken(): Promise<ClientOAuth2.Token | null> {
    return popsicle.post({
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: this.currentCode,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUrl,
      },
      url: `${this.proxyApiUrl}createToken`,
    }).then((response: Response) => {
      if (response.status >= 400) {
        throw response.toJSON().body;
      } else {
        return this.auth.createToken(JSON.parse(response.toJSON().body));
      }
    });
  }

  public authWorkflow(): Promise<ClientOAuth2.Token> {
    return new Promise((resolve, reject) => {
      this.currentToken = this.retrieveAccessToken();
      if (this.currentToken) {
        resolve(this.currentToken);
      } else {
        if (this.currentCode) {
          return this.getToken().then((token: ClientOAuth2.Token) => {
            this.currentToken = token;
            localStorage.setItem(ACCESS_TOKEN_NAME, JSON.stringify(token.data));
            return token;
          }).catch(() => this.requestAccess());
        } else {
          this.requestAccess();
        }
      }
    });
  }

  public retrieveAccessToken(tokenName: string = ACCESS_TOKEN_NAME): ClientOAuth2.Token | null {
    const rawAccessToken = localStorage.getItem(tokenName);
    if (rawAccessToken) {
      return this.auth.createToken(JSON.parse(rawAccessToken));
    } else {
      return null;
    }
  }
}
