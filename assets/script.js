/* ════════════════════════════════════════
   STATE — reactive data store
   ════════════════════════════════════════ */
const STATE = {
  currentUser: null,
  activeNav: '',

  students: [
    {id:'S001',name:'Ana Reyes',grade:'Grade 4',section:'Mabini',gender:'F',parent:'Mrs. Liza Reyes',parentEmail:'parent@gmail.com',parentId:'P001',contact:'09171234567',status:'active',enrolled:'2024-06-01'},
    {id:'S002',name:'Ben Gomez',grade:'Grade 4',section:'Mabini',gender:'M',parent:'Mr. Carlos Gomez',parentEmail:'cgomez@gmail.com',parentId:'P002',contact:'09182345678',status:'active',enrolled:'2024-06-01'},
    {id:'S003',name:'Juan Jr. Dela Cruz',grade:'Grade 4',section:'Mabini',gender:'M',parent:'Mr. Juan Dela Cruz',parentEmail:'parent@gmail.com',parentId:'P003',contact:'09193456789',status:'active',enrolled:'2024-06-01'},
    {id:'S004',name:'Carla Santos',grade:'Grade 4',section:'Mabini',gender:'F',parent:'Mrs. Rosa Santos',parentEmail:'rsantos@gmail.com',parentId:'P004',contact:'09204567890',status:'active',enrolled:'2024-06-01'},
    {id:'S005',name:'Diego Lim',grade:'Grade 4',section:'Mabini',gender:'M',parent:'Ms. Aileen Lim',parentEmail:'alim@gmail.com',parentId:'P005',contact:'09215678901',status:'active',enrolled:'2024-06-01'},
    {id:'S006',name:'Eva Torres',grade:'Grade 4',section:'Rizal',gender:'F',parent:'Mr. Bobby Torres',parentEmail:'btorres@gmail.com',parentId:'P006',contact:'09226789012',status:'active',enrolled:'2024-06-01'},
    {id:'S007',name:'Felix Ramos',grade:'Grade 5',section:'Bonifacio',gender:'M',parent:'Mrs. Nena Ramos',parentEmail:'nramos@gmail.com',parentId:'P007',contact:'09237890123',status:'active',enrolled:'2024-06-01'},
    {id:'S008',name:'Grace Tan',grade:'Grade 5',section:'Bonifacio',gender:'F',parent:'Mr. Anthony Tan',parentEmail:'atan@gmail.com',parentId:'P008',contact:'09248901234',status:'inactive',enrolled:'2024-06-01'},
    {id:'S009',name:'Harold Cruz',grade:'Grade 3',section:'Luna',gender:'M',parent:'Mrs. Paz Cruz',parentEmail:'pcruz@gmail.com',parentId:'P009',contact:'09259012345',status:'active',enrolled:'2024-06-01'},
    {id:'S010',name:'Iris Bautista',grade:'Grade 3',section:'Luna',gender:'F',parent:'Mr. Leo Bautista',parentEmail:'lbautista@gmail.com',parentId:'P010',contact:'09260123456',status:'active',enrolled:'2024-06-01'},
  ],

  teachers: [
    {id:'T001',name:'Ms. Maria Santos',email:'teacher@smartgrade.edu',phone:'09171111111',grade:'Grade 4',section:'Mabini',subjects:'All Subjects',status:'active',joined:'2020-06-01'},
    {id:'T002',name:'Mr. Pedro Reyes',email:'preyes@smartgrade.edu',phone:'09182222222',grade:'Grade 5',section:'Bonifacio',subjects:'All Subjects',status:'active',joined:'2019-06-01'},
    {id:'T003',name:'Ms. Carmen Lim',email:'clim@smartgrade.edu',phone:'09193333333',grade:'Grade 4',section:'Rizal',subjects:'All Subjects',status:'active',joined:'2021-06-01'},
    {id:'T004',name:'Mr. Danilo Torres',email:'dtorres@smartgrade.edu',phone:'09204444444',grade:'Grade 3',section:'Luna',subjects:'All Subjects',status:'active',joined:'2018-06-01'},
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
    S002:{math:[75,78,72,80],science:[82,79,85,81],english:[70,73,68,75],filipino:[80,82,78,83],ap:[77,75,80,78]},
    S003:{math:[95,97,93,96],science:[88,91,89,92],english:[90,93,88,92],filipino:[85,87,84,88],ap:[91,93,90,94]},
    S004:{math:[82,85,80,84],science:[79,81,78,82],english:[88,90,86,89],filipino:[86,88,84,87],ap:[83,85,82,86]},
    S005:{math:[65,68,62,70],science:[72,70,75,71],english:[68,65,70,67],filipino:[75,77,73,76],ap:[70,68,72,69]},
    S006:{math:[90,93,88,92],science:[85,87,83,89],english:[88,91,86,90],filipino:[92,94,90,93],ap:[87,89,85,91]},
    S007:{math:[78,80,75,82],science:[84,86,81,85],english:[76,79,73,80],filipino:[82,84,80,85],ap:[79,81,77,83]},
    S008:{math:[72,74,70,76],science:[78,75,80,77],english:[74,72,76,73],filipino:[77,79,75,78],ap:[73,71,75,72]},
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
  },

  messages: [
    {id:1,fromRole:'parent',fromId:'P003',fromName:'Mr. Juan Dela Cruz',toRole:'teacher',toId:'teacher',subject:'Concern about Math performance',body:'Good day Ma\'am Santos. I would like to ask about my son Juan Jr.\'s performance in Math this quarter. He seems to be struggling with fractions at home. Can we schedule a parent-teacher meeting this week? Thank you.',date:'2025-01-20',time:'09:30 AM',read:false,studentId:'S003',thread:null},
    {id:2,fromRole:'teacher',fromId:'teacher',fromName:'Ms. Maria Santos',toRole:'parent',toId:'P003',subject:'Re: Concern about Math performance',body:'Good day Mr. Dela Cruz! Thank you for reaching out. Juan Jr. is actually doing exceptionally well — he currently holds the highest Math score in class at 95 this quarter! I would be happy to meet on Friday at 3:00 PM to show you his progress charts and discuss strategies to keep him motivated. Please confirm your availability.',date:'2025-01-21',time:'10:15 AM',read:true,studentId:'S003',thread:1},
    {id:3,fromRole:'admin',fromId:'admin',fromName:'Principal Roberto Cruz',toRole:'teacher',toId:'teacher',subject:'Q3 Grade Submission Reminder',body:'Dear Teachers, This is a reminder that Q3 grades must be submitted by January 31, 2025, 5:00 PM. Please ensure all student records are accurate and complete. Late submissions will require a signed explanation form. Contact the registrar\'s office for any concerns. Thank you.',date:'2025-01-22',time:'08:00 AM',read:false,studentId:null,thread:null},
    {id:4,fromRole:'parent',fromId:'parent2',fromName:'Mrs. Rosa Santos',toRole:'teacher',toId:'teacher',subject:'Scholarship Application – Progress Report Needed',body:'Good morning Ma\'am! We are applying for a scholarship for Carla and we need an updated official progress report. Could you please prepare this at your earliest convenience? We need it by January 28. Thank you very much!',date:'2025-01-24',time:'07:45 AM',read:false,studentId:'S004',thread:null},
    {id:5,fromRole:'teacher',fromId:'teacher',fromName:'Ms. Maria Santos',toRole:'parent',toId:'parent3',subject:'Attendance Alert: Diego Lim',body:'Dear Ms. Aileen Lim, I hope this message finds you well. I am writing to inform you that Diego has been absent 5 times this month, which may affect his quarterly grades and standing. Attendance is critical at this stage. Please let me know if there are any issues we can address together. I am available for a call this week.',date:'2025-01-23',time:'02:00 PM',read:true,studentId:'S005',thread:null},
  ],

  announcements: [
    {id:1,title:'Q3 Report Cards Now Ready for Pickup',body:'Grade 3, 4, and 5 report cards for the 3rd quarter are now available at the Registrar\'s Office. Please bring a valid government-issued ID. Parents must sign the logbook upon claiming. Office hours: Monday to Friday, 8:00 AM to 5:00 PM.',date:'2025-01-25',audience:'all',author:'Principal Cruz',priority:'high',authorRole:'admin'},
    {id:2,title:'Parent-Teacher Conference – February 5, 2025',body:'The quarterly Parent-Teacher Conference is scheduled on Wednesday, February 5, 2025 from 8:00 AM to 12:00 NN. All parents of Grade 3, 4, and 5 students are strongly encouraged to attend. Please sign up at the front office or contact your child\'s teacher to confirm your schedule.',date:'2025-01-24',audience:'all',author:'Principal Cruz',priority:'high',authorRole:'admin'},
    {id:3,title:'Science Fair Project Proposals Due January 30',body:'All Grade 4 homeroom teachers must collect and compile student Science Fair project proposals by January 30, 2025. Please use the approved format from the Science Department. Projects will be evaluated on relevance, feasibility, and scientific method. Submit proposals to Ms. Reyes at the Science Office.',date:'2025-01-23',audience:'teacher',author:'Principal Cruz',priority:'normal',authorRole:'admin'},
    {id:4,title:'No Classes – February 25 (EDSA People Power Anniversary)',body:'There will be no classes on Tuesday, February 25, 2025 in observance of the EDSA People Power Revolution Anniversary, a national holiday. Regular classes will resume on Wednesday, February 26, 2025.',date:'2025-01-22',audience:'all',author:'Admin Office',priority:'normal',authorRole:'admin'},
  ],

  classes: [
    {id:'C001',grade:'Grade 3',section:'Luna',teacherId:'T004',year:'2024-2025'},
    {id:'C002',grade:'Grade 4',section:'Mabini',teacherId:'T001',year:'2024-2025'},
    {id:'C003',grade:'Grade 4',section:'Rizal',teacherId:'T003',year:'2024-2025'},
    {id:'C004',grade:'Grade 5',section:'Bonifacio',teacherId:'T002',year:'2024-2025'},
  ],

  users: {
    teacher:{role:'teacher',id:'teacher',name:'Ms. Maria Santos',email:'teacher@smartgrade.edu',password:'teacher123',grade:'Grade 4',section:'Mabini',teacherId:'T001'},
    parent:{role:'parent',id:'P003',name:'Mr. Juan Dela Cruz',email:'parent@gmail.com',password:'parent123',childIds:['S003'],childId:'S003'},
    admin:{role:'admin',id:'admin',name:'Principal Roberto Cruz',email:'admin@smartgrade.edu',password:'admin123',school:'Polangui South Central School'},
  },

  subjects: ['math','science','english','filipino','ap'],
  subjectLabels: {math:'Mathematics',science:'Science',english:'English',filipino:'Filipino',ap:'Araling Panlipunan'},
  quarters: ['Q1','Q2','Q3','Q4','Final'],
  nextStudentId: 11,
  nextTeacherId: 5,
  nextMsgId: 6,
  nextAnnId: 5,
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

  // Swipe RIGHT from left edge to open
  document.addEventListener('touchstart', function(e){
    _dragStartX = e.touches[0].clientX;
    _dragCurrentX = _dragStartX;

    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;

    // Dragging from sidebar when open
    if(_sidebarOpen && sidebar.contains(e.target)){
      _isDragging = true;
      sidebar.style.transition = 'none';
    }

    // Swipe from left edge (within 20px) to open
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
      // Drag LEFT to close
      if(diff < 0){
        sidebar.style.transform = `translateX(${diff}px)`;
        if(_sidebarOverlay){
          const opacity = Math.max(0, 0.5 + diff / 500);
          _sidebarOverlay.style.opacity = opacity;
        }
      }
    } else {
      // Drag RIGHT to open
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
      // If swiped left more than 80px → close
      if(diff < -80){
        closeSidebar();
      } else {
        // Snap back open
        sidebar.style.transform = 'translateX(0)';
        if(_sidebarOverlay) _sidebarOverlay.style.opacity = '';
      }
    } else {
      // If swiped right more than 80px → open
      if(diff > 80){
        openSidebar();
      } else {
        // Snap back closed
        sidebar.style.transform = '';
        sidebar.style.visibility = 'hidden';
      }
    }
  }, { passive: true });

});
/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
const avg = a => a&&a.length ? Math.round(a.reduce((s,v)=>s+v,0)/a.length) : 0;
const ini = n => n.split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase();
const glabel = n => n>=90?'Outstanding':n>=85?'Very Satisfactory':n>=80?'Satisfactory':n>=75?'Fairly Satisfactory':'Did Not Meet';
const gbadge = n => n>=90?'bg-green':n>=80?'bg-blue':n>=75?'bg-amber':'bg-red';
const gcol = n => n>=90?'var(--green)':n>=80?'var(--blue)':n>=75?'var(--amber)':'var(--red)';
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
  markNotificationsRead();
  updateUnreadBadge();
  nav('announcements');
}

