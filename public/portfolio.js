/* =========================================
   PORTFOLIO.JS — SQL Engine + UI Logic
   ========================================= */

'use strict';

// ── DATABASE ──────────────────────────────────────────────────────
const DB = {
  profile: {
    columns: ['id', 'full_name', 'title', 'company', 'location', 'field', 'monthly_users', 'experience_years', 'summary'],
    rows: [
      {
        id: 1,
        full_name: 'Antoine Vacossin',
        title: 'Deputy Team Leader',
        company: 'OMEGA365 France',
        location: 'Pau, France',
        field: 'EDMS',
        monthly_users: 7000,
        experience_years: 3,
        summary: 'Computer Engineer, Deputy Team Leader at OMEGA365 France. Managing EDMS software used by 7000+ monthly users. T-SQL optimization specialist.'
      }
    ]
  },

  experience: {
    columns: ['id', 'role', 'company', 'type', 'start_date', 'end_date', 'location', 'description'],
    rows: [
      {
        id: 1,
        role: 'Deputy Team Leader',
        company: 'OMEGA365 France',
        type: 'Full-time',
        start_date: '2024-01-01',
        end_date: null,
        location: 'Pau, France',
        description: 'Manage client ticket lifecycle (bugs, support, features). T-SQL optimization, DB architecture, team leadership.'
      },
      {
        id: 2,
        role: 'Junior Software Engineer',
        company: 'OMEGA365 France',
        type: 'Full-time',
        start_date: '2023-09-01',
        end_date: '2024-01-01',
        location: 'France',
        description: 'EDMS development, SQL optimization, database architecture. Joined as first industry role.'
      },
      {
        id: 3,
        role: 'Research Intern',
        company: 'HUTECH University',
        type: 'Internship',
        start_date: '2023-06-01',
        end_date: '2023-08-31',
        location: 'Ho Chi Minh City, Vietnam',
        description: 'Blockchain research and Green Hydrogen Technology (GHT). International research environment.'
      }
    ]
  },

  education: {
    columns: ['id', 'institution', 'degree', 'field', 'start_year', 'end_year'],
    rows: [
      {
        id: 1,
        institution: 'CYTech',
        degree: 'Engineering Degree',
        field: 'Computer Engineering',
        start_year: 2019,
        end_year: 2024
      }
    ]
  },

  skills: {
    columns: ['id', 'name', 'category', 'level', 'years'],
    rows: [
      { id: 1,  name: 'T-SQL',            category: 'database',   level: 'Expert',       years: 3 },
      { id: 2,  name: 'SQL Optimization', category: 'database',   level: 'Expert',       years: 3 },
      { id: 3,  name: 'SQL Server',       category: 'database',   level: 'Expert',       years: 3 },
      { id: 4,  name: 'DB Architecture',  category: 'database',   level: 'Advanced',     years: 3 },
      { id: 5,  name: 'JavaScript',       category: 'frontend',   level: 'Advanced',     years: 3 },
      { id: 6,  name: 'C#',               category: 'backend',    level: 'Advanced',     years: 3 },
      { id: 7,  name: 'EDMS',             category: 'domain',     level: 'Expert',       years: 3 },
      { id: 8,  name: 'Team Leadership',  category: 'soft',       level: 'Advanced',     years: 2 },
      { id: 9,  name: 'Ticket Mgmt',      category: 'soft',       level: 'Expert',       years: 3 },
      { id: 10, name: 'Blockchain',        category: 'research',   level: 'Intermediate', years: 1 },
      { id: 11, name: 'HTML/CSS',          category: 'frontend',   level: 'Advanced',     years: 3 }
    ]
  },

  languages: {
    columns: ['id', 'language', 'proficiency', 'native'],
    rows: [
      { id: 1, language: 'French',  proficiency: 'Native',        native: 'YES' },
      { id: 2, language: 'English', proficiency: 'Fluent',        native: 'NO'  },
      { id: 3, language: 'Chinese', proficiency: 'Intermediate+', native: 'NO'  }
    ]
  },

  contact: {
    columns: ['id', 'type', 'value'],
    rows: [
      { id: 1, type: 'email',    value: 'vacossin.antoine@gmail.com' },
      { id: 2, type: 'linkedin', value: 'linkedin.com/in/antvacossin' },
      { id: 3, type: 'github',   value: 'github.com/pasteqk' }
    ]
  }
};

