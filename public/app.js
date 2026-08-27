/* ===========================================================
   WGRE Command Dashboard
   Plain JS, no build step. All data saved to this browser's
   localStorage, so it persists on refresh (per device).
   =========================================================== */

const STORAGE_KEYS = {
  schedule: 'wgre.today.schedule',
  tasks: 'wgre.today.tasks',
  activeTaskCategory: 'wgre.today.activeTaskCategory',
  pipeline: 'wgre.pipeline',
  metric: 'wgre.metric',
  notes: 'wgre.notes',
};

const STAGES = ['New', 'Active', 'Under Contract', 'Closed'];

/* Task list categories — edit this array to rename or reorder tabs.
   Each category always holds exactly TASKS_PER_CATEGORY slots. */
const TASK_CATEGORIES = ['WGRE', 'LLUV', 'Mission', 'Personal', 'MISC'];
const TASKS_PER_CATEGORY = 10;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    flashSaved();
  } catch (e) {
    console.error('Could not save', key, e);
  }
}

/* ---------- Save indicator ---------- */
let saveTimeout;
function flashSaved() {
  const dot = document.getElementById('saveDot');
  const text = document.getElementById('saveText');
  if (!dot || !text) return;
  dot.style.opacity = '1';
  text.textContent = 'Saving…';
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    text.textContent = 'All changes saved on this device';
    dot.style.opacity = '0.4';
  }, 500);
}

/* ---------- Tasks: load + migrate ---------- */
function emptyTaskSlots() {
  const slots = [];
  for (let i = 0; i < TASKS_PER_CATEGORY; i++) {
    slots.push({ id: uid(), text: '', done: false });
  }
  return slots;
}

function loadTasksByCategory() {
  const raw = load(STORAGE_KEYS.tasks, null);

  // Brand new install: empty slots for every category.
  if (!raw) {
    const fresh = {};
    TASK_CATEGORIES.forEach(cat => { fresh[cat] = emptyTaskSlots(); });
    return fresh;
  }

  // Old format was a flat array of (originally 3) tasks with no
  // categories. Migrate that into the first category (WGRE) so nothing
  // typed before this update gets lost, and pad/trim to 10 slots.
  if (Array.isArray(raw)) {
    const migrated = {};
    TASK_CATEGORIES.forEach(cat => { migrated[cat] = emptyTaskSlots(); });
    const old = raw.slice(0, TASKS_PER_CATEGORY);
    old.forEach((task, i) => {
      migrated[TASK_CATEGORIES[0]][i] = {
        id: task.id || uid(),
        text: task.text || '',
        done: !!task.done,
      };
    });
    return migrated;
  }

  // Already in the new per-category format — just make sure every
  // current category exists and has exactly TASKS_PER_CATEGORY slots
  // (handles someone editing TASK_CATEGORIES later).
  const result = {};
  TASK_CATEGORIES.forEach(cat => {
    const existing = Array.isArray(raw[cat]) ? raw[cat] : [];
    const slots = existing.slice(0, TASKS_PER_CATEGORY).map(t => ({
      id: t.id || uid(),
      text: t.text || '',
      done: !!t.done,
    }));
    while (slots.length < TASKS_PER_CATEGORY) {
      slots.push({ id: uid(), text: '', done: false });
    }
    result[cat] = slots;
  });
  return result;
}

/* ===========================================================
   State
   =========================================================== */
let state = {
  schedule: load(STORAGE_KEYS.schedule, [
    { id: uid(), time: '8:00 AM', text: 'Lead gen block' },
    { id: uid(), time: '1:00 PM', text: 'Listing appointment' },
  ]),
  tasks: loadTasksByCategory(),
  pipeline: load(STORAGE_KEYS.pipeline, [
    { id: uid(), name: 'Sample Client', stage: 'New', notes: 'Edit or delete this row' },
  ]),
  metric: load(STORAGE_KEYS.metric, { label: 'Deals This Month', value: 0 }),
  notes: load(STORAGE_KEYS.notes, ''),
};

let activeStageFilter = 'All';

