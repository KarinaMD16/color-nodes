import { useMutation } from "@tanstack/react-query";
import { postCreateUser } from "../services/userService";

export function usePostCreateUser() {
    return useMutation({
        mutationFn: postCreateUser,
    })
};