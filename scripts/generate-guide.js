const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 64, right: 64 },
  info: {
    Title: 'ChronosFlow — User Guide',
    Author: 'ChronosFlow',
    Subject: 'How to use ChronosFlow time tracking app',
  },
})

const OUT = path.join(__dirname, '..', 'ChronosFlow-User-Guide.pdf')
doc.pipe(fs.createWriteStream(OUT))

// ─── Colors ───────────────────────────────────────────
const C = {
  indigo:  '#6366f1',
  dark:    '#18181b',
  mid:     '#3f3f46',
  muted:   '#71717a',
  light:   '#e4e4e7',
  faint:   '#f4f4f5',
  emerald: '#22c55e',
  amber:   '#f59e0b',
  red:     '#ef4444',
  white:   '#ffffff',
}

// ─── Helpers ──────────────────────────────────────────
function pageWidth() { return doc.page.width - doc.page.margins.left - doc.page.margins.right }

function rule(color = C.light) {
  doc.moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.margins.left + pageWidth(), doc.y)
     .strokeColor(color).lineWidth(1).stroke()
  doc.moveDown(0.5)
}

function badge(text, bgColor, textColor = C.white) {
  const pad = 6, h = 16
  const w = doc.widthOfString(text) + pad * 2
  const x = doc.x, y = doc.y
  doc.roundedRect(x, y, w, h, 3).fill(bgColor)
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold')
     .text(text, x + pad, y + 4, { lineBreak: false })
  doc.x = x
  doc.moveDown(1.4)
}

function sectionHeader(num, title) {
  doc.moveDown(1)
  // Number pill
  const nx = doc.page.margins.left
  const ny = doc.y
  doc.roundedRect(nx, ny, 24, 24, 4).fill(C.indigo)
  doc.fillColor(C.white).fontSize(11).font('Helvetica-Bold')
     .text(String(num), nx, ny + 6, { width: 24, align: 'center', lineBreak: false })
  // Title
  doc.fillColor(C.dark).fontSize(16).font('Helvetica-Bold')
     .text(title, nx + 32, ny + 4, { lineBreak: false })
  doc.moveDown(1)
  rule(C.indigo + '40')
}

function subHeader(title) {
  doc.moveDown(0.5)
  doc.fillColor(C.mid).fontSize(11).font('Helvetica-Bold').text(title)
  doc.moveDown(0.3)
}

function body(text, options = {}) {
  doc.fillColor(C.dark).fontSize(10).font('Helvetica').text(text, { lineGap: 4, ...options })
  doc.moveDown(0.3)
}

function tip(text) {
  const x = doc.page.margins.left
  const y = doc.y
  const w = pageWidth()
  // Background
  doc.roundedRect(x, y, w, 36, 6).fill(C.indigo + '15')
  doc.roundedRect(x, y, 4, 36, 2).fill(C.indigo)
  doc.fillColor(C.indigo).fontSize(9).font('Helvetica-Bold')
     .text('TIP', x + 12, y + 6, { lineBreak: false })
  doc.fillColor(C.mid).fontSize(9).font('Helvetica')
     .text(text, x + 12, y + 18, { width: w - 20, lineBreak: false })
  doc.moveDown(2.6)
}

function step(num, action, detail) {
  const x = doc.page.margins.left
  const y = doc.y
  // Circle
  doc.circle(x + 8, y + 7, 8).fill(C.faint)
  doc.fillColor(C.indigo).fontSize(8).font('Helvetica-Bold')
     .text(String(num), x, y + 3, { width: 16, align: 'center', lineBreak: false })
  // Text
  doc.fillColor(C.dark).fontSize(10).font('Helvetica-Bold')
     .text(action, x + 22, y, { lineBreak: false })
  doc.moveDown(0.4)
  doc.fillColor(C.muted).fontSize(9).font('Helvetica')
     .text(detail, x + 22, doc.y, { width: pageWidth() - 22, lineGap: 3 })
  doc.moveDown(0.6)
}

