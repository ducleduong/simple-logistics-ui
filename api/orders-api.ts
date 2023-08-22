import api from "./config";
import { ENDPOINT } from "./endpoints";

export const getOrders = () => {
  return api.get(ENDPOINT.ORDERS);
};

export const deleteOrders = (orderId: number) => {
  return api.delete(`${ENDPOINT.ORDERS}/${orderId}`);
};
