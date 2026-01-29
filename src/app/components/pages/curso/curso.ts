import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CTag } from '../../ui/c-tag/c-tag';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { CourseInterface } from '../../../models/CourseInterface';
import { UserInterface } from '../../../models/UserInterface';


type CursoTab = 'overview' | 'curriculum' | 'instructor';

@Component({
  selector: 'p-curso',
  imports: [CTag],
  templateUrl: './curso.html',
  styleUrl: './curso.scss'
})
export class Curso {
  course?: CourseInterface;
  teacherUser?: UserInterface;

  constructor(
    private route: ActivatedRoute,
    private readonly coursesHttp: CoursesHttpClient,
  ) { }

  activeTab: CursoTab = 'overview';

  setTab(tab: CursoTab): void {
    this.activeTab = tab;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.coursesHttp.getCourseById(id).subscribe(course => {
      this.course = course;

        if (!course.teacher.username) {
        this.coursesHttp.getUserById(course?.teacher.id).subscribe(user => {
          this.course!.teacher = user;
        });
      }
    });


  }

  teacherInitials(): string {
    const name = this.course?.teacher?.username;
    if (!name || name === '—') return '??';
    const parts = name.trim().split(/[\s_]+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((p) => p.trim()[0]?.toUpperCase())
      .join('');
    return initials || '??';
  }
}
