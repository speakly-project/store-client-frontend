import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CCurso } from '../../ui/c-curso/c-curso';
import { AnimationDurations } from '@angular/material/core';
import { hasTopLevelIdentifier } from '@angular/cdk/schematics';

@Component({
  selector: 'page-cursos',
  imports: [CommonModule, CCurso],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss'
})
export class Cursos {
  courses = Array.from({length:8}).map((_, i) => ({
    title: ['Master Conversational Italian','Advanced Russian Business','Speak Japanese Like a Local','French for Beginners','Complete Spanish Immersion','IELTS & TOEFL Prep','Essential German Grammar','JLPT N5 Fast Pass'][i%8],
    teacher: ['Marco Rossi','Elena Sokolov','Kenji Tanaka','Chloe Dubois','Javier Mendez','Sarah Wilson','Hans Mueller','Yumi Sato'][i%8],
    rating: (4.7 + (i%4)*0.1).toFixed(1),
    language: ['Italian','Russian','Japanese','French','Spanish','English','German','Japanese'][i%8],
    level: ['Advanced','Intermediate','Beginner'][i%8],
    price: [25,32,40,18,30,35,28,22][i%8],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLPK9PCyWnpPHFqAyv4i2vGIq2gR5w2A5yuA&s',
    description: [
      'Basics to fluent speaking with conversation practice and grammar integration prueba truncarrrrrrrrrrrrrrrrrrrrrrrrrr.',
      'Business-focused Russian grammar and cultural communication for professionals.',
      'Learn everyday Japanese: anime, culture and daily life expressions.',
      'Fast-track French for beginners with DELF A1 certification guidance.',
      'Neutral Spanish accent mastery through immersive lessons and feedback.',
      'Intensive exam preparation for IELTS and TOEFL with proven strategies.',
      'Grammar essentials for engineers and tech professionals.',
      'Targeted JLPT N5 preparation with mock tests and tips.'
    ][i%8],
    duration:[10,15,12,8,20,18,14,9][i%8]
  }));
}
