/**
 * Aura Todo - Main Application Logic
 */

// ==========================================================================
// Application State
// ==========================================================================
let state = {
  todos: [],
  builderSubtasks: [],
  editingTodoId: null,
  activeStatusFilter: 'all',
  activeCategoryFilter: 'all',
  activePriorityFilter: 'all',
  activeSort: 'created-desc',
  searchQuery: '',
  theme: 'dark',
  accent: 'violet',
  // Auth
  token: null,
  user: null
};

const API_BASE = '';

// SVG Icons Constants for Dynamic Injection
const ICONS = {
  trash: `<svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>`,
  edit: `<svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  calendar: `<svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  subtasks: `<svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  check: `<svg class="checkmark-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

// ==========================================================================
// DOM Element Selectors
// ==========================================================================
const DOM = {
  themeToggleBtn: document.getElementById('theme-toggle'),
  accentDots: document.querySelectorAll('.accent-dot'),
  greetingText: document.getElementById('greeting-text'),
  currentDateText: document.getElementById('current-date-text'),
  
  // Stats
  progressBarCircle: document.getElementById('progress-bar-circle'),
  progressPercentage: document.getElementById('progress-percentage'),
  statsTotal: document.getElementById('stats-total'),
  statsCompleted: document.getElementById('stats-completed'),
  catWorkPercent: document.getElementById('cat-work-percent'),
  catWorkFill: document.getElementById('cat-work-fill'),
  catPersonalPercent: document.getElementById('cat-personal-percent'),
  catPersonalFill: document.getElementById('cat-personal-fill'),
  
  // Filters & Sorting
  searchInput: document.getElementById('search-input'),
  statusBtns: document.querySelectorAll('.status-btn'),
  filterCategory: document.getElementById('filter-category'),
  filterPriority: document.getElementById('filter-priority'),
  sortTasks: document.getElementById('sort-tasks'),
  
  // Task Form
  taskFormContainer: document.getElementById('task-form-container'),
  formToggleHeader: document.getElementById('form-toggle-header'),
  todoForm: document.getElementById('todo-form'),
  taskTitle: document.getElementById('task-title'),
  taskDesc: document.getElementById('task-desc'),
  taskCategory: document.getElementById('task-category'),
  taskPriority: document.getElementById('task-priority'),
  taskDueDate: document.getElementById('task-due-date'),
  subtaskInputField: document.getElementById('subtask-input-field'),
  addSubtaskBtn: document.getElementById('add-subtask-btn'),
  builderSubtaskList: document.getElementById('builder-subtask-list'),
  clearFormBtn: document.getElementById('clear-form-btn'),
  submitBtn: document.querySelector('#todo-form button[type="submit"]'),
  
  // Lists
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  visibleTasksCount: document.getElementById('visible-tasks-count'),
  
  // Footer / Global Actions
  clearCompletedBtn: document.getElementById('clear-completed-btn'),
  exportBackupBtn: document.getElementById('export-backup-btn'),
  importBackupFile: document.getElementById('import-backup-file'),
  
  // Confetti Canvas
  confettiCanvas: document.getElementById('confetti-canvas'),

  // Auth
  authModal: document.getElementById('auth-modal'),
  syncAccountBtn: document.getElementById('sync-account-btn'),
  syncBtnText: document.getElementById('sync-btn-text'),
  userBadge: document.getElementById('user-badge'),
  userInitials: document.getElementById('user-initials'),
  dropdownUsername: document.getElementById('dropdown-username'),
  logoutBtn: document.getElementById('logout-btn'),
  closeAuthModalBtn: document.getElementById('close-auth-modal'),
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  loginError: document.getElementById('login-error'),
  regName: document.getElementById('reg-name'),
  regUsername: document.getElementById('reg-username'),
  regPassword: document.getElementById('reg-password'),
  regError: document.getElementById('reg-error')
};

// ==========================================================================
// Initialization & Loading
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initConfetti();
});

