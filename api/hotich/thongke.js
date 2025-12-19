// /api/hotich/thongke.js

export default async function handler(req, res) {
  // ==== CORS ====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Token từ FE (forward y nguyên)
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // ===== Danh sách endpoints Moj + method + body (nếu cần) =====
  const ENDPOINTS = {
    "Đăng ký khai sinh": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/birth/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        signStatus: null,
        numberNo: "",
        bookNoId: null,
        rpGender: null,
        rpBirthDate: "",
        spFullName: "",
        isApprove: true,
      },
    },

    "Đăng ký kết hôn": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/marriage/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: { searchKey: "", registrationDate: [], bookNoId: null, isApprove: true },
    },

    "Đăng ký khai tử": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/death/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: { searchKey: "", registrationDate: [], bookNoId: null, isApprove: true },
    },

    // ✅ CHỈ ENDPOINT NÀY DÙNG GET
    "Cấp bản sao trích lục": {
      method: "GET",
      url: "https://hotichdientu.moj.gov.vn/v1/copy-extract-civil?sort=copyExtractCivilId,DESC&size=10&isMakeDetail=1&isActive=1&personRegistryId=123359&searchKey=&bookNoId=&registrationDateFrom=&registrationDateTo=&managementOrgOriginalId=&bookNumberOriginal=&numberNoOriginal=&registrationOrgOriginalId=&isSearchES=&signStatus=0&listCountOfTab=-1,0,1,2,5,3,4,7,11,12,6",
    },

    "XNTT Hôn nhân": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/marital/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        signStatus: null,
        numberNo: "",
        bookNoId: null,
        rpGender: null,
        rpBirthDate: "",
        spFullName: "",
        lastUpdated: 1762446099275,
        isApprove: true,
      },
    },

    "Đăng ký giám hộ": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/guardianship/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        signStatus: null,
        guardianBirthDate: null,
        dependentBirthDate: null,
        spFullName: "",
        type: null,
        isApprove: true,
      },
    },

    "Đăng ký giám sát việc giám hộ": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/guardianship-supervision/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        signStatus: null,
        supervisorBirthDate: "",
        numberNo: "",
        type: null,
        isApprove: true,
      },
    },

    "Đăng ký nhận cha, mẹ, con": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/parent-child/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        signStatus: null,
        bookNoId: null,
        childBirthDate: "",
        parentBirthDate: "",
        spFullName: "",
        lastUpdated: 1762446648483,
        isApprove: true,
      },
    },

    "Đăng ký nhận con nuôi": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/child-adoption-registration/search?page=0&size=10&sort=id,DESC",
      body: { field: "CHO_PHE_DUYET" },
    },

    "Việc ly hôn, hủy việc kết hôn ở nước ngoài": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/foreign-divorce/cancel-marriage/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        signStatus: null,
        bookNoId: null,
        childBirthDate: "",
        parentBirthDate: "",
        spFullName: "",
        lastUpdated: 1762446648483,
        isApprove: true,
      },
    },

    "Cấp văn bản xác nhận thông tin hộ tịch": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/civil-confirmation/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        status: 5,
        signStatus: null,
        spIdentifyNo: "",
        numberNo: "",
        cfIdentifyNo: "",
        manageDepartment: "1003194",
        isApprove: true,
      },
    },

    "Đăng ký thay đổi/bổ sung/cải chính": {
      method: "POST",
      url: "https://hotichdientu.moj.gov.vn/v1/correction_civil/search-approve-publish?page=0&size=10&sort=objectId,DESC",
      body: {
        searchKey: "",
        registrationDate: [],
        manageDepartment: "1003194",
        statusList: [],
        signStatus: null,
        numberNo: null,
        bookNoId: null,
        spFullName: null,
        type: null,
        objectType: null,
        lastUpdated: 1765676723967,
        isApprove: true,
      },
    },
  };

  const fetchWithTimeout = async (url, options, timeoutMs = 9000) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  };

  const extractTotal = (data) => {
    // cố gắng “đỡ đạn” khác format response
    const candidates = [
      data?.result?.totalElements,
      data?.totalElements,
      data?.result?.total,
      data?.total,
      data?.result?.page?.totalElements,
    ];
    const v = candidates.find((x) => x !== undefined && x !== null);
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchTotal = async (label, cfg) => {
    try {
      const method = (cfg.method || "POST").toUpperCase();

      const headers = {
        Authorization: authHeader,
      };

      // Chỉ set content-type và body khi POST/PUT/PATCH...
      const options = { method, headers };

      if (method !== "GET") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(cfg.body ?? {});
      }

      const r = await fetchWithTimeout(cfg.url, options, 9000);
      const rawText = await r.text();

      if (r.status === 401) return { label, ok: false, status: 401, total: 0 };
      if (!r.ok) return { label, ok: false, status: r.status, total: 0 };

      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        return { label, ok: false, status: 502, total: 0 };
      }

      const total = extractTotal(data);
      return { label, ok: true, status: 200, total };
    } catch {
      return { label, ok: false, status: 599, total: 0 };
    }
  };

  try {
    const entries = Object.entries(ENDPOINTS);
    const results = await Promise.all(entries.map(([label, cfg]) => fetchTotal(label, cfg)));

    const totals = {};
    let unauthorized = false;

    for (const r of results) {
      totals[r.label] = r.ok ? r.total : 0;
      if (!r.ok && r.status === 401) unauthorized = true;
    }

    return res.status(200).json({ unauthorized, totals });
  } catch (err) {
    return res.status(500).json({
      error: "Internal error calling remote APIs",
      message: err?.message || String(err),
    });
  }
}
