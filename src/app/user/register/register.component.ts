import { AuthenticationService } from '../authentication.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function comparePasswords(control: AbstractControl): { [key: string]: any } {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password.value === confirmPassword.value
    ? null
    : { passwordsDiffer: true };
}

function serverSideValidateEmail(authService: AuthenticationService): ValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: any }> => {
    return authService.checkEmailAvailability(control.value).pipe(
      map(available => {
        if (available) {
          return null;
        }
        return { userAlreadyExists: true };
      })
    );
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  public user: FormGroup;
  public errorMsg: string;
  public startDate = new Date();

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.user = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.email], //checkt niet juist, test@a is geldig, gebruik maken van Validators.pattern()
        serverSideValidateEmail(this.authService)
      ],
      passwordGroup: this.fb.group(
        {
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', Validators.required]
        },
        { validator: comparePasswords }
      ),
      street: ['', Validators.required], //Validators.pattern() voor straat + nummer
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      birthday: ['', Validators.required]
    });
  }

  getErrorMessage(errors: any) {
    if (!errors) {
      return null;
    }
    if (errors.required) {
      return 'is niet ingevuld';
    } else if (errors.minlength) {
      return `moet minstens ${errors.minlength.requiredLength} karakters bevatten (bevat nu ${errors.minlength.actualLength})`;
    } else if (errors.userAlreadyExists) {
      return `gebruiker bestaat al`;
    } else if (errors.email) {
      return `is geen geldig emailadres`;
    } else if (errors.passwordsDiffer) {
      return `wachtwoorden zijn het niet hetzelfde`;
    }
  }

  onSubmit() {
    this.authService
      .register(
        this.user.value.email,
        this.user.value.passwordGroup.password,
        this.user.value.firstName,
        this.user.value.lastName,
        this.user.value.birthday,
        this.user.value.street,
        this.user.value.city,
        this.user.value.postalCode
      )
      .subscribe(
        val => {
          if (val) {
            if (this.authService.redirectUrl) {
              this.router.navigateByUrl(this.authService.redirectUrl);
              this.authService.redirectUrl = undefined;
            } else {
              this.router.navigate(['/user-list']);
            }
          } else {
            this.errorMsg = `Could not login`;
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.error instanceof Error) {
            this.errorMsg = `Error while trying to login user ${this.user.value.email}: ${err.error.message}`;
          } else {
            this.errorMsg = `Error ${err.status} while trying to login user ${this.user.value.email}: ${err.error}`;
          }
        }
      );
  }
}
