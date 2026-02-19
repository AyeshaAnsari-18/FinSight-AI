import api from "../../../lib/api";

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number; 
  credit: number;
  status: "DRAFT" | "POSTED" | "FLAGGED" | "REJECTED"; 
  riskScore?: number;
  flagReason?: string;
}

export const accountantApi = {
  
  getJournals: async () => {
    const response = await api.get<JournalEntry[]>("/journals");
    return response.data;
  },

  
  createJournal: async (data: Omit<JournalEntry, "id" | "status" | "date">) => {
    const response = await api.post("/journals", {
      ...data,
      date: new Date().toISOString(), 
      status: "DRAFT"
    });
    return response.data;
  },

  
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/journals/${id}`, { status });
    return response.data;
  },

  
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/accountant');
    return response.data;
  }
};