function keyValue(key, val, valColor = C.dark) {
  const x = doc.page.margins.left
  const y = doc.y
  doc.fillColor(C.muted).fontSize(9).font('Helvetica-Bold')
     .text(key.toUpperCase(), x, y, { width: 110, lineBreak: false })
  doc.fillColor(valColor).fontSize(9).font('Helvetica')
     .text(val, x + 115, y, { width: pageWidth() - 115 })
  doc.moveDown(0.3)
}

function inlineCode(text) {
  const pad = 5, h = 14
  const w = doc.widthOfString(text, { fontSize: 9 }) + pad * 2
  const x = doc.x, y = doc.y
  doc.roundedRect(x, y, w, h, 2).fill(C.faint)
  doc.fillColor(C.mid).fontSize(9).font('Courier')
     .text(text, x + pad, y + 3, { lineBreak: false })
  doc.x = x
  doc.moveDown(1.3)
}

// ════════════════════════════════════════════════════════
// COVER PAGE
// ════════════════════════════════════════════════════════
// Background stripe
doc.rect(0, 0, doc.page.width, 280).fill(C.dark)

// Logo circle
doc.circle(doc.page.margins.left + 24, 80, 24).fill(C.indigo)
doc.fillColor(C.white).fontSize(20).font('Helvetica-Bold')
   .text('CF', doc.page.margins.left + 10, 71, { lineBreak: false })

// App name
doc.fillColor(C.white).fontSize(36).font('Helvetica-Bold')
   .text('ChronosFlow', doc.page.margins.left, 116)

// Tagline
doc.fillColor(C.indigo).fontSize(14).font('Helvetica')
   .text('Time Tracking & Productivity — User Guide', doc.page.margins.left, 160)

