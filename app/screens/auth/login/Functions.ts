import { END_POINTS } from "@/services/EndPoints"
import { post } from "@react-solutions/request"

export const useLogin = () => {
    return post(END_POINTS.AUTH.LOGIN, {
        onError(error) {
            console.log("error", error)
        },
        onSuccess(response) {
            console.log("Success", response)
        }
    })
}