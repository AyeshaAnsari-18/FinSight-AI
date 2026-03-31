import api from "../../../lib/api";

export const getComplianceMonitoring = async () => {
  const response = await api.get('/compliance/monitoring');
  return response.data;
};

export const getComplianceControls = async () => {
  const response = await api.get('/compliance/controls');
  return response.data;
};

export const getCompliancePolicies = async () => {
  const response = await api.get('/compliance/policies');
  return response.data;
};

export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const updateTask = async (id: string, payload: any) => {
  const response = await api.patch(`/tasks/${id}`, payload);
  return response.data;
};

export const getJournals = async () => {
  const response = await api.get('/journals');
  return response.data;
};