// Version / date strip
doc.roundedRect(doc.page.margins.left, 198, 180, 28, 6).fill(C.indigo)
doc.fillColor(C.white).fontSize(10).font('Helvetica-Bold')
   .text(`v1.0  ·  ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
         doc.page.margins.left + 12, 208, { lineBreak: false })

// Subtitle box below stripe
doc.rect(0, 280, doc.page.width, 40).fill(C.indigo)
doc.fillColor(C.white).fontSize(11).font('Helvetica')
   .text('Everything you need to track time, manage projects, and understand your productivity.',
         doc.page.margins.left, 292, { width: pageWidth() })

// Table of contents
doc.y = 360
doc.fillColor(C.dark).fontSize(13).font('Helvetica-Bold').text('Contents')
doc.moveDown(0.6)
rule()

const toc = [
  ['1', 'Getting Started — Your First Login', '2'],
  ['2', 'Tracking Time with the Global Timer', '3'],
  ['3', 'Managing Projects', '4'],
  ['4', 'Timesheets — View & Edit Your Entries', '5'],
  ['5', 'Reports & Analytics', '6'],
  ['6', 'Deep Work & Pomodoro Mode', '7'],
  ['7', 'Settings & Account', '8'],
  ['8', 'Tips & Keyboard Shortcuts', '8'],
]

toc.forEach(([num, title, pg]) => {
  const x = doc.page.margins.left
  const y = doc.y
  doc.fillColor(C.indigo).fontSize(10).font('Helvetica-Bold')
     .text(num + '.', x, y, { width: 18, lineBreak: false })
  doc.fillColor(C.dark).fontSize(10).font('Helvetica')
     .text(title, x + 20, y, { lineBreak: false })
  doc.fillColor(C.muted).fontSize(10)
     .text(pg, x + pageWidth() - 10, y, { lineBreak: false })
  doc.moveDown(0.6)
})

// ════════════════════════════════════════════════════════
// PAGE 2 — Getting Started
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(1, 'Getting Started — Your First Login')

body('ChronosFlow is a web-based app — no download needed. Open your browser and go to your deployed URL or run it locally.')

subHeader('Create Your Account')
step(1, 'Open the app', 'Navigate to your ChronosFlow URL (e.g. https://chronosflow.netlify.app) in any modern browser.')
step(2, 'Click "Create one"', 'On the login page click the "Create one" link below the Sign In button.')
step(3, 'Fill in your details', 'Enter your full name, email address, and a password of at least 6 characters.')
step(4, 'Click "Create account"', 'You will be taken to the dashboard automatically. Check your email for a confirmation link.')

subHeader('Sign In (Returning Users)')
step(1, 'Go to the login page', 'Your app URL will redirect you to /login if you are not signed in.')
step(2, 'Enter email & password', 'Use the credentials you signed up with.')
step(3, 'Press Enter or click "Sign in"', 'You land on the Dashboard and the Global Timer bar appears at the top.')

tip('Your timer keeps running even if you close the tab. When you come back, the elapsed time is calculated from the original start timestamp.')

subHeader('Navigating the App')
body('The left sidebar contains all main sections. Click the arrow button at the top of the sidebar to collapse it and get more screen space.')

keyValue('Dashboard',   'Overview — stats, charts, recent entries')
keyValue('Timesheets',  'Full list of all your time entries')
keyValue('Projects',    'Create and manage your projects')
keyValue('Reports',     'Analytics, efficiency ratio, CSV & PDF export')
keyValue('Settings',    'Profile, preferences, sign out')

// ════════════════════════════════════════════════════════
// PAGE 3 — Timer
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(2, 'Tracking Time with the Global Timer')

body('The timer bar runs across the very top of every page. It is always visible so you can start and stop tracking from anywhere in the app.')

subHeader('Starting a Timer')
step(1, 'Click the description field', 'The wide input at the top that says "What are you working on?" — type what you are doing.')
step(2, 'Pick a project (optional)', 'Click the project dropdown next to the description. Select one of your projects or leave it as "No project".')
step(3, 'Toggle billable (optional)', 'Click the $ icon to mark this entry as billable. It turns green when active.')
step(4, 'Click Start', 'The blue Start button turns red and the timer counter begins counting up from 00:00:00.')

tip('Press Enter in the description field as a shortcut to start the timer immediately.')

subHeader('Stopping a Timer')
step(1, 'Click the red Stop button', 'The timer stops and the entry is saved to your Timesheets automatically.')
step(2, 'Entry appears instantly', 'Due to Optimistic UI, your entry appears in Timesheets before the database confirms — so it feels instant.')

subHeader('Understanding the Timer Bar Icons')
keyValue('$ icon',       'Toggle billable / non-billable. Green = billable.')
keyValue('⚡ icon',      'Toggle Deep Work mode (see Section 6).')
keyValue('00:00:00',     'Live elapsed time counter in HH:MM:SS format.')
keyValue('Project drop', 'Pick which project this time belongs to.')

subHeader('Timer Persistence')
body('If you refresh your browser while the timer is running, it will resume correctly. The app stores your start timestamp locally and calculates elapsed time on reload. If you open the app on another device, it syncs the running timer in real time.')

tip('Only one timer can run at a time. Starting a new entry automatically stops the previous one in the database.')

// ════════════════════════════════════════════════════════
// PAGE 4 — Projects
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(3, 'Managing Projects')

body('Projects help you organise your time entries by work area. Every entry can be assigned to a project, and your reports and charts are broken down by project.')

subHeader('Creating a Project')
step(1, 'Go to Projects', 'Click "Projects" in the left sidebar.')
step(2, 'Click "New Project"', 'The button is in the top-right corner of the Projects page.')
step(3, 'Enter a name', 'Type the project name (e.g. "Client Website", "Masters Thesis", "Side Project").')
step(4, 'Choose a colour', 'Click any of the colour circles. This colour appears as a dot next to the project everywhere in the app.')
step(5, 'Set hourly rate (optional)', 'Enter a rate in $ per hour if this project is billable. Used in future invoice calculations.')
step(6, 'Set budget hours (optional)', 'Enter estimated total hours. This powers the budget burn-down bar and the Efficiency Ratio metric.')
step(7, 'Toggle "Billable by default"', 'When on, new time entries for this project will automatically be marked as billable.')
step(8, 'Click "Create Project"', 'The project appears in your list immediately.')

subHeader('Editing a Project')
body('Hover over any project row — an edit (pencil) icon appears on the right. Click it to open the same form with current values pre-filled. Change anything and click "Update".')

subHeader('Archiving a Project')
body('Hover over a project row and click the archive icon (box with arrow). The project disappears from your active list but all time entries linked to it are preserved. Archived projects still appear in historical reports.')

subHeader('Budget Burn-down Bar')
body('If you set a Budget (hours) on a project, a progress bar appears showing how much of the budget has been used.')
doc.moveDown(0.3)
keyValue('Green bar',  'Under 70% of budget used — healthy')
keyValue('Amber bar',  '70–99% of budget used — warning')
keyValue('Red bar',    '100%+ of budget used — over budget')

tip('Set a budget on every project to unlock the Efficiency Ratio card on your dashboard.')

// ════════════════════════════════════════════════════════
// PAGE 5 — Timesheets
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(4, 'Timesheets — View & Edit Your Entries')

body('The Timesheets page shows every completed time entry, grouped by date with the daily total shown on the right. The most recent date is always at the top.')

subHeader('Searching Entries')
step(1, 'Click the search bar', 'The search field is directly below the page header.')
step(2, 'Type a keyword', 'The list filters instantly as you type. It searches both the description and project name.')

subHeader('Editing an Entry')
step(1, 'Hover over the entry', 'A pencil icon appears at the right end of the row.')
step(2, 'Click the pencil icon — or double-click the description', 'The description text turns into an editable input field.')
step(3, 'Edit the description', 'Type your changes.')
step(4, 'Press Enter or click the ✓ checkmark', 'The entry is saved. Press Escape to cancel without saving.')

subHeader('Deleting a Single Entry')
body('Hover over an entry row and click the trash icon. The entry is removed immediately.')

subHeader('Bulk Delete')
step(1, 'Tick the checkboxes', 'Click the checkbox on the left of each entry you want to delete. Click the top checkbox to select all.')
step(2, 'Click "Delete N"', 'A red Delete button appears in the header showing how many items are selected. Click it to remove them all.')

subHeader('Exporting to CSV')
body('Click the "Export CSV" button in the top-right of the Timesheets page. A file named chronosflow-timesheets-YYYY-MM-DD.csv is downloaded to your computer. It includes description, project, start/end times, duration, and billable flag — ready to open in Excel or Google Sheets.')

tip('The CSV export respects your current search filter. Search for a project name first to export only that project\'s entries.')

subHeader('Understanding the Entry Row')
keyValue('Colour dot',     'The project colour — matches the colour you set in the Projects page')
keyValue('Description',    'What you were working on. Double-click to edit inline.')
keyValue('$ badge',        'Appears in green if the entry is marked billable')
keyValue('Time range',     'Start time – End time (e.g. 09:14 – 11:32)')
keyValue('Duration',       'Total time in HH:MM:SS format (e.g. 01:18:00)')

// ════════════════════════════════════════════════════════
// PAGE 6 — Reports
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(5, 'Reports & Analytics')

body('The Reports page gives you a high-level view of your productivity over time. Use it to understand where your hours go and how efficiently you are working against your estimates.')

subHeader('Choosing a Date Range')
body('At the top-right, click the range toggle to switch between:')
keyValue('7 Days',   'Last 7 days — useful for a weekly review')
keyValue('30 Days',  'Last 30 days — best for monthly billing')
keyValue('90 Days',  'Last 90 days — long-term project overview')

subHeader('KPI Summary Cards')
body('Three cards appear at the top of the Reports page:')
keyValue('Total Tracked',  'Total hours logged in the selected range')
keyValue('Billable',       'Billable hours and their percentage of total time')
keyValue('Avg / Day',      'Average hours tracked per day in the range')

subHeader('Daily Trend Chart')
body('A line chart showing your tracked hours per day across the selected range. Use this to spot your most and least productive days of the week.')

subHeader('Project Breakdown Table')
body('A ranked list of all projects with time logged in the range. Each row shows:')
keyValue('Progress bar',       'Visual share of total time')
keyValue('Percentage',         'This project\'s share of all tracked time')
keyValue('Hours',              'Total hours for this project in the range')
keyValue('Billable badge',     'Appears in green showing billable hours if any')

subHeader('Efficiency Ratio')
body('If you have set "Budget (hours)" on a project, the Reports page calls a database function that calculates:')
doc.moveDown(0.3)
body('Efficiency % = (Actual Hours ÷ Budget Hours) × 100', { indent: 20 })
doc.moveDown(0.3)
keyValue('Under 100%',   'Under budget — efficient', C.emerald)
keyValue('80–100%',      'Approaching budget — warning', C.amber)
keyValue('Over 100%',    'Over budget — scope creep or underestimation', C.red)
keyValue('No Budget',    'No estimated hours set for this project', C.muted)

subHeader('Exporting Reports')
keyValue('CSV button',    'Downloads a day-by-day breakdown as a spreadsheet')
keyValue('PDF Report',    'Generates a formatted A4 PDF with your project breakdown, efficiency ratios, and summary KPIs — ready to share or archive')

tip('The PDF report is generated entirely in your browser — no data is sent to any third party.')

// ════════════════════════════════════════════════════════
// PAGE 7 — Deep Work & Pomodoro
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(6, 'Deep Work & Pomodoro Mode')

body('Deep Work Mode is a focus toggle that activates a Pomodoro timer and simplifies the interface to help you concentrate. Your regular time tracking continues running in the background.')

subHeader('Activating Deep Work Mode')
step(1, 'Click the ⚡ icon in the timer bar', 'The icon turns amber and a "Deep Work" badge appears in the timer bar and sidebar.')
step(2, 'Switch to Pomodoro mode', 'On the Dashboard, click the "Pomodoro" toggle in the top-right of the page header.')
step(3, 'The Pomodoro panel appears', 'A circular countdown timer displays on your Dashboard.')

subHeader('Understanding the Pomodoro Panel')
body('The Pomodoro technique divides work into focused intervals separated by short breaks:')
doc.moveDown(0.3)
keyValue('Focus Time',     '25 minutes of uninterrupted work')
keyValue('Short Break',    '5 minutes to rest')
keyValue('Long Break',     '15 minutes after every 4 completed focus sessions')

subHeader('Using the Pomodoro Timer')
step(1, 'Click Focus / Play', 'The circular SVG ring starts filling. The countdown shows remaining time.')
step(2, 'Work until it ends', 'When 25 minutes are up, the phase automatically advances to Short Break.')
step(3, 'Take your break', 'Click Play again to start the 5-minute break countdown.')
step(4, 'Repeat', 'After 4 sessions, a 15-minute Long Break is triggered automatically.')
step(5, 'Click Pause anytime', 'The ring freezes. Click Play to resume from where you left off.')
step(6, 'Click Reset (↺)', 'Restarts the current phase back to full time without advancing the cycle.')

subHeader('Session Progress Dots')
body('Four small dots below the timer show your progress through the current Pomodoro cycle. Filled dots (indigo) = completed sessions. After 4, a Long Break resets the dots.')

subHeader('What Happens to the Regular Timer?')
body('The regular time tracker in the header continues running independently of the Pomodoro. Your Pomodoro sessions are not saved as separate entries — the main timer records your actual working time. The Pomodoro is purely a focus aid.')

subHeader('Exiting Deep Work Mode')
body('Click the ⚡ icon again in the timer bar to deactivate. The amber badge disappears, the Pomodoro panel collapses, and all dashboard metrics return to normal.')

tip('Use Deep Work mode when you need to concentrate on a single task. The simplified interface removes distracting analytics so your full attention stays on the work.')

// ════════════════════════════════════════════════════════
// PAGE 8 — Settings & Tips
// ════════════════════════════════════════════════════════
doc.addPage()

sectionHeader(7, 'Settings & Account')

subHeader('Updating Your Profile')
step(1, 'Go to Settings', 'Click "Settings" at the bottom of the sidebar.')
step(2, 'Edit your full name', 'Type your updated name in the Full Name field.')
step(3, 'Click "Save Changes"', 'Your name is updated instantly. It appears in PDF reports.')

body('Your email address is shown but cannot be changed from this screen. Contact Supabase Auth if you need to update it.')

subHeader('Preferences')
body('Three preference toggles are available in Settings:')
keyValue('Idle detection',      'Detects when you stop working and prompts you to discard or keep idle time')
keyValue('Browser notifications', 'Get a desktop notification when your Pomodoro session ends')
keyValue('Auto-start break',    'Automatically start the break timer after each focus session')

subHeader('Signing Out')
body('Scroll to the bottom of Settings and click the red "Sign Out" button. You are returned to the login page and the session is cleared from all devices.')

// ─── Section 8
sectionHeader(8, 'Tips & Keyboard Shortcuts')

subHeader('Quick Tips')
keyValue('Start timer fast',    'Click the description box, type your task, press Enter')
keyValue('Edit entry',          'Double-click any description in Timesheets to edit inline')
keyValue('Collapse sidebar',    'Click the small arrow button on the right edge of the sidebar')
keyValue('Filter Timesheets',   'Use the search bar — it filters by description and project name')
keyValue('Export just one project', 'Search the project name in Timesheets, then click Export CSV')
keyValue('Set a budget',        'Add budget hours to a project to unlock efficiency tracking')

subHeader('Best Practices')
step(1, 'Always add a description', 'Even a short one like "Client call" or "Writing chapter 3" makes your Timesheets searchable and your Reports meaningful.')
step(2, 'Use projects from Day 1', 'Create your key projects before you start tracking. Entries without a project cannot be broken down in reports.')
step(3, 'Set budget hours on projects', 'This is what powers the Efficiency Ratio — the most valuable metric in the app.')
step(4, 'Review weekly', 'Open Reports every Friday, set the range to 7 Days, and download a PDF. Build the habit.')
step(5, 'Use Pomodoro for deep work', 'Turn it on any time you need to focus on a single important task without distractions.')

subHeader('Troubleshooting')
keyValue('Timer not saving',     'Make sure you are signed in. Check your internet connection.')
keyValue('Projects not showing', 'Refresh the page. If the issue persists, check the Supabase dashboard.')
keyValue('PDF not downloading',  'Allow pop-ups in your browser for the app URL.')
keyValue('Stuck on login',       'Clear browser cache or try an incognito window.')

tip('For any issues, check the browser console (F12 → Console) and look for red error messages starting with "Supabase".')

// ════════════════════════════════════════════════════════
// BACK COVER
// ════════════════════════════════════════════════════════
doc.addPage()
doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.dark)

doc.fillColor(C.indigo).fontSize(48).font('Helvetica-Bold')
   .text('CF', doc.page.margins.left, 180, { align: 'center' })

doc.fillColor(C.white).fontSize(28).font('Helvetica-Bold')
   .text('ChronosFlow', { align: 'center' })

doc.moveDown(0.5)
doc.fillColor(C.muted).fontSize(13).font('Helvetica')
   .text('Time Tracking & Productivity', { align: 'center' })

doc.moveDown(3)
doc.fillColor(C.mid).fontSize(10).font('Helvetica')
   .text(`User Guide v1.0 · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, { align: 'center' })

// Finalize
doc.end()
console.log(`✅ PDF saved to: ${OUT}`)
