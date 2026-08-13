# Part 2 — AbleSpace Take Data (Caseload)

Product walkthrough of AbleSpace’s **Caseload → Take Data** flow, written from exploring the public product (ablespace.io, feature pages, tutorials, and the iOS app listing). This is the core daily job of a school-based SLP, OT, PT, or special educator: open a student, collect IEP goal data during or after a session, and leave with something usable for progress reports and billing.

Product: [https://www.ablespace.io](https://www.ablespace.io)  
Tutorials: [https://www.ablespace.io/tutorials](https://www.ablespace.io/tutorials)  
Data types: [https://www.ablespace.io/features/data-types](https://www.ablespace.io/features/data-types)

If you have a live AbleSpace account, add screenshots under each step before submitting (the assignment accepts a document with screenshots **or** a short video).

---

## 1. What problem this screen solves

Special education teams used to carry paper data sheets, sticky notes, and binders. Data got lost, service minutes were guessed later, and IEP graphs were built by hand the night before a meeting.

**Take Data** is AbleSpace’s answer: a caseload-first screen where a clinician picks a student and logs observations against that student’s IEP goals in one sitting. The same action also feeds:

- Progress graphs for IEP meetings
- Session / goal-level service time
- Medicaid billing notes
- Shared caseload work with paras and other providers

The product promise is “collect data with a single click” across 10+ measurement types, then auto-analyze it.

---

## 2. Workflow, in my own words

### Step A — Land on Caseload

Caseload is the home base. It is a working list of *my* students, not a generic student directory. I expect to see:

- Student name and identifying context (grade, school, caseload tags)
- A sense of “who do I still need to see today?”
- Entry points into goals, notes, sessions, and **Take Data**

This matches how a therapist actually starts a period: “Who is on my list, and who am I seeing next?”

### Step B — Choose a student

Opening a student should answer three questions immediately:

1. What are their active IEP goals?
2. Have I already taken data recently?
3. Can I start collecting *now* without hunting through settings?

Goals are the unit of work. Each goal has a measurement type (accuracy, frequency, duration, prompting, task analysis, rating scale, anecdotal, custom, and so on). The Take Data UI has to change shape based on that type. A frequency goal is a tally. An accuracy goal is correct / incorrect. Duration is a timer. Anecdotal is a text note. That is the hard UX problem this screen is solving.

### Step C — Open Take Data

From Caseload, Take Data is the “session mode” overlay or page. Mentally it is:

> I am with this student (or just finished with them). Let me tap through their goals as fast as the session allows.

Typical actions on this screen:

- Confirm the student and the session / date
- See the list of goals that are due or relevant today
- Log a trial or observation with one tap (`+` correct, `-` incorrect, increment a count, start/stop a timer, pick a prompt level)
- Optionally add a short note
- Move to the next goal without leaving the page
- Save so the trial is attached to the student, the goal, and the session

AbleSpace also has a dedicated **Data** tab for faster logging and a way to enter data on **past sessions**. That tells me they know the real workflow is messy: sometimes you take data live, sometimes you catch up after the student leaves.

### Step D — Service time rides along

While data is being taken, AbleSpace can track service minutes at session level and at goal level. That is important because Medicaid and district compliance care about *time*, not only *accuracy*. A good Take Data screen does not make time tracking a separate chore.

### Step E — Leave with artifacts

After save, the same data should show up in:

- Goal progress graphs
- Session reports
- Billing notes (copy/paste for Medicaid)
- Shared views if a para or another therapist is on the student

The clinician should not re-enter anything.

---

## 3. What works well (product thinking)

**Caseload as the spine.** Starting from people, not from a blank form, matches the job. Teachers think “Maya’s articulation goals,” not “create a new data record.”

**Measurement types are first-class.** Over 10 data types is not feature bloat here. IEP goals are written in different units on purpose. If the UI only had a number field, clinicians would invent workarounds and the graphs would lie.

**One-click collection.** Reducing a trial to a tap is the difference between using the tool *during* therapy and filling it in after school. That is the product’s main adoption bet.

**Catch-up paths.** Past sessions, bulk add, and a Data tab show they understand classrooms are interrupt-driven.

**Downstream automation.** Graphs, billing notes, and service-time reports justify the extra tap during the session. People will only take digital data if it saves them Sunday night work.

**Collaboration.** Paras taking data on a shared student is a real district requirement. Paper never handled this cleanly.

---

## 4. UX / UI and functionality improvements I would make

These are suggestions, not bugs I can confirm without a logged-in account. I would validate each with a therapist shadow session.

### 1. Make “who still needs data today” obvious on Caseload

Caseload lists can get long. I would add a compact status chip per student: **Data taken today / Due / Overdue / Absent**. A therapist between sessions should scan the list in two seconds and know who is left. Color alone is not enough; use text + icon for accessibility.

### 2. Session-first Take Data, with a “quick trial” strip

The current mental model is student → goals → trials. I would add a sticky header:

- Student name
- Session timer (service minutes) always visible
- Goal progress “3 of 8 goals logged”
- A large **Next goal** control for one-handed iPad use

Therapists often hold materials in one hand. Hit targets should be thumb-sized, especially `+` / `-`.

### 3. Offline / flaky-wifi mode

Schools have dead zones. If a tap does not persist, trust dies immediately. I would queue trials locally, show a “Saved on device — syncing…” state, and never block the next trial on a network round-trip.

### 4. Smarter goal ordering

Surface goals that:

- Have not been probed this week
- Are due for progress reporting
- Match the scheduled session type (speech vs OT)

A rotating-schedule feature already exists; Take Data should inherit that order instead of a static list.

### 5. Undo and “wrong student” recovery

One-click data is fast and also dangerous. I would add:

- Immediate undo toast (“Logged +1 on Goal 4 — Undo”)
- Confirm when switching students mid-session
- A “this trial was for a different goal” move action

### 6. Prompt-level and anecdotal without breaking flow

Prompting and anecdotal notes are slower than a tally. I would keep the fast tap row, and open a lightweight sheet for prompt / note only when needed, instead of changing the whole page layout per goal type.

### 7. Live preview of the graph

After 3–4 trials, show a tiny sparkline on the Take Data screen: “This session vs last 4.” Clinicians decide *in the moment* whether to probe more. Waiting until the Reports tab is too late.

### 8. Reduce billing anxiety

If service minutes look short, say so before the session is closed: “Speech session is 18 minutes. Medicaid often expects 30. Add note or adjust time?” That is a compliance nudge, not a blocker.

### 9. Caseload density on mobile

On phone, a card-per-student list wastes space. A compact table (name, next session, data status, Take Data button) would let a therapist walk the hallway and tap in 1 second.

### 10. Empty and first-run states

New users add a student and then do not know they must add a goal *and* pick a data type before Take Data is useful. I would use a checklist empty state: Add student → Add goal → Choose data type → Take first trial. The tutorials exist; the product should teach this inline.

---

## 5. How this connects to Part 1 (TaskFlow)

Building the Figma task app made the same product questions obvious:

- **Home object:** AbleSpace’s home object is the *student*. TaskFlow’s is the *task*. Both need a clear “current context” (caseload vs workspace).
- **Fast capture vs rich detail:** Take Data must be faster than paper. TaskFlow’s board vs detail page is the same split (scan vs inspect).
- **Persistence of mode:** Therapists need the last student / last goal. We persist theme and workspace for the same reason — do not reset the user’s place.
- **Destructive actions:** Deleting a workspace (or a student / goal) needs an “Are you sure?” Because one-click speed and one-click regret live together.

If I were designing Take Data inside AbleSpace, I would steal TaskFlow’s discipline on spacing, persistent context, and confirmations, then optimize every control for one-handed, in-session use.

---

## 6. Screenshots / video (add before submit)

| # | Capture this | Why |
| --- | --- | --- |
| 1 | Caseload list | Shows the starting point |
| 2 | Student opened from Caseload | Goals and identity |
| 3 | Take Data screen mid-session | Core workflow |
| 4 | A second data type (e.g. duration or prompting) | Shows flexibility |
| 5 | Result in a graph or session report | Shows the payoff |

Optional: a 2–3 minute Loom walking the same five shots.

---

## Sources

- AbleSpace product and features: https://www.ablespace.io / https://www.ablespace.io/features
- Data types: https://www.ablespace.io/features/data-types
- Tutorials (Take Data, Data tab, past sessions, caseload): https://www.ablespace.io/tutorials
- Caseload management overview: https://www.ablespace.io/blog/ablespace-sped-caseload-management-made-easy
- App Store listing (mobile data collection): AbleSpace — IEP Goal Tracking
