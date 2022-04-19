import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AngularMaterialModule } from "../angular-material.module";
import { CitiesComponent } from "./cities.component";
import { RouterTestingModule } from '@angular/router/testing';
import { CityService } from "./city.service";
import { ApiResult } from "../base.service";
import { City } from "./city";
import { of } from "rxjs";

describe('CitiesComponent', () => {
  let component: CitiesComponent;
  let fixture: ComponentFixture<CitiesComponent>;

  beforeEach(async () => {
    //Create mock services
    let mockCityService = jasmine.createSpyObj<CityService>('CityService', ['getData']);

    //Configure mock methods
    mockCityService.getData.and.returnValue(of<ApiResult<City>>(<ApiResult<City>>{
      data: [
        <City>{
          name: 'TestCity1',
          id: 1,
          lat: 1,
          lon: 1,
          countryId: 1,
          countryName: 'TestCountry1'
        },
        <City>{
          name: 'TestCity2',
          id: 2,
          lat: 2,
          lon: 2,
          countryId: 1,
          countryName: 'TestCountry1'
        },
        <City>{
          name: 'TestCity3',
          id: 3,
          lat: 3,
          lon: 3,
          countryId: 1,
          countryName: 'TestCountry1'
        }
      ]
    }));

    await TestBed.configureTestingModule({
      declarations: [CitiesComponent],
      imports: [
        BrowserAnimationsModule,
        AngularMaterialModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: CityService,
          useValue: mockCityService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CitiesComponent);
    component = fixture.componentInstance;

    component.paginator = jasmine.createSpyObj("MatPaginator", ["length", "pageIndex", "pageSize"]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a "Cities" title', () => {
    let title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toEqual('Cities');
  });

  it('shoule contain a table with a list of one or more cities', () => {
    let table = fixture.nativeElement.querySelector('table.mat-table');
    let tableRows = table.querySelectorAll('tr.mat-row');
    expect(tableRows.length).toBeGreaterThan(0);
  })
});
