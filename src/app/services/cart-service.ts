import { Injectable, computed, signal } from '@angular/core';
import { CourseInterface } from '../models/CourseInterface';

export interface CartItem {
  course: CourseInterface;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly isOpen = signal(false);
  readonly items = signal<CartItem[]>([]);

  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.course.price * item.quantity, 0),
  );
  readonly vat = computed(() => this.subtotal() * 0.21);
  readonly total = computed(() => this.subtotal() + this.vat());

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  clear(): void {
    this.items.set([]);
  }

  private normalizeId(id: string | number): string {
    return String(id);
  }

  addCourse(course: CourseInterface, quantity = 1): void {
    if (quantity <= 0) return;

    const courseId = this.normalizeId(course.id as unknown as string | number);

    this.items.update((prev) => {
      const idx = prev.findIndex((i) => this.normalizeId(i.course.id as unknown as string | number) === courseId);
      if (idx === -1) {
        return [...prev, { course, quantity }];
      }

      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      return next;
    });
  }

  removeCourse(courseId: string | number): void {
    const normalized = this.normalizeId(courseId);
    this.items.update((prev) =>
      prev.filter((i) => this.normalizeId(i.course.id as unknown as string | number) !== normalized),
    );
  }
}
