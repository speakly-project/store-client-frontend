import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Boton } from "../c-boton/c-boton";
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'c-header',
  imports: [RouterLink, Boton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})

export class Header {
  isMenuOpen = false;
  @ViewChild('menuRoot', { static: false }) menuRoot?: ElementRef<HTMLElement>;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.refreshCurrentUser().subscribe();
    }
  }

  get userInitial(): string {
    const username = this.authService.getCurrentUser()?.username?.trim();
    return username ? username[0].toUpperCase() : 'U';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen) {
      return;
    }

    const root = this.menuRoot?.nativeElement;
    const targetNode = event.target as Node | null;
    if (!root || !targetNode) {
      return;
    }

    if (!root.contains(targetNode)) {
      this.closeMenu();
    }
  }
}
