/* NEW: optional EmailJS integration for failing-grade alert emails (safe no-op if not loaded) */
if (typeof emailjs !== 'undefined') {
  try { emailjs.init({ publicKey: 'V2d1p81KvRc5qfwyZ' }); } catch(e) {}
}

function wireFormLabels(root = document) {
  root.querySelectorAll('label:not([for])').forEach(label => {
    const control = label.parentElement?.querySelector('input, select, textarea');
    if (!control) return;
    if (!control.id) control.id = `field-${Math.random().toString(36).slice(2, 10)}`;
    label.htmlFor = control.id;
  });
}

wireFormLabels();
new MutationObserver(mutations => mutations.forEach(mutation => {
  mutation.addedNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) wireFormLabels(node);
  });
})).observe(document.body, { childList: true, subtree: true });

/* ════════════════════════════════════════
   STATE — reactive data store
   ════════════════════════════════════════ */
const STATE = {
  currentUser: null,
  activeNav: '',

  students: [
    {id:'S001',name:'Maria Reyes',grade:'Grade 1',section:'Sampaguita',gender:'F',parent:'Mrs. Liza Reyes',parentEmail:'parent@gmail.com',parentId:'P001',contact:'09171234567',status:'active',enrolled:'2024-06-01'},
    {id:'S002',name:'Juan Gomez',grade:'Grade 1',section:'Sampaguita',gender:'M',parent:'Mr. Carlos Gomez',parentEmail:'cgomez@gmail.com',parentId:'P002',contact:'09182345678',status:'active',enrolled:'2024-06-01'},
    {id:'S003',name:'Jose Dela Cruz Jr.',grade:'Grade 1',section:'Sampaguita',gender:'M',parent:'Mr. Juan Dela Cruz',parentEmail:'parent@gmail.com',parentId:'P003',contact:'09193456789',status:'active',enrolled:'2024-06-01'},
    {id:'S004',name:'Ana Santos',grade:'Grade 2',section:'Rosal',gender:'F',parent:'Mrs. Rosa Santos',parentEmail:'rsantos@gmail.com',parentId:'P004',contact:'09204567890',status:'active',enrolled:'2024-06-01'},
    {id:'S005',name:'Pedro Lim',grade:'Grade 2',section:'Rosal',gender:'M',parent:'Ms. Aileen Lim',parentEmail:'alim@gmail.com',parentId:'P005',contact:'09215678901',status:'active',enrolled:'2024-06-01'},
    {id:'S006',name:'Sofia Torres',grade:'Grade 2',section:'Rosal',gender:'F',parent:'Mr. Bobby Torres',parentEmail:'btorres@gmail.com',parentId:'P006',contact:'09226789012',status:'active',enrolled:'2024-06-01'},
    {id:'S007',name:'Carlo Ramos',grade:'Grade 3',section:'Gumamela',gender:'M',parent:'Mrs. Nena Ramos',parentEmail:'nramos@gmail.com',parentId:'P007',contact:'09237890123',status:'active',enrolled:'2024-06-01'},
    {id:'S008',name:'Lisa Tan',grade:'Grade 3',section:'Gumamela',gender:'F',parent:'Mr. Anthony Tan',parentEmail:'atan@gmail.com',parentId:'P008',contact:'09248901234',status:'active',enrolled:'2024-06-01'},
    {id:'S009',name:'Marco Cruz',grade:'Grade 3',section:'Gumamela',gender:'M',parent:'Mrs. Paz Cruz',parentEmail:'pcruz@gmail.com',parentId:'P009',contact:'09259012345',status:'active',enrolled:'2024-06-01'},
    {id:'S010',name:'Nina Bautista',grade:'Grade 3',section:'Gumamela',gender:'F',parent:'Mr. Leo Bautista',parentEmail:'lbautista@gmail.com',parentId:'P010',contact:'09260123456',status:'active',enrolled:'2024-06-01'},
  ],

  teachers: [
    {id:'T001',name:'Ms. Maria Santos',email:'teacher@tracked.edu',phone:'09171111111',grade:'Grade 1',section:'Sampaguita',subjects:'All Subjects',status:'active',joined:'2020-06-01'},
    {id:'T002',name:'Mr. Pedro Reyes',email:'preyes@tracked.edu',phone:'09182222222',grade:'Grade 2',section:'Rosal',subjects:'All Subjects',status:'active',joined:'2019-06-01'},
    {id:'T003',name:'Ms. Carmen Lim',email:'clim@tracked.edu',phone:'09193333333',grade:'Grade 3',section:'Gumamela',subjects:'All Subjects',status:'active',joined:'2021-06-01'},
  ],

  parents: [
    {id:'P001',name:'Mrs. Liza Reyes',email:'parent@gmail.com',phone:'09171234567',children:['S001']},
    {id:'P002',name:'Mr. Carlos Gomez',email:'cgomez@gmail.com',phone:'09182345678',children:['S002']},
    {id:'P003',name:'Mr. Juan Dela Cruz',email:'parent@gmail.com',phone:'09193456789',children:['S003']},
    {id:'P004',name:'Mrs. Rosa Santos',email:'rsantos@gmail.com',phone:'09204567890',children:['S004']},
    {id:'P005',name:'Ms. Aileen Lim',email:'alim@gmail.com',phone:'09215678901',children:['S005']},
    {id:'P006',name:'Mr. Bobby Torres',email:'btorres@gmail.com',phone:'09226789012',children:['S006']},
    {id:'P007',name:'Mrs. Nena Ramos',email:'nramos@gmail.com',phone:'09237890123',children:['S007']},
    {id:'P008',name:'Mr. Anthony Tan',email:'atan@gmail.com',phone:'09248901234',children:['S008']},
    {id:'P009',name:'Mrs. Paz Cruz',email:'pcruz@gmail.com',phone:'09259012345',children:['S009']},
    {id:'P010',name:'Mr. Leo Bautista',email:'lbautista@gmail.com',phone:'09260123456',children:['S010']},
  ],

  notifications: [
    {id:1,title:'Q4 grade submission due',body:'All teachers must complete grade entry by Friday afternoon.',time:'2h ago',type:'high',read:false},
    {id:2,title:'New parent message received',body:'A parent has sent a new message about student progress.',time:'5h ago',type:'normal',read:false},
    {id:3,title:'School news posted',body:'New announcements are now available for all users.',time:'1d ago',type:'normal',read:false},
  ],

  grades: {
    S001:{math:[88,92,85,90],science:[90,87,93,91],english:[85,88,82,87],filipino:[92,94,90,93],ap:[88,85,89,87]},
    S002:{math:[78,82,80,84],science:[82,79,85,81],english:[76,79,78,80],filipino:[80,82,78,83],ap:[77,75,80,78]},
    S003:{makabansa:[91,93,90,94],math:[95,97,93,96],gmrc:[88,90,89,92],reading_literacy:[90,93,88,92],language:[85,87,84,88]},
    S004:{math:[82,85,80,84],science:[79,81,78,82],english:[88,90,86,89],filipino:[86,88,84,87],ap:[83,85,82,86]},
    S005:{math:[78,80,76,82],science:[79,78,81,80],english:[77,76,79,78],filipino:[75,77,78,80],ap:[76,78,79,77]},
    S006:{math:[90,93,88,92],science:[85,87,83,89],english:[88,91,86,90],filipino:[92,94,90,93],ap:[87,89,85,91]},
    S007:{math:[78,80,75,82],science:[84,86,81,85],english:[76,79,77,80],filipino:[82,84,80,85],ap:[79,81,77,83]},
    S008:{math:[78,80,76,81],science:[78,79,80,77],english:[76,78,79,77],filipino:[77,79,78,80],ap:[76,78,79,77]},
    S009:{math:[86,88,84,89],science:[80,82,78,83],english:[84,86,82,87],filipino:[88,90,86,91],ap:[82,84,80,85]},
    S010:{math:[91,93,89,94],science:[87,89,85,90],english:[89,91,87,92],filipino:[93,95,91,96],ap:[85,87,83,88]},
  },

  attendance: {
    S001:{present:42,absent:2,late:1,total:45},
    S002:{present:40,absent:3,late:2,total:45},
    S003:{present:44,absent:1,late:0,total:45},
    S004:{present:41,absent:2,late:2,total:45},
    S005:{present:38,absent:5,late:2,total:45},
    S006:{present:43,absent:1,late:1,total:45},
    S007:{present:39,absent:4,late:2,total:45},
    S008:{present:35,absent:7,late:3,total:45},
    S009:{present:42,absent:2,late:1,total:45},
    S010:{present:44,absent:1,late:0,total:45},
  },

  messages: [
    {id:1,fromRole:'parent',fromId:'P003',fromName:'Mr. Juan Dela Cruz',toRole:'teacher',toId:'teacher',subject:'Concern about Math performance',body:'Good day Ma\'am Santos. I would like to ask about my son Jose Jr.\'s performance in Math this quarter. He seems to be struggling with basic addition at home. Can we schedule a parent-teacher meeting this week? Thank you.',date:'2025-01-20',time:'09:30 AM',read:false,studentId:'S003',thread:null},
    {id:2,fromRole:'teacher',fromId:'teacher',fromName:'Ms. Maria Santos',toRole:'parent',toId:'P003',subject:'Re: Concern about Math performance',body:'Good day Mr. Dela Cruz! Thank you for reaching out. Jose Jr. is actually doing exceptionally well — he currently holds the highest Math score in Grade 1 at 95 this quarter! I would be happy to meet on Friday at 3:00 PM. Please confirm your availability.',date:'2025-01-21',time:'10:15 AM',read:true,studentId:'S003',thread:1},
    {id:3,fromRole:'admin',fromId:'admin',fromName:'Principal Roberto Cruz',toRole:'teacher',toId:'teacher',subject:'Q3 Grade Submission Reminder',body:'Dear Teachers, This is a reminder that Q3 grades must be submitted by January 31, 2025, 5:00 PM. Please ensure all student records are accurate and complete. Thank you.',date:'2025-01-22',time:'08:00 AM',read:false,studentId:null,thread:null},
    {id:4,fromRole:'parent',fromId:'P004',fromName:'Mrs. Rosa Santos',toRole:'teacher',toId:'teacher',subject:'Scholarship Application – Progress Report Needed',body:'Good morning Ma\'am! We are applying for a scholarship for Ana and we need an updated official progress report. Could you please prepare this at your earliest convenience? We need it by January 28. Thank you very much!',date:'2025-01-24',time:'07:45 AM',read:false,studentId:'S004',thread:null},
    {id:5,fromRole:'teacher',fromId:'teacher',fromName:'Ms. Maria Santos',toRole:'parent',toId:'P005',subject:'Attendance Alert: Pedro Lim',body:'Dear Ms. Aileen Lim, I hope this message finds you well. I am writing to inform you that Pedro has been absent 5 times this month, which may affect his quarterly grades. Please let me know if there are any issues we can address together.',date:'2025-01-23',time:'02:00 PM',read:true,studentId:'S005',thread:null},
  ],

  announcements: [
    {id:2,title:'Parent-Teacher Conference – February 5, 2025',body:'The quarterly Parent-Teacher Conference is scheduled on Wednesday, February 5, 2025 from 8:00 AM to 12:00 NN. All parents of Grade 1, 2, and 3 students are strongly encouraged to attend. Please sign up at the front office or contact your child\'s teacher to confirm your schedule.',date:'2025-01-24',audience:'all',author:'Principal Cruz',priority:'high',authorRole:'admin'},
    {id:3,title:'Reading Program – Grade 1 and 2',body:'All Grade 1 and 2 homeroom teachers must submit their students\' reading assessment results by January 30, 2025. Please use the approved format from the English Department. Submit results to Ms. Reyes at the Academic Office.',date:'2025-01-23',audience:'teacher',author:'Principal Cruz',priority:'normal',authorRole:'admin'},
    {id:4,title:'No Classes – February 25 (EDSA People Power Anniversary)',body:'There will be no classes on Tuesday, February 25, 2025 in observance of the EDSA People Power Revolution Anniversary, a national holiday. Regular classes will resume on Wednesday, February 26, 2025.',date:'2025-01-22',audience:'all',author:'Admin Office',priority:'normal',authorRole:'admin'},
  ],

  assignments: [],

  classes: [
    {id:'C001',grade:'Grade 1',section:'Sampaguita',teacherId:'T001',year:'2024-2025'},
    {id:'C002',grade:'Grade 2',section:'Rosal',teacherId:'T002',year:'2024-2025'},
    {id:'C003',grade:'Grade 3',section:'Gumamela',teacherId:'T003',year:'2024-2025'},
  ],

  users: {
    teacher:{role:'teacher',id:'teacher',name:'Ms. Maria Santos',email:'teacher@tracked.edu',password:'password123',grade:'Grade 1',section:'Sampaguita',teacherId:'T001'},
    teacher2:{role:'teacher',id:'T002',name:'Mr. Pedro Reyes',email:'preyes@tracked.edu',password:'password123',grade:'Grade 2',section:'Rosal',teacherId:'T002'},
    teacher3:{role:'teacher',id:'T003',name:'Ms. Carmen Lim',email:'clim@tracked.edu',password:'password123',grade:'Grade 3',section:'Gumamela',teacherId:'T003'},
    parent:{role:'parent',id:'P003',name:'Mr. Juan Dela Cruz',email:'parent@gmail.com',password:'password123',childIds:['S003'],childId:'S003'},
    parent2:{role:'parent',id:'P004',name:'Mrs. Rosa Santos',email:'rsantos@gmail.com',password:'password123',childIds:['S004'],childId:'S004'},
    parent3:{role:'parent',id:'P005',name:'Ms. Aileen Lim',email:'alim@gmail.com',password:'password123',childIds:['S005'],childId:'S005'},
    parent4:{role:'parent',id:'P006',name:'Mr. Bobby Torres',email:'btorres@gmail.com',password:'password123',childIds:['S006'],childId:'S006'},
    parent5:{role:'parent',id:'P007',name:'Mrs. Nena Ramos',email:'nramos@gmail.com',password:'password123',childIds:['S007'],childId:'S007'},
    parent6:{role:'parent',id:'P008',name:'Mr. Anthony Tan',email:'atan@gmail.com',password:'password123',childIds:['S008'],childId:'S008'},
    parent7:{role:'parent',id:'P009',name:'Mrs. Paz Cruz',email:'pcruz@gmail.com',password:'password123',childIds:['S009'],childId:'S009'},
    parent8:{role:'parent',id:'P010',name:'Mr. Leo Bautista',email:'lbautista@gmail.com',password:'password123',childIds:['S010'],childId:'S010'},
    admin:{role:'admin',id:'admin',name:'Principal Roberto Cruz',email:'admin@tracked.edu',password:'password123',school:'Polangui South Central School'},
  },

  subjectSets: {
    'Grade 1': ['makabansa','math','gmrc','reading_literacy','language'],
    'Grade 2': ['science','math','english','filipino','gmrc','ap','writing'],
    'Grade 3': ['science','math','english','filipino','gmrc','ap','mapeh'],
  },
  get subjects(){ return subjectsForCurrentUser(); },
  subjectLabels: {math:'Mathematics',science:'Science',english:'English',filipino:'Filipino',gmrc:'GMRC',ap:'Araling Panlipunan',writing:'Writing',mapeh:'MAPEH',makabansa:'Makabansa',reading_literacy:'Reading and Literacy',language:'Language'},
  quarters: ['Q1','Q2','Q3','Q4','Final'],
  nextStudentId: 11,
  nextTeacherId: 4,
  nextMsgId: 6,
  nextAnnId: 5,

  /* NEW: teacher self-registration queue awaiting admin approval */
  pendingTeachers: [],
  /* NEW: archived message thread partner ids */
  archivedMessages: [],
  /* NEW: per-day attendance records — attendanceDays[studentId][isoDate] = 'Present'|'Absent'|'Late' */
  attendanceDays: {},
  /* NEW: id counter for parents created by teachers */
  nextParentId: 11,
};

function subjectsForCurrentUser(){
  const user = STATE.currentUser;
  if(user?.role === 'admin') return [...new Set(Object.values(STATE.subjectSets).flat())];
  let grade = user?.grade;
  if(user?.role === 'parent') grade = STATE.students.find(s=>s.id===user.childId)?.grade;
  if(grade && STATE.subjectSets[grade]) return STATE.subjectSets[grade];
  return [];
}

window.openLegal = function(kind){
  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms and Conditions';
  const buttonLabel = isPrivacy ? 'Close' : 'I Agree';
  const content = isPrivacy ? `
    <p class="legal-intro">We want you to know exactly how TrackEd uses your information. This policy explains what we collect, why we use it, and how we protect school records.</p>
    <div class="legal-accordion">
      <details open><summary>What information do we collect about you?</summary><div class="legal-answer">We collect account details, names, contact information, role and grade assignments, student identifiers, grades, attendance, messages, announcements, and profile changes needed to operate the school system.</div></details>
      <details><summary>How do we use your information?</summary><div class="legal-answer">We use it to sign you in, show the correct role-based dashboard, manage classes and grades, record attendance, send school messages, and notify authorized parents or teachers about academic updates.</div></details>
      <details><summary>To whom do we disclose your information?</summary><div class="legal-answer">Information is shown only to authorized users according to their account role and school relationship. We do not sell student information.</div></details>
      <details><summary>What do we do to keep information secure?</summary><div class="legal-answer">The app uses authenticated access and role-based permissions. Keep your password private, sign out on shared devices, and report suspicious access to the school administrator.</div></details>
      <details><summary>Cookies, storage, and tracking</summary><div class="legal-answer">TrackEd does not use advertising or analytics trackers. It uses functional browser or WebView storage for sessions and remembered login details.</div></details>
    </div>
  ` : `
    <p class="legal-intro">To use TrackEd, please read and accept these Terms and Conditions.</p>
    <div class="legal-scroll-copy">
      <p><strong>Authorized use</strong></p>
      <p>Use this app only for legitimate school activities and only for records you are authorized to view or change. Do not access, share, alter, delete, scrape, or attempt to bypass access controls for another user's information.</p>
      <p><strong>Account responsibilities</strong></p>
      <p>Keep your login credentials private, use a suitable password, sign out on shared devices, and report suspected unauthorized access. You are responsible for the accuracy of information you submit.</p>
      <p><strong>Confidential school information</strong></p>
      <p>Student records, grades, attendance, messages, and contact details are confidential. Share them only with authorized recipients and use TrackEd messaging for relevant school communication.</p>
      <p><strong>Service limits</strong></p>
      <p>TrackEd is provided for the current school workflow. The school operator may add rules about retention, contacts, and account access.</p>
    </div>
  `;
  const modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="modal legal-modal"><div class="modal-header"><div class="modal-title">${title}</div><button class="modal-close" type="button" aria-label="Close ${title}" onclick="this.closest('.modal-bg').remove()">✕</button></div><div class="modal-body legal-body">${content}</div><div class="modal-footer"><button class="btn btn-primary" type="button" onclick="this.closest('.modal-bg').remove()">${buttonLabel}</button></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').focus();
};

/* ════════════════════════════════════════
   SIDEBAR — SLIDE FROM LEFT
   ════════════════════════════════════════ */
let _sidebarOpen = false;
let _dragStartX = 0;
let _dragCurrentX = 0;
let _isDragging = false;
let _sidebarOverlay = null;

function toggleSidebar(){
  _sidebarOpen ? closeSidebar() : openSidebar();
}

function openSidebar(){
  const sidebar = document.getElementById('sidebar');
  if(!sidebar) return;
  _sidebarOpen = true;

  if(!_sidebarOverlay){
    _sidebarOverlay = document.createElement('div');
    _sidebarOverlay.className = 'sidebar-overlay';
    _sidebarOverlay.id = 'sidebar-overlay';
    _sidebarOverlay.addEventListener('click', closeSidebar);
    document.body.appendChild(_sidebarOverlay);
  }

  requestAnimationFrame(()=>{
    sidebar.classList.add('open');
    _sidebarOverlay.classList.add('visible');
    document.body.classList.add('sidebar-open');
  });
}

function closeSidebar(){
  const sidebar = document.getElementById('sidebar');
  if(!sidebar) return;
  _sidebarOpen = false;

  sidebar.classList.remove('open');
  sidebar.style.transform = '';

  if(_sidebarOverlay){
    _sidebarOverlay.classList.remove('visible');
  }
  document.body.classList.remove('sidebar-open');

  setTimeout(()=>{
    if(_sidebarOverlay && !_sidebarOpen){
      _sidebarOverlay.remove();
      _sidebarOverlay = null;
    }
  }, 380);
}

