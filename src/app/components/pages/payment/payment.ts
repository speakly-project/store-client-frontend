import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart-service';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { CartItem } from '../../../models/CartItem';

@Component({
  selector: 'p-payment',
  imports: [RouterLink],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {
  private readonly buyNowItems = signal<CartItem[] | null>(null);

  readonly items = computed(() => this.buyNowItems() ?? this.cartService.items());
  readonly subtotal = computed(() => this.items().reduce((sum, item) => sum + item.course.price * item.quantity, 0));
  readonly vat = computed(() => this.subtotal() * 0.21);
  readonly total = computed(() => this.subtotal() + this.vat());

  constructor(
    public cartService: CartService,
    private readonly route: ActivatedRoute,
    private readonly coursesHttp: CoursesHttpClient,
  ) {
    this.route.queryParamMap.subscribe((params) => {
      const raw = params.get('courseId');
      const courseId = raw ? Number(raw) : NaN;
      if (!raw || !isFinite(courseId)) {
        this.buyNowItems.set(null);
        return;
      }

      this.coursesHttp.getCourseById(courseId).subscribe((course) => {
        this.buyNowItems.set([{ course, quantity: 1 }]);
      });
    });
  }

  formatMoney(value: number): string {
    return `${value.toFixed(2)}€`;
  }
}
