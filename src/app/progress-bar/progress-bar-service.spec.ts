import {describe, it, expect, beforeEach} from 'vitest';
import {ProgressBarService} from './progress-bar-service';

describe('ProgressBarService', () => {
  let service: ProgressBarService;

  beforeEach(() => {
    service = new ProgressBarService();
  });

  it('should emit refresh event with provided date and update activeDate', () => {
    const targetDate = new Date(2026, 9, 15);
    service.triggerRefresh(targetDate);

    expect(service.activeDate()).toEqual(targetDate);
    expect(service.refreshEvent()?.date).toEqual(targetDate);
  });

  it('should emit refresh event using current activeDate when no date is passed', () => {
    const viewedDate = new Date(2026, 9, 12);
    service.setActiveDate(viewedDate);

    service.triggerRefresh();

    expect(service.refreshEvent()?.date).toEqual(viewedDate);
  });
});
