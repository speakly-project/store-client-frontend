import { TeacherInterface } from './TeacherInterface';

export interface CourseInterface {
    id: number;
    title: string;
    description: string;
    price: number;
    language: string;
    level: string;
    teacher: TeacherInterface;
    duration: number;
    createdAt: string;
}