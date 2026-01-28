import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CCurso } from '../../ui/c-curso/c-curso';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { CourseInterface } from '../../../models/CourseInterface';
import { LanguageInterface } from '../../../models/LanguageInterface';
import { LevelInterface } from '../../../models/LevelInterface';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'page-cursos',
  imports: [CommonModule, CCurso, MatSliderModule, FormsModule],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss'
})
export class Cursos {
  private landbotLoaded = false;
  //subject para debounce en filtro de precio
  private priceSubject = new Subject<{ min: number; max: number }>();
  languages: LanguageInterface[] = [];
  levels: LevelInterface[] = [];
  courses: CourseInterface[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 8;
  pages: number[] = [];
  minPrice = 0;
  maxPrice = 100;
  priceRange = { min: 0, max: 100 };
  currentFilters: any = {};

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private coursesService: CoursesHttpClient
  ) {
    this.coursesService.getAllLanguages().subscribe(langs => {
      this.languages = langs;
    });
    this.coursesService.getAllLevels().subscribe(lvls => {
      this.levels = lvls;
    });
    //debounce pone un retardo antes de ejecutar la busqueda
    this.priceSubject.pipe(debounceTime(250)).subscribe(prices => {
      this.fetchCourses(
        this.currentFilters.language,
        this.currentFilters.level,
        prices.min.toString(),
        prices.max.toString(),
        this.currentFilters.sortBy
      );
    });
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
    //filtros actuales
    this.currentFilters = {
      language: language,
      level: level,
      minPrice: minPriceStr,
      maxPrice: maxPriceStr,
      sortBy: sortBy
    };
    
    const minPrice = minPriceStr ? Math.round(Number(minPriceStr)) : undefined;
    const maxPrice = maxPriceStr ? Math.round(Number(maxPriceStr)) : undefined;
    const targetPage = pageNumber ? pageNumber : 1;
    
    this.coursesService.getCourses({
      language: language,
      level: level,
      minPrice: Number.isFinite(minPrice!) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice!) ? maxPrice : undefined,
      sortBy: sortBy,
      pageNumber: targetPage,
      pageSize: this.pageSize
    }).subscribe(res => {
      this.courses = res.data;
      this.totalElements = res.totalElements ? res.totalElements : res.data.length;
      this.totalPages = res.totalPages ? res.totalPages : Math.max(1, Math.ceil(this.totalElements / this.pageSize));
      this.currentPage = res.pageNumber ? res.pageNumber : targetPage;
      this.pages = this.getPageRange();
    });
  }

  getPageRange(): number[] {
    const maxVisible = 5;
    if (this.totalPages <= maxVisible) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.fetchCourses(
      this.currentFilters.language,
      this.currentFilters.level,
      this.currentFilters.minPrice,
      this.currentFilters.maxPrice,
      this.currentFilters.sortBy,
      page
    );
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  updateMinPrice(value: string | number): void {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      this.minPrice = Math.round(numValue);
      this.priceSubject.next({ min: this.minPrice, max: this.maxPrice });
    }
  }

  updateMaxPrice(value: string | number): void {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      this.maxPrice = Math.round(numValue);
      this.priceSubject.next({ min: this.minPrice, max: this.maxPrice });
    }
  }

}