import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Country } from './country';

@Component({
  selector: 'app-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrls: ['./country-edit.component.scss']
})
export class CountryEditComponent implements OnInit {

  title?: string;
  form!: FormGroup;
  country?: Country;
  id?: number;
  countries?: Country[];

  constructor(
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private route: Router,
    private http: HttpClient) { }

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
      var url = environment.baseUrl + 'api/Countries/' + this.id;

      this.http.get<Country>(url).subscribe(result => {
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
    var country = (this.id) ? this.country : <Country>{};
    if (country) {
      country.name = this.form.controls['name'].value;
      country.iso2 = this.form.controls['lat'].value;
      country.iso3 = this.form.controls['lon'].value;

      if (this.id) {
        var url = environment.baseUrl + 'api/Countries/' + country.id;
        this.http.put<Country>(url, country)
          .subscribe(result => {
            console.log("City " + country!.id + " has been updated.");
            this.route.navigate(['/countries']);
          }, err => console.error(err));
      }
      else {
        var url = environment.baseUrl + 'api/Countries';
        this.http.post<Country>(url, country)
          .subscribe(result => {
            console.log("City " + result.id + " has been created.");
            this.route.navigate(['/countries']);
          }, err => console.error(err));
      }
    }
  }

  isDupeField(fieldName:string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      var params = new HttpParams()
        .set("countryId", (this.id) ? this.id.toString() : "0")
        .set("fieldName", fieldName)
        .set("fieldValue", control.value);

      var url = environment.baseUrl + 'api/Countries/IsDupeField';
      return this.http.post<boolean>(url, null, {params}).pipe(map(result => {
        return (result ? { isDupeField: true } : null)
      }));
    }
  }

}
