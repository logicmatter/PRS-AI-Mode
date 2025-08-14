// Angular
import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';

// Material
import { MatSidenav } from '@angular/material/sidenav';
import * as $ from 'jquery';

import { UserService } from '../../PmCore/services/UserService/UserService.service';
import { AppUser, AppUserAuth } from 'src/app/PmModel/auth.model';
import { Router } from '@angular/router';
import { TimeoutService } from 'src/app/PmCore/services/timeout.service';
import { Subscription, timer, Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserIdleService } from 'angular-user-idle';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public userService: UserService,
    private changeRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router,
    public coreUtility: CoreUtilityService,
    private userIdle: UserIdleService) { }

  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;
  @Output() toggleSidenav = new EventEmitter<void>();
  isTokenExistsAndValid: boolean = false;
  private _idleTimerSubscription: Subscription;
  toggleSidenavBar() {
    // $('.sidenav-toggle').on("click", function () {
    $("body").toggleClass("show");
    // });
  }

  ngOnInit() {
    //Start watching for user inactivity.
    this.userIdle.startWatching();

    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
      console.log(count);
      this.stop();
      if (count == 1) {
        const modalPromise = this.dialog.open(SessionDialog, {
          width: "390px",
          data: {
            id: 0,
            type: 'Session Expiring!',
            message:
              'Your session is about to expire. Do you need more time?',
            action: "Idle",
            title: "Session Expiring!"
          }
        });
        modalPromise.afterClosed().subscribe(result => {
          if (result == true) {
            console.log('Extending session...');
            this.restart();
            this.coreUtility.status = true;
            this.userService.resetSession().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
              if (data) {
                console.log("Response from Server:" + data);
              }
            })
          } else {
            this.coreUtility.status = false;
            console.log('Time is up!');
            this.restart();
            console.log('Not extending session...');
            this.userService.logout().subscribe(() =>
              this.router.navigate(['/auth/session'])
            );
          }
        });
      }
    });

    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => console.log('Time is up!')
    );


    if (this.userService.isTokenExpired()) {
      this.router.navigate(['/auth/login']);
    } else {
      this.isTokenExistsAndValid = true;
    }
    // this.sessionTimeout();
  }

  stop() {
    this.userIdle.stopTimer();
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restart() {
    this.userIdle.resetTimer();
  }

  ngOnDestroy() {
    this._idleTimerSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
export interface DialogData {
  id;
  type;
  message: string;
  action: string;
  title: string;
  counter: number;
}
@Component({
  selector: "session-dialog",
  templateUrl: 'sessionDialog.html'
})
export class SessionDialog {
  dialogContentMessage: string = "Are you sure, you want to delete?";
  public _counter: number = 15;
  public _status: string = "Initialized.";
  private _timer: Observable<number>;
  public status = false;
  constructor(
    public dialogRef: MatDialogRef<SessionDialog>,
    public userService: UserService,
    private router: Router,
    public coreUtility: CoreUtilityService,
    public idleTimeoutSvc: TimeoutService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.dialogContentMessage = data.message;
    this.startCounter();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public startCounter() {
    this.coreUtility._counter = 15;
    this._timer = timer(1000, 1000);
    this.idleTimeoutSvc.timerSubscription = this._timer.subscribe(n => {
      if (this.coreUtility._counter > 0) {
        this.coreUtility._counter--;
      }
      if (this.coreUtility._counter == 0 && this.coreUtility.status == false) {
        this.userService.logout().subscribe(() =>
          this.router.navigate(['/auth/session'])
        );
      }
    });
  }

  // public reset() {
  //   this.startCounter();
  //   this._status = "Initialized.";
  //   this.idleTimeoutSvc.resetTimer();
  // }
}
