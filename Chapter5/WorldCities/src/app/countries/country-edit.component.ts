import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFormComponent } from '../base-form.component';
import { Country } from './country';
import { CountryService } from './country.service';

@Component({
  selector: 'app-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrls: ['./country-edit.component.scss']
})
export class CountryEditComponent
  extends BaseFormComponent implements OnInit {

  title?: string;
  country?: Country;
  id?: number;
  countries?: Country[];

  constructor(
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private route: Router,
    private countryService: CountryService) {
      super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required, this.isDupeField("name")],
      iso2: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{2}$/)], this.isDupeField("iso2")],
      iso3: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{3}$/)], this.isDupeField("iso3")]
    });

    this.loadData();
  }

  loadData() {
    this.loadCountries();

    var idParam = this.activateRoute.snapshot.paramMap.get('id');
    this.id = idParam ? + idParam : 0;
    if (this.id) {
      this.countryService.get(this.id).subscribe(result => {
        this.country = result;
        this.title = "Edit - " + this.country.name;

        this.form.patchValue(this.country);
      }, err => console.error(err))
    }
    else {
      this.title = "Create a new Country";
    }
  }

  loadCountries() {
    this.countryService.getData(0, 9999, "name", "asc", null, null).subscribe(result => {
      this.countries = result.data;
    }, err => console.error(err));
  }

  onSubmit() {
    var country = (this.id) ? this.country : <Country>{};
    if (country) {
      country.name = this.form.controls['name'].value;
      country.iso2 = this.form.controls['iso2'].value;
      country.iso3 = this.form.controls['iso3'].value;

      if (this.id) {
        this.countryService.put(country)
          .subscribe(result => {
            console.log("City " + country!.id + " has been updated.");
            this.route.navigate(['/countries']);
          }, err => console.error(err));
      }
      else {
        this.countryService.post(country)
          .subscribe(result => {
            console.log("City " + result.id + " has been created.");
            this.route.navigate(['/countries']);
          }, err => console.error(err));
      }
    }
  }

  isDupeField(fieldName: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return this.countryService.isDupeField(this.id ?? 0, fieldName, control.value).pipe(map(result => {
        return (result ? { isDupeField: true } : null)
      }));
    }
  }
}
