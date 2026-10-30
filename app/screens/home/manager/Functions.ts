import { END_POINTS } from "@/services/EndPoints"
import { get, post } from "@react-solutions/request"

export const useGetUsers = () => {
    return get(END_POINTS.AUTH.USERS, {
        onSuccess(response) {
            console.log("Success", response)
        },
        onError(error) {
            console.log("error", error)
        },
    })
}

export const usePostRegisterUser = () => {
    return post(END_POINTS.AUTH.REGISTER, {
        onSuccess(response) {
            console.log("Register user success", response)
        },
        onError(error) {
            console.log("Register user error", error)
        },
    })
}

export const useGetRoles = () => {
    return get(END_POINTS.AUTH.ROLES, {
        onSuccess(response) {
            console.log("Roles success", response)
        },
        onError(error) {
            console.log("Roles error", error)
        },
    })
}

export const useGetTasks = () => {
    return get(END_POINTS.TASKS.GET_TASKS, {
        onSuccess(response) {
            console.log("Success", response)
        },
        onError(error) {
            console.log("error", error)
        },
    })
}

export const usePostAssignTask = () => {
    return post(END_POINTS.TASKS.ASSIGN_TASK, {
        onSuccess(response) {
            console.log("Success", response)
        },
        onError(error) {
            console.log("error", error)
        },
    })
}

export const usePostCloseTask = () => {
    return post(END_POINTS.TASKS.CLOSE_TASK, {
        onSuccess(response) {
            console.log("Success", response)
        },
        onError(error) {
            console.log("error", error)
        },
    })
}

export const useGetLocations = () => {
    return get(END_POINTS.LOCATIONS.GET_LOCATIONS, {
        onError(error) {
            console.log("error", error)
        },
        onSuccess(response) {
            console.log("Success", response)
        }
    })
}

export const usePostLocation = () => {
    return post(END_POINTS.LOCATIONS.ADD_LOCATION, {
        onError(error) {
            console.log("error", error)
        },
        onSuccess(response) {
            console.log("Success", response)
        }
    })
}

export const useGetUserJourneys = () => {
    return get(END_POINTS.JOURNEY.GET_USER_JOURNEYS, {
        onError(error) {
            console.log("error", error)
        },
        onSuccess(response) {
            console.log("Success", response)
        }
    })
}

export const useGetDashboardStats = () => {
    return get(END_POINTS.DASHBOARD.GET_STATS, {
        onError(error) {
            console.log("dashboard stats error", error)
        },
        onSuccess(response) {
            console.log("dashboard stats success", response)
        }
    })
}