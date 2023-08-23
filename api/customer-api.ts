import api from "./config";
import { ENDPOINT } from "./endpoints";

export const getCustomers = async () => {
  return await api.get(ENDPOINT.CUSTOMER);
};

export const createCustomer = async (body: any) => {
  return await api.post(ENDPOINT.CUSTOMER, body);
};

export const checkCustomer = async (query: any) => {
  return await api.get(`${ENDPOINT.CUSTOMER}/check`, { params: query });
};
