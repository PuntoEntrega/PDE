

import axios from "axios";

export const getPDEList = async (userId: string) => {
  const response = await axios.get(`/api/pdes?user_id=${userId}`);
  return response.data;
};

export const getPDEById = async (id: string) => {
  const response = await axios.get(`/api/pdes/${id}/full-detail`);
  return response.data;
};

