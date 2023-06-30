import {
  Component,
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
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { parse } from 'date-fns';
import { Title } from '@angular/platform-browser';

interface CalendarDay {
  number: number;
}

interface HourEvent {
  hour: string;
  event: string;
}

@Component({
  selector: 'app-schedules-list',
  templateUrl: './schedules-list.component.html',
  styleUrls: ['./schedules-list.component.css'],
  template: '<form-component></form-component>',
})
export class SchedulesListComponent implements OnInit {
  constructor(
    private service: ScheduleService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
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
  private isOpenDialog: boolean = false;
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;
  private schedule: ScheduleInterface | null = null;

  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  currentDate = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth();
  monthName: string = '';
  weeks: CalendarDay[][] = [];
  selectedDay: number = this.currentDate.getDate();
  events: ScheduleInterface[] = [];
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
    this.getSchedules();
    this.streamForms();
    const { date, initTime } = this.activatedRoute.snapshot.queryParams;
    if (date && initTime) {
      this.scheduleForm.patchValue({ date, initTime });
    }
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

  streamForms() {
    this.scheduleForm.valueChanges.subscribe({
      next: (value) => {
        console.log();
        this.schedule = {
          date: `${value['date']}`,
          title: value['title'],
          time: value['time'],
        };
      },
    });
  }

  getSchedules() {
    this.service.getAll().subscribe({
      next: (e) => {
        this.events = e;
      },
    });
  }

  deleteSchedule(id: number | any) {
    this.service.delete(id).subscribe(() => this.getSchedules());
    this.toastr.warning('Deleted event');
  }

  initializeHour() {
    this.hourList = [];
    for (let index = 1; index <= 12; index++) {
      this.hourList.push(`${index} AM`);
    }
    for (let index = 1; index < 12; index++) {
      this.hourList.push(`${index} PM`);
    }
    this.hourList.push('');
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.events, event.previousIndex, event.currentIndex);
  }

  isCurrentDay(day: number, isCurrentMonth: boolean): boolean {
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

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.monthName = this.currentDate.toLocaleString('default', {
      month: 'long',
    });
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar(this.currentDate);
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);

    this.monthName = this.currentDate.toLocaleString('default', {
      month: 'long',
    });

    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar(this.currentDate);
  }

  generateCalendar(currentDate: Date): void {
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

    let days: number[] = [];
    let previousMonthDays: number[] = [];

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

  updateCurrentDay(day: number) {
    this.selectedDay = day;
  }

  openDialog() {
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
    const date = control.get('date')!.value;
    const today = new Date();

    if (control.get('date')!.value != '' && date <= today) {
      return {
        dateError: 'Invalid date',
      };
    }

    return null;
  }

  closeDialog() {
    this.isOpenDialog = false;
    this._overlayRef.dispose();
  }

  onSubmit() {
    if (this.scheduleForm.valid && this.schedule != null) {
      this.service
        .save(this.schedule)
        .subscribe({
          next: () => {
            this.toastr.success('Successfully saved');
            this.scheduleForm.reset();
            this.getSchedules();
            this.closeDialog();
          },
        });
    }
  }
}
