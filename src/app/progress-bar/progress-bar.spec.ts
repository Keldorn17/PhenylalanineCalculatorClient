import {describe, it, expect, beforeEach} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentRef} from '@angular/core';
import {provideTranslateService} from '@ngx-translate/core';
import {ProgressBar} from './progress-bar';

describe('ProgressBar', () => {
  let fixture: ComponentFixture<ProgressBar>;
  let component: ProgressBar;
  let componentRef: ComponentRef<ProgressBar>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProgressBar],
      providers: [provideTranslateService()]
    });

    fixture = TestBed.createComponent(ProgressBar);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('current', 20);
    componentRef.setInput('total', 100);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentage and progressValue correctly within limit', () => {
    expect(component.percentage()).toBe(20);
    expect(component.progressValue()).toBe(20);
    expect(component.remaining()).toBe(80);
    expect(component.exceeded()).toBe(0);
    expect(component.isOverLimit()).toBe(false);
    expect(component.isAtLimit()).toBe(false);
  });

  it('should handle zero or negative total gracefully', () => {
    componentRef.setInput('total', 0);
    fixture.detectChanges();

    expect(component.percentage()).toBe(0);
    expect(component.progressValue()).toBe(0);
    expect(component.isOverLimit()).toBe(false);
  });

  it('should calculate over limit correctly when current exceeds total', () => {
    componentRef.setInput('current', 150);
    componentRef.setInput('total', 100);
    fixture.detectChanges();

    expect(component.percentage()).toBe(150);
    expect(component.progressValue()).toBe(100);
    expect(component.remaining()).toBe(0);
    expect(component.exceeded()).toBe(50);
    expect(component.isOverLimit()).toBe(true);
    expect(component.isAtLimit()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.progress-card');
    expect(card?.classList.contains('is-over-limit')).toBe(true);
  });

  it('should handle exactly at limit', () => {
    componentRef.setInput('current', 100);
    componentRef.setInput('total', 100);
    fixture.detectChanges();

    expect(component.percentage()).toBe(100);
    expect(component.progressValue()).toBe(100);
    expect(component.remaining()).toBe(0);
    expect(component.exceeded()).toBe(0);
    expect(component.isOverLimit()).toBe(false);
    expect(component.isAtLimit()).toBe(true);
  });

  it('should render the custom title when provided', () => {
    componentRef.setInput('title', 'Custom Allowance');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('.header-title');
    expect(titleElement?.textContent?.trim()).toBe('Custom Allowance');
  });

  it('should render current and total amounts in the DOM', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentElem = compiled.querySelector('.current-amount');
    const totalElem = compiled.querySelector('.total-amount');

    expect(currentElem?.textContent?.trim()).toBe('20');
    expect(totalElem?.textContent?.trim()).toContain('100 mg');
  });
});
