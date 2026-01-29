import { Component } from '@angular/core';
import { CFooter } from "../../ui/c-footer/c-footer";
import { CTag } from '../../ui/c-tag/c-tag';

type CursoTab = 'overview' | 'curriculum' | 'instructor';

@Component({
  selector: 'p-curso',
  imports: [CTag],
  templateUrl: './curso.html',
  styleUrl: './curso.scss'
})
export class Curso {
	activeTab: CursoTab = 'overview';

	setTab(tab: CursoTab): void {
		this.activeTab = tab;
	}
}
