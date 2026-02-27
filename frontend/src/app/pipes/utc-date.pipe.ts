import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'utcDate',
  standalone: true
})
export class UtcDatePipe implements PipeTransform {

  private datePipe = new DatePipe('fr-FR');

  transform(value: string | null | undefined, format: string = 'mediumDate'): string | null {
    if (!value) {
      return null;
    }
    const normalized = value.endsWith('Z') || value.includes('+') ? value : value + 'Z';
    return this.datePipe.transform(normalized, format);
  }
}
