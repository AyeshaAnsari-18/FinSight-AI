import api from "../../../lib/api";

export const narrativesApi = {
  getReports: async (search?: string) => {
    const response = await api.get("/narratives", {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  getInvoiceBlob: async (reportId: string) => {
    const response = await api.get(`/narratives/${reportId}/invoice`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  createReport: async (data: {
    title?: string;
    summary?: string;
    extractedText?: string;
    fileType?: string;
    fileUrl?: string;
    document?: File;
  }) => {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.summary) formData.append("summary", data.summary);
    if (data.extractedText) formData.append("extractedText", data.extractedText);
    if (data.fileType) formData.append("fileType", data.fileType);
    if (data.fileUrl) formData.append("fileUrl", data.fileUrl);
    if (data.document) formData.append("document", data.document);

    const response = await api.post("/narratives", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },
};
