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

  constructor(
    public cartService: CartService,
    private readonly route: ActivatedRoute,
    private readonly coursesHttp: CoursesHttpClient,
  ) {
    this.cartService.loadCart();
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

  total(): number {
    return this.cartService.total();
  }

  totalWithOutIva(): number {
    return this.cartService.totalWithOutIva();
  }

  vat(): number {
    return this.cartService.vat();
  }

  formatMoney(value: number): string {
    return `${value.toFixed(2)}€`;
  }
}
