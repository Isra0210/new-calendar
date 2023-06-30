import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { parse } from 'date-fns';
import { ScheduleInterface } from '../schedule';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {TemplatePortal} from '@angular/cdk/portal';
import { ScheduleService } from '../../schedules.service';
import { Overlay, OverlayRef, ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

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
})
export class SchedulesListComponent
  implements OnInit
{
  constructor(
    private formBuilder: FormBuilder,
    private service: ScheduleService,
    private toastr: ToastrService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
		private dialog: MatDialog,
  ) {}

  @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any> | any;
  private _overlayRef: OverlayRef | any;
  private _portal: TemplatePortal | any;

  currentDate = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth();
  monthName: string = '';
  weeks: CalendarDay[][] = [];
  selectedDay: number = this.currentDate.getDate();
  events: ScheduleInterface[] = [];

  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  hourList: any[] = [];
  calendar: number[][] = [];

  scheduleForm: FormGroup = this.formBuilder.group(
    {
      title: [null, Validators.required],
      date: [null, Validators.required],
      initTime: [null, Validators.required],
      endTime: [null, Validators.required],
      description: [null],
    },
    { validators: [this.endTimeValidator, this.dateValidator] }
  );

  ngOnInit(): void {
    this.monthName = this.currentDate.toLocaleString('en-US', {
      month: 'long',
    });
    this.initializeHour();
    this.generateCalendar(this.currentDate);
    this.service.getAll().subscribe({
      next: (e) => {
        this.events = e;
      },
    });
  }

  // openDialog() {
  //   const dialogRef = this.dialog.open(DraggableDialogComponent, {
  //     disableClose: true,
  //   });

  //   // Set the draggable behavior for the dialog
  //   const dialogRootElement = dialogRef.componentInstance?.dialogRef?.nativeElement;
  //   if (dialogRootElement) {
  //     dialogRef.componentInstance.dialogRef.disableClose = true;
  //     dialogRef.componentInstance.dialogRef.updateSize({ width: '300px', height: 'auto' });
  //     dialogRef.componentInstance.dialogRef.addPanelClass('dialog-container');
  //     dialogRef.componentInstance.dialogRef.backdropClick().subscribe(() => dialogRef.close());
  //   }
  // }

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

  hourEvents: HourEvent[] = [
    { hour: '12:00am', event: 'Event 1' },
    { hour: '01:00am', event: 'Event 2' },
    { hour: '02:00am', event: 'Event 3' },
    // Add more hour events here
  ];

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.hourEvents, event.previousIndex, event.currentIndex);
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

  private endTimeValidator(control: AbstractControl) {
    const initTime = parse(control.get('initTime')?.value, 'HH:mm', Date.now());
    const endTime = parse(control.get('endTime')?.value, 'HH:mm', Date.now());

    if (initTime >= endTime) {
      return {
        timeError: 'The end hour must be greater than initial hour.',
      };
    }

    return null;
  }

  private dateValidator(control: AbstractControl) {
    const date = parse(control.get('date')?.value, 'HH:mm', Date.now());
    const today = new Date();

    if (date < today) {
      return {
        dateError: 'Invalid date',
      };
    }

    return null;
  }

  updateCurrentDay(day: number) {
    this.selectedDay = day;
  }
}
