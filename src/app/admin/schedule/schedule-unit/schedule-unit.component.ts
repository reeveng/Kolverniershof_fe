import {Component, Input, OnInit} from '@angular/core';
import {ActivityUnit} from '../../../shared/models/activityUnit.model';
import {User} from '../../../shared/models/user.model';
import {LunchUnit} from '../../../shared/models/lunchUnit.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-schedule-unit',
  templateUrl: './schedule-unit.component.html',
  styleUrls: ['./schedule-unit.component.scss']
})
export class ScheduleUnitComponent implements OnInit {
  @Input() private unit: any;
  title: string;
  icon: string;
  mentors: User[] = [];
  clients: User[] = [];
  expandClients = true;
  expandMentors = true;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    if (this.unit instanceof ActivityUnit) {
      this.title = this.unit.activity.name;
      this.getIconUrl(this.unit.activity.icon);
    } else if (this.unit instanceof LunchUnit) {
      this.title = this.unit.lunch;
      this.getIconUrl('icons/icon-restaurant.svg');
    }
    this.mentors = this.unit.mentors;
    this.mentors.forEach(async mentor => {
      await this.getImageUrl(mentor);
   });
    if(this.mentors.length > 2)
      this.expandMentors = false;

    this.clients = this.unit.clients;
    this.clients.forEach(async client => {
      await this.getImageUrl(client);
   });

    if(this.clients.length > 2)
      this.expandClients = false;
  }

  async getImageUrl(user: User) {
    return new Promise( (resolve, reject) => {
      this.firebaseService.lookupFileDownloadUrl(user.picture, 'user').toPromise()
      .then(image => resolve(user.picture = image))
      .catch((e) => reject(e));
    })
    .catch((err) => console.log(err));
  }

  async getIconUrl(ref: string) {
    return new Promise( (resolve, reject) => {
      this.firebaseService.lookupFileDownloadUrl(ref, 'icon').toPromise()
      .then(icon => resolve(this.icon = icon))
      .catch((e) => reject(e));
    })
    .catch((err) => console.log(err));
  }

  edit() {
    // TODO - edit
  }

  delete() {
    // TODO - delete
  }

}
