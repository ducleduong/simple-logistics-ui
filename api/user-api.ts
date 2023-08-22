import api from "./config"
import { ENDPOINT } from "./endpoints"

export const getMe = async () => {
    return await api.get(ENDPOINT.ME);
}
