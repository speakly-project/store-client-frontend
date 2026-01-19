import { TeacherInterface } from './TeacherInterface';

export interface CourseInterface {
    id: number;
    title: string;
    description: string;
    price: number;
    language: string;
    level: string;
    teacherId: number;
    teacher: TeacherInterface;
    duration: number;
    createdAt: string;
}