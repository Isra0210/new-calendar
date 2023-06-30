import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { ScheduleInterface } from './schedules/schedule';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) { }

  save(schedule: ScheduleInterface) {
    return this.http.post<ScheduleInterface>(`${this.apiUrl}`, schedule);
  }

  update(id: number, schedule: ScheduleInterface) {
    return this.http.put<ScheduleInterface>(`${this.apiUrl}/${id}`, schedule);
  }

  findById(id: number) {
    return this.http.get<ScheduleInterface>(`${this.apiUrl}/${id}`);
  }

  getAll() {
    return this.http.get<ScheduleInterface[]>(`${this.apiUrl}`);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
