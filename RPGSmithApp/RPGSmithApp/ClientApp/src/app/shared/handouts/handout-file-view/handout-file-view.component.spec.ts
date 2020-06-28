import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HandoutFileViewComponent } from './handout-file-view.component';

describe('HandoutFileViewComponent', () => {
  let component: HandoutFileViewComponent;
  let fixture: ComponentFixture<HandoutFileViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandoutFileViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandoutFileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
