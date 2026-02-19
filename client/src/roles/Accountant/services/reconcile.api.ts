import api from "../../../lib/api";

export const reconcileApi = {
  getReconciliations: async () => {
    const response = await api.get("/reconcile");
    return response.data;
  },
  
  runReconciliation: async (data: { month: string; bankBalance: number; ledgerBalance: number; notes: string }) => {
    const response = await api.post("/reconcile", data);
    return response.data;
  }
};