function initApp() {
  // 1. Load preferences first
  state.theme = localStorage.getItem('aura_theme') || 'dark';
  state.accent = localStorage.getItem('aura_accent') || 'violet';
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-accent', state.accent);

  DOM.accentDots.forEach(dot => {
    dot.classList.toggle('active', dot.getAttribute('data-accent') === state.accent);
  });

  // 2. Set dates and greeting
  updateHeaderDateTime();
  setInterval(updateHeaderDateTime, 60000);

  // 3. Set due date min to today
  const today = new Date().toISOString().split('T')[0];
  DOM.taskDueDate.min = today;

  // 4. Setup listeners
  setupEventListeners();

  // 5. Restore session or load local data
  const savedToken = localStorage.getItem('aura_token');
  const savedUser = localStorage.getItem('aura_user');
  if (savedToken && savedUser) {
    state.token = savedToken;
    state.user = JSON.parse(savedUser);
    updateAuthUI();
    fetchTasksFromServer().then(() => renderApp());
  } else {
    const savedTodos = localStorage.getItem('aura_todos');
    if (savedTodos) {
      try { state.todos = JSON.parse(savedTodos); }
      catch (e) { state.todos = []; }
    } else {
      getSeedTodos();
    }
    renderApp();
  }
}

function getSeedTodos() {
  state.todos = [
    {
      id: 'seed-1',
      title: 'Welcome to Aura Dashboard! 🚀',
      description: 'Explore the modern layout, design controls, and real-time statistics panels.',
      category: 'Work',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      createdDate: new Date().toISOString(),
      completed: false,
      subtasks: [
        { id: 'sub-1', text: 'Create a new custom todo', completed: false },
        { id: 'sub-2', text: 'Try toggling Light/Dark mode', completed: false },
        { id: 'sub-3', text: 'Switch color accents in the header', completed: true }
      ]
    },
    {
      id: 'seed-2',
      title: 'Restock groceries and meal prep',
      description: 'Pick up greens, proteins, and prepare meals for the weekdays.',
      category: 'Health',
      priority: 'medium',
      dueDate: '',
      createdDate: new Date(Date.now() - 3600000).toISOString(),
      completed: false,
      subtasks: []
    },
    {
      id: 'seed-3',
      title: 'Review quarterly budget sheet',
      description: 'Compare expenditure reports with Q2 targets.',
      category: 'Finance',
      priority: 'low',
      dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday (overdue)
      createdDate: new Date(Date.now() - 172800000).toISOString(),
      completed: false,
      subtasks: []
    }
  ];
  saveToLocalStorage();
}

function saveToLocalStorage() {
  localStorage.setItem('aura_todos', JSON.stringify(state.todos));
  localStorage.setItem('aura_theme', state.theme);
  localStorage.setItem('aura_accent', state.accent);
}

