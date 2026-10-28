/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatDateGerman(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return `${weekdays[date.getDay()]}, ${day}. ${months[date.getMonth()]}`;
}

export function formatShortDate(dateString: string): string {
  const [, month, day] = dateString.split('-');
  return `${day}.${month}`;
}

export function getDaysInMonth(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  const daysCount = new Date(year, month, 0).getDate();
  const days: string[] = [];
  const monthPad = String(month).padStart(2, '0');

  for (let day = 1; day <= daysCount; day++) {
    const dayPad = String(day).padStart(2, '0');
    days.push(`${year}-${monthPad}-${dayPad}`);
  }
  return days;
}

export function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return `${months[month - 1]} ${year}`;
}
