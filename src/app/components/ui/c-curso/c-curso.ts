import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CTag } from '../c-tag/c-tag';
@Component({
  selector: 'c-curso',
  imports: [CommonModule, CTag],
  templateUrl: './c-curso.html',
  styleUrl: './c-curso.scss'
})
export class CCurso {
  @Input() course: any;

  truncate(text: string | undefined | null, max = 120): string {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= max) return trimmed;
    return trimmed.slice(0, max).replace(/\s+$/,'') + '...';
  }
}