function toggleNotifications(){
  const existing = document.getElementById('notif-dropdown');
  if(existing){ existing.remove(); return; }
  const list = STATE.notifications.map(n=>`
    <div class="notif-item ${n.type==='high'?'high':''}">
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

// kept for compatibility (won’t break anything even if not used)
function setRole(role){
  selRole = role;
}
function doLogin(){
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value.trim();

  // find user across ALL roles
  let foundUser = null;
  let foundRole = null;

  for (const role in STATE.users) {
    const user = STATE.users[role];
    if (user.email === email && user.password === pass) {
      foundUser = user;
      foundRole = role;
      break;
    }
  }

  // if no match
  if(!foundUser){
    toast('Invalid email or password.','error');
    return;
  }

  // set logged in user
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

  // reset role safely (no buttons anymore)
  selRole = "teacher";

  // clear login fields
  document.getElementById('l-email').value = '';
  document.getElementById('l-pass').value = '';
}
function togglePasswordVisibility(){
  const passInput = document.getElementById('l-pass');
  const toggleBtn = document.getElementById('pass-toggle');
  if(!passInput || !toggleBtn) return;
  const isHidden = passInput.type === 'password';
  passInput.type = isHidden ? 'text' : 'password';
  toggleBtn.innerHTML = `<i class="fa-solid ${isHidden ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
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
    {id:'announcements',l:'Announcements',ic:'bell'},
    {s:'Tools'},
    {id:'reports',l:'Reports',ic:'chart'},
  ],
  parent:[
    {s:'Overview'},{id:'dashboard',l:'Dashboard',ic:'home'},
    {s:"My Child"},
    {id:'grades',l:'Academic Record',ic:'grade'},
    {id:'attendance',l:'Attendance',ic:'cal'},
    {s:'Communication'},
    {id:'messages',l:'Messages',ic:'msg'},
    {id:'announcements',l:'School News',ic:'bell'},
  ],
  admin:[
    {s:'Overview'},{id:'dashboard',l:'Dashboard',ic:'home'},
    {s:'Management'},
    {id:'students',l:'Students',ic:'people'},
    {id:'teachers',l:'Teachers',ic:'person'},
    {id:'parents',l:'Parents',ic:'person'},
    {id:'classes',l:'Classes',ic:'school'},
    {s:'View Only'},
    {id:'grades',l:'Grade Overview',ic:'grade'},
    {id:'attendance',l:'Attendance',ic:'cal'},
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
    sb.innerHTML += `<button class="nav-link" id="nl-${item.id}" onclick="nav('${item.id}')">${svgIco[item.ic]||''} ${item.l}${unread?`<span class="nav-count">${unread}</span>`:''}</button>`;
  });

  // Profile + Signout at bottom
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
  closeSidebar(); // ← always close sidebar first
  if(STATE.activeNav){ 
    document.getElementById('nl-'+STATE.activeNav)?.classList.remove('active'); 
  }
  STATE.activeNav = page;
  document.getElementById('nl-'+page)?.classList.add('active');
  const c = document.getElementById('content');
  c.innerHTML='';
  const role = STATE.currentUser.role;
  const pages = {
    teacher:{dashboard:pgTeacherDash,students:pgStudents,grades:pgGrades,attendance:pgAttendance,messages:pgMessages,announcements:pgAnnouncements,reports:pgReports,profile:pgProfile},
    parent:{dashboard:pgParentDash,grades:pgGrades,attendance:pgAttendance,messages:pgMessages,announcements:pgAnnouncements,profile:pgProfile},
    admin:{dashboard:pgAdminDash,students:pgStudents,teachers:pgTeachers,parents:pgParents,classes:pgClasses,grades:pgGrades,attendance:pgAttendance,messages:pgMessages,announcements:pgAnnouncements,reports:pgReports,profile:pgProfile}
  };
  (pages[role]?.[page] || (()=>{ c.innerHTML='<div class="empty-state"><div class="es-icon">🔍</div><div class="es-title">Page not found</div></div>'; }))(c);
}
/* ════════════════════════════════════════
   ██████████ TEACHER DASHBOARD ██████████
   ════════════════════════════════════════ */
