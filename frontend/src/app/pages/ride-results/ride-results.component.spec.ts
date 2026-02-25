import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideResultsComponent } from './ride-results.component';

describe('RideResultsComponent', () => {
  let component: RideResultsComponent;
  let fixture: ComponentFixture<RideResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