// ── SQL ENGINE ────────────────────────────────────────────────────
class SQLEngine {
  constructor(db) { this.db = db; }

  run(raw) {
    const sql = raw.trim();
    if (!sql || sql === ';') return null;

    const upper = sql.toUpperCase().replace(/;$/, '').trim();

    if (upper === 'HELP')       return this._help();
    if (upper === 'SHOW TABLES') return this._showTables();
    if (upper === 'CLEAR')      return { type: 'clear' };

    const descMatch = upper.match(/^(?:DESC|DESCRIBE)\s+(\w+)/);
    if (descMatch) return this._describe(descMatch[1].toLowerCase());

    if (upper.startsWith('SELECT')) return this._select(sql);

    return { type: 'error', message: `ERROR 1064: You have an error in your SQL syntax near '${sql.split(' ')[0]}'.\nType HELP for available commands.` };
  }

  _help() {
    return {
      type: 'text',
      content: `
Available commands:
  SHOW TABLES                          — list all tables
  DESC <table>                         — show table schema
  SELECT * FROM <table>                — all rows
  SELECT col1, col2 FROM <table>       — specific columns
  SELECT * FROM <table> WHERE col = 'value'
  SELECT * FROM <table> WHERE col LIKE '%value%'
  SELECT * FROM <table> ORDER BY col [ASC|DESC]
  SELECT * FROM <table> LIMIT n
  CLEAR                                — clear terminal

Tables: ${Object.keys(this.db).join(', ')}
`.trim()
    };
  }

  _showTables() {
    const tables = Object.keys(this.db);
    return {
      type: 'table',
      columns: ['Tables_in_portfolio'],
      rows: tables.map(t => ({ Tables_in_portfolio: t })),
      time: this._randTime()
    };
  }

  _describe(tableName) {
    const table = this.db[tableName];
    if (!table) return { type: 'error', message: `ERROR 1146: Table '${tableName}' doesn't exist.` };

    const sample = table.rows[0] || {};
    const rows = table.columns.map(col => ({
      Field: col,
      Type: typeof sample[col] === 'number' ? 'int' : 'varchar(255)',
      Null: col === 'id' ? 'NO' : 'YES',
      Key: col === 'id' ? 'PRI' : ''
    }));

    return { type: 'table', columns: ['Field', 'Type', 'Null', 'Key'], rows, time: this._randTime() };
  }

  _select(sql) {
    // Parse: SELECT [cols] FROM [table] [WHERE ...] [ORDER BY ...] [LIMIT n]
    const match = sql.replace(/;$/, '').match(
      /SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+([\s\S]+?))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i
    );

    if (!match) return { type: 'error', message: "ERROR 1064: Syntax error in SELECT statement." };

    const [, colsPart, tableName, wherePart, orderCol, orderDir, limitStr] = match;
    const table = this.db[tableName.toLowerCase()];

    if (!table) return { type: 'error', message: `ERROR 1146: Table '${tableName}' doesn't exist.\nAvailable tables: ${Object.keys(this.db).join(', ')}` };

    let rows = [...table.rows];

    // WHERE
    if (wherePart) {
      rows = this._applyWhere(rows, wherePart.trim());
      if (rows && rows.error) return { type: 'error', message: rows.error };
    }

