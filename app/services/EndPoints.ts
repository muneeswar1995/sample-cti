const VERSION = {
    v1: "v1"
}

export const END_POINTS = {
    AUTH: {
        LOGIN: `${VERSION.v1}/auth/login`,
        USERS: `${VERSION.v1}/auth/users`,
        REGISTER: `${VERSION.v1}/auth/register`,
        ROLES: `${VERSION.v1}/auth/roles`,
    },

    LOCATIONS: {
        ADD_LOCATION: `${VERSION.v1}/locations/add_location`,
        GET_LOCATIONS: `${VERSION.v1}/locations/list_locations`,
    },

    TASKS: {
        GET_TASKS: `${VERSION.v1}/tasks/get_tasks`,
        GET_TASK_BY_ID: `${VERSION.v1}/tasks/get_task/`,
        ASSIGN_TASK: `${VERSION.v1}/tasks/assign_task`,
        CLOSE_TASK: `${VERSION.v1}/tasks/close_task`,
        CHANGE_TASK_STATUS: `${VERSION.v1}/tasks/change_task_status`
    },
    JOURNEY: {
        CREATE_JOURNEY: `${VERSION.v1}/journey/create_journey`,
        UPDATE_JOURNEY: `${VERSION.v1}/journey/update_journey/`,
        GET_USER_JOURNEYS: `${VERSION.v1}/journey/get_user_journeys`,
        GET_IN_PROGRESS_JOURNEY: `${VERSION.v1}/journey/in_progress_journey/`,
    },
    DASHBOARD: {
        GET_STATS: `${VERSION.v1}/dashboard/stats`,
    }
}