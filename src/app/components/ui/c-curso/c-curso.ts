import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CTag } from '../c-tag/c-tag';
@Component({
  selector: 'c-curso',
  imports: [CommonModule, RouterLink, CTag],
  templateUrl: './c-curso.html',
  styleUrl: './c-curso.scss'
})
export class CCurso {
  @Input() course: any;

	get courseId(): number | null {
		const id = this.course?.id;
		return typeof id === 'number' ? id : null;
	}

  truncate(text: string | undefined | null, max = 120): string {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= max) return trimmed;
    return trimmed.slice(0, max).replace(/\s+$/,'') + '...';
  }
}