    // ORDER BY
    if (orderCol) {
      const col = orderCol.toLowerCase();
      const dir = (orderDir || 'ASC').toUpperCase();
      rows.sort((a, b) => {
        const va = a[col] ?? '';
        const vb = b[col] ?? '';
        if (va < vb) return dir === 'ASC' ? -1 : 1;
        if (va > vb) return dir === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    // LIMIT
    if (limitStr) rows = rows.slice(0, parseInt(limitStr, 10));

    // Columns projection
    let cols;
    if (colsPart.trim() === '*') {
      cols = table.columns;
    } else {
      cols = colsPart.split(',').map(c => c.trim());
      const invalid = cols.filter(c => !table.columns.includes(c));
      if (invalid.length) return { type: 'error', message: `ERROR 1054: Unknown column(s): ${invalid.join(', ')}` };
    }

    const projected = rows.map(r => {
      const out = {};
      cols.forEach(c => { out[c] = r[c]; });
      return out;
    });

    return { type: 'table', columns: cols, rows: projected, time: this._randTime() };
  }

  _applyWhere(rows, wherePart) {
    // Support: col = 'val', col = val, col LIKE '%val%', col != 'val', col > val, col < val
    const likeMatch = wherePart.match(/^(\w+)\s+LIKE\s+'([^']*)'/i);
    if (likeMatch) {
      const col = likeMatch[1].toLowerCase();
      const pattern = likeMatch[2].replace(/%/g, '.*').replace(/_/g, '.');
      const re = new RegExp('^' + pattern + '$', 'i');
      return rows.filter(r => r[col] !== undefined && re.test(String(r[col])));
    }

    const opMatch = wherePart.match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*(?:'([^']*)'|(\S+))/i);
    if (opMatch) {
      const col = opMatch[1].toLowerCase();
      const op  = opMatch[2];
      const val = opMatch[3] !== undefined ? opMatch[3] : opMatch[4];

      return rows.filter(r => {
        if (r[col] === undefined) return false;
        const rv = String(r[col]).toLowerCase();
        const fv = val.toLowerCase();
        const rnum = parseFloat(r[col]);
        const fnum = parseFloat(val);
        switch (op) {
          case '=':  return rv === fv;
          case '!=': case '<>': return rv !== fv;
          case '>':  return rnum > fnum;
          case '<':  return rnum < fnum;
          case '>=': return rnum >= fnum;
          case '<=': return rnum <= fnum;
        }
      });
    }

    // true/false/null shortcuts
    const simpleMatch = wherePart.match(/^(\w+)\s*=\s*(true|false|null|NULL)/i);
    if (simpleMatch) {
      const col = simpleMatch[1].toLowerCase();
      const val = simpleMatch[2].toLowerCase();
      return rows.filter(r => {
        if (val === 'null') return r[col] === null || r[col] === undefined;
        if (val === 'true') return r[col] === true || r[col] === 1;
        if (val === 'false') return r[col] === false || r[col] === 0;
      });
    }

    return { error: `ERROR 1064: Cannot parse WHERE clause: ${wherePart}` };
  }

  _randTime() {
    return (Math.random() * 0.003 + 0.001).toFixed(3);
  }
}

// ── TERMINAL UI ───────────────────────────────────────────────────
const engine = new SQLEngine(DB);
let cmdHistory = [];
let historyIdx = -1;

const WELCOME = `\
╔══════════════════════════════════════════════════════════╗
║          PORTFOLIO DATABASE  v1.0.0                      ║
║    Deputy Team Leader  ·  OMEGA365 France                ║
╚══════════════════════════════════════════════════════════╝

Type  HELP          to see available commands
Type  SHOW TABLES   to list all data tables
Type  SELECT * FROM profile   to start exploring

Tip: use the quick-query chips below ↓
`;

function initTerminal() {
  const output = document.getElementById('terminalOutput');
  if (!output) return;

  // Welcome banner
  const banner = document.createElement('div');
  banner.className = 'welcome-banner';
  banner.textContent = WELCOME;
  output.appendChild(banner);

  // Input listeners
  const input = document.getElementById('sqlInput');
  const body  = document.getElementById('terminalBody');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const sql = input.value.trim();
      if (sql) {
        cmdHistory.unshift(sql);
        historyIdx = -1;
        execSQL(sql);
        input.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < cmdHistory.length - 1) {
        historyIdx++;
        input.value = cmdHistory[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        input.value = cmdHistory[historyIdx];
      } else {
        historyIdx = -1;
        input.value = '';
      }
    }
  });

  // Click anywhere in terminal to focus input
  body.addEventListener('click', () => input.focus());
}

