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
          body: `## 1. Application overview

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

### Walkthrough D — Work the pipeline

1. Go to **CRM ▸ Sales ▸ My Pipeline**.
2. Open the opportunity, set **Expected Revenue** 8,00,000 and **Expected Closing** date.
3. Schedule an activity: **Meeting**, due next Tuesday, *Product demo at school*.
4. After the meeting drag the card from **New** to **Qualified**.
5. Use the star (priority) widget to mark it as high priority.

### Walkthrough E — Quotation from opportunity (requires Sales)

1. On the opportunity click **New Quotation**.
2. Odoo opens a quotation with the customer, salesperson and sales team pre-filled.
3. Add products (A4 paper 75 GSM, toner cartridges, whiteboard markers) and send it.
4. Move the opportunity to **Proposition**. The **Quotations** smart button shows the count.
5. When the customer confirms the quotation, the opportunity can be marked **Won**.

### Walkthrough F — Mark as Won or Lost

- **Won**: click **Won**. Probability becomes 100% and the record moves to the Won stage.
- **Lost**: click **Lost**, choose a **Lost Reason** (e.g. *Chose competitor*) and add closing notes. The record is archived with probability 0%. Lost records can be found with the **Lost** filter and **restored**.

| Action | Probability | Active? | Stage |
|---|---|---|---|
| Won | 100% | Yes | Won stage |
| Lost | 0% | Archived | Unchanged |
| Restore | Recomputed | Yes | Unchanged |

> **Consultant tip:** Make lost reasons mandatory through process discipline and reporting reviews. If the client insists on a hard validation, that is a customization (or an automation/Studio rule on Enterprise) — label it as such in the gap list.

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
