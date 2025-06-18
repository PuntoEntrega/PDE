import axios from "axios";

export const getPDEList = async (userId: string) => {
  const response = await axios.get(`/api/pdes?user_id=${userId}`);
  return response.data;
};

export const getPDEById = async (id: string) => {
  const response = await axios.get(`/api/pdes/${id}/full-detail`);
  return response.data;
};

// v0 was here
export const updatePDEServices = async (pdeId: string, servicesData: any) => {
  const response = await axios.patch(`/api/pdes/${pdeId}/services`, servicesData)
  return response.data
}

export const updatePDESchedule = async (pdeId: string, scheduleData: any) => {
  const response = await axios.patch(`/api/pdes/${pdeId}/schedule`, scheduleData)
  return response.data
}

export const updatePDEContact = async (pdeId: string, contactData: any) => {
  const response = await axios.patch(`/api/pdes/${pdeId}/contact`, contactData)
  return response.data
}