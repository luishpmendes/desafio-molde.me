import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TSPComponent } from './tsp.component';

describe('TSPComponent', () => {
  let component: TSPComponent;
  let fixture: ComponentFixture<TSPComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TSPComponent]
    });
    fixture = TestBed.createComponent(TSPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
