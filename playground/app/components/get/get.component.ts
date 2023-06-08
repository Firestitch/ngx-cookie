import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit,
} from '@angular/core';

import { FsMessage } from '@firestitch/message';
import { FsCookie } from '@firestitch/cookie';

import { Subject } from 'rxjs';

import { addDays, isAfter, isBefore, subDays } from 'date-fns';


@Component({
  selector: 'app-get',
  templateUrl: './get.component.html',
  styleUrls: ['./get.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetComponent implements OnDestroy {

  public id = '1';
  public values;

  private _destroy$ = new Subject();

  constructor(
    private _cookie: FsCookie,
    private _message: FsMessage,
    private _cdRef: ChangeDetectorRef,
  ) {

    const doc: any = document;
    doc.cookies = [];
    Object.defineProperty(doc, 'cookie', {
      get() {
        console.log('Cookie Get');

        return doc.cookies
          .filter((cookie) => {
            return isAfter(cookie.expires, new Date());
          })
          .map((cookie) => {
            return `${cookie.name}=${cookie.value}`;
          })
          .join('; ');
      },
      set(cookieStr) {
        console.log('Cookie Set', cookieStr);

        const cookie: {
          name: string;
          expires: Date;
          path: string;

        } = cookieStr.replace(/;$/,'').split(';')
          .reduce((accum, item, index) => {
            const values = item.split('=');
            const name = values[0];
            let value = values[1];

            if(index === 0) {
              return {
                ...accum,
                name,
                value,
              };
            }

            if(name === 'expires') {
              value = new Date(value);
            }

            return {
              ...accum,
              [name]: value,
            };
          }, {});

        doc.cookies =  doc.cookies
          .filter((item) => {
            return item.name !== cookie.name;
          });

        const expired = isBefore(cookie.expires || 0, new Date());

        if(!expired) {
          doc.cookies.push(cookie);
        }
      },
    });
  }

  public set(name, value): void {
    this._cookie.set(name, value, addDays(new Date(), 1), '/', null, false);
  }

  public remove(name): void {
    this._cookie.set(name, '', null, '/', null, false);
  }

  public getAll(): void {
    this.setValues((document as any).cookies);
  }

  public get(): void {
    this.setValues(this._cookie.get('foo'));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public setValues(values): void {
    this.values = values;
    this._cdRef.markForCheck();
  }
}
