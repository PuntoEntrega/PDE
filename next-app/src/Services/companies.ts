import axios from "axios"

export async function getCompaniesByUserId(userId: string) {
    const response = await axios.get(`/api/companies/by-user?user_id=${userId}`)
    return response.data
}
