import { Component, Injectable, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { parse } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
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

  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    const { date, initTime } = this.activatedRoute.snapshot.queryParams;
    if (date && initTime) {
      this.scheduleForm.patchValue({ date, initTime });
    }
  }

	
  onSubmit() {
    if (this.scheduleForm.valid) {
      this.toastr.success('Successfully saved', '', {
        positionClass: 'toast-top-right',
      });
      console.log(this.scheduleForm.value);
      this.scheduleForm.reset();
      // this.closeDialog();
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
}