function pgTeacherDash(el){
  const u = STATE.currentUser;
  const myStudents = STATE.students.filter(s=>s.section===u.section&&s.grade===u.grade&&s.status==='active');
  const unread = STATE.messages.filter(m=>!m.read&&m.toRole==='teacher'&&m.toId===u.id).length;
  let allScores=[];
  myStudents.forEach(s=>{const g=STATE.grades[s.id];if(g) STATE.subjects.forEach(sub=>allScores.push(avg(g[sub])));});
  const clsAvg = allScores.length?Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length):0;
  const lowCount = myStudents.filter(s=>{const g=STATE.grades[s.id];return g&&STATE.subjects.some(sub=>avg(g[sub])<75);}).length;
  const totPres = myStudents.reduce((a,s)=>{const at=STATE.attendance[s.id];return a+(at?at.present:0);},0);
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
        <div><div class="hero-kpi-val">${clsAvg}</div><div class="hero-kpi-lbl">Class Average</div></div>
        <div><div class="hero-kpi-val">${attR}%</div><div class="hero-kpi-lbl">Attendance Rate</div></div>
        <div><div class="hero-kpi-val">${unread}</div><div class="hero-kpi-lbl">Unread Messages</div></div>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-lbl">My Students</div><div class="stat-val green">${myStudents.length}</div><div class="stat-foot">${u.grade} – ${u.section}</div><div class="stat-bar"><div class="stat-bar-f" style="width:100%;background:var(--green)"></div></div></div>
    <div class="stat-card"><div class="stat-lbl">Class Average</div><div class="stat-val ${clsAvg>=85?'green':clsAvg>=75?'amber':'red'}">${clsAvg}</div><div class="stat-foot">${glabel(clsAvg)}</div><div class="stat-bar"><div class="stat-bar-f" style="width:${clsAvg}%;background:${gcol(clsAvg)}"></div></div></div>
    <div class="stat-card"><div class="stat-lbl">Need Attention</div><div class="stat-val ${lowCount>0?'red':'green'}">${lowCount}</div><div class="stat-foot">Students below 75</div><div class="stat-bar"><div class="stat-bar-f" style="width:${myStudents.length?lowCount/myStudents.length*100:0}%;background:var(--red)"></div></div></div>
    <div class="stat-card"><div class="stat-lbl">Unread Messages</div><div class="stat-val ${unread>0?'amber':'green'}">${unread}</div><div class="stat-foot">Parent messages</div><div class="stat-bar"><div class="stat-bar-f" style="width:${Math.min(unread*15,100)}%;background:var(--amber)"></div></div></div>
  </div>

  <div class="g2 mb-16">
    <!-- Student Performance -->
    <div class="card">
      <div class="card-header"><div class="card-title" style="margin:0">Student Performance</div><button class="btn btn-secondary btn-xs" onclick="nav('grades')">Enter Grades</button></div>
      <div id="perf-list">
      ${myStudents.length===0?`<div class="empty-state"><div class="es-icon">👥</div><div class="es-title">No students found</div></div>`:
        myStudents.map(s=>{
          const g=STATE.grades[s.id];
          const ov=g?Math.round(STATE.subjects.reduce((a,sub)=>a+avg(g[sub]),0)/STATE.subjects.length):0;
          const att=STATE.attendance[s.id];
          const attRate=att?Math.round(att.present/att.total*100):0;
          return `<div class="flex aic gap-12" style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div class="av av-40 av-green">${ini(s.name)}</div>
            <div class="f1">
              <div class="fw6 ts">${s.name}</div>
              <div style="height:4px;background:var(--surface2);border-radius:2px;margin-top:5px"><div style="height:100%;width:${ov}%;background:${gcol(ov)};border-radius:2px;transition:width .6s"></div></div>
            </div>
            <div style="text-align:right">
              <span class="badge ${gbadge(ov)}">${ov}</span>
              <div class="txs tmm mt-8">${attRate}% present</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Right column -->
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Messages -->
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

      <!-- Quick Actions -->
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

  <!-- Subject Averages -->
  <div class="card mb-16">
    <div class="card-header"><div class="card-title" style="margin:0">Subject Performance Overview</div><span class="badge bg-gray">${u.grade} – ${u.section}</span></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
      ${STATE.subjects.map(sub=>{
        let vals=[];myStudents.forEach(s=>{const g=STATE.grades[s.id];if(g&&g[sub]) vals.push(avg(g[sub]));});
        const sa=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
        return `<div style="padding:16px;background:var(--bg);border-radius:12px;text-align:center">
          <div class="txs tmm fw7" style="text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${STATE.subjectLabels[sub].split(' ')[0]}</div>
          <div style="font-size:28px;font-weight:800;color:${gcol(sa)};letter-spacing:-1px">${sa}</div>
          <div style="height:4px;background:var(--surface2);border-radius:2px;margin-top:8px"><div style="height:100%;width:${sa}%;background:${gcol(sa)};border-radius:2px"></div></div>
          <div class="txs tmm mt-8">${glabel(sa)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Announcements preview -->
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
  const child = STATE.students.find(s=>s.id===u.childId);
  const g = STATE.grades[u.childId]||{};
  const att = STATE.attendance[u.childId]||{present:0,absent:0,late:0,total:45};
  const subs = STATE.subjects.map(sub=>avg(g[sub]||[]));
  const ov = subs.length?Math.round(subs.reduce((a,b)=>a+b,0)/subs.length):0;
  const attR = att.total?Math.round(att.present/att.total*100):0;
  const myMsgs = STATE.messages.filter(m=>m.studentId===u.childId||m.toId===u.id||m.fromId===u.id);
  const unread = myMsgs.filter(m=>!m.read&&m.toId===u.id).length;
  const bestI = subs.indexOf(Math.max(...subs));
  const worstI = subs.indexOf(Math.min(...subs));
  const today = new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  el.innerHTML=`
  <div class="dash-hero hero-amber" style="margin-bottom:22px">
    <div style="position:absolute;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.06);top:-80px;right:-60px"></div>
    <div style="position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.04);bottom:-60px;right:180px"></div>
    <div style="position:relative;z-index:1">
      <div class="hero-rl">Parent Dashboard</div>
      <div class="hero-name">Welcome, ${u.name.split(' ')[1]}! 👋</div>
      <div class="hero-sub">Monitoring: <strong style="color:#fff">${child?.name||'Your Child'}</strong> &nbsp;·&nbsp; ${child?.grade} – ${child?.section}</div>
      <div class="hero-kpis">
        <div><div class="hero-kpi-val">${ov}</div><div class="hero-kpi-lbl">Overall Average</div></div>
        <div><div class="hero-kpi-val">${attR}%</div><div class="hero-kpi-lbl">Attendance Rate</div></div>
        <div><div class="hero-kpi-val">${att.absent}</div><div class="hero-kpi-lbl">Days Absent</div></div>
        <div><div class="hero-kpi-val">${unread}</div><div class="hero-kpi-lbl">New Messages</div></div>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-lbl">Overall Grade</div><div class="stat-val ${ov>=90?'green':ov>=75?'amber':'red'}">${ov}</div><div class="stat-foot">${glabel(ov)}</div></div>
    <div class="stat-card"><div class="stat-lbl">Attendance</div><div class="stat-val ${attR>=90?'green':attR>=75?'amber':'red'}">${attR}%</div><div class="stat-foot">${att.present} of ${att.total} days</div></div>
    <div class="stat-card"><div class="stat-lbl">Best Subject</div><div class="stat-val green">${subs[bestI]}</div><div class="stat-foot">${STATE.subjectLabels[STATE.subjects[bestI]]}</div></div>
    <div class="stat-card"><div class="stat-lbl">Needs Focus</div><div class="stat-val ${subs[worstI]<75?'red':'amber'}">${subs[worstI]}</div><div class="stat-foot">${STATE.subjectLabels[STATE.subjects[worstI]]}</div></div>
  </div>

  <div class="g2 mb-16">
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Child Profile -->
      <div class="card" style="background:linear-gradient(135deg,var(--amber-l),var(--bg))">
        <div class="flex aic gap-14">
          <div class="av av-52 av-amber">${ini(child?.name||'')}</div>
          <div class="f1">
            <div style="font-size:18px;font-weight:800;letter-spacing:-.3px">${child?.name}</div>
            <div class="ts tm">${child?.grade} – ${child?.section}</div>
            <div class="txs tmm mt-8">LRN: ${child?.id} &nbsp;·&nbsp; ${child?.gender==='F'?'Female':'Male'}</div>
          </div>
          <span class="badge bg-green" style="font-size:12px">${child?.status}</span>
        </div>
        <div class="divider"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
          <div style="padding:10px;background:var(--green-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--green)">${att.present}</div><div class="txs tm">Present</div></div>
          <div style="padding:10px;background:var(--red-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--red)">${att.absent}</div><div class="txs tm">Absent</div></div>
          <div style="padding:10px;background:var(--amber-l);border-radius:9px"><div style="font-size:22px;font-weight:800;color:var(--amber)">${att.late}</div><div class="txs tm">Late</div></div>
        </div>
      </div>

      <!-- Subject Grades -->
      <div class="card">
        <div class="card-header"><div class="card-title" style="margin:0">Subject Performance</div><button class="btn btn-secondary btn-xs" onclick="nav('grades')">Full Record</button></div>
        ${STATE.subjects.map((sub,i)=>`
          <div class="prog-wrap">
            <div class="prog-top"><span class="prog-lbl">${STATE.subjectLabels[sub]}</span><span class="badge ${gbadge(subs[i])}">${subs[i]}</span></div>
            <div class="prog-track"><div class="prog-fill" style="width:${subs[i]}%;background:${gcol(subs[i])}"></div></div>
          </div>`).join('')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Quarterly breakdown -->
      <div class="card">
        <div class="card-title">Quarterly Grades – Mathematics</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${STATE.quarters.map((q,i)=>{
            const sc=g.math?g.math[i]:0;
            return `<div style="padding:14px 8px;background:${sc>=90?'var(--green-l)':sc>=75?'var(--amber-l)':'var(--red-l)'};border-radius:10px;text-align:center">
              <div class="txs tmm fw7" style="text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">${q}</div>
              <div style="font-size:24px;font-weight:800;color:${gcol(sc)};letter-spacing:-1px">${sc}</div>
              <div class="txs" style="color:${gcol(sc)};margin-top:4px">${sc>=90?'Outstanding':sc>=75?'Satisfactory':'Below'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Messages -->
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

      <!-- Announcements -->
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
    if(g){
      const ov=Math.round(STATE.subjects.reduce((a,sub)=>a+avg(g[sub]),0)/STATE.subjects.length);
      allOv.push(ov);
    }
  });
  const schAvg=allOv.length?Math.round(allOv.reduce((a,b)=>a+b,0)/allOv.length):0;
  const outstanding=allOv.filter(x=>x>=90).length;
  const unreadMsgs=STATE.messages.filter(m=>!m.read).length;
  const today=new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  el.innerHTML=`
  <!-- Hero -->
  <div class="dash-hero hero-blue" style="margin-bottom:22px">
    <div style="position:absolute;width:260px;height:260px;border-radius:50%;
      background:rgba(255,255,255,.05);top:-80px;right:-60px"></div>
    <div style="position:absolute;width:180px;height:180px;border-radius:50%;
      background:rgba(255,255,255,.04);bottom:-60px;right:180px"></div>
    <div style="position:relative;z-index:1">
      <div class="hero-rl">Admin Dashboard</div>
      <div class="hero-name">Welcome, ${u.name.split(' ').slice(-1)[0]}! 🏫</div>
      <div class="hero-sub">${today}</div>
      <div class="hero-kpis">
        <div><div class="hero-kpi-val">${total}</div><div class="hero-kpi-lbl">Total Students</div></div>
        <div><div class="hero-kpi-val">${STATE.teachers.length}</div><div class="hero-kpi-lbl">Teachers</div></div>
        <div><div class="hero-kpi-val">${schAvg}</div><div class="hero-kpi-lbl">School Average</div></div>
        <div><div class="hero-kpi-val">${unreadMsgs}</div><div class="hero-kpi-lbl">Unread Messages</div></div>
      </div>
    </div>
  </div>

  <!-- Stat Cards -->
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

  <!-- Quick Actions -->
  <div class="card mb-16">
    <div class="card-title">Quick Actions</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
      ${[
        {icon:'👤',label:'Add Student',action:"openAddStudentModal()"},
        {icon:'👩‍🏫',label:'Add Teacher',action:"openAddTeacherModal()"},
        {icon:'👨‍👩‍👧',label:'Add Parent',action:"openAddParentModal()"},
        {icon:'📢',label:'Announcement',action:"openAddAnnouncementModal()"},
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
    <!-- Recent Students -->
    <div class="card">
      <div class="card-header">
        <div class="card-title" style="margin:0">Recent Students</div>
        <button class="btn btn-secondary btn-xs" onclick="nav('students')">View All</button>
      </div>
      ${STATE.students.slice(0,5).map(s=>{
        const g=STATE.grades[s.id];
        const ov=g?Math.round(STATE.subjects.reduce((a,sub)=>a+avg(g[sub]),0)/STATE.subjects.length):0;
        return `<div class="flex aic gap-10" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="av av-32 av-green">${ini(s.name)}</div>
          <div class="f1">
            <div class="fw6 ts">${s.name}</div>
            <div class="txs tmm">${s.grade} – ${s.section}</div>
          </div>
          <span class="badge ${gbadge(ov)}">${ov}</span>
        </div>`;
      }).join('')}
    </div>

    <!-- Recent Teachers -->
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

  <!-- Announcements -->
  <div class="card">
    <div class="card-header">
      <div class="card-title" style="margin:0">Latest Announcements</div>
      <button class="btn btn-primary btn-xs" onclick="openAddAnnouncementModal()">+ Post</button>
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
  // Create inline modal (works without app shell)
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

  function getFiltered(){
    const all = isTeacher
      ? STATE.students.filter(s=>s.section===STATE.currentUser.section&&s.grade===STATE.currentUser.grade)
      : STATE.students;
    if(!searchVal.trim()) return all;
    const q = searchVal.toLowerCase();
    return all.filter(s=>
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
          <div><div class="fw6">${s.name}</div><div class="txs tmm">${s.id}</div></div>
        </div></td>
        <td>${s.grade} – ${s.section}</td>
        <td>${s.gender==='F'?'Female':'Male'}</td>
        <td><div>${s.parent}</div><div class="txs tmm">${s.parentEmail}</div></td>
        <td>${s.contact}</td>
        <td><span class="badge ${s.status==='active'?'bg-green':'bg-gray'}">${s.status}</span></td>
        ${isAdmin?`<td><div class="flex gap-6">
          <button class="btn btn-secondary btn-xs" onclick="viewStudentModal('${s.id}')">View</button>
          <button class="btn btn-secondary btn-xs" onclick="openEditStudentModal('${s.id}')">Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteStudent('${s.id}','${s.name}')">Delete</button>
        </div></td>`:'<td><button class="btn btn-secondary btn-xs" onclick="viewStudentModal(\''+s.id+'\')">View</button></td>'}
      </tr>`).join('');
  }

  // Build shell once — never rebuild on search
  el.innerHTML=`
  <div class="page-head">
    <div><div class="page-title">${isAdmin?'All Students':'My Students'}</div>
    <div class="page-sub" id="students-count">${STATE.students.length} student(s)</div></div>
    ${isAdmin?`<div class="page-actions">
      <button class="btn btn-primary" onclick="openAddStudentModal()">+ Add Student</button>
    </div>`:''}
  </div>
  <div class="tbl-wrap">
    <div class="tbl-toolbar">
      <input class="tbl-search" id="student-search"
        placeholder="🔍 Search students..."
        oninput="handleStudentSearch(this.value)">
      ${isAdmin?`<button class="btn btn-secondary btn-sm" onclick="exportStudents()">Export</button>`:''}
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
      ${!isTeacher ? `
      <div class="fg"><label>Grade*</label><select id="sf-gr">
        ${['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'].map(g=>`<option>${g}</option>`).join('')}
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

  // Add to students list
  STATE.students.push(newStudent);

  // Initialize grades
  STATE.grades[id] = {
    math:[0,0,0,0],
    science:[0,0,0,0],
    english:[0,0,0,0],
    filipino:[0,0,0,0],
    ap:[0,0,0,0]
  };

  // Initialize attendance
  STATE.attendance[id] = {
    present:0, absent:0, late:0, total:0
  };

  closeModal();
  toast(`Student "${fn} ${ln}" added successfully!`);

  // Refresh students page
  nav('students');
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
      <div class="fg"><label>Grade*</label><select id="ef-gr">${['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'].map(g=>`<option ${g===s.grade?'selected':''}>${g}</option>`).join('')}</select></div>
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
  const ov = STATE.subjects.length?Math.round(STATE.subjects.reduce((a,sub)=>a+avg(g[sub]||[]),0)/STATE.subjects.length):0;
  openModal(`
  <div class="modal-header"><div class="modal-title">Student Profile</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
    <div class="flex aic gap-14 mb-16" style="padding-bottom:14px;border-bottom:1px solid var(--border)">
      <div class="av av-52 av-green">${ini(s.name)}</div>
      <div><div style="font-size:20px;font-weight:800;letter-spacing:-.4px">${s.name}</div><div class="ts tm">${s.grade} – ${s.section} · ${s.gender==='F'?'Female':'Male'} · ID: ${s.id}</div><span class="badge ${s.status==='active'?'bg-green':'bg-gray'} mt-8">${s.status}</span></div>
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
    ${STATE.subjects.map(sub=>{const sc=avg(g[sub]||[]);return `<div class="flex aic jb" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="ts">${STATE.subjectLabels[sub]}</span><span class="badge ${gbadge(sc)}">${sc}</span></div>`;}).join('')}
    <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:9px;text-align:center"><div class="txs tmm">Overall Average</div><div style="font-size:28px;font-weight:800;color:${gcol(ov)}">${ov}</div><div class="ts" style="color:${gcol(ov)}">${glabel(ov)}</div></div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary" onclick="closeModal();openEditStudentModal('${id}')">Edit Student</button></div>`);
}