function execSQL(sql) {
  const output = document.getElementById('terminalOutput');
  const block  = document.createElement('div');
  block.className = 'output-block';

  // Echo command
  const echo = document.createElement('div');
  echo.className = 'cmd-echo';
  echo.textContent = sql;
  block.appendChild(echo);

  const t0 = performance.now();
  const result = engine.run(sql);
  const elapsed = ((performance.now() - t0) / 1000).toFixed(3);

  if (!result) return;

  if (result.type === 'clear') {
    output.innerHTML = '';
    return;
  }

  if (result.type === 'error') {
    const err = document.createElement('div');
    err.className = 'output-error';
    err.style.whiteSpace = 'pre';
    err.textContent = result.message;
    block.appendChild(err);

  } else if (result.type === 'text') {
    const txt = document.createElement('div');
    txt.className = 'output-text';
    txt.textContent = result.content;
    block.appendChild(txt);

  } else if (result.type === 'table') {
    const tbl = renderTable(result.columns, result.rows);
    block.appendChild(tbl);

    const meta = document.createElement('div');
    meta.className = 'result-meta';
    const count = result.rows.length;
    meta.textContent = `${count} row${count !== 1 ? 's' : ''} in set (${result.time} sec)`;
    block.appendChild(meta);
  }

  output.appendChild(block);

  // Scroll to bottom
  const body = document.getElementById('terminalBody');
  body.scrollTop = body.scrollHeight;
}

function renderTable(columns, rows) {
  // Calculate column widths
  const widths = columns.map(col => {
    const maxRow = rows.reduce((max, r) => Math.max(max, String(r[col] ?? 'NULL').length), 0);
    return Math.max(col.length, maxRow);
  });

  const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const header = '|' + columns.map((col, i) => ` ${col.padEnd(widths[i])} `).join('|') + '|';
  const dataRows = rows.map(r =>
    '|' + columns.map((col, i) => {
      const val = r[col] === null || r[col] === undefined ? 'NULL' : String(r[col]);
      return ` ${val.padEnd(widths[i])} `;
    }).join('|') + '|'
  );

  const lines = [sep, header, sep, ...dataRows, sep].join('\n');

  const pre = document.createElement('pre');
  pre.className = 'sql-table';
  pre.textContent = lines;
  return pre;
}

function runHint(sql) {
  const input = document.getElementById('sqlInput');
  if (input) {
    input.value = sql;
    input.focus();
    // Auto-execute hint
    execSQL(sql);
    input.value = '';
  }
}

// ── MODE SWITCHING ────────────────────────────────────────────────
function switchMode(mode) {
  const devPage    = document.getElementById('devMode');
  const normalPage = document.getElementById('normalMode');
  const btnDev     = document.getElementById('btnDev');
  const btnNormal  = document.getElementById('btnNormal');

  if (mode === 'dev') {
    devPage.classList.remove('hidden');
    normalPage.classList.add('hidden');
    btnDev.classList.add('active');
    btnNormal.classList.remove('active');
    document.getElementById('sqlInput')?.focus();
  } else {
    devPage.classList.add('hidden');
    normalPage.classList.remove('hidden');
    btnDev.classList.remove('active');
    btnNormal.classList.add('active');
    animateStats();
    animateSkillBars();
  }
}

// ── NORMAL MODE ANIMATIONS ────────────────────────────────────────
const TYPED_STRINGS = [
  'T-SQL optimization enthusiast.',
  'Managing 7,000+ monthly users.',
  'Deputy Team Leader @ OMEGA365.',
  'Tri-lingual: FR · EN · ZH.',
  'CYTech Computer Engineer.',
];

let typedIdx = 0, charIdx = 0, deleting = false;

function typeEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const current = TYPED_STRINGS[typedIdx];

  if (!deleting) {
    el.innerHTML = current.slice(0, charIdx + 1) + '<span class="typed-cursor"></span>';
    charIdx++;
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeEffect, 2200);
      return;
    }
  } else {
    el.innerHTML = current.slice(0, charIdx - 1) + '<span class="typed-cursor"></span>';
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      typedIdx = (typedIdx + 1) % TYPED_STRINGS.length;
      setTimeout(typeEffect, 400);
      return;
    }
  }
  setTimeout(typeEffect, deleting ? 40 : 70);
}

let statsAnimated = false;
function animateStats() {
  if (statsAnimated) return;
  statsAnimated = true;

  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, duration / steps);
  });
}

let skillsAnimated = false;
function animateSkillBars() {
  if (skillsAnimated) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillsAnimated = true;
        document.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.style.getPropertyValue('--w');
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const section = document.getElementById('skills');
  if (section) observer.observe(section);
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTerminal();
  typeEffect(); // runs in background even for normal mode start

  // Start in dev mode by default (already visible from HTML)
  animateSkillBars(); // set up observer regardless
});
