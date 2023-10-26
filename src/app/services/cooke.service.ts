
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type SameSite = 'Lax' | 'None' | 'Strict';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: SameSite;
}

@Injectable({
  providedIn: 'root',
})
export class FsCookie {

  constructor(
    @Inject(DOCUMENT) private _document: Document,
  ) { }

  private static _getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');

    return new RegExp(`(?:^${escapedName}|;\\s*${escapedName})=(.*?)(?:;|$)`, 'g');
  }

  private static _safeDecodeURIComponent(encodedURIComponent: string): string {
    try {
      return decodeURIComponent(encodedURIComponent);
    } catch {
      // probably it is not uri encoded. return as is
      return encodedURIComponent;
    }
  }

  public exists(name: string): boolean {
    name = encodeURIComponent(name);
    const regExp: RegExp = FsCookie._getCookieRegExp(name);

    return regExp.test(this._document.cookie);
  }

  public get(name: string): string {
    if (this.exists(name)) {
      name = encodeURIComponent(name);

      const regExp: RegExp = FsCookie._getCookieRegExp(name);
      const result: RegExpExecArray = regExp.exec(this._document.cookie);

      return result[1] ? FsCookie._safeDecodeURIComponent(result[1]) : '';
    }

    return '';
  }

  public gets(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const document: any = this._document;

    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((currentCookie) => {
        const [cookieName, cookieValue] = currentCookie.split('=');
        cookies[FsCookie
          ._safeDecodeURIComponent(cookieName.replace(/^ /, ''))] = FsCookie._safeDecodeURIComponent(cookieValue);
      });
    }

    return cookies;
  }

  public set(
    name: string,
    value: string,
    options?: CookieOptions,
  ): void {
    let cookieString: string = `${encodeURIComponent(name)}=${encodeURIComponent(value)};`;

    options = options || {};

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const dateExpires: Date = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);

        cookieString += `expires=${dateExpires.toUTCString()};`;
      } else {
        cookieString += `expires=${options.expires.toUTCString()};`;
      }
    }

    if (options.path) {
      cookieString += `path=${options.path};`;
    }

    if (options.domain) {
      cookieString += `domain=${options.domain};`;
    }

    if (!options.secure && options.sameSite === 'None') {
      options.secure = true;
      console.warn(
        `Cookie ${name} was forced with secure flag because sameSite=None.` +
        'More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130',
      );
    }
    if (options.secure) {
      cookieString += 'secure;';
    }

    if (!options.sameSite) {
      options.sameSite = 'Lax';
    }

    cookieString += `sameSite=${options.sameSite};`;

    this._document.cookie = cookieString;
  }

  public delete(name: string, path?: CookieOptions['path'], options?: CookieOptions): void {
    options = {
      ...options,
      expires: new Date('Thu, 01 Jan 1970 00:00:01 GMT'),
    };

    this.set(name, '', options);
  }

  public deleteAll(path?: string, options?: CookieOptions): void {
    const cookies: any = this.gets();

    Object
      .keys(cookies)
      .forEach((cookieName) => {
        if (cookies.hasOwnProperty(cookieName)) {
          this.delete(cookieName, path, options);
        }
      });
  }
}