/* ═══ SWIPE LEFT TO CLOSE SIDEBAR ═══ */
document.addEventListener('DOMContentLoaded', function(){

  // Remember Me: prefill the last remembered email, if any
  try {
    const rememberedEmail = localStorage.getItem('sg_remembered_email');
    if (rememberedEmail) {
      const emailInput = document.getElementById('l-email');
      const rememberBox = document.getElementById('remember-me');
      if (emailInput) emailInput.value = rememberedEmail;
      if (rememberBox) rememberBox.checked = true;
    }
  } catch(e) {}

  document.addEventListener('touchstart', function(e){
    _dragStartX = e.touches[0].clientX;
    _dragCurrentX = _dragStartX;

    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;

    if(_sidebarOpen && sidebar.contains(e.target)){
      _isDragging = true;
      sidebar.style.transition = 'none';
    }

    if(!_sidebarOpen && _dragStartX < 20){
      _isDragging = true;
      if(sidebar) sidebar.style.transition = 'none';
    }

  }, { passive: true });

  document.addEventListener('touchmove', function(e){
    if(!_isDragging) return;
    _dragCurrentX = e.touches[0].clientX;
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;

    const diff = _dragCurrentX - _dragStartX;

    if(_sidebarOpen){
      if(diff < 0){
        sidebar.style.transform = `translateX(${diff}px)`;
        if(_sidebarOverlay){
          const opacity = Math.max(0, 0.5 + diff / 500);
          _sidebarOverlay.style.opacity = opacity;
        }
      }
    } else {
      if(diff > 0){
        const pct = Math.min(diff, 260);
        sidebar.style.visibility = 'visible';
        sidebar.style.transform = `translateX(calc(-100% + ${pct}px))`;
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', function(){
    if(!_isDragging) return;
    _isDragging = false;

    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;

    const diff = _dragCurrentX - _dragStartX;
    sidebar.style.transition = 'transform .35s cubic-bezier(.32,.72,0,1)';

    if(_sidebarOpen){
      if(diff < -80){
        closeSidebar();
      } else {
        sidebar.style.transform = 'translateX(0)';
        if(_sidebarOverlay) _sidebarOverlay.style.opacity = '';
      }
    } else {
      if(diff > 80){
        openSidebar();
      } else {
        sidebar.style.transform = '';
        sidebar.style.visibility = 'hidden';
      }
    }
  }, { passive: true });

});
/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
const normalizeGradeValue = value => {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : 0;
};
const avg = a => {
  if (!Array.isArray(a) || !a.length) return 0;
  const values = a.map(normalizeGradeValue).filter(v => Number.isFinite(v) && v > 0);
  return values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
};
const validGrades = arr => Array.isArray(arr) ? arr.map(normalizeGradeValue).filter(v => Number.isFinite(v) && v > 0) : [];
const safeAverage = arr => {
  const valid = validGrades(arr);
  return valid.length ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length) : null;
};
const averageScores = scores => {
  const valid = scores.map(normalizeGradeValue).filter(score => score > 0);
  return valid.length ? Math.round(valid.reduce((sum, score) => sum + score, 0) / valid.length) : null;
};
const overallAvg = (grades, subjects = STATE.subjects) => {
  const scores = subjects.map(subject => safeAverage(grades?.[subject])).filter(score => score !== null);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
};
const ini = n => n.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const glabel = n => {
  const value = normalizeGradeValue(n);
  return value >= 90 ? 'Outstanding' : value >= 85 ? 'Very Satisfactory' : value >= 80 ? 'Satisfactory' : value >= 75 ? 'Fairly Satisfactory' : 'Did Not Meet';
};
const grade1Scale = [
  {letter:'A',value:95,name:'Advancing (Namumukod-tangi)',description:'Consistently demonstrates advanced skills, understanding, and values beyond expectations; applies learning independently, confidently, and with initiative across tasks and situations.'},
  {letter:'B',value:85,name:'Benchmarking (Naipamamalas)',description:'Demonstrates expected skills, understanding, and values at grade level with consistency; performs tasks accurately and independently in most situations.'},
  {letter:'C',value:75,name:'Connecting (Natutungo)',description:'Shows developing skills, understanding, and values; able to apply learning in familiar tasks with minimal guidance and support.'},
  {letter:'D',value:65,name:'Developing (Nagpapaunlad)',description:'Demonstrates emerging skills, understanding, and values; requires regular guidance, practice, and support to improve performance.'},
  {letter:'E',value:55,name:'Emerging (Nagsisimula)',description:'Beginning to demonstrate basic skills, understanding, and values; requires close supervision, structured support, and targeted intervention.'},
];
const gradeDisplay = (student, score) => {
  const value = normalizeGradeValue(score);
  if (value <= 0) return '—';
  if (student?.grade !== 'Grade 1') return value;
  return grade1Scale.reduce((closest, level) => Math.abs(level.value - value) < Math.abs(closest.value - value) ? level : closest).letter;
};
const grade1Descriptor = score => grade1Scale.find(level=>level.letter===score);
const gbadge = n => n>=90?'bg-green':n>=80?'bg-blue':n>=75?'bg-amber':'bg-red';
const gcol = n => n>=90?'var(--green)':n>=80?'var(--blue)':n>=75?'var(--amber)':'var(--red)';
const gradeColor = (student, score) => {
  if (normalizeGradeValue(score) <= 0) return 'var(--text3)';
  if (student?.grade !== 'Grade 1') return gcol(score);
  const level = grade1Scale.find(item => item.letter === gradeDisplay(student, score));
  return gcol(level?.value ?? score);
};
const svgIco = {
  home:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  people:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  person:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  grade:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
  cal:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`,
  msg:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
  bell:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  chart:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
  school:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
  trophy:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zm-2 3.5c0 1.93-1.57 3.5-3.5 3.5S10 10.43 10 8.5V5h7v3.5z"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`,
};

function toast(msg, type='success'){
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = (type==='success'?'✓':type==='error'?'✕':'ℹ') + ` ${msg}`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

function showConfirm(title, msg, onYes){
  const ov = document.createElement('div');
  ov.className = 'confirm-overlay';
  ov.innerHTML = `<div class="confirm-box">
    <div class="confirm-icon">⚠️</div>
    <div class="confirm-title">${title}</div>
    <div class="confirm-msg">${msg}</div>
    <div class="confirm-btns">
      <button class="btn btn-secondary" onclick="this.closest('.confirm-overlay').remove()">Cancel</button>
      <button class="btn btn-danger" id="confirm-yes">Yes, Confirm</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('#confirm-yes').onclick = ()=>{ ov.remove(); onYes(); };
}

let _modalStack = [];
function openModal(html, onClose){
  const ov = document.createElement('div');
  ov.className = 'modal-bg';
  ov.innerHTML = `<div class="modal">${html}</div>`;
  ov.onclick = e => { if(e.target===ov){ closeModal(); if(onClose) onClose(); } };
  document.body.appendChild(ov);
  _modalStack.push(ov);
  return ov;
}
function closeModal(){
  const m = _modalStack.pop();
  if(m) m.remove();
}
function closeAllModals(){ while(_modalStack.length) _modalStack.pop().remove(); }

function getNotificationCount(){
  return STATE.notifications.filter(n=>!n.read).length;
}
function markNotificationsRead(){
  STATE.notifications.forEach(n=>n.read=true);
}
function updateUnreadBadge(){
  const u = STATE.currentUser;
  if(!u) return;
  const unreadCount = STATE.messages.filter(m=>!m.read && (m.toRole===u.role||m.toRole==='all') && (m.toId===u.id||m.toId==='all')).length;
  const msgBad = document.getElementById('msg-badge');
  if(msgBad){ msgBad.style.display = unreadCount>0?'flex':'none'; msgBad.textContent = unreadCount || '';} 
  const notifCount = getNotificationCount();
  const notifBad = document.getElementById('notif-badge');
  if(notifBad){ notifBad.style.display = notifCount>0?'flex':'none'; notifBad.textContent = notifCount || ''; }
}

function setTopbarAvatar(user){
  const av = document.getElementById('tb-av');
  av.style.backgroundImage = '';
  av.style.backgroundSize = '';
  av.style.backgroundPosition = '';
  av.style.color = user.role==='admin'?'var(--blue)':user.role==='parent'?'var(--amber)':'var(--green)';
  av.style.backgroundColor = user.role==='admin'?'var(--blue-l)':user.role==='parent'?'var(--amber-l)':'var(--green-l)';
  if(user.avatar){
    av.style.backgroundImage = `url("${user.avatar}")`;
    av.style.backgroundSize = 'cover';
    av.style.backgroundPosition = 'center';
    av.style.color = '#fff';
    av.textContent = '';
  } else {
    av.textContent = ini(user.name);
  }
}

function openNotifications(){
  toggleNotifications();
}

function notificationTarget(notification){
  const text = `${notification.title} ${notification.body}`.toLowerCase();
  if(text.includes('grade') || text.includes('academic')) return 'grades';
  if(text.includes('message')) return 'messages';
  if(text.includes('news') || text.includes('announcement')) return 'announcements';
  return 'announcements';
}

function openNotification(index){
  const notification = STATE.notifications[index];
  if(!notification) return;
  notification.read = true;
  updateUnreadBadge();
  document.getElementById('notif-dropdown')?.remove();
  document.removeEventListener('click', hideNotificationDropdown);
  nav(notificationTarget(notification));
}

function toggleNotifications(){
  const existing = document.getElementById('notif-dropdown');
  if(existing){ existing.remove(); return; }
  const list = STATE.notifications.map((n,index)=>`
    <div class="notif-item ${n.type==='high'?'high':''}" onclick="openNotification(${index})">
      <div class="notif-item-title">${n.title}</div>
      <div class="notif-item-body">${n.body}</div>
      <div class="notif-item-time">${n.time}</div>
    </div>
  `).join('');
  const panel = document.createElement('div');
  panel.id = 'notif-dropdown';
  panel.className = 'notif-dropdown';
  panel.innerHTML = `
    <div class="notif-header"><strong>Notifications</strong><span>${STATE.notifications.length} new</span></div>
    <div class="notif-items">${list}</div>
  `;
  document.body.appendChild(panel);
  const rect = document.querySelector('.tb-notif-btn')?.getBoundingClientRect();
  if(rect){ panel.style.top = `${rect.bottom + 10}px`; panel.style.right = `20px`; }
  setTimeout(()=>document.addEventListener('click', hideNotificationDropdown));
}
function hideNotificationDropdown(e){
  if(!e.target.closest('#notif-dropdown') && !e.target.closest('.tb-notif-btn')){
    document.getElementById('notif-dropdown')?.remove();
    document.removeEventListener('click', hideNotificationDropdown);
  }
}

/* ════════════════════════════════════════
   AUTH
   ════════════════════════════════════════ */
let selRole = "teacher";

function setRole(role){
  selRole = role;
}
function doLogin(){
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value.trim();
  const remember = document.getElementById('remember-me')?.checked;

  let foundUser = null;
  let foundRole = null;

  for (const role in STATE.users) {
    const user = STATE.users[role];
    if (user.email === email && user.password === pass) {
      foundUser = user;
      foundRole = user.role;
      break;
    }
  }

  if(!foundUser){
    toast('Invalid email or password.','error');
    return;
  }

  try {
    if (remember) {
      localStorage.setItem('sg_remembered_email', email);
    } else {
      localStorage.removeItem('sg_remembered_email');
    }
  } catch(e) {}

  STATE.currentUser = foundUser;
  selRole = foundRole;

  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'flex';

  setTopbarAvatar(foundUser);
  document.getElementById('tb-name').textContent = foundUser.name;
  document.getElementById('tb-role').textContent =
    foundUser.role.charAt(0).toUpperCase() + foundUser.role.slice(1);

  buildSidebar(foundRole);
  updateUnreadBadge();
  nav('dashboard');
}

function doLogout(){
  STATE.currentUser = null;
  closeAllModals();

  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'grid';

  selRole = "teacher";

  let rememberedEmail = '';
  try { rememberedEmail = localStorage.getItem('sg_remembered_email') || ''; } catch(e) {}
  document.getElementById('l-email').value = rememberedEmail;
  document.getElementById('l-pass').value = '';
}
function togglePasswordVisibility(){
  const passInput = document.getElementById('l-pass');
  const toggleBtn = document.getElementById('pass-toggle');
  if(!passInput || !toggleBtn) return;
  const isHidden = passInput.type === 'password';
  passInput.type = isHidden ? 'text' : 'password';
  toggleBtn.innerHTML = isHidden
    ? '<svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18-1.4 1.4-3.1-3.1A10.8 10.8 0 0 1 12 20C5.5 20 2 12 2 12a18.8 18.8 0 0 1 4.1-5.8L1.6 4.4 3 3zm5.1 5.1A5 5 0 0 0 15.9 16l-1.6-1.6A3.2 3.2 0 0 1 9.6 9.7L8.1 8.1zM12 4c6.5 0 10 8 10 8a19 19 0 0 1-2.4 3.7l-1.5-1.5A17 17 0 0 0 19.8 12S16.5 6 12 6c-1 0-1.9.2-2.7.5L7.8 4A11.2 11.2 0 0 1 12 4z"/></svg>'
    : '<svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/></svg>';
  toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}
function toggleFieldPassword(inputId, toggleBtn){
  const passInput = document.getElementById(inputId);
  if(!passInput || !toggleBtn) return;
  const isHidden = passInput.type === 'password';
  passInput.type = isHidden ? 'text' : 'password';
  toggleBtn.innerHTML = isHidden
    ? '<svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18-1.4 1.4-3.1-3.1A10.8 10.8 0 0 1 12 20C5.5 20 2 12 2 12a18.8 18.8 0 0 1 4.1-5.8L1.6 4.4 3 3zm5.1 5.1A5 5 0 0 0 15.9 16l-1.6-1.6A3.2 3.2 0 0 1 9.6 9.7L8.1 8.1zM12 4c6.5 0 10 8 10 8a19 19 0 0 1-2.4 3.7l-1.5-1.5A17 17 0 0 0 19.8 12S16.5 6 12 6c-1 0-1.9.2-2.7.5L7.8 4A11.2 11.2 0 0 1 12 4z"/></svg>'
    : '<svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/></svg>';
  toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

/* ════════════════════════════════════════
   NAVIGATION
   ════════════════════════════════════════ */
const navMenus = {
  teacher:[
    {s:'Overview'},{id:'dashboard',l:'Dashboard',ic:'home'},
    {s:'Classroom'},
    {id:'students',l:'My Students',ic:'people'},
    {id:'grades',l:'Grade Entry',ic:'grade'},
    {id:'attendance',l:'Attendance',ic:'cal'},
    {s:'Communication'},
    {id:'messages',l:'Messages',ic:'msg'},
    {id:'assignments',l:'Assignments',ic:'grade'},
    {id:'announcements',l:'Announcements',ic:'bell'},
    {s:'Tools'},
    {id:'reports',l:'Reports',ic:'chart'},
    {id:'ranking',l:'Class Ranking',ic:'trophy'},
    {s:'Management'},
    {id:'parents',l:'Manage Parents',ic:'people'},
  ],
  parent:[
    {s:'Overview'},{id:'dashboard',l:'Dashboard',ic:'home'},
    {s:"My Child"},
    {id:'grades',l:'Academic Record',ic:'grade'},
    {id:'attendance',l:'Attendance',ic:'cal'},
    {s:'Communication'},
    {id:'messages',l:'Messages',ic:'msg'},
    {id:'assignments',l:'Assignments',ic:'grade'},
    {id:'announcements',l:'School News',ic:'bell'},
  ],
  admin:[
    {s:'Overview'},{id:'dashboard',l:'Dashboard',ic:'home'},
    {s:'Monitor'},
    {id:'students',l:'Students',ic:'people'},
    {id:'teachers',l:'Teachers',ic:'person'},
    {id:'parents',l:'Parents',ic:'person'},
    {id:'classes',l:'Classes',ic:'school'},
    {id:'grades',l:'Grade Overview',ic:'grade'},
    {id:'attendance',l:'Attendance',ic:'cal'},
    {id:'ranking',l:'School Ranking',ic:'trophy'},
    {s:'Administration'},
    {id:'approvals',l:'Teacher Approvals',ic:'check'},
    {s:'Communication'},
    {id:'messages',l:'Messages',ic:'msg'},
    {id:'announcements',l:'Announcements',ic:'bell'},
    {s:'System'},
    {id:'reports',l:'Reports',ic:'chart'},
  ]
};

function buildSidebar(role){
  const sb = document.getElementById('sidebar');
  const u = STATE.currentUser;
  sb.innerHTML = '';
  navMenus[role].forEach(item=>{
    if(item.s){ sb.innerHTML+=`<div class="nav-section-label">${item.s}</div>`; return; }
    const unread = item.id==='messages' ? STATE.messages.filter(m=>!m.read&&m.toRole===role&&m.toId===STATE.currentUser.id).length : 0;
    const pendingCount = item.id==='approvals' ? (STATE.pendingTeachers||[]).filter(t=>t.status==='pending').length : 0;
    const badgeCount = unread || pendingCount;
    sb.innerHTML += `<button class="nav-link" id="nl-${item.id}" onclick="nav('${item.id}')">${svgIco[item.ic]||''} ${item.l}${badgeCount?`<span class="nav-count">${badgeCount}</span>`:''}</button>`;
  });

  sb.innerHTML += `
    <div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--border);margin-top:20px">
      <button class="nav-link" onclick="nav('profile');closeSidebar();" style="margin-bottom:4px">
        <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'var(--blue-l)':u.role==='parent'?'var(--amber-l)':'var(--green-l)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${u.role==='admin'?'var(--blue)':u.role==='parent'?'var(--amber)':'var(--green)'};flex-shrink:0">${ini(u.name)}</div>
        <div style="flex:1;text-align:left;overflow:hidden">
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</div>
          <div style="font-size:11px;color:var(--text3);text-transform:capitalize">${u.role}</div>
        </div>
      </button>
      <button class="nav-link" onclick="doLogout()" style="color:var(--red)">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;color:var(--red)"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        <span>Sign Out</span>
      </button>
    </div>`;
}
function nav(page){
  closeSidebar();
  if(STATE.activeNav){ 
    document.getElementById('nl-'+STATE.activeNav)?.classList.remove('active'); 
  }
  STATE.activeNav = page;
  document.getElementById('nl-'+page)?.classList.add('active');
  const c = document.getElementById('content');
  c.innerHTML='';
  const role = STATE.currentUser.role;
  const pages = {
    teacher:{dashboard:pgTeacherDash,students:pgStudents,grades:pgGrades,attendance:pgAttendance,messages:pgMessages,assignments:pgAssignments,announcements:pgAnnouncements,reports:pgReports,profile:pgProfile,ranking:pgRanking,parents:pgParentsTeacher},
    parent:{dashboard:pgParentDash,grades:pgGrades,attendance:pgAttendance,messages:pgMessages,assignments:pgAssignments,announcements:pgAnnouncements,profile:pgProfile},
    admin:{dashboard:pgAdminDash,students:pgStudents,teachers:pgTeachers,parents:pgParents,classes:pgClasses,grades:pgGrades,attendance:pgAttendance,messages:pgMessages,announcements:pgAnnouncements,reports:pgReports,profile:pgProfile,ranking:pgRanking,approvals:pgApprovals}
  };
  const renderPage = pages[role]?.[page] || (()=>{ c.innerHTML='<div class="empty-state"><div class="es-icon">🔍</div><div class="es-title">Page not found</div></div>'; });
  renderPage(c);
  if(role==='parent'&&['dashboard','grades','attendance'].includes(page)&&typeof api!=='undefined'&&api.getToken()){
    Promise.all([api.getStudents(),api.getGrades(),api.getAttendance()]).then(([students,grades,attendance])=>{
      if(STATE.currentUser?.role!=='parent'||STATE.activeNav!==page) return;
      STATE.students=_mapStudents(students);
      STATE.grades=_presentationGrades(grades);
      STATE.attendance=Object.fromEntries(Object.entries(attendance).map(([studentId,record])=>{
        const {days,...totals}=record; return [studentId,totals];
      }));
      STATE.attendanceDays=Object.fromEntries(Object.entries(attendance).map(([studentId,record])=>[studentId,record.days||{}]));
      resolveParentChildId(STATE.currentUser);
      renderPage(c);
    }).catch(error=>{
      console.error('Could not refresh parent academic records:',error);
      if(STATE.currentUser?.role==='parent'&&STATE.activeNav===page){
        toast(error.message||'Could not refresh your child’s latest records.','error');
      }
    });
  }
}

function resolveParentChildId(user=STATE.currentUser){
  if(user?.role!=='parent') return null;
  const parentId=user.linked_id||user.id;
  const existingChild=STATE.students.find(student=>student.id===user.childId&&String(student.parentId)===String(parentId));
  if(existingChild) return existingChild.id;
  const linkedChild=STATE.students.find(student=>String(student.parentId)===String(parentId));
  const scopedApiChild=!linkedChild&&typeof api!=='undefined'&&api.getToken()&&STATE.students.length===1
    ? STATE.students[0]
    : null;
  const child=linkedChild||scopedApiChild;
  if(child){
    user.childId=child.id;
    user.child_id=child.id;
    return child.id;
  }
  return null;
}

function assignmentDateToday(){
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
}

function escapeAssignmentText(value){
  return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

function pgAssignments(el){
  const isTeacher = STATE.currentUser.role === 'teacher';
  const assignments = [...(STATE.assignments || [])].sort((a,b) =>
    String(b.assignmentDate).localeCompare(String(a.assignmentDate)) || Number(b.id)-Number(a.id));
  const today = assignmentDateToday();
  const subjects = STATE.subjects;

  el.innerHTML = `
    <div class="page-head">
      <div><div class="page-title">Assignments</div><div class="page-sub">${isTeacher ? `${escapeAssignmentText(STATE.currentUser.grade)} – ${escapeAssignmentText(STATE.currentUser.section)}` : 'Assignments for your child’s class'}</div></div>
    </div>
    ${isTeacher ? `
      <form class="card" onsubmit="saveAssignment(event)" style="margin-bottom:18px">
        <div class="card-header"><div class="card-title" style="margin:0">Post an Assignment</div></div>
        <div class="form-grid form-row-2">
          <div class="fg"><label for="as-title">Title*</label><input id="as-title" maxlength="160" required placeholder="e.g. Practice multiplication"></div>
          <div class="fg"><label for="as-subject">Subject*</label><select id="as-subject" required>${subjects.map(subject=>`<option value="${escapeAssignmentText(subject)}">${escapeAssignmentText(STATE.subjectLabels[subject] || subject)}</option>`).join('')}</select></div>
          <div class="fg"><label for="as-date">Assignment date*</label><input id="as-date" type="date" value="${today}" onchange="document.getElementById('as-due').min=this.value" required></div>
          <div class="fg"><label for="as-due">Due date</label><input id="as-due" type="date" min="${today}"></div>
          <div class="fg" style="grid-column:1/-1"><label for="as-description">Instructions*</label><textarea id="as-description" maxlength="5000" required placeholder="What should students complete?" style="min-height:100px"></textarea></div>
        </div>
        <div class="page-actions" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" type="submit">Post Assignment</button></div>
      </form>` : ''}
    <div style="display:grid;gap:12px">
      ${assignments.map(assignment=>`
        <article class="card" style="overflow-wrap:anywhere">
          <div class="flex aic jb" style="gap:10px;flex-wrap:wrap;margin-bottom:8px">
            <span class="badge bg-blue">${escapeAssignmentText(STATE.subjectLabels[assignment.subject] || assignment.subject)}</span>
            <span class="txs tm">${escapeAssignmentText(assignment.assignmentDate)}</span>
          </div>
          <div style="font-size:16px;font-weight:800;margin-bottom:5px">${escapeAssignmentText(assignment.title)}</div>
          <div class="txs tmm mb-10">${escapeAssignmentText(assignment.grade)} – ${escapeAssignmentText(assignment.section)}${assignment.dueDate ? ` &nbsp;·&nbsp; Due ${escapeAssignmentText(assignment.dueDate)}` : ''}${assignment.author ? ` &nbsp;·&nbsp; By ${escapeAssignmentText(assignment.author)}` : ''}</div>
          <p class="ts tm" style="line-height:1.7;white-space:pre-wrap;margin:0">${escapeAssignmentText(assignment.description)}</p>
        </article>`).join('')}
      ${assignments.length === 0 ? `<div class="card"><div class="empty-state"><div class="es-icon">📝</div><div class="es-title">No assignments yet</div></div></div>` : ''}
    </div>`;
}

async function saveAssignment(event){
  event.preventDefault();
  const title = document.getElementById('as-title')?.value.trim();
  const subject = document.getElementById('as-subject')?.value;
  const assignmentDate = document.getElementById('as-date')?.value;
  const dueDate = document.getElementById('as-due')?.value || null;
  const description = document.getElementById('as-description')?.value.trim();
  if(!title || !subject || !assignmentDate || !description){ toast('Please complete all required assignment fields.','error'); return; }
  try {
    const saved = await api.addAssignment({title, subject, assignmentDate, dueDate, description});
    STATE.assignments.unshift(_mapAssignments([saved])[0]);
    toast('Assignment posted.');
    nav('assignments');
  } catch(error) {
    toast(error.message || 'Assignment could not be posted.','error');
  }
}

/* ════════════════════════════════════════
   ██████████ TEACHER DASHBOARD ██████████
   ════════════════════════════════════════ */
function pgTeacherDash(el){
  const u = STATE.currentUser;
  const myStudents = STATE.students.filter(s=>s.section===u.section&&s.grade===u.grade&&s.status==='active');
  const unread = STATE.messages.filter(m=>!m.read&&m.toRole==='teacher'&&m.toId===u.id).length;
  let allScores=[];
  myStudents.forEach(s=>{const g=STATE.grades[s.id];if(g) STATE.subjects.forEach(sub=>{const score=safeAverage(g[sub]);if(score !== null) allScores.push(score);});});
  const clsAvg = averageScores(allScores) ?? 0;
  const lowCount = myStudents.filter(s=>{const g=STATE.grades[s.id];return g&&STATE.subjects.some(sub=>{const score=safeAverage(g[sub]);return score !== null&&score<75;});}).length;
  const totPres = myStudents.reduce((a,s)=>{const at=STATE.attendance[s.id];return a+(at?at.present+(at.half_day||0)*0.5:0);},0);
  const totAll  = myStudents.reduce((a,s)=>{const at=STATE.attendance[s.id];return a+(at?at.total:0);},0);
  const attR = totAll?Math.round(totPres/totAll*100):0;
  const today = new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const pendingMsgs = STATE.messages.filter(m=>m.toRole==='teacher'&&!m.read);

  el.innerHTML=`
  <div class="dash-hero hero-green" style="margin-bottom:22px">
    <div class="hero-deco hero-deco-1" style="width:260px;height:260px;top:-80px;right:-60px;background:rgba(255,255,255,.06);border-radius:50%;position:absolute"></div>
    <div class="hero-deco hero-deco-2" style="width:180px;height:180px;bottom:-60px;right:180px;background:rgba(255,255,255,.04);border-radius:50%;position:absolute"></div>
    <div style="position:relative;z-index:1">
      <div class="hero-rl">Teacher Dashboard</div>
      <div class="hero-name">Good day, ${u.name.split(' ')[1]}! 👋</div>
      <div class="hero-sub">${today} &nbsp;·&nbsp; ${u.grade} – ${u.section}</div>
      <div class="hero-kpis">
        <div><div class="hero-kpi-val">${myStudents.length}</div><div class="hero-kpi-lbl">Students</div></div>
        <div><div class="hero-kpi-val">${u.grade==='Grade 1'?gradeDisplay({grade:u.grade},clsAvg):clsAvg}</div><div class="hero-kpi-lbl">Class Average</div></div>
        <div><div class="hero-kpi-val">${attR}%</div><div class="hero-kpi-lbl">Attendance Rate</div></div>
        <div><div class="hero-kpi-val">${unread}</div><div class="hero-kpi-lbl">Unread Messages</div></div>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-lbl">My Students</div><div class="stat-val green">${myStudents.length}</div><div class="stat-foot">${u.grade} – ${u.section}</div><div class="stat-bar"><div class="stat-bar-f" style="width:100%;background:var(--green)"></div></div></div>
    <div class="stat-card"><div class="stat-lbl">Class Average</div><div class="stat-val ${clsAvg>=85?'green':clsAvg>=75?'amber':'red'}">${u.grade==='Grade 1'?gradeDisplay({grade:u.grade},clsAvg):clsAvg}</div><div class="stat-foot">${u.grade==='Grade 1'?gradeDisplay({grade:u.grade},clsAvg):glabel(clsAvg)}</div><div class="stat-bar"><div class="stat-bar-f" style="width:${clsAvg}%;background:${gcol(clsAvg)}"></div></div></div>
    <div class="stat-card"><div class="stat-lbl">Need Attention</div><div class="stat-val ${lowCount>0?'red':'green'}">${lowCount}</div><div class="stat-foot">Students below 75</div><div class="stat-bar"><div class="stat-bar-f" style="width:${myStudents.length?lowCount/myStudents.length*100:0}%;background:var(--red)"></div></div></div>
    <div class="stat-card"><div class="stat-lbl">Unread Messages</div><div class="stat-val ${unread>0?'amber':'green'}">${unread}</div><div class="stat-foot">Parent messages</div><div class="stat-bar"><div class="stat-bar-f" style="width:${Math.min(unread*15,100)}%;background:var(--amber)"></div></div></div>
  </div>

  <div class="g2 mb-16">
    <div class="card">
      <div class="card-header"><div class="card-title" style="margin:0">Student Performance</div><button class="btn btn-secondary btn-xs" onclick="nav('grades')">Enter Grades</button></div>
      <div id="perf-list">
      ${myStudents.length===0?`<div class="empty-state"><div class="es-icon">👥</div><div class="es-title">No students found</div></div>`:
        myStudents.map(s=>{
          const g=STATE.grades[s.id];
          const ov=g?overallAvg(g):0;
          const displayOv=gradeDisplay(s,ov);
          const att=STATE.attendance[s.id];
          const attRate=att?Math.round((att.present+(att.half_day||0)*0.5)/att.total*100):0;
          return `<div class="flex aic gap-12" style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div class="av av-40 av-green">${ini(s.name)}</div>
            <div class="f1">
              <div class="fw6 ts">${s.name}</div>
              <div style="height:4px;background:var(--surface2);border-radius:2px;margin-top:5px"><div style="height:100%;width:${ov}%;background:${gcol(ov)};border-radius:2px;transition:width .6s"></div></div>
            </div>
            <div style="text-align:right">
              <span class="badge ${gbadge(ov)}">${displayOv}</span>
              <div class="txs tmm mt-8">${attRate}% present</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="card-header"><div class="card-title" style="margin:0">Recent Messages</div>${unread?`<span class="badge bg-red">${unread} new</span>`:''}</div>
        ${pendingMsgs.length===0?`<p class="ts tm">No new messages.</p>`:
          pendingMsgs.slice(0,3).map(m=>`
            <div class="flex aic gap-10" style="padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="nav('messages')">
              <div class="av av-32 av-green">${ini(m.fromName)}</div>
              <div class="f1">
                <div class="ts fw6">${m.fromName}</div>
                <div class="txs tm" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${m.subject}</div>
                <div class="txs tmm">${m.date}</div>
              </div>
              <div style="width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0"></div>
            </div>`).join('')}
        <button class="btn btn-secondary btn-sm mt-12" style="width:100%" onclick="nav('messages')">Open Inbox</button>
      </div>

      <div class="card">
        <div class="card-title">Quick Actions</div>
        <div style="display:grid;gap:8px">
          <button class="btn btn-primary" onclick="nav('grades')" style="justify-content:flex-start;padding:11px 14px">📝 &nbsp;Enter Student Grades</button>
          <button class="btn btn-secondary" onclick="nav('attendance')" style="justify-content:flex-start;padding:11px 14px">📋 &nbsp;Mark Today's Attendance</button>
          <button class="btn btn-secondary" onclick="openComposeModal()" style="justify-content:flex-start;padding:11px 14px">💬 &nbsp;Message a Parent</button>
          <button class="btn btn-secondary" onclick="nav('reports')" style="justify-content:flex-start;padding:11px 14px">📊 &nbsp;Generate Report</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card mb-16">
    <div class="card-header"><div class="card-title" style="margin:0">Subject Performance Overview</div><span class="badge bg-gray">${u.grade} – ${u.section}</span></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
      ${STATE.subjects.map(sub=>{
        let vals=[];myStudents.forEach(s=>{const g=STATE.grades[s.id];const score=g?safeAverage(g[sub]):null;if(score !== null) vals.push(score);});
        const sa=averageScores(vals);
        const subjectGrade=sa===null?'—':u.grade==='Grade 1'?gradeDisplay({grade:u.grade},sa):sa;
        return `<div style="padding:16px;background:var(--bg);border-radius:12px;text-align:center">
          <div class="txs tmm fw7" style="text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${STATE.subjectLabels[sub].split(' ')[0]}</div>
          <div style="font-size:28px;font-weight:800;color:${sa === null ? 'var(--text3)' : gcol(sa)};letter-spacing:-1px">${subjectGrade}</div>
          <div style="height:4px;background:var(--surface2);border-radius:2px;margin-top:8px"><div style="height:100%;width:${sa === null ? 0 : sa}%;background:${sa === null ? 'var(--border)' : gcol(sa)};border-radius:2px"></div></div>
          <div class="txs tmm mt-8">${sa === null ? 'Not graded' : u.grade==='Grade 1'?grade1Descriptor(subjectGrade)?.name: glabel(sa)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title" style="margin:0">Latest Announcements</div><button class="btn btn-secondary btn-xs" onclick="nav('announcements')">See All</button></div>
    ${STATE.announcements.slice(0,2).map(a=>`
      <div style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div class="flex aic gap-8 mb-8"><span class="badge ${a.priority==='high'?'bg-red':'bg-gray'}">${a.priority==='high'?'Important':'Notice'}</span><span class="txs tmm">${a.date}</span></div>
        <div class="fw6 ts">${a.title}</div>
        <div class="txs tm mt-8" style="line-height:1.5">${a.body.slice(0,100)}...</div>
      </div>`).join('')}
  </div>`;
}
/* ════════════════════════════════════════
   ██████████ PARENT DASHBOARD ██████████
   ════════════════════════════════════════ */
function pgParentDash(el){
  const u = STATE.currentUser;
  const childId=resolveParentChildId(u);
  const child = STATE.students.find(s=>s.id===childId);
  const g = STATE.grades[childId]||{};
  const att = STATE.attendance[childId]||{present:0,absent:0,late:0,total:child?45:0};
  const subs = STATE.subjects.map(sub=>safeAverage(g[sub]||[]));
  const gradedSubs = subs.filter(score=>score !== null);
  const ov = averageScores(gradedSubs) ?? 0;
  const attR = att.total?Math.round((att.present+(att.half_day||0)*0.5)/att.total*100):0;
  const displayOv=gradeDisplay(child,ov);
  const myMsgs = STATE.messages.filter(m=>m.studentId===childId||m.toId===u.id||m.fromId===u.id);
  const unread = myMsgs.filter(m=>!m.read&&m.toId===u.id).length;
  const rankedSubs = subs.map((score,index)=>({score,index})).filter(item=>item.score !== null);
  const bestI = rankedSubs.length ? rankedSubs.reduce((best,item)=>item.score>best.score?item:best).index : -1;
  const worstI = rankedSubs.length ? rankedSubs.reduce((worst,item)=>item.score<worst.score?item:worst).index : -1;
  const today = new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  el.innerHTML=`
  <div class="dash-hero hero-amber" style="margin-bottom:22px">
    <div style="position:absolute;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.06);top:-80px;right:-60px"></div>
    <div style="position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.04);bottom:-60px;right:180px"></div>
    <div style="position:relative;z-index:1">
      <div class="hero-rl">Parent Dashboard</div>
      <div class="hero-name">Welcome, ${u.name.split(' ')[1]}! 👋</div>
      <div class="hero-sub">Monitoring: <strong style="color:#fff">${child?.name||'No linked student'}</strong>${child?` &nbsp;·&nbsp; ${child.grade} – ${child.section}`:''}</div>
      <div class="hero-kpis">
        <div><div class="hero-kpi-val">${displayOv}</div><div class="hero-kpi-lbl">Overall Average</div></div>
        <div><div class="hero-kpi-val">${attR}%</div><div class="hero-kpi-lbl">Attendance Rate</div></div>
        <div><div class="hero-kpi-val">${att.absent}</div><div class="hero-kpi-lbl">Days Absent</div></div>
        <div><div class="hero-kpi-val">${unread}</div><div class="hero-kpi-lbl">New Messages</div></div>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-lbl">Overall Grade</div><div class="stat-val ${ov>=90?'green':ov>=75?'amber':'red'}">${displayOv}</div><div class="stat-foot">${child?(child.grade==='Grade 1'?displayOv:glabel(ov)):'No linked student'}</div></div>
    <div class="stat-card"><div class="stat-lbl">Attendance</div><div class="stat-val ${attR>=90?'green':attR>=75?'amber':'red'}">${attR}%</div><div class="stat-foot">${att.present} of ${att.total} days</div></div>
    <div class="stat-card"><div class="stat-lbl">Best Subject</div><div class="stat-val green">${bestI >= 0 ? gradeDisplay(child,subs[bestI]) : '—'}</div><div class="stat-foot">${bestI >= 0 ? STATE.subjectLabels[STATE.subjects[bestI]] : 'No grades yet'}</div></div>
    <div class="stat-card"><div class="stat-lbl">Needs Focus</div><div class="stat-val ${worstI >= 0 && subs[worstI]<75?'red':'amber'}">${worstI >= 0 ? gradeDisplay(child,subs[worstI]) : '—'}</div><div class="stat-foot">${worstI >= 0 ? STATE.subjectLabels[STATE.subjects[worstI]] : 'No grades yet'}</div></div>
  </div>

  <div class="g2 mb-16">
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card" style="background:linear-gradient(135deg,var(--amber-l),var(--bg))">
        <div class="flex aic gap-14">
          <div class="av av-52 av-amber">${ini(child?.name||'')}</div>
          <div class="f1">
            <div style="font-size:18px;font-weight:800;letter-spacing:-.3px">${child?.name||'No linked student'}</div>
            <div class="ts tm">${child?`${child.grade} – ${child.section}`:'Contact the school administrator to link a student.'}</div>
            <div class="txs tmm mt-8">LRN: ${child?.lrn||'Not provided'} &nbsp;·&nbsp; ${child?.gender==='F'?'Female':'Male'}</div>
          </div>
          ${child?`<span class="badge bg-green" style="font-size:12px">${child.status}</span>`:''}
        </div>
        <div class="divider"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
          <div style="padding:10px;background:var(--green-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--green)">${att.present}</div><div class="txs tm">Present</div></div>
          <div style="padding:10px;background:var(--red-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--red)">${att.absent}</div><div class="txs tm">Absent</div></div>
          <div style="padding:10px;background:var(--amber-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--amber)">${att.late}</div><div class="txs tm">Late</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title" style="margin:0">Subject Performance</div><button class="btn btn-secondary btn-xs" onclick="nav('grades')">Full Record</button></div>
        ${STATE.subjects.map((sub,i)=>`
          <div class="prog-wrap">
            <div class="prog-top"><span class="prog-lbl">${STATE.subjectLabels[sub]}</span><span class="badge ${subs[i] === null ? 'bg-gray' : gbadge(subs[i])}">${subs[i] === null ? '—' : gradeDisplay(child,subs[i])}</span></div>
            <div class="prog-track"><div class="prog-fill" style="width:${subs[i] === null ? 0 : subs[i]}%;background:${subs[i] === null ? 'var(--border)' : gcol(subs[i])}"></div></div>
          </div>`).join('')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="card-title">Quarterly Grades – Mathematics</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${STATE.quarters.map((q,i)=>{
            const sc = i < 4 && g.math ? Number(g.math[i]) : null;
            const hasScore = Number.isFinite(sc) && sc > 0;
            return `<div style="padding:14px 8px;background:${!hasScore?'var(--bg)':sc>=90?'var(--green-l)':sc>=75?'var(--amber-l)':'var(--red-l)'};border-radius:10px;text-align:center">
              <div class="txs tmm fw7" style="text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">${q}</div>
              <div style="font-size:24px;font-weight:800;color:${hasScore?gcol(sc):'var(--text3)'};letter-spacing:-1px">${hasScore ? gradeDisplay(child,sc) : '—'}</div>
              <div class="txs" style="color:${hasScore?gcol(sc):'var(--text3)'};margin-top:4px">${hasScore ? (child?.grade==='Grade 1'?gradeDisplay(child,sc):sc>=90?'Outstanding':sc>=75?'Satisfactory':'Below') : 'Not available'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title" style="margin:0">Messages from Teacher</div>${unread?`<span class="badge bg-red">${unread} new</span>`:''}</div>
        ${myMsgs.slice(0,3).map(m=>`
          <div class="flex aic gap-10" style="padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="nav('messages')">
            <div class="av av-32 av-green">${ini(m.fromName)}</div>
            <div class="f1">
              <div class="ts fw6">${m.fromName}</div>
              <div class="txs tm" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${m.subject}</div>
            </div>
            ${!m.read&&m.toId===u.id?`<div style="width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0"></div>`:''}
          </div>`).join('')||'<p class="ts tm">No messages yet.</p>'}
        <div class="flex gap-8 mt-12">
          <button class="btn btn-primary btn-sm f1" onclick="openComposeModal()">✉️ Send Message</button>
          <button class="btn btn-secondary btn-sm f1" onclick="nav('messages')">View All</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title" style="margin:0">School Announcements</div><button class="btn btn-secondary btn-xs" onclick="nav('announcements')">All</button></div>
        ${STATE.announcements.filter(a=>a.audience==='all').slice(0,2).map(a=>`
          <div style="padding:10px;background:var(--bg);border-radius:9px;margin-bottom:8px">
            <div class="flex aic gap-8 mb-6"><span class="badge ${a.priority==='high'?'bg-red':'bg-gray'}" style="font-size:11px">${a.priority==='high'?'Important':'Notice'}</span><span class="txs tmm">${a.date}</span></div>
            <div class="ts fw6">${a.title}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}
/* ════════════════════════════════════════
   ██████████ ADMIN DASHBOARD ██████████
   ════════════════════════════════════════ */
function pgAdminDash(el){
  const u = STATE.currentUser;
  const total = STATE.students.length;
  const active = STATE.students.filter(s=>s.status==='active').length;
  let allOv=[];
  STATE.students.forEach(s=>{
    const g=STATE.grades[s.id];
    if(g) allOv.push(overallAvg(g,STATE.subjectSets[s.grade]||STATE.subjects));
  });
  const schAvg=averageScores(allOv) ?? 0;
  const outstanding=allOv.filter(x=>x>=90).length;
  const unreadMsgs=STATE.messages.filter(m=>!m.read).length;
  const today=new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  el.innerHTML=`
  <div class="dash-hero hero-blue" style="margin-bottom:22px">
    <div style="position:absolute;width:260px;height:260px;border-radius:50%;
      background:rgba(255,255,255,.05);top:-80px;right:-60px"></div>
    <div style="position:absolute;width:180px;height:180px;border-radius:50%;
      background:rgba(255,255,255,.04);bottom:-60px;right:180px"></div>
    <div style="position:relative;z-index:1">
      <div class="hero-rl">Admin Dashboard</div>
      <div class="hero-name">Welcome, ${u.name.split(' ').slice(-1)[0]}! 🏫</div>
      <div class="hero-sub">${today} &nbsp;·&nbsp; Polangui South Central School</div>
    <div class="hero-kpis">
  <div><div class="hero-kpi-val">${total}</div><div class="hero-kpi-lbl">Total Students</div></div>
  <div><div class="hero-kpi-val">${STATE.teachers.length}</div><div class="hero-kpi-lbl">Teachers</div></div>
  <div><div class="hero-kpi-val">1–3</div><div class="hero-kpi-lbl">Grade Levels</div></div>
  <div><div class="hero-kpi-val">${schAvg}</div><div class="hero-kpi-lbl">School Average</div></div>
</div>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:22px">
    <div class="stat-card">
      <div class="stat-lbl">Active Students</div>
      <div class="stat-val green">${active}</div>
      <div class="stat-foot">of ${total} enrolled</div>
      <div class="stat-bar"><div class="stat-bar-f" style="width:${total?active/total*100:0}%;background:var(--green)"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Teachers</div>
      <div class="stat-val blue">${STATE.teachers.length}</div>
      <div class="stat-foot">${STATE.classes.length} classes assigned</div>
      <div class="stat-bar"><div class="stat-bar-f" style="width:100%;background:var(--blue)"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">School Average</div>
      <div class="stat-val ${schAvg>=85?'green':schAvg>=75?'amber':'red'}">${schAvg}</div>
      <div class="stat-foot">${glabel(schAvg)}</div>
      <div class="stat-bar"><div class="stat-bar-f" style="width:${schAvg}%;background:${gcol(schAvg)}"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Outstanding</div>
      <div class="stat-val green">${outstanding}</div>
      <div class="stat-foot">Students scoring 90+</div>
      <div class="stat-bar"><div class="stat-bar-f" style="width:${allOv.length?outstanding/allOv.length*100:0}%;background:var(--green)"></div></div>
    </div>
  </div>

  <div class="card mb-16">
    <div class="card-title">Quick Actions</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
      ${[
        {icon:'✅',label:'Teacher Approvals',action:"nav('approvals')"},
        {icon:'✉️',label:'Message a Teacher',action:"openComposeModal()"},
        {icon:'🏆',label:'Ranking',action:"nav('ranking')"},
        {icon:'📊',label:'Reports',action:"nav('reports')"},
        {icon:'🏫',label:'Classes',action:"nav('classes')"},
      ].map(a=>`
        <button onclick="${a.action}"
          style="padding:16px 12px;background:var(--bg);border:1.5px solid var(--border);
          border-radius:12px;cursor:pointer;text-align:center;transition:all .2s;font-family:var(--font)"
          onmouseover="this.style.background='var(--green-l)';this.style.borderColor='var(--green)'"
          onmouseout="this.style.background='var(--bg)';this.style.borderColor='var(--border)'">
          <div style="font-size:26px;margin-bottom:8px">${a.icon}</div>
          <div style="font-size:12px;font-weight:700;color:var(--text2)">${a.label}</div>
        </button>`).join('')}
    </div>
  </div>

  <div class="g2 mb-16">
    <div class="card">
      <div class="card-header">
        <div class="card-title" style="margin:0">Recent Students</div>
        <button class="btn btn-secondary btn-xs" onclick="nav('students')">View All</button>
      </div>
      ${STATE.students.slice(0,5).map(s=>{
        const g=STATE.grades[s.id];
        const ov=g?overallAvg(g,STATE.subjectSets[s.grade]||STATE.subjects):0;
        return `<div class="flex aic gap-10" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="av av-32 av-green">${ini(s.name)}</div>
          <div class="f1">
            <div class="fw6 ts">${s.name}</div>
            <div class="txs tmm">${s.grade} – ${s.section}</div>
          </div>
          <span class="badge ${gbadge(ov)}">${gradeDisplay(s,ov)}</span>
        </div>`;
      }).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title" style="margin:0">Teachers</div>
        <button class="btn btn-secondary btn-xs" onclick="nav('teachers')">View All</button>
      </div>
      ${STATE.teachers.map(t=>`
        <div class="flex aic gap-10" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="av av-32 av-blue">${ini(t.name)}</div>
          <div class="f1">
            <div class="fw6 ts">${t.name}</div>
            <div class="txs tmm">${t.grade} – ${t.section}</div>
          </div>
          <span class="badge ${t.status==='active'?'bg-green':'bg-gray'}">${t.status}</span>
        </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title" style="margin:0">Latest Announcements</div>
      ${STATE.currentUser.role==='teacher'?'<button class="btn btn-primary btn-xs" onclick="openAddAnnouncementModal()">+ Post</button>':''}
    </div>
    ${STATE.announcements.slice(0,3).map(a=>`
      <div style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div class="flex aic gap-8 mb-6">
          <span class="badge ${a.priority==='high'?'bg-red':'bg-gray'}">${a.priority==='high'?'Important':'Notice'}</span>
          <span class="txs tmm">${a.date}</span>
        </div>
        <div class="fw6 ts">${a.title}</div>
        <div class="txs tm mt-8" style="line-height:1.5">${a.body.slice(0,80)}...</div>
      </div>`).join('')}
  </div>`;
}
function openForgotPassword(){
  const existing = document.getElementById('forgot-modal');
  if(existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'forgot-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:20px;
    backdrop-filter:blur(2px);
  `;
  modal.innerHTML=`
  <div style="background:#fff;border-radius:20px;width:100%;max-width:400px;padding:32px;box-shadow:0 32px 80px rgba(0,0,0,.25)">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:12px">🔐</div>
      <div style="font-size:20px;font-weight:800;color:#18180E;margin-bottom:6px">Forgot Password?</div>
      <div style="font-size:13px;color:#5C5A52">Enter your email and we'll send you a reset link.</div>
    </div>
    <div style="margin-bottom:16px">
      <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#5C5A52;margin-bottom:5px">Email Address</label>
      <input id="forgot-email" type="email" placeholder="your@email.com"
        style="width:100%;padding:11px 14px;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;outline:none;box-sizing:border-box">
    </div>
    <button onclick="submitForgotPassword()"
      style="width:100%;padding:13px;background:#2A76C9;color:#fff;border:none;border-radius:9px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px">
      Send Reset Link
    </button>
    <button onclick="document.getElementById('forgot-modal').remove()"
      style="width:100%;padding:11px;background:#F5F4F0;color:#5C5A52;border:1.5px solid #E3E0D8;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer">
      Cancel
    </button>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.remove(); });
  setTimeout(()=>document.getElementById('forgot-email')?.focus(), 100);
}

function submitForgotPassword(){
  const email = document.getElementById('forgot-email')?.value.trim();
  if(!email){ 
    alert('Please enter your email address.');
    return;
  }
  const found = Object.values(STATE.users).find(u=>u.email===email);
  document.getElementById('forgot-modal').remove();
  if(found){
    alert(`✅ Password reset link sent to ${email}!\n\n(Demo: your password is "password123")`);
  } else {
    alert(`❌ No account found with email: ${email}`);
  }
}
/* ════════════════════════════════════════
   STUDENTS PAGE (Teacher & Admin)
   ════════════════════════════════════════ */
function pgStudents(el){
  const isAdmin = STATE.currentUser.role==='admin';
  const isTeacher = STATE.currentUser.role==='teacher';
  let searchVal = '';
  const scopedStudents = isTeacher
    ? STATE.students.filter(s=>s.section===STATE.currentUser.section&&s.grade===STATE.currentUser.grade)
    : STATE.students;

  function getFiltered(){
    if(!searchVal.trim()) return scopedStudents;
    const q = searchVal.toLowerCase();
    return scopedStudents.filter(s=>
      s.name.toLowerCase().includes(q)||
      s.id.toLowerCase().includes(q)||
      s.section.toLowerCase().includes(q)||
      s.grade.toLowerCase().includes(q)||
      s.parent.toLowerCase().includes(q)
    );
  }

  function renderRows(){
    const students = getFiltered();
    const tbody = document.getElementById('students-tbody');
    if(!tbody) return;
    tbody.innerHTML = students.length===0
      ?`<tr><td colspan="7"><div class="empty-state">
          <div class="es-icon">👥</div>
          <div class="es-title">No students found</div>
          <div class="es-sub">Try a different keyword</div>
        </div></td></tr>`
      :students.map(s=>`<tr>
        <td><div class="flex aic gap-10">
          <div class="av av-32 av-green">${ini(s.name)}</div>
          <div><div class="fw6">${s.name}</div><div class="txs tmm">${s.id}${s.lrn?` · LRN ${s.lrn}`:''}</div></div>
        </div></td>
        <td>${s.grade} – ${s.section}</td>
        <td>${s.gender==='F'?'Female':'Male'}</td>
        <td><div>${s.parent}</div><div class="txs tmm">${s.parentEmail}</div></td>
        <td>${s.contact}</td>
        <td><span class="badge ${s.status==='active'?'bg-green':'bg-gray'}">${s.status}</span></td>
        <td><div class="flex gap-6">
          <button class="btn btn-secondary btn-xs" onclick="viewStudentModal('${s.id}')">View</button>
          ${isTeacher?`<button class="btn btn-secondary btn-xs" onclick="openEditStudentModal('${s.id}')">Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteStudent('${s.id}','${s.name}')">Delete</button>`:''}
        </div></td>
      </tr>`).join('');
  }

  el.innerHTML=`
  <div class="page-head">
    <div><div class="page-title">${isAdmin?'All Students':'My Students'}</div>
    <div class="page-sub" id="students-count">${getFiltered().length} student(s)</div></div>
    ${isTeacher?`<div class="page-actions">
      <button class="btn btn-secondary" onclick="exportStudents()">Export</button>
      <label class="btn btn-secondary" for="student-csv-file">Import</label>
      <input id="student-csv-file" type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onchange="importStudentsSpreadsheet(this)">
      <button class="btn btn-primary" onclick="openAddStudentModal()">+ Add Student</button>
    </div>`:''}
  </div>
  <div class="tbl-wrap">
    <div class="tbl-toolbar">
      <input class="tbl-search" id="student-search"
        placeholder="🔍 Search students..."
        oninput="handleStudentSearch(this.value)">
    </div>
    <table>
      <thead><tr>
        <th>Student</th><th>Grade & Section</th><th>Gender</th>
        <th>Parent/Guardian</th><th>Contact</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="students-tbody"></tbody>
    </table>
  </div>`;

  window.handleStudentSearch = (val)=>{
    searchVal = val;
    renderRows();
    const count = document.getElementById('students-count');
    if(count) count.textContent = getFiltered().length+' student(s)';
  };

  window.refreshStudentRows = ()=>{ renderRows(); };
  renderRows();
}


function openAddStudentModal(){
  const isTeacher = STATE.currentUser.role === 'teacher';
  const u = STATE.currentUser;

  openModal(`
  <div class="modal-header">
    <div class="modal-title">Add New Student</div>
    <button class="modal-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    ${isTeacher ? `
    <div style="padding:10px 14px;background:var(--green-l);border-radius:var(--r);margin-bottom:14px;font-size:13px;color:var(--green);font-weight:600">
      📌 Auto-assigned to: ${u.grade} – ${u.section}
    </div>` : ''}
    <div class="form-grid form-row-2">
      <div class="fg"><label>First Name*</label><input id="sf-fn" placeholder="First name"></div>
      <div class="fg"><label>Last Name*</label><input id="sf-ln" placeholder="Last name"></div>
      <div class="fg"><label>LRN (optional)</label><input id="sf-lrn" placeholder="12-digit LRN" maxlength="12"></div>
      ${!isTeacher ? `
      <div class="fg"><label>Grade*</label><select id="sf-gr">
        ${['Grade 1','Grade 2','Grade 3'].map(g=>`<option>${g}</option>`).join('')}
      </select></div>
      <div class="fg"><label>Section*</label><input id="sf-sec" placeholder="e.g. Mabini"></div>
      ` : ''}
      <div class="fg"><label>Gender*</label>
        <select id="sf-gen">
          <option value="F">Female</option>
          <option value="M">Male</option>
        </select>
      </div>
      <div class="fg"><label>Status</label>
        <select id="sf-st">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div class="fg"><label>Parent/Guardian Name*</label><input id="sf-par" placeholder="Full name"></div>
      <div class="fg"><label>Parent Email</label><input id="sf-pe" type="email" placeholder="parent@email.com"></div>
      <div class="fg" style="grid-column:span 2">
        <label>Contact Number*</label>
        <input id="sf-con" placeholder="09XXXXXXXXX">
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveStudent()">Save Student</button>
  </div>`);
}

function saveStudent(){
  const isTeacher = STATE.currentUser.role==='teacher';
  const u = STATE.currentUser;
  const fn = document.getElementById('sf-fn')?.value.trim();
  const ln = document.getElementById('sf-ln')?.value.trim();
  const lrn = document.getElementById('sf-lrn')?.value.trim();
  const gr = isTeacher ? u.grade : document.getElementById('sf-gr')?.value;
  const sec = isTeacher ? u.section : document.getElementById('sf-sec')?.value.trim();
  const gen = document.getElementById('sf-gen')?.value;
  const st = document.getElementById('sf-st')?.value;
  const par = document.getElementById('sf-par')?.value.trim();
  const pe = document.getElementById('sf-pe')?.value.trim();
  const con = document.getElementById('sf-con')?.value.trim();

  if(!fn||!ln||!par||!con){
    toast('Please fill all required fields.','error'); return;
  }
  if(!isTeacher && !sec){
    toast('Section is required.','error'); return;
  }

  const id = 'S'+String(STATE.nextStudentId++).padStart(3,'0');

  const newStudent = {
    id,
    lrn: lrn||'',
    name: `${fn} ${ln}`,
    grade: gr,
    section: sec,
    gender: gen,
    parent: par,
    parentEmail: pe||'',
    contact: con,
    status: st,
    enrolled: new Date().toISOString().split('T')[0]
  };

  STATE.students.push(newStudent);

  STATE.grades[id] = {
    math:[0,0,0,0],
    science:[0,0,0,0],
    english:[0,0,0,0],
    filipino:[0,0,0,0],
    ap:[0,0,0,0]
  };

  STATE.attendance[id] = {
    present:0, absent:0, late:0, total:0
  };

  closeModal();
  toast(`Student "${fn} ${ln}" added successfully!`);

  nav('students');
}

function csvEscape(value){
  const text=String(value??'');
  return /[",\r\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
}

function downloadCsv(filename, rows){
  const csv='\uFEFF'+rows.map(row=>row.map(csvEscape).join(',')).join('\r\n');
  if(window.TrackEdDownload){
    const dataUri=`data:text/csv;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(csv)))}`;
    window.TrackEdDownload.postMessage(JSON.stringify({filename,dataUri}));
    return;
  }
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=url; link.download=filename; link.style.display='none';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function parseCsv(text){
  const rows=[]; let row=[]; let value=''; let quoted=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(quoted){
      if(char==='"'&&text[i+1]==='"'){value+='"';i++;}
      else if(char==='"') quoted=false;
      else value+=char;
    }else if(char==='"'&&value==='') quoted=true;
    else if(char===','){row.push(value);value='';}
    else if(char==='\n'||char==='\r'){
      if(char==='\r'&&text[i+1]==='\n') i++;
      row.push(value);value='';
      if(row.some(cell=>cell.trim())) rows.push(row);
      row=[];
    }else value+=char;
  }
  row.push(value);
  if(row.some(cell=>cell.trim())) rows.push(row);
  return rows;
}

async function readSpreadsheetRows(file){
  const extension=file.name.split('.').pop()?.toLowerCase();
  if(extension==='csv'){
    return parseCsv((await file.text()).replace(/^\uFEFF/,''));
  }
  if(!['xls','xlsx'].includes(extension)){
    throw new Error('Choose an Excel (.xlsx or .xls) or CSV file.');
  }
  if(!window.XLSX){
    throw new Error('Excel import is unavailable. Please update the app and try again.');
  }
  const workbook=window.XLSX.read(await file.arrayBuffer(),{type:'array'});
  const firstSheet=workbook.Sheets[workbook.SheetNames[0]];
  if(!firstSheet) throw new Error('The Excel file has no worksheets.');
  return window.XLSX.utils.sheet_to_json(firstSheet,{
    header:1,raw:false,defval:'',blankrows:false,
  }).map(row=>row.map(cell=>String(cell??'')));
}

async function importStudentsSpreadsheet(input){
  const file=input.files?.[0];
  input.value='';
  if(!file) return;
  try{
    const rows=await readSpreadsheetRows(file);
    if(rows.length<2) throw new Error('The spreadsheet has no student rows.');
    const headers=rows[0].map(header=>header.trim().toLowerCase());
    const column=name=>headers.indexOf(name.toLowerCase());
    const required=['Name','Gender','Parent/Guardian Name','Contact Number'].map(column);
    if(required.some(index=>index<0)) throw new Error('Use an exported spreadsheet and keep its column headers.');
    const studentsToImport=[];
    for(const [rowIndex,cells] of rows.slice(1).entries()){
      const value=name=>{const index=column(name);return index<0?'':(cells[index]||'').trim();};
      const name=value('Name'), parent=value('Parent/Guardian Name'), contact=value('Contact Number');
      if(!name||!parent||!contact) throw new Error(`Row ${rowIndex+2}: name, parent, and contact are required.`);
      const student={
        name, lrn:value('LRN'), grade:STATE.currentUser.grade, section:STATE.currentUser.section,
        gender:value('Gender').toUpperCase(), status:value('Status')||'active',
        parent, parentEmail:value('Parent Email'), contact,
      };
      if(!['M','F'].includes(student.gender)) throw new Error(`Row ${rowIndex+2}: Gender must be M or F.`);
      if(student.lrn&&!/^\d{12}$/.test(student.lrn)) throw new Error(`Row ${rowIndex+2}: LRN must contain 12 digits.`);
      studentsToImport.push(student);
    }
    let imported=0;
    const isApiUser=typeof api!=='undefined'&&Boolean(api.getToken());
    try{
      for(const student of studentsToImport){
        if(isApiUser){
          const result=await api.addStudent(student);
          student.id=result.id; student.enrolled=result.enrolled;
        }else{
          student.id='S'+String(STATE.nextStudentId++).padStart(3,'0');
          student.enrolled=new Date().toISOString().split('T')[0];
        }
        STATE.students.push(student);
        STATE.grades[student.id]=Object.fromEntries((STATE.subjectSets[student.grade]||STATE.subjectSets['Grade 1']).map(subject=>[subject,[0,0,0,0]]));
        STATE.attendance[student.id]={present:0,absent:0,half_day:0,tardy:0,late:0,total:0};
        imported++;
      }
    }catch(error){
      toast(`${imported} imported; stopped at the next row: ${error.message||'API request failed.'}`,'error');
      if(imported) nav('students');
      return;
    }
    toast(`${imported} student(s) imported.`);
    nav('students');
  }catch(error){
    toast(error.message||'Could not import this spreadsheet.','error');
  }
}

function openEditStudentModal(id){
  const s = STATE.students.find(x=>x.id===id);
  if(!s) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Edit Student</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid form-row-2">
      <div class="fg"><label>First Name*</label><input id="ef-fn" value="${s.name.split(' ')[0]}"></div>
      <div class="fg"><label>Last Name*</label><input id="ef-ln" value="${s.name.split(' ').slice(1).join(' ')}"></div>
      <div class="fg"><label>LRN</label><input id="ef-lrn" value="${s.lrn||''}" maxlength="12"></div>
      <div class="fg"><label>Grade*</label><select id="ef-gr">${['Grade 1','Grade 2','Grade 3'].map(g=>`<option ${g===s.grade?'selected':''}>${g}</option>`).join('')}</select></div>
      <div class="fg"><label>Section*</label><input id="ef-sec" value="${s.section}"></div>
      <div class="fg"><label>Gender*</label><select id="ef-gen"><option value="F" ${s.gender==='F'?'selected':''}>Female</option><option value="M" ${s.gender==='M'?'selected':''}>Male</option></select></div>
      <div class="fg"><label>Status</label><select id="ef-st"><option value="active" ${s.status==='active'?'selected':''}>Active</option><option value="inactive" ${s.status==='inactive'?'selected':''}>Inactive</option></select></div>
      <div class="fg"><label>Parent/Guardian</label><input id="ef-par" value="${s.parent}"></div>
      <div class="fg"><label>Parent Email</label><input id="ef-pe" type="email" value="${s.parentEmail}"></div>
      <div class="fg" style="grid-column:span 2"><label>Contact</label><input id="ef-con" value="${s.contact}"></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateStudent('${id}')">Save Changes</button></div>`);
}

function updateStudent(id){
  const s = STATE.students.find(x=>x.id===id);
  if(!s) return;
  const fn=document.getElementById('ef-fn')?.value.trim();
  const ln=document.getElementById('ef-ln')?.value.trim();
  if(!fn||!ln){ toast('Name is required.','error'); return; }
  s.name=`${fn} ${ln}`;
  s.lrn=document.getElementById('ef-lrn')?.value.trim()||s.lrn;
  s.grade=document.getElementById('ef-gr')?.value;
  s.section=document.getElementById('ef-sec')?.value.trim()||s.section;
  s.gender=document.getElementById('ef-gen')?.value;
  s.status=document.getElementById('ef-st')?.value;
  s.parent=document.getElementById('ef-par')?.value.trim()||s.parent;
  s.parentEmail=document.getElementById('ef-pe')?.value.trim()||s.parentEmail;
  s.contact=document.getElementById('ef-con')?.value.trim()||s.contact;
  closeModal(); toast('Student updated successfully!');
  if(STATE.activeNav==='students') nav('students');
}

function viewStudentModal(id){
  const s = STATE.students.find(x=>x.id===id);
  const g = STATE.grades[id]||{};
  const att = STATE.attendance[id]||{present:0,absent:0,late:0,total:45};
  const ov = overallAvg(g,STATE.subjectSets[s.grade]||STATE.subjects);
  const honors = getHonors(ov);
  openModal(`
  <div class="modal-header"><div class="modal-title">Student Profile</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="flex aic gap-14 mb-16" style="padding-bottom:14px;border-bottom:1px solid var(--border)">
      <div class="av av-52 av-green">${ini(s.name)}</div>
      <div><div style="font-size:20px;font-weight:800;letter-spacing:-.4px">${s.name} ${honors?honors.icon:''}</div><div class="ts tm">${s.grade} – ${s.section} · ${s.gender==='F'?'Female':'Male'} · ID: ${s.id}${s.lrn?` · LRN: ${s.lrn}`:''}</div><div class="flex gap-8 mt-8"><span class="badge ${s.status==='active'?'bg-green':'bg-gray'}">${s.status}</span>${honors?`<span class="badge" style="background:var(--gold-l);color:var(--gold)">${honors.label}</span>`:''}</div></div>
    </div>
    <div class="g2 mb-14">
      <div><div class="txs tmm fw7">Parent/Guardian</div><div class="fw6">${s.parent}</div></div>
      <div><div class="txs tmm fw7">Contact</div><div class="fw6">${s.contact}</div></div>
      <div><div class="txs tmm fw7">Email</div><div class="fw6">${s.parentEmail||'—'}</div></div>
      <div><div class="txs tmm fw7">Enrolled</div><div class="fw6">${s.enrolled}</div></div>
    </div>
    <div class="g3 mb-14" style="text-align:center">
      <div style="padding:12px;background:var(--green-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--green)">${att.present}</div><div class="txs tm">Present</div></div>
      <div style="padding:12px;background:var(--red-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--red)">${att.absent}</div><div class="txs tm">Absent</div></div>
      <div style="padding:12px;background:var(--amber-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--amber)">${att.late}</div><div class="txs tm">Late</div></div>
    </div>
    <div class="fw7 ts mb-8">Academic Performance</div>
    ${(STATE.subjectSets[s.grade]||STATE.subjects).map(sub=>{const sc=avg(g[sub]||[]);return `<div class="flex aic jb" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="ts">${STATE.subjectLabels[sub]}</span><span class="badge ${sc?gbadge(sc):'bg-gray'}">${gradeDisplay(s,sc)}</span></div>`;}).join('')}
    <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:9px;text-align:center"><div class="txs tmm">Overall Average</div><div style="font-size:28px;font-weight:800;color:${gradeColor(s,ov)}">${gradeDisplay(s,ov)}</div><div class="ts" style="color:${gradeColor(s,ov)}">${s.grade==='Grade 1'?gradeDisplay(s,ov):glabel(ov)}</div></div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Close</button></div>`);
}

function deleteStudent(id, name){
  showConfirm('Delete Student', `Are you sure you want to remove <strong>${name}</strong> from the system? This action cannot be undone.`, ()=>{
    const idx = STATE.students.findIndex(s=>s.id===id);
    if(idx>=0){ STATE.students.splice(idx,1); toast(`${name} has been removed.`); nav('students'); }
  });
}

function downloadPdf(filename, title, headers, rows){
  const JsPDF = window.jspdf?.jsPDF;
  if(!JsPDF){ toast('PDF service is unavailable. Connect to the internet and try again.','error'); return; }
  const doc = new JsPDF({orientation:'landscape'});
  const margin = 12;
  let y = 16;
  doc.setFontSize(16); doc.text(title, margin, y); y += 10;
  doc.setFontSize(8);
  const width = (doc.internal.pageSize.getWidth()-margin*2)/headers.length;
  const writeRow = (values, bold=false) => {
    if(y > 195){ doc.addPage(); y=16; }
    doc.setFont(undefined,bold?'bold':'normal');
    values.forEach((value,index)=>doc.text(String(value ?? '').slice(0,28), margin+index*width, y));
    y += 6;
  };
  writeRow(headers,true); doc.line(margin,y-4,doc.internal.pageSize.getWidth()-margin,y-4);
  rows.forEach(row=>writeRow(row));
  if (window.TrackEdDownload) {
    const dataUri = doc.output('datauristring');
    window.TrackEdDownload.postMessage(JSON.stringify({filename, dataUri}));
    return;
  }
  const url=URL.createObjectURL(doc.output('blob'));
  const link=document.createElement('a');
  link.href=url; link.download=filename; link.style.display='none';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

window.handleNativeDownloadResult=function(success,filename){
  if(success) return;
  toast(`${filename} could not be saved. Check device storage and try again.`,'error');
};

window.handleNativeDownloadOpenResult=function(success,filename){
  if(success){ toast(`Opening ${filename}.`,'info'); return; }
  toast(`${filename} is saved in Downloads, but no app could open it.`,'error');
};

function exportStudents(){
  const rows = [['Name','LRN','Gender','Parent/Guardian Name','Parent Email','Contact Number','Status']];
  const students = STATE.currentUser.role==='teacher'
    ? STATE.students.filter(s=>s.section===STATE.currentUser.section&&s.grade===STATE.currentUser.grade)
    : STATE.students;
  students.forEach(s=>rows.push([s.name,s.lrn||'',s.gender,s.parent,s.parentEmail,s.contact,s.status]));
  downloadCsv('students.csv',rows);
}
/* ════════════════════════════════════════
   TEACHERS PAGE (Admin)
   ════════════════════════════════════════ */
function pgTeachers(el){
  let searchVal = '';

  function getFiltered(){
    if(!searchVal.trim()) return STATE.teachers;
    const q = searchVal.toLowerCase();
    return STATE.teachers.filter(t=>
      t.name.toLowerCase().includes(q)||
      t.email.toLowerCase().includes(q)||
      t.section.toLowerCase().includes(q)||
      t.grade.toLowerCase().includes(q)
    );
  }

  function renderRows(){
    const list = getFiltered();
    const tbody = document.getElementById('teachers-tbody');
    if(!tbody) return;
    tbody.innerHTML = list.length===0
      ?`<tr><td colspan="6"><div class="empty-state">
          <div class="es-icon">👩‍🏫</div>
          <div class="es-title">No teachers found</div>
          <div class="es-sub">Try a different keyword</div>
        </div></td></tr>`
      :list.map(t=>`<tr>
        <td><div class="flex aic gap-10">
          <div class="av av-32 av-blue">${ini(t.name)}</div>
          <div><div class="fw6">${t.name}</div><div class="txs tmm">${t.id}</div></div>
        </div></td>
        <td>${t.grade} – ${t.section}</td>
        <td class="tm">${t.email}</td>
        <td>${t.phone}</td>
        <td>${t.joined}</td>
        <td><span class="badge ${t.status==='active'?'bg-green':'bg-gray'}">${t.status}</span></td>
      </tr>`).join('');
  }

  el.innerHTML=`
  <div class="page-head">
    <div><div class="page-title">Teachers</div>
    <div class="page-sub" id="teachers-count">${STATE.teachers.length} teacher(s)</div></div>
  </div>
  <div class="tbl-wrap">
    <div class="tbl-toolbar">
      <input class="tbl-search" id="teacher-search"
        placeholder="🔍 Search teachers..."
        oninput="handleTeacherSearch(this.value)">
    </div>
    <table>
      <thead><tr>
        <th>Teacher</th><th>Grade / Section</th><th>Email</th>
        <th>Phone</th><th>Joined</th><th>Status</th>
      </tr></thead>
      <tbody id="teachers-tbody"></tbody>
    </table>
  </div>`;

  window.handleTeacherSearch = (val)=>{
    searchVal = val;
    renderRows();
    const count = document.getElementById('teachers-count');
    if(count) count.textContent = getFiltered().length+' teacher(s)';
  };

  window.refreshTeacherRows = ()=>{ renderRows(); };
  renderRows();
}

function openAddTeacherModal(){
  openModal(`
  <div class="modal-header"><div class="modal-title">Add New Teacher</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid form-row-2">
      <div class="fg"><label>First Name*</label><input id="tf-fn" placeholder="First name"></div>
      <div class="fg"><label>Last Name*</label><input id="tf-ln" placeholder="Last name"></div>
      <div class="fg"><label>Title</label><select id="tf-ti"><option>Ms.</option><option>Mrs.</option><option>Mr.</option><option>Dr.</option></select></div>
      <div class="fg"><label>Email*</label><input id="tf-em" type="email" placeholder="teacher@school.edu"></div>
      <div class="fg"><label>Phone</label><input id="tf-ph" placeholder="09XXXXXXXXX"></div>
      <div class="fg"><label>Login Password*</label><div class="pass-wrap"><input id="tf-pw" type="password" placeholder="Create a password"><button type="button" class="pass-toggle" onclick="toggleFieldPassword('tf-pw', this)" aria-label="Show password"><svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/></svg></button></div></div>
      <div class="fg"><label>Grade Assigned*</label><select id="tf-gr">${['Grade 1','Grade 2','Grade 3'].map(g=>`<option>${g}</option>`).join('')}</select></div>
      <div class="fg" style="grid-column:span 2"><label>Section*</label><input id="tf-sec" placeholder="e.g. Mabini"></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveTeacher()">Add Teacher</button></div>`);
}

function saveTeacher(){
  const ti=document.getElementById('tf-ti')?.value;
  const fn=document.getElementById('tf-fn')?.value.trim();
  const ln=document.getElementById('tf-ln')?.value.trim();
  const em=document.getElementById('tf-em')?.value.trim();
  const ph=document.getElementById('tf-ph')?.value.trim();
  const gr=document.getElementById('tf-gr')?.value;
  const sec=document.getElementById('tf-sec')?.value.trim();
  if(!fn||!ln||!em||!sec){ toast('Please fill all required fields.','error'); return; }
  const id='T'+String(STATE.nextTeacherId++).padStart(3,'0');
  const name=`${ti} ${fn} ${ln}`;
  STATE.teachers.push({id,name,email:em,phone:ph||'—',grade:gr,section:sec,subjects:'All Subjects',status:'active',joined:new Date().toISOString().split('T')[0]});
  closeModal(); toast(`Teacher "${name}" added!`);
  nav('teachers');
}

function openEditTeacherModal(id){
  const t=STATE.teachers.find(x=>x.id===id); if(!t) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Edit Teacher</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid form-row-2">
      <div class="fg" style="grid-column:span 2"><label>Full Name*</label><input id="etf-nm" value="${t.name}"></div>
      <div class="fg"><label>Email*</label><input id="etf-em" type="email" value="${t.email}"></div>
      <div class="fg"><label>Phone</label><input id="etf-ph" value="${t.phone}"></div>
      <div class="fg"><label>Grade</label><select id="etf-gr">${['Grade 1','Grade 2','Grade 3'].map(g=>`<option ${g===t.grade?'selected':''}>${g}</option>`).join('')}</select></div>
      <div class="fg"><label>Section</label><input id="etf-sec" value="${t.section}"></div>
      <div class="fg"><label>Status</label><select id="etf-st"><option value="active" ${t.status==='active'?'selected':''}>Active</option><option value="inactive" ${t.status==='inactive'?'selected':''}>Inactive</option></select></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateTeacher('${id}')">Save Changes</button></div>`);
}

function updateTeacher(id){
  const t=STATE.teachers.find(x=>x.id===id); if(!t) return;
  t.name=document.getElementById('etf-nm')?.value.trim()||t.name;
  t.email=document.getElementById('etf-em')?.value.trim()||t.email;
  t.phone=document.getElementById('etf-ph')?.value.trim()||t.phone;
  t.grade=document.getElementById('etf-gr')?.value||t.grade;
  t.section=document.getElementById('etf-sec')?.value.trim()||t.section;
  t.status=document.getElementById('etf-st')?.value||t.status;
  closeModal(); toast('Teacher updated!'); nav('teachers');
}

function deleteTeacher(id,name){
  showConfirm('Remove Teacher',`Remove <strong>${name}</strong> from the system?`,()=>{
    const idx=STATE.teachers.findIndex(t=>t.id===id);
    if(idx>=0){ STATE.teachers.splice(idx,1); toast(`${name} removed.`); nav('teachers'); }
  });
}

/* ════════════════════════════════════════
   CLASSES PAGE (Admin)
   ════════════════════════════════════════ */
function pgClasses(el){
  function render(){
    el.innerHTML=`
    <div class="page-head">
      <div><div class="page-title">Classes</div><div class="page-sub">Sections and teacher assignments</div></div>
    </div>
    <div class="g2">
      ${STATE.classes.map(c=>{
        const t=STATE.teachers.find(x=>x.id===c.teacherId);
        const sts=STATE.students.filter(s=>s.grade===c.grade&&s.section===c.section&&s.status==='active');
        let sc=[];sts.forEach(s=>{const g=STATE.grades[s.id];if(g) (STATE.subjectSets[s.grade]||STATE.subjects).forEach(sub=>{const score=safeAverage(g[sub]);if(score!==null) sc.push(score);});});
        const ca=averageScores(sc)||0;
        return `<div class="card">
          <div class="flex aic gap-14 mb-16">
            <div style="width:50px;height:50px;background:var(--blue-l);border-radius:12px;display:flex;align-items:center;justify-content:center">${svgIco.school.replace('fill="currentColor"','fill="var(--blue)"').replace('width="16" height="16"','width="24" height="24"')}</div>
            <div class="f1"><div style="font-size:18px;font-weight:800;letter-spacing:-.4px">${c.grade} – ${c.section}</div><div class="ts tm">SY ${c.year}</div></div>
          </div>
          <div class="g3 mb-14" style="text-align:center">
            <div style="padding:10px;background:var(--bg);border-radius:9px"><div style="font-size:20px;font-weight:800;color:var(--blue)">${sts.length}</div><div class="txs tm">Students</div></div>
            <div style="padding:10px;background:var(--bg);border-radius:9px"><div style="font-size:20px;font-weight:800;color:${ca?gradeColor({grade:c.grade},ca):'var(--text3)'}">${ca?gradeDisplay({grade:c.grade},ca):'–'}</div><div class="txs tm">Avg Grade</div></div>
            <div style="padding:10px;background:var(--bg);border-radius:9px"><div style="font-size:16px;font-weight:800;color:var(--green)">${c.year}</div><div class="txs tm">School Year</div></div>
          </div>
          <div class="divider"></div>
          <div class="flex aic gap-10">
            <div class="av av-32 av-blue">${t?ini(t.name):'?'}</div>
            <div class="f1"><div class="fw6 ts">${t?t.name:'No teacher assigned'}</div><div class="txs tmm">Homeroom Teacher</div></div>
          </div>
          <div class="flex gap-8 mt-12">
            <button class="btn btn-primary btn-sm f1" onclick="nav('grades')">View Grades</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }
  window.renderClasses=render;
  render();
}

function openAddClassModal(){
  openModal(`
  <div class="modal-header"><div class="modal-title">Add New Class</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid form-row-2">
      <div class="fg"><label>Grade*</label><select id="clf-gr">${['Grade 1','Grade 2','Grade 3'].map(g=>`<option>${g}</option>`).join('')}</select></div>
      <div class="fg"><label>Section Name*</label><input id="clf-sec" placeholder="e.g. Mabini"></div>
      <div class="fg"><label>Assign Teacher</label><select id="clf-t"><option value="">-- None --</option>${STATE.teachers.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></div>
      <div class="fg"><label>School Year</label><input id="clf-yr" value="2024-2025"></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveClass()">Add Class</button></div>`);
}

function saveClass(){
  const gr=document.getElementById('clf-gr')?.value;
  const sec=document.getElementById('clf-sec')?.value.trim();
  const tid=document.getElementById('clf-t')?.value;
  const yr=document.getElementById('clf-yr')?.value.trim()||'2024-2025';
  if(!sec){ toast('Section name is required.','error'); return; }
  const id='C'+String(STATE.classes.length+1).padStart(3,'0');
  STATE.classes.push({id,grade:gr,section:sec,teacherId:tid||null,year:yr});
  closeModal(); toast('Class added!'); nav('classes');
}

function openEditClassModal(id){
  const c=STATE.classes.find(x=>x.id===id); if(!c) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Edit Class Assignment</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="fg"><label>Assign Teacher</label><select id="eclf-t"><option value="">-- None --</option>${STATE.teachers.map(t=>`<option value="${t.id}" ${t.id===c.teacherId?'selected':''}>${t.name}</option>`).join('')}</select></div>
      <div class="fg"><label>School Year</label><input id="eclf-yr" value="${c.year}"></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateClass('${id}')">Save</button></div>`);
}

function updateClass(id){
  const c=STATE.classes.find(x=>x.id===id); if(!c) return;
  c.teacherId=document.getElementById('eclf-t')?.value||null;
  c.year=document.getElementById('eclf-yr')?.value.trim()||c.year;
  closeModal(); toast('Class updated!'); nav('classes');
}

function deleteClass(id,name){
  showConfirm('Delete Class',`Remove class <strong>${name}</strong>?`,()=>{
    const idx=STATE.classes.findIndex(c=>c.id===id);
    if(idx>=0){ STATE.classes.splice(idx,1); toast(`${name} deleted.`); nav('classes'); }
  });
}
/* ════════════════════════════════════════
   GRADES PAGE
   ════════════════════════════════════════ */
function pgGrades(el){
  const role = STATE.currentUser.role;
  const isParent = role === 'parent';
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  let activeQ = 0;
  let activeGrade = null;
  let changed = {};

  function getStudents(){
    if (isParent) return STATE.students.filter(s=>s.id===resolveParentChildId(STATE.currentUser));
    if (isAdmin) return STATE.students.filter(s=>STATE.grades[s.id]);
    return STATE.students.filter(s=>
      s.section===STATE.currentUser.section &&
      s.grade===STATE.currentUser.grade &&
      s.status==='active'
    );
  }

  function subjectsForStudent(student){
    return STATE.subjectSets[student.grade] || STATE.subjects;
  }

  function render(){
    const students = getStudents();
    const gradeLevels = [...new Set(students.map(student=>student.grade))]
      .sort((a,b)=>Number(a.match(/\d+/)?.[0]||0)-Number(b.match(/\d+/)?.[0]||0));
    if (isAdmin && !gradeLevels.includes(activeGrade)) activeGrade = gradeLevels[0] || null;
    const visibleStudents = isAdmin ? students.filter(student=>student.grade===activeGrade) : students;
    const displaySubjects = isAdmin
      ? STATE.subjectSets[activeGrade] || STATE.subjects
      : visibleStudents.length ? subjectsForStudent(visibleStudents[0]) : STATE.subjects;
    el.innerHTML=`
    <div class="page-head">
<div>
  <div class="page-title">
    ${isParent ? 'Academic Record' : isAdmin ? 'Grade Overview' : 'Grade Entry'}
  </div>

  <div class="page-sub">
    ${isParent
      ? (STATE.currentUser.childId || 'View your child grades')
      : isAdmin
        ? 'View and monitor student grades'
        : 'Encode and manage student grades'}
  </div>
</div>
      ${isTeacher
        ? `<div class="page-actions">
            <button class="btn btn-secondary" onclick="resetGrades()">Reset</button>
            <button class="btn btn-primary" onclick="saveGrades()">💾 Save Grades</button>
           </div>`
        : ''}
    </div>
    ${isAdmin?`<div class="tab-bar grade-level-tabs">
      ${gradeLevels.map(grade=>`<button class="tab-btn grade-level-tab ${grade===activeGrade?'active':''}" data-grade="${grade}">${grade}</button>`).join('')}
    </div>`:''}
    <div class="tab-bar">
      ${STATE.quarters.map((q,i)=>
        `<button class="tab-btn ${i===activeQ?'active':''}" data-qi="${i}">${q}</button>`
      ).join('')}
    </div>
    ${isParent && students.some(student=>student.grade==='Grade 1')?`<div class="card mb-16"><details><summary>Grade 1 Performance Descriptors</summary><div class="g2 mt-12">${grade1Scale.map(level=>`<div class="flex aifs gap-10" style="padding:8px 0"><span class="badge bg-blue">${level.letter}</span><div><div class="fw6 ts">${level.name}</div><div class="txs tm mt-4">${level.description}</div></div></div>`).join('')}</div></details></div>`:''}
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            ${activeQ===4
              ? STATE.quarters.slice(0,4).map(q=>`<th>${q}</th>`).join('')
              : displaySubjects.map(s=>`<th>${STATE.subjectLabels[s]}</th>`).join('')}
            <th>Average</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${visibleStudents.map(s=>{
            const g = STATE.grades[s.id]||{};
            const showFinal = activeQ===4;
            const applicableSubjects = new Set(subjectsForStudent(s));
            const scores = showFinal
              ? STATE.quarters.slice(0,4).map((_,qi)=>
                  averageScores(subjectsForStudent(s).map(sub=>g[sub]?.[qi]))
                )
              : displaySubjects.map(sub=>applicableSubjects.has(sub)
                  ? normalizeGradeValue(g[sub]?.[activeQ])
                  : null
                );
            const ov = averageScores(scores) ?? 0;
            const honors = showFinal ? getHonors(ov) : null;
            return `<tr>
              <td>
                <div class="flex aic gap-8">
                  <div class="av av-32 av-green">${ini(s.name)}</div>
                  <div>
                    <div class="fw6">${s.name}</div>
                    <div class="txs tmm">${s.grade} – ${s.section}</div>
                  </div>
                </div>
              </td>
              ${scores.map((sc,i)=>{
                if(showFinal){
                  return `<td><span class="badge ${sc===null?'bg-gray':gbadge(sc)}">${gradeDisplay(s,sc)}</span></td>`;
                }
                const sub = displaySubjects[i];
                const key = `${s.id}-${sub}-${activeQ}`;
                if(sc===null || isParent || isAdmin){
                  return `<td><span class="badge ${sc===null||sc===0?'bg-gray':gbadge(sc)}">${gradeDisplay(s,sc)}</span></td>`;
                }
                return `<td>
                  ${s.grade==='Grade 1'
                    ? `<select class="grade-cell ${changed[key]?'changed':''}" data-sid="${s.id}" data-sub="${sub}" data-qi="${activeQ}" onchange="onGradeChange(this,'${key}')"><option value="0" ${gradeDisplay(s,sc)==='—'?'selected':''}>—</option>${grade1Scale.map(level=>`<option value="${level.value}" ${gradeDisplay(s,sc)===level.letter?'selected':''}${isParent ? ` title="${level.name}: ${level.description}"` : ''}>${level.letter}</option>`).join('')}</select>`
                    : `<input class="grade-cell ${changed[key]?'changed':''}" type="number" min="0" max="100" value="${sc}" data-sid="${s.id}" data-sub="${sub}" data-qi="${activeQ}" onchange="onGradeChange(this,'${key}')">`}
                </td>`;
              }).join('')}
              <td><strong style="color:${gradeColor(s,ov)}">${gradeDisplay(s,ov)}</strong></td>
              <td><span class="badge ${ov?gbadge(ov):'bg-gray'}">${s.grade==='Grade 1'?gradeDisplay(s,ov):glabel(ov)}</span>${isParent && s.grade==='Grade 1' && gradeDisplay(s,ov)!=='—'?`<div class="txs mt-4">${grade1Descriptor(gradeDisplay(s,ov))?.name||''}</div>`:''}${honors?`<div class="txs mt-4" style="color:var(--gold)">${honors.icon} ${honors.label}</div>`:''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

    el.querySelectorAll('.tab-btn[data-qi]').forEach(btn=>{
      btn.onclick=()=>{ activeQ=parseInt(btn.dataset.qi); changed={}; render(); };
    });
    el.querySelectorAll('.grade-level-tab').forEach(btn=>{
      btn.onclick=()=>{ activeGrade=btn.dataset.grade; changed={}; render(); };
    });
  }

  window.onGradeChange=(inp,key)=>{
    if(!isTeacher){ toast('Only teachers can edit grades.','error'); return; }
    let v=parseInt(inp.value)||0;
    if(v<0)v=0; if(v>100)v=100;
    inp.value=v;
    const sid=inp.dataset.sid, sub=inp.dataset.sub, qi=parseInt(inp.dataset.qi);
    if(!STATE.grades[sid]) STATE.grades[sid]={};
    if(!STATE.grades[sid][sub]) STATE.grades[sid][sub]=[0,0,0,0];
    STATE.grades[sid][sub][qi]=v;
    changed[key]=true;
    inp.classList.add('changed');
    if (typeof checkAndSendFailingAlerts === 'function' && v>0 && v<75) {
      const qLabel = STATE.quarters[qi] || `Q${qi+1}`;
      const sent = checkAndSendFailingAlerts(sid, sub, qLabel, v, STATE.currentUser.name);
      if (sent) {
        toast(`⚠️ Alert sent to parent: ${STATE.students.find(x=>x.id===sid)?.name} failed ${STATE.subjectLabels[sub]||sub}`, 'error');
        updateUnreadBadge();
      }
    }
  };

  window.saveGrades=async()=>{
    if(!isTeacher){ toast('Only teachers can save grades.','error'); return; }
    const studentsToSave=getStudents();
    if(typeof api!=='undefined'&&api.getToken()){
      const gradesToSave=Object.fromEntries(studentsToSave.map(student=>[student.id,STATE.grades[student.id]||{}]));
      try{
        await api.bulkUpdateGrades(gradesToSave);
      }catch(error){
        toast(error.message||'Grades could not be saved. Check your connection and try again.','error');
        return;
      }
    }
    changed={};
    toast('Grades saved successfully!');
    render();
  };

  window.resetGrades=()=>{
    if(!isTeacher){ toast('Only teachers can reset grades.','error'); return; }
    const students=getStudents();
    students.forEach(s=>{
      if(!STATE.grades[s.id]) STATE.grades[s.id]={};
      subjectsForStudent(s).forEach(sub=>{
        if(!STATE.grades[s.id][sub]) STATE.grades[s.id][sub]=[0,0,0,0];
        if(activeQ===4){
          STATE.grades[s.id][sub]=[0,0,0,0];
        } else {
          STATE.grades[s.id][sub][activeQ]=0;
        }
      });
    });
    changed={};
    render();
    toast('Grades reset to zero.','info');
  };

  render();
}
/* ════════════════════════════════════════
   ATTENDANCE PAGE
   ════════════════════════════════════════ */
function pgAttendance(el){
  const role = STATE.currentUser.role;
  const isParent = role === 'parent';
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const calTypes=['att-h','att-h','att-p','att-p','att-p','att-a','att-p','att-p','att-p','att-p','att-p','att-h','att-h','att-p','att-p','att-p','att-p','att-a','att-p','att-p','att-p','att-h','att-h','att-p','att-p','att-p','att-p','att-p','att-h','att-h','att-p'];
  const todayDate = new Date().toISOString().split('T')[0];
  let selDate = todayDate;
  let todayRecords = {};

  function getStudents(){
    if (isParent) return STATE.students.filter(s=>s.id===resolveParentChildId(STATE.currentUser));
    if (isAdmin) return STATE.students.filter(s=>STATE.attendance[s.id]);
    return STATE.students.filter(s=>
      s.section===STATE.currentUser.section &&
      s.grade===STATE.currentUser.grade &&
      s.status==='active'
    );
  }

  function selectedStatus(studentId){
    const recorded=STATE.attendanceDays?.[studentId]?.[selDate];
    const status=todayRecords[studentId]||recorded;
    return ['Absent','Late','Half-day'].includes(status)?status:'Present';
  }

  function buildRealCalendar(sid){
    if(!STATE.attendanceDays) STATE.attendanceDays = {};
    const days = STATE.attendanceDays[sid];
    if(!days || Object.keys(days).length===0) return null;
    const dates = Object.keys(days).sort();
    const firstOfMonth = new Date(dates[dates.length-1]);
    const year = firstOfMonth.getFullYear(), month = firstOfMonth.getMonth();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const startDow = new Date(year, month, 1).getDay();
    let cells='';
    for(let i=0;i<startDow;i++) cells+='<div class="att-cal-cell att-h" style="visibility:hidden"></div>';
    for(let d=1; d<=daysInMonth; d++){
      const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const st = days[iso];
      const cls = st==='Absent'?'att-a':st==='Late'?'att-l':st==='Half-day'?'att-half':st?'att-p':'att-h';
      cells += `<div class="att-cal-cell ${cls}" title="${iso}">${d}</div>`;
    }
    const monthLabel = firstOfMonth.toLocaleDateString('en-PH',{month:'long',year:'numeric'});
    return {cells, monthLabel};
  }

  function render(){
    const students = getStudents();
    el.innerHTML=`
    <div class="page-head">
   <div>
  <div class="page-title">
    Attendance ${isParent ? 'Record' : isAdmin ? 'Overview' : 'Tracking'}
  </div>

  <div class="page-sub">
    ${isAdmin 
      ? 'Mark and monitor attendance for all classes' 
      : isParent 
        ? (STATE.currentUser.childId || 'View your child attendance record')
        : 'Mark and monitor daily attendance'}
  </div>
</div>
      ${isTeacher
     ? `<button class="btn btn-primary" onclick="saveAttendance()">💾 Save Attendance</button>`
  : ''}
    </div>

    ${isTeacher ? `
    <div class="card mb-16">
      <div class="flex aic gap-14">
        <div class="flex aic gap-10">
          <label class="txs tmm fw7">DATE:</label>
          <input type="date" value="${selDate}" id="att-date"
            style="padding:8px 12px;border:1.5px solid var(--border);border-radius:var(--r);font-size:13px;outline:none"
            onchange="setAttendanceDate(this.value)">
        </div>
      </div>
      <div class="txs tm mt-8" id="att-holiday-note">Checking Philippine holidays…</div>
    </div>` : ''}

    <div class="${isParent?'g2':''}">
      <div class="tbl-wrap ${isParent?'':'mb-16'}">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Half-day</th>
              <th>Rate</th>
              ${isAdmin ? `<th>Status</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${students.map(s=>{
              const a = STATE.attendance[s.id]||{present:0,absent:0,half_day:0,tardy:0,late:0,total:45};
              const rate = a.total ? Math.round((a.present+(a.half_day||0)*0.5)/a.total*100) : 0;
              const cur=selectedStatus(s.id);
              return `<tr>
                <td>
                  <div class="flex aic gap-8" style="flex-wrap:wrap">
                    <div class="av av-32 av-green">${ini(s.name)}</div>
                    <div class="fw6">${s.name}</div>
                    ${isTeacher ? `<div class="flex gap-4">${[['Present','P'],['Absent','A'],['Late','L'],['Half-day','1/2']].map(([status,label])=>`<button type="button" class="btn btn-xs ${cur===status?'btn-primary':'btn-secondary'}" title="${status}" aria-label="${status} for ${s.name}" aria-pressed="${cur===status}" data-sid="${s.id}" data-status="${status}" onclick="setAttendanceStatus(this)">${label}</button>`).join('')}</div>` : ''}
                  </div>
                </td>
                <td><span class="badge bg-green">${a.present}</span></td>
                <td><span class="badge bg-red">${a.absent}</span></td>
                <td><span class="badge bg-amber">${a.late||0}</span></td>
                <td><span class="badge bg-gray">${a.half_day||0}</span></td>
                <td>
                  <div class="flex aic gap-8">
                    <div style="flex:1;height:5px;background:var(--surface2);border-radius:3px">
                      <div style="height:100%;width:${rate}%;background:${rate>=90?'var(--green)':rate>=75?'var(--amber)':'var(--red)'};border-radius:3px"></div>
                    </div>
                    <span class="txs fw6" style="color:${rate>=90?'var(--green)':rate>=75?'var(--amber)':'var(--red)'};min-width:30px">${rate}%</span>
                  </div>
                </td>
                ${isAdmin ? `
                <td><span class="badge bg-gray">${cur}</span></td>
                ` : ''}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${isParent ? (()=>{
        const real = buildRealCalendar(STATE.currentUser.childId);
        return `
      <div class="card">
       <div class="card-title">Attendance Calendar${real?` – ${real.monthLabel}`:' – May 2026'} &nbsp;·&nbsp; Polangui South Central School</div>
        <div class="att-cal">
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="att-cal-hdr">${d}</div>`).join('')}
          ${real ? real.cells : Array.from({length:31},(_,i)=>`<div class="att-cal-cell ${calTypes[i]}" title="${i+1}">${i+1}</div>`).join('')}
        </div>
        <div class="att-legend">
          <div class="att-leg-item"><div class="att-leg-dot" style="background:var(--blue-l)"></div>Present</div>
          <div class="att-leg-item"><div class="att-leg-dot" style="background:#FDECEC"></div>Absent</div>
          <div class="att-leg-item"><div class="att-leg-dot" style="background:var(--surface2)"></div>No class</div>
        </div>
      </div>`; })() : ''}
    </div>

    ${isTeacher ? `
    <div class="card mt-16">
      <div class="card-title">Attendance Rate Summary</div>
      ${students.map(s=>{
        const a = STATE.attendance[s.id]||{present:0,absent:0,late:0,total:45};
        const rate = a.total ? Math.round((a.present+(a.half_day||0)*0.5)/a.total*100) : 0;
        return `<div class="prog-wrap">
          <div class="prog-top">
            <span class="ts fw6">${s.name}</span>
            <span class="ts" style="color:${rate>=90?'var(--green)':rate>=75?'var(--amber)':'var(--red)'}">${rate}%</span>
          </div>
          <div class="prog-track">
            <div class="prog-fill" style="width:${rate}%;background:${rate>=90?'var(--green)':rate>=75?'var(--amber)':'var(--red)'}"></div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}`;

    loadPhilippineHoliday(selDate).then(holiday=>{
      const note=document.getElementById('att-holiday-note');
      if(note) note.textContent=holiday?`Public holiday: ${holiday.localName||holiday.name}`:'No public holiday listed for this date.';
    }).catch(()=>{
      const note=document.getElementById('att-holiday-note');
      if(note) note.textContent='Holiday information is unavailable right now.';
    });

    window.saveAttendance=async()=>{
      if(!isTeacher){ toast('Only teachers can save attendance.','error'); return; }
      const students2 = getStudents();
      const records = {};
      students2.forEach(s=>{ records[s.id] = selectedStatus(s.id); });
      const isApiUser=typeof api!=='undefined'&&Boolean(api.getToken());
      if(isApiUser){
        try {
          await api.markAttendance(selDate, records);
          const refreshed=await api.getAttendance();
          STATE.attendance=Object.fromEntries(Object.entries(refreshed).map(([studentId,record])=>{
            const {days,...totals}=record; return [studentId,totals];
          }));
          STATE.attendanceDays=Object.fromEntries(Object.entries(refreshed).map(([studentId,record])=>[studentId,record.days||{}]));
        } catch(e) {
          toast(e.message||'Attendance could not be saved.','error');
          return;
        }
      }
      if(!STATE.attendanceDays) STATE.attendanceDays = {};
      if(!isApiUser) students2.forEach(s=>{
        const val=selectedStatus(s.id);
        if(!STATE.attendance[s.id]) STATE.attendance[s.id]={present:0,absent:0,half_day:0,tardy:0,late:0,total:0};
        if(!STATE.attendanceDays[s.id]) STATE.attendanceDays[s.id]={};
        const summary=STATE.attendance[s.id];
        ['present','absent','half_day','tardy','late','total'].forEach(key=>{summary[key]??=0;});
        const old=STATE.attendanceDays[s.id][selDate];
        const adjust=(status,amount)=>{
          if(status==='Absent') summary.absent+=amount;
          else if(status==='Half-day') summary.half_day+=amount;
          else if(status==='Tardy'){summary.tardy+=amount;summary.present+=amount;}
          else if(status==='Late'){summary.late+=amount;summary.present+=amount;}
          else if(status==='Present') summary.present+=amount;
        };
        if(old) adjust(old,-1); else STATE.attendance[s.id].total++;
        adjust(val,1);
        STATE.attendanceDays[s.id][selDate]=val;
      });
      todayRecords={};
      toast('Attendance saved for '+selDate+'!');
      render();
    };

    window.setAttendanceStatus=(button)=>{
      todayRecords[button.dataset.sid]=button.dataset.status;
      el.querySelectorAll(`[data-sid="${button.dataset.sid}"][data-status]`).forEach(option=>{
        const active=option.dataset.status===button.dataset.status;
        option.classList.toggle('btn-primary',active);
        option.classList.toggle('btn-secondary',!active);
        option.setAttribute('aria-pressed',String(active));
      });
    };
    window.setAttendanceDate=(value)=>{ selDate=value; todayRecords={}; render(); };
  }

  render();
}

const philippineHolidayCache=new Map();
async function loadPhilippineHoliday(isoDate){
  const year=isoDate.slice(0,4);
  if(!philippineHolidayCache.has(year)){
    const response=await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
    if(!response.ok) throw new Error('Holiday API request failed.');
    philippineHolidayCache.set(year,await response.json());
  }
  return philippineHolidayCache.get(year).find(item=>item.date===isoDate)||null;
}
/* ════════════════════════════════════════
   MESSAGES PAGE — fully functional inbox
   ════════════════════════════════════════ */
function pgMessages(el){
  el = el || document.getElementById('content');

  const u = STATE.currentUser;
  let searchQ = '';
  let activePartnerId = null;
  let showArchived = false;

  function getThreads(){
    const all = STATE.messages.filter(m =>
      !m.isAlert &&
      !(STATE.archivedMessages||[]).includes('message-'+m.id) &&
      (m.toRole === u.role ||
       m.toRole === 'all' ||
       m.fromId === u.id ||
       u.role === 'admin')
    );

    const threadMap = {};

    all.forEach(m => {
      const partnerId = m.fromId === u.id ? m.toId : m.fromId;

      const partnerName = m.fromId === u.id
        ? (m.toId === 'teacher'
            ? 'Ms. Maria Santos'
            : m.toId === 'admin'
              ? 'Principal Roberto Cruz'
              : STATE.parents.find(p => p.id === m.toId)?.name || m.toId)
        : m.fromName;

      if (!threadMap[partnerId]) {
        threadMap[partnerId] = {
          partnerId,
          partnerName,
          messages: [],
          unread: 0
        };
      }

      threadMap[partnerId].messages.push(m);

      if (!m.read && m.toId === u.id) {
        threadMap[partnerId].unread++;
      }
    });

    Object.values(threadMap).forEach(t => {
      t.messages.sort((a, b) =>
        new Date(a.date + ' ' + a.time) -
        new Date(b.date + ' ' + b.time)
      );
      t.lastMsg = t.messages[t.messages.length - 1];
    });

    let threads = Object.values(threadMap).filter(t => showArchived
      ? (STATE.archivedMessages||[]).includes(t.partnerId)
      : !(STATE.archivedMessages||[]).includes(t.partnerId));

    if (searchQ) {
      const q = searchQ.toLowerCase();
      threads = threads.filter(t =>
        t.partnerName.toLowerCase().includes(q) ||
        t.lastMsg.subject.toLowerCase().includes(q) ||
        t.lastMsg.body.toLowerCase().includes(q)
      );
    }

    return threads.sort((a, b) =>
      new Date(b.lastMsg.date + ' ' + b.lastMsg.time) -
      new Date(a.lastMsg.date + ' ' + a.lastMsg.time)
    );
  }

  function getAlerts(){
    return STATE.messages.filter(m => m.isAlert && (m.toId===u.id || (u.role==='admin')) && (showArchived
      ? (STATE.archivedMessages||[]).includes('alert-'+m.id)
      : !(STATE.archivedMessages||[]).includes('alert-'+m.id)));
  }

  function renderThreadRows(){
    const threads = getThreads();
    const alerts = getAlerts();
    const list = document.getElementById('thread-list');
    if (!list) return;

    const alertHtml = alerts.map(a=>`
      <div onclick="openAlertMessage(${a.id})"
        style="padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer;
        display:flex;align-items:center;gap:12px;background:${a.read?'white':'var(--red-l)'};border-left:3px solid var(--red)">
        <div style="width:50px;height:50px;border-radius:50%;background:var(--red-l);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">⚠️</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:${a.read?600:700};color:var(--text)">🔔 TrackEd Alert</div>
          <div style="font-size:12.5px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.subject}</div>
        </div>
      </div>`).join('');

    list.innerHTML = (threads.length === 0 && alerts.length===0)
      ? `
        <div style="padding:60px 20px;text-align:center;color:var(--text3)">
          <div style="font-size:48px;margin-bottom:12px">${showArchived?'📁':'💬'}</div>
          <div style="font-weight:700;font-size:15px;color:var(--text2);margin-bottom:6px">
            ${showArchived?'No archived conversations':'No conversations yet'}
          </div>
          <div style="font-size:13px">
            ${showArchived?'Conversations you archive will show up here.':'Start a new message to connect'}
          </div>
        </div>`
      : alertHtml + threads.map(t => {
          const isMine = t.lastMsg.fromId === u.id;
          const preview =
            (isMine ? 'You: ' : '') +
            t.lastMsg.body.slice(0, 55) +
            (t.lastMsg.body.length > 55 ? '...' : '');

          const isActive = t.partnerId === activePartnerId;

          return `
            <div class="msg-thread-row" onclick="openThread('${t.partnerId}')"
              style="padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer;
              display:flex;align-items:center;gap:12px;
              background:${isActive ? 'var(--green-l)' : 'white'};transition:background .1s"
              onmouseover="this.style.background='var(--bg)'"
              onmouseout="this.style.background='${isActive ? 'var(--green-l)' : 'white'}'">

              <div style="position:relative;flex-shrink:0">
                <div style="width:50px;height:50px;border-radius:50%;background:var(--green-l);
                  display:flex;align-items:center;justify-content:center;
                  font-weight:700;font-size:16px;color:var(--green)">
                  ${ini(t.partnerName)}
                </div>

                ${t.unread > 0 ? `
                  <div style="position:absolute;top:0;right:0;width:18px;height:18px;
                    background:var(--green);border-radius:50%;border:2px solid white;
                    display:flex;align-items:center;justify-content:center;
                    font-size:9px;font-weight:700;color:white">
                    ${t.unread}
                  </div>` : ''}
              </div>

              <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
                  <div style="font-size:14px;font-weight:${t.unread > 0 ? 700 : 600};
                    color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:65%">
                    ${t.partnerName}
                  </div>
                  <div style="font-size:11px;color:var(--text3);flex-shrink:0">
                    ${t.lastMsg.time}
                  </div>
                </div>

                <div style="font-size:12.5px;color:${t.unread > 0 ? 'var(--text)' : 'var(--text2)'};
                  font-weight:${t.unread > 0 ? 600 : 400};
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${preview}
                </div>
              </div>

            </div>`;
        }).join('');
  }

  window.openAlertMessage = function(alertId){
    const a = STATE.messages.find(m=>m.id===alertId && m.isAlert);
    if(!a) return;
    a.read = true;
    updateUnreadBadge();
    renderThreadRows();
    openModal(`
      <div class="modal-header" style="background:var(--red);padding:16px 20px">
        <div style="color:#fff;font-weight:700">🔔 TrackEd Alert</div>
        <button onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="fw7 ts mb-8">${a.subject}</div>
        <p class="ts tm" style="white-space:pre-line;line-height:1.7">${a.body}</p>
      </div>
      <div class="modal-footer">
        ${showArchived
          ? `<button class="btn btn-secondary" onclick="unarchiveAlert(${a.id});closeModal()">Unarchive</button>`
          : `<button class="btn btn-secondary" onclick="archiveAlert(${a.id});closeModal()">📁 Archive</button>`}
        <button class="btn btn-primary" onclick="closeModal()">Close</button>
      </div>`);
  };
  window.archiveAlert = function(alertId){
    if(!STATE.archivedMessages) STATE.archivedMessages=[];
    STATE.archivedMessages.push('alert-'+alertId);
    renderThreadRows();
    toast('Alert archived.');
  };
  window.unarchiveAlert = function(alertId){
    STATE.archivedMessages = (STATE.archivedMessages||[]).filter(x=>x!=='alert-'+alertId);
    renderThreadRows();
    toast('Alert moved back to inbox.');
  };

  function openThread(partnerId){
    activePartnerId = partnerId;
    el.classList.add('message-conversation-open');

    const threads = getThreads();
    const thread = threads.find(t => t.partnerId === partnerId);
    if (!thread) {
      closeMessageDetail();
      return;
    }

    thread.messages.forEach(m => {
      if (!m.read && m.toId === u.id) m.read = true;
    });

    thread.unread = 0;
    updateUnreadBadge();
    buildSidebar(u.role);
    renderThreadRows();

    const chatHTML = thread.messages.map((m, index) => {
      const isMine = m.fromId === u.id;

      return `
        <div style="display:flex;flex-direction:column;
          align-items:${isMine ? 'flex-end' : 'flex-start'};
          margin-bottom:12px;padding:0 8px">

          <div class="msg-bubble-wrap" style="${isMine ? 'flex-direction:row-reverse' : ''}">
            ${!isMine ? `<div class="msg-bubble-avatar">${ini(m.fromName || thread.partnerName)}</div>` : ''}
            <div>
              <div class="msg-bubble ${isMine ? 'outgoing' : 'incoming'}">
              ${m.body.replace(/\n/g, '<br>')}
              </div>
              <div class="msg-bubble-meta" style="text-align:${isMine ? 'right' : 'left'}">${m.time || ''}</div>
            </div>

          </div>
        </div>`;
    }).join('');

    const detail = document.getElementById('message-detail');
    if (!detail) return;
    detail.closest('.msg-layout')?.classList.add('message-open');
    detail.innerHTML = `
      <div class="msg-panel-head">
        <button class="btn btn-secondary btn-xs msg-back-btn" onclick="closeMessageDetail()" aria-label="Back to messages" title="Back to messages">Back</button>
        <div class="msg-contact">
          <div class="av av-40 av-blue">${ini(thread.partnerName)}</div>
          <div>
            <div class="msg-contact-name">${thread.partnerName}</div>
            <div class="msg-panel-meta">${thread.messages.length} message${thread.messages.length===1?'':'s'} in this conversation</div>
          </div>
        </div>
        <div class="msg-panel-actions">
          ${showArchived
            ? `<button class="btn btn-secondary btn-xs" onclick="unarchiveThreadPartner('${partnerId}')" title="Unarchive conversation">Unarchive</button>`
            : `<button class="btn btn-secondary btn-xs" onclick="archiveThreadPartner('${partnerId}')" title="Archive conversation">📁 Archive</button>`}
          <button class="btn btn-secondary btn-xs" onclick="deleteThreadPartner('${partnerId}')" title="Delete conversation">🗑 Delete</button>
        </div>
      </div>
      <div id="chat-body" class="msg-panel-body msg-chat-body">
        ${chatHTML}
      </div>
      <div class="msg-panel-reply">
        <label class="sr-only" for="reply-area">Reply to ${thread.partnerName}</label>
        <textarea id="reply-area" placeholder="Write a reply..."></textarea>
        <button class="btn btn-primary msg-send-btn" type="button" onclick="sendReply('${partnerId}')" aria-label="Send reply">Send</button>
      </div>
    `;
    detail.querySelector('#reply-area').focus();

    window.sendReply = function(toPartnerId){
      const txt = document.getElementById('reply-area').value.trim();
      if (!txt) return;

      const newMsg = {
        id: STATE.nextMsgId++,
        fromRole: u.role,
        fromId: u.id,
        fromName: u.name,
        toId: toPartnerId,
        body: txt,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'}),
        read: false
      };

      STATE.messages.unshift(newMsg);
      updateUnreadBadge();
      buildSidebar(u.role);
      closeModal();
      setTimeout(() => openThread(toPartnerId), 100);
    };
  }

  window.unarchiveThreadPartner = function(partnerId){
    STATE.archivedMessages = (STATE.archivedMessages||[]).filter(x=>x!==partnerId);
    closeModal();
    renderThreadRows();
    toast('Conversation moved back to inbox.');
  };

  window.archiveMessage = function(messageId, partnerId){
    if(!STATE.archivedMessages) STATE.archivedMessages=[];
    if(!STATE.archivedMessages.includes('message-'+messageId)) STATE.archivedMessages.push('message-'+messageId);
    toast('Message archived.');
    openThread(partnerId);
  };

  window.deleteMessage = function(messageId, partnerId){
    showConfirm('Delete Message','Permanently delete this message?',()=>{
      STATE.messages = STATE.messages.filter(message => message.id !== messageId);
      toast('Message deleted.');
      openThread(partnerId);
    });
  };

  window.closeMessageDetail = function(){
    activePartnerId = null;
    el.classList.remove('message-conversation-open');
    document.querySelector('.msg-layout')?.classList.remove('message-open');
    const detail = document.getElementById('message-detail');
    if(detail) detail.innerHTML = '<div class="msg-empty"><div class="msg-empty-icon">✉</div><strong>Select a conversation</strong><span>Choose a message from your inbox to read and reply.</span></div>';
    renderThreadRows();
  };
  window.archiveThreadPartner = function(partnerId){
    if(!STATE.archivedMessages) STATE.archivedMessages=[];
    if(!STATE.archivedMessages.includes(partnerId)) STATE.archivedMessages.push(partnerId);
    closeModal();
    renderThreadRows();
    toast('Conversation archived.');
  };
  window.deleteThreadPartner = function(partnerId){
    showConfirm('Delete Conversation','Permanently remove this entire conversation?',()=>{
      STATE.messages = STATE.messages.filter(m=>!( (m.fromId===partnerId && m.toId===u.id) || (m.fromId===u.id && m.toId===partnerId) ));
      closeModal();
      updateUnreadBadge();
      buildSidebar(u.role);
      renderThreadRows();
      toast('Conversation deleted.','info');
    });
  };

  function render(){
    const archivedCount = (STATE.archivedMessages||[]).length;
    el.classList.toggle('message-conversation-open',Boolean(activePartnerId));
    el.innerHTML = `
      <div class="page-head msg-page-head">
        <div>
          <div class="page-title">${showArchived?'Archived Messages':'Messages'}</div>
          <div class="page-sub">Keep conversations with your school community in one place.</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="openComposeModal()">+ New Message</button>
          <button class="btn btn-secondary btn-sm" onclick="toggleArchivedView()">
            ${showArchived?'Back to Inbox':`📁 Archived${archivedCount?` (${archivedCount})`:''}`}
          </button>
        </div>
      </div>

      <div class="msg-layout">
        <aside class="msg-list">
          <div class="msg-list-head">
            <span>${showArchived?'Archived':'Inbox'}</span>
            <span class="msg-list-count" id="msg-list-count"></span>
          </div>
          <div class="msg-search-wrap">
            <label class="sr-only" for="msg-search">Search messages</label>
            <input id="msg-search" class="msg-search" placeholder="Search conversations" oninput="handleMsgSearch(this.value)">
          </div>
          <div id="thread-list" class="msg-list-body"></div>
        </aside>
        <section id="message-detail" class="msg-panel" aria-live="polite">
          <div class="msg-empty">
            <div class="msg-empty-icon">✉</div>
            <strong>Select a conversation</strong>
            <span>Choose a message from your inbox to read and reply.</span>
          </div>
        </section>
      </div>
    `;

    window.handleMsgSearch = (val) => {
      searchQ = val;
      renderThreadRows();
    };

    window.openThread = openThread;
    window.toggleArchivedView = () => { showArchived = !showArchived; activePartnerId = null; searchQ=''; render(); };

    setTimeout(renderThreadRows, 0);
  }

  render();
}

function openComposeModal(){
  const u=STATE.currentUser;
  const toOptions = u.role==='teacher'?
    `<option value="">-- Select recipient --</option>
     <option value="admin|admin">Principal Roberto Cruz (Admin)</option>
     ${STATE.parents.filter(p=>p.children.some(cid=>STATE.students.find(s=>s.id===cid&&s.section===u.section&&s.grade===u.grade))).map(p=>`<option value="parent|${p.id}">Parent: ${p.name}</option>`).join('')}`
    :u.role==='parent'?
    `<option value="teacher|teacher">Ms. Maria Santos (Teacher)</option>
     <option value="admin|admin">Principal Roberto Cruz (Admin)</option>`
    :`<option value="">-- Select recipient --</option>
     ${STATE.teachers.map(t=>`<option value="teacher|${t.id}">${t.name} (Teacher)</option>`).join('')}
     <option value="all|all">All Teachers (Broadcast)</option>`;

  const studentOptions = u.role!=='parent'?
    `<option value="">-- None --</option>${STATE.students.map(s=>`<option value="${s.id}">${s.name} – ${s.grade} ${s.section}</option>`).join('')}`:'';

  openModal(`
  <div class="modal-header"><div class="modal-title">Compose Message</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="fg"><label>To*</label><select id="cm-to">${toOptions}</select></div>
      ${u.role!=='parent'?`<div class="fg"><label>Regarding Student (optional)</label><select id="cm-sid">${studentOptions}</select></div>`:''}
      <div class="fg"><label>Subject*</label><input id="cm-sub" placeholder="Message subject"></div>
      <div class="fg"><label>Message*</label><textarea id="cm-body" placeholder="Write your message here..." style="min-height:120px"></textarea></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="sendCompose()">Send Message</button></div>`);
}

async function sendCompose(){
  const u=STATE.currentUser;
  const toVal=document.getElementById('cm-to')?.value;
  const sub=document.getElementById('cm-sub')?.value.trim();
  const body=document.getElementById('cm-body')?.value.trim();
  const sid=document.getElementById('cm-sid')?.value||null;
  if(!toVal){ toast('Please select a recipient.','error'); return; }
  if(!sub||!body){ toast('Subject and message are required.','error'); return; }
  const [toRole,toId]=toVal?toVal.split('|'):['',''];
  const newMsg={
    id:STATE.nextMsgId++,
    fromRole:u.role,fromId:u.id,fromName:u.name,
    toRole:toRole||'teacher',toId:toId||'teacher',
    subject:sub,body,
    date:new Date().toISOString().split('T')[0],
    time:new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),
    read:false,studentId:sid,thread:null
  };
  let delivery='local';
  if(typeof api!=='undefined'&&api.getToken()){
    try{
      const result=await api.sendMessage({toRole,toId,subject:sub,body,studentId:sid});
      newMsg.id=result.id||newMsg.id;
      delivery=result.delivery||'in_app';
    }catch(error){
      toast(error.message||'Message could not be sent.','error');
      return;
    }
  }
  STATE.messages.unshift(newMsg);
  updateUnreadBadge(); buildSidebar(u.role);
  closeModal();
  toast(delivery==='telegram_sent'?'Message saved; Telegram notification sent.':delivery==='telegram_failed'?'Message saved in TrackEd, but Telegram notification failed.':delivery==='telegram_unlinked'?'Message saved in TrackEd; recipient has not linked Telegram.':'Message sent successfully!');
  nav('messages');
}
/* ════════════════════════════════════════
   ANNOUNCEMENTS PAGE
   ════════════════════════════════════════ */
function pgAnnouncements(el){
  const isAdmin=STATE.currentUser.role==='admin';
  const isTeacher=STATE.currentUser.role==='teacher';
  const canPost = isTeacher;
  const catIcons = {academic:'📚',event:'📅',holiday:'🎉',general:'📌'};
  window._annFilterCat = window._annFilterCat || 'all';
  function render(){
    const filterCat = window._annFilterCat;
    const cats = ['all','academic','event','holiday','general'];
    const filtered = filterCat==='all' ? STATE.announcements : STATE.announcements.filter(a=>(a.category||'general')===filterCat);
    el.innerHTML=`
    <div class="page-head">
      <div><div class="page-title">Announcements</div><div class="page-sub">${STATE.announcements.length} announcement(s)</div></div>
      ${canPost?`<div class="page-actions"><button class="btn btn-primary" onclick="openAddAnnouncementModal()">📢 Post Announcement</button></div>`:''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">
      ${cats.map(c=>`<button onclick="window._annFilterCat='${c}';if(typeof window._annRerender==='function')window._annRerender()"
        class="btn ${filterCat===c?'btn-primary':'btn-secondary'} btn-sm">${c==='all'?'⊞ All':`${catIcons[c]||'📌'} ${c.charAt(0).toUpperCase()+c.slice(1)}`}</button>`).join('')}
    </div>
    <div style="display:grid;gap:14px">
      ${filtered.map(a=>`
        <div class="card" style="cursor:pointer;overflow-wrap:break-word;word-break:break-word;${a.pinned?'border-color:var(--gold);border-width:2px':''}" onclick="openAnnouncementModal(${a.id})">
          <div class="flex aic jb mb-10" style="flex-wrap:wrap;gap:8px">
            <div class="flex aic gap-8" style="flex-wrap:wrap">
              ${a.pinned?`<span class="badge" style="background:var(--gold-l);color:var(--gold)">📌 Pinned</span>`:''}
              <span class="badge ${a.priority==='high'?'bg-red':'bg-gray'}">${a.priority==='high'?'🔔 Important':'📋 Notice'}</span>
              <span class="badge bg-gray">${catIcons[a.category||'general']||'📌'} ${(a.category||'general').charAt(0).toUpperCase()+(a.category||'general').slice(1)}</span>
              <span class="badge ${a.audience==='all'?'bg-blue':'bg-amber'}">${a.audience==='all'?'Everyone':'Teachers Only'}</span>
            </div>
            ${canPost?`<div class="flex gap-8" style="flex-wrap:wrap"><button class="btn btn-secondary btn-xs" onclick="event.stopPropagation();openEditAnnouncementModal(${a.id})">Edit</button><button class="btn btn-danger btn-xs" onclick="event.stopPropagation();deleteAnnouncement(${a.id},'${a.title.replace(/'/g,"\\'")}')">Delete</button></div>`:''}
          </div>
          <div style="font-size:17px;font-weight:800;letter-spacing:-.3px;margin-bottom:4px;overflow-wrap:break-word;word-break:break-word">${a.title}</div>
          <div class="txs tmm mb-10">By ${a.author} &nbsp;·&nbsp; ${a.date}</div>
          <p class="ts tm" style="line-height:1.7;overflow-wrap:break-word;word-break:break-word;white-space:normal">${a.body}</p>
        </div>`).join('')}
      ${filtered.length===0?`<div class="card"><div class="empty-state"><div class="es-icon">📢</div><div class="es-title">No announcements yet</div></div></div>`:''}
    </div>`;
    window._annRerender=render;
  }
  window._annRerender=render;
  render();
}

function openAnnouncementModal(id){
  const a = STATE.announcements.find(x=>x.id===id);
  if(!a) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">${a.title}</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="flex aic gap-10 mb-16"><span class="badge ${a.priority==='high'?'bg-red':'bg-gray'}">${a.priority==='high'?'Important':'Notice'}</span><span class="badge ${a.audience==='all'?'bg-blue':'bg-amber'}">${a.audience==='all'?'Everyone':'Teachers Only'}</span></div>
    <div class="txs tmm mb-10">By ${a.author} &nbsp;·&nbsp; ${a.date}</div>
    <p class="ts tm" style="line-height:1.8">${a.body}</p>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Close</button></div>`);
}

function openAddAnnouncementModal(){
  openModal(`
  <div class="modal-header"><div class="modal-title">Post Announcement</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="fg"><label>Title*</label><input id="an-ti" placeholder="Announcement title"></div>
      <div class="fg"><label>Message*</label><textarea id="an-bo" placeholder="Write the full announcement..." style="min-height:100px"></textarea></div>
      <div class="form-grid form-row-2">
        <div class="fg"><label>Audience</label><select id="an-au"><option value="all">Everyone</option><option value="teacher">Teachers Only</option><option value="parent">Parents Only</option></select></div>
        <div class="fg"><label>Priority</label><select id="an-pr"><option value="normal">Normal</option><option value="high">Important</option></select></div>
        <div class="fg"><label>Category</label><select id="an-cat"><option value="general">📌 General</option><option value="academic">📚 Academic</option><option value="event">📅 Event</option><option value="holiday">🎉 Holiday</option></select></div>
        <div class="fg"><label>Pin to top?</label><select id="an-pin"><option value="0">No</option><option value="1">Yes</option></select></div>
      </div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAnnouncement()">Post Announcement</button></div>`);
}

function saveAnnouncement(){
  const ti=document.getElementById('an-ti')?.value.trim();
  const bo=document.getElementById('an-bo')?.value.trim();
  const au=document.getElementById('an-au')?.value;
  const pr=document.getElementById('an-pr')?.value;
  const cat=document.getElementById('an-cat')?.value;
  const pin=document.getElementById('an-pin')?.value==='1';
  if(!ti||!bo){ toast('Title and message are required.','error'); return; }
  STATE.announcements.unshift({
    id:STATE.nextAnnId++,title:ti,body:bo,
    date:new Date().toISOString().split('T')[0],
    audience:au,priority:pr,category:cat,pinned:pin,
    author:STATE.currentUser.name,authorRole:STATE.currentUser.role
  });
  closeModal(); toast('Announcement posted!'); window._annFilterCat='all'; nav('announcements');
}

function openEditAnnouncementModal(id){
  const a=STATE.announcements.find(x=>x.id===id); if(!a) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Edit Announcement</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid">
      <div class="fg"><label>Title*</label><input id="ean-ti" value="${a.title.replace(/"/g,'&quot;')}"></div>
      <div class="fg"><label>Message*</label><textarea id="ean-bo" style="min-height:100px">${a.body}</textarea></div>
      <div class="form-grid form-row-2">
        <div class="fg"><label>Audience</label><select id="ean-au"><option value="all" ${a.audience==='all'?'selected':''}>Everyone</option><option value="teacher" ${a.audience==='teacher'?'selected':''}>Teachers Only</option><option value="parent" ${a.audience==='parent'?'selected':''}>Parents Only</option></select></div>
        <div class="fg"><label>Priority</label><select id="ean-pr"><option value="normal" ${a.priority==='normal'?'selected':''}>Normal</option><option value="high" ${a.priority==='high'?'selected':''}>Important</option></select></div>
        <div class="fg"><label>Category</label><select id="ean-cat"><option value="general" ${(a.category||'general')==='general'?'selected':''}>📌 General</option><option value="academic" ${a.category==='academic'?'selected':''}>📚 Academic</option><option value="event" ${a.category==='event'?'selected':''}>📅 Event</option><option value="holiday" ${a.category==='holiday'?'selected':''}>🎉 Holiday</option></select></div>
        <div class="fg"><label>Pinned</label><select id="ean-pin"><option value="0" ${!a.pinned?'selected':''}>No</option><option value="1" ${a.pinned?'selected':''}>Yes</option></select></div>
      </div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateAnnouncement(${id})">Save Changes</button></div>`);
}

function updateAnnouncement(id){
  const a=STATE.announcements.find(x=>x.id===id); if(!a) return;
  a.title=document.getElementById('ean-ti')?.value.trim()||a.title;
  a.body=document.getElementById('ean-bo')?.value.trim()||a.body;
  a.audience=document.getElementById('ean-au')?.value||a.audience;
  a.priority=document.getElementById('ean-pr')?.value||a.priority;
  a.category=document.getElementById('ean-cat')?.value||a.category;
  a.pinned=document.getElementById('ean-pin')?.value==='1';
  closeModal(); toast('Announcement updated!'); if(typeof window._annRerender==='function')window._annRerender(); else nav('announcements');
}

function deleteAnnouncement(id,title){
  showConfirm('Delete Announcement',`Remove "<strong>${title}</strong>"?`,()=>{
    const idx=STATE.announcements.findIndex(a=>a.id===id);
    if(idx>=0){ STATE.announcements.splice(idx,1); toast('Announcement deleted.'); if(typeof window._annRerender==='function')window._annRerender(); else nav('announcements'); }
  });
}

/* ════════════════════════════════════════
   PARENT MANAGEMENT PAGE (Admin)
   ════════════════════════════════════════ */
function pgParents(el){
  let searchVal = '';

  function getFiltered(){
    if(!searchVal.trim()) return STATE.parents;
    const q = searchVal.toLowerCase();
    return STATE.parents.filter(p=>
      p.name.toLowerCase().includes(q)||
      p.email.toLowerCase().includes(q)||
      p.phone.includes(searchVal)
    );
  }

  function escapeAttribute(value){
    return String(value ?? '').replace(/[&<>"']/g, character=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[character]));
  }

  function renderRows(){
    const list = getFiltered();
    const tbody = document.getElementById('parents-tbody');
    if(!tbody) return;
    tbody.innerHTML = list.length===0
      ?`<tr><td colspan="5"><div class="empty-state">
          <div class="es-icon">👨‍👩‍👧</div>
          <div class="es-title">No parents found</div>
          <div class="es-sub">Try a different keyword</div>
        </div></td></tr>`
      :list.map(p=>`<tr>
        <td><div class="flex aic gap-10">
          <div class="av av-32 av-amber">${ini(p.name)}</div>
          <div><div class="fw6">${p.name}</div><div class="txs tmm">${p.id}</div></div>
        </div></td>
        <td>${p.email}</td>
        <td>${p.phone}</td>
        <td>${p.children.map(cid=>STATE.students.find(s=>s.id===cid)?.name||cid).join(', ')}</td>
        <td><button class="btn btn-danger btn-xs" type="button" data-delete-parent="${escapeAttribute(p.id)}" data-parent-name="${escapeAttribute(p.name)}">Delete</button></td>
      </tr>`).join('');
    tbody.onclick = event=>{
      const button = event.target.closest('[data-delete-parent]');
      if(button) deleteParent(button.dataset.deleteParent, button.dataset.parentName);
    };
  }

  el.innerHTML=`
  <div class="page-head">
    <div><div class="page-title">Parents</div>
    <div class="page-sub" id="parents-count">${STATE.parents.length} parent(s)</div></div>
    <div class="page-actions">
    </div>
  </div>
  <div class="tbl-wrap">
    <div class="tbl-toolbar">
      <input class="tbl-search" id="parent-search"
        placeholder="🔍 Search parents..."
        oninput="handleParentSearch(this.value)">
    </div>
    <table>
      <thead><tr>
        <th>Parent</th><th>Email</th><th>Phone</th><th>Children</th><th>Actions</th>
      </tr></thead>
      <tbody id="parents-tbody"></tbody>
    </table>
  </div>`;

  window.handleParentSearch = (val)=>{
    searchVal = val;
    renderRows();
    const count = document.getElementById('parents-count');
    if(count) count.textContent = getFiltered().length+' parent(s)';
  };

  window.refreshParentRows = ()=>{ renderRows(); };
  renderRows();
}
function openAddParentModal(){
  openModal(`
  <div class="modal-header"><div class="modal-title">Add Parent / Guardian</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid form-row-2">
      <div class="fg"><label>Full Name*</label><input id="pf-name" placeholder="Parent name"></div>
      <div class="fg"><label>Email*</label><input id="pf-email" type="email" placeholder="parent@email.com"></div>
      <div class="fg"><label>Phone</label><input id="pf-phone" placeholder="09XXXXXXXXX"></div>
      <div class="fg"><label>Login Password*</label><div class="pass-wrap"><input id="pf-pass" type="password" placeholder="Create a password"><button type="button" class="pass-toggle" onclick="toggleFieldPassword('pf-pass', this)" aria-label="Show password"><svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/></svg></button></div></div>
      <div class="fg"><label>Child</label><select id="pf-child">
        <option value="">-- Select a student --</option>
        ${STATE.students.map(s=>`<option value="${s.id}">${s.name} (${s.grade} ${s.section})</option>`).join('')}
      </select></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveParent()">Save Parent</button></div>`);
}
function saveParent(){
  const name=document.getElementById('pf-name')?.value.trim();
  const email=document.getElementById('pf-email')?.value.trim();
  const phone=document.getElementById('pf-phone')?.value.trim();
  const child=document.getElementById('pf-child')?.value;
  if(!name||!email){ toast('Name and email are required.','error'); return; }
  const id = 'P'+String(STATE.parents.length+1).padStart(3,'0');
  const children = child? [child] : [];
  STATE.parents.push({id,name,email,phone:phone||'—',children});
  if(child){ const student = STATE.students.find(s=>s.id===child); if(student) student.parentId=id; }
  closeModal(); toast(`Parent ${name} added.`); nav('parents');
}
function openEditParentModal(id){
  const p = STATE.parents.find(x=>x.id===id); if(!p) return;
  openModal(`
  <div class="modal-header"><div class="modal-title">Edit Parent</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="form-grid form-row-2">
      <div class="fg"><label>Full Name*</label><input id="epf-name" value="${p.name}"></div>
      <div class="fg"><label>Email*</label><input id="epf-email" type="email" value="${p.email}"></div>
      <div class="fg"><label>Phone</label><input id="epf-phone" value="${p.phone}"></div>
      <div class="fg"><label>Children</label><input id="epf-child" value="${p.children.map(cid=>STATE.students.find(s=>s.id===cid)?.name||cid).join(', ')}" readonly></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateParent('${id}')">Save</button></div>`);
}
function updateParent(id){
  const p=STATE.parents.find(x=>x.id===id); if(!p) return;
  p.name=document.getElementById('epf-name')?.value.trim()||p.name;
  p.email=document.getElementById('epf-email')?.value.trim()||p.email;
  p.phone=document.getElementById('epf-phone')?.value.trim()||p.phone;
  closeModal(); toast('Parent updated.'); nav('parents');
}
function deleteParent(id,name){
  showConfirm('Delete Parent',`Remove <strong>${name}</strong> from the system?`,()=>{
    const idx = STATE.parents.findIndex(x=>x.id===id);
    if(idx>=0){ STATE.parents.splice(idx,1); toast(`${name} deleted.`); nav('parents'); }
  });
}
/* ════════════════════════════════════════
   PROFILE PAGE
   ════════════════════════════════════════ */
function profileDisplayName(name){
  return String(name || '').replace(/^(Mr|Mrs|Ms|Dr)\.\s*/i, '').trim();
}

function pgProfile(el){
  const u = STATE.currentUser;
  const child = u.role==='parent'? STATE.students.find(s=>s.id===u.childId) : null;
  const secondary = u.role==='teacher'? `${u.grade} – ${u.section}` : u.role==='parent'? `Child: ${child?.name || 'N/A'}` : `School: ${u.school || 'N/A'}`;
  const extraField = u.role==='admin'? `<div class="fg"><label>School</label><input id="pf-school" value="${u.school||''}"></div>` : '';
  const contactField = u.role!=='admin'? `<div class="fg"><label>Phone</label><input id="pf-phone" value="${u.phone||''}"></div>` : '';
  const avatarStyle = u.avatar ? `style="background-image:url('${u.avatar}');background-size:cover;background-position:center;"` : '';
  const avatarText = u.avatar ? '' : ini(u.name);
  const subjects = STATE.subjects || [];
  const teacherStudents = u.role==='teacher' ? STATE.students.filter(s=>s.section===u.section && s.grade===u.grade && s.status==='active') : [];
  const classGrades = teacherStudents.flatMap(s=>{ const g = STATE.grades[s.id]; return g ? subjects.map(sub=>safeAverage(g[sub])).filter(score=>score!==null) : []; });
  const classAvg = averageScores(classGrades) ?? 0;
  const lowPerformers = teacherStudents.filter(s=>{ const g = STATE.grades[s.id]; return g && subjects.some(sub=>{const score=safeAverage(g[sub]);return score!==null&&score<75;}); }).length;
  const teacherAttendance = teacherStudents.length ? Math.round(teacherStudents.reduce((sum,s)=>{ const at = STATE.attendance[s.id]; return sum + (at?.total ? at.present/at.total : 0); },0)/teacherStudents.length * 100) : 0;
  const childGrades = child ? STATE.grades[child.id] : null;
  const childAvg = childGrades && child ? overallAvg(childGrades,STATE.subjectSets[child.grade]||subjects) : 0;
  const childAttendance = child ? (()=>{ const at=STATE.attendance[child.id]; return at?.total ? Math.round(at.present/at.total*100) : 0; })() : 0;
  const schoolStudents = u.role==='admin' ? STATE.students.filter(s=>s.status==='active').length : 0;
  const schoolTeachers = u.role==='admin' ? STATE.teachers.length : 0;
  const schoolClasses = u.role==='admin' ? STATE.classes.length : 0;
  const unreadMessages = STATE.messages.filter(m=>!m.read).length;
  const featureContent = u.role==='teacher' ? `
      <div class="profile-feature-head">
        <div class="profile-feature-title">Class Snapshot</div>
        <div class="profile-feature-sub">Review the current class performance and jump to the right tools.</div>
      </div>
      <div class="profile-meta-grid">
        <div class="profile-meta-item"><div class="profile-meta-label">Students</div><div class="profile-meta-value">${teacherStudents.length}</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Class Average</div><div class="profile-meta-value">${classAvg}%</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Attendance</div><div class="profile-meta-value">${teacherAttendance}%</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Below Target</div><div class="profile-meta-value">${lowPerformers}</div></div>
      </div>
      <div class="profile-actions"><button class="btn btn-secondary btn-sm" onclick="nav('grades')">Grade Entry</button><button class="btn btn-primary btn-sm" onclick="nav('attendance')">Attendance</button><button class="btn btn-secondary btn-sm" onclick="nav('ranking')">🏆 Ranking</button></div>
    ` : u.role==='parent' ? `
      <div class="profile-feature-head">
        <div class="profile-feature-title">Child Snapshot</div>
        <div class="profile-feature-sub">Track your child's academic progress and attendance at a glance.</div>
      </div>
      <div class="profile-meta-grid">
        <div class="profile-meta-item"><div class="profile-meta-label">Child</div><div class="profile-meta-value">${child?.name || 'N/A'}</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Average Grade</div><div class="profile-meta-value">${childAvg || '—'}%</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Attendance</div><div class="profile-meta-value">${childAttendance || '—'}%</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Notifications</div><div class="profile-meta-value">${getNotificationCount()}</div></div>
      </div>
      <div class="profile-actions"><button class="btn btn-secondary btn-sm" onclick="nav('announcements')">School News</button><button class="btn btn-primary btn-sm" onclick="nav('messages')">Messages</button></div>
    ` : `
      <div class="profile-feature-head">
        <div class="profile-feature-title">School Insight</div>
        <div class="profile-feature-sub">Manage school-wide data, monitor activity, and access administrative tools.</div>
      </div>
      <div class="profile-meta-grid">
        <div class="profile-meta-item"><div class="profile-meta-label">Students</div><div class="profile-meta-value">${schoolStudents}</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Teachers</div><div class="profile-meta-value">${schoolTeachers}</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Classes</div><div class="profile-meta-value">${schoolClasses}</div></div>
        <div class="profile-meta-item"><div class="profile-meta-label">Unread Messages</div><div class="profile-meta-value">${unreadMessages}</div></div>
      </div>
      <div class="profile-actions"><button class="btn btn-secondary btn-sm" onclick="nav('students')">Students</button><button class="btn btn-primary btn-sm" onclick="nav('reports')">Reports</button><button class="btn btn-secondary btn-sm" onclick="nav('approvals')">✅ Approvals</button></div>
    `;
  el.innerHTML=`
  <div class="page-head"><div><div class="page-title">Profile</div><div class="page-sub">Account details.</div></div></div>
  <div class="profile-summary">
    <div class="card">

      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px">
        <div style="position:relative;display:inline-block">
          <div id="profile-avatar" class="profile-avatar" ${avatarStyle}
            onclick="document.getElementById('pf-pic').click()"
            title="Tap to change photo"
            style="cursor:pointer">
            ${avatarText}
          </div>
          <div onclick="document.getElementById('pf-pic').click()"
            style="position:absolute;bottom:4px;right:4px;width:32px;height:32px;
            background:var(--green);border-radius:50%;border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer;z-index:1">
            <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
              <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M18.2 2H15L13.5.5h-3L9 2H5.8C4.3 2 3 3.3 3 4.8v12.4C3 18.7 4.3 20 5.8 20h12.4c1.5 0 2.8-1.3 2.8-2.8V4.8C21 3.3 19.7 2 18.2 2z"/>
            </svg>
          </div>
        </div>
        <input type="file" id="pf-pic" accept="image/*"
          style="display:none"
          onchange="previewProfilePic(event)">
        <div style="font-size:12px;color:var(--text3);margin-top:10px;text-align:center">
          Tap photo to change
        </div>
      </div>

      <div style="text-align:center;margin-bottom:16px">
        <div class="profile-name">${profileDisplayName(u.name)}</div>
        <div class="profile-role">${u.role.charAt(0).toUpperCase()+u.role.slice(1)} • ${secondary}</div>
      </div>

      <div class="divider"></div>

      <div class="form-grid form-row-2" style="margin-top:14px">
        <div class="fg"><label>Full Name</label><input id="pf-name" value="${profileDisplayName(u.name)}"></div>
        <div class="fg"><label>Email</label><input id="pf-email" type="email" value="${u.email}"></div>
        ${contactField}
        ${extraField}
      </div>

      <div class="flex gap-10" style="margin-top:16px">
        <button class="btn btn-secondary f1" onclick="resetProfilePic()">
          🔄 Reset Photo
        </button>
        <button class="btn btn-primary f1" onclick="saveProfile()">
          💾 Save Changes
        </button>
      </div>
    </div>

    <div class="card">
      ${featureContent}
    </div>
  </div>

  <div class="card" style="margin-top:18px">
    <div class="card-title">Account Summary</div>
    <div class="flex aic gap-12 mb-12">
      <span class="badge bg-blue">Role</span>
      <span>${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</span>
    </div>
    <div class="flex aic gap-12 mb-12">
      <span class="badge bg-green">Email</span>
      <span>${u.email}</span>
    </div>
    ${u.role==='teacher'?`
    <div class="flex aic gap-12 mb-12">
      <span class="badge bg-amber">Class</span>
      <span>${u.grade} – ${u.section}</span>
    </div>`:''}
    ${child?`
    <div class="flex aic gap-12">
      <span class="badge bg-amber">Child</span>
      <span>${child.name}</span>
    </div>`:''}
  </div>`;
  window._profilePic = undefined;
}
function getProfileImageSrc(){
  const u = STATE.currentUser;
  if(window._profilePic){ return window._profilePic; }
  return u.avatar || '';
}
function previewProfilePic(evt){
  const file = evt.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 512;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', .8);
      const avatar = document.getElementById('profile-avatar');
      if(avatar){
        avatar.style.backgroundImage=`url(${compressed})`;
        avatar.style.backgroundSize='cover';
        avatar.style.backgroundPosition='center';
        avatar.textContent='';
      }
      window._profilePic = compressed;
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function openProfileImage(){
  const src = getProfileImageSrc();
  const u = STATE.currentUser;
  const content = src ? `<img src="${src}" alt="Profile picture" style="max-width:90vw;max-height:90vh;border-radius:12px;display:block;margin:0 auto">` : `<div style="width:240px;height:240px;border-radius:12px;background:var(--green-l);display:flex;align-items:center;justify-content:center;font-size:72px;font-weight:800;color:var(--green);">${ini(u.name)}</div>`;
  openModal(`
    <div style="padding:0;display:flex;justify-content:center;align-items:center;min-height:100%;">${content}</div>
  `);
}
function resetProfilePic(){ const avatar=document.getElementById('profile-avatar'); if(avatar){ avatar.style.backgroundImage=''; avatar.textContent=ini(STATE.currentUser.name);} window._profilePic = ''; document.getElementById('pf-pic').value=''; }
function saveProfile(){ const u = STATE.currentUser; const name=document.getElementById('pf-name')?.value.trim(); const email=document.getElementById('pf-email')?.value.trim(); if(!name||!email){ toast('Name and email are required.','error'); return; } u.name=name; u.email=email; if(window._profilePic!==undefined){ u.avatar = window._profilePic || null; }
  if(u.role==='admin'){ u.school=document.getElementById('pf-school')?.value.trim()||u.school; }
  if(u.role!=='admin'){ const phone=document.getElementById('pf-phone')?.value.trim(); if(!phone){ toast('Phone number is required.','error'); return; } if(!/^\d{11}$/.test(phone)){ toast('Phone number must be exactly 11 digits and contain only numbers.','error'); return; } u.phone=phone; }
  setTopbarAvatar(u);
  document.getElementById('tb-name').textContent=u.name; toast('Profile updated successfully!'); }
/* ════════════════════════════════════════
   REPORTS PAGE
   ════════════════════════════════════════ */
function pgReports(el){
  const role=STATE.currentUser.role;
  const isTeacher=role==='teacher';
  const myStudents=isTeacher?STATE.students.filter(s=>s.section===STATE.currentUser.section&&s.grade===STATE.currentUser.grade):STATE.students;
  let allOv=[];
  myStudents.forEach(s=>{const g=STATE.grades[s.id];if(g){const ov=overallAvg(g,STATE.subjectSets[s.grade]||STATE.subjects);allOv.push({name:s.name,id:s.id,grade:s.grade,ov});}});
  const sorted=[...allOv].sort((a,b)=>b.ov-a.ov);
  const grade1Cohort=myStudents.length>0&&myStudents.every(student=>student.grade==='Grade 1');

  el.innerHTML=`
  <div class="page-head"><div><div class="page-title">Reports &amp; Analytics</div><div class="page-sub">Generate and export academic data</div></div></div>

  <div class="g2 mb-16">
    ${[
      {title:'Class Performance Report',desc:'Summary of grades across all subjects and quarters.',icon:'📊',action:"downloadClassPerformancePDF()",label:'Download PDF'},
      {title:'Attendance Report',desc:'Complete attendance records with rates per student.',icon:'📅',action:"downloadAttendancePDF()",label:'Download PDF'},
    ].map(r=>`<div class="card flex aic gap-14">
      <div style="width:48px;height:48px;background:var(--green-l);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${r.icon}</div>
      <div class="f1"><div class="fw7 ts mb-4">${r.title}</div><div class="txs tm mb-10">${r.desc}</div><div class="flex gap-8"><button class="btn btn-primary btn-xs" onclick="${r.action}">${r.label}</button></div></div>
    </div>`).join('')}
  </div>

  <div class="g2">
    <div class="card">
      <div class="card-header"><div class="card-title" style="margin:0">Top Performers</div><span class="badge bg-green">Ranked by average</span></div>
      ${sorted.slice(0,5).map((item,i)=>`
        <div class="flex aic gap-12" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="width:28px;height:28px;border-radius:50%;background:${i===0?'#C79800':i===1?'#C0C0C0':i===2?'#CD7F32':'var(--surface2)'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:${i<3?'#fff':'var(--text2)'};flex-shrink:0">${i+1}</div>
          <div class="f1 fw6 ts">${item.name}</div>
          <span class="badge ${gbadge(item.ov)}">${gradeDisplay({grade:item.grade},item.ov)}</span>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title" style="margin:0">Subject Averages</div></div>
      ${STATE.subjects.map(sub=>{
        let vals=[];myStudents.forEach(s=>{const g=STATE.grades[s.id];const score=g?safeAverage(g[sub]):null;if(score!==null) vals.push(score);});
        const sa=averageScores(vals) ?? 0;
        const shownAverage=grade1Cohort?gradeDisplay({grade:'Grade 1'},sa):sa;
        return `<div class="prog-wrap">
          <div class="prog-top"><span class="ts fw6">${STATE.subjectLabels[sub]}</span><span class="badge ${gbadge(sa)}">${shownAverage}</span></div>
          <div class="prog-track"><div class="prog-fill" style="width:${sa}%;background:${gcol(sa)}"></div></div>
          <div class="txs tmm">${grade1Cohort?grade1Descriptor(shownAverage)?.name:glabel(sa)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  window.downloadClassPerformancePDF = function(){
    const header=['Rank','Name','LRN',...STATE.subjects.map(s=>STATE.subjectLabels[s]),'General Average','Descriptor','Honors'];
    const rows=[header];
    sorted.forEach((item,i)=>{
      const s = STATE.students.find(x=>x.id===item.id);
      const g = STATE.grades[item.id]||{};
      const h = getHonors(item.ov);
      rows.push([i+1, item.name, s?.lrn||'', ...STATE.subjects.map(sub=>gradeDisplay(s,avg(g[sub]||[]))), gradeDisplay(s,item.ov), s?.grade==='Grade 1'?grade1Descriptor(gradeDisplay(s,item.ov))?.name:glabel(item.ov), h?h.label:'']);
    });
    downloadPdf('class_performance.pdf','Class Performance Report',header,rows);
  };

  window.downloadAttendancePDF = function(){
    const header=['Name','Present','Absent','Late','Half-day','Total Days','Rate %'];
    const rows=[header];
    myStudents.forEach(s=>{
      const at = STATE.attendance[s.id]||{present:0,absent:0,late:0,total:0};
      const rate = at.total?Math.round(at.present/at.total*100):0;
      rows.push([s.name, at.present, at.absent, at.late, at.half_day||0, at.total, rate+'%']);
    });
    downloadPdf('attendance_report.pdf','Attendance Report',header,rows);
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   NEW: Honors calculation (DepEd Order No. 8 s.2015 style)
   ════════════════════════════════════════════════════════════════════════════ */
function getHonors(avgScore){
  if (avgScore >= 98) return { label:'With Highest Honors', icon:'🏆' };
  if (avgScore >= 95) return { label:'With High Honors', icon:'🥇' };
  if (avgScore >= 90) return { label:'With Honors', icon:'🥈' };
  return null;
}

/* ════════════════════════════════════════════════════════════════════════════
   NEW: Auto-alert to parent when a failing grade (below 75) is entered
   ════════════════════════════════════════════════════════════════════════════ */
function checkAndSendFailingAlerts(studentId, subject, quarterLabel, score, teacherName){
  if(!(score>0 && score<75)) return false;
  const student = STATE.students.find(s=>s.id===studentId);
  if(!student) return false;
  const parent = STATE.parents.find(p=>p.children && p.children.includes(studentId));
  if(!parent) return false;

  const subjectLabel = STATE.subjectLabels[subject] || subject;
  const alreadySent = STATE.messages.find(m=>m.isAlert && m.studentId===studentId && m.subject && m.subject.includes(subjectLabel) && m.subject.includes(quarterLabel));
  if(alreadySent) return false;

  const alertMsg = {
    id: STATE.nextMsgId++,
    fromRole:'system', fromId:'system', fromName:'🔔 TrackEd Alert',
    toRole:'parent', toId:parent.id,
    subject:`Academic Alert: ${student.name} — ${subjectLabel} (${quarterLabel})`,
    body:`This is an automated notification from TrackEd.\n\n${student.name} has received a grade of ${score} in ${subjectLabel} for ${quarterLabel}, which is below the passing mark of 75.\n\nPlease coordinate with ${teacherName||'the class teacher'} at your earliest convenience to discuss how to support your child's academic performance.\n\nThank you for your continued support.`,
    date:new Date().toISOString().split('T')[0],
    time:new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),
    read:false, studentId, thread:null, isAlert:true,
  };
  STATE.messages.unshift(alertMsg);

  if(typeof emailjs !== 'undefined' && parent.email){
    try{
      emailjs.send('service_g3io8sl','template_f1rokml',{
        parent_name:parent.name, student_name:student.name, subject:subjectLabel,
        score, quarter:quarterLabel, teacher_name:teacherName||'the class teacher'
      }).catch(()=>{});
    }catch(e){}
  }

  STATE.notifications.unshift({
    id: STATE.notifications.length+1,
    title:`Alert Sent: ${student.name}`,
    body:`${student.name} scored ${score} in ${subjectLabel} (${quarterLabel}). Parent notified automatically.`,
    time:'just now', type:'high', read:false,
  });

  return true;
}

/* ════════════════════════════════════════════════════════════════════════════
   NEW: Class & School Ranking page (with Honors)
   ════════════════════════════════════════════════════════════════════════════ */
function pgRanking(el){
  const role = STATE.currentUser.role;

  function studentAvg(sid){
    const g = STATE.grades[sid]; if(!g) return 0;
    const student=STATE.students.find(item=>item.id===sid);
    return student?overallAvg(g,STATE.subjectSets[student.grade]||STATE.subjects):0;
  }

  function renderClassRanking(students, title, showBack){
    const ranked = students.map(s=>({...s, ov:studentAvg(s.id)})).sort((a,b)=>b.ov-a.ov);
    const highest = ranked.filter(s=>s.ov>=98), high = ranked.filter(s=>s.ov>=95&&s.ov<98), honors = ranked.filter(s=>s.ov>=90&&s.ov<95);
    el.innerHTML = `
    <div class="page-head">
      <div>
        ${showBack?`<button class="btn btn-secondary btn-sm mb-8" onclick="pgRanking(document.getElementById('content'))">Back to All Classes</button>`:''}
        <div class="page-title">Class Ranking 🏆</div>
        <div class="page-sub">${title} — ${ranked.length} students</div>
      </div>
    </div>
    <div class="g3 mb-16">
      <div class="card" style="background:linear-gradient(135deg,#FFF4C2,#fff);border-color:var(--gold);text-align:center">
        <div style="font-size:28px">🏆</div><div class="fw7 ts" style="color:var(--gold)">With Highest Honors</div>
        <div style="font-size:26px;font-weight:900">${highest.length}</div><div class="txs tmm">Average 98–100</div>
      </div>
      <div class="card" style="background:linear-gradient(135deg,var(--blue-l),#fff);border-color:var(--blue);text-align:center">
        <div style="font-size:28px">🥇</div><div class="fw7 ts" style="color:var(--blue)">With High Honors</div>
        <div style="font-size:26px;font-weight:900">${high.length}</div><div class="txs tmm">Average 95–97</div>
      </div>
      <div class="card" style="background:linear-gradient(135deg,var(--green-l),#fff);border-color:var(--green);text-align:center">
        <div style="font-size:28px">🥈</div><div class="fw7 ts" style="color:var(--green)">With Honors</div>
        <div style="font-size:26px;font-weight:900">${honors.length}</div><div class="txs tmm">Average 90–94</div>
      </div>
    </div>
    <div class="tbl-wrap">
      <div class="tbl-toolbar"><span class="ts fw7">Complete Rankings — ${title}</span></div>
      <table>
        <thead><tr><th>#</th><th>Student</th><th>Grade & Section</th>${STATE.subjects.map(s=>`<th>${STATE.subjectLabels[s]}</th>`).join('')}<th>Average</th><th>Honors</th></tr></thead>
        <tbody>
          ${ranked.map((s,i)=>{
            const h=getHonors(s.ov);
            return `<tr style="${i<3?'background:linear-gradient(90deg,rgba(199,152,0,.06),transparent)':''}">
              <td><div style="width:26px;height:26px;border-radius:50%;background:${i===0?'#C79800':i===1?'#C0C0C0':i===2?'#CD7F32':'var(--surface2)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${i<3?'#fff':'var(--text2)'}">${i+1}</div></td>
              <td><div class="flex aic gap-8"><div class="av av-32 av-green">${ini(s.name)}</div><div class="fw6">${s.name}</div></div></td>
              <td class="txs tm">${s.grade} – ${s.section}</td>
              ${STATE.subjects.map(sub=>{const sc=avg((STATE.grades[s.id]||{})[sub]||[]);return `<td><span class="badge ${gbadge(sc)}">${gradeDisplay(s,sc)}</span></td>`;}).join('')}
              <td><strong style="font-size:15px;color:${gcol(s.ov)}">${gradeDisplay(s,s.ov)}</strong></td>
              <td>${h?`<span style="color:var(--gold);font-size:12px">${h.icon} ${h.label}</span>`:'<span class="txs tmm">—</span>'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  if(role==='teacher'){
    const u = STATE.currentUser;
    const students = STATE.students.filter(s=>s.section===u.section&&s.grade===u.grade&&s.status==='active');
    renderClassRanking(students, `${u.grade} – ${u.section}`, false);
    return;
  }

  const allActive = STATE.students.filter(s=>s.status==='active');
  el.innerHTML = `
  <div class="page-head"><div><div class="page-title">School Ranking 🏆</div><div class="page-sub">Click on a class to view its full rankings</div></div></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
    ${STATE.classes.map(c=>{
      const t=STATE.teachers.find(x=>x.id===c.teacherId);
      const clsStudents = allActive.filter(s=>s.grade===c.grade&&s.section===c.section);
      const avgs = clsStudents.map(s=>studentAvg(s.id)).filter(v=>v>0);
      const clsAvg = averageScores(avgs) ?? 0;
      const honorCount = clsStudents.filter(s=>getHonors(studentAvg(s.id))).length;
      return `<div class="card" style="cursor:pointer" onclick="viewClassRanking('${c.grade}','${c.section}')">
        <div class="flex aic gap-12 mb-12">
          <div style="width:44px;height:44px;background:var(--blue-l);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px">🏫</div>
          <div class="f1"><div class="fw7 ts">${c.grade} – ${c.section}</div><div class="txs tmm">${t?t.name:'No teacher'} · ${clsStudents.length} students</div></div>
          <span class="badge ${gbadge(clsAvg)}">${clsAvg?gradeDisplay({grade:c.grade},clsAvg):'–'}</span>
        </div>
        <div class="flex aic gap-8"><span class="badge" style="background:var(--gold-l);color:var(--gold)">${honorCount} Honor Students</span></div>
      </div>`;
    }).join('')}
  </div>`;
  window.viewClassRanking = function(grade, section){
    const clsStudents = allActive.filter(s=>s.grade===grade&&s.section===section);
    renderClassRanking(clsStudents, `${grade} – ${section}`, true);
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   NEW: Printable Report Card (DepEd SF9 style)
   ════════════════════════════════════════════════════════════════════════════ */
function pgReportCard(el){
  const role = STATE.currentUser.role;
  let students = [];
  if(role==='parent') students = STATE.students.filter(s=>s.id===STATE.currentUser.childId);
  else if(role==='teacher') students = STATE.students.filter(s=>s.section===STATE.currentUser.section&&s.grade===STATE.currentUser.grade&&s.status==='active');
  else students = STATE.students.filter(s=>s.status==='active');

  let selId = window._rcStudentId && students.find(s=>s.id===window._rcStudentId) ? window._rcStudentId : (students[0]?.id||null);

  function renderRC(){
    const s = STATE.students.find(x=>x.id===selId);
    if(!s){ el.innerHTML='<div class="empty-state"><div class="es-title">No student selected</div></div>'; return; }
    const g = STATE.grades[s.id]||{};
    const at = STATE.attendance[s.id]||{present:0,absent:0,late:0,total:0};
    const teacher = STATE.teachers.find(t=>t.grade===s.grade&&t.section===s.section);
    const studentSubjects = STATE.subjectSets[s.grade] || STATE.subjects;
    const gradesForStudent = studentSubjects.map(sub => safeAverage(g[sub] || []));
    const ov = averageScores(gradesForStudent);
    const honors = ov !== null ? getHonors(ov) : null;

    el.innerHTML = `
    <div class="page-head">
      <div><div class="page-title">Report Card</div><div class="page-sub">DepEd SF9 Format · SY 2024-2025</div></div>
      <div class="page-actions">
        ${students.length>1?`<select class="btn btn-secondary" id="rc-sel" onchange="window._rcStudentId=this.value;renderRC()">
          ${students.map(st=>`<option value="${st.id}" ${st.id===selId?'selected':''}>${st.name}</option>`).join('')}
        </select>`:''}
        <button class="btn btn-secondary" onclick="printReportCard()">🖨 Print</button>
      </div>
    </div>
    <div id="rc-print-area">
    <div class="rc-card">
      <div class="rc-header">
        <div class="rc-logo-area"><div style="width:60px;height:60px;border-radius:50%;background:var(--green-l);display:flex;align-items:center;justify-content:center;font-size:24px">🏫</div></div>
        <div class="rc-school-info">
          <div class="rc-republic">Republic of the Philippines</div>
          <div class="rc-deped">Department of Education</div>
          <div class="rc-region">Region V – Bicol Region · Division of Albay</div>
          <div class="rc-school-name">Polangui South Central School</div>
        </div>
        <div class="rc-logo-area"><div style="width:60px;height:60px;border-radius:50%;background:var(--amber-l);display:flex;align-items:center;justify-content:center;font-size:22px">🇵🇭</div></div>
      </div>
      <div class="rc-title-bar">SCHOOL REPORT CARD (SF9)</div>
      <div class="rc-section-title">LEARNER INFORMATION</div>
      <div class="rc-info-grid">
        <div class="rc-info-row"><span class="rc-label">LRN / ID:</span><span class="rc-value fw7">${s.lrn||s.id}</span></div>
        <div class="rc-info-row"><span class="rc-label">Learner's Name:</span><span class="rc-value fw7">${s.name}</span></div>
        <div class="rc-info-row"><span class="rc-label">Grade Level:</span><span class="rc-value">${s.grade}</span></div>
        <div class="rc-info-row"><span class="rc-label">Section:</span><span class="rc-value">${s.section}</span></div>
        <div class="rc-info-row"><span class="rc-label">Sex:</span><span class="rc-value">${s.gender==='F'?'Female':'Male'}</span></div>
        <div class="rc-info-row"><span class="rc-label">Adviser:</span><span class="rc-value">${teacher?.name||'—'}</span></div>
        <div class="rc-info-row"><span class="rc-label">Parent/Guardian:</span><span class="rc-value">${s.parent||'—'}</span></div>
      </div>
      <div class="rc-section-title" style="margin-top:16px">LEARNER'S ACADEMIC PROGRESS REPORT</div>
      <table class="rc-table">
        <thead><tr><th rowspan="2">Learning Area</th><th colspan="4">Quarter</th><th rowspan="2">Final Grade</th><th rowspan="2">Descriptor</th></tr><tr><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead>
        <tbody>
          ${STATE.subjects.map(sub=>{
            const scores = Array.isArray(g[sub]) ? g[sub] : [0,0,0,0];
            const fin = safeAverage(scores);
            const finalLetter=fin!==null?gradeDisplay(s,fin):'—';
            const descriptor=s.grade==='Grade 1'?grade1Descriptor(finalLetter):null;
            return `<tr><td class="rc-subject">${STATE.subjectLabels[sub]}</td>${scores.map(sc=>`<td class="rc-score" style="${Number.isFinite(sc)&&sc>0&&sc<75?'color:var(--red);font-weight:700':Number.isFinite(sc)&&sc>=90?'color:var(--green);font-weight:700':''}">${Number.isFinite(sc)&&sc>0 ? gradeDisplay(s,sc) : '—'}</td>`).join('')}<td class="rc-final" style="color:${fin !== null ? gcol(fin) : 'var(--text3)'}">${fin !== null ? finalLetter : '—'}</td><td class="rc-desc">${fin !== null ? (descriptor?.name||glabel(fin)) : '—'}</td></tr>`;
          }).join('')}
          <tr class="rc-total-row"><td class="rc-subject">General Average</td>
            ${STATE.quarters.slice(0,4).map((_,qi)=>{ const vals=studentSubjects.map(sub => Number.isFinite(g[sub]?.[qi]) && g[sub][qi] > 0 ? g[sub][qi] : null); const qa = averageScores(vals); return `<td class="rc-score" style="color:${qa !== null ? gcol(qa) : 'var(--text3)'}">${qa !== null ? gradeDisplay(s,qa) : '—'}</td>`; }).join('')}
            <td class="rc-final" style="font-size:16px;color:${ov !== null ? gcol(ov) : 'var(--text3)'}">${ov !== null ? gradeDisplay(s,ov) : '—'}</td><td class="rc-desc">${ov !== null ? (grade1Descriptor(gradeDisplay(s,ov))?.name||glabel(ov)) : '—'}</td></tr>
        </tbody>
      </table>
      ${honors?`<div class="rc-honors-badge"><span style="font-size:20px">${honors.icon}</span> <strong>${honors.label}</strong> — General Average: ${ov===null?'—':gradeDisplay(s,ov)}</div>`:''}
      <div class="rc-section-title" style="margin-top:16px">ATTENDANCE SUMMARY</div>
      <table class="rc-table rc-att-table">
        <thead><tr><th>Days Present</th><th>Days Absent</th><th>Days Late</th><th>Total School Days</th></tr></thead>
        <tbody><tr><td class="rc-score" style="color:var(--green)">${at.present}</td><td class="rc-score" style="color:var(--red)">${at.absent}</td><td class="rc-score" style="color:var(--amber)">${at.late}</td><td class="rc-score">${at.total}</td></tr></tbody>
      </table>
      <div class="rc-section-title" style="margin-top:16px">GRADING SCALE</div>
      <div class="rc-scale-grid ${s.grade==='Grade 1'?'rc-grade1-scale':''}">
        ${s.grade==='Grade 1'
          ? grade1Scale.map(level=>`<div class="rc-scale-item"><span class="rc-scale-range">${level.letter}</span><span class="rc-scale-desc"><strong>${level.name}</strong><br>${level.description}</span></div>`).join('')
          : [['90–100','Outstanding'],['85–89','Very Satisfactory'],['80–84','Satisfactory'],['75–79','Fairly Satisfactory'],['Below 75','Did Not Meet']].map(([r,d])=>`<div class="rc-scale-item"><span class="rc-scale-range">${r}</span><span class="rc-scale-desc">${d}</span></div>`).join('')}
      </div>
      <div class="rc-sig-row">
        <div class="rc-sig-block"><div class="rc-sig-line"></div><div class="rc-sig-name">${teacher?.name||'Class Adviser'}</div><div class="rc-sig-role">Class Adviser</div></div>
        <div class="rc-sig-block"><div class="rc-sig-line"></div><div class="rc-sig-name">Principal Roberto Cruz</div><div class="rc-sig-role">School Principal</div></div>
        <div class="rc-sig-block"><div class="rc-sig-line"></div><div class="rc-sig-name">${s.parent||'Parent / Guardian'}</div><div class="rc-sig-role">Parent / Guardian</div></div>
      </div>
    </div></div>`;
    document.getElementById('rc-sel')?.addEventListener('change', e=>{ selId=e.target.value; window._rcStudentId=selId; renderRC(); });
  }
  window.renderRC = renderRC;
  window.printReportCard = function(){
    const content = document.getElementById('rc-print-area')?.innerHTML;
    const w = window.open('','_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Report Card</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px;color:#000;margin:20px}.rc-card{max-width:780px;margin:0 auto;border:2px solid #000;padding:16px}.rc-header{display:flex;align-items:center;justify-content:space-between;text-align:center;margin-bottom:12px}.rc-school-name{font-size:15px;font-weight:800}.rc-title-bar{background:#1856A8;color:#fff;text-align:center;font-weight:800;padding:8px;margin-bottom:12px}.rc-section-title{background:#E8EFFF;font-weight:800;font-size:11px;padding:5px 8px;margin-bottom:6px}.rc-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px}.rc-info-row{display:flex;gap:8px;font-size:11px;padding:3px 0;border-bottom:1px solid #eee}.rc-label{color:#666;min-width:120px}.fw7{font-weight:700}.rc-table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:11px}.rc-table th,.rc-table td{border:1px solid #ccc;padding:5px 8px;text-align:center}.rc-table th{background:#E8EFFF}.rc-subject{text-align:left!important}.rc-total-row{background:#F5F4F0}.rc-honors-badge{background:#FFF4C2;border:2px solid #C79800;border-radius:8px;padding:10px 16px;text-align:center;margin:8px 0}.rc-scale-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px}.rc-scale-item{border:1px solid #ccc;border-radius:4px;padding:6px;text-align:center;font-size:10px}.rc-sig-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:20px}.rc-sig-block{text-align:center}.rc-sig-line{border-bottom:1px solid #000;margin-bottom:4px;height:40px}</style>
    </head><body>${content}</body></html>`);
    w.document.close(); setTimeout(()=>w.print(),500);
  };
  renderRC();
}

/* ════════════════════════════════════════════════════════════════════════════
   NEW: Teacher self-registration + Admin approval workflow
   ════════════════════════════════════════════════════════════════════════════ */
function showLoginTab(tab){
  const loginForm = document.getElementById('login-form-section');
  const regForm = document.getElementById('register-form-section');
  if(!loginForm || !regForm) return;
  if(tab==='register'){ loginForm.style.display='none'; regForm.style.display=''; }
  else { loginForm.style.display=''; regForm.style.display='none'; }
}

function doRegisterTeacher(){
  const name = document.getElementById('r-name')?.value.trim();
  const email = document.getElementById('r-email')?.value.trim();
  const pass = document.getElementById('r-pass')?.value.trim();
  const phone = document.getElementById('r-phone')?.value.trim();
  const grade = document.getElementById('r-grade')?.value;
  const sec = document.getElementById('r-section')?.value.trim();
  if(!name||!email||!pass||!sec){ toast('Please fill all required fields.','error'); return; }
  const emailTaken = Object.values(STATE.users).some(u=>u.email===email) || STATE.teachers.some(t=>t.email===email);
  if(emailTaken){ toast('This email is already registered.','error'); return; }
  if(!STATE.pendingTeachers) STATE.pendingTeachers=[];
  if(STATE.pendingTeachers.find(t=>t.email===email)){ toast('Your registration is already pending approval.','error'); return; }
  STATE.pendingTeachers.push({
    id:'PT'+String(STATE.pendingTeachers.length+1).padStart(3,'0'),
    name, email, phone:phone||'—', grade, section:sec, password:pass,
    appliedDate:new Date().toISOString().split('T')[0], status:'pending',
  });
  toast('Registration submitted! Please wait for the principal\'s approval.');
  showLoginTab('login');
}

function pgApprovals(el){
  function render(){
    const pending = (STATE.pendingTeachers||[]).filter(t=>t.status==='pending');
    const approved = (STATE.pendingTeachers||[]).filter(t=>t.status==='approved');
    el.innerHTML = `
    <div class="page-head"><div><div class="page-title">Teacher Registrations</div><div class="page-sub">${pending.length} pending approval${pending.length!==1?'s':''}</div></div></div>
    ${pending.length===0?`<div class="card" style="text-align:center;padding:40px"><div style="font-size:40px">✅</div><div class="fw7 ts mt-12">All registrations reviewed</div></div>`:
    pending.map(t=>`<div class="card mb-12" style="border-left:4px solid var(--amber)">
      <div class="flex aic gap-14">
        <div class="av av-52 av-amber">${ini(t.name)}</div>
        <div class="f1"><div style="font-size:17px;font-weight:800">${t.name}</div><div class="ts tm">${t.email} · ${t.phone}</div><div class="txs tmm mt-4">Applying for: <strong>${t.grade} – ${t.section}</strong> · Applied: ${t.appliedDate}</div></div>
        <div class="flex gap-8">
          <button class="btn btn-primary btn-sm" onclick="approveTeacher('${t.id}')">✓ Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectTeacher('${t.id}','${t.name.replace(/'/g,"\\'")}')">✕ Reject</button>
        </div>
      </div>
    </div>`).join('')}
    ${approved.length>0?`<div class="card mt-16"><div class="card-title">Recently Approved</div>
      ${approved.map(t=>`<div class="flex aic gap-10" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge bg-green">Approved</span><div class="f1 fw6 ts">${t.name}</div><div class="txs tmm">${t.grade} – ${t.section}</div></div>`).join('')}
    </div>`:''}`;
  }
  window.approveTeacher = (id)=>{
    const t = STATE.pendingTeachers.find(x=>x.id===id); if(!t) return;
    const tid = 'T'+String(STATE.nextTeacherId++).padStart(3,'0');
    STATE.teachers.push({id:tid,name:t.name,email:t.email,phone:t.phone,grade:t.grade,section:t.section,subjects:'All Subjects',status:'active',joined:new Date().toISOString().split('T')[0],password:t.password});
    STATE.users[tid] = {role:'teacher',id:tid,name:t.name,email:t.email,password:t.password,grade:t.grade,section:t.section,teacherId:tid};
    t.status='approved';
    toast(`${t.name} approved and can now log in!`); render();
  };
  window.rejectTeacher = (id,name)=>{
    showConfirm('Reject Application',`Reject application from <strong>${name}</strong>?`,()=>{
      const t = STATE.pendingTeachers.find(x=>x.id===id); if(t) t.status='rejected';
      toast(`${name}'s application rejected.`,'error'); render();
    });
  };
  render();
}

/* ════════════════════════════════════════════════════════════════════════════
   NEW: Teacher-managed Parents (create parent login accounts scoped to own class)
   ════════════════════════════════════════════════════════════════════════════ */
function pgParentsTeacher(el){
  const u = STATE.currentUser;
  const myStudents = STATE.students.filter(s=>s.section===u.section&&s.grade===u.grade);
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,character=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[character]));

  function renderRows(){
    const myParents = STATE.parents.filter(p=>p.children.some(cid=>myStudents.some(s=>s.id===cid)));
    const tbody=document.getElementById('par-tbody');
    if(!tbody) return;
    tbody.innerHTML = myParents.length===0
      ? `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">👨‍👩‍👧</div><div class="es-title">No parents yet</div></div></td></tr>`
      : myParents.map(p=>{
          const children = myStudents.filter(s=>(p.children||[]).includes(s.id));
          return `<tr>
            <td><div class="flex aic gap-10"><div class="av av-32 av-amber">${escapeHtml(ini(p.name))}</div><div><div class="fw6">${escapeHtml(p.name)}</div><div class="txs tmm">${escapeHtml(p.id)}</div></div></div></td>
            <td>${escapeHtml(p.email)}</td><td>${escapeHtml(p.phone||'—')}</td>
            <td>${children.map(child=>`<span class="badge bg-blue">${escapeHtml(child.name)}</span>`).join(' ')||'<span class="badge bg-gray">—</span>'}</td>
            <td><div class="flex gap-6">
              <button class="btn btn-secondary btn-xs" type="button" data-parent-action="view" data-parent-id="${escapeHtml(p.id)}">View</button>
              <button class="btn btn-secondary btn-xs" type="button" data-parent-action="edit" data-parent-id="${escapeHtml(p.id)}">Edit</button>
              <button class="btn btn-danger btn-xs" type="button" data-parent-action="delete" data-parent-id="${escapeHtml(p.id)}">Delete</button>
            </div></td>
          </tr>`;
        }).join('');
    tbody.onclick=event=>{
      const button=event.target.closest('[data-parent-action]');
      if(!button) return;
      const parent=STATE.parents.find(item=>item.id===button.dataset.parentId);
      if(!parent) return;
      if(button.dataset.parentAction==='view') openViewParent(parent);
      if(button.dataset.parentAction==='edit') openEditParent(parent);
      if(button.dataset.parentAction==='delete') deleteTeacherParent(parent);
    };
  }

  el.innerHTML = `
  <div class="page-head">
    <div><div class="page-title">Manage Parents</div><div class="page-sub">Parents linked to ${u.grade} – ${u.section}</div></div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="exportParents()">Export</button>
      <label class="btn btn-secondary" for="parent-csv-file">Import</label>
      <input id="parent-csv-file" type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onchange="importParentsSpreadsheet(this)">
      <button class="btn btn-primary" onclick="openAddParentTeacherModal()">+ Add Parent</button>
    </div>
  </div>
  <div class="tbl-wrap">
    <table>
      <thead><tr><th>Parent/Guardian</th><th>Email</th><th>Phone</th><th>Child</th><th>Actions</th></tr></thead>
      <tbody id="par-tbody"></tbody>
    </table>
  </div>`;
  window.refreshParentRowsTeacher = renderRows;
  renderRows();

  function openViewParent(parent){
    const children=myStudents.filter(student=>(parent.children||[]).includes(student.id));
    openModal(`
      <div class="modal-header"><div class="modal-title">Parent Information</div><button class="modal-close" onclick="closeModal()">✕</button></div>
      <div class="modal-body">
        <p><strong>Full name:</strong> ${escapeHtml(parent.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(parent.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(parent.phone||'—')}</p>
        <p><strong>Linked student${children.length===1?'':'s'}:</strong> ${children.map(student=>escapeHtml(student.name)).join(', ')||'—'}</p>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Close</button></div>`);
  }

  function openEditParent(parent){
    openModal(`
      <div class="modal-header"><div class="modal-title">Edit Parent</div><button class="modal-close" onclick="closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="form-grid form-row-2">
          <div class="fg"><label for="teacher-parent-name">Full Name*</label><input id="teacher-parent-name" value="${escapeHtml(parent.name)}"></div>
          <div class="fg"><label for="teacher-parent-email">Email*</label><input id="teacher-parent-email" type="email" value="${escapeHtml(parent.email)}"></div>
          <div class="fg"><label for="teacher-parent-phone">Phone</label><input id="teacher-parent-phone" value="${escapeHtml(parent.phone||'')}"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" id="save-teacher-parent">Save</button>
      </div>`);
    document.getElementById('save-teacher-parent').onclick=async()=>{
      const name=document.getElementById('teacher-parent-name')?.value.trim();
      const email=document.getElementById('teacher-parent-email')?.value.trim();
      const phone=document.getElementById('teacher-parent-phone')?.value.trim()||'';
      if(!name||!email){toast('Name and email are required.','error');return;}
      try{
        const updated=typeof api!=='undefined'&&api.getToken()
          ? await api.updateParent(parent.id,{name,email,phone})
          : {...parent,name,email,phone};
        Object.assign(parent,{name:updated.name,email:updated.email,phone:updated.phone});
        STATE.students.forEach(student=>{
          if((parent.children||[]).includes(student.id)){
            student.parent=name;
            student.parentEmail=email;
          }
        });
        closeModal();
        toast('Parent information updated.');
        renderRows();
      }catch(error){
        toast(error.message||'Parent information could not be updated.','error');
      }
    };
  }

  function deleteTeacherParent(parent){
    showConfirm('Delete Parent',`Remove <strong>${escapeHtml(parent.name)}</strong> from your class? If linked to another teacher's students, their account and records will remain.`,async()=>{
      try{
        const result=typeof api!=='undefined'&&api.getToken()
          ? await api.deleteParent(parent.id)
          : {deleted:true};
        STATE.parents=STATE.parents.filter(item=>item.id!==parent.id);
        if(result.deleted!==false){
          STATE.users=Object.fromEntries(Object.entries(STATE.users).filter(([,user])=>user.id!==parent.id));
        }
        STATE.students.forEach(student=>{
          if((parent.children||[]).includes(student.id)){
            student.parentId='';
            student.parent='';
            student.parentEmail='';
          }
        });
        toast(result.deleted===false?'Parent unlinked from your class.':'Parent deleted.');
        renderRows();
      }catch(error){
        toast(error.message||'Parent could not be deleted.','error');
      }
    });
  }
}

function openAddParentTeacherModal(){
  const u = STATE.currentUser;
  const unlinked = STATE.students.filter(s=>s.section===u.section&&s.grade===u.grade&&!STATE.parents.some(p=>p.children.includes(s.id)));
  openModal(`
  <div class="modal-header"><div class="modal-title">Add Parent / Guardian</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div style="background:var(--blue-l);border-radius:9px;padding:12px;margin-bottom:16px;font-size:13px;color:var(--blue)">
      <strong>ℹ Note:</strong> A login account will be created automatically. Share the email/password with the parent.
    </div>
    <div class="form-grid form-row-2">
      <div class="fg"><label>Full Name*</label><input id="pt-name" placeholder="Parent/Guardian name"></div>
      <div class="fg"><label>Email* (used for login)</label><input id="pt-email" type="email" placeholder="parent@email.com"></div>
      <div class="fg"><label>Phone*</label><input id="pt-phone" placeholder="09XXXXXXXXX"></div>
      <div class="fg"><label>Password*</label><div class="pass-wrap"><input id="pt-pass" type="password" placeholder="Create a password"><button type="button" class="pass-toggle" onclick="toggleFieldPassword('pt-pass', this)" aria-label="Show password"><svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/></svg></button></div></div>
      <div class="fg" style="grid-column:span 2"><label>Linked Student*</label><select id="pt-child">
        <option value="">-- Select student --</option>
        ${unlinked.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
      </select></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveParentTeacher()">Add Parent</button></div>`);
}

async function saveParentTeacher(){
  const name = document.getElementById('pt-name')?.value.trim();
  const email = document.getElementById('pt-email')?.value.trim();
  const phone = document.getElementById('pt-phone')?.value.trim();
  const pass = document.getElementById('pt-pass')?.value.trim();
  const childId = document.getElementById('pt-child')?.value;
  if(!name||!email||!phone||!childId||!pass){ toast('Fill all required fields.','error'); return; }
  if(STATE.parents.some(parent=>parent.email.toLowerCase()===email.toLowerCase())||
    Object.values(STATE.users).some(user=>user.email.toLowerCase()===email.toLowerCase())){
    toast('This email already has a parent record or account.','error'); return;
  }
  try{
    let parent;
    if(typeof api!=='undefined'&&api.getToken()){
      const created=await api.addParent({name,email,phone,password:pass,childId});
      parent={id:created.id,name:created.name,email:created.email,phone:created.phone,children:created.children||[childId]};
    }else{
      if(!STATE.nextParentId) STATE.nextParentId = STATE.parents.length+1;
      parent={id:'P'+String(STATE.nextParentId++).padStart(3,'0'),name,email,phone,children:[childId]};
      STATE.users[parent.id]={role:'parent',id:parent.id,name,email,password:pass,childId};
    }
    STATE.parents.push(parent);
    const student=STATE.students.find(item=>item.id===childId);
    if(student){student.parentId=parent.id;student.parent=name;student.parentEmail=email;}
    closeModal();
    toast(`Parent ${name} created. Share the login details securely.`);
    if(typeof window.refreshParentRowsTeacher==='function') window.refreshParentRowsTeacher();
  }catch(error){
    toast(error.message||'Parent could not be created.','error');
  }
}

function exportParents(){
  const teacher=STATE.currentUser;
  const classStudents=STATE.students.filter(student=>student.grade===teacher.grade&&student.section===teacher.section);
  const rows=[['Name','Email','Phone','Password','Student ID','Student Name']];
  STATE.parents.forEach(parent=>{
    classStudents.filter(student=>(parent.children||[]).includes(student.id)).forEach(student=>{
      rows.push([parent.name,parent.email,parent.phone,'',student.id,student.name]);
    });
  });
  downloadCsv('parents.csv',rows);
}

async function importParentsSpreadsheet(input){
  const file=input.files?.[0];
  input.value='';
  if(!file) return;
  const teacher=STATE.currentUser;
  const classStudents=STATE.students.filter(student=>student.grade===teacher.grade&&student.section===teacher.section);
  try{
    const rows=await readSpreadsheetRows(file);
    if(rows.length<2) throw new Error('The spreadsheet has no parent rows.');
    const headers=rows[0].map(header=>header.trim().toLowerCase());
    const column=name=>headers.indexOf(name.toLowerCase());
    const required=['Name','Email','Phone','Password'].map(column);
    if(required.some(index=>index<0)||column('Student ID')<0&&column('LRN')<0){
      throw new Error('Include Name, Email, Phone, Password, and Student ID or LRN columns.');
    }
    const existingEmails=new Set([
      ...STATE.parents.map(parent=>parent.email.toLowerCase()),
      ...Object.values(STATE.users).map(user=>user.email.toLowerCase()),
    ]);
    const assignedChildren=new Set(STATE.parents.flatMap(parent=>parent.children||[]));
    const prepared=[];
    for(const [index,cells] of rows.slice(1).entries()){
      const value=name=>{const position=column(name);return position<0?'':(cells[position]||'').trim();};
      const name=value('Name'), email=value('Email').toLowerCase(), phone=value('Phone'), password=value('Password');
      const childKey=value('Student ID')||value('LRN');
      const child=classStudents.find(student=>student.id.toLowerCase()===childKey.toLowerCase()||(student.lrn||'')===childKey);
      if(!name||!email||!phone||!password||!childKey) throw new Error(`Row ${index+2}: name, email, phone, password, and student ID/LRN are required.`);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Row ${index+2}: enter a valid email address.`);
      if(existingEmails.has(email)) throw new Error(`Row ${index+2}: ${email} already has a parent account.`);
      if(!child) throw new Error(`Row ${index+2}: student ${childKey} is not in your class.`);
      if(assignedChildren.has(child.id)) throw new Error(`Row ${index+2}: ${child.name} already has a parent linked.`);
      existingEmails.add(email); assignedChildren.add(child.id);
      prepared.push({name,email,phone,password,childId:child.id,child});
    }

    let imported=0;
    const useApi=typeof api!=='undefined'&&Boolean(api.getToken());
    try{
      for(const parent of prepared){
        let id;
        if(useApi){
          const created=await api.addParent({name:parent.name,email:parent.email,phone:parent.phone,password:parent.password,childId:parent.childId});
          id=created.id;
          STATE.users[id]={role:'parent',id,name:parent.name,email:parent.email,password:'',childId:parent.childId};
        }else{
          if(!STATE.nextParentId) STATE.nextParentId=STATE.parents.length+1;
          id='P'+String(STATE.nextParentId++).padStart(3,'0');
          STATE.users[id]={role:'parent',id,name:parent.name,email:parent.email,password:parent.password,childId:parent.childId};
        }
        STATE.parents.push({id,name:parent.name,email:parent.email,phone:parent.phone,children:[parent.childId]});
        parent.child.parentId=id; parent.child.parent=parent.name; parent.child.parentEmail=parent.email;
        imported++;
      }
    }catch(error){
      toast(`${imported} parent(s) imported; stopped at the next row: ${error.message||'API request failed.'}`,'error');
      if(imported&&typeof window.refreshParentRowsTeacher==='function') window.refreshParentRowsTeacher();
      return;
    }
    toast(`${imported} parent account(s) imported.`);
    if(typeof window.refreshParentRowsTeacher==='function') window.refreshParentRowsTeacher();
  }catch(error){
    toast(error.message||'Could not import this spreadsheet.','error');
  }
}