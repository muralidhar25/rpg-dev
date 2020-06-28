import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HandoutViewComponent } from './handout-view.component';

describe('HandoutViewComponent', () => {
  let component: HandoutViewComponent;
  let fixture: ComponentFixture<HandoutViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandoutViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandoutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
