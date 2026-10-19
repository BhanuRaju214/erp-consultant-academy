# Visual block authoring guide

Lessons are Markdown. Visuals are embedded as fenced code blocks whose language is
`visual-<type>` and whose body is **JSON**. They render as accessible, theme-aware,
responsive components. Invalid JSON shows an authoring error box (visible to everyone, so
fix before publishing). No database change is needed: blocks live in the lesson body and
can be edited in **Admin ▸ Edit lessons**.

````markdown
```visual-flow
{ "title": "Order to Cash", "steps": [ { "title": "Quotation" }, { "title": "Sales order" } ] }
```
````

Inside TypeScript content files the backticks must be escaped (`\`\`\`visual-flow`).

## Choosing the right visual

| Content | Block |
|---|---|
| Lesson opening: what and why | `visual-hero` (objectives + optional concept diagram) |
| Concept with parts around a centre (ERP modules, app dependencies) | `visual-hub` |
| Sequential process / document chain | `visual-flow` |
| Hands-on procedure in the Odoo UI | `visual-steps` (+ `visual-mockup`) |
| Odoo screen explanation | `visual-mockup` (always labelled *illustrative mockup*) |
| Comparing options (Community vs Enterprise, policies) | `visual-compare` |
| Before vs after (spreadsheets vs ERP) | `visual-beforeafter` |
| Multiple outcomes / troubleshooting | `visual-decision` |
| Lifecycle / history / phases | `visual-timeline` |
| Set of key concepts | `visual-cards` |
| Common mistakes | `visual-dodont` |
| Real business example with numbers | `visual-scenario` |
| Accounting impact | `visual-journal` |
| Quick self-check (ungraded) | `visual-check` |
| Exported Napkin AI diagram or approved image | `visual-figure` |
| Summary | `visual-takeaways` (generated automatically from `## Key takeaways`) |

Icons: use names from the icon list at the bottom (unknown names fall back to a dot).

## Block reference

### visual-hero
```json
{ "eyebrow": "Lesson 1", "title": "What is ERP?", "subtitle": "One database for the whole business",
  "objectives": ["Define ERP", "Explain integration"],
  "hub": { "center": { "label": "One database", "icon": "database" },
           "nodes": [ { "label": "Sales", "icon": "cart" } ] } }
```
`hub` is optional (same shape as `visual-hub` without title).

### visual-hub
```json
{ "title": "...", "caption": "...", "center": { "label": "...", "icon": "database" },
  "nodes": [ { "label": "Sales", "icon": "cart", "detail": "Shown when the node is selected" } ] }
```

### visual-flow
```json
{ "title": "...", "caption": "...", "compact": false,
  "steps": [ { "title": "Quotation", "icon": "file", "actor": "Salesperson", "detail": "...",
               "document": "Quotation", "odoo": "Sales ▸ Orders ▸ Quotations", "impact": "No accounting entry" } ] }
```
`compact: true` renders simple chips (used automatically for `A → B → C` lines).

### visual-steps
```json
{ "title": "...", "steps": [ { "title": "Create the quotation", "body": "Markdown allowed",
  "path": "Sales ▸ Orders ▸ Quotations ▸ New", "result": "Status: Quotation" } ] }
```

### visual-mockup
```json
{ "title": "...", "app": "Sales", "breadcrumb": ["Quotations", "S00042"],
  "buttons": [ { "label": "Send by Email", "primary": true, "marker": 1 } ],
  "status": { "steps": ["Quotation", "Quotation Sent", "Sales Order"], "current": 0 },
  "fields": [ { "label": "Customer", "value": "Greenfield International School", "marker": 2 } ],
  "lines": { "columns": ["Product", "Quantity"], "rows": [["A4 Paper", "600"]] },
  "annotations": [ { "marker": 1, "title": "Send by Email", "text": "..." } ],
  "note": "Field labels follow Odoo 17 — verify in your training instance." }
```
Always rendered with an "Illustrative mockup — not a screenshot" label.

### visual-compare
```json
{ "title": "...", "columns": ["Ordered quantities", "Delivered quantities"],
  "rows": [ { "label": "Invoice when", "values": ["On confirmation", "After delivery"] },
            { "label": "Good for services", "values": [true, false] } ],
  "highlight": 1, "caption": "..." }
```
Values may be strings, `true` (✓) or `false` (✗).

### visual-beforeafter
```json
{ "title": "...", "before": { "title": "Spreadsheets", "points": ["..."] },
  "after": { "title": "ERP", "points": ["..."] } }
```

