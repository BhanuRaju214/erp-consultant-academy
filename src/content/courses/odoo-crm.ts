import type { CourseContent } from "../types";

/**
 * Odoo CRM application training (16-point application template).
 * Running example company: Northwind Office Supplies Pvt Ltd (B2B office-supplies distributor).
 */
export const odooCrm: CourseContent = {
  slug: "odoo-crm",
  section: "odoo-apps",
  title: "Odoo CRM: Leads, Pipeline & Forecasting",
  summary:
    "Learn how Odoo CRM captures leads, qualifies them into opportunities, moves them through a pipeline and hands them over to Sales. Covers configuration, sales teams, lost reasons, activities, predictive lead scoring, reporting, troubleshooting and interview preparation using a realistic B2B distributor scenario.",
  level: "beginner",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 1,
  skills: [
    "Explain the lead-to-opportunity lifecycle",
    "Configure CRM settings, stages, sales teams and lost reasons",
    "Convert, merge and qualify leads",
    "Create quotations from opportunities",
    "Use activities, predictive lead scoring and forecasting",
    "Analyse the pipeline with CRM reports",
    "Troubleshoot common CRM configuration issues",
  ],
  modules: [
    {
      title: "Module 1: Understanding Odoo CRM",
      lessons: [
        {
          slug: "overview-and-business-problems",
          title: "Overview, business problems & process flow",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `\`\`\`visual-video
{
  "src": "/videos/odoo-crm-live.mp4",
  "poster": "/videos/odoo-crm-live.webp",
  "title": "Odoo CRM: from new opportunity to won, recorded live in Odoo 20",
  "duration": "2:44",
  "caption": "A short introduction, then the process as a continuous live screen recording in an Odoo 20 database with fictional Northwind data. Narration: Indian English neural voice.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 13,
      "label": "What Odoo CRM does"
    },
    {
      "t": 36,
      "label": "Why it matters"
    },
    {
      "t": 55,
      "label": "Document flow"
    },
    {
      "t": 78,
      "label": "Live: Pipeline"
    },
    {
      "t": 90,
      "label": "Live: Quick create"
    },
    {
      "t": 103,
      "label": "Live: Open it"
    },
    {
      "t": 112,
      "label": "Live: Qualify"
    },
    {
      "t": 119,
      "label": "Live: Quotation"
    },
    {
      "t": 128,
      "label": "Live: Won"
    },
    {
      "t": 144,
      "label": "Recap"
    }
  ]
}
\`\`\`

## 1. Application overview

**Odoo CRM** (Customer Relationship Management) is the front door of the Order-to-Cash cycle. It records every potential deal from the very first contact until the deal is either **won** (and handed to Sales as a quotation) or **lost** (with a reason). It does not post any accounting entries and does not move stock; its job is to organise *selling effort* and *predict revenue*.

Throughout this course we use one fictional company:

| Item | Value |
|---|---|
| Company | Northwind Office Supplies Pvt Ltd |
| Business | B2B distributor of paper, printer consumables, furniture and pantry supplies |
| Customers | Corporate offices, schools, co-working spaces |
| Sales teams | Corporate Sales (key accounts), Inside Sales (phone/web enquiries) |
| Typical deal | Annual stationery contract worth INR 3–25 lakh |

### Core objects in CRM

| Object | What it represents | Technical model |
|---|---|---|
| Lead | An unqualified enquiry (web form, trade fair card, email) | crm.lead (type = lead) |
| Opportunity | A qualified deal with expected revenue and probability | crm.lead (type = opportunity) |
| Stage | A step in the pipeline (New, Qualified, Proposition, Won) | crm.stage |
| Sales Team | A group of salespeople with its own pipeline and targets | crm.team |
| Lost Reason | Why a deal was lost (Too expensive, Chose competitor...) | crm.lost.reason |
| Activity | A planned follow-up (call, meeting, email, to-do) | mail.activity |

> **Consultant tip:** Leads and opportunities are the *same model* (crm.lead) with a different type. That is why "converting" a lead does not create a new record — it changes the type and assigns a stage. Mention this in interviews; it shows technical depth.

\`\`\`visual-cards
{
  "label": "Key concepts",
  "title": "The building blocks of Odoo CRM",
  "columns": 3,
  "cards": [
    { "icon": "user", "title": "Lead", "body": "Unqualified enquiry from a web form, email or trade fair card. Exists only when the Leads setting is on.", "tone": "info" },
    { "icon": "target", "title": "Opportunity", "body": "Qualified deal with expected revenue, probability and a stage. Same model (crm.lead) as a lead." },
    { "icon": "layers", "title": "Stage", "body": "Kanban column of the pipeline, e.g. New, Qualified, Proposition, Won. Can be limited to one sales team." },
    { "icon": "users", "title": "Sales team", "body": "Corporate Sales and Inside Sales at Northwind: each has its own pipeline, leader and optional email alias." },
    { "icon": "calendar", "title": "Activity", "body": "Planned call, meeting, email or to-do with a due date; overdue activities show in red." },
    { "icon": "x", "title": "Lost reason", "body": "Why a deal was lost (Too expensive, Chose competitor). Feeds the Lost analysis.", "tone": "warning" }
  ]
}
\`\`\`

## 2. Business problems solved

Before Odoo, Northwind tracked enquiries in personal spreadsheets and email inboxes. The management team listed these pain points:

1. **Lost enquiries** — web enquiries sat unanswered in a shared mailbox for days.
2. **No visibility** — the sales manager could not see which deals were close to closing.
3. **No forecast** — finance could not plan purchases because expected revenue was unknown.
4. **No follow-up discipline** — salespeople forgot to call back after sending price lists.
5. **No learning from losses** — nobody knew *why* deals were lost.
6. **Duplicate effort** — two salespeople called the same school without knowing it.

| Pain point | Odoo CRM feature that solves it |
|---|---|
| Lost enquiries | Email alias / website form creates leads automatically; assignment to teams |
| No visibility | Kanban pipeline per sales team with expected revenue per stage |
| No forecast | Expected revenue × probability, expected closing date, Forecast view |
| No follow-up | Activities with due dates, overdue highlighting, activity reports |
| No learning from losses | Mandatory lost reasons and Lost analysis |
| Duplicate effort | Duplicate detection and Merge |

\`\`\`visual-beforeafter
{
  "title": "Northwind Office Supplies: before and after Odoo CRM",
  "before": {
    "title": "Spreadsheets and inboxes",
    "points": [
      "Web enquiries wait for days in a shared mailbox",
      "Each salesperson keeps a private spreadsheet of deals",
      "The sales manager cannot see which deals are close to closing",
      "Finance has no revenue forecast to plan purchases",
      "Nobody knows why deals are lost",
      "Two salespeople call the same school"
    ]
  },
  "after": {
    "title": "One pipeline in Odoo CRM",
    "points": [
      "Email alias and website form create leads automatically for the right team",
      "Kanban pipeline per team shows every open deal and its stage",
      "Expected revenue x probability and closing dates feed the forecast",
      "Activities with due dates enforce follow-up; overdue ones turn red",
      "Lost reasons feed the Lost analysis",
      "Similar Leads and Merge remove duplicate effort"
    ]
  }
}
\`\`\`

## 3. Process flow

\`\`\`visual-flow
{
  "title": "Lead to order",
  "steps": [
    {
      "title": "Enquiry",
      "icon": "mail",
      "detail": "Web form, email or trade fair."
    },
    {
      "title": "Lead (unqualified)",
      "icon": "user",
      "app": "CRM",
      "branch": {
        "when": "Not qualified",
        "result": "Lost (reason) or archived",
        "tone": "danger"
      }
    },
    {
      "title": "Opportunity",
      "icon": "target",
      "app": "CRM",
      "detail": "Moves through the pipeline: New → Qualified → Proposition."
    },
    {
      "title": "New quotation",
      "icon": "file",
      "app": "Sales",
      "document": "Quotation (draft)"
    },
    {
      "title": "Sales order",
      "icon": "check",
      "app": "Sales",
      "detail": "Confirming the quotation updates the opportunity."
    },
    {
      "title": "Won",
      "icon": "flag",
      "app": "CRM",
      "branch": {
        "when": "Customer declines",
        "result": "Lost + reason",
        "tone": "danger"
      }
    }
  ]
}
\`\`\`

Key points about the flow:

- If the **Leads** setting is *off*, every enquiry lands directly in the pipeline as an opportunity. This suits small teams.
- If **Leads** is *on*, a qualification step exists: an inside-sales person checks the enquiry and clicks **Convert to Opportunity**.
- A quotation created from an opportunity stays linked to it; the opportunity shows a *Quotations* smart button.

## 4. Dependencies on other apps

| App | Dependency | Required? |
|---|---|---|
| Contacts | Customers (res.partner) linked to leads | Installed automatically |
| Discuss / Mail | Chatter, email gateway, activities | Installed automatically |
| Sales | New Quotation button on opportunities | Optional (needed for quotations) |
| Calendar | Scheduling meetings from opportunities | Installed with CRM |
| Website / Forms | Website contact form creating leads | Optional |
| Marketing apps (Email Marketing, Marketing Automation) | Campaign sources, nurturing | Optional; Marketing Automation is Enterprise |
| IAP credits | Lead enrichment and lead generation | Optional, paid credits |

> **Consultant tip:** In discovery workshops always ask "Where do your enquiries come from today?" The answer decides whether you need the Leads setting, email aliases, the website form or lead generation.

\`\`\`visual-hub
{
  "title": "Odoo CRM and its neighbours",
  "caption": "Contacts, Discuss and Calendar come with CRM; the other apps are optional.",
  "center": { "label": "CRM pipeline (crm.lead)", "icon": "target" },
  "nodes": [
    { "label": "Contacts", "icon": "users", "detail": "Customers (res.partner) linked to leads and opportunities. Installed automatically." },
    { "label": "Discuss / Mail", "icon": "mail", "detail": "Chatter, email gateway, email aliases and activities." },
    { "label": "Calendar", "icon": "calendar", "detail": "Meetings scheduled from the opportunity." },
    { "label": "Sales", "icon": "cart", "detail": "New Quotation button; confirmed orders count towards the won opportunity." },
    { "label": "Website forms", "icon": "globe", "detail": "Contact Us form creates leads for a sales team." },
    { "label": "Marketing apps", "icon": "rocket", "detail": "Email Marketing campaigns as lead sources; Marketing Automation (Enterprise) for nurturing." },
    { "label": "IAP credits", "icon": "coins", "detail": "Lead enrichment and lead generation; paid credits." }
  ]
}
\`\`\`

\`\`\`visual-order
{
  "title": "Lead to order at Northwind",
  "prompt": "Put the CRM steps in the order they happen when the Leads setting is on.",
  "items": [
    "Enquiry arrives by web form or the team email alias",
    "Lead is created and assigned to Inside Sales",
    "Inside Sales qualifies it and clicks Convert to Opportunity",
    "Opportunity moves through New, Qualified and Proposition",
    "Salesperson clicks New Quotation (Sales app)",
    "Customer accepts; the quotation is confirmed as a sales order",
    "Opportunity is marked Won"
  ],
  "explanation": "Qualification happens before the pipeline; the quotation is created from the opportunity so it stays linked, and Won closes the deal. A declined deal would instead be marked Lost with a reason."
}
\`\`\`

\`\`\`visual-check
{
  "question": "Northwind's finance team asks which journal entry CRM posts when an opportunity is marked Won. What is the correct answer?",
  "options": [
    "A receivable entry for the expected revenue",
    "A deferred revenue entry until the invoice is posted",
    "None: CRM posts no accounting entries; entries start with the invoice in Accounting",
    "A stock reservation entry in Inventory"
  ],
  "correct": 2,
  "explanation": "Expected revenue is only a forecast. CRM organises selling effort; accounting entries start when the customer invoice is posted, and stock moves start with the delivery."
}
\`\`\`

## Key takeaways

- CRM manages *selling effort*; it creates no accounting or stock entries.
- Leads and opportunities share one model; the Leads setting adds a qualification step.
- The pipeline (stages + expected revenue + probability) gives management visibility and forecasting.
- CRM hands over to Sales through quotations created from opportunities.`,
          flashcards: [
            { term: "Lead", definition: "An unqualified enquiry recorded in CRM before anyone has confirmed real buying interest. Available only when the Leads setting is enabled." },
            { term: "Opportunity", definition: "A qualified potential deal with expected revenue, probability and a pipeline stage." },
            { term: "Pipeline stage", definition: "A step of the sales process shown as a kanban column (e.g. New, Qualified, Proposition, Won)." },
            { term: "Lost reason", definition: "A configurable reason recorded when an opportunity is marked as lost, used for loss analysis." },
            { term: "Expected revenue", definition: "The estimated value of an opportunity; combined with probability to produce a weighted forecast." },
            { term: "Predictive lead scoring", definition: "Standard CRM feature that computes a probability of winning based on historical won/lost data." },
            { term: "Sales team", definition: "A group of salespeople with its own pipeline, team leader and optional email alias and invoicing target." },
          ],
          resources: [
            { title: "Odoo 17 CRM documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/crm.html" },
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
          ],
        },
      ],
    },
    {
      title: "Module 2: Setting up CRM",
      lessons: [
        {
          slug: "prerequisites-configuration-settings",
          title: "Prerequisites, configuration & settings",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 5. Prerequisites

Before configuring CRM for Northwind, collect the following from the business:

| Prerequisite | Why it matters | Owner |
|---|---|---|
| List of salespeople and managers | User creation and access rights | Sales Head |
| Sales teams and their leaders | Pipelines and reporting split | Sales Head |
| Sales stages and their meaning | Pipeline design | Sales Head + consultant |
| Lost reasons | Loss analysis | Sales Head |
| Enquiry sources (web, email, fairs, referrals) | Leads setting, aliases, UTM sources | Marketing |
| Existing customer and prospect list | Initial contact import | Sales Ops |
| Whether quotations are needed from CRM | Install Sales app | Project manager |

### Access rights

In **Settings ▸ Users & Companies ▸ Users**, open each user and set the **Sales** access level:

| Access level | Typical user at Northwind | Can see |
|---|---|---|
| User: Own Documents Only | Field salesperson | Their own leads/opportunities |
| User: All Documents | Inside sales coordinator | All leads/opportunities |
| Administrator | Sales Head | Everything + configuration |

> **Consultant tip:** CRM and Sales share the same "Sales" access-right category. Setting a user to "Own Documents Only" restricts both pipeline and quotations.

## 6. Configuration and settings

### Step 1 — Enable the Leads step

1. Go to **CRM ▸ Configuration ▸ Settings**.
2. Under the CRM section, tick **Leads**.
3. Click **Save**. A new **Leads** menu appears in CRM.

Northwind enables Leads because the Inside Sales team qualifies every web enquiry before passing it to Corporate Sales.

### Step 2 — Other useful settings (verify the exact labels in your training instance)

| Setting | Effect | Scope |
|---|---|---|
| Leads | Adds a qualification step before opportunities | Standard |
| Recurring Revenues | Track monthly/yearly recurring revenue on opportunities | Standard |
| Multi Teams | Allow a salesperson to belong to several teams | Standard |
| Rule-Based Assignment | Automatically assign leads to teams/salespeople by rules | Standard |
| Predictive Lead Scoring | Compute win probability from history; choose variables | Standard |
| Lead Enrichment | Enrich leads with company data from the email domain | Standard feature, consumes IAP credits |
| Lead Generation / Lead Mining | Generate new leads by criteria (industry, country, size) | Standard feature, consumes IAP credits |
| Visits to Leads | Create leads from website visitors | Needs Website; consumes IAP credits |

> **Consultant tip:** Anything that uses IAP (In-App Purchase) credits costs money per request. Always tell the client in writing and agree who buys the credits.

### Step 3 — Sales teams

1. Go to **CRM ▸ Configuration ▸ Sales Teams**.
2. Click **New**, enter **Corporate Sales**, set the **Team Leader**.
3. Add members (salespeople).
4. Optionally set an **email alias** (e.g. corporate@northwind.example) so that incoming emails create leads/opportunities for that team. This requires a configured mail domain (verify in your training instance).
5. Repeat for **Inside Sales**.

### Step 4 — Pipeline stages

Stages are managed from the pipeline kanban (click **+ Stage** / the column gear icon) or from **CRM ▸ Configuration ▸ Stages** (this menu may require developer mode — verify in your training instance).

Northwind's agreed pipeline:

| Sequence | Stage | Meaning | Is Won stage? |
|---|---|---|---|
| 1 | New | Qualified opportunity, not yet contacted | No |
| 2 | Qualified | Needs, budget and decision-maker confirmed | No |
| 3 | Proposition | Quotation sent | No |
| 4 | Negotiation | Pricing/terms under discussion | No |
| 5 | Won | Customer confirmed | Yes |

A stage can be limited to one sales team, can be **folded** in the kanban, and can carry **requirements** text shown as a tooltip.

### Step 5 — Lost reasons

**CRM ▸ Configuration ▸ Lost Reasons**: create *Too expensive*, *Chose competitor*, *No budget this year*, *Not responsive*, *Product not available*.

### Step 6 — Activity types

**CRM ▸ Configuration ▸ Activity Types** lets you define *Call*, *Meeting*, *Send price list* with default delays and chaining (e.g. after "Send price list" automatically suggest "Follow-up call" in 3 days).

### Step 7 — Tags

**CRM ▸ Configuration ▸ Tags**: *Education*, *Corporate*, *Co-working*, *Furniture*, *Consumables*. Tags drive filtering and reporting.

#### In Odoo 20: Lost reasons

\`\`\`visual-screen
{
  "src": "/visuals/odoo-crm/screens/crm-lost-reasons.webp",
  "alt": "Odoo 20 lost reasons list: Too expensive, We don't have people/skills, Not enough stock.",
  "title": "Lost reasons",
  "path": "CRM ▸ Configuration ▸ Lost Reasons",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 50.3,
      "y": 18.1,
      "w": 95.6,
      "h": 5,
      "tag": "right",
      "title": "A lost reason",
      "text": "Offered as a tag when marking an opportunity lost; feeds the lost-by-reason report."
    },
    {
      "x": 2.8,
      "y": 7.8,
      "w": 4.1,
      "h": 4.3,
      "tag": "bottom",
      "title": "Add your own",
      "text": "Agree the list with sales management: 5–8 clear reasons."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

## Key takeaways

- Gather teams, stages, lost reasons and lead sources before touching settings.
- The Leads setting is the single most important CRM design decision.
- Sales teams, stages, lost reasons, activity types and tags are pure configuration — no customization needed.
- IAP-based features are standard but consume paid credits.`,
          resources: [
            { title: "Odoo 17 CRM documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/crm.html" },
          ],
        },
      ],
    },
    {
      title: "Module 3: Working in CRM",
      lessons: [
        {
          slug: "master-data-and-transactions",
          title: "Master data & transactions",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 7. Master data

CRM relies on relatively little master data compared with Sales or Purchase. What exists must be clean, because duplicates destroy pipeline visibility.

| Master data | Where | Northwind example | Import template |
|---|---|---|---|
| Contacts (companies and persons) | Contacts app / CRM ▸ Sales ▸ Customers | Greenfield International School; Ms. Priya Nair (Admin Manager) | /api/templates/customers |
| Sales teams | CRM ▸ Configuration ▸ Sales Teams | Corporate Sales, Inside Sales | — |
| Stages | Pipeline kanban / Configuration | New ... Won | — |
| Lost reasons | CRM ▸ Configuration ▸ Lost Reasons | Too expensive | — |
| Tags | CRM ▸ Configuration ▸ Tags | Education | — |
| Activity types | CRM ▸ Configuration ▸ Activity Types | Call, Meeting | — |
| UTM campaigns / mediums / sources | Tracking fields on leads | Source: Trade Fair 2024 | — |

> **Consultant tip:** Import companies first, then their contact persons with the "Related Company" column filled. Importing persons first creates orphan contacts that are hard to merge later.

## 8. Transactions — step-by-step walkthroughs

### Walkthrough A — Capture a lead

Scenario: Ms. Priya Nair from Greenfield International School fills the website form asking for a yearly stationery supply for 1,200 students.

1. Go to **CRM ▸ Leads ▸ Leads** (visible because the Leads setting is enabled).
2. Click **New**.
3. Enter the title *Greenfield School – annual stationery*.
4. Fill **Company Name** Greenfield International School, **Contact Name** Priya Nair, email and phone.
5. Set **Sales Team** Inside Sales and **Salesperson**.
6. In the **Extra Info** tab note the **Source** (e.g. Website) and **Medium**.
7. Save. Notice the **Probability** computed by predictive lead scoring.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Add a new opportunity from the pipeline",
  "intro": "Contoso called: they want an annual paper contract worth about ₹2,50,000. Capture it in seconds with quick create.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The opportunity sits in the **New** column with its expected revenue, ready to be worked. Quick create is the fastest way to capture a sales signal while you are still on the phone.",
  "steps": [
    {
      "src": "/visuals/odoo-crm/sims/cfg-crm-opportunity-01.webp",
      "alt": "CRM pipeline kanban with the New button.",
      "path": "CRM ▸ Sales ▸ My Pipeline",
      "task": "**Add an opportunity** from the pipeline.",
      "target": {
        "x": 0.8500000000000001,
        "y": 5.95,
        "w": 4,
        "h": 4.2,
        "label": "New"
      },
      "explain": "A quick-create card opens at the top of the first column."
    },
    {
      "src": "/visuals/odoo-crm/sims/cfg-crm-opportunity-02.webp",
      "alt": "Quick-create card with the Organization/Contact dropdown showing Contoso Ltd.",
      "path": "CRM ▸ Pipeline ▸ Quick create",
      "task": "**Pick the customer** Contoso Ltd.",
      "target": {
        "x": 4.45,
        "y": 24.85,
        "w": 17.4,
        "h": 3.5,
        "label": "Contoso Ltd"
      },
      "explain": "Odoo proposes an opportunity name from the customer; you can overwrite it."
    },
    {
      "src": "/visuals/odoo-crm/sims/cfg-crm-opportunity-03.webp",
      "alt": "Quick-create card with the opportunity name field.",
      "path": "CRM ▸ Pipeline ▸ Quick create",
      "task": "Name it **Contoso annual paper contract**.",
      "target": {
        "x": 4.15,
        "y": 25.25,
        "w": 18.1,
        "h": 3.2,
        "label": "Opportunity"
      },
      "input": {
        "label": "Opportunity name",
        "answer": "Contoso annual paper contract",
        "placeholder": "what is being sold"
      },
      "explain": "A clear name (customer + what) makes the pipeline readable at a glance."
    },
    {
      "src": "/visuals/odoo-crm/sims/cfg-crm-opportunity-04.webp",
      "alt": "Quick-create card with the expected revenue field.",
      "path": "CRM ▸ Pipeline ▸ Quick create",
      "task": "Expected revenue is about **250000**. Enter it.",
      "target": {
        "x": 4.15,
        "y": 35.85,
        "w": 14.5,
        "h": 3.2,
        "label": "Expected revenue"
      },
      "input": {
        "label": "Expected revenue",
        "answer": "250000",
        "placeholder": "₹"
      },
      "explain": "Revenue × probability feeds the forecast from day one."
    },
    {
      "src": "/visuals/odoo-crm/sims/cfg-crm-opportunity-05.webp",
      "alt": "Filled quick-create card with the Add button.",
      "path": "CRM ▸ Pipeline ▸ Quick create",
      "task": "**Add the card** to the pipeline.",
      "target": {
        "x": 1.9500000000000002,
        "y": 39.45,
        "w": 3.9,
        "h": 4.2,
        "label": "Add"
      },
      "traps": [
        {
          "x": 5.85,
          "y": 39.45,
          "w": 3.7,
          "h": 4.2,
          "feedback": "**Edit** opens the full form. Fine for more detail, but quick capture only needs Add."
        }
      ],
      "explain": "The card is created in the **New** stage."
    },
    {
      "src": "/visuals/odoo-crm/sims/cfg-crm-opportunity-06.webp",
      "alt": "Pipeline with the new Contoso annual paper contract card in the New column.",
      "path": "CRM ▸ Sales ▸ My Pipeline",
      "task": "The opportunity is in the pipeline.",
      "explain": "Next: schedule an activity on the card so it never goes cold."
    }
  ]
}
\`\`\`

### Walkthrough B — Qualify and convert to an opportunity

1. Open the lead and log a call in the chatter (*Log note*) with the outcome: budget approx. INR 8 lakh, decision in 6 weeks.
2. Click **Convert to Opportunity**.
3. In the wizard choose:
   - **Conversion Action**: Convert to opportunity (or *Merge with existing opportunities* if duplicates are proposed).
   - **Salesperson / Sales Team**: hand over to Corporate Sales.
   - **Customer**: *Create a new customer*, *Link to an existing customer* or *Do not link to a customer*.
4. Click **Create Opportunity**. The record now appears in the pipeline in the first stage.

### Walkthrough C — Merge duplicates

Greenfield also emailed sales@ — a second lead was created.

1. Go to the list view of leads or opportunities and filter by the company name.
2. Select both records.
3. Click **Actions ▸ Merge**.
4. Review the result: the oldest/most advanced record is generally kept, and chatter history is combined (verify which record is kept in your training instance).

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Merge duplicate opportunities",
  "intro": "Harbour Hotels phoned **and** filled the website form: two opportunities for the same need.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "One opportunity remains with the combined history; the duplicate is gone. Pipeline value is no longer counted twice.",
  "steps": [
    {
      "src": "/visuals/odoo-crm/sims/crm-merge-01.webp",
      "alt": "Opportunity list filtered on Harbour showing two duplicates.",
      "path": "CRM ▸ Pipeline (list)",
      "task": "**Select the first** Harbour Hotels opportunity.",
      "target": {
        "x": 0.8500000000000001,
        "y": 17.45,
        "w": 1.5,
        "h": 2.1,
        "label": "the first checkbox"
      },
      "explain": "One selected."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-merge-02.webp",
      "alt": "Opportunity list with one row selected.",
      "path": "CRM ▸ Pipeline (list)",
      "task": "**Select the second** one too.",
      "target": {
        "x": 0.8500000000000001,
        "y": 21.95,
        "w": 1.5,
        "h": 2.1,
        "label": "the second checkbox"
      },
      "explain": "Two selected: the action bar appears."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-merge-03.webp",
      "alt": "Two selected opportunities with the Actions menu.",
      "path": "CRM ▸ Pipeline (list)",
      "task": "Merge is in the **Actions** menu. Open it.",
      "target": {
        "x": 58.05,
        "y": 5.95,
        "w": 6.6,
        "h": 4.2,
        "label": "Actions"
      },
      "explain": "The menu shows actions for the selected records."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-merge-04.webp",
      "alt": "Actions menu with Merge.",
      "path": "CRM ▸ Actions",
      "task": "**Choose Merge.**",
      "target": {
        "x": 58.35,
        "y": 33.55,
        "w": 15.1,
        "h": 3.5,
        "label": "Merge"
      },
      "explain": "The merge dialog shows both records and the one that will be kept."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-merge-05.webp",
      "alt": "Merge dialog listing both Harbour Hotels opportunities.",
      "path": "Merge",
      "task": "**Merge them.**",
      "target": {
        "x": 16.85,
        "y": 67.95,
        "w": 4.9,
        "h": 4.2,
        "label": "Merge"
      },
      "explain": "Odoo keeps the most advanced record and adds the other's details and chatter to it."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-merge-06.webp",
      "alt": "The merged Harbour Hotels opportunity.",
      "path": "CRM ▸ Opportunity",
      "task": "One opportunity remains.",
      "explain": "Check the chatter: the merge is logged with both histories."
    }
  ]
}
\`\`\`

### Walkthrough D — Work the pipeline

1. Go to **CRM ▸ Sales ▸ My Pipeline**.
2. Open the opportunity, set **Expected Revenue** 8,00,000 and **Expected Closing** date.
3. Schedule an activity: **Meeting**, due next Tuesday, *Product demo at school*.
4. After the meeting drag the card from **New** to **Qualified**.
5. Use the star (priority) widget to mark it as high priority.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Prioritise an opportunity and schedule the next step",
  "intro": "The Contoso paper contract is hot. Star it and book the product demo so it never goes cold.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The card shows the stars and a planned activity: the salesperson sees the demo in their activities and the opportunity is easy to spot.",
  "steps": [
    {
      "src": "/visuals/odoo-crm/sims/crm-activity-01.webp",
      "alt": "Pipeline with the Contoso annual paper contract card.",
      "path": "CRM ▸ Pipeline",
      "task": "**Open** *Contoso annual paper contract*.",
      "target": {
        "x": 0.8500000000000001,
        "y": 32.95,
        "w": 22.4,
        "h": 13.4,
        "label": "the Contoso card"
      },
      "explain": "The opportunity opens."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-activity-02.webp",
      "alt": "Opportunity form with the priority stars.",
      "path": "CRM ▸ Opportunity",
      "task": "Mark it **high priority**: click the **second** star.",
      "target": {
        "x": 58.25,
        "y": 39.85,
        "w": 1.7,
        "h": 2.4,
        "label": "the second star"
      },
      "explain": "Stars sort the pipeline and filter 'high priority' lists."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-activity-03.webp",
      "alt": "Opportunity with the Activity button in the chatter.",
      "path": "CRM ▸ Opportunity ▸ Chatter",
      "task": "**Schedule an activity** for the demo.",
      "target": {
        "x": 77.35,
        "y": 11.75,
        "w": 5.3,
        "h": 4.2,
        "label": "Activity"
      },
      "traps": [
        {
          "x": 71.55,
          "y": 11.75,
          "w": 5.9,
          "h": 4.2,
          "feedback": "A log note records what happened. You need a planned next step: an activity."
        }
      ],
      "explain": "The schedule-activity dialog opens."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-activity-04.webp",
      "alt": "Schedule Activity dialog with the summary field.",
      "path": "Schedule Activity",
      "task": "Summary: **Product demo**.",
      "target": {
        "x": 31.05,
        "y": 38.05,
        "w": 39.6,
        "h": 3.2,
        "label": "Summary"
      },
      "input": {
        "label": "Summary",
        "answer": "Product demo",
        "placeholder": "what will happen"
      },
      "explain": "The type, due date and assignee default from the activity type."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-activity-05.webp",
      "alt": "Schedule Activity dialog with the Schedule button.",
      "path": "Schedule Activity",
      "task": "**Schedule it.**",
      "target": {
        "x": 29.35,
        "y": 67.95,
        "w": 4.1,
        "h": 4.2,
        "label": "Schedule"
      },
      "explain": "The activity is planned on the opportunity."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-activity-06.webp",
      "alt": "Opportunity with the planned activity in the chatter.",
      "path": "CRM ▸ Opportunity",
      "task": "The next step is planned.",
      "explain": "Activities appear in the clock menu and the pipeline card turns red when overdue."
    }
  ]
}
\`\`\`

### Walkthrough E — Quotation from opportunity (requires Sales)

1. On the opportunity click **New Quotation**.
2. Odoo opens a quotation with the customer, salesperson and sales team pre-filled.
3. Add products (A4 paper 75 GSM, toner cartridges, whiteboard markers) and send it.
4. Move the opportunity to **Proposition**. The **Quotations** smart button shows the count.
5. When the customer confirms the quotation, the opportunity can be marked **Won**.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Work an opportunity through the pipeline and win it",
  "intro": "Greenfield International School asked for a yearly stationery supply. Budget: about ₹8 lakh.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The opportunity is **Won**: probability 100% and expected revenue ₹8,00,000. Pipeline and win/loss reports count it immediately.",
  "steps": [
    {
      "src": "/visuals/odoo-crm/sims/crm-win-01.webp",
      "alt": "CRM pipeline kanban with New, Qualified, Proposition and Won columns.",
      "path": "CRM ▸ Sales ▸ My Pipeline",
      "task": "**Open the opportunity** *Greenfield – annual stationery*.",
      "target": {
        "x": 0.8500000000000001,
        "y": 20.15,
        "w": 22.4,
        "h": 11.3,
        "label": "the Greenfield card"
      },
      "hint": "Each card is an opportunity; columns are stages.",
      "explain": "The opportunity form opens: customer, expected revenue, probability and the activity history."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-win-02.webp",
      "alt": "Greenfield opportunity form with expected revenue 0.",
      "path": "CRM ▸ Opportunity",
      "task": "After the first call the budget is clear: **8,00,000**. Enter the expected revenue.",
      "target": {
        "x": 2.55,
        "y": 29.85,
        "w": 14.3,
        "h": 3.6,
        "label": "Expected Revenue"
      },
      "input": {
        "label": "Expected Revenue",
        "answer": "800000",
        "placeholder": "₹"
      },
      "explain": "Expected revenue × probability feeds the forecast."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-win-03.webp",
      "alt": "Opportunity with the stage bar New, Qualified, Proposition, Won.",
      "path": "CRM ▸ Opportunity",
      "task": "The need and budget are confirmed. **Move it to Qualified.**",
      "target": {
        "x": 45.55,
        "y": 12.15,
        "w": 7,
        "h": 3.5,
        "label": "Qualified"
      },
      "traps": [
        {
          "x": 57.95,
          "y": 12.15,
          "w": 4.7,
          "h": 3.5,
          "feedback": "Not won yet: there is no quotation. Qualify it first."
        }
      ],
      "explain": "The stage changes, exactly as when you drag the card in the pipeline."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-win-04.webp",
      "alt": "Qualified opportunity with the New Quotation button.",
      "path": "CRM ▸ Opportunity",
      "task": "Prepare the offer. **Create a quotation** from the opportunity.",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 8.8,
        "h": 4.2,
        "label": "New Quotation"
      },
      "explain": "Odoo opens a quotation with the customer, salesperson and sales team already filled in, linked to the opportunity."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-win-05.webp",
      "alt": "New quotation pre-filled from the opportunity, with the breadcrumb back to it.",
      "path": "Sales ▸ Quotations",
      "task": "The salesperson adds the lines later. **Go back to the opportunity** with the breadcrumb.",
      "target": {
        "x": 7.45,
        "y": 5.75,
        "w": 12.4,
        "h": 2.4,
        "label": "the opportunity breadcrumb"
      },
      "explain": "Back on the opportunity. An empty quotation is not kept: the salesperson saves it once the products are added, and the **Quotations** smart button then counts it."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-win-06.webp",
      "alt": "Opportunity with the Won and Lost buttons.",
      "path": "CRM ▸ Opportunity",
      "task": "Greenfield signed the quotation. **Mark the opportunity as won.**",
      "target": {
        "x": 9.45,
        "y": 11.75,
        "w": 4.1,
        "h": 4.2,
        "label": "Won"
      },
      "traps": [
        {
          "x": 13.25,
          "y": 11.75,
          "w": 3.9,
          "h": 4.2,
          "feedback": "The customer signed: this is a win, not a loss."
        }
      ],
      "explain": "Probability becomes 100% and the opportunity moves to the Won stage."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-win-07.webp",
      "alt": "Opportunity with the green Won ribbon.",
      "path": "CRM ▸ Opportunity",
      "task": "The opportunity is won.",
      "explain": "A **Won** ribbon marks it; win/loss and pipeline reports update immediately."
    }
  ]
}
\`\`\`

### Walkthrough F — Mark as Won or Lost

- **Won**: click **Won**. Probability becomes 100% and the record moves to the Won stage.
- **Lost**: click **Lost**, choose a **Lost Reason** (e.g. *Chose competitor*) and add closing notes. The record is archived with probability 0%. Lost records can be found with the **Lost** filter and **restored**.

| Action | Probability | Active? | Stage |
|---|---|---|---|
| Won | 100% | Yes | Won stage |
| Lost | 0% | Archived | Unchanged |
| Restore | Recomputed | Yes | Unchanged |

> **Consultant tip:** Make lost reasons mandatory through process discipline and reporting reviews. If the client insists on a hard validation, that is a customization (or an automation/Studio rule on Enterprise) — label it as such in the gap list.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Mark an opportunity as lost, with a reason",
  "intro": "Riverside College chose a cheaper competitor for its classroom furniture.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The opportunity is archived as **Lost** with probability 0% and the reason *Too expensive*. Use the **Lost** filter to find it, or **Restore** it if the customer comes back.",
  "steps": [
    {
      "src": "/visuals/odoo-crm/sims/crm-lost-01.webp",
      "alt": "CRM pipeline kanban.",
      "path": "CRM ▸ Sales ▸ My Pipeline",
      "task": "**Open** *Riverside – classroom furniture*.",
      "target": {
        "x": 25.05,
        "y": 20.15,
        "w": 22.4,
        "h": 13.4,
        "label": "the Riverside card"
      },
      "explain": "The opportunity form opens."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-lost-02.webp",
      "alt": "Riverside opportunity with the Won and Lost buttons.",
      "path": "CRM ▸ Opportunity",
      "task": "Riverside went with a competitor. **Mark the opportunity as lost.**",
      "target": {
        "x": 13.25,
        "y": 11.75,
        "w": 3.9,
        "h": 4.2,
        "label": "Lost"
      },
      "traps": [
        {
          "x": 9.45,
          "y": 11.75,
          "w": 4.1,
          "h": 4.2,
          "feedback": "They chose a competitor: that is a loss."
        }
      ],
      "explain": "Odoo asks for the reason."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-lost-03.webp",
      "alt": "Mark Lost dialog with the lost reasons Too expensive, We don't have people/skills and Not enough stock.",
      "path": "Mark Lost",
      "task": "The competitor was cheaper. **Choose the reason.**",
      "target": {
        "x": 30.05,
        "y": 43.55,
        "w": 6.3,
        "h": 2.4,
        "label": "Too expensive"
      },
      "traps": [
        {
          "x": 50.15,
          "y": 43.55,
          "w": 7.8,
          "h": 2.4,
          "feedback": "Stock was not the problem: Riverside said the price was too high."
        }
      ],
      "explain": "Lost reasons feed the *lost by reason* analysis. Never leave them empty."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-lost-04.webp",
      "alt": "Mark Lost dialog with the reason Too expensive.",
      "path": "Mark Lost",
      "task": "**Confirm the loss.**",
      "target": {
        "x": 29.35,
        "y": 59.45,
        "w": 7.6,
        "h": 4.2,
        "label": "Mark as Lost"
      },
      "explain": "The opportunity is archived with probability 0%."
    },
    {
      "src": "/visuals/odoo-crm/sims/crm-lost-05.webp",
      "alt": "Opportunity with the red Lost ribbon.",
      "path": "CRM ▸ Opportunity",
      "task": "The opportunity is lost.",
      "explain": "A **Lost** ribbon marks it. It disappears from the pipeline but stays searchable with the *Lost* filter."
    }
  ]
}
\`\`\`

## Key takeaways

- Clean contacts are the most important CRM master data.
- Convert to Opportunity changes the record type; it can also link or create the customer and merge duplicates.
- Expected revenue, closing date and activities make the pipeline meaningful.
- New Quotation needs the Sales app; Won/Lost close the opportunity lifecycle.`,
          resources: [
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
            { title: "Odoo 17 CRM documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/crm.html" },
          ],
        },
        {
          slug: "automation-reports-impact",
          title: "Automation, reports & impact",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise", "customization"],
          body: `## 9. Approval rules and automation

CRM has **no built-in approval workflow** (unlike Purchase order approval). Automation is achieved through:

| Mechanism | What it does | Scope |
|---|---|---|
| Rule-based assignment | Distributes leads to teams/salespeople based on domains (e.g. country = India, tag = Education) at a set frequency | Standard (setting) |
| Predictive lead scoring | Computes probability based on chosen variables (stage, country, source, tags...) and historical won/lost records | Standard |
| Activity types with chaining | Suggests or triggers the next activity automatically | Standard |
| Email alias per sales team | Incoming emails create leads/opportunities | Standard (requires mail configuration) |
| Automation rules (Settings ▸ Technical, developer mode) | E.g. when stage = Proposition and no activity, create a reminder | Standard in 17 via the base_automation module — verify installation in your training instance |
| Studio | No-code fields, views, approval buttons | Enterprise |
| Approvals app | Generic approval requests | Enterprise; not linked to CRM out of the box |
| Custom module | Hard validations (e.g. block Won without quotation) | Customization |

### Predictive lead scoring — how it works

1. Enable **Predictive Lead Scoring** in CRM settings.
2. Choose the variables to use (verify available variables in your instance — typically stage, country, state, phone/email quality, source, language, tags).
3. Set the start date from which historical leads are considered.
4. Odoo computes probability from the frequency of won vs lost leads with similar values. Moving stages also updates the probability.
5. A salesperson can override the probability manually; the field then stops updating automatically until reset.

> **Consultant tip:** Predictive scoring is only as good as history. A new implementation with no won/lost data will show weak probabilities for several months. Set expectations early.

## 10. Reports and dashboards

| Report | Menu (verify in your instance) | Typical use |
|---|---|---|
| Pipeline analysis | CRM ▸ Reporting ▸ Pipeline | Expected revenue by stage, team, salesperson |
| Forecast | CRM ▸ Reporting ▸ Forecast | Expected revenue grouped by expected closing month |
| Activities | CRM ▸ Reporting ▸ Activities | Calls/meetings done per salesperson |
| Lost analysis | Pipeline report filtered on Lost, grouped by Lost Reason | Why deals are lost |
| Sales team dashboard | CRM ▸ Configuration ▸ Sales Teams / Sales dashboard | Team-level overview and invoicing target |

All reports offer **graph, pivot and list** views. Use the pivot to build "Expected revenue by Salesperson × Stage" and export to spreadsheet. On Enterprise, pivots can be inserted into **Odoo Spreadsheet / Dashboards**.

### Northwind KPI examples

| KPI | Formula |
|---|---|
| Win rate | Won opportunities ÷ (Won + Lost) in a period |
| Weighted pipeline | Σ (Expected revenue × Probability) |
| Average deal size | Σ won expected revenue ÷ count won |
| Lead response time | Time from lead creation to first activity (needs report customization or export) |

## 11. Accounting and inventory impact

- **Accounting:** none. CRM posts no journal entries. Expected revenue is a *forecast*, not revenue.
- **Inventory:** none. No reservations or moves.
- Impact starts only when the quotation becomes a **sales order** (Sales app), then a delivery (Inventory) and an invoice (Accounting).

## 12. Integration with other apps

| App | Integration point |
|---|---|
| Sales | New Quotation from opportunity, quotations smart button, sales team shared |
| Calendar | Meetings scheduled from the opportunity |
| Website | Contact form creates leads; visitor tracking (IAP) |
| Email Marketing | Mass mailings to leads; UTM tracking |
| Marketing Automation (Enterprise) | Nurturing workflows based on lead fields |
| VoIP (Enterprise) | Call leads from the record |
| Helpdesk / Field Service | Different apps but share contacts; some flows can create opportunities (verify per app) |

#### In Odoo 20: Pipeline analysis

\`\`\`visual-screen
{
  "src": "/visuals/odoo-crm/screens/crm-pipeline-analysis.webp",
  "alt": "Odoo 20 CRM pipeline analysis report with the Measures menu, filters and view switcher.",
  "title": "Pipeline analysis",
  "path": "CRM ▸ Reporting ▸ Pipeline",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 49.5,
      "y": 8.1,
      "w": 31.8,
      "h": 4.7,
      "tag": "bottom",
      "title": "Filters",
      "text": "Narrow the analysis: my pipeline, a sales team, a period."
    },
    {
      "x": 95,
      "y": 8.1,
      "w": 2.8,
      "h": 3.6,
      "tag": "top",
      "title": "The chart",
      "text": "Opportunities grouped by stage: where the pipeline gets stuck."
    },
    {
      "x": 95,
      "y": 8.1,
      "w": 8.4,
      "h": 4.7,
      "tag": "bottom",
      "title": "Views",
      "text": "Switch to pivot for numbers, list for the records."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

## Key takeaways

- CRM automation = assignment rules, predictive scoring, activities, aliases and automation rules; approvals are not native.
- Pipeline and Forecast reports drive the weekly sales review.
- CRM has zero accounting and inventory impact.
- Integration with Sales is the most important link.`,
          resources: [
            { title: "Odoo 17 CRM documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/crm.html" },
          ],
        },
      ],
    },
    {
      title: "Module 4: Consultant readiness",
      lessons: [
        {
          slug: "troubleshooting-practice-interview",
          title: "Troubleshooting, practice & interview prep",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 13. Common errors and troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| No "Leads" menu in CRM | Leads setting disabled | CRM ▸ Configuration ▸ Settings ▸ tick Leads |
| "New Quotation" button missing | Sales app not installed or user lacks Sales rights | Install Sales; check access rights |
| Salesperson cannot see colleague's opportunities | Access level "Own Documents Only" | Change to "All Documents" if business agrees |
| Lost opportunity "disappeared" | Lost records are archived | Use the Lost / Archived filter; Restore if needed |
| Probability not changing when stage moves | Probability was manually overridden | Reset to automatic probability (click the recompute icon next to probability — verify in your instance) |
| Emails to team alias not creating leads | Alias domain / incoming mail server not configured | Check Settings ▸ General Settings (alias domain) and incoming mail configuration |
| Enrichment does nothing | No IAP credits or generic email domain (gmail.com) | Buy credits; enrichment needs a company domain |
| Stage visible to wrong team | Stage not restricted to a sales team | Set the stage's Sales Team field |
| Duplicates keep appearing | Different emails/company names; no process | Use Similar Leads smart button, merge, train users |
| Forecast shows nothing | Expected closing dates empty | Make expected closing date part of the qualification checklist |

> **Consultant tip:** When a user says "my data is gone", check three things in order: filters on the view, archived/lost records, and access rights. 90% of CRM "bugs" are one of these.

\`\`\`visual-decision
{
  "title": "'My opportunity is gone' — triage",
  "caption": "Follow the consultant tip: filters, then archived or lost records, then access rights.",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is a default filter (e.g. My Pipeline) active on the view?", "options": [ { "label": "Yes", "next": "r1" }, { "label": "No", "next": "q2" } ] },
    "r1": { "result": "Remove the filter and search again", "tone": "success", "detail": "My Pipeline only shows records where the user is the salesperson. Most 'missing' records reappear here." },
    "q2": { "question": "Does it appear with the Lost or Archived filter?", "options": [ { "label": "Yes", "next": "r2" }, { "label": "No", "next": "q3" } ] },
    "r2": { "result": "It was marked lost (archived): Restore it if the deal is still alive", "tone": "info", "detail": "Lost opportunities are archived, so they disappear from the pipeline but are not deleted." },
    "q3": { "question": "Is the user's Sales access level 'Own Documents Only'?", "options": [ { "label": "Yes", "next": "r3" }, { "label": "No", "next": "r4" } ] },
    "r3": { "result": "Access rights hide colleagues' records", "tone": "warning", "detail": "Change to All Documents only if the business agrees; otherwise reassign the opportunity." },
    "r4": { "result": "Check the chatter and audit log on a copy, or whether it was merged", "tone": "danger", "detail": "Merging keeps one record and removes the others; the surviving record's chatter shows the merge." }
  }
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Emails to the team alias do not create leads",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is an alias domain set in Settings ▸ General Settings?", "options": [ { "label": "No", "next": "r1" }, { "label": "Yes", "next": "q2" } ] },
    "r1": { "result": "Configure the alias domain first", "tone": "warning", "detail": "Without it, the sales team alias has no full email address to receive mail." },
    "q2": { "question": "Is incoming mail working (Odoo Online, or an incoming mail server / MX forwarding on-premise)?", "options": [ { "label": "No", "next": "r2" }, { "label": "Yes", "next": "q3" } ] },
    "r2": { "result": "Fix the incoming mail server or DNS forwarding", "tone": "danger", "detail": "Odoo never receives the email, so nothing can be created." },
    "q3": { "question": "Is the email alias set on the correct sales team?", "options": [ { "label": "No", "next": "r3" }, { "label": "Yes", "next": "r4" } ] },
    "r3": { "result": "Set the alias on the sales team", "tone": "warning", "detail": "Each team alias creates leads or opportunities for that team." },
    "r4": { "result": "Check the alias security (who may send) and the mail logs", "tone": "info", "detail": "An alias restricted to followers or authenticated partners rejects emails from new senders." }
  }
}
\`\`\`

\`\`\`visual-match
{
  "title": "CRM symptoms and root causes",
  "prompt": "Match each symptom to its most likely root cause.",
  "leftLabel": "Symptom",
  "rightLabel": "Root cause",
  "pairs": [
    { "left": "No Leads menu in CRM", "right": "The Leads setting is disabled" },
    { "left": "New Quotation button missing", "right": "Sales app not installed or user lacks Sales rights" },
    { "left": "Probability does not change when the stage moves", "right": "Probability was manually overridden" },
    { "left": "Enrichment does nothing", "right": "No IAP credits or a generic email domain such as gmail.com" },
    { "left": "Forecast view is empty", "right": "Expected closing dates are not filled" },
    { "left": "A stage appears in the wrong team's pipeline", "right": "The stage is not restricted to a sales team" }
  ],
  "explanation": "Almost every CRM 'bug' is a setting, an empty field, a filter or an access right. Check those before suspecting the software."
}
\`\`\`

\`\`\`visual-check
{
  "question": "A Northwind salesperson says the probability on her opportunity stays at 60% whatever stage she moves it to. What is the most likely cause?",
  "options": [
    "Predictive lead scoring is not installed",
    "The probability was typed in manually, which stops the automatic update",
    "The stage is folded in the kanban",
    "The opportunity has no customer"
  ],
  "correct": 1,
  "explanation": "A manual probability overrides the automatic computation. Resetting it to automatic lets stage changes and lead scoring update it again."
}
\`\`\`

## 14. Practical assignments

### Practice 1 — Configuration
- [ ] Enable Leads and Predictive Lead Scoring
- [ ] Create sales teams Corporate Sales and Inside Sales with two members each
- [ ] Create the five Northwind stages and set Won as a won stage
- [ ] Create five lost reasons and five tags

### Practice 2 — Lead lifecycle
- [ ] Create three leads from different sources (Website, Trade Fair, Referral)
- [ ] Create a deliberate duplicate and merge it
- [ ] Convert two leads to opportunities, linking one to an existing customer and creating a new customer for the other
- [ ] Mark the third lead as lost with reason *Not responsive*

### Practice 3 — Pipeline and reporting
- [ ] Add expected revenue and closing dates to all opportunities
- [ ] Create a quotation from one opportunity and confirm it; mark the opportunity Won
- [ ] Build a pivot: Expected revenue by Salesperson (rows) × Stage (columns)
- [ ] Export the Lost analysis grouped by Lost Reason

## 15. Interview questions with model answers

**Q1. What is the difference between a lead and an opportunity in Odoo?**
Both are records of crm.lead. A lead is an unqualified enquiry and exists only when the Leads setting is enabled. An opportunity is qualified, has a stage in the pipeline, expected revenue and probability. Converting changes the type, assigns a team/salesperson and optionally links or creates a customer.

**Q2. When would you recommend disabling Leads?**
For small teams where every enquiry is handled by the same salesperson and no qualification step exists. It reduces clicks; enquiries go straight into the pipeline.

**Q3. How does predictive lead scoring work?**
It uses historical won and lost leads, from a configurable start date, and the selected variables to calculate the probability of winning. Manual overrides stop the automatic update.

**Q4. A client wants lost reasons to be mandatory. How do you handle it?**
The Lost wizard already proposes a reason; enforcing it strictly is a gap. Options: process + reporting control, an automation rule, Studio on Enterprise, or a small custom module. Document it as configuration vs customization in the fit-gap.

**Q5. Does CRM create accounting entries?**
No. Expected revenue is a forecast. Entries start with the invoice in Accounting (and stock valuation entries with deliveries if automated valuation is used).

**Q6. How do you migrate an existing pipeline into Odoo?**
Import contacts first (companies then persons), then import opportunities with external IDs, stage names, salesperson, team, expected revenue and closing dates. Test on a copy database and reconcile counts and totals per stage.

**Q7. How do you get leads from a shared mailbox?**
Configure an alias domain and incoming mail, then set an email alias on the sales team. Each incoming email creates a lead/opportunity for that team.

\`\`\`visual-roleplay
{
  "title": "Hypercare call with Northwind's sales manager",
  "setting": "Two weeks after go-live, Northwind Office Supplies' sales manager calls you with a list of CRM complaints.",
  "client": "Sales manager",
  "rounds": [
    {
      "says": "Leads from the website go to the wrong salesperson. School enquiries should go to Corporate Sales but Inside Sales gets them.",
      "options": [
        { "text": "Let me check which sales team the website form and the email alias point to, and the assignment rules (team and member domains) that decide who gets each lead.", "quality": "best", "feedback": "Assignment is configuration: the form or alias sets the team, and rule-based assignment uses domains per team and member. Check those before anything else." },
        { "text": "I'll write a small module that routes leads by keyword.", "quality": "poor", "feedback": "Jumping to customisation before checking standard assignment rules adds cost and upgrade risk." },
        { "text": "Ask the salespeople to reassign the leads manually each morning.", "quality": "ok", "feedback": "A workaround, not a fix. Fine for a day, but it brings back the delays CRM was meant to remove." }
      ]
    },
    {
      "says": "One of my reps says an opportunity worth 12 lakh has disappeared from Odoo.",
      "options": [
        { "text": "Odoo must have deleted it; I'll raise a ticket with Odoo support.", "quality": "poor", "feedback": "Lost and filtered records are not deleted. Escalating without checking wastes time and credibility." },
        { "text": "Let's check the filters on her view, then the Lost and Archived filter, then her access rights.", "quality": "best", "feedback": "This is the standard triage order. Most 'missing' records are hidden by a filter, archived as lost or invisible because of Own Documents Only." },
        { "text": "Let's restore last night's backup.", "quality": "poor", "feedback": "Restoring a backup loses a day of everyone's work for a record that is almost certainly still there." }
      ]
    },
    {
      "says": "The probability on our big deals never changes when we move them forward. Is lead scoring broken?",
      "options": [
        { "text": "Probably someone typed the probability manually. A manual value stops the automatic update; we can reset it to automatic.", "quality": "best", "feedback": "Correct root cause, and it teaches the team why the manual override behaves this way." },
        { "text": "Lead scoring needs a year of data before it works.", "quality": "ok", "feedback": "History does affect the quality of scores, but it does not explain probabilities that never move at all." },
        { "text": "Yes, I'll disable predictive lead scoring.", "quality": "poor", "feedback": "Turning off a feature hides the symptom and removes useful forecasting." }
      ]
    },
    {
      "says": "Finance says the forecast view is empty, but we have forty open opportunities.",
      "options": [
        { "text": "The forecast groups by expected closing date. If that field is empty the deals do not show. Let's make the closing date part of qualification.", "quality": "best", "feedback": "Fixes the data and the process, so the forecast stays reliable." },
        { "text": "The forecast only works in Enterprise.", "quality": "poor", "feedback": "Wrong reason; the empty view is a data problem, not an edition problem." },
        { "text": "I'll export the pipeline to Excel for finance every week.", "quality": "ok", "feedback": "Gives finance numbers short term, but the missing dates remain and the spreadsheet habit returns." }
      ]
    },
    {
      "says": "Can we make lost reasons mandatory? Reps just close deals without saying why.",
      "options": [
        { "text": "Sure, I'll change the code today.", "quality": "poor", "feedback": "Untracked code changes become scope creep and an untested customisation." },
        { "text": "Strict enforcement is a gap. Options are process plus a weekly Lost analysis check, an automation rule, Studio on Enterprise or a small module. Let's log it in the fit-gap with the cost of each.", "quality": "best", "feedback": "Honest about standard versus customisation and gives the client a costed choice." },
        { "text": "It is already mandatory in standard Odoo.", "quality": "poor", "feedback": "The Lost wizard proposes a reason but strict enforcement is not standard. Wrong facts damage trust." }
      ]
    }
  ],
  "wrapup": "Triage in order: settings, filters, archived records, access rights, data quality. Only then discuss customisation, and log it in the fit-gap."
}
\`\`\`

## Key takeaways

- Most CRM issues are settings, filters, archives or access rights.
- Practise the full lifecycle: lead → opportunity → quotation → won/lost.
- In interviews, connect features to business problems and say clearly what is standard vs customization.`,
          resources: [
            { title: "Odoo 17 CRM documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/crm.html" },
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
          ],
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-crm-final",
    title: "Odoo CRM – Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "In Odoo 17, leads and opportunities are stored in which model?",
        kind: "single",
        options: ["crm.lead for both", "crm.lead and crm.opportunity", "sale.order", "res.partner"],
        correct: [0],
        explanation: "Leads and opportunities are both crm.lead records; a type field distinguishes them.",
      },
      {
        prompt: "What must be enabled to get a separate Leads menu and qualification step?",
        kind: "single",
        options: ["Multi Teams", "The Leads option in CRM settings", "Predictive Lead Scoring", "Recurring Revenues"],
        correct: [1],
        explanation: "The Leads setting under CRM ▸ Configuration ▸ Settings adds leads as a separate step before opportunities.",
      },
      {
        prompt: "CRM posts journal entries when an opportunity is marked as Won.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "CRM has no accounting impact. Entries are created by invoices (and stock valuation where applicable).",
      },
      {
        prompt: "Which app must be installed for the New Quotation button to appear on an opportunity?",
        kind: "single",
        options: ["Inventory", "Accounting", "Sales", "Website"],
        correct: [2],
        explanation: "Quotations are sale.order records provided by the Sales app.",
      },
      {
        prompt: "What happens to an opportunity marked as Lost?",
        kind: "single",
        options: ["It is deleted", "It is archived with probability 0% and can be restored", "It moves to the Won stage", "It is converted back to a lead"],
        correct: [1],
        explanation: "Lost opportunities are archived (inactive) with a lost reason and can be found with filters and restored.",
      },
      {
        prompt: "Which features consume IAP credits? (Select all that apply)",
        kind: "multiple",
        options: ["Lead enrichment", "Lead generation / lead mining", "Creating a sales team", "Moving a card between stages"],
        correct: [0, 1],
        explanation: "Enrichment and generation call Odoo IAP services, which are credit-based. Configuration actions are free.",
      },
      {
        prompt: "Predictive lead scoring in Odoo 17 is an Enterprise-only feature.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Predictive lead scoring is a standard CRM feature.",
      },
      {
        prompt: "A salesperson manually changed the probability. What happens when the stage changes?",
        kind: "single",
        options: ["Probability is always recalculated", "The manual probability is kept until reset to automatic", "The opportunity is locked", "An error appears"],
        correct: [1],
        explanation: "Manually set probabilities are no longer automatically updated until the user resets them.",
      },
      {
        prompt: "Which report groups expected revenue by expected closing month?",
        kind: "single",
        options: ["Forecast", "Activities", "Lost Reasons", "Invoice Analysis"],
        correct: [0],
        explanation: "The Forecast view groups opportunities by expected closing date to project revenue.",
      },
      {
        prompt: "Which are valid ways to automatically create leads? (Select all that apply)",
        kind: "multiple",
        options: ["Email alias on a sales team", "Website contact form", "Confirming a vendor bill", "Lead generation (IAP)"],
        correct: [0, 1, 3],
        explanation: "Aliases, website forms and lead generation create leads. Vendor bills belong to Accounting/Purchase.",
      },
      {
        prompt: "A user complains they only see their own opportunities. What is the most likely cause?",
        kind: "single",
        options: ["Leads setting disabled", "Sales access level 'User: Own Documents Only'", "No lost reasons configured", "Missing IAP credits"],
        correct: [1],
        explanation: "The Own Documents Only access level restricts visibility to records assigned to the user.",
      },
      {
        prompt: "When importing an existing pipeline, what should be imported first?",
        kind: "single",
        options: ["Opportunities", "Activities", "Contacts (companies, then persons)", "Lost reasons only"],
        correct: [2],
        explanation: "Opportunities reference customers, so contacts must exist first; companies before persons keeps the hierarchy clean.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-crm-assignment-1",
      title: "Configure CRM for Northwind Office Supplies",
      instructions: `## Scenario

Northwind Office Supplies Pvt Ltd wants to replace spreadsheets with Odoo CRM. Inside Sales qualifies web and email enquiries; Corporate Sales handles qualified deals above INR 3 lakh.

## Tasks

1. Enable Leads and Predictive Lead Scoring.
2. Create sales teams Corporate Sales and Inside Sales (with leaders and members).
3. Configure the pipeline stages New, Qualified, Proposition, Negotiation, Won.
4. Configure five lost reasons and five tags.
5. Create six leads (two per source: Website, Trade Fair, Referral), including one duplicate.
6. Merge the duplicate, convert four leads to opportunities and mark one as lost.
7. Create a quotation from one opportunity, confirm it and mark the opportunity Won.

## Deliverables

- A configuration workbook (table of settings, teams, stages, reasons, tags) — 1–2 pages.
- Screenshots of the pipeline kanban and the Pipeline pivot (Salesperson × Stage).
- A short note (max 300 words) listing any requirement that would need customization or Enterprise features.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Correct settings and master configuration | 30% |
| Complete lead lifecycle executed (merge, convert, lost, won) | 30% |
| Report screenshots and accuracy of figures | 20% |
| Clear distinction of standard vs Enterprise vs customization | 20% |`,
    },
  ],
};