// ==========================================================================
// Event Listeners Registration
// ==========================================================================
function setupEventListeners() {
  // Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    saveToLocalStorage();
  });

  // Accent selector
  DOM.accentDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      DOM.accentDots.forEach(d => d.classList.remove('active'));
      const chosenAccent = e.target.getAttribute('data-accent');
      state.accent = chosenAccent;
      e.target.classList.add('active');
      document.documentElement.setAttribute('data-accent', chosenAccent);
      saveToLocalStorage();
    });
  });

  // Search input
  DOM.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderTodos();
  });

  // Filters
  DOM.statusBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      DOM.statusBtns.forEach(b => b.classList.remove('active'));
      state.activeStatusFilter = e.target.getAttribute('data-status');
      e.target.classList.add('active');
      renderTodos();
    });
  });

  DOM.filterCategory.addEventListener('change', (e) => {
    state.activeCategoryFilter = e.target.value;
    renderTodos();
  });

  DOM.filterPriority.addEventListener('change', (e) => {
    state.activePriorityFilter = e.target.value;
    renderTodos();
  });

  DOM.sortTasks.addEventListener('change', (e) => {
    state.activeSort = e.target.value;
    renderTodos();
  });

  // Collapsible Form
  DOM.formToggleHeader.addEventListener('click', () => {
    const isExpanded = DOM.taskFormContainer.classList.toggle('expanded');
    const toggleBtn = DOM.formToggleHeader.querySelector('.expand-btn');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Subtasks Builder
  DOM.addSubtaskBtn.addEventListener('click', addSubtaskToBuilderList);
  DOM.subtaskInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtaskToBuilderList();
    }
  });

  // Submit main form
  DOM.todoForm.addEventListener('submit', handleFormSubmit);

  // Clear Form
  DOM.clearFormBtn.addEventListener('click', resetForm);

  // Global Clear Completed
  DOM.clearCompletedBtn.addEventListener('click', async () => {
    const originalLength = state.todos.length;
    if (state.token) {
      await apiClearCompleted();
    } else {
      state.todos = state.todos.filter(t => !t.completed);
      if (state.todos.length !== originalLength) {
        saveToLocalStorage();
        renderApp();
      }
    }
  });

  // Backup Import & Export
  DOM.exportBackupBtn.addEventListener('click', exportJSONBackup);
  DOM.importBackupFile.addEventListener('change', importJSONBackup);

  // Auth Modal
  DOM.syncAccountBtn.addEventListener('click', () => {
    if (state.token) return; // already logged in, badge handles logout
    openAuthModal();
  });
  DOM.closeAuthModalBtn.addEventListener('click', closeAuthModal);
  DOM.authModal.addEventListener('click', (e) => {
    if (e.target === DOM.authModal) closeAuthModal();
  });

  // Modal Tabs
  DOM.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  DOM.tabRegister.addEventListener('click', () => switchAuthTab('register'));

  // Login Form
  DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = DOM.loginForm.querySelector('button[type="submit"]');
    btn.classList.add('btn-loading');
    DOM.loginError.classList.add('hidden');
    try {
      await loginUser(DOM.loginUsername.value.trim(), DOM.loginPassword.value);
      closeAuthModal();
    } catch (err) {
      DOM.loginError.textContent = err.message;
      DOM.loginError.classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  });

  // Register Form
  DOM.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = DOM.registerForm.querySelector('button[type="submit"]');
    btn.classList.add('btn-loading');
    DOM.regError.classList.add('hidden');
    try {
      await registerUser(DOM.regName.value.trim(), DOM.regUsername.value.trim(), DOM.regPassword.value);
      closeAuthModal();
    } catch (err) {
      DOM.regError.textContent = err.message;
      DOM.regError.classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  });

  // Logout
  DOM.logoutBtn.addEventListener('click', logoutUser);
}

// ==========================================================================
// Date, Time and Greeting Engine
// ==========================================================================
function updateHeaderDateTime() {
  const now = new Date();
  
  // Format Date (e.g. Monday, July 27, 2026)
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  DOM.currentDateText.textContent = now.toLocaleDateString('en-US', dateOptions);

  // Greeting based on hour
  const hour = now.getHours();
  let greeting = "Hello, Explorer";
  
  if (hour < 5) {
    greeting = "Hello, Night Owl";
  } else if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else if (hour < 22) {
    greeting = "Good evening";
  } else {
    greeting = "Time to wind down";
  }
  
  DOM.greetingText.textContent = `${greeting}, Creator`;
}

// ==========================================================================
// Subtask Builder Logic (Temp Subtask Chips on Form)
// ==========================================================================
function addSubtaskToBuilderList() {
  const text = DOM.subtaskInputField.value.trim();
  if (!text) return;

  state.builderSubtasks.push(text);
  DOM.subtaskInputField.value = '';
  DOM.subtaskInputField.focus();
  renderBuilderSubtasks();
}

function removeSubtaskFromBuilderList(index) {
  state.builderSubtasks.splice(index, 1);
  renderBuilderSubtasks();
}

function renderBuilderSubtasks() {
  DOM.builderSubtaskList.innerHTML = '';
  state.builderSubtasks.forEach((subtext, index) => {
    const li = document.createElement('li');
    li.className = 'subtask-chip';
    li.innerHTML = `
      <span>${escapeHTML(subtext)}</span>
      <button type="button" class="subtask-chip-remove" aria-label="Remove subtask" data-index="${index}">&times;</button>
    `;
    
    li.querySelector('.subtask-chip-remove').addEventListener('click', () => {
      removeSubtaskFromBuilderList(index);
    });
    
    DOM.builderSubtaskList.appendChild(li);
  });
}

