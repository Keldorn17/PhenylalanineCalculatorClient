import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild
} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatDatepicker, MatDatepickerInput, MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {formatIsoDate} from '../http/api-utils';

export interface DayChipItem {
  date: Date;
  key: string;
  weekday: string;
  dayNumber: number;
  month: string;
}

@Component({
  selector: 'date-switcher',
  imports: [
    MatButton,
    MatIconButton,
    MatCard,
    MatCardContent,
    MatDatepicker,
    MatDatepickerInput,
    MatIcon,
    MatTooltip,
    TranslatePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './date-switcher.html',
  styleUrl: './date-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateSwitcher implements AfterViewInit {
  private readonly translateService = inject(TranslateService);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  public readonly selectedDate = input<Date>(new Date());
  public readonly dateChange = output<Date>();

  protected readonly today = this.normalizeDate(new Date());
  protected readonly activeDate = linkedSignal<Date>(() => this.normalizeDate(this.selectedDate()));
  protected readonly centerDate = signal<Date>(this.today);
  protected readonly isDragging = signal<boolean>(false);

  protected readonly daysScrollContainer = viewChild<ElementRef<HTMLElement>>('daysScrollContainer');
  protected readonly currentLang = this.translateService.currentLang;

  protected readonly visibleDayItems = computed<DayChipItem[]>((): DayChipItem[] => {
    const center = this.centerDate();
    const lang = this.currentLang() ?? 'en';
    const locale = lang === 'hu' ? 'hu-HU' : 'en-US';
    const weekdayFormatter = new Intl.DateTimeFormat(locale, {weekday: 'short'});
    const monthFormatter = new Intl.DateTimeFormat(locale, {month: 'short'});

    const items: DayChipItem[] = [];
    for (let offset = -30; offset <= 30; offset++) {
      const date = new Date(center.getFullYear(), center.getMonth(), center.getDate() + offset);
      items.push({
        date,
        key: formatIsoDate(date),
        weekday: weekdayFormatter.format(date),
        dayNumber: date.getDate(),
        month: monthFormatter.format(date)
      });
    }
    return items;
  });

  private hasDragged = false;
  private dragStartX = 0;
  private dragStartScrollLeft = 0;

  constructor() {
    effect(() => {
      const lang = this.currentLang() ?? 'en';
      this.dateAdapter.setLocale(lang === 'hu' ? 'hu-HU' : 'en-US');
    });
  }

  public ngAfterViewInit(): void {
    this.scrollSelectedDayIntoView('instant');
  }

  public selectToday(): void {
    this.centerDate.set(this.today);
    this.selectDate(this.today);
  }

  public onDayChipClick(date: Date, event: MouseEvent): void {
    if (this.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
      this.hasDragged = false;
      return;
    }
    this.selectDate(date);
  }

  public selectDate(date: Date): void {
    const normalized = this.normalizeDate(date);
    const alreadySelected = this.isSameDay(normalized, this.activeDate());

    const diffFromCenter = Math.round(
      (normalized.getTime() - this.centerDate().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (Math.abs(diffFromCenter) > 20) {
      this.centerDate.set(normalized);
    }

    if (alreadySelected) {
      this.scrollSelectedDayIntoView('smooth');
      return;
    }

    this.activeDate.set(normalized);
    this.dateChange.emit(normalized);
    this.scrollSelectedDayIntoView('smooth');
  }

  public onCalendarDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const normalized = this.normalizeDate(event.value);
      this.centerDate.set(normalized);
      this.selectDate(normalized);
    }
  }

  public onMouseDown(event: MouseEvent): void {
    const container = this.daysScrollContainer()?.nativeElement;
    if (!container) {
      return;
    }
    this.isDragging.set(true);
    this.hasDragged = false;
    this.dragStartX = event.pageX - container.offsetLeft;
    this.dragStartScrollLeft = container.scrollLeft;
  }

  public onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) {
      return;
    }
    const container = this.daysScrollContainer()?.nativeElement;
    if (!container) {
      return;
    }
    const x = event.pageX - container.offsetLeft;
    const walk = x - this.dragStartX;
    if (Math.abs(walk) > 5) {
      this.hasDragged = true;
    }
    event.preventDefault();
    container.scrollLeft = this.dragStartScrollLeft - walk;
  }

  public onMouseUp(): void {
    this.isDragging.set(false);
  }

  public onDaysWheel(event: WheelEvent): void {
    const container = this.daysScrollContainer()?.nativeElement;
    if (!container) {
      return;
    }
    if (event.deltaY !== 0) {
      event.preventDefault();
      container.scrollLeft += event.deltaY;
    }
  }

  public isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  public isSelected(date: Date): boolean {
    return this.isSameDay(date, this.activeDate());
  }

  public isToday(date: Date): boolean {
    return this.isSameDay(date, this.today);
  }

  private scrollSelectedDayIntoView(behavior: ScrollBehavior): void {
    setTimeout(() => {
      const container = this.daysScrollContainer()?.nativeElement;
      if (!container) {
        return;
      }
      const activeElem = container.querySelector<HTMLElement>('.day-chip.selected');
      if (activeElem && typeof activeElem.scrollIntoView === 'function') {
        activeElem.scrollIntoView({
          behavior,
          inline: 'center',
          block: 'nearest'
        });
      }
    }, 0);
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
