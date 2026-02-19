import api from "../../../lib/api";

export async function runFiscalAgentFrontend() {
  const response = await api.post("/fiscal/run-close");
  
  
  return response.data;
}
