import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CTag } from '../c-tag/c-tag';

const LANGUAGE_IMAGES: Record<string, string> = {
  'english': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739688/profiles/rq1r3bq80erivuaarzwm.png',
  'korean': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769737672/profiles/p6ssw0ayjzpkapqy7z2b.png',
  'spanish': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739560/profiles/yg9b9atihpivzkkahahv.png',
  'chinese': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769738126/profiles/tpwiiu8xlgp7rhesb30e.png',
  'russian': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769738149/profiles/ottmwn8kwgxxfnluki87.png',
  'arabic': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769738179/profiles/dl8xyzvgas5c4zfu2fhw.png',
  'japanese': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739443/profiles/gp4watlsexpwfwosfygu.png',
  'italian': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739487/profiles/giip20dhynk9gvugnexr.png',
  'portuguese': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739516/profiles/hmboqcj6ztbtxtrmmijo.png',
  'german': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739538/profiles/ydhcobpmghrns9mcyzuz.png',
  'french': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739547/profiles/wgu2cv6emrpazw5siqx2.png',
};

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

  getLanguageImage(): string {
    if (!this.course?.language) {
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLPK9PCyWnpPHFqAyv4i2vGIq2gR5w2A5yuA&s';
    }
    const languageKey = this.course.language.toLowerCase();
    return LANGUAGE_IMAGES[languageKey] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLPK9PCyWnpPHFqAyv4i2vGIq2gR5w2A5yuA&s';
  }

  truncate(text: string | undefined | null, max = 120): string {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= max) return trimmed;
    return trimmed.slice(0, max).replace(/\s+$/,'') + '...';
  }
}
