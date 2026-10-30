import { END_POINTS } from "@/services/EndPoints"
import { get, post, put } from "@react-solutions/request"

export const useCreateJourney = () => {
    return post(END_POINTS.JOURNEY.CREATE_JOURNEY)
}

export const useUpdateJourney = () => {
    return put(END_POINTS.JOURNEY.UPDATE_JOURNEY)
}

export const useGetInProgressJourney = () => {
    return get(END_POINTS.JOURNEY.GET_IN_PROGRESS_JOURNEY)
}

export const useGetUserJourneys = () => {
    return get(END_POINTS.JOURNEY.GET_USER_JOURNEYS)
}

export const useGetTasks = () => {
    return get(END_POINTS.TASKS.GET_TASKS)
}

export const useGetTaskById = () => {
    return get(END_POINTS.TASKS.GET_TASK_BY_ID)
}

export const useChangeTaskStatus = () => {
    return post(END_POINTS.TASKS.CHANGE_TASK_STATUS)
}

export const usePostAssignTask = () => {
    return post(END_POINTS.TASKS.ASSIGN_TASK)
}

export const useGetLocations = () => {
    return get(END_POINTS.LOCATIONS.GET_LOCATIONS)
}

export const useGetDashboardStats = () => {
    return get(END_POINTS.DASHBOARD.GET_STATS)
}