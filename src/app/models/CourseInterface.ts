import { TeacherInterface } from './TeacherInterface';
import { UserInterface } from './UserInterface';

export interface CourseInterface {
    id: number;
    title: string;
    description: string;
    price: number;
    language: string;
    level: string;
    teacher: UserInterface;
    duration: number;
    createdAt: string;
}