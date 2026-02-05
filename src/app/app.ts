import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/ui/header/header';
import { CFooter } from './components/ui/c-footer/c-footer';
import { Cart } from './components/ui/cart/cart';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Cart, CFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('speakly');
}
