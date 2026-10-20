import {describe, it, expect, beforeEach} from 'vitest';
import {ThemeService} from './theme-service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    service = new ThemeService();
  });

  it('should initialize theme state', () => {
    expect(typeof service.isDark()).toBe('boolean');
  });

  it('should toggle theme correctly', () => {
    const initial = service.isDark();
    service.toggleTheme();
    expect(service.isDark()).toBe(!initial);
    expect(localStorage.getItem('theme')).toBe(!initial ? 'dark' : 'light');
  });

  it('should set theme explicitly', () => {
    service.setTheme(true);
    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    service.setTheme(false);
    expect(service.isDark()).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
