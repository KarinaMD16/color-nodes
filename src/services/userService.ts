import { User } from "../models/user";
import colorNodesAPI from "../api/client";

export const postCreateUser = async (user: User) => {
    const response = await colorNodesAPI.post("/Room/Create", user);
    return response.data;
}