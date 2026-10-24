/**
 * TrackEd App Bootstrap — API integration patch
 * Loaded AFTER script.js and api.js.
 * Overrides doLogin / doLogout with API-backed versions,
 * then calls patchScriptWithAPI() to wire up all save/delete.
 */

// ── API-backed login ─────────────────────────────────────────────────────────
window.doLogin = async function() {
  const email    = document.getElementById("l-email").value.trim();
  const password = document.getElementById("l-pass").value.trim();
  if (!email || !password) { toast("Email and password are required.", "error"); return; }

  const btn = document.querySelector(".login-cta");
  if (btn) { btn.textContent = "Signing in…"; btn.disabled = true; }

  let user = null;

  try {
    // ── Try the backend API first ──────────────────────────────────────────
    const data = await api.login(email, password);
    user = data.user;

    // Map API user fields → STATE.currentUser shape expected by script.js
    user.role     = user.role;
    user.id       = user.id;
    user.grade    = user.grade || null;
    user.section  = user.section || null;
    user.childId  = user.child_id || user.childId || null;
    user.teacherId = user.teacher_id || user.teacherId || null;

    // Sync entire state from the API
    STATE.currentUser = user;
    await syncStateFromAPI();
    console.log("[TrackEd] Logged in via API ✓");

  } catch (apiErr) {
    const localUser = Object.values(STATE.users).find(candidate =>
      candidate.email === email && candidate.password === password
    );
    if (!localUser) {
      if (btn) { btn.textContent = "Sign In to TrackEd"; btn.disabled = false; }
      toast(apiErr.message || "TrackEd is currently unavailable.", "error");
      return;
    }
    user = { ...localUser };
    STATE.currentUser = user;
  }

  if (btn) { btn.textContent = "Sign In to TrackEd"; btn.disabled = false; }

  // ── Boot the app UI ───────────────────────────────────────────────────────
  document.getElementById("login-page").style.display = "none";
  document.getElementById("app").style.display = "flex";

  setTopbarAvatar(user);
  document.getElementById("tb-name").textContent = user.name;
  document.getElementById("tb-role").textContent =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);

  buildSidebar(user.role);
  updateUnreadBadge();

  // Apply API patches so all future saves/deletes hit the backend
  patchScriptWithAPI();

  nav("dashboard");
};

function lockAppOffline() {
  api.logout();
  STATE.currentUser = null;
  document.body.classList.remove("online-ready");
  document.getElementById("app").style.display = "none";
  document.getElementById("login-page").style.display = "none";
  document.getElementById("offline-gate").classList.add("visible");
}

async function checkOnlineAccess() {
  const available = navigator.onLine !== false;
  const gate = document.getElementById("offline-gate");
  if (!available) {
    gate.classList.add("visible");
    return false;
  }
  gate.classList.remove("visible");
  document.body.classList.add("online-ready");
  document.getElementById("login-page").style.display = "grid";
  return true;
}

window.checkOnlineAccess = checkOnlineAccess;
window.addEventListener("offline", lockAppOffline);
window.addEventListener("online", checkOnlineAccess);
checkOnlineAccess();
setInterval(async () => {
  if (document.getElementById("app").style.display === "flex" && navigator.onLine === false) {
    lockAppOffline();
  }
}, 60000);

window.doRegisterTeacher = async function() {
  const data = {
    name: document.getElementById("r-name")?.value.trim(),
    email: document.getElementById("r-email")?.value.trim(),
    password: document.getElementById("r-pass")?.value.trim(),
    phone: document.getElementById("r-phone")?.value.trim() || "",
    grade: document.getElementById("r-grade")?.value,
    section: document.getElementById("r-section")?.value.trim(),
  };
  if (!data.name || !data.email || !data.password || !data.grade || !data.section) {
    toast("Please fill all required fields.", "error");
    return;
  }
  try {
    const result = await api.registerTeacher(data);
    toast(result.message || "Registration submitted.");
    showLoginTab("login");
  } catch (err) {
    toast(err.message || "Registration failed.", "error");
  }
};

// ── API-backed logout ────────────────────────────────────────────────────────
window.doLogout = function() {
  api.logout();
  STATE.currentUser = null;
  closeAllModals();
  document.getElementById("app").style.display = "none";
  document.getElementById("login-page").style.display = "grid";
  document.getElementById("l-email").value = "";
  document.getElementById("l-pass").value  = "";
};

// ── API-backed forgot password ────────────────────────────────────────────────
window.submitForgotPassword = async function() {
  const email = document.getElementById("fp-email")?.value.trim();
  if (!email) {
    const inp = document.getElementById("fp-email");
    if (inp) inp.style.border = "1.5px solid #B52B2B";
    return;
  }
  document.getElementById("forgot-overlay")?.remove();

  const tc = document.getElementById("toast-container") || (() => {
    const el = document.createElement("div");
    el.id = "toast-container";
    el.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px";
    document.body.appendChild(el);
    return el;
  })();

  try {
    const data = await api.forgotPassword(email);
    const t = document.createElement("div");
    t.className = "toast toast-success";
    t.textContent = `✓ ${data.message || "Reset link sent to " + email}`;
    tc.appendChild(t); setTimeout(() => t.remove(), 3200);
  } catch(err) {
    const t = document.createElement("div");
    t.className = "toast toast-error";
    t.textContent = `✕ ${err.message || "No account found for " + email}`;
    tc.appendChild(t); setTimeout(() => t.remove(), 3200);
  }
};

// ── Auto-login if a valid token exists ───────────────────────────────────────
(async function autoLogin() {
  if (!await checkOnlineAccess()) return;
  const token = api.getToken();
  if (!token) return;

  try {
    const user = await api.getMe();
    user.childId  = user.child_id || user.childId || null;
    user.teacherId = user.teacher_id || user.teacherId || null;
    STATE.currentUser = user;

    await syncStateFromAPI();

    document.getElementById("login-page").style.display = "none";
    document.getElementById("app").style.display = "flex";

    setTopbarAvatar(user);
    document.getElementById("tb-name").textContent = user.name;
    document.getElementById("tb-role").textContent =
      user.role.charAt(0).toUpperCase() + user.role.slice(1);

    buildSidebar(user.role);
    updateUnreadBadge();
    patchScriptWithAPI();
    nav("dashboard");
    console.log("[TrackEd] Auto-login from saved token ✓");
  } catch (e) {
    console.warn("[TrackEd] Saved token invalid, clearing:", e.message);
    api.logout();
  }
})();

const originalApproveTeacher = window.approveTeacher;
window.approveTeacher = async function(id) {
  try {
    const result = await api.approveTeacher(id);
    const pending = STATE.pendingTeachers?.find(t => t.id === id);
    if (pending) pending.status = "approved";
    toast(result.message || "Teacher approved.");
    nav("approvals");
  } catch (err) {
    toast(err.message || "Approval failed.", "error");
  }
};

const originalRejectTeacher = window.rejectTeacher;
window.rejectTeacher = function(id, name) {
  showConfirm("Reject Application", `Reject application from <strong>${name}</strong>?`, async () => {
    try {
      const result = await api.rejectTeacher(id);
      const pending = STATE.pendingTeachers?.find(t => t.id === id);
      if (pending) pending.status = "rejected";
      toast(result.message || "Application rejected.", "error");
      nav("approvals");
    } catch (err) {
      toast(err.message || "Rejection failed.", "error");
    }
  });
};
