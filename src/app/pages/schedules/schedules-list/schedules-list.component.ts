import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ScheduleInterface } from '../schedule';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ScheduleService } from '../../schedules.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ToastrService } from 'ngx-toastr';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

interface CalendarDay {
  number: number;
}

@Component({
  selector: 'app-schedules-list',
  templateUrl: './schedules-list.component.html',
  styleUrls: ['./schedules-list.component.css'],
  template: '<form-component></form-component>',
})
export class SchedulesListComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  constructor(
    private service: ScheduleService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    this._portal = new TemplatePortal(
      this._dialogTemplate,
      this._viewContainerRef
    );
    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });
    this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
  }

  @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any> | any;
  private isOpenDialog = false;
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;
  private schedule: ScheduleInterface | null = null;

  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  currentDate = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth();
  monthName = '';
  weeks: CalendarDay[][] = [];
  selectedDay: number = this.currentDate.getDate();
  filteredEvents: ScheduleInterface[] = [];

  hourList: any[] = [];

  scheduleForm: FormGroup = this.formBuilder.group(
    {
      title: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
    },
    { validators: this.dateValidator }
  );

  ngOnInit(): void {
    this.monthName = this.currentDate.toLocaleString('en-US', {
      month: 'long',
    });
    this.initializeHour();
    this.generateCalendar(this.currentDate);
    this.streamForms();
    this.filterEventsByMonth();
  }

  ngAfterViewInit() {
    this._portal = new TemplatePortal(
      this._dialogTemplate,
      this._viewContainerRef
    );
    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });
    this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
  }

  ngOnDestroy() {
    this._overlayRef.dispose();
  }

  private streamForms() {
    this.scheduleForm.valueChanges.subscribe({
      next: (value) => {
        this.schedule = {
          date: `${value['date']}`,
          title: value['title'],
          time: value['time'],
        };
      },
    });
  }

  addElement(schedule: ScheduleInterface) {
    const emptyIndex = this.filteredEvents.findIndex(
      (item) => item.title == ''
    );
    if (emptyIndex !== -1) {
      this.filteredEvents.splice(emptyIndex, 1, schedule);
    } else {
      this.filteredEvents.push(schedule);
    }
    this.sortEvents();
  }

  private filterEventsByMonth() {
    this.filteredEvents = [];
    for (let i = 1; i < 24; i++) {
      this.filteredEvents.push({
        date: '',
        time: `${i}:00`,
        title: '',
      });
    }
    this.service.getAll().subscribe({
      next: (events) => {
        events.map((e) => {
          const date = new Date(e.date);
          if (date.getMonth() == this.currentMonth) {
            this.addElement(e);
          }
        });
      },
    });
    this.sortEvents();
  }

  private sortEvents() {
    this.filteredEvents.sort((a, b) => {
      if (a.time > b.time) {
        return 1;
      }

      if (a.time < b.time) {
        return -1;
      }

      return 0;
    });
  }

  public deleteSchedule = (id: number | any) => {
    this.service.delete(id).subscribe(() => this.filterEventsByMonth());
    this.toastr.warning('Deleted event');
  };

  public onSubmit() {
    if (this.scheduleForm.valid && this.schedule != null) {
      this.service.save(this.schedule).subscribe({
        next: () => {
          this.toastr.success('Successfully saved');
          this.filterEventsByMonth();
          this.sortEvents();
          this.closeDialog();
        },
      });
    }
  }

  private initializeHour() {
    this.hourList = [];
    for (let index = 1; index <= 12; index++) {
      this.hourList.push(`${index} AM`);
    }
    for (let index = 1; index < 12; index++) {
      this.hourList.push(`${index} PM`);
    }
  }

  public drop(event: CdkDragDrop<any[]>) {
    const cast: any = {
      13: '1:00 PM',
      14: '2:00 PM',
      15: '3:00 PM',
      16: '4:00 PM',
      17: '5:00 PM',
      18: '6:00 PM',
      19: '7:00 PM',
      20: '8:00 PM',
      21: '9:00 PM',
      22: '10:00 PM',
      23: '11:00 PM',
    };
    this.filteredEvents[event.previousIndex].time =
      event.currentIndex < 11
        ? `${event.currentIndex + 1}:00 AM`
        : `${cast[event.currentIndex + 1]}`;

    this.service
      .update(this.filteredEvents[event.previousIndex])
      .subscribe(() => {
        this.toastr.success('Event updated');
      });

    moveItemInArray(
      this.filteredEvents,
      event.previousIndex,
      event.currentIndex
    );
  }

  public isCurrentDay(day: number, isCurrentMonth: boolean): boolean {
    if (!isCurrentMonth) {
      return false;
    }
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
      day === currentDay &&
      this.currentMonth === currentMonth &&
      this.currentYear === currentYear
    );
  }

  public previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.monthName = this.currentDate.toLocaleString('default', {
      month: 'long',
    });
    this.currentYear = this.currentDate.getFullYear();
    this.filterEventsByMonth();
    this.generateCalendar(this.currentDate);
  }

  public nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);

    this.monthName = this.currentDate.toLocaleString('default', {
      month: 'long',
    });

    this.currentYear = this.currentDate.getFullYear();
    this.filterEventsByMonth();
    this.generateCalendar(this.currentDate);
  }

  private generateCalendar(currentDate: Date): void {
    this.currentYear = currentDate.getFullYear();
    this.currentMonth = currentDate.getMonth();
    const totalDays = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();

    const previousMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    const previousYear =
      previousMonth === 11 ? this.currentYear - 1 : this.currentYear;
    const previousMonthTotalDays = new Date(
      previousYear,
      previousMonth + 1,
      0
    ).getDate();

    const days: number[] = [];
    const previousMonthDays: number[] = [];

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    for (let i = firstDay - 1; i >= 0; i--) {
      previousMonthDays.unshift(previousMonthTotalDays - i);
    }

    const remainingCells = 42 - (days.length + previousMonthDays.length);

    for (let i = 1; i <= remainingCells; i++) {
      days.push(i);
    }

    const totalWeeks = Math.ceil(days.length / 7);

    this.weeks = [];

    for (let i = 0; i < totalWeeks; i++) {
      const week: any = {};

      for (let j = 0; j < this.weekdays.length; j++) {
        const dayIndex = i * 7 + j;

        if (dayIndex < previousMonthDays.length) {
          week[this.weekdays[j]] = {
            day: previousMonthDays[dayIndex],
            isCurrentMonth: false,
          };
        } else if (
          dayIndex >= previousMonthDays.length &&
          dayIndex < previousMonthDays.length + days.length
        ) {
          week[this.weekdays[j]] = {
            day: days[dayIndex - previousMonthDays.length],
            isCurrentMonth: true,
          };
        } else {
          week[this.weekdays[j]] = {
            day: '',
            isCurrentMonth: false,
          };
        }
      }

      this.weeks.push(week);
    }
  }

  public updateCurrentDay(day: number) {
    this.selectedDay = day;
  }

  public openDialog() {
    if (!this.isOpenDialog) {
      this.isOpenDialog = true;
      this._overlayRef = this._overlay.create({
        positionStrategy: this._overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
        hasBackdrop: true,
      });
      this._overlayRef.attach(
        new TemplatePortal(this._dialogTemplate, this._viewContainerRef)
      );
    }
  }

  private dateValidator(control: AbstractControl) {
    const date = new Date(control.get('date')?.value);
    const today = new Date();
    today.setDate(today.getDate() - 1);
    if (date < today) {
      return { dateError: 'Invalid date' };
    }
    return null;
  }

  public closeDialog() {
    this.scheduleForm.reset();
    this.isOpenDialog = false;
    this._overlayRef.dispose();
  }
}
