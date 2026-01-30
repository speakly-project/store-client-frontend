import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CTag } from '../../ui/c-tag/c-tag';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { CourseInterface } from '../../../models/CourseInterface';
import { UserInterface } from '../../../models/UserInterface';

const LANGUAGE_IMAGES: Record<string, string> = {
  'english': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739688/profiles/rq1r3bq80erivuaarzwm.png',
  'korean': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769737672/profiles/p6ssw0ayjzpkapqy7z2b.png',
  'spanish': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739560/profiles/yg9b9atihpivzkkahahv.png',
  'chinese': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769738126/profiles/tpwiiu8xlgp7rhesb30e.png',
  'russian': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769738149/profiles/ottmwn8kwgxxfnluki87.png',
  'arabic': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769738179/profiles/dl8xyzvgas5c4zfu2fhw.png',
  'japanese': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739443/profiles/gp4watlsexpwfwosfygu.png',
  'italian': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739487/profiles/giip20dhynk9gvugnexr.png',
  'portuguese': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739516/profiles/hmboqcj6ztbtxtrmmijo.png',
  'german': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739538/profiles/ydhcobpmghrns9mcyzuz.png',
  'french': 'https://res.cloudinary.com/dnywbqedv/image/upload/v1769739547/profiles/wgu2cv6emrpazw5siqx2.png',
};

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

  getLanguageImage(): string {
    if (!this.course?.language) {
      return 'https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    }
    const languageKey = this.course.language.toLowerCase();
    return LANGUAGE_IMAGES[languageKey] || 'https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
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