// ==========================================================================
// Core CRUD Logic (Todo Adding & Editing Form Handlers)
// ==========================================================================
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = DOM.taskTitle.value.trim();
  const desc = DOM.taskDesc.value.trim();
  const category = DOM.taskCategory.value;
  const priority = DOM.taskPriority.value;
  const dueDate = DOM.taskDueDate.value;

  if (!title) return;

  if (state.editingTodoId) {
    // UPDATE MODE
    const todo = state.todos.find(t => t.id === state.editingTodoId);
    if (todo) {
      todo.title = title;
      todo.description = desc;
      todo.category = category;
      todo.priority = priority;
      todo.dueDate = dueDate;
      const oldSubtasks = todo.subtasks || [];
      todo.subtasks = state.builderSubtasks.map(text => {
        const matched = oldSubtasks.find(os => os.text === text);
        return {
          id: matched ? matched.id : 'sub-' + Math.random().toString(36).substr(2, 9),
          text,
          completed: matched ? matched.completed : false
        };
      });
      if (state.token) {
        await apiUpdateTask(todo);
      }
    }
    state.editingTodoId = null;
    DOM.submitBtn.textContent = "Create Task";
    DOM.taskFormContainer.querySelector('.form-header-title span').textContent = "Add New Task";
  } else {
    // CREATE MODE
    const newTodo = {
      id: 'todo-' + Math.random().toString(36).substr(2, 9),
      title,
      description: desc,
      category,
      priority,
      dueDate,
      createdDate: new Date().toISOString(),
      completed: false,
      subtasks: state.builderSubtasks.map(text => ({
        id: 'sub-' + Math.random().toString(36).substr(2, 9),
        text,
        completed: false
      }))
    };
    if (state.token) {
      const serverTask = await apiCreateTask(newTodo);
      if (serverTask) {
        // Use _id from server as canonical id
        newTodo.id = serverTask._id || newTodo.id;
        newTodo._id = serverTask._id;
      }
    }
    state.todos.unshift(newTodo);
  }

  saveToLocalStorage();
  resetForm();
  renderApp();
}

function resetForm() {
  DOM.todoForm.reset();
  state.builderSubtasks = [];
  renderBuilderSubtasks();
  state.editingTodoId = null;
  DOM.submitBtn.textContent = "Create Task";
  DOM.taskFormContainer.querySelector('.form-header-title span').textContent = "Add New Task";
}

function startEditTodo(id) {
  const todo = state.todos.find(t => t.id === id);
  if (!todo) return;

  // Scroll to form and expand
  DOM.taskFormContainer.classList.add('expanded');
  DOM.formToggleHeader.querySelector('.expand-btn').setAttribute('aria-expanded', 'true');
  
  // Fill inputs
  DOM.taskTitle.value = todo.title;
  DOM.taskDesc.value = todo.description;
  DOM.taskCategory.value = todo.category;
  DOM.taskPriority.value = todo.priority;
  DOM.taskDueDate.value = todo.dueDate;
  
  // Fill subtasks builder
  state.builderSubtasks = todo.subtasks.map(s => s.text);
  renderBuilderSubtasks();
  
  // Set UI in edit state
  state.editingTodoId = id;
  DOM.submitBtn.textContent = "Save Changes";
  DOM.taskFormContainer.querySelector('.form-header-title span').textContent = "Edit Task";
  
  DOM.taskTitle.focus();
}

function deleteTodo(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const doDelete = async () => {
    if (state.token) await apiDeleteTask(id);
    state.todos = state.todos.filter(t => t.id !== id);
    saveToLocalStorage();
    renderApp();
  };
  if (card) {
    card.style.transform = 'translateY(10px) scale(0.95)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.25s ease-out';
    setTimeout(doDelete, 250);
  } else {
    doDelete();
  }
}

