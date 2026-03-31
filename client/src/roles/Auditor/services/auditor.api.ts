import api from "../../../lib/api";

export const getAuditorDashboard = async () => {
  const response = await api.get('/auditor/dashboard');
  return response.data;
};

export const getAuditorCompliance = async () => {
  const response = await api.get('/auditor/compliance');
  return response.data;
};

export const getAuditorDepartmentOverview = async () => {
  const response = await api.get('/auditor/department-overview');
  return response.data;
};

export const getAuditTrail = async () => {
  const response = await api.get('/audit-trail');
  return response.data;
};

export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const getJournals = async () => {
  const response = await api.get('/journals');
  return response.data;
};

export const getReconciliations = async () => {
  const response = await api.get('/reconcile');
  return response.data;
};