let activeTaskCategory = load(STORAGE_KEYS.activeTaskCategory, TASK_CATEGORIES[0]);
if (!TASK_CATEGORIES.includes(activeTaskCategory)) {
  activeTaskCategory = TASK_CATEGORIES[0];
}

/* ===========================================================
   Header: greeting + date
   =========================================================== */
function renderHeader() {
  const now = new Date();
  const hour = now.getHours();
  const greetingWord = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  document.getElementById('greeting').textContent = `${greetingWord} Operating Picture`;
  document.getElementById('todayDate').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

/* ===========================================================
   Schedule
   =========================================================== */
function renderSchedule() {
  const list = document.getElementById('scheduleList');
  list.innerHTML = '';
  state.schedule.forEach(item => {
    const li = document.createElement('li');
    li.className = 'schedule-row';
    li.innerHTML = `
      <input class="schedule-time" value="${escapeAttr(item.time)}" placeholder="Time" />
      <input class="schedule-text" value="${escapeAttr(item.text)}" placeholder="What's happening" />
      <button class="icon-btn" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
      </button>
    `;
    const [timeInput, textInput] = li.querySelectorAll('input');
    timeInput.addEventListener('input', () => {
      item.time = timeInput.value;
      save(STORAGE_KEYS.schedule, state.schedule);
    });
    textInput.addEventListener('input', () => {
      item.text = textInput.value;
      save(STORAGE_KEYS.schedule, state.schedule);
    });
    li.querySelector('.icon-btn').addEventListener('click', () => {
      state.schedule = state.schedule.filter(s => s.id !== item.id);
      save(STORAGE_KEYS.schedule, state.schedule);
      renderSchedule();
    });
    list.appendChild(li);
  });
}

document.getElementById('addScheduleBtn').addEventListener('click', () => {
  state.schedule.push({ id: uid(), time: '', text: '' });
  save(STORAGE_KEYS.schedule, state.schedule);
  renderSchedule();
});

/* ===========================================================
   Tasks (tabbed lists, 10 slots per category)
   =========================================================== */
function renderTaskTabs() {
  const tabs = document.getElementById('taskTabs');
  tabs.innerHTML = '';
  TASK_CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'task-tab' + (cat === activeTaskCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeTaskCategory = cat;
      save(STORAGE_KEYS.activeTaskCategory, activeTaskCategory);
      renderTaskTabs();
      renderTasks();
    });
    tabs.appendChild(btn);
  });
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const tasks = state.tasks[activeTaskCategory];

  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = 'task-row' + (task.done ? ' done' : '');
    li.innerHTML = `
      <span class="task-num">${i + 1}</span>
      <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''} />
      <input class="task-text" value="${escapeAttr(task.text)}" placeholder="Task ${i + 1}..." />
    `;
    const checkbox = li.querySelector('.task-check');
    const textInput = li.querySelector('.task-text');
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      save(STORAGE_KEYS.tasks, state.tasks);
      renderTasks();
    });
    textInput.addEventListener('input', () => {
      task.text = textInput.value;
      save(STORAGE_KEYS.tasks, state.tasks);
    });
    list.appendChild(li);
  });
}

/* ===========================================================
   My Number (metric)
   =========================================================== */
function renderMetric() {
  document.getElementById('metricLabel').value = state.metric.label;
  document.getElementById('metricValue').textContent = state.metric.value;

  const ticksEl = document.getElementById('metricTicks');
  ticksEl.innerHTML = '';
  const tickCount = Math.min(state.metric.value, 40);
  for (let i = 0; i < tickCount; i++) {
    const t = document.createElement('span');
    t.className = 'tick';
    ticksEl.appendChild(t);
  }
}

document.getElementById('metricLabel').addEventListener('input', (e) => {
  state.metric.label = e.target.value;
  save(STORAGE_KEYS.metric, state.metric);
});

document.getElementById('metricPlus').addEventListener('click', () => {
  state.metric.value += 1;
  save(STORAGE_KEYS.metric, state.metric);
  renderMetric();
});

