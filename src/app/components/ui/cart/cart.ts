import { Component, HostListener } from '@angular/core';
import { CartService } from '../../../services/cart-service';
import { Router } from "@angular/router";

@Component({
  selector: 'c-cart',
  imports: [],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  constructor(
    public cartService: CartService,
    private readonly router: Router,
  ) {}

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.cartService.isOpen()) return;
    if (event.key === 'Escape') {
      this.cartService.close();
    }
  }

  remove(courseId: string | number): void {
    this.cartService.removeCourse(courseId);
  }

  formatMoney(value: number): string {
    return `${value.toFixed(2)}€`;
  }

  goToPayment(): void {
    if (this.cartService.items().length === 0) return;
    this.cartService.close();
    this.router.navigate(['/payment']);
  }
}
