import {describe, it, expect, beforeEach} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {Home} from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideTranslateService()]
    });

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dailyIntake', {
      date: new Date('2026-10-21'),
      consumedPhenylalanine: 45,
      dailyLimit: 250
    });
    fixture.detectChanges();
  });

  it('should create home component and pass dailyIntake to progress bar', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('progress-bar')).toBeTruthy();
  });
});
