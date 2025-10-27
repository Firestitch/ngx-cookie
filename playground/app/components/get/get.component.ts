import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';

import { FsMessage } from '@firestitch/message';
import { FsCookie } from '@firestitch/cookie';

import { Subject } from 'rxjs';

import { addDays } from 'date-fns';
import { MatAnchor } from '@angular/material/button';
import { JsonPipe } from '@angular/common';


@Component({
    selector: 'app-get',
    templateUrl: './get.component.html',
    styleUrls: ['./get.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatAnchor, JsonPipe],
})
export class GetComponent implements OnDestroy {
  private _cookie = inject(FsCookie);
  private _message = inject(FsMessage);
  private _cdRef = inject(ChangeDetectorRef);


  public values;

  private _destroy$ = new Subject();

  public set(name, value): void {
    this._cookie.set(name, value, { expires: addDays(new Date(), 1) });
  }

  public remove(name?): void {
    if (!name) {
      this._cookie.deleteAll();

      return;
    }
    this._cookie.delete(name);
  }

  public gets(): void {
    this.values = this._cookie.gets();
  }

  public get(): void {
    this.setValues(this._cookie.get('foo'));
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  public setValues(values): void {
    this.values = values;
    this._cdRef.markForCheck();
  }
}
