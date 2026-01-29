import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/ui/header/header';
import { CFooter } from './components/ui/c-footer/c-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('speakly');
}