function deleteStudent(id, name){
  showConfirm('Delete Student', `Are you sure you want to remove <strong>${name}</strong> from the system? This action cannot be undone.`, ()=>{
    const idx = STATE.students.findIndex(s=>s.id===id);
    if(idx>=0){ STATE.students.splice(idx,1); toast(`${name} has been removed.`); nav('students'); }
  });
}

function exportStudents(){
  const rows = [['ID','Name','Grade','Section','Gender','Parent','Contact','Status']];
  STATE.students.forEach(s=>rows.push([s.id,s.name,s.grade,s.section,s.gender,s.parent,s.contact,s.status]));
  const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='students.csv';a.click();
  toast('Student list exported!');
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
      ?`<tr><td colspan="7"><div class="empty-state">
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
        <td><div class="flex gap-6">
          <button class="btn btn-secondary btn-xs" onclick="openEditTeacherModal('${t.id}')">Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteTeacher('${t.id}','${t.name}')">Delete</button>
        </div></td>
      </tr>`).join('');
  }

  el.innerHTML=`
  <div class="page-head">
    <div><div class="page-title">Teachers</div>
    <div class="page-sub" id="teachers-count">${STATE.teachers.length} teacher(s)</div></div>
    <div class="page-actions">
      <button class="btn btn-primary" onclick="openAddTeacherModal()">+ Add Teacher</button>
    </div>
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
        <th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th>
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
      <div class="fg"><label>Grade Assigned*</label><select id="tf-gr">${['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'].map(g=>`<option>${g}</option>`).join('')}</select></div>
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
      <div class="fg"><label>Grade</label><select id="etf-gr">${['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'].map(g=>`<option ${g===t.grade?'selected':''}>${g}</option>`).join('')}</select></div>
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
      <div><div class="page-title">Classes</div><div class="page-sub">Manage sections and teacher assignments</div></div>
      <div class="page-actions"><button class="btn btn-primary" onclick="openAddClassModal()">+ Add Class</button></div>
    </div>
    <div class="g2">
      ${STATE.classes.map(c=>{
        const t=STATE.teachers.find(x=>x.id===c.teacherId);
        const sts=STATE.students.filter(s=>s.grade===c.grade&&s.section===c.section&&s.status==='active');
        let sc=[];sts.forEach(s=>{const g=STATE.grades[s.id];if(g) STATE.subjects.forEach(sub=>sc.push(avg(g[sub])));});
        const ca=sc.length?Math.round(sc.reduce((a,b)=>a+b,0)/sc.length):0;
        return `<div class="card">
          <div class="flex aic gap-14 mb-16">
            <div style="width:50px;height:50px;background:var(--blue-l);border-radius:12px;display:flex;align-items:center;justify-content:center">${svgIco.school.replace('fill="currentColor"','fill="var(--blue)"').replace('width="16" height="16"','width="24" height="24"')}</div>
            <div class="f1"><div style="font-size:18px;font-weight:800;letter-spacing:-.4px">${c.grade} – ${c.section}</div><div class="ts tm">SY ${c.year}</div></div>
            <button class="btn btn-danger btn-xs" onclick="deleteClass('${c.id}','${c.grade} – ${c.section}')">Delete</button>
          </div>
          <div class="g3 mb-14" style="text-align:center">
            <div style="padding:10px;background:var(--bg);border-radius:9px"><div style="font-size:20px;font-weight:800;color:var(--blue)">${sts.length}</div><div class="txs tm">Students</div></div>
            <div style="padding:10px;background:var(--bg);border-radius:9px"><div style="font-size:20px;font-weight:800;color:${gcol(ca)}">${ca||'–'}</div><div class="txs tm">Avg Grade</div></div>
            <div style="padding:10px;background:var(--bg);border-radius:9px"><div style="font-size:16px;font-weight:800;color:var(--green)">${c.year}</div><div class="txs tm">School Year</div></div>
          </div>
          <div class="divider"></div>
          <div class="flex aic gap-10">
            <div class="av av-32 av-blue">${t?ini(t.name):'?'}</div>
            <div class="f1"><div class="fw6 ts">${t?t.name:'No teacher assigned'}</div><div class="txs tmm">Homeroom Teacher</div></div>
          </div>
          <div class="flex gap-8 mt-12">
            <button class="btn btn-secondary btn-sm f1" onclick="openEditClassModal('${c.id}')">Edit Assignment</button>
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
      <div class="fg"><label>Grade*</label><select id="clf-gr">${['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'].map(g=>`<option>${g}</option>`).join('')}</select></div>
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
  const isParent = role==='parent';
  const isAdmin = role==='admin';
  const isTeacher = role==='teacher';
  let activeQ = 0;
  let changed = {};

  function getStudents(){
    if(isParent) return STATE.students.filter(s=>s.id===STATE.currentUser.childId);
    if(isAdmin) return STATE.students.filter(s=>STATE.grades[s.id]);
    return STATE.students.filter(s=>
      s.section===STATE.currentUser.section &&
      s.grade===STATE.currentUser.grade &&
      s.status==='active'
    );
  }

  function render(){
    const students = getStudents();
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
        ? 'Enter and monitor student grades'
        : 'Encode and manage student grades'}
  </div>
