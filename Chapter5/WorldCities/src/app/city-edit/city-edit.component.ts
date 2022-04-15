import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { City } from '../cities/city';
import { Country } from '../countries/country';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss']
})
export class CityEditComponent implements OnInit {

  title?: string;
  form!: FormGroup;
  city?: City;
  id?: number;
  countries?: Country[];

  constructor(
    private activateRoute: ActivatedRoute,
    private route: Router,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      lat: new FormControl('', Validators.required),
      lon: new FormControl('', Validators.required),
      countryId: new FormControl('', Validators.required)
    }, null, this.isDupeCity());

    this.loadData();
  }

  loadData() {
    this.loadCountries();

    var idParam = this.activateRoute.snapshot.paramMap.get('id');
    this.id = idParam ? + idParam : 0;
    if (this.id) {
      var url = environment.baseUrl + 'api/Cities/' + this.id;

      this.http.get<City>(url).subscribe(result => {
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
    var url = environment.baseUrl + 'api/Countries';
    var params = new HttpParams()
      .set("pageIndex", 0)
      .set("pageSize", "9999")
      .set("sortColumn", "name")
      .set("sortOrder", "asc");

    this.http.get<any>(url, { params }).subscribe(result => {
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
        var url = environment.baseUrl + 'api/Cities/' + city.id;
        this.http.put<City>(url, city)
          .subscribe(result => {
            console.log("City " + city!.id + " has been updated.");
            this.route.navigate(['/cities']);
          }, err => console.error(err));
      }
      else {
        var url = environment.baseUrl + 'api/Cities';
        this.http.post<City>(url, city)
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

      var url = environment.baseUrl + 'api/Cities/IsDupeCity';
      return this.http.post<boolean>(url, city).pipe(map(result => {
        return (result ? { isDupeCity: true } : null)
      }));
    }
  }
}