import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthenticationService} from '../../../../authentication/authentication.service';
import {ActivityUnit} from '../../../../models/activityUnit.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FirebaseService} from '../../../../services/firebase.service';
import {Observable} from 'rxjs';
import {ActivityDataService} from '../../../../services/activity.data.service';
import {Activity} from '../../../../models/activity.model';
import {map, startWith} from 'rxjs/operators';
import {User} from '../../../../models/user.model';
import {UserDataService} from '../../../../services/user.data.service';
import {LunchDataService} from '../../../../services/lunch.data.service';
import {LunchUnit} from '../../../../models/lunchUnit.model';
import {Workday} from '../../../../models/workday.model';
import {WorkdayTemplate} from '../../../../models/workdayTemplate.model';
import {WorkdayDataService} from '../../../../services/workday.data.service';
import {WorkdayTemplateDataService} from '../../../../services/workdayTemplate.data.service';

@Component({
  selector: 'app-schedule-edit',
  templateUrl: './edit-unit-modal.component.html',
  styleUrls: ['./edit-unit-modal.component.scss'],
})
export class EditUnitModalComponent implements OnInit {
  unit: any = null;
  workday: Workday = null;
  workdayTemplate: WorkdayTemplate = null;
  isAm: boolean = null;
  activities: Activity[] = [];
  activityImgUrl: any = null;
  mentors: User[] = [];
  clients: User[] = [];
  isActivity = false;
  filteredActivities: Observable<Activity[]>;
  public unitFormGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditUnitModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private activityDataService: ActivityDataService,
    private lunchDataService: LunchDataService,
    private userDataService: UserDataService,
    private workdayDataService: WorkdayDataService,
    private workdayTemplateDataService: WorkdayTemplateDataService
  ) {
    this.unit = data.unit;
    this.workday = data.workday;
    this.workdayTemplate = data.workdayTemplate;
    this.isAm = data.isAm;
    this.isActivity = data.unit instanceof ActivityUnit;
    activityDataService.activities$.subscribe(activities => this.activities = activities);
    userDataService.mentors$.subscribe(mentors => this.mentors = mentors);
    userDataService.clients$.subscribe(clients => this.clients = clients);
  }

  ngOnInit() {
    if (this.isActivity) {
      if (this.unit) {
        // Download activity icon
        this.activityImgUrl = '';
        this.firebaseService.lookupFileDownloadUrl(this.unit.activity.icon, 'icon').subscribe(img => this.activityImgUrl = img);
      }
      // FormGroup for activityUnit
      this.unitFormGroup = this.fb.group({
        activity: [this.unit ? this.unit.activity : null, Validators.required],
        mentors: [this.unit ? this.unit.mentors : null, Validators.required],
        clients: [this.unit ? this.unit.clients : null, Validators.required]
      });
      // Filter activities
      this.filteredActivities = this.unitFormGroup.controls.activity.valueChanges
        .pipe(startWith(''), map(value => this._filterActivities(value)));
    } else {
      // FormGroup for lunchUnit
      this.unitFormGroup = this.fb.group({
        lunch: [this.unit ? this.unit.lunch : null, Validators.required],
        mentors: [this.unit ? this.unit.mentors : null, Validators.required],
        clients: [this.unit ? this.unit.clients : null, Validators.required]
      });
    }
  }

  private _filterActivities(value: string): Activity[] {
    const filterValue = value.toLowerCase().trim();
    return this.activities.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  compareUsers(user1: User, user2: User) {
    return user1 && user2 ? user1.id === user2.id : user1 === user2;
  }

  previewActivity(activity: Activity) {
    this.firebaseService.lookupFileDownloadUrl(activity.icon, 'icon').subscribe(x => this.activityImgUrl = x);
  }

  submitUnit() {
    if (this.unit) {
      // Patch unit
      if (this.isActivity) {
        // Create patched unit
        const patchedUnit = this.unit as ActivityUnit;
        patchedUnit.activity = this.unitFormGroup.value.activity;
        patchedUnit.mentors = this.unitFormGroup.value.mentors;
        patchedUnit.clients = this.unitFormGroup.value.clients;
        // Patch ActivityUnit
        this.activityDataService.patchActivityUnit(patchedUnit, this.workday.id, this.workdayTemplate.id);
        this.dialogRef.close('Atelier aangepast');
      } else {
        // Create patched unit
        const patchedUnit = this.unit as LunchUnit;
        patchedUnit.lunch = this.unitFormGroup.value.lunch;
        patchedUnit.mentors = this.unitFormGroup.value.mentors;
        patchedUnit.clients = this.unitFormGroup.value.clients;
        // Patch LunchUnit
        this.lunchDataService.patchLunchUnit(patchedUnit, this.workday.id, this.workdayTemplate.id);
        this.dialogRef.close('Lunch aangepast');
      }
    } else {
      if (this.isActivity) {
        // Create new unit
        const newUnit = new ActivityUnit(
          this.unitFormGroup.value.activity,
          this.unitFormGroup.value.mentors,
          this.unitFormGroup.value.clients
        );
        // Post unit
        this.activityDataService.postActivityUnit(newUnit).subscribe(activityUnit => {
          if (this.workday) {
            // Add unit to workday
            if (this.isAm) {
              this.workday.amActivities.push(activityUnit);
            } else {
              this.workday.pmActivities.push(activityUnit);
            }
            this.workdayDataService.patchWorkday(this.workday);
          } else if (this.workdayTemplate) {
            // Add unit to workday template
            if (this.isAm) {
              this.workdayTemplate.amActivities.push(activityUnit);
            } else {
              this.workdayTemplate.pmActivities.push(activityUnit);
            }
            this.workdayTemplateDataService.patchWorkdayTemplate(this.workdayTemplate);
          }
        });
        this.dialogRef.close('Atelier toegevoegd');
      } else {
        // Create new unit
        const newUnit = new LunchUnit(
          this.unitFormGroup.value.lunch,
          this.unitFormGroup.value.mentors,
          this.unitFormGroup.value.clients
        );
        // Post unit
        this.lunchDataService.postLunchUnit(newUnit).subscribe(lunchUnit => {
          if (this.workday) {
            // Add unit to workday
            this.workday.lunch = lunchUnit;
            this.workdayDataService.patchWorkday(this.workday);
          } else if (this.workdayTemplate) {
            // Add unit to workday template
            this.workdayTemplate.lunch = lunchUnit;
            this.workdayTemplateDataService.patchWorkdayTemplate(this.workdayTemplate);
          }
        });
        this.dialogRef.close('Lunch toegevoegd');
      }
    }
  }

}