</div>
      ${isTeacher
        ? `<div class="page-actions">
            <button class="btn btn-secondary" onclick="resetGrades()">Reset</button>
            <button class="btn btn-primary" onclick="saveGrades()">💾 Save Grades</button>
           </div>`
        : isAdmin
          ? `<div class="page-actions">
     <button class="btn btn-secondary" onclick="resetGrades()">Reset</button>
     <button class="btn btn-primary" onclick="saveGrades()">💾 Save Grades</button>
   </div>`
          : ''}
    </div>
    <div class="tab-bar">
      ${STATE.quarters.map((q,i)=>
        `<button class="tab-btn ${i===activeQ?'active':''}" data-qi="${i}">${q}</button>`
      ).join('')}
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            ${activeQ===4
              ? STATE.quarters.slice(0,4).map(q=>`<th>${q}</th>`).join('')
              : STATE.subjects.map(s=>`<th>${STATE.subjectLabels[s]}</th>`).join('')}
            <th>Average</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s=>{
            const g = STATE.grades[s.id]||{};
            const showFinal = activeQ===4;
            const scores = showFinal
              ? STATE.quarters.slice(0,4).map((_,qi)=>{
                  const values = STATE.subjects.map(sub=>g[sub]?g[sub][qi]:0);
                  return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
                })
              : STATE.subjects.map(sub=>g[sub]?g[sub][activeQ]:0);
            const ov = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
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
                  return `<td><span class="badge ${gbadge(sc)}">${sc}</span></td>`;
                }
                const sub = STATE.subjects[i];
                const key = `${s.id}-${sub}-${activeQ}`;
                // Admin and Parent — view only
                if(isParent || isAdmin){
                  return `<td><span class="badge ${gbadge(sc)}">${sc}</span></td>`;
                }
                // Teacher — can edit
                return `<td>
                  <input class="grade-cell ${changed[key]?'changed':''}"
                    type="number" min="0" max="100" value="${sc}"
                    data-sid="${s.id}" data-sub="${sub}" data-qi="${activeQ}"
                    onchange="onGradeChange(this,'${key}')">
                </td>`;
              }).join('')}
              <td><strong style="color:${gcol(ov)}">${ov}</strong></td>
              <td><span class="badge ${gbadge(ov)}">${glabel(ov)}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

    el.querySelectorAll('.tab-btn').forEach(btn=>{
      btn.onclick=()=>{ activeQ=parseInt(btn.dataset.qi); changed={}; render(); };
    });
  }

  window.onGradeChange=(inp,key)=>{
    let v=parseInt(inp.value)||0;
    if(v<0)v=0; if(v>100)v=100;
    inp.value=v;
    const sid=inp.dataset.sid, sub=inp.dataset.sub, qi=parseInt(inp.dataset.qi);
    if(!STATE.grades[sid]) STATE.grades[sid]={};
    if(!STATE.grades[sid][sub]) STATE.grades[sid][sub]=[0,0,0,0];
    STATE.grades[sid][sub][qi]=v;
    changed[key]=true;
    inp.classList.add('changed');
  };

  window.saveGrades=()=>{
    if(!isTeacher){ toast('Only teachers can save grades.','error'); return; }
    changed={};
    toast('Grades saved successfully!');
    render();
  };

  window.resetGrades=()=>{
    if(!isTeacher){ toast('Only teachers can reset grades.','error'); return; }
    const students=getStudents();
    students.forEach(s=>{
      if(!STATE.grades[s.id]) STATE.grades[s.id]={};
      STATE.subjects.forEach(sub=>{
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
  const isParent = role==='parent';
  const isAdmin = role==='admin';
  const isTeacher = role==='teacher';
  const calTypes=['att-h','att-h','att-p','att-p','att-p','att-a','att-p','att-l','att-p','att-p','att-p','att-h','att-h','att-p','att-p','att-p','att-p','att-a','att-p','att-p','att-p','att-h','att-h','att-p','att-p','att-p','att-l','att-p','att-h','att-h','att-p'];
  const todayDate = new Date().toISOString().split('T')[0];
  let selDate = todayDate;
  let todayRecords = {};

  function getStudents(){
    if(isParent) return STATE.students.filter(s=>s.id===STATE.currentUser.childId);
    if(isAdmin) return STATE.students.filter(s=>STATE.attendance[s.id]);
    return STATE.students.filter(s=>
      s.section===STATE.currentUser.section &&
      s.grade===STATE.currentUser.grade &&
      s.status==='active'
    );
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
        <div class="flex gap-8">
          <span class="badge bg-green">P = Present</span>
          <span class="badge bg-red">A = Absent</span>
          <span class="badge bg-amber">L = Late</span>
        </div>
      </div>
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
              <th>Rate</th>
              ${isTeacher ? `<th>Today's Status</th>` : ''}
              ${isAdmin ? `<th>Status</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${students.map(s=>{
              const a = STATE.attendance[s.id]||{present:0,absent:0,late:0,total:45};
              const rate = a.total ? Math.round(a.present/a.total*100) : 0;
              const cur = todayRecords[s.id]||'Present';
              return `<tr>
                <td>
                  <div class="flex aic gap-8">
                    <div class="av av-32 av-green">${ini(s.name)}</div>
                    <div class="fw6">${s.name}</div>
                  </div>
                </td>
                <td><span class="badge bg-green">${a.present}</span></td>
                <td><span class="badge bg-red">${a.absent}</span></td>
                <td><span class="badge bg-amber">${a.late}</span></td>
                <td>
                  <div class="flex aic gap-8">
                    <div style="flex:1;height:5px;background:var(--surface2);border-radius:3px">
                      <div style="height:100%;width:${rate}%;background:${rate>=90?'var(--green)':rate>=75?'var(--amber)':'var(--red)'};border-radius:3px"></div>
                    </div>
                    <span class="txs fw6" style="color:${rate>=90?'var(--green)':rate>=75?'var(--amber)':'var(--red)'};min-width:30px">${rate}%</span>
                  </div>
                </td>
                ${isTeacher ? `
                <td>
                  <select style="padding:6px 10px;border:1.5px solid var(--border);border-radius:7px;font-size:13px;outline:none"
                    data-sid="${s.id}" onchange="onAttendanceChange(this)">
                    <option ${cur==='Present'?'selected':''}>Present</option>
                    <option ${cur==='Absent'?'selected':''}>Absent</option>
                    <option ${cur==='Late'?'selected':''}>Late</option>
                  </select>
                </td>` : ''}
                ${isAdmin ? `
                <td><span class="badge bg-gray">${cur}</span></td>
                ` : ''}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${isParent ? `
      <div class="card">
        <div class="card-title">Attendance Calendar – January 2025</div>
        <div class="att-cal">
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="att-cal-hdr">${d}</div>`).join('')}
          ${Array.from({length:31},(_,i)=>`<div class="att-cal-cell ${calTypes[i]}" title="${i+1}">${i+1}</div>`).join('')}
        </div>
        <div class="att-legend">
          <div class="att-leg-item"><div class="att-leg-dot" style="background:var(--blue-l)"></div>Present</div>
          <div class="att-leg-item"><div class="att-leg-dot" style="background:#FDECEC"></div>Absent</div>
          <div class="att-leg-item"><div class="att-leg-dot" style="background:var(--amber-l)"></div>Late</div>
          <div class="att-leg-item"><div class="att-leg-dot" style="background:var(--surface2)"></div>No class</div>
        </div>
      </div>` : ''}
    </div>

    ${isTeacher ? `
    <div class="card mt-16">
      <div class="card-title">Attendance Rate Summary</div>
      ${students.map(s=>{
        const a = STATE.attendance[s.id]||{present:0,absent:0,late:0,total:45};
        const rate = a.total ? Math.round(a.present/a.total*100) : 0;
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

    window.saveAttendance=()=>{
      if(!isTeacher){ toast('Only teachers can save attendance.','error'); return; }
      const students2 = getStudents();
      students2.forEach(s=>{
        const val = todayRecords[s.id]||'Present';
        if(!STATE.attendance[s.id]) STATE.attendance[s.id]={present:0,absent:0,late:0,total:0};
        const a = STATE.attendance[s.id];
        if(val==='Absent'){ a.absent++; }
        else if(val==='Late'){ a.late++; a.present++; }
        else { a.present++; }
        a.total++;
      });
      todayRecords={};
      toast('Attendance saved for '+selDate+'!');
      render();
    };

    window.onAttendanceChange=(sel)=>{ todayRecords[sel.dataset.sid]=sel.value; };
    window.setAttendanceDate=(value)=>{ selDate=value; };
  }

  render();
}

/* ════════════════════════════════════════
   MESSAGES PAGE — fully functional inbox
   ════════════════════════════════════════ */
function pgMessages(el){
  el = el || document.getElementById('content');

  const u = STATE.currentUser;
  let searchQ = '';
  let activePartnerId = null;

  function getThreads(){
    const all = STATE.messages.filter(m =>
      m.toRole === u.role ||
      m.toRole === 'all' ||
      m.fromId === u.id ||
      u.role === 'admin'
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

    let threads = Object.values(threadMap);

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

  function renderThreadRows(){
    const threads = getThreads();
    const list = document.getElementById('thread-list');
    if (!list) return;

    list.innerHTML = threads.length === 0
      ? `
        <div style="padding:60px 20px;text-align:center;color:var(--text3)">
          <div style="font-size:48px;margin-bottom:12px">💬</div>
          <div style="font-weight:700;font-size:15px;color:var(--text2);margin-bottom:6px">
            No conversations yet
          </div>
          <div style="font-size:13px">
            Start a new message to connect
          </div>
        </div>`
      : threads.map(t => {
          const isMine = t.lastMsg.fromId === u.id;
          const preview =
            (isMine ? 'You: ' : '') +
            t.lastMsg.body.slice(0, 55) +
            (t.lastMsg.body.length > 55 ? '...' : '');

          const isActive = t.partnerId === activePartnerId;

          return `
            <div onclick="openThread('${t.partnerId}')"
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

              <div style="color:var(--text3);flex-shrink:0;font-size:18px">›</div>
            </div>`;
        }).join('');
  }

  function openThread(partnerId){
    activePartnerId = partnerId;

    const threads = getThreads();
    const thread = threads.find(t => t.partnerId === partnerId);
    if (!thread) return;

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

          <div style="display:flex;align-items:flex-end;gap:8px;max-width:85%;
            flex-direction:${isMine ? 'row-reverse' : 'row'}">

            <div style="padding:10px 14px;
              border-radius:${isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
              background:${isMine ? 'var(--green)' : 'white'};
              color:${isMine ? '#fff' : 'var(--text)'};
              font-size:13.5px;line-height:1.5;word-break:break-word;
              box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:100%">
              ${m.body.replace(/\n/g, '<br>')}
            </div>

          </div>
        </div>`;
    }).join('');

    openModal(`
      <div class="modal-header" style="background:var(--green-d);padding:16px 20px">
        <div style="color:#fff;font-weight:700">${thread.partnerName}</div>
        <button onclick="closeModal()">✕</button>
      </div>

      <div id="chat-body" style="padding:16px;overflow-y:auto;max-height:50vh;background:#f0f2f5">
        ${chatHTML}
      </div>

      <div style="padding:12px;display:flex;gap:8px;background:#fff">
        <textarea id="reply-area" style="flex:1"></textarea>
        <button onclick="sendReply('${partnerId}')">➤</button>
      </div>
    `);

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

  function render(){
    el.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">Messages</div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <input id="msg-search"
          style="width:100%;padding:11px"
          placeholder="Search..."
          oninput="handleMsgSearch(this.value)">
      </div>

      <div id="thread-list"></div>
    `;

    window.handleMsgSearch = (val) => {
      searchQ = val;
      renderThreadRows();
    };

    window.openThread = openThread;

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

function sendCompose(){
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
  STATE.messages.unshift(newMsg);
  updateUnreadBadge(); buildSidebar(u.role);
  closeModal(); toast('Message sent successfully!');
  nav('messages');
}

/* ════════════════════════════════════════
   ANNOUNCEMENTS PAGE
   ════════════════════════════════════════ */
function pgAnnouncements(el){
  const isAdmin=STATE.currentUser.role==='admin';
  function render(){
    el.innerHTML=`
    <div class="page-head">
      <div><div class="page-title">Announcements</div><div class="page-sub">${STATE.announcements.length} announcement(s)</div></div>
      ${isAdmin?`<div class="page-actions"><button class="btn btn-primary" onclick="openAddAnnouncementModal()">📢 Post Announcement</button></div>`:''}
    </div>
    <div style="display:grid;gap:14px">
      ${STATE.announcements.map(a=>`
        <div class="card" style="cursor:pointer" onclick="openAnnouncementModal(${a.id})">
          <div class="flex aic jb mb-10">
            <div class="flex aic gap-8">
              <span class="badge ${a.priority==='high'?'bg-red':'bg-gray'}">${a.priority==='high'?'🔔 Important':'📋 Notice'}</span>
              <span class="badge ${a.audience==='all'?'bg-blue':'bg-amber'}">${a.audience==='all'?'Everyone':'Teachers Only'}</span>
            </div>
            ${isAdmin?`<div class="flex gap-8"><button class="btn btn-secondary btn-xs" onclick="event.stopPropagation();openEditAnnouncementModal(${a.id})">Edit</button><button class="btn btn-danger btn-xs" onclick="event.stopPropagation();deleteAnnouncement(${a.id},'${a.title.replace(/'/g,"\\'")}')">Delete</button></div>`:''}
          </div>
          <div style="font-size:17px;font-weight:800;letter-spacing:-.3px;margin-bottom:4px">${a.title}</div>
          <div class="txs tmm mb-10">By ${a.author} &nbsp;·&nbsp; ${a.date}</div>
          <p class="ts tm" style="line-height:1.7">${a.body}</p>
        </div>`).join('')}
      ${STATE.announcements.length===0?`<div class="card"><div class="empty-state"><div class="es-icon">📢</div><div class="es-title">No announcements yet</div></div></div>`:''}
    </div>`;
    window.renderAnnouncements=render;
  }
  window.renderAnnouncements=render;
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
  if(!ti||!bo){ toast('Title and message are required.','error'); return; }
  STATE.announcements.unshift({
    id:STATE.nextAnnId++,title:ti,body:bo,
    date:new Date().toISOString().split('T')[0],
    audience:au,priority:pr,
    author:STATE.currentUser.name,authorRole:STATE.currentUser.role
  });
  closeModal(); toast('Announcement posted!'); nav('announcements');
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
  closeModal(); toast('Announcement updated!'); nav('announcements');
}

function deleteAnnouncement(id,title){
  showConfirm('Delete Announcement',`Remove "<strong>${title}</strong>"?`,()=>{
    const idx=STATE.announcements.findIndex(a=>a.id===id);
    if(idx>=0){ STATE.announcements.splice(idx,1); toast('Announcement deleted.'); nav('announcements'); }
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
        <td><div class="flex gap-6">
          <button class="btn btn-secondary btn-xs" onclick="openEditParentModal('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteParent('${p.id}','${p.name}')">Delete</button>
        </div></td>
      </tr>`).join('');
  }

  el.innerHTML=`
  <div class="page-head">
    <div><div class="page-title">Parents</div>
    <div class="page-sub" id="parents-count">${STATE.parents.length} parent(s)</div></div>
    <div class="page-actions">
      <button class="btn btn-primary" onclick="openAddParentModal()">+ Add Parent</button>
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
  const classGrades = teacherStudents.flatMap(s=>{ const g = STATE.grades[s.id]; return g ? subjects.map(sub=>avg(g[sub])) : []; });
  const classAvg = classGrades.length ? Math.round(classGrades.reduce((a,b)=>a+b,0)/classGrades.length) : 0;
  const lowPerformers = teacherStudents.filter(s=>{ const g = STATE.grades[s.id]; return g && subjects.some(sub=>avg(g[sub])<75); }).length;
  const teacherAttendance = teacherStudents.length ? Math.round(teacherStudents.reduce((sum,s)=>{ const at = STATE.attendance[s.id]; return sum + (at?.total ? at.present/at.total : 0); },0)/teacherStudents.length * 100) : 0;
  const childGrades = child ? STATE.grades[child.id] : null;
  const childAvg = childGrades && subjects.length ? Math.round(subjects.reduce((sum,sub)=>sum+avg(childGrades[sub]),0)/subjects.length) : 0;
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
      <div class="profile-actions"><button class="btn btn-secondary btn-sm" onclick="nav('grades')">Grade Entry</button><button class="btn btn-primary btn-sm" onclick="nav('attendance')">Attendance</button></div>
    ` : u.role==='parent' ? `
      <div class="profile-feature-head">
        <div class="profile-feature-title">Child Snapshot</div>
        <div class="profile-feature-sub">Track your child’s academic progress and attendance at a glance.</div>
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
      <div class="profile-actions"><button class="btn btn-secondary btn-sm" onclick="nav('students')">Students</button><button class="btn btn-primary btn-sm" onclick="nav('reports')">Reports</button></div>
    `;
  el.innerHTML=`
  <div class="page-head"><div><div class="page-title">Profile</div><div class="page-sub">Account details.</div></div></div>
  <div class="profile-summary">
    <div class="card">

      <!-- Facebook-style Avatar Upload -->
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px">
        <div style="position:relative;display:inline-block">
          <div id="profile-avatar" class="profile-avatar" ${avatarStyle}
            onclick="document.getElementById('pf-pic').click()"
            title="Tap to change photo"
            style="cursor:pointer">
            ${avatarText}
          </div>
          <!-- Camera icon badge -->
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
        <!-- Hidden file input -->
        <input type="file" id="pf-pic" accept="image/*"
          style="display:none"
          onchange="previewProfilePic(event)">
        <div style="font-size:12px;color:var(--text3);margin-top:10px;text-align:center">
          Tap photo to change
        </div>
      </div>

      <!-- Name & Role -->
      <div style="text-align:center;margin-bottom:16px">
        <div class="profile-name">${u.name}</div>
        <div class="profile-role">${u.role.charAt(0).toUpperCase()+u.role.slice(1)} • ${secondary}</div>
      </div>

      <div class="divider"></div>

      <!-- Form Fields -->
      <div class="form-grid form-row-2" style="margin-top:14px">
        <div class="fg"><label>Full Name</label><input id="pf-name" value="${u.name}"></div>
        <div class="fg"><label>Email</label><input id="pf-email" type="email" value="${u.email}"></div>
        ${contactField}
        ${extraField}
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-10" style="margin-top:16px">
        <button class="btn btn-secondary f1" onclick="resetProfilePic()">
          🔄 Reset Photo
        </button>
        <button class="btn btn-primary f1" onclick="saveProfile()">
          💾 Save Changes
        </button>
      </div>
    </div>

    <!-- Feature Card -->
    <div class="card">
      ${featureContent}
    </div>
  </div>

  <!-- Account Summary -->
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
    const avatar = document.getElementById('profile-avatar');
    if(avatar){
      avatar.style.backgroundImage=`url(${e.target.result})`;
      avatar.style.backgroundSize='cover';
      avatar.style.backgroundPosition='center';
      avatar.textContent='';
    }
    window._profilePic = e.target.result;
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
  myStudents.forEach(s=>{const g=STATE.grades[s.id];if(g){const ov=Math.round(STATE.subjects.reduce((a,sub)=>a+avg(g[sub]),0)/STATE.subjects.length);allOv.push({name:s.name,ov});}});
  const sorted=[...allOv].sort((a,b)=>b.ov-a.ov);

  el.innerHTML=`
  <div class="page-head"><div><div class="page-title">Reports &amp; Analytics</div><div class="page-sub">Generate and export academic data</div></div></div>

  <div class="g2 mb-16">
    ${[
      {title:'Student Report Card',desc:'Individual quarterly report card for each student.',icon:'📋'},
      {title:'Class Performance Report',desc:'Summary of grades across all subjects and quarters.',icon:'📊'},
      {title:'Attendance Report',desc:'Complete attendance records with rates per student.',icon:'📅'},
      {title:'Communication Log',desc:'Archive of all teacher-parent message exchanges.',icon:'💬'},
    ].map(r=>`<div class="card flex aic gap-14">
      <div style="width:48px;height:48px;background:var(--green-l);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${r.icon}</div>
      <div class="f1"><div class="fw7 ts mb-4">${r.title}</div><div class="txs tm mb-10">${r.desc}</div><div class="flex gap-8"><button class="btn btn-primary btn-xs" onclick="toast('PDF generated! (demo)')">Generate PDF</button><button class="btn btn-secondary btn-xs" onclick="toast('CSV exported! (demo)')">Export CSV</button></div></div>
    </div>`).join('')}
  </div>

  <div class="g2">
    <!-- Leaderboard -->
    <div class="card">
      <div class="card-header"><div class="card-title" style="margin:0">Top Performers</div><span class="badge bg-green">Ranked by average</span></div>
      ${sorted.slice(0,5).map((item,i)=>`
        <div class="flex aic gap-12" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="width:28px;height:28px;border-radius:50%;background:${i===0?'#C79800':i===1?'#C0C0C0':i===2?'#CD7F32':'var(--surface2)'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:${i<3?'#fff':'var(--text2)'};flex-shrink:0">${i+1}</div>
          <div class="f1 fw6 ts">${item.name}</div>
          <span class="badge ${gbadge(item.ov)}">${item.ov}</span>
        </div>`).join('')}
    </div>

    <!-- Subject summary -->
    <div class="card">
      <div class="card-header"><div class="card-title" style="margin:0">Subject Averages</div></div>
      ${STATE.subjects.map(sub=>{
        let vals=[];myStudents.forEach(s=>{const g=STATE.grades[s.id];if(g&&g[sub]) vals.push(avg(g[sub]));});
        const sa=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
        return `<div class="prog-wrap">
          <div class="prog-top"><span class="ts fw6">${STATE.subjectLabels[sub]}</span><span class="badge ${gbadge(sa)}">${sa}</span></div>
          <div class="prog-track"><div class="prog-fill" style="width:${sa}%;background:${gcol(sa)}"></div></div>
          <div class="txs tmm">${glabel(sa)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}