### visual-decision
```json
{ "title": "...", "start": "q1",
  "nodes": {
    "q1": { "question": "Was the delivery validated?", "options": [ { "label": "Yes", "next": "q2" }, { "label": "No", "next": "r1" } ] },
    "r1": { "result": "Validate the delivery first", "tone": "warning", "detail": "..." } } }
```
Tones: `success`, `warning`, `danger`, `info`.

### visual-timeline
```json
{ "title": "...", "items": [ { "when": "1970s", "title": "MRP", "detail": "...", "icon": "factory" } ] }
```

### visual-cards
```json
{ "label": "Key concepts (optional chip text)", "title": "...", "columns": 3, "cards": [ { "icon": "database", "title": "Shared data", "body": "...", "tone": "info" } ] }
```

### visual-dodont
```json
{ "title": "...", "do": ["..."], "dont": ["..."] }
```

### visual-scenario
```json
{ "title": "...", "company": "Brightline Furniture Pvt Ltd", "industry": "Manufacturing",
  "situation": "...", "steps": ["..."],
  "metrics": [ { "label": "Month-end close", "before": "8 days", "after": "3 days" } ] }
```

### visual-journal
```json
{ "title": "Customer invoice posted", "lines": [ { "account": "Accounts Receivable", "debit": "1,180.00" },
  { "account": "Sales", "credit": "1,000.00" } ], "note": "..." }
```

### visual-check
```json
{ "question": "...", "options": ["...", "..."], "correct": 1, "explanation": "..." }
```
Practice only — not graded, not stored.

### visual-figure
```json
{ "src": "/visuals/odoo-sales/master-data-and-transactions/o2c-flow.svg",
  "alt": "Describe what the diagram shows for screen-reader users",
  "caption": "...", "credit": "Diagram created with Napkin AI", "width": 1200, "height": 675 }
```
`src` must be under `/visuals/` and registered in `src/content/visuals/registry.ts`
(`npm run visuals:check` verifies this).

### visual-takeaways
```json
{ "items": ["...", "..."] }
```

### visual-flow extras
Steps also accept `app` (Odoo app tag), `branch` (`{ "when": "Not qualified", "result": "Lost", "tone": "danger" }`)
and `parallel` (2–4 `{ title, app, icon, detail }` items done at the same time). A flow-level `loop` adds a "Repeat" band.

### visual-layers
```json
{ "title": "How an ERP is put together",
  "layers": [ { "title": "User interface", "subtitle": "...", "icon": "globe", "items": ["Web", "Mobile"] }, ... ],
  "connects": [ { "title": "External systems", "detail": "...", "icon": "link" } ] }
```
Top layer first; the last layer is drawn as the dark foundation (usually the database).

### visual-trend
```json
{ "title": "...", "points": ["Go-live", "Upgrade 1"], "series": [ { "label": "Customised", "values": [20, 55], "tone": "danger" } ],
  "caption": "Illustrative shape, not measured data." }
```
Use for qualitative shapes only, and say so in the caption.

### visual-story (scenario video)
An animated 3D walkthrough: the transaction travels between departments on an isometric board, scene by scene,
with play/pause, a chapter scrubber, full screen, keyboard (Space, ← →) and a reduced-motion fallback.
```json
{ "title": "...", "company": "... · fictional", "pace": 7,
  "stations": [ { "id": "sales", "label": "Sales", "icon": "file", "app": "Sales", "x": 3, "y": 1 }, ... ],
  "scenes": [ { "at": "10 Mar", "from": "customer", "to": "sales", "carry": "Signed online",
                "title": "...", "text": "...", "document": "S00231",
                "entries": [ { "account": "Accounts Receivable", "debit": "9,177" } ], "tone": "success" } ],
  "counters": [ { "label": "Open receivable", "values": ["0", "..."] } ],
  "results": [ { "label": "Gross margin", "value": "4,640 (43.6%)" } ] }
```
Stations sit on a 4×4 grid (`x`, `y` 0–3); a ring layout reads best. Each counter needs one value per scene.
Example: the Order-to-Cash business process scenario (`src/content/processes.ts`).

### visual-screen (real Odoo screenshot with callouts)
```json
{ "src": "/visuals/odoo-inventory/screens/inv-product.webp", "alt": "…", "title": "…", "path": "Inventory ▸ Products", "version": "Odoo 20",
  "width": 1600, "height": 1000,
  "callouts": [ { "x": 14.8, "y": 33.8, "w": 24.6, "h": 3.2, "tag": "top", "title": "Product Type", "text": "…" } ] }
```
`x`/`y` is the centre of the data in % of the image, `w`/`h` the blinking box around it; `tag` (top, bottom, left, right) is
where the number sits so it never covers the data. Only real screenshots — never mock-ups.

