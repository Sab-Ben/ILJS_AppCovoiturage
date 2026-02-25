import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedRidesComponent } from './completed-rides.component';

describe('CompletedRidesComponent', () => {
  let component: CompletedRidesComponent;
  let fixture: ComponentFixture<CompletedRidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedRidesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedRidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
