import api from "./axios";

// baseURL already includes /v1/api ✅
// so use only the path after that

export const getAdminStats = async () => {
    const { data: res } = await api.get("/admin/stats/overview");
    return (res?.success && res?.data) ? res.data : res;
};

export const getAdminLogs = async (limit = 20) => {
    const { data: res } = await api.get(`/admin/logs?limit=${limit}`);
    return (res?.success && res?.data) ? res.data : res;
};