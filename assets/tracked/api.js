/**
 * TrackEd API Client
 * All communication with the Flask REST backend goes through this module.
 * Falls back gracefully if the backend is offline (uses STATE data).
 */

const API_BASE = "http://localhost:5000/api";

let _token = localStorage.getItem("sg_token") || null;

// ── Core fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw { status: resp.status, message: data.error || "Request failed" };
  return data;
}

const api = {
  // ── Token ─────────────────────────────────────────────────────────────────
  setToken(t) {
    _token = t;
    if (t) localStorage.setItem("sg_token", t);
    else    localStorage.removeItem("sg_token");
  },
  getToken() { return _token; },

  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(email, password) {
    const data = await apiFetch("/auth/login", { method: "POST", body: { email, password } });
    api.setToken(data.token);
    return data; // { token, user }
  },
  logout() { api.setToken(null); },

  async forgotPassword(email) {
    return apiFetch("/auth/forgot-password", { method: "POST", body: { email } });
  },

  // ── Me ────────────────────────────────────────────────────────────────────
  getMe()         { return apiFetch("/me"); },
  updateMe(data)  { return apiFetch("/me", { method: "PATCH", body: data }); },

  // ── Students ──────────────────────────────────────────────────────────────
  getStudents()       { return apiFetch("/students"); },
  addStudent(data)    { return apiFetch("/students",       { method: "POST", body: data }); },
  updateStudent(id,d) { return apiFetch(`/students/${id}`, { method: "PUT",  body: d    }); },
  deleteStudent(id)   { return apiFetch(`/students/${id}`, { method: "DELETE"           }); },

  // ── Teachers ──────────────────────────────────────────────────────────────
  getTeachers()       { return apiFetch("/teachers"); },
  addTeacher(data)    { return apiFetch("/teachers",       { method: "POST", body: data }); },
  updateTeacher(id,d) { return apiFetch(`/teachers/${id}`, { method: "PUT",  body: d    }); },
  deleteTeacher(id)   { return apiFetch(`/teachers/${id}`, { method: "DELETE"           }); },

  // ── Parents ───────────────────────────────────────────────────────────────
  getParents()       { return apiFetch("/parents"); },
  addParent(data)    { return apiFetch("/parents",       { method: "POST", body: data }); },
  updateParent(id,d) { return apiFetch(`/parents/${id}`, { method: "PUT",  body: d    }); },
  deleteParent(id)   { return apiFetch(`/parents/${id}`, { method: "DELETE"           }); },

  // ── Classes ───────────────────────────────────────────────────────────────
  getClasses()       { return apiFetch("/classes"); },
  addClass(data)     { return apiFetch("/classes",       { method: "POST", body: data }); },
  updateClass(id,d)  { return apiFetch(`/classes/${id}`, { method: "PUT",  body: d    }); },
  deleteClass(id)    { return apiFetch(`/classes/${id}`, { method: "DELETE"           }); },

  // ── Grades ────────────────────────────────────────────────────────────────
  getGrades()                  { return apiFetch("/grades"); },
  updateGrade(sid,sub,scores)  { return apiFetch(`/grades/${sid}/${sub}`, { method:"PUT", body:{q1:scores[0],q2:scores[1],q3:scores[2],q4:scores[3]} }); },
  bulkUpdateGrades(data)       { return apiFetch("/grades/bulk", { method:"PUT", body: data }); },

  // ── Attendance ────────────────────────────────────────────────────────────
  getAttendance()          { return apiFetch("/attendance"); },
  markAttendance(date, records) { return apiFetch("/attendance/mark", { method:"POST", body:{ date, records } }); },

  // ── Messages ──────────────────────────────────────────────────────────────
  getMessages()       { return apiFetch("/messages"); },
  sendMessage(data)   { return apiFetch("/messages", { method:"POST", body: data }); },
  markRead(id)        { return apiFetch(`/messages/${id}/read`, { method:"PATCH" }); },

  // ── Announcements ─────────────────────────────────────────────────────────
  getAnnouncements()      { return apiFetch("/announcements"); },
  addAnnouncement(data)   { return apiFetch("/announcements",       { method:"POST", body: data }); },
  updateAnnouncement(id,d){ return apiFetch(`/announcements/${id}`, { method:"PUT",  body: d    }); },
  deleteAnnouncement(id)  { return apiFetch(`/announcements/${id}`, { method:"DELETE"           }); },

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications()       { return apiFetch("/notifications"); },
  markNotificationsRead()  { return apiFetch("/notifications/mark-read", { method:"POST" }); },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard() { return apiFetch("/dashboard"); },
};

// ── Sync STATE from API ──────────────────────────────────────────────────────
// Called once after login; populates STATE so existing render functions work.

async function syncStateFromAPI() {
  try {
    const [students, teachers, parents, classes, grades, attendance, messages, announcements, notifications] =
      await Promise.all([
        api.getStudents().catch(() => null),
        api.getTeachers().catch(() => null),
        api.getParents().catch(() => null),
        api.getClasses().catch(() => null),
        api.getGrades().catch(() => null),
        api.getAttendance().catch(() => null),
        api.getMessages().catch(() => null),
        api.getAnnouncements().catch(() => null),
        api.getNotifications().catch(() => null),
      ]);

    if (students)      STATE.students      = _mapStudents(students);
    if (teachers)      STATE.teachers      = _mapTeachers(teachers);
    if (parents)       STATE.parents       = _mapParents(parents);
    if (classes)       STATE.classes       = _mapClasses(classes);
    if (grades)        STATE.grades        = grades;
    if (attendance)    STATE.attendance    = attendance;
    if (messages)      STATE.messages      = _mapMessages(messages);
    if (announcements) STATE.announcements = _mapAnnouncements(announcements);
    if (notifications) STATE.notifications = _mapNotifications(notifications);

    console.log("[TrackEd] STATE synced from API ✓");
  } catch (err) {
    console.warn("[TrackEd] API sync failed — using local STATE data:", err);
  }
}

// ── Field mappers (DB snake_case → frontend camelCase) ─────────────────────

function _mapStudents(rows) {
  return rows.map(s => ({
    id: s.id, name: s.name, grade: s.grade, section: s.section,
    gender: s.gender, parent: s.parent_name || s.parent || "",
    parentEmail: s.parent_email || s.parentEmail || "",
    parentId: s.parent_id || s.parentId || "",
    contact: s.contact, status: s.status, enrolled: s.enrolled,
  }));
}

function _mapTeachers(rows) {
  return rows.map(t => ({
    id: t.id, name: t.name, email: t.email, phone: t.phone,
    grade: t.grade, section: t.section, subjects: t.subjects,
    status: t.status, joined: t.joined,
  }));
}

function _mapParents(rows) {
  return rows.map(p => ({
    id: p.id, name: p.name, email: p.email, phone: p.phone,
    children: p.children || [],
  }));
}

function _mapClasses(rows) {
  return rows.map(c => ({
    id: c.id, grade: c.grade, section: c.section,
    teacherId: c.teacher_id || c.teacherId, year: c.year,
  }));
}

function _mapMessages(rows) {
  return rows.map(m => ({
    id: m.id,
    fromRole: m.fromRole || m.from_role,
    fromId:   m.fromId   || m.from_id,
    fromName: m.fromName || m.from_name,
    toRole:   m.toRole   || m.to_role,
    toId:     m.toId     || m.to_id,
    subject:  m.subject,
    body:     m.body,
    date:     m.date,
    time:     m.time,
    read:     m.read,
    studentId: m.studentId || m.student_id,
    thread:   m.thread || m.thread_id,
  }));
}

function _mapAnnouncements(rows) {
  return rows.map(a => ({
    id: a.id, title: a.title, body: a.body, date: a.date,
    audience: a.audience, author: a.author,
    priority: a.priority, authorRole: a.author_role || a.authorRole,
  }));
}

function _mapNotifications(rows) {
  return rows.map(n => ({
    id: n.id, title: n.title, body: n.body,
    time: n.time, type: n.type, read: Boolean(n.read),
  }));
}

// ── API-backed overrides for STATE mutations ─────────────────────────────────
// These patch the save/delete functions used by script.js so they call the API
// AND update STATE in-place (keeping the UI reactive without a page reload).

function patchScriptWithAPI() {

  // ── Students ──────────────────────────────────────────────────────────────
  window._orig_saveStudent = window.saveStudent;
  window.saveStudent = async function() {
    const fn  = document.getElementById("sf-fn")?.value.trim();
    const ln  = document.getElementById("sf-ln")?.value.trim();
    const gr  = document.getElementById("sf-gr")?.value;
    const sec = document.getElementById("sf-sec")?.value.trim();
    const gen = document.getElementById("sf-gen")?.value;
    const st  = document.getElementById("sf-st")?.value;
    const par = document.getElementById("sf-par")?.value.trim();
    const pe  = document.getElementById("sf-pe")?.value.trim();
    const con = document.getElementById("sf-con")?.value.trim();
    if (!fn || !ln || !sec || !par || !con) { toast("Please fill all required fields.", "error"); return; }
    try {
      const s = await api.addStudent({ name:`${fn} ${ln}`, grade:gr, section:sec, gender:gen,
        status:st, parent:par, parentEmail:pe||"", contact:con });
      STATE.students.push(_mapStudents([s])[0]);
      closeModal();
      toast(`Student "${fn} ${ln}" added!`);
      if (typeof window.refreshStudentRows === "function") window.refreshStudentRows();
      else if (STATE.activeNav === "dashboard") nav("dashboard");
    } catch(e) { toast(e.message || "Failed to add student", "error"); }
  };

  window._orig_updateStudent = window.updateStudent;
  window.updateStudent = async function(id) {
    const fn = document.getElementById("ef-fn")?.value.trim();
    const ln = document.getElementById("ef-ln")?.value.trim();
    if (!fn || !ln) { toast("Name is required.", "error"); return; }
    const payload = {
      name:`${fn} ${ln}`,
      grade: document.getElementById("ef-gr")?.value,
      section: document.getElementById("ef-sec")?.value.trim(),
      gender: document.getElementById("ef-gen")?.value,
      status: document.getElementById("ef-st")?.value,
      parent: document.getElementById("ef-par")?.value.trim(),
      parentEmail: document.getElementById("ef-pe")?.value.trim(),
      contact: document.getElementById("ef-con")?.value.trim(),
    };
    try {
      const updated = await api.updateStudent(id, payload);
      const idx = STATE.students.findIndex(s => s.id === id);
      if (idx >= 0) STATE.students[idx] = _mapStudents([updated])[0];
      closeModal(); toast("Student updated!");
      if (STATE.activeNav === "students") nav("students");
    } catch(e) { toast(e.message || "Update failed", "error"); }
  };

  window._orig_deleteStudent = window.deleteStudent;
  window.deleteStudent = function(id, name) {
    showConfirm("Delete Student", `Remove <strong>${name}</strong>? This cannot be undone.`, async () => {
      try {
        await api.deleteStudent(id);
        const idx = STATE.students.findIndex(s => s.id === id);
        if (idx >= 0) STATE.students.splice(idx, 1);
        toast(`${name} removed.`);
        nav("students");
      } catch(e) { toast(e.message || "Delete failed", "error"); }
    });
  };

  // ── Teachers ──────────────────────────────────────────────────────────────
  window._orig_saveTeacher = window.saveTeacher;
  window.saveTeacher = async function() {
    const ti  = document.getElementById("tf-ti")?.value;
    const fn  = document.getElementById("tf-fn")?.value.trim();
    const ln  = document.getElementById("tf-ln")?.value.trim();
    const em  = document.getElementById("tf-em")?.value.trim();
    const ph  = document.getElementById("tf-ph")?.value.trim();
    const gr  = document.getElementById("tf-gr")?.value;
    const sec = document.getElementById("tf-sec")?.value.trim();
    if (!fn || !ln || !em || !sec) { toast("Please fill all required fields.", "error"); return; }
    try {
      const t = await api.addTeacher({ name:`${ti} ${fn} ${ln}`, email:em, phone:ph||"", grade:gr, section:sec });
      STATE.teachers.push(_mapTeachers([t])[0]);
      closeModal(); toast(`Teacher "${ti} ${fn} ${ln}" added!`);
      if (typeof window.refreshTeacherRows === "function") window.refreshTeacherRows();
      else nav("teachers");
    } catch(e) { toast(e.message || "Failed to add teacher", "error"); }
  };

  window._orig_updateTeacher = window.updateTeacher;
  window.updateTeacher = async function(id) {
    const payload = {
      name:    document.getElementById("etf-nm")?.value.trim(),
      email:   document.getElementById("etf-em")?.value.trim(),
      phone:   document.getElementById("etf-ph")?.value.trim(),
      grade:   document.getElementById("etf-gr")?.value,
      section: document.getElementById("etf-sec")?.value.trim(),
      status:  document.getElementById("etf-st")?.value,
    };
    try {
      const updated = await api.updateTeacher(id, payload);
      const idx = STATE.teachers.findIndex(t => t.id === id);
      if (idx >= 0) STATE.teachers[idx] = _mapTeachers([updated])[0];
      closeModal(); toast("Teacher updated!");
      if (typeof window.refreshTeacherRows === "function") window.refreshTeacherRows();
      else nav("teachers");
    } catch(e) { toast(e.message || "Update failed", "error"); }
  };

  window._orig_deleteTeacher = window.deleteTeacher;
  window.deleteTeacher = function(id, name) {
    showConfirm("Remove Teacher", `Remove <strong>${name}</strong>?`, async () => {
      try {
        await api.deleteTeacher(id);
        const idx = STATE.teachers.findIndex(t => t.id === id);
        if (idx >= 0) STATE.teachers.splice(idx, 1);
        toast(`${name} removed.`);
        if (typeof window.refreshTeacherRows === "function") window.refreshTeacherRows();
        else nav("teachers");
      } catch(e) { toast(e.message || "Delete failed", "error"); }
    });
  };

  // ── Parents ───────────────────────────────────────────────────────────────
  window._orig_saveParent = window.saveParent;
  window.saveParent = async function() {
    const name  = document.getElementById("pf-name")?.value.trim();
    const email = document.getElementById("pf-email")?.value.trim();
    const phone = document.getElementById("pf-phone")?.value.trim();
    const child = document.getElementById("pf-child")?.value;
    if (!name || !email) { toast("Name and email are required.", "error"); return; }
    try {
      const p = await api.addParent({ name, email, phone:phone||"—", childId:child||null });
      STATE.parents.push(_mapParents([p])[0]);
      closeModal(); toast(`Parent ${name} added.`);
      if (typeof window.refreshParentRows === "function") window.refreshParentRows();
      else nav("parents");
    } catch(e) { toast(e.message || "Failed to add parent", "error"); }
  };

  window._orig_updateParent = window.updateParent;
  window.updateParent = async function(id) {
    const payload = {
      name:  document.getElementById("epf-name")?.value.trim(),
      email: document.getElementById("epf-email")?.value.trim(),
      phone: document.getElementById("epf-phone")?.value.trim(),
    };
    try {
      const updated = await api.updateParent(id, payload);
      const idx = STATE.parents.findIndex(p => p.id === id);
      if (idx >= 0) STATE.parents[idx] = _mapParents([updated])[0];
      closeModal(); toast("Parent updated.");
      if (typeof window.refreshParentRows === "function") window.refreshParentRows();
      else nav("parents");
    } catch(e) { toast(e.message || "Update failed", "error"); }
  };

  window._orig_deleteParent = window.deleteParent;
  window.deleteParent = function(id, name) {
    showConfirm("Delete Parent", `Remove <strong>${name}</strong>?`, async () => {
      try {
        await api.deleteParent(id);
        const idx = STATE.parents.findIndex(p => p.id === id);
        if (idx >= 0) STATE.parents.splice(idx, 1);
        toast(`${name} deleted.`);
        if (typeof window.refreshParentRows === "function") window.refreshParentRows();
        else nav("parents");
      } catch(e) { toast(e.message || "Delete failed", "error"); }
    });
  };

  // ── Classes ───────────────────────────────────────────────────────────────
  window._orig_saveClass = window.saveClass;
  window.saveClass = async function() {
    const gr  = document.getElementById("clf-gr")?.value;
    const sec = document.getElementById("clf-sec")?.value.trim();
    const tid = document.getElementById("clf-t")?.value;
    const yr  = document.getElementById("clf-yr")?.value.trim() || "2024-2025";
    if (!sec) { toast("Section name is required.", "error"); return; }
    try {
      const c = await api.addClass({ grade:gr, section:sec, teacherId:tid||null, year:yr });
      STATE.classes.push(_mapClasses([c])[0]);
      closeModal(); toast("Class added!"); nav("classes");
    } catch(e) { toast(e.message || "Failed to add class", "error"); }
  };

  window._orig_updateClass = window.updateClass;
  window.updateClass = async function(id) {
    const payload = {
      teacherId: document.getElementById("eclf-t")?.value || null,
      year:      document.getElementById("eclf-yr")?.value.trim(),
    };
    try {
      const updated = await api.updateClass(id, payload);
      const idx = STATE.classes.findIndex(c => c.id === id);
      if (idx >= 0) STATE.classes[idx] = _mapClasses([updated])[0];
      closeModal(); toast("Class updated!"); nav("classes");
    } catch(e) { toast(e.message || "Update failed", "error"); }
  };

  window._orig_deleteClass = window.deleteClass;
  window.deleteClass = function(id, name) {
    showConfirm("Delete Class", `Remove class <strong>${name}</strong>?`, async () => {
      try {
        await api.deleteClass(id);
        const idx = STATE.classes.findIndex(c => c.id === id);
        if (idx >= 0) STATE.classes.splice(idx, 1);
        toast(`${name} deleted.`); nav("classes");
      } catch(e) { toast(e.message || "Delete failed", "error"); }
    });
  };

  // ── Announcements ─────────────────────────────────────────────────────────
  window._orig_saveAnnouncement = window.saveAnnouncement;
  window.saveAnnouncement = async function() {
    const ti = document.getElementById("an-ti")?.value.trim();
    const bo = document.getElementById("an-bo")?.value.trim();
    const au = document.getElementById("an-au")?.value;
    const pr = document.getElementById("an-pr")?.value;
    if (!ti || !bo) { toast("Title and message are required.", "error"); return; }
    try {
      const a = await api.addAnnouncement({ title:ti, body:bo, audience:au, priority:pr, author:STATE.currentUser.name });
      STATE.announcements.unshift(_mapAnnouncements([a])[0]);
      closeModal(); toast("Announcement posted!"); nav("announcements");
    } catch(e) { toast(e.message || "Failed to post", "error"); }
  };

  window._orig_updateAnnouncement = window.updateAnnouncement;
  window.updateAnnouncement = async function(id) {
    const payload = {
      title:    document.getElementById("ean-ti")?.value.trim(),
      body:     document.getElementById("ean-bo")?.value.trim(),
      audience: document.getElementById("ean-au")?.value,
      priority: document.getElementById("ean-pr")?.value,
    };
    try {
      const updated = await api.updateAnnouncement(id, payload);
      const idx = STATE.announcements.findIndex(a => a.id === id);
      if (idx >= 0) STATE.announcements[idx] = _mapAnnouncements([updated])[0];
      closeModal(); toast("Announcement updated!"); nav("announcements");
    } catch(e) { toast(e.message || "Update failed", "error"); }
  };

  window._orig_deleteAnnouncement = window.deleteAnnouncement;
  window.deleteAnnouncement = function(id, title) {
    showConfirm("Delete Announcement", `Remove "<strong>${title}</strong>"?`, async () => {
      try {
        await api.deleteAnnouncement(id);
        const idx = STATE.announcements.findIndex(a => a.id === id);
        if (idx >= 0) STATE.announcements.splice(idx, 1);
        toast("Announcement deleted."); nav("announcements");
      } catch(e) { toast(e.message || "Delete failed", "error"); }
    });
  };

  // ── Grades save ───────────────────────────────────────────────────────────
  window._orig_saveGrades = window.saveGrades;
  window.saveGrades = async function() {
    try {
      await api.bulkUpdateGrades(STATE.grades);
      toast("Grades saved to server! ✓");
    } catch(e) {
      toast("Saved locally (API offline).", "info");
    }
  };

  // ── Attendance save ───────────────────────────────────────────────────────
  window._orig_saveAttendance = window.saveAttendance;
  // Patched inline in pgAttendance since it uses a closure — API call added there

  // ── Messages: send ────────────────────────────────────────────────────────
  window._orig_sendCompose = window.sendCompose;
  window.sendCompose = async function() {
    const u      = STATE.currentUser;
    const toVal  = document.getElementById("cm-to")?.value;
    const sub    = document.getElementById("cm-sub")?.value.trim();
    const body   = document.getElementById("cm-body")?.value.trim();
    const sid    = document.getElementById("cm-sid")?.value || null;
    if (!toVal)       { toast("Please select a recipient.", "error"); return; }
    if (!sub || !body){ toast("Subject and message are required.", "error"); return; }
    const [toRole, toId] = toVal.split("|");
    const payload = {
      fromName: u.name, toRole: toRole||"teacher", toId: toId||"teacher",
      subject: sub, body, studentId: sid, thread: null,
    };
    try {
      const res = await api.sendMessage(payload);
      STATE.messages.unshift({
        id: res.id, fromRole: u.role, fromId: u.id, fromName: u.name,
        toRole, toId, subject: sub, body,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit"}),
        read: false, studentId: sid, thread: null,
      });
      updateUnreadBadge(); buildSidebar(u.role);
      closeModal(); toast("Message sent!"); nav("messages");
    } catch(e) { toast(e.message || "Send failed", "error"); }
  };

  // ── Profile save ──────────────────────────────────────────────────────────
  window._orig_saveProfile = window.saveProfile;
  window.saveProfile = async function() {
    const u     = STATE.currentUser;
    const name  = document.getElementById("pf-name")?.value.trim();
    const email = document.getElementById("pf-email")?.value.trim();
    if (!name || !email) { toast("Name and email are required.", "error"); return; }
    const payload = { name, email };
    if (window._profilePic !== undefined) payload.avatar = window._profilePic || null;
    if (u.role === "admin") payload.school = document.getElementById("pf-school")?.value.trim() || u.school;
    if (u.role !== "admin") {
      const phone = document.getElementById("pf-phone")?.value.trim();
      if (!phone) { toast("Phone is required.", "error"); return; }
      if (!/^\d{11}$/.test(phone)) { toast("Phone must be 11 digits.", "error"); return; }
      payload.phone = phone;
    }
    try {
      const updated = await api.updateMe(payload);
      Object.assign(STATE.currentUser, updated);
      setTopbarAvatar(STATE.currentUser);
      document.getElementById("tb-name").textContent = STATE.currentUser.name;
      toast("Profile updated! ✓");
    } catch(e) {
      // Fallback: update locally
      Object.assign(STATE.currentUser, payload);
      setTopbarAvatar(STATE.currentUser);
      document.getElementById("tb-name").textContent = STATE.currentUser.name;
      toast("Profile updated (local).");
    }
  };

  console.log("[TrackEd] API patches applied ✓");
}
