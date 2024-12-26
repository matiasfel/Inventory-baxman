import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FurnituresPage } from './furnitures.page';

describe('FurnituresPage', () => {
  let component: FurnituresPage;
  let fixture: ComponentFixture<FurnituresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FurnituresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
