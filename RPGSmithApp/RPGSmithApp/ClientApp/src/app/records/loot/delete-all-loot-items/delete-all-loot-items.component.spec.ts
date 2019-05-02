import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAllLootItemsComponent } from './delete-all-loot-items.component';

describe('DeleteAllLootItemsComponent', () => {
  let component: DeleteAllLootItemsComponent;
  let fixture: ComponentFixture<DeleteAllLootItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteAllLootItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAllLootItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
