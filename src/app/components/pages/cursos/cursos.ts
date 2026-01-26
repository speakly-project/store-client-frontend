import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CCurso } from '../../ui/c-curso/c-curso';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { CourseInterface } from '../../../models/CourseInterface';
import { LanguageInterface } from '../../../models/LanguageInterface';
import { LevelInterface } from '../../../models/LevelInterface';


@Component({
  selector: 'page-cursos',
  imports: [CommonModule, CCurso],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss'
})
export class Cursos {
  private landbotLoaded = false;
  languages$: Observable<LanguageInterface[]>;
  levels$: Observable<LevelInterface[]>;
  courses: CourseInterface[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 8;
  pages: number[] = [];

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private coursesService: CoursesHttpClient
  ) {
    this.languages$ = this.coursesService.getAllLanguages();
    this.levels$ = this.coursesService.getAllLevels();
    this.fetchCourses();
  }

  ngAfterViewInit(): void {
    this.loadLandbot();
  }

  private loadLandbot(): void {
    if (this.landbotLoaded) return;
    this.landbotLoaded = true;


    const existing = this.document.querySelector(`script[src="/assets/landbot-cursos.js"]`);
    if (existing) {
      this.document.defaultView?.initLandbot?.();
      return;
    }

    const script = this.document.createElement('script');
    script.async = true;
    script.src = '/assets/landbot-cursos.js';
    script.onload = () => {
      this.document.defaultView?.initLandbot?.();
    };
    this.document.body.appendChild(script);
  }

  fetchCourses(language?: string, level?: string, minPriceStr?: string, maxPriceStr?: string, sortBy?: string, pageNumber?: number): void {
    const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;
    const targetPage = pageNumber ?? this.currentPage;
    this.coursesService.getCourses({
      language: language || undefined,
      level: level || undefined,
      minPrice: Number.isFinite(minPrice!) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice!) ? maxPrice : undefined,
      sortBy: sortBy || undefined,
      pageNumber: targetPage,
      pageSize: this.pageSize
    }).subscribe(res => {
      this.courses = res.data;
      this.totalElements = res.totalElements ?? res.data.length;
      this.totalPages = res.totalPages ?? Math.max(1, Math.ceil(this.totalElements / this.pageSize));
      this.currentPage = res.pageNumber ?? targetPage;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    });
  }

  goToPage(page: number, language?: string, level?: string, minPriceStr?: string, maxPriceStr?: string, sortBy?: string): void {
    if (page < 1 || page > this.totalPages) return;
    this.fetchCourses(language, level, minPriceStr, maxPriceStr, sortBy, page);
  }

  prevPage(language?: string, level?: string, minPriceStr?: string, maxPriceStr?: string, sortBy?: string): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1, language, level, minPriceStr, maxPriceStr, sortBy);
    }
  }

  nextPage(language?: string, level?: string, minPriceStr?: string, maxPriceStr?: string, sortBy?: string): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1, language, level, minPriceStr, maxPriceStr, sortBy);
    }
  }
}
