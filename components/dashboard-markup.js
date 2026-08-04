// This file holds the exact same dashboard markup from the original
// static index.html, unchanged. It is injected as raw HTML so the
// dashboard behaves pixel-for-pixel identical to before login was added.
export const DASHBOARD_HTML = `
<div class="app-shell">

  <!-- ============ DESKTOP SIDEBAR ============ -->
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">W</div>
      <div class="brand-text">
        <div class="brand-title">Williamson Group</div>
        <div class="brand-sub">Command Dashboard</div>
      </div>
    </div>

    <nav class="nav">
      <button class="nav-item active" data-target="panel-today">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        Today
      </button>
      <button class="nav-item" data-target="panel-pipeline">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
        Pipeline
      </button>
      <button class="nav-item" data-target="panel-metric">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>
        My Number
      </button>
      <button class="nav-item" data-target="panel-notes">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></svg>
        Notes
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="save-indicator">
        <span class="save-dot" id="saveDot"></span>
        <span id="saveText">All changes saved on this device</span>
      </div>
    </div>
  </aside>

  <!-- ============ MOBILE TOP NAV ============ -->
  <div class="mobile-topnav">
    <div class="brand-mark" style="width:28px;height:28px;font-size:13px;">W</div>
    <button class="mobile-nav-item active" data-target="panel-today">Today</button>
    <button class="mobile-nav-item" data-target="panel-pipeline">Pipeline</button>
    <button class="mobile-nav-item" data-target="panel-metric">My Number</button>
    <button class="mobile-nav-item" data-target="panel-notes">Notes</button>
  </div>

  <!-- ============ MAIN CONTENT ============ -->
  <main class="main">
    <div class="topbar">
      <h1 id="greeting">Today's Operating Picture</h1>
      <div class="date" id="todayDate"></div>
    </div>

    <div class="grid">

      <!-- TODAY -->
      <section class="panel span-2" id="panel-today">
        <div class="panel-head">
          <h2><span class="panel-eyebrow">01</span>&nbsp; Today</h2>
        </div>
        <div class="hairline"></div>

        <div class="today-grid">
          <div>
            <p class="subhead">Schedule</p>
            <ul class="schedule-list" id="scheduleList"></ul>
            <button class="add-row-btn" id="addScheduleBtn">+ Add time block</button>
          </div>

          <div>
            <p class="subhead">Top 3 Tasks</p>
            <ul class="task-list" id="taskList"></ul>
          </div>
        </div>
      </section>

      <!-- MY NUMBER -->
      <section class="panel metric-panel" id="panel-metric">
        <div class="panel-head" style="width:100%;">
          <h2><span class="panel-eyebrow">02</span>&nbsp; My Number</h2>
        </div>
        <div class="hairline"></div>

        <input type="text" class="metric-label-input" id="metricLabel" value="Deals This Month">
        <div class="metric-number" id="metricValue">0</div>
        <div class="metric-ticks" id="metricTicks"></div>

        <div class="metric-controls">
          <button class="metric-btn minus" id="metricMinus">−</button>
          <button class="metric-btn" id="metricPlus">+</button>
        </div>

        <button class="metric-reset" id="metricReset">Reset to zero</button>
      </section>

      <!-- PIPELINE -->
      <section class="panel span-2" id="panel-pipeline">
        <div class="panel-head">
          <h2><span class="panel-eyebrow">03</span>&nbsp; Pipeline</h2>
          <div class="stage-tabs" id="stageTabs">
            <button class="stage-tab active" data-stage="All">All</button>
            <button class="stage-tab" data-stage="New">New</button>
            <button class="stage-tab" data-stage="Active">Active</button>
            <button class="stage-tab" data-stage="Under Contract">Under Contract</button>
            <button class="stage-tab" data-stage="Closed">Closed</button>
          </div>
        </div>
        <div class="hairline"></div>

        <div class="pipeline-table-wrap">
          <table class="pipeline-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Stage</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="pipelineBody"></tbody>
          </table>
        </div>
        <div class="empty-state" id="pipelineEmpty" style="display:none;">No clients in this stage yet.</div>
        <button class="add-row-btn" id="addClientBtn">+ Add client</button>
      </section>

      <!-- NOTES -->
      <section class="panel span-2" id="panel-notes">
        <div class="panel-head">
          <h2><span class="panel-eyebrow">04</span>&nbsp; Notes</h2>
        </div>
        <div class="hairline"></div>
        <textarea class="notes-textarea" id="notesArea" placeholder="Scratchpad — call notes, ideas, reminders..."></textarea>
        <div class="notes-status" id="notesStatus">Saved</div>
      </section>

    </div>
  </main>
</div>
`;
