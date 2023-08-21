import api from "./config";
import { ENDPOINT } from "./endpoints";

interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
}

export const login = async (username: string, password: string) => {
  return await api.post(ENDPOINT.LOGIN, {
    username,
    password,
  });
};

export const register = async (data: RegisterData) => {
  return await api.post(ENDPOINT.REGISTER, data);
};
