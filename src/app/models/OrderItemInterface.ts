import { CourseInterface } from "./CourseInterface";

export interface OrderItemInterface {
    id: number;
    course: CourseInterface;
    quantity: number;
    price: number;
}