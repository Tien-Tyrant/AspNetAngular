import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFormComponent } from '../base-form.component';
import { City } from '../cities/city';
import { CityService } from '../cities/city.service';
import { Country } from '../countries/country';
import { CountryService } from '../countries/country.service';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss']
})
export class CityEditComponent extends BaseFormComponent implements OnInit {

  title?: string;
  city?: City;
  id?: number;
  countries?: Country[];

  activityLog: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private activateRoute: ActivatedRoute,
    private route: Router,
    private cityService: CityService,
    private countryService: CountryService) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      lat: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4}?$)/)]),
      lon: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4}?$)/)]),
      countryId: new FormControl('', Validators.required)
    }, null, this.isDupeCity());

    this.subscriptions.add(this.form.valueChanges
      .subscribe(() => {
        if (!this.form.dirty) {
          this.log("Form Model has been loaded.")
        }
        else {
          this.log("Form was updated by the user.")
        }
      }));

    this.subscriptions.add(this.form.get("name")!.valueChanges
      .subscribe(() => {
        if (!this.form.dirty) {
          this.log("Name has been loaded with initial values.")
        }
        else {
          this.log("Name was updated by the user.")
        }
      }));

    this.loadData();
  }

  log(msg: string) {
    this.activityLog += "[" + new Date().toLocaleString() + "]" + msg + "<br/>";
  }

  loadData() {
    this.loadCountries();

    var idParam = this.activateRoute.snapshot.paramMap.get('id');
    this.id = idParam ? + idParam : 0;
    if (this.id) {

      this.cityService.get(this.id).subscribe(result => {
        this.city = result;
        this.title = "Edit - " + this.city.name;

        this.form.patchValue(this.city);
      }, err => console.error(err))
    }
    else {
      this.title = "Create a new City";
    }
  }

  loadCountries() {
    this.countryService.getData(0, 9999, "name", "asc", null, null).subscribe(result => {
      this.countries = result.data;
    }, err => console.error(err));
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};
    if (city) {
      city.name = this.form.controls['name'].value;
      city.lat = this.form.controls['lat'].value;
      city.lon = this.form.controls['lon'].value;
      city.countryId = this.form.controls['countryId'].value;

      if (this.id) {
        this.cityService.put(city)
          .subscribe(result => {
            console.log("City " + city!.id + " has been updated.");
            this.route.navigate(['/cities']);
          }, err => console.error(err));
      }
      else {
        this.cityService.post(city)
          .subscribe(result => {
            console.log("City " + result.id + " has been created.");
            this.route.navigate(['/cities']);
          }, err => console.error(err));
      }
    }
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.controls['name'].value;
      city.lat = this.form.controls['lat'].value;
      city.lon = this.form.controls['lon'].value;
      city.countryId = this.form.controls['countryId'].value;

      return this.cityService.isDupeCity(city).pipe(map(result => {
        return (result ? { isDupeCity: true } : null)
      }));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
