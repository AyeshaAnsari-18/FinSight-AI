import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const ACCESS_TOKEN_KEY = "admin_test_access_token";
const REFRESH_TOKEN_KEY = "admin_test_refresh_token";

export type AdminTestCase = {
  id: string;
  label: string;
  method: string;
  path: string;
  role: string;
  ai: boolean;
};

export type AdminTestSuite = {
  id: string;
  label: string;
  description: string;
  includesAi: boolean;
  caseCount: number;
  cases: AdminTestCase[];
};

export type AdminTestReport = {
  id: string;
  title: string;
  status: string;
  mode: string;
  includeAi: boolean;
  summary: {
    suiteCount: number;
    caseCount: number;
    passed: number;
    failed: number;
    skipped: number;
    executedCaseCount?: number;
    includeAi: boolean;
    totalDurationMs: number;
    successRate: number;
    suiteLabels?: string[];
    aiCaseCount?: number;
    aiCaseSkipped?: number;
    suiteBreakdown?: Array<{
      suiteId: string;
      suiteLabel: string;
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      aiCases: number;
      averageDurationMs: number;
    }>;
  };
  results: Array<{
    id: string;
    suiteId: string;
    suiteLabel: string;
    label: string;
    method: string;
    path: string;
    role: string;
    ai: boolean;
    status: "passed" | "failed" | "skipped";
    durationMs: number;
    statusCode?: number;
    message: string;
    responsePreview?: string;
  }>;
  reportUrl: string;
  createdBy: string;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
};

export const getAdminTestSession = () => ({
  accessToken: sessionStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: sessionStorage.getItem(REFRESH_TOKEN_KEY),
});

export const clearAdminTestSession = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

const persistSession = (accessToken: string, refreshToken: string) => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const adminClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

adminClient.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as { _retry?: boolean } & typeof error.config;
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

    if (error.response?.status === 401 && refreshToken && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        persistSession(data.access_token, data.refresh_token);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return adminClient(originalRequest);
      } catch (refreshError) {
        clearAdminTestSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const adminTestLogin = async (username: string, password: string) => {
  const { data } = await adminClient.post<AdminLoginResponse>("/admin-test/login", {
    username,
    password,
  });

  persistSession(data.access_token, data.refresh_token);
  return data.user;
};

export const fetchAdminTestCatalog = async () => {
  const { data } = await adminClient.get<AdminTestSuite[]>("/admin-test/catalog");
  return data;
};

export const fetchAdminTestReports = async () => {
  const { data } = await adminClient.get<AdminTestReport[]>("/admin-test/reports");
  return data;
};

export const fetchAdminTestReport = async (id: string) => {
  const { data } = await adminClient.get<AdminTestReport>(`/admin-test/reports/${id}`);
  return data;
};

export const runAdminTestSuites = async (suiteIds: string[], includeAi: boolean) => {
  const { data } = await adminClient.post<AdminTestReport>("/admin-test/run", {
    suiteIds,
    includeAi,
  });
  return data;
};

const fetchReportBlob = async (id: string) => {
  const response = await adminClient.get<Blob>(`/admin-test/reports/${id}/download`, {
    responseType: "blob",
  });

  const fileName =
    response.headers["content-disposition"]
      ?.split("filename=")[1]
      ?.replaceAll('"', "")
      ?.trim() || `admin-test-${id}.pdf`;

  return {
    blobUrl: window.URL.createObjectURL(response.data),
    fileName,
  };
};

export const openAdminTestReportPdf = async (id: string) => {
  const { blobUrl } = await fetchReportBlob(id);
  const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    window.URL.revokeObjectURL(blobUrl);
    throw new Error("The browser blocked opening the PDF preview.");
  }

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 60_000);
};

export const downloadAdminTestReport = async (id: string) => {
  const { blobUrl, fileName } = await fetchReportBlob(id);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 60_000);
};
