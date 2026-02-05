import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart-service';

@Component({
  selector: 'p-payment',
  imports: [RouterLink],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {
  constructor(public cartService: CartService) {}

  formatMoney(value: number): string {
    return `${value.toFixed(2)}€`;
  }
}
