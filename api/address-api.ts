import api from "./config";
import { ENDPOINT } from "./endpoints";

type CreateAddress = {
  address: string;
  countryId: number;
  stateId: number;
  cityId: number;
  postalCode: string;
  customerId: number;
};

export const createAddress = async (body: CreateAddress) => {
  return await api.post(ENDPOINT.ADDRESS, body);
};

export const getCountries = async () => {
    return api.get(`${ENDPOINT.ADDRESS}/countries`);
}
