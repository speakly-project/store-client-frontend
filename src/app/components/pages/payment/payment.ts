import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart-service';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { CartItem } from '../../../models/CartItem';

@Component({
  selector: 'p-payment',
  imports: [RouterLink, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {
  private readonly buyNowItems = signal<CartItem[] | null>(null);

  readonly items = computed(() => this.buyNowItems() ?? this.cartService.items());

  fullName = '';
  cardNumber = '';
  expiryDate = '';
  cvv = '';

  constructor(
    public cartService: CartService,
    private readonly route: ActivatedRoute,
    private readonly coursesHttp: CoursesHttpClient,
    private readonly router: Router,
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
    return this.items().reduce((sum, item) => sum + item.course.price * item.quantity, 0);
  }

  totalWithOutIva(): number {
    return this.total() / 1.21;
  }

  vat(): number {
    return this.total() - this.totalWithOutIva();
  }

  formatCardNumber(): void {
    let digits = this.cardNumber.replace(/\D/g, '');
    digits = digits.slice(0, 16);
    this.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  payCart(): void {
    const cleanCardNumber = this.cardNumber.replace(/\s/g, '');
    console.log('payCart llamado con:', {
      cardNumber: cleanCardNumber,
      expiryDate: this.expiryDate,
      cvv: this.cvv,
      fullName: this.fullName,
    });
    this.cartService.payCart(cleanCardNumber, this.expiryDate, this.cvv, this.fullName).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error en payCart:', err);
      },
    });
  }

  formatMoney(value: number): string {
    return `${value.toFixed(2)}€`;
  }
}
