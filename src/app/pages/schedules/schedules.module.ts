import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulesListComponent } from './schedules-list/schedules-list.component';
import { SchedulesRoutingModule } from './schedules-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { MatDialogModule } from '@angular/material/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { MatSortModule } from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { CoreModule } from 'src/app/core/core.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    SchedulesListComponent,
  ],
  imports: [
    CommonModule,
		SchedulesRoutingModule,
		MatTableModule,
		MatButtonModule,
		CdkTableModule,
		MatSortModule,
		DragDropModule,
		MatDialogModule,
		MatIconModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		CoreModule,
		FormsModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
  ]
})
export class SchedulesModule { }