document.getElementById('metricMinus').addEventListener('click', () => {
  state.metric.value = Math.max(0, state.metric.value - 1);
  save(STORAGE_KEYS.metric, state.metric);
  renderMetric();
});

document.getElementById('metricReset').addEventListener('click', () => {
  if (!confirm('Reset "' + state.metric.label + '" back to zero?')) return;
  state.metric.value = 0;
  save(STORAGE_KEYS.metric, state.metric);
  renderMetric();
});

/* ===========================================================
   Pipeline
   =========================================================== */
function stageClass(stage) {
  return 'stage-' + stage.replace(/ /g, '_');
}

function renderPipeline() {
  const body = document.getElementById('pipelineBody');
  const emptyEl = document.getElementById('pipelineEmpty');
  body.innerHTML = '';

  const rows = state.pipeline.filter(c => activeStageFilter === 'All' || c.stage === activeStageFilter);

  if (rows.length === 0) {
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
  }

  rows.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="client-name-input" value="${escapeAttr(client.name)}" placeholder="Client name" /></td>
      <td>
        <select class="stage-select ${stageClass(client.stage)}">
          ${STAGES.map(s => `<option value="${s}" ${s === client.stage ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><input class="client-notes-input" value="${escapeAttr(client.notes)}" placeholder="Notes..." /></td>
      <td>
        <button class="icon-btn" title="Remove client">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      </td>
    `;

    tr.querySelector('.client-name-input').addEventListener('input', (e) => {
      client.name = e.target.value;
      save(STORAGE_KEYS.pipeline, state.pipeline);
    });
    tr.querySelector('.client-notes-input').addEventListener('input', (e) => {
      client.notes = e.target.value;
      save(STORAGE_KEYS.pipeline, state.pipeline);
    });
    const select = tr.querySelector('.stage-select');
    select.addEventListener('change', (e) => {
      client.stage = e.target.value;
      select.className = 'stage-select ' + stageClass(client.stage);
      save(STORAGE_KEYS.pipeline, state.pipeline);
      renderPipeline();
    });
    tr.querySelector('.icon-btn').addEventListener('click', () => {
      state.pipeline = state.pipeline.filter(c => c.id !== client.id);
      save(STORAGE_KEYS.pipeline, state.pipeline);
      renderPipeline();
    });

    body.appendChild(tr);
  });
}

document.getElementById('addClientBtn').addEventListener('click', () => {
  state.pipeline.unshift({ id: uid(), name: '', stage: 'New', notes: '' });
  save(STORAGE_KEYS.pipeline, state.pipeline);
  renderPipeline();
});

document.getElementById('stageTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.stage-tab');
  if (!btn) return;
  activeStageFilter = btn.dataset.stage;
  document.querySelectorAll('.stage-tab').forEach(b => b.classList.toggle('active', b === btn));
  renderPipeline();
});

/* ===========================================================
   Notes
   =========================================================== */
const notesArea = document.getElementById('notesArea');
notesArea.value = state.notes;
let notesDebounce;
notesArea.addEventListener('input', () => {
  document.getElementById('notesStatus').textContent = 'Saving…';
  clearTimeout(notesDebounce);
  notesDebounce = setTimeout(() => {
    state.notes = notesArea.value;
    save(STORAGE_KEYS.notes, state.notes);
    document.getElementById('notesStatus').textContent = 'Saved';
  }, 400);
});

/* ===========================================================
   Navigation (desktop sidebar + mobile top bar)
   =========================================================== */
function goToPanel(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.target === targetId);
  });
}

document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(btn => {
  btn.addEventListener('click', () => goToPanel(btn.dataset.target));
});

/* Keep nav highlight in sync while scrolling */
const sections = ['panel-today', 'panel-metric', 'panel-pipeline', 'panel-notes']
  .map(id => document.getElementById(id))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.target === entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(s => observer.observe(s));

/* ===========================================================
   Utility
   =========================================================== */
function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ===========================================================
   Init
   =========================================================== */
renderHeader();
renderSchedule();
renderTaskTabs();
renderTasks();
renderMetric();
renderPipeline();
