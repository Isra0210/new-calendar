import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { ScheduleInterface } from './schedules/schedule';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(private http: HttpClient) {}
  private apiUrl = `${environment.apiUrl}/schedules`;

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  options = { headers: this.headers };

  save(schedule: ScheduleInterface) {
    return this.http.post<ScheduleInterface>(
      `${this.apiUrl}`,
      schedule,
      this.options
    );
  }
  update(schedule: ScheduleInterface) {
    return this.http.put<ScheduleInterface>(`${this.apiUrl}/${schedule.id}`, schedule);
  }
  getAll() {
    return this.http.get<ScheduleInterface[]>(`${this.apiUrl}`);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
