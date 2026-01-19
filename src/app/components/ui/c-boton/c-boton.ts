import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'button[c-boton]',
  imports: [CommonModule],
  templateUrl: './c-boton.html',
  styleUrl: './c-boton.scss',
  encapsulation: ViewEncapsulation.None

})
export class Boton {
  @Input() tipo: 'normal' | 'underlined' = 'normal';
  @Input() importancia: 'primaria' | 'secundaria' | 'danger' | 'warning' = 'primaria';

  @HostBinding('class')
  get clazz(): Record<string, boolean> {
    const baseClass = this.tipo === 'underlined' ? 'c-boton-underlined' : 'c-boton';
    
    return {
      [baseClass]: true,
      [`${baseClass}--importance-primaria`]: this.importancia === 'primaria',
      [`${baseClass}--importance-secundaria`]: this.importancia === 'secundaria',
      [`${baseClass}--importance-danger`]: this.importancia === 'danger',
      [`${baseClass}--importance-warning`]: this.importancia === 'warning',
    };
  }

}
