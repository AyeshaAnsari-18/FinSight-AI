import api from "../../../lib/api";

export const forecastApi = {
  
  getPredictions: async (force: boolean = false) => {
    const response = await api.get(`/forecast/predict?force=${force}`);
    return response.data;
  },
  getWhatIfs: async (force: boolean = false) => {
    const response = await api.get(`/forecast/what-if?force=${force}`);
    return response.data;
  }
};
