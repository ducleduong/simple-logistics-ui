import api from "./config";
import { ENDPOINT } from "./endpoints";

export const getOrders = () => {
  return api.get(ENDPOINT.ORDERS);
};

export const deleteOrders = (orderId: number) => {
  return api.delete(`${ENDPOINT.ORDERS}/${orderId}`);
};

export const createOrder = (body: any) => {
  return api.post(ENDPOINT.ORDERS, body);
};