### visual-simulate (click-through on real screens)
Generated from a real Odoo run (see `scratchpad` recorder scripts); not hand-authored. Each step: `src`, `alt`, `task`,
optional `target` box (+ `label`), optional `input` (`label`, `answer`), `traps` (box + `feedback`), `explain`.

## Exercise blocks (interactive practice, not graded)

Rules for all exercise blocks:
- Write the **correct** answer in the JSON; the portal shuffles it (seeded, so it is the same on every load).
- Keep strings plain: **no backslashes, no backticks, no `${`** (the lesson body is a TypeScript template literal).
  Use single quotes inside text and code instead of double quotes.
- Feedback must teach: say *why* an answer is right or wrong, in one or two sentences.

### visual-order (put steps in sequence)
```json
{ "title": "Order-to-Cash", "prompt": "Put the O2C documents in the order Odoo creates them.",
  "items": ["Quotation", "Sales order", "Delivery", "Customer invoice", "Payment"],
  "explanation": "Odoo cannot invoice delivered quantities before the delivery is validated." }
```
3–10 items, authored in the correct order.

### visual-match (match pairs)
```json
{ "title": "Who does what", "prompt": "Match each role to its main responsibility.", "leftLabel": "Role", "rightLabel": "Responsibility",
  "pairs": [ { "left": "Project sponsor", "right": "Owns the budget and final decisions" },
             { "left": "Key user", "right": "Tests and signs off the process for their team" },
             { "left": "Functional consultant", "right": "Maps the process to Odoo configuration" } ],
  "explanation": "…" }
```
3–10 pairs; right-hand texts must be unique. Good for: term ↔ definition, error ↔ fix, defect ↔ severity, field ↔ purpose.

### visual-gst (Indian GST calculator)
```json
{ "title": "Intra- vs inter-state GST", "sellerState": "Maharashtra",
  "states": ["Maharashtra", "Karnataka", "Gujarat", "Delhi", "Tamil Nadu"], "amount": 10000, "rate": 18, "rates": [0, 5, 12, 18, 28] }
```
The learner changes amount, rate and place of supply; the block shows CGST + SGST (same state) or IGST (different state).

### visual-sequence (step-through sequence diagram)
```json
{ "title": "Webhook delivery", "actors": ["Shop", "Odoo", "Middleware"],
  "messages": [ { "from": "Shop", "to": "Middleware", "label": "POST /orders (webhook)", "note": "Signed with an HMAC header", "kind": "async" },
                { "from": "Middleware", "to": "Odoo", "label": "create sale.order", "kind": "request" },
                { "from": "Odoo", "to": "Middleware", "label": "id 42", "kind": "response" },
                { "from": "Middleware", "to": "Middleware", "label": "store idempotency key", "kind": "self" } ] }
```
2–5 actors, up to 16 messages; `kind`: request (solid), response / async (dashed), self (loop). Learners press **Next**.

### visual-codewalk (annotated code)
```json
{ "title": "A minimal Odoo model", "language": "python", "file": "models/library_book.py",
  "code": ["from odoo import api, fields, models", "", "class LibraryBook(models.Model):", "    _name = 'library.book'", "    name = fields.Char(required=True)"],
  "notes": [ { "lines": "3-4", "title": "Model name", "text": "`_name` creates the table *library_book*." },
             { "lines": "5", "title": "A required field", "text": "…" } ] }
```
`code` is an array of lines (max 80); notes point to `"3"` or `"3-7"`. Use single quotes in code (Python, XML attributes
and JSON-in-code all accept them here) and never a backslash.

### visual-roleplay (consultant conversation)
```json
{ "title": "Scope creep in a workshop", "setting": "Sales workshop, week 3. The sales director joins late.", "client": "Sales director",
  "rounds": [ { "says": "Can we just add a field for the competitor price? It's tiny.",
                "options": [ { "text": "Sure, I'll add it today.", "quality": "poor", "feedback": "Untracked changes become scope creep and an untested customisation." },
                             { "text": "Let's log it as a change request with the business reason, and check if a standard field covers it.", "quality": "best", "feedback": "Keeps scope controlled and looks for standard first." } ] } ],
  "wrapup": "Standard first, change control always." }
```
1–8 rounds, 2–4 options each, at least one `best` per round (`best`, `ok`, `poor`).

## Icon names
`database, cart, truck, warehouse, factory, landmark, users, user, file, invoice, receipt,
payment, bank, mail, signature, check, alert, x, settings, chart, calendar, clock, globe,
package, box, tag, percent, layers, link, shield, lock, key, search, lightbulb, target,
rocket, server, cloud, code, plug, workflow, clipboard, book, graduation, store, building,
handshake, refresh, filter, list, phone, flag, coins, scale, wrench`
