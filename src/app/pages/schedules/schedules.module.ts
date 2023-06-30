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

@NgModule({
  declarations: [
    SchedulesListComponent
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
  ]
})
export class SchedulesModule { }