async function toggleTodoCompletion(id) {
  const todo = state.todos.find(t => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  if (todo.completed && todo.subtasks) {
    todo.subtasks.forEach(sub => sub.completed = true);
    triggerConfettiBurst();
  }
  if (state.token) await apiUpdateTask(todo);
  saveToLocalStorage();
  renderApp();
}

async function toggleSubtaskCompletion(todoId, subtaskId) {
  const todo = state.todos.find(t => t.id === todoId);
  if (!todo) return;

  const subtask = todo.subtasks.find(s => s.id === subtaskId);
  if (!subtask) return;

  subtask.completed = !subtask.completed;

  const allSubtasksCompleted = todo.subtasks.every(s => s.completed);
  if (allSubtasksCompleted && !todo.completed) {
    todo.completed = true;
    triggerConfettiBurst();
  } else if (!allSubtasksCompleted && todo.completed) {
    todo.completed = false;
  }

  if (state.token) await apiUpdateTask(todo);
  saveToLocalStorage();
  renderApp();
}

// ==========================================================================
// Cloud API Functions
// ==========================================================================
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function registerUser(name, username, password) {
  const data = await apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, username, password })
  });
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('aura_token', data.token);
  localStorage.setItem('aura_user', JSON.stringify(data.user));
  // Migrate local guest tasks to server
  if (state.todos.length > 0) {
    for (const todo of state.todos) {
      try { await apiCreateTask(todo); } catch (e) {}
    }
  }
  await fetchTasksFromServer();
  updateAuthUI();
  renderApp();
}

async function loginUser(username, password) {
  const data = await apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('aura_token', data.token);
  localStorage.setItem('aura_user', JSON.stringify(data.user));
  await fetchTasksFromServer();
  updateAuthUI();
  renderApp();
}

function logoutUser() {
  state.token = null;
  state.user = null;
  state.todos = [];
  localStorage.removeItem('aura_token');
  localStorage.removeItem('aura_user');
  localStorage.removeItem('aura_todos');
  updateAuthUI();
  getSeedTodos();
  renderApp();
}

async function fetchTasksFromServer() {
  try {
    const tasks = await apiFetch('/tasks');
    // Normalise _id to id for consistency with local state
    state.todos = tasks.map(t => ({ ...t, id: t._id || t.id }));
    saveToLocalStorage();
  } catch (e) {
    console.error('Failed to fetch tasks from server:', e);
  }
}

async function apiCreateTask(todo) {
  try {
    return await apiFetch('/tasks', { method: 'POST', body: JSON.stringify(todo) });
  } catch (e) {
    console.error('Failed to create task on server:', e);
    return null;
  }
}

async function apiUpdateTask(todo) {
  const serverId = todo._id || todo.id;
  try {
    return await apiFetch(`/tasks/${serverId}`, { method: 'PUT', body: JSON.stringify(todo) });
  } catch (e) {
    console.error('Failed to update task on server:', e);
    return null;
  }
}

async function apiDeleteTask(id) {
  try {
    return await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('Failed to delete task on server:', e);
    return null;
  }
}

async function apiClearCompleted() {
  try {
    await apiFetch('/tasks/clear-completed', { method: 'POST' });
    await fetchTasksFromServer();
    renderApp();
  } catch (e) {
    console.error('Failed to clear completed tasks on server:', e);
  }
}

// ==========================================================================
// Auth UI Helpers
// ==========================================================================
function updateAuthUI() {
  if (state.user) {
    DOM.syncAccountBtn.classList.add('hidden');
    DOM.userBadge.classList.remove('hidden');
    const initials = state.user.name
      ? state.user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : state.user.username.slice(0, 2).toUpperCase();
    DOM.userInitials.textContent = initials;
    DOM.dropdownUsername.textContent = `@${state.user.username}`;
    DOM.greetingText.textContent = `Hello, ${state.user.name || state.user.username}`;
  } else {
    DOM.syncAccountBtn.classList.remove('hidden');
    DOM.userBadge.classList.add('hidden');
  }
}

function openAuthModal() {
  DOM.authModal.classList.remove('hidden');
  DOM.loginUsername.focus();
}

