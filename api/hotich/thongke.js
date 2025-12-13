// /api/hotich/thongke.js

export default async function handler(req, res) {
  // ==== CORS ====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Token từ FE (forward y nguyên)
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // ===== Danh sách endpoints Moj + body POST =====
  const ENDPOINTS = {
    "Đăng ký khai sinh": {
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
    "Đăng ký khai tử": {
      url: "https://hotichdientu.moj.gov.vn/v1/death/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: { searchKey: "", registrationDate: [], bookNoId: null, isApprove: true },
    },
    "Đăng ký kết hôn": {
      url: "https://hotichdientu.moj.gov.vn/v1/marriage/search-approve-publish?page=0&size=10&sort=id,DESC",
      body: { searchKey: "", registrationDate: [], bookNoId: null, isApprove: true },
    },
    "XNTT Hôn nhân": {
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
    "Cấp bản sao trích lục": {
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
  };

  // Timeout helper (tránh treo request)
  const fetchWithTimeout = async (url, options, timeoutMs = 9000) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  };

  const fetchTotal = async (label, cfg) => {
    try {
      const r = await fetchWithTimeout(
        cfg.url,
        {
          method: "POST",
          headers: {
            Authorization: authHeader, // forward token từ FE
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cfg.body),
        },
        9000
      );

      const rawText = await r.text();

      // nếu 401 thì đánh dấu unauthorized
      if (r.status === 401) {
        return { label, ok: false, status: 401, total: 0 };
      }

      if (!r.ok) {
        return { label, ok: false, status: r.status, total: 0 };
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        return { label, ok: false, status: 502, total: 0 };
      }

      const total = Number(data?.result?.totalElements ?? 0);
      return { label, ok: true, status: 200, total };
    } catch {
      // network/timeout => coi như lỗi thường
      return { label, ok: false, status: 599, total: 0 };
    }
  };

  try {
    const entries = Object.entries(ENDPOINTS);

    // chạy song song
    const results = await Promise.all(entries.map(([label, cfg]) => fetchTotal(label, cfg)));

    const totals = {};
    let unauthorized = false;

    for (const r of results) {
      totals[r.label] = r.ok ? r.total : 0;
      if (!r.ok && r.status === 401) unauthorized = true;
    }

    return res.status(200).json({
      unauthorized,
      totals,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal error calling remote APIs",
      message: err?.message || String(err),
    });
  }
}
