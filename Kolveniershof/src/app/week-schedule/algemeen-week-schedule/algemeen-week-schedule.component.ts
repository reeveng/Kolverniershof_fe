import { Component, OnInit } from "@angular/core";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { WorkDayDataService } from "src/app/workDay.data.service";
import { Workday } from "src/app/domain/workday.model";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-algemeen-week-schedule",
  templateUrl: "./algemeen-week-schedule.component.html",
  styleUrls: ["./algemeen-week-schedule.component.css"]
})
export class AlgemeenWeekScheduleComponent implements OnInit {
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  public loadingError$ = this._workDayDataService.loadingError$;
  private _fetchWorkDays$: Observable<Workday[]> = this._workDayDataService
    .workdays$;

  constructor(
    private _workDayDataService: WorkDayDataService,
    private http: HttpClient
  ) {}

  get workdays$(): Observable<Workday[]> {
    return this._fetchWorkDays$;
  }

  addNewWorkDay(workDay) {
    this._workDayDataService.addNewWorkDay(workDay).subscribe;
  }

  ngOnInit() {}
}