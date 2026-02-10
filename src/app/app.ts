import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './components/ui/header/header';
import { CFooter } from './components/ui/c-footer/c-footer';
import { Cart } from './components/ui/cart/cart';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Cart, CFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('speakly');
  readonly isPaymentRoute = signal(false);

  constructor(private readonly router: Router) {
    const update = () => this.isPaymentRoute.set(this.router.url.startsWith('/payment'));
    update();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => update());
  }
}