function closeAuthModal() {
  DOM.authModal.classList.add('hidden');
  DOM.loginForm.reset();
  DOM.registerForm.reset();
  DOM.loginError.classList.add('hidden');
  DOM.regError.classList.add('hidden');
}

function switchAuthTab(tab) {
  if (tab === 'login') {
    DOM.tabLogin.classList.add('active');
    DOM.tabRegister.classList.remove('active');
    DOM.loginForm.classList.remove('hidden');
    DOM.registerForm.classList.add('hidden');
  } else {
    DOM.tabRegister.classList.add('active');
    DOM.tabLogin.classList.remove('active');
    DOM.registerForm.classList.remove('hidden');
    DOM.loginForm.classList.add('hidden');
  }
}

// ==========================================================================
// Render Logic & Statistics Dashboard Calculations
// ==========================================================================
function renderApp() {
  renderStats();
  renderTodos();
}

function renderStats() {
  const total = state.todos.length;
  const completed = state.todos.filter(t => t.completed).length;
  
  DOM.statsTotal.textContent = total;
  DOM.statsCompleted.textContent = completed;
  
  // Completion Percent calculation
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  DOM.progressPercentage.textContent = `${percentage}%`;
  
  // Update circular SVG progress fill
  // Circumference = 2 * PI * r (r=50) -> ~314.159
  const circumference = 314.159;
  const offset = circumference - (percentage / 100) * circumference;
  DOM.progressBarCircle.style.strokeDashoffset = offset;

  // Categories Fill Calculation
  // 1. Work Stats
  const workTodos = state.todos.filter(t => t.category === 'Work');
  const workTotal = workTodos.length;
  const workCompleted = workTodos.filter(t => t.completed).length;
  const workPercent = workTotal === 0 ? 0 : Math.round((workCompleted / workTotal) * 100);
  DOM.catWorkPercent.textContent = `${workPercent}%`;
  DOM.catWorkFill.style.width = `${workPercent}%`;
  
  // 2. Personal Stats
  const personalTodos = state.todos.filter(t => t.category === 'Personal');
  const personalTotal = personalTodos.length;
  const personalCompleted = personalTodos.filter(t => t.completed).length;
  const personalPercent = personalTotal === 0 ? 0 : Math.round((personalCompleted / personalTotal) * 100);
  DOM.catPersonalPercent.textContent = `${personalPercent}%`;
  DOM.catPersonalFill.style.width = `${personalPercent}%`;
}

