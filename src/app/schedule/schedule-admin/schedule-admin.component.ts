import { Component, OnInit } from '@angular/core';
import {Workday} from '../../models/workday.model';
import {WorkdayDataService} from '../../services/workday.data.service';
import {DatesService} from '../../services/dates.service';
import {Observable} from 'rxjs';
import {SuccessModalComponent} from '../../shared/success-modal/success-modal.component';
import {UserSelectorModalComponent} from '../user-selector-modal/user-selector-modal.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule-admin.component.html',
  styleUrls: ['./schedule-admin.component.scss']
})
export class ScheduleAdminComponent implements OnInit {
  workdays$: Observable<Workday[]>;
  dates: Date[] = [];
  private date: Date = new Date();

  constructor(public datesService: DatesService, private workdayDataService: WorkdayDataService, public dialog: MatDialog) {
    this.loadWorkdays(this.date);
  }

  ngOnInit() {
  }

  // Load all workdays based on day in week
  private loadWorkdays(date: Date) {
    // Get all days in week for today's week
    this.dates = this.datesService.weekDays(date);
    // Get all workdays for this week
    this.workdays$ = this.workdayDataService.getWorkdaysByWeek(this.dates[0]);
  }

  // Load next week
  nextWeek() {
    this.date = this.datesService.addWeek(this.date);
    this.loadWorkdays(this.date);
  }

  // Load previous week
  prevWeek() {
    this.date = this.datesService.subtractWeek(this.date);
    this.loadWorkdays(this.date);
  }

  // Open user selector modal
  openUserSelector() {
    this.dialog.open(UserSelectorModalComponent, { width: '500px' });
  }

}
