/**
 * TrackEd App Bootstrap — API integration patch
 * Loaded AFTER script.js and api.js.
 * Overrides doLogin / doLogout with API-backed versions,
 * then calls patchScriptWithAPI() to wire up all save/delete.
 */

// ── API-backed login ─────────────────────────────────────────────────────────
window.doLogin = async function() {
  const email    = document.getElementById("l-email").value.trim().toLowerCase();
  const password = document.getElementById("l-pass").value;
  const remember = document.getElementById("remember-me")?.checked === true;
  if (!email || !password.trim()) { toast("Email and password are required.", "error"); return; }

  let user;

  try {
    const data = await api.login(email, password, remember);
    user = data.user;

    user.grade = user.grade || null;
    user.section = user.section || null;
    user.childId = user.child_id || user.childId || null;
    user.teacherId = user.teacher_id || user.teacherId || null;

    STATE.currentUser = user;
    await syncStateFromAPI();
    await api.activate();
    console.log("[TrackEd] Logged in via Laravel API.");
  } catch (error) {
    toast(error.message || "TrackEd is currently unavailable.", "error");
    return;
  }

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
};

function lockAppOffline() {
  if (navigator.onLine !== false) return;
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
  document.getElementById("login-page").style.display =
    STATE.currentUser ? "none" : "grid";
  document.getElementById("app").style.display =
    STATE.currentUser ? "flex" : "none";
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
    email: document.getElementById("r-email")?.value.trim().toLowerCase(),
    password: document.getElementById("r-pass")?.value,
    phone: document.getElementById("r-phone")?.value.trim() || "",
    grade: document.getElementById("r-grade")?.value,
    section: document.getElementById("r-section")?.value.trim(),
  };
  if (!data.name || !data.email || !data.password.trim() || !data.grade || !data.section) {
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
window.doLogout = async function() {
  let logoutError;
  try {
    await api.logout();
  } catch (error) {
    logoutError = error;
  }
  STATE.currentUser = null;
  closeAllModals();
  document.getElementById("app").style.display = "none";
  document.getElementById("login-page").style.display = "grid";
  document.getElementById("l-email").value = "";
  document.getElementById("l-pass").value  = "";
  if (logoutError) {
    toast("Signed out on this device, but the server could not revoke the session.", "error");
  }
};

// ── Email-verified password reset ──────────────────────────────────────────────
window.submitForgotPassword = async function() {
  const modal = document.getElementById("forgot-modal");
  const email = document.getElementById("forgot-email")?.value.trim().toLowerCase();
  if (!email) {
    const input = document.getElementById("forgot-email");
    if (input) input.style.border = "1.5px solid #B52B2B";
    return;
  }
  try {
    await api.forgotPassword(email);
    modal.dataset.email = email;
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;width:100%;max-width:400px;padding:32px;box-shadow:0 32px 80px rgba(0,0,0,.25)">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:20px;font-weight:800;color:#18180E;margin-bottom:6px">Verify your email</div>
          <div style="font-size:13px;color:#5C5A52">Enter the code sent to your account email address.</div>
        </div>
        <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#5C5A52;margin-bottom:5px">Verification Code</label>
        <input id="reset-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code"
          style="width:100%;padding:11px 14px;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:14px">
        <button onclick="verifyPasswordResetCode()"
          style="width:100%;padding:13px;background:#2A76C9;color:#fff;border:none;border-radius:9px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px">
          Verify Code
        </button>
        <button onclick="document.getElementById('forgot-modal').remove()"
          style="width:100%;padding:11px;background:#F5F4F0;color:#5C5A52;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer">
          Cancel
        </button>
      </div>`;
    document.getElementById("reset-code")?.focus();
  } catch(err) {
    toast(err.message || "Could not send the verification code. Please try again.", "error");
  }
};

window.verifyPasswordResetCode = async function() {
  const modal = document.getElementById("forgot-modal");
  const email = modal?.dataset.email;
  const code = document.getElementById("reset-code")?.value.trim();
  if (!email || !/^\d{6}$/.test(code || "")) {
    toast("Enter the 6-digit verification code.", "error");
    return;
  }
  try {
    const result = await api.verifyPasswordResetCode(email, code);
    modal.dataset.resetToken = result.reset_token;
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;width:100%;max-width:400px;padding:32px;box-shadow:0 32px 80px rgba(0,0,0,.25)">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:20px;font-weight:800;color:#18180E;margin-bottom:6px">Choose a new password</div>
          <div style="font-size:13px;color:#5C5A52">Email verified. Use at least 8 characters.</div>
        </div>
        <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#5C5A52;margin-bottom:5px">New Password</label>
        <input id="reset-password" type="password" autocomplete="new-password" placeholder="At least 8 characters"
          style="width:100%;padding:11px 14px;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:12px">
        <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#5C5A52;margin-bottom:5px">Confirm New Password</label>
        <input id="reset-password-confirmation" type="password" autocomplete="new-password" placeholder="Re-enter new password"
          style="width:100%;padding:11px 14px;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:14px">
        <button onclick="completePasswordReset()"
          style="width:100%;padding:13px;background:#2A76C9;color:#fff;border:none;border-radius:9px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px">
          Change Password
        </button>
        <button onclick="document.getElementById('forgot-modal').remove()"
          style="width:100%;padding:11px;background:#F5F4F0;color:#5C5A52;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer">
          Cancel
        </button>
      </div>`;
    document.getElementById("reset-password")?.focus();
  } catch(error) {
    toast(error.message || "The code is invalid or expired. Request a new code.", "error");
  }
};

window.completePasswordReset = async function() {
  const modal = document.getElementById("forgot-modal");
  const password = document.getElementById("reset-password")?.value || "";
  const confirmation = document.getElementById("reset-password-confirmation")?.value || "";
  if (password.length < 8 || password !== confirmation) {
    toast(password.length < 8 ? "Use a password with at least 8 characters." : "The passwords do not match.", "error");
    return;
  }
  try {
    const result = await api.resetPassword(
      modal?.dataset.email,
      modal?.dataset.resetToken,
      password,
      confirmation
    );
    modal?.remove();
    toast(result.message || "Password changed. You can now sign in.", "success");
  } catch(error) {
    toast(error.message || "Could not change the password. Please try again.", "error");
  }
};

// ── Auto-login if a valid token exists ───────────────────────────────────────
(async function autoLogin() {
  try {
    if (!await checkOnlineAccess()) return;
    const token = await api.restoreToken();
    if (!token) return;

    const user = await api.getMe();
    user.childId  = user.child_id || user.childId || null;
    user.teacherId = user.teacher_id || user.teacherId || null;
    STATE.currentUser = user;

    await syncStateFromAPI();
    await api.activate();

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
    console.warn("[TrackEd] Could not restore the saved session:", e.message);
    if (e.status === 401) await api.setToken(null);
    toast(e.message || "Could not restore the saved session.", "error");
  } finally {
    document.body.classList.remove("session-restoring");
  }
})();

window._trackedApiApprovalEnabled = true;

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
