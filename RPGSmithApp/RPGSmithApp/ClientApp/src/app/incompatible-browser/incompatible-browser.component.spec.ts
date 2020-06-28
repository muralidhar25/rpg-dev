import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompatibleBrowserComponent } from './incompatible-browser.component';

describe('IncompatibleBrowserComponent', () => {
  let component: IncompatibleBrowserComponent;
  let fixture: ComponentFixture<IncompatibleBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncompatibleBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompatibleBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