function renderTodos() {
  DOM.taskList.innerHTML = '';
  
  // Filter Tasks
  let filtered = state.todos.filter(todo => {
    // 1. Status Filter
    if (state.activeStatusFilter === 'active' && todo.completed) return false;
    if (state.activeStatusFilter === 'completed' && !todo.completed) return false;

    // 2. Category Filter
    if (state.activeCategoryFilter !== 'all' && todo.category !== state.activeCategoryFilter) return false;

    // 3. Priority Filter
    if (state.activePriorityFilter !== 'all' && todo.priority !== state.activePriorityFilter) return false;

    // 4. Search Query Filter
    if (state.searchQuery) {
      const matchTitle = todo.title.toLowerCase().includes(state.searchQuery);
      const matchDesc = todo.description.toLowerCase().includes(state.searchQuery);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  // Sort Tasks
  filtered.sort((a, b) => {
    if (state.activeSort === 'created-asc') {
      return new Date(a.createdDate) - new Date(b.createdDate);
    }
    if (state.activeSort === 'created-desc') {
      return new Date(b.createdDate) - new Date(a.createdDate);
    }
    if (state.activeSort === 'due-date') {
      // items with no due date go to the bottom
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (state.activeSort === 'priority-desc') {
      const pWeights = { high: 3, medium: 2, low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    return 0;
  });

  // Update Visible Counts
  DOM.visibleTasksCount.textContent = `${filtered.length} task${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    DOM.emptyState.style.display = 'flex';
  } else {
    DOM.emptyState.style.display = 'none';
  }

  // Draw Card Elements
  filtered.forEach(todo => {
    const card = buildTodoCard(todo);
    DOM.taskList.appendChild(card);
  });
}

function buildTodoCard(todo) {
  const card = document.createElement('div');
  card.className = `dashboard-card task-card priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;
  card.setAttribute('data-id', todo.id);

  // Check Overdue status
  let isOverdue = false;
  let formattedDate = '';
  if (todo.dueDate) {
    const dDate = new Date(todo.dueDate + 'T23:59:59'); // treat as local end-of-day
    const now = new Date();
    now.setHours(0, 0, 0, 0); // clear times
    
    // Check if due date is before today and todo is not completed
    isOverdue = dDate < now && !todo.completed;
    
    // Format to short readable string
    formattedDate = new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Subtasks Completion Metrics
  const totalSub = todo.subtasks ? todo.subtasks.length : 0;
  const compSub = todo.subtasks ? todo.subtasks.filter(s => s.completed).length : 0;

  // Build HTML Content
  let subtasksHTML = '';
  if (totalSub > 0) {
    const itemsHTML = todo.subtasks.map(sub => `
      <div class="card-subtask-item ${sub.completed ? 'completed' : ''}" data-sub-id="${sub.id}">
        <label class="checkbox-container">
          <input type="checkbox" ${sub.completed ? 'checked' : ''}>
          <span class="checkmark">
            ${ICONS.check}
          </span>
        </label>
        <span class="subtask-text">${escapeHTML(sub.text)}</span>
      </div>
    `).join('');

    subtasksHTML = `
      <div class="task-subtasks-panel">
        <div class="subtask-list-title">Subtasks (${compSub}/${totalSub})</div>
        ${itemsHTML}
      </div>
    `;
  }

  card.innerHTML = `
    <div class="task-main-row">
      <!-- Complete Checkbox -->
      <label class="checkbox-container">
        <input type="checkbox" class="todo-main-check" ${todo.completed ? 'checked' : ''}>
        <span class="checkmark">
          ${ICONS.check}
        </span>
      </label>

      <!-- Text Block -->
      <div class="task-content-block">
        <div class="task-card-title-row">
          <span class="task-title-text">${escapeHTML(todo.title)}</span>
        </div>
        
        ${todo.description ? `<p class="task-desc-text">${escapeHTML(todo.description)}</p>` : ''}
        
        <!-- Metadata -->
        <div class="task-meta-row">
          <span class="meta-badge category">${escapeHTML(todo.category)}</span>
          <span class="meta-badge priority-${todo.priority}">
            ${todo.priority === 'high' ? '🔥 High' : todo.priority === 'medium' ? '⚡ Medium' : '🌱 Low'}
          </span>
          ${todo.dueDate ? `
            <span class="meta-date ${isOverdue ? 'overdue' : ''}">
              ${ICONS.calendar}
              <span>${isOverdue ? 'Overdue: ' : ''}${formattedDate}</span>
            </span>
          ` : ''}
          ${totalSub > 0 ? `
            <span class="meta-date">
              ${ICONS.subtasks}
              <span>${compSub}/${totalSub}</span>
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="task-actions">
        <button class="action-icon-btn edit-btn" title="Edit Task" aria-label="Edit Task">
          ${ICONS.edit}
        </button>
        <button class="action-icon-btn delete-btn" title="Delete Task" aria-label="Delete Task">
          ${ICONS.trash}
        </button>
      </div>
    </div>
    ${subtasksHTML}
  `;

  // --- Attach Action Event Listeners ---
  
  // Toggling main task
  card.querySelector('.todo-main-check').addEventListener('change', () => {
    toggleTodoCompletion(todo.id);
  });

  // Delete task
  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  });

  // Edit task
  card.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    startEditTodo(todo.id);
  });

  // Subtask Toggles
  if (totalSub > 0) {
    card.querySelectorAll('.card-subtask-item').forEach(subItem => {
      const subtaskId = subItem.getAttribute('data-sub-id');
      subItem.querySelector('input[type="checkbox"]').addEventListener('change', () => {
        toggleSubtaskCompletion(todo.id, subtaskId);
      });
    });
  }

  return card;
}

// ==========================================================================
// Backup System: Export and Import handlers
// ==========================================================================
function exportJSONBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.todos, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `aura_todo_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function importJSONBackup(e) {
  const fileReader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  fileReader.onload = (event) => {
    try {
      const parsedData = JSON.parse(event.target.result);
      
      // Basic schema verification
      if (Array.isArray(parsedData)) {
        // Merge or replace? Let's prompt or merge them by default (or replace if they confirm).
        // Since we are pure vanilla, let's merge unique IDs or just prompt confirmation to overwrite.
        const overwrite = confirm("Do you want to overwrite your current tasks with the backup? (Cancel will merge instead)");
        
        if (overwrite) {
          state.todos = parsedData;
        } else {
          // Merge items, filtering duplicates by ID
          parsedData.forEach(newTodo => {
            if (!state.todos.some(t => t.id === newTodo.id)) {
              state.todos.push(newTodo);
            }
          });
        }
        
        saveToLocalStorage();
        renderApp();
        alert("Backup imported successfully!");
      } else {
        alert("Invalid file format: Backup file must be a JSON array of tasks.");
      }
    } catch (err) {
      alert("Failed to read JSON backup file. Make sure it's valid.");
      console.error(err);
    }
    // Clear value to allow re-uploading same file
    DOM.importBackupFile.value = '';
  };
  fileReader.readAsText(file);
}

// ==========================================================================
// Canvas Particle Confetti Physics Engine
// ==========================================================================
let confettiParticles = [];
let confettiCtx = null;
let confettiAnimationId = null;

function initConfetti() {
  const canvas = DOM.confettiCanvas;
  confettiCtx = canvas.getContext('2d');
  
  // Resize handler
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

class ConfettiParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    
    // Physical attributes
    this.size = Math.random() * 8 + 4;
    this.speedX = Math.random() * 10 - 5; // horizontal spread
    this.speedY = Math.random() * -12 - 5; // initial upward velocity
    this.gravity = 0.3;
    this.friction = 0.98;
    this.opacity = 1.0;
    this.decay = Math.random() * 0.015 + 0.01;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
  }

  update() {
    this.speedX *= this.friction;
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    
    // Draw rectangles (traditional confetti style)
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function triggerConfettiBurst() {
  const colors = [
    '#a78bfa', '#8b5cf6', '#6d28d9', // Violet shades
    '#34d399', '#10b981', '#047857', // Emerald shades
    '#fbbf24', '#f59e0b', '#d97706', // Amber shades
    '#fb7185', '#f43f5e', '#be123c', // Rose shades
    '#60a5fa', '#3b82f6', '#1d4ed8'  // Blue shades
  ];

  // Pick origin point: left side and right side for double burst
  const canvas = DOM.confettiCanvas;
  
  // Left burst
  for (let i = 0; i < 50; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const p = new ConfettiParticle(canvas.width * 0.1, canvas.height * 0.8, color);
    // adjust velocity to spray rightwards
    p.speedX = Math.random() * 12 + 4;
    p.speedY = Math.random() * -18 - 8;
    confettiParticles.push(p);
  }

  // Right burst
  for (let i = 0; i < 50; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const p = new ConfettiParticle(canvas.width * 0.9, canvas.height * 0.8, color);
    // adjust velocity to spray leftwards
    p.speedX = Math.random() * -12 - 4;
    p.speedY = Math.random() * -18 - 8;
    confettiParticles.push(p);
  }

  // Start loop if not already running
  if (!confettiAnimationId) {
    animateConfetti();
  }
}

function animateConfetti() {
  const canvas = DOM.confettiCanvas;
  const ctx = confettiCtx;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.update();
    p.draw(ctx);

    // Remove if faded out or off screen
    if (p.opacity <= 0 || p.y > canvas.height) {
      confettiParticles.splice(i, 1);
    }
  }

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimationId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear final remnants
  }
}

// ==========================================================================
// Helper Utility: Prevent HTML XSS Injections
// ==========================================================================
function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
