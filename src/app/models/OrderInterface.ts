import { OrderItemInterface } from "./OrderItemInterface";

export interface OrderInterface {
    id: number;
    userId: number;
    orderStatus: string;
    orderItems: OrderItemInterface[];
    totalPrice: number;
    createdAt: string;
}