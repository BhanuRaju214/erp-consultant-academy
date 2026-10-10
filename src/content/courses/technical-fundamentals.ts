import type { CourseContent } from "../types";

/**
 * Odoo Technical Fundamentals (Technical Lab, course 1).
 *
 * All practical lessons build one consistent training module,
 * `academy_sale_extension`, for the fictional company "Sunrise Office Supplies".
 * Code targets Odoo 17.0; differences for 18.0 are called out inline.
 */

const DOC_DEV = "https://www.odoo.com/documentation/17.0/developer.html";

export const technicalFundamentals: CourseContent = {
  slug: "odoo-technical-fundamentals",
  section: "technical-lab",
  title: "Odoo Technical Fundamentals",
  summary:
    "Learn how Odoo works under the hood and build a real custom module step by step: models, fields, views, security, business logic, scheduled actions, QWeb reports, debugging and automated tests. Every practical lesson extends the same training module, academy_sale_extension, for the fictional company Sunrise Office Supplies.",
  level: "intermediate",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 notes)",
  position: 1,
  skills: [
    "Odoo architecture",
    "Python for Odoo",
    "PostgreSQL (read-only analysis)",
    "Git workflow",
    "Module development",
    "ORM models and fields",
    "XML views and inheritance",
    "Access rights and record rules",
    "Business logic overrides",
    "Scheduled and automated actions",
    "QWeb PDF reports",
    "Debugging and logging",
    "Automated testing",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    /* Module 1: Technical foundations                                     */
    /* ------------------------------------------------------------------ */
    {
      title: "Technical foundations",
      lessons: [
        {
          slug: "odoo-architecture",
          title: "Odoo architecture: server, ORM, database and modules",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## Why a functional consultant needs to understand the architecture

Sunrise Office Supplies has asked for "a small change on the quotation screen". Before you promise anything you must know *where* that change lives: is it configuration, a Studio tweak, or a custom module? Will it survive an upgrade? Who can see the data? Every one of those answers depends on how Odoo is built. A techno-functional consultant does not need to be a senior developer, but must be able to read a module, explain the impact of a change and talk to developers in their language.

## The big picture

Odoo is a **three-tier application**:

| Tier | Component | What it does |
|------|-----------|--------------|
| Presentation | Web client (JavaScript, OWL framework) | Renders views (form, list, kanban...), sends RPC calls to the server |
| Application | Odoo server (Python) | Runs the ORM, business logic, security checks, reports, scheduled jobs, HTTP controllers |
| Data | PostgreSQL | Stores every record, plus metadata (models, fields, views, menus, access rights) |

The browser never talks to PostgreSQL directly. Every read and write goes through the server, which applies **access rights, record rules and business logic** first. That is why writing directly into the database is dangerous: you bypass all of it.

### The Odoo server

The server is a Python process started with \`odoo-bin\`. It reads a configuration file (usually \`odoo.conf\`) that tells it:

- which PostgreSQL server and user to use,
- where to find modules (the **addons path**),
- which HTTP port to listen on,
- logging level, workers, memory limits and so on.

\`\`\`ini
[options]
addons_path = /opt/odoo/odoo/addons,/opt/odoo/custom-addons
db_host = localhost
db_port = 5432
db_user = odoo
http_port = 8069
log_level = info
\`\`\`

### The ORM (Object-Relational Mapper)

Developers rarely write SQL. They declare **models** as Python classes, and the ORM creates the tables, columns and constraints, and translates method calls such as \`search\`, \`create\`, \`write\` and \`unlink\` into SQL. A model named \`sale.order\` is stored in the table \`sale_order\`; a model named \`academy.delivery.window\` becomes \`academy_delivery_window\`.

The ORM also handles:

- **Access control** - checks the user's groups before reading or writing.
- **Computed fields** - recalculates values when their dependencies change.
- **Inheritance** - lets a module add fields or change methods of a model defined in another module.
- **Multi-company and translations** - transparently.

### PostgreSQL

All business data and most configuration lives in PostgreSQL. Odoo also stores *metadata* there: \`ir_model\` (models), \`ir_model_fields\` (fields), \`ir_ui_view\` (views), \`ir_ui_menu\` (menus), \`ir_model_access\` (access rights). This is why installing or upgrading a module changes the database - the module's XML and CSV files are loaded into these tables.

### The web client

The web client is a single-page application. When a user opens a menu, the client loads the **action** behind it, which tells it which model and which views to show. Views are XML stored in the database; the client renders them and calls the server for data.

## Modules and the addons path

Everything in Odoo is a **module** (also called an addon): Sales is \`sale\`, Inventory is \`stock\`, Accounting is \`account\`. A module is a folder containing a manifest and Python, XML, CSV and static files. The server finds modules by scanning every directory listed in \`addons_path\`.

| Term | Meaning |
|------|---------|
| Install | Load the module into a database for the first time (\`-i module\`) |
| Upgrade | Reload Python and data files after a change (\`-u module\`) |
| Depends | Modules that must be installed first (declared in the manifest) |
| Custom addons path | A separate folder for your own modules - never edit core Odoo files |

### Standard vs customization

| Change | Delivery type | Survives upgrade? |
|--------|---------------|-------------------|
| Enable "Quotation templates" in Settings | Configuration | Yes |
| Add a field with Studio | Customization (Enterprise) | Usually, but must be tested |
| Custom module \`academy_sale_extension\` | Customization | Must be migrated per major version |
| Editing a file inside \`odoo/addons/sale\` | Never acceptable | Lost on every update |

> **Consultant tip:** When a client asks for a change, always classify it first: standard, configuration, Studio, custom module or third-party app. The classification drives cost, upgrade risk and who owns maintenance.

## How a request flows through Odoo

1. A salesperson clicks **Confirm** on a quotation.
2. The web client sends an RPC call: model \`sale.order\`, method \`action_confirm\`, record id.
3. The server checks the user has write access to \`sale.order\` and that record rules allow this record.
4. The ORM runs \`action_confirm\` - the standard code plus any overrides from installed modules (in dependency order).
5. The ORM writes changes to PostgreSQL inside a single transaction. If any error is raised, everything is rolled back.
6. The client reloads the record and shows the new state.

Point 5 is important: an error raised from your code cancels the whole operation. That is how validations safely block bad data.

## Editions

Odoo Community is open source (LGPL-3). Odoo Enterprise adds proprietary modules (Studio, some localisations, many connectors). Your custom module can usually run on both, as long as it only depends on Community modules.

## Exercise

1. Locate the \`odoo.conf\` of your training environment and write down the addons path.
2. In the training database enable **developer mode** (Settings, then *Activate the developer mode*, or add \`?debug=1\` to the URL).
3. Open *Settings > Technical > Database Structure > Models*, search for \`sale.order\` and list five of its fields.
4. Open *Settings > Technical > User Interface > Views* and find \`sale.view_order_form\`.

**Expected output:** a short note with the addons path, five \`sale.order\` field names with their types, and the external id of the sale order form view.

## Key takeaways

- Odoo = web client + Python server (ORM) + PostgreSQL.
- All access goes through the ORM, which enforces security and business rules.
- Everything is a module; custom modules live in their own addons path folder.
- Installing and upgrading modules loads metadata (views, menus, rights) into the database.
- Classify every request before estimating it.`,
          flashcards: [
            { term: "ORM", definition: "Object-Relational Mapper: the Odoo layer that maps Python model classes to PostgreSQL tables and enforces access rights and business logic." },
            { term: "Addons path", definition: "The list of directories the Odoo server scans to find modules, configured in odoo.conf." },
            { term: "Module (addon)", definition: "A folder with a __manifest__.py plus Python, XML, CSV and static files that adds or changes functionality." },
            { term: "-u (upgrade)", definition: "Command-line option that reloads a module's Python code and data files into a database after changes." },
            { term: "Model", definition: "A Python class with a _name such as sale.order; the ORM stores it in a table such as sale_order." },
            { term: "Developer mode", definition: "A web client mode (?debug=1) that shows technical menus, field names and view metadata." },
          ],
          resources: [{ title: "Odoo 17 developer documentation", kind: "link", url: DOC_DEV }],
        },
        {
          slug: "python-essentials-for-odoo",
          title: "Python essentials for Odoo",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

You will not write large Python programs as a consultant, but you will read and adjust module code, investigate errors and validate developer estimates. This lesson covers the Python you meet in 90% of Odoo modules.

## Core Python you need

| Concept | Example | Where you see it in Odoo |
|---------|---------|--------------------------|
| Class and inheritance | \`class SaleOrder(models.Model):\` | Every model |
| Decorators | \`@api.depends("order_line")\` | Computed fields, constraints |
| Dictionaries | \`{"name": "Desk"}\` | \`create\` and \`write\` values |
| Lists and tuples | \`[("state", "=", "sale")]\` | Domains (search filters) |
| \`super()\` | \`super().action_confirm()\` | Extending standard methods |
| f-strings / formatting | \`"Order %s" % order.name\` | Messages and logs |
| Exceptions | \`raise UserError(...)\` | Blocking invalid operations |

## Recordsets: the most important idea

In Odoo, \`self\` inside a model method is a **recordset** - an ordered collection of zero, one or many records of the same model. Always write code that works for many records:

\`\`\`python
from odoo import api, fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    def action_print_names(self):
        # self may contain 1 or 100 orders - loop over it
        for order in self:
            print(order.name, order.partner_id.name, order.amount_total)
\`\`\`

Useful recordset operations:

\`\`\`python
orders = self.env["sale.order"].search([("state", "=", "sale")], limit=50)

big = orders.filtered(lambda o: o.amount_total > 10000)   # subset
partners = orders.mapped("partner_id")                     # related records
totals = orders.mapped("amount_total")                     # list of floats
latest_first = orders.sorted(key="date_order", reverse=True)

order = orders[:1]          # first record (or empty recordset)
order.ensure_one()          # raises an error if not exactly one record
\`\`\`

### The environment: \`self.env\`

\`self.env\` gives access to every model, the current user, company and context:

\`\`\`python
Partner = self.env["res.partner"]          # model "registry" access
user = self.env.user                       # current res.users record
company = self.env.company                 # current company
lang = self.env.context.get("lang")        # context values
\`\`\`

- \`sudo()\` runs the next operations as superuser and **bypasses access rights**. Use it only when you have a clear business reason and never on data supplied by an untrusted user.
- \`with_context(key=value)\` passes flags to downstream code (for example default values).
- \`with_company(company)\` switches the active company.

## Domains

A domain is a list of conditions, used for searches, record rules, actions and filters:

\`\`\`python
domain = [
    ("state", "in", ["draft", "sent"]),
    ("amount_total", ">", 5000),
    ("partner_id.country_id.code", "=", "IN"),
]
quotes = self.env["sale.order"].search(domain)
\`\`\`

Conditions are joined with AND by default. Prefix operators \`"|"\` (OR) and \`"!"\` (NOT) are written before their operands, in Polish notation:

\`\`\`python
# state = draft OR amount_total > 5000
domain = ["|", ("state", "=", "draft"), ("amount_total", ">", 5000)]
\`\`\`

## CRUD with the ORM

\`\`\`python
Partner = self.env["res.partner"]
partner = Partner.create({"name": "Sunrise Test Customer", "email": "test@example.com"})
partner.write({"phone": "+1 555 0100"})
found = Partner.search([("email", "=", "test@example.com")], limit=1)
data = found.read(["name", "phone"])
found.unlink()   # delete - only in a test database!
\`\`\`

Relational fields (One2many / Many2many) are written with **commands**. In Odoo 17 the \`Command\` helper is preferred over the old tuples:

\`\`\`python
from odoo import Command

order.write({
    "order_line": [
        Command.create({"product_id": product.id, "product_uom_qty": 2}),
    ],
    "tag_ids": [Command.link(tag.id)],
})
\`\`\`

## Errors you raise

\`\`\`python
from odoo import _
from odoo.exceptions import UserError, ValidationError

if not order.partner_id.email:
    raise UserError(_("Customer %s has no email address.", order.partner_id.name))
\`\`\`

- \`UserError\` - business rule violated during an action (shown as a dialog, transaction rolled back).
- \`ValidationError\` - raised from \`@api.constrains\` when data is invalid.
- \`AccessError\` - raised by the framework when rights are missing.

Wrap user-facing strings in \`_()\` so they can be translated.

## Trying code safely: the Odoo shell

\`\`\`bash
./odoo-bin shell -c odoo.conf -d academy_dev
\`\`\`

\`\`\`python
>>> orders = env["sale.order"].search([], limit=3)
>>> orders.mapped("name")
['S00003', 'S00002', 'S00001']
>>> env.cr.rollback()   # discard anything you changed
\`\`\`

The shell does not commit unless you call \`env.cr.commit()\`. In training, prefer \`env.cr.rollback()\`; **never** experiment in the shell on a production database.

> **Consultant tip:** When reading a developer's estimate, look for loops that call \`search\` or \`write\` once per record. On large datasets these are slow; batching with recordsets is usually the fix.

## Exercise

1. Open the Odoo shell on your **training** database.
2. Find all confirmed sale orders (\`state = "sale"\`) and print their names and totals.
3. Using \`filtered\`, keep only orders above 1,000 and use \`mapped\` to list the distinct customers.
4. Write a domain that finds quotations (draft or sent) for customers in your country.
5. Roll back the transaction and exit.

**Expected output:** a list of order references with totals, a list of customer names, and a working domain returning only quotations.

## Debugging guidance

| Error | Likely cause | Fix |
|-------|-------------|-----|
| \`ValueError: Expected singleton: sale.order(1, 2)\` | Accessing a field on a multi-record recordset | Loop with \`for order in self\` or call \`ensure_one()\` |
| \`KeyError: 'academy.delivery.window'\` | Model not loaded - module not installed or typo | Check \`_name\`, install/upgrade the module |
| \`AttributeError: 'sale.order' object has no attribute ...\` | Field/method name typo or module not upgraded | Check spelling, run \`-u\` |
| \`IndentationError\` | Mixed tabs/spaces | Use 4 spaces consistently |

## Key takeaways

- \`self\` is a recordset; always loop.
- Domains are lists of tuples with prefix operators for OR/NOT.
- Use \`Command\` helpers for relational writes in Odoo 17.
- Use \`UserError\`/\`ValidationError\` and \`_()\` for user messages.
- Experiment only in the shell of a training database and roll back.`,
          resources: [{ title: "ORM API reference (Odoo 17)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/backend/orm.html" }],
        },
        {
          slug: "postgresql-essentials",
          title: "PostgreSQL essentials for analysis",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## Business context

During a support call, the finance manager of Sunrise Office Supplies says "some invoices seem to have no salesperson". You could open every invoice, or you could answer in seconds with a **read-only SQL query**. Knowing SQL makes you faster at analysis, data migration checks and troubleshooting. It must never be used to *change* data in production.

## The golden rule

> **Consultant tip:** SQL is for **reading and analysing**. Never \`INSERT\`, \`UPDATE\` or \`DELETE\` directly in a production Odoo database. Direct writes bypass the ORM: no access rights, no computed fields recalculated, no accounting integrity checks, no audit trail in the chatter. Fix data through the UI, imports or ORM scripts tested on a copy.

| Activity | Allowed on production? |
|----------|-----------------------|
| \`SELECT\` with a read-only role, during low load | Yes, with approval |
| \`UPDATE\`/\`DELETE\`/\`INSERT\` | No |
| Schema changes (\`ALTER TABLE\`) | No - the ORM owns the schema |
| Any query on a duplicated/neutralized test database | Yes |

Ask the database administrator for a **read-only role**, for example created with \`GRANT SELECT\` only, or run your queries on a recent copy of the database.

## How Odoo names tables and columns

| Odoo | PostgreSQL |
|------|-----------|
| Model \`sale.order\` | Table \`sale_order\` |
| Model \`res.partner\` | Table \`res_partner\` |
| Many2one field \`partner_id\` | Integer column \`partner_id\` (foreign key) |
| One2many \`order_line\` | No column - the line table has \`order_id\` |
| Many2many \`tag_ids\` on sale.order | Relation table, e.g. \`crm_tag_sale_order_rel\` (check in the model's field definition) |
| Translatable field such as \`product_template.name\` | \`jsonb\` column keyed by language, e.g. \`name->>'en_US'\` (since Odoo 16) |

## Connecting

\`\`\`bash
psql -h localhost -U academy_readonly -d academy_dev
\`\`\`

Useful \`psql\` meta-commands: \`\\dt\` lists tables, \`\\d sale_order\` describes a table, \`\\q\` quits.

## Essential queries

### Latest sales orders

\`\`\`sql
SELECT so.id, so.name, so.state, so.amount_total, rp.name AS customer
FROM sale_order so
JOIN res_partner rp ON rp.id = so.partner_id
ORDER BY so.id DESC
LIMIT 10;
\`\`\`

### Invoices without a salesperson

\`\`\`sql
SELECT am.name, am.invoice_date, am.amount_total
FROM account_move am
WHERE am.move_type = 'out_invoice'
  AND am.state = 'posted'
  AND am.invoice_user_id IS NULL
ORDER BY am.invoice_date DESC;
\`\`\`

### Sales per customer (aggregation)

\`\`\`sql
SELECT rp.name, COUNT(*) AS orders, SUM(so.amount_total) AS revenue
FROM sale_order so
JOIN res_partner rp ON rp.id = so.partner_id
WHERE so.state = 'sale'
GROUP BY rp.name
ORDER BY revenue DESC
LIMIT 20;
\`\`\`

### Duplicate customers by email

\`\`\`sql
SELECT lower(email) AS email, COUNT(*) AS cnt
FROM res_partner
WHERE email IS NOT NULL AND active
GROUP BY lower(email)
HAVING COUNT(*) > 1;
\`\`\`

### Product names (translatable jsonb)

\`\`\`sql
SELECT id, default_code, name->>'en_US' AS name_en
FROM product_template
WHERE active
LIMIT 20;
\`\`\`

## SQL concepts to master

| Concept | Purpose |
|---------|---------|
| \`JOIN\` / \`LEFT JOIN\` | Combine related tables (left join keeps rows with no match) |
| \`WHERE\` | Filter rows |
| \`GROUP BY\` + \`COUNT\`/\`SUM\` | Aggregate |
| \`HAVING\` | Filter aggregated groups |
| \`ORDER BY\` / \`LIMIT\` | Sort and restrict output - always use \`LIMIT\` when exploring |
| \`EXPLAIN\` | Show how a query will run (performance) |

## Reading results with care

- Odoo uses an \`active\` boolean for archiving. Archived records are still in the table - filter with \`active\` when relevant.
- Multi-company databases: always check \`company_id\`.
- Monetary amounts are stored in the document currency; company-currency columns (e.g. \`amount_total_signed\` on invoices) may differ.
- Computed, non-stored fields do **not** exist as columns at all.

## Exercise

Run on your **training** database only:

1. Count sales orders per state.
2. List the 10 customers with the highest confirmed revenue.
3. Find products without an internal reference (\`default_code IS NULL\`).
4. Find duplicate partner emails.

**Expected output:** four result sets; for question 1 something like:

| state | count |
|-------|-------|
| draft | 12 |
| sale | 31 |
| cancel | 2 |

## Debugging guidance

| Message | Meaning |
|---------|---------|
| \`relation "sale_orders" does not exist\` | Table name typo - tables use the singular model name with underscores |
| \`permission denied for table ...\` | Your read-only role lacks \`SELECT\` on that table; ask the DBA |
| \`operator does not exist: jsonb = unknown\` | Comparing a translatable \`jsonb\` field directly - use \`name->>'en_US'\` |
| Query runs for minutes | Missing \`LIMIT\` or filter; cancel it to avoid locking users out |

## Key takeaways

- SQL is a read-only analysis tool for consultants.
- Never write directly into a production database.
- Table names mirror model names; translatable fields are \`jsonb\` in recent versions.
- Always filter, limit and double-check company and active flags.`,
        },
        {
          slug: "git-workflow-for-odoo-modules",
          title: "Git workflow for Odoo modules",
          durationMin: 30,
          odooVersions: "Version-independent",
          scope: ["customization"],
          body: `## Business context

Sunrise Office Supplies has three people touching the same custom module: a developer, you as consultant, and later a support partner. Without version control nobody knows which code is in production, and a "quick fix" can silently overwrite another change. Git gives traceability, review and safe rollback.

## Core concepts

| Concept | Meaning |
|---------|---------|
| Repository | The project folder tracked by Git (usually one repo for all custom addons of a client) |
| Commit | A saved snapshot with a message and author |
| Branch | An independent line of work |
| Merge / Pull request | Bringing a branch's changes into another, usually after review |
| Remote | The shared copy (GitHub, GitLab, Bitbucket, Odoo.sh) |
| Tag | A named version, e.g. a release deployed to production |

## Recommended repository layout

\`\`\`text
sunrise-odoo/
  .gitignore
  README.md
  academy_sale_extension/
    __init__.py
    __manifest__.py
    models/
    views/
    security/
    tests/
\`\`\`

A minimal \`.gitignore\`:

\`\`\`text
__pycache__/
*.pyc
*.pyo
.env
*.log
filestore/
\`\`\`

Note \`.env\` - files with credentials never go into Git.

## Branching model

| Branch | Purpose | Deployed to |
|--------|---------|-------------|
| \`17.0\` (main) | Production-ready code | Production |
| \`17.0-staging\` | Release candidate | Staging (a neutralized copy of production) |
| \`17.0-feature-approval-workflow\` | One feature or fix | Developer / test database |

Many partners name branches after the Odoo version because a module is migrated per major version. On Odoo.sh, branches are mapped to *development*, *staging* and *production* stages; the same discipline applies.

## The daily workflow

\`\`\`bash
git checkout 17.0
git pull
git checkout -b 17.0-feature-delivery-windows

# ... edit files, upgrade module in your dev database, test ...

git status
git add academy_sale_extension/
git commit -m "[ADD] academy_sale_extension: delivery window model and menu"
git push -u origin 17.0-feature-delivery-windows
\`\`\`

Then open a pull request, ask for review, and merge only after tests pass on staging.

### Commit message convention

Odoo's own guidelines use a tag prefix and the module name:

| Tag | Use |
|-----|-----|
| \`[ADD]\` | New module or feature |
| \`[FIX]\` | Bug fix |
| \`[IMP]\` | Improvement of existing feature |
| \`[REF]\` | Refactoring without functional change |
| \`[REM]\` | Removal of code or feature |

Example: \`[FIX] academy_sale_extension: block confirmation without approval\`.

## Version numbers in the manifest

The manifest \`version\` follows \`<odoo major>.<module major>.<minor>.<patch>\`, for example \`17.0.1.2.0\`. Increase it with every release that changes data structures. Migration scripts (in a \`migrations/\` folder) are keyed by this version, so a wrong number can skip a needed migration.

## Code review checklist for consultants

- Does the change match the approved functional specification?
- Are new models protected by \`ir.model.access.csv\`?
- Does any override call \`super()\`?
- Are there tests for the new rules?
- Is the manifest version bumped and are new data files listed in \`data\`?
- No credentials, customer data or database dumps committed.

> **Consultant tip:** Ask for the commit or tag that is running in production before every support investigation. "Which version is deployed?" saves hours of guessing.

## Undoing mistakes safely

| Situation | Command |
|-----------|---------|
| Discard uncommitted change to a file | \`git restore path/to/file\` |
| Undo a pushed commit without rewriting history | \`git revert <commit>\` |
| See who changed a line | \`git blame path/to/file\` |
| Compare with production | \`git diff 17.0..my-branch\` |

Avoid \`git push --force\` on shared branches - it rewrites history others depend on.

## If a secret was committed

Removing the file in a new commit is **not enough**: it stays in history. Immediately **revoke/rotate the credential**, then clean history with your platform's guidance. Treat the secret as compromised.

## Exercise

1. Initialise a repository containing an empty \`academy_sale_extension\` folder and the \`.gitignore\` above.
2. Create the branch \`17.0-feature-delivery-windows\`.
3. Commit the manifest you will write in the next module with an \`[ADD]\` message.
4. Run \`git log --oneline\` and \`git status\`.

**Expected output:**

\`\`\`text
a1b2c3d [ADD] academy_sale_extension: initial module skeleton
On branch 17.0-feature-delivery-windows
nothing to commit, working tree clean
\`\`\`

## Debugging guidance

- *"fatal: not a git repository"* - you are not in the repo folder.
- *Merge conflict* markers (\`<<<<<<<\`) in XML will break module loading with an XML parse error - resolve every conflict before upgrading.
- *Changes not visible in Odoo after pull* - restart the server and run \`-u academy_sale_extension\`.

## Key takeaways

- One branch per feature, reviewed before merge.
- Tagged, versioned releases tell you exactly what is in production.
- Bump the manifest version for data structure changes.
- Never commit secrets; rotate any that leak.`,
        },
        {
          slug: "dev-environment-and-safety",
          title: "Development environment and safety rules",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "customization"],
          body: `## Business context

A developer at a partner once "just tested" a scheduled action on production. It sent 4,000 reminder emails to real customers. The fix took ten minutes; rebuilding trust took months. Safe environments are a professional obligation, not a nice-to-have.

## The non-negotiable rules

1. **Never develop or experiment on production.**
2. Use a **duplicated and neutralized** database for development and testing.
3. Keep credentials out of code and repositories.
4. Every change reaches production through version control and a staging test.

## Environment ladder

| Environment | Data | Who uses it | Purpose |
|-------------|------|-------------|---------|
| Local dev | Demo data or neutralized copy | Developer | Build and unit test |
| Test / training | Neutralized copy | Consultant, key users | Functional testing, training |
| Staging | Recent neutralized copy of production | Consultant, client | Final acceptance before release |
| Production | Real | End users | Live business |

## What "neutralized" means

A neutralized database is a copy where integrations with the outside world are disabled so it cannot affect real customers or systems. Typically:

- outgoing mail servers deactivated (no emails to customers),
- scheduled actions (crons) deactivated,
- payment providers and bank synchronisation disabled or set to test mode,
- shipping connectors switched to test mode,
- external API credentials removed,
- a visible banner showing it is not production.

Odoo provides tooling for this. Duplicating a database from Odoo.sh or the database manager can neutralize it, and recent versions include a \`neutralize\` command for \`odoo-bin\` (verify against the documentation for your version):

\`\`\`bash
./odoo-bin neutralize -c odoo.conf -d academy_dev
\`\`\`

Always verify the result: check *Settings > Technical > Outgoing Mail Servers* and *Scheduled Actions*.

> **Consultant tip:** Before any demo or training session, confirm in writing that the database is neutralized. Put "TEST" in the company name if no banner is shown.

## A local setup

A typical local installation:

\`\`\`text
/opt/odoo/odoo            # Odoo source (17.0 branch)
/opt/odoo/custom-addons   # your Git repository with academy_sale_extension
/opt/odoo/odoo.conf
\`\`\`

\`\`\`ini
[options]
addons_path = /opt/odoo/odoo/addons,/opt/odoo/custom-addons
db_host = localhost
db_port = 5432
db_user = odoo
http_port = 8069
dbfilter = ^academy_.*
list_db = True
log_level = info
\`\`\`

Start the server and install your module on a development database:

\`\`\`bash
./odoo-bin -c /opt/odoo/odoo.conf -d academy_dev -i academy_sale_extension
\`\`\`

During development, use the developer flags so XML and Python changes reload faster:

\`\`\`bash
./odoo-bin -c /opt/odoo/odoo.conf -d academy_dev -u academy_sale_extension --dev=all
\`\`\`

\`--dev=all\` enables auto-reload of Python files, reading views directly from XML files and a debugger on exceptions. It is for development only.

## Install vs upgrade

| You changed... | Required action |
|----------------|-----------------|
| Python method logic | Restart the server (auto-reload with \`--dev=all\`) |
| New field in Python | Restart **and** upgrade (\`-u\`) so the column is created |
| View XML, menu, action, security CSV | Upgrade (\`-u\`) |
| Manifest \`data\` list | Upgrade (\`-u\`) |
| New module folder | Restart, *Update Apps List*, then install |

## Secrets

- Database passwords and API keys come from environment variables or a secrets manager, not the repository.
- Use a separate admin master password per environment.
- Do not reuse production API keys in dev or test.

## Backups and restore

Take a backup before every upgrade, even on test. A backup consists of the PostgreSQL dump **and** the filestore (attachments). Practise restoring - an untested backup is not a backup.

## Exercise

1. Create a database \`academy_dev\` with demo data and install Sales.
2. Duplicate it to \`academy_test\` and neutralize it.
3. Verify: outgoing mail servers inactive, scheduled actions inactive.
4. Start the server with \`--dev=all\` on \`academy_dev\`.

**Expected output:** two databases listed by the database manager; in \`academy_test\` no active mail server and a log line similar to:

\`\`\`text
INFO academy_test odoo.modules.loading: Modules loaded.
\`\`\`

## Debugging guidance

| Symptom | Cause | Fix |
|---------|-------|-----|
| Module not listed in Apps | Folder not in addons path, or apps list not updated | Check \`addons_path\`, restart, *Update Apps List* |
| \`database "academy_dev" does not exist\` | Typo or \`dbfilter\` hides it | Check name and \`dbfilter\` |
| Emails reaching real customers from test | Database not neutralized | Deactivate mail servers immediately, neutralize, review |
| Port 8069 in use | Another Odoo running | Stop it or change \`http_port\` |

## Key takeaways

- Production is for business, never for experiments.
- Work on duplicated, neutralized databases and verify neutralization.
- Know when to restart and when to upgrade.
- Back up before upgrades and keep secrets outside the code.`,
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* Module 2: Models & views                                            */
    /* ------------------------------------------------------------------ */
    {
      title: "Models & views",
      lessons: [
        {
          slug: "module-structure-and-manifest",
          title: "Module structure and __manifest__.py",
          durationMin: 40,
          odooVersions: "Odoo 17.0 (18.0 notes)",
          scope: ["customization"],
          body: `## Business context

Sunrise Office Supplies wants to record **delivery windows** (the time slots a customer accepts deliveries) on sales orders, plus a few extra fields. We will build all of it in one custom module, \`academy_sale_extension\`, and grow it throughout the course.

## Module anatomy

\`\`\`text
academy_sale_extension/
  __init__.py
  __manifest__.py
  models/
    __init__.py
    academy_delivery_window.py
    sale_order.py
  views/
    academy_delivery_window_views.xml
    sale_order_views.xml
    menus.xml
  security/
    academy_security.xml
    ir.model.access.csv
  data/
  report/
  tests/
\`\`\`

| File/folder | Purpose |
|-------------|---------|
| \`__manifest__.py\` | Module metadata: name, version, dependencies, data files |
| \`__init__.py\` | Python imports (makes models load) |
| \`models/\` | Python model classes |
| \`views/\` | XML views, actions, menus |
| \`security/\` | Access rights (CSV) and record rules/groups (XML) |
| \`data/\` | Default data, scheduled actions |
| \`report/\` | QWeb reports |
| \`tests/\` | Automated tests |

## Starter code

### __manifest__.py

\`\`\`python
{
    "name": "Academy Sale Extension",
    "version": "17.0.1.0.0",
    "summary": "Training module: sales extensions for Sunrise Office Supplies",
    "category": "Sales",
    "author": "ERP Consultant Academy",
    "license": "LGPL-3",
    "depends": ["sale_management"],
    "data": [
        "security/academy_security.xml",
        "security/ir.model.access.csv",
        "views/academy_delivery_window_views.xml",
        "views/sale_order_views.xml",
        "views/menus.xml",
    ],
    "installable": True,
    "application": False,
}
\`\`\`

Key points:

- \`depends\` - our module extends Sales, so it depends on \`sale_management\` (which brings \`sale\` and the Sales menus).
- \`data\` - loaded **in order**. Security first, then views (which define actions), then menus (which reference actions).
- \`license\` - required; without it Odoo logs a warning.

### __init__.py (module root)

\`\`\`python
from . import models
\`\`\`

### models/__init__.py

\`\`\`python
from . import academy_delivery_window
from . import sale_order
\`\`\`

### models/academy_delivery_window.py

\`\`\`python
from odoo import fields, models


class AcademyDeliveryWindow(models.Model):
    _name = "academy.delivery.window"
    _description = "Customer Delivery Window"
    _order = "date_from"

    name = fields.Char(required=True)
    sale_order_id = fields.Many2one("sale.order", string="Sales Order", ondelete="cascade")
    date_from = fields.Datetime(string="From", required=True)
    date_to = fields.Datetime(string="To", required=True)
    note = fields.Text()
\`\`\`

### models/sale_order.py

\`\`\`python
from odoo import fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    academy_customer_po = fields.Char(string="Customer PO", copy=False)
\`\`\`

### security/academy_security.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Record rules are added in the security lesson -->
</odoo>
\`\`\`

### security/ir.model.access.csv

\`\`\`text
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_academy_delivery_window_user,academy.delivery.window.user,model_academy_delivery_window,sales_team.group_sale_salesman,1,1,1,0
access_academy_delivery_window_manager,academy.delivery.window.manager,model_academy_delivery_window,sales_team.group_sale_manager,1,1,1,1
\`\`\`

### views/academy_delivery_window_views.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="academy_delivery_window_view_tree" model="ir.ui.view">
        <field name="name">academy.delivery.window.tree</field>
        <field name="model">academy.delivery.window</field>
        <field name="arch" type="xml">
            <tree>
                <field name="name"/>
                <field name="sale_order_id"/>
                <field name="date_from"/>
                <field name="date_to"/>
            </tree>
        </field>
    </record>

    <record id="academy_delivery_window_view_form" model="ir.ui.view">
        <field name="name">academy.delivery.window.form</field>
        <field name="model">academy.delivery.window</field>
        <field name="arch" type="xml">
            <form>
                <sheet>
                    <group>
                        <field name="name"/>
                        <field name="sale_order_id"/>
                        <field name="date_from"/>
                        <field name="date_to"/>
                    </group>
                    <field name="note" placeholder="Delivery instructions..."/>
                </sheet>
            </form>
        </field>
    </record>

    <record id="academy_delivery_window_action" model="ir.actions.act_window">
        <field name="name">Delivery Windows</field>
        <field name="res_model">academy.delivery.window</field>
        <field name="view_mode">tree,form</field>
    </record>
</odoo>
\`\`\`

> Odoo 18 note: the list view root tag becomes \`<list>\` and the view mode \`list,form\`. Odoo 17 uses \`<tree>\` and \`tree,form\`.

### views/sale_order_views.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_order_form_academy" model="ir.ui.view">
        <field name="name">sale.order.form.academy</field>
        <field name="model">sale.order</field>
        <field name="inherit_id" ref="sale.view_order_form"/>
        <field name="arch" type="xml">
            <xpath expr="//field[@name='payment_term_id']" position="after">
                <field name="academy_customer_po"/>
            </xpath>
        </field>
    </record>
</odoo>
\`\`\`

### views/menus.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <menuitem id="academy_delivery_window_menu"
              name="Delivery Windows"
              parent="sale.sale_menu_root"
              action="academy_delivery_window_action"
              sequence="40"/>
</odoo>
\`\`\`

## Explanation

- \`_name\` creates a **new model**; \`_inherit\` without \`_name\` **extends** an existing one.
- External ids such as \`model_academy_delivery_window\` are generated automatically for every model (\`model_\` + model name with dots replaced by underscores).
- \`sale.view_order_form\` and \`sale.sale_menu_root\` are external ids defined by the \`sale\` module (\`module.xml_id\`).

## Exercise steps

1. Create the folder in your custom addons path with all files above.
2. Restart Odoo, activate developer mode, *Apps > Update Apps List*.
3. Search "Academy Sale Extension" and install it (or \`-i academy_sale_extension\`).
4. Open *Sales > Delivery Windows* and create a window.
5. Open a quotation and fill **Customer PO**.

## Expected output

- New menu *Sales > Delivery Windows* with list and form views.
- **Customer PO** field visible below Payment Terms on the quotation.
- Server log contains \`Loading module academy_sale_extension\` and no warnings.

## Debugging guidance

| Error / symptom | Cause | Fix |
|-----------------|-------|-----|
| \`The model academy.delivery.window has no access rules, consider adding one\` (warning in log), menu invisible to users | CSV missing or not in manifest \`data\` | Add the CSV and list it in \`data\`, upgrade |
| \`ParseError ... while parsing .../views/....xml\` | Malformed XML: unclosed tag, \`&\` instead of \`&amp;\`, merge marker | Validate the XML, check the line shown in the traceback |
| \`Field "academy_customer_po" does not exist in model "sale.order"\` | Python not loaded: missing import in \`__init__.py\`, or server not restarted | Fix imports, restart, upgrade |
| \`External ID not found in the system: academy_sale_extension.academy_delivery_window_action\` | Menu file loaded before the views file | Reorder \`data\` in the manifest |
| Module not found in Apps | Not in addons path or apps list not updated | Check path, *Update Apps List* |

## Key takeaways

- A module = manifest + Python + XML + security files.
- Order of \`data\` files matters.
- Every new model needs access rights.
- \`_inherit\` extends, \`_name\` creates.`,
          resources: [
            { title: "Module manifests (Odoo 17)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html" },
            { title: "Odoo 17 developer documentation", kind: "link", url: DOC_DEV },
          ],
        },
        {
          slug: "models-and-field-types",
          title: "Models, field types and relational fields",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Sunrise wants to capture more on each delivery window: the **delivery type**, the **number of pallets**, the **dock contact** (a contact person) and the **tags** used by the warehouse. On the sales order they want to see all windows of that order. Choosing the right field types is what makes the data reportable, searchable and safe to import.

## Simple field types

| Field | Stores | Example |
|-------|--------|---------|
| \`fields.Char\` | Short text | Customer PO number |
| \`fields.Text\` | Long text | Instructions |
| \`fields.Html\` | Formatted text | Notes with formatting |
| \`fields.Integer\` | Whole number | Pallet count |
| \`fields.Float\` | Decimal (use \`digits\`) | Weight |
| \`fields.Monetary\` | Amount with a currency field | Deposit |
| \`fields.Boolean\` | True/False | Tail-lift required |
| \`fields.Date\` / \`fields.Datetime\` | Date / date + time (stored in UTC) | Window start |
| \`fields.Selection\` | One of fixed values | Delivery type |
| \`fields.Binary\` / \`fields.Image\` | File / image | Signed delivery note |

Common attributes: \`string\`, \`required\`, \`readonly\`, \`default\`, \`help\`, \`index\`, \`copy\`, \`tracking\` (with \`mail.thread\`), \`groups\`.

## Relational field types

| Field | Meaning | Database |
|-------|---------|----------|
| \`Many2one\` | Link to **one** record of another model | Integer column with foreign key |
| \`One2many\` | All records of another model pointing back to this one | Virtual - needs an inverse Many2one |
| \`Many2many\` | Many records on both sides | Relation table |

\`\`\`text
sale.order (1) ----< academy.delivery.window (many)   One2many / Many2one
academy.delivery.window >----< academy.delivery.tag    Many2many
\`\`\`

## Starter code

### models/academy_delivery_window.py

\`\`\`python
from odoo import fields, models


class AcademyDeliveryTag(models.Model):
    _name = "academy.delivery.tag"
    _description = "Delivery Tag"

    name = fields.Char(required=True)
    color = fields.Integer()


class AcademyDeliveryWindow(models.Model):
    _name = "academy.delivery.window"
    _description = "Customer Delivery Window"
    _order = "date_from"

    name = fields.Char(required=True)
    sale_order_id = fields.Many2one(
        "sale.order", string="Sales Order", required=True, ondelete="cascade", index=True
    )
    date_from = fields.Datetime(string="From", required=True)
    date_to = fields.Datetime(string="To", required=True)
    delivery_type = fields.Selection(
        [("standard", "Standard"), ("express", "Express"), ("pickup", "Customer Pickup")],
        default="standard",
        required=True,
    )
    pallet_count = fields.Integer(string="Pallets", default=1)
    tail_lift = fields.Boolean(string="Tail-lift Required")
    dock_contact_id = fields.Many2one("res.partner", string="Dock Contact")
    tag_ids = fields.Many2many("academy.delivery.tag", string="Tags")
    note = fields.Text()
\`\`\`

### models/sale_order.py

\`\`\`python
from odoo import fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    academy_customer_po = fields.Char(string="Customer PO", copy=False)
    academy_priority = fields.Selection(
        [("0", "Normal"), ("1", "Urgent")], string="Delivery Priority", default="0"
    )
    delivery_window_ids = fields.One2many(
        "academy.delivery.window", "sale_order_id", string="Delivery Windows"
    )
\`\`\`

### security/ir.model.access.csv (add the tag model)

\`\`\`text
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_academy_delivery_window_user,academy.delivery.window.user,model_academy_delivery_window,sales_team.group_sale_salesman,1,1,1,0
access_academy_delivery_window_manager,academy.delivery.window.manager,model_academy_delivery_window,sales_team.group_sale_manager,1,1,1,1
access_academy_delivery_tag_user,academy.delivery.tag.user,model_academy_delivery_tag,sales_team.group_sale_salesman,1,0,0,0
access_academy_delivery_tag_manager,academy.delivery.tag.manager,model_academy_delivery_tag,sales_team.group_sale_manager,1,1,1,1
\`\`\`

### views: show the One2many on the sales order

\`\`\`xml
<record id="view_order_form_academy" model="ir.ui.view">
    <field name="name">sale.order.form.academy</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='payment_term_id']" position="after">
            <field name="academy_customer_po"/>
            <field name="academy_priority" widget="priority"/>
        </xpath>
        <xpath expr="//notebook" position="inside">
            <page string="Delivery Windows" name="academy_delivery_windows">
                <field name="delivery_window_ids">
                    <tree editable="bottom">
                        <field name="name"/>
                        <field name="date_from"/>
                        <field name="date_to"/>
                        <field name="delivery_type"/>
                        <field name="pallet_count"/>
                        <field name="tag_ids" widget="many2many_tags"/>
                    </tree>
                </field>
            </page>
        </xpath>
    </field>
</record>
\`\`\`

## Explanation

- \`ondelete="cascade"\` deletes windows when the order is deleted; alternatives are \`"set null"\` and \`"restrict"\`.
- The One2many needs the **inverse field name** (\`sale_order_id\`) - it does not create a column.
- Selection keys are stored; labels are translated. Never change keys after go-live without a migration.
- Datetime values are stored in UTC and displayed in the user's timezone - explain this to users who compare exports.

> **Consultant tip:** When a requirement says "a list of X on Y", ask: can one X belong to several Y? If yes it is Many2many; if no, it is One2many with a Many2one back. Getting this wrong is expensive to fix after data exists.

## Exercise steps

1. Update the Python files and the CSV.
2. Restart Odoo and upgrade: \`./odoo-bin -c odoo.conf -d academy_dev -u academy_sale_extension\`.
3. Create two tags: "Fragile", "Heavy".
4. On a quotation, open the **Delivery Windows** tab and add two windows with tags.
5. Check *Settings > Technical > Models > academy.delivery.window* to see the fields.

## Expected output

- A **Delivery Windows** tab on the quotation with an editable list.
- Tags shown as coloured badges.
- In PostgreSQL (read-only): a table \`academy_delivery_window\` and a relation table for the Many2many (name generated from both models).

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| \`Field "delivery_window_ids" does not exist in model "sale.order"\` when upgrading | Server not restarted after Python change | Restart then \`-u\` |
| \`psycopg2.errors.NotNullViolation\` on upgrade | New \`required=True\` field on a model with existing rows | Add a \`default\`, or populate first, or do not make it required |
| \`KeyError: 'sale_order_id'\` | Wrong inverse name in One2many | Use the exact Many2one field name |
| Tag list read-only for salespeople | CSV gives them read only | Intended; adjust rights if requirement differs |

## Key takeaways

- Pick field types for reporting and import, not just display.
- Many2one stores the link; One2many is its virtual reverse.
- Many2many uses a relation table.
- New required fields on existing data need defaults.`,
        },
        {
          slug: "computed-related-fields-and-constraints",
          title: "Computed fields, related fields and constraints",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

The Sunrise warehouse needs the **total weight** of each order to choose a vehicle, sales managers want to filter orders by **customer country**, and delivery windows must never end before they start. These map to three ORM features: computed fields, related fields and constraints.

## Computed fields

A computed field is calculated by a method instead of typed by a user.

\`\`\`python
from odoo import api, fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    academy_weight_total = fields.Float(
        string="Total Weight (kg)",
        compute="_compute_academy_weight_total",
        store=True,
        digits=(16, 2),
    )

    @api.depends("order_line.product_uom_qty", "order_line.product_id.weight")
    def _compute_academy_weight_total(self):
        for order in self:
            order.academy_weight_total = sum(
                line.product_uom_qty * line.product_id.weight
                for line in order.order_line
            )
\`\`\`

| Option | Effect |
|--------|--------|
| \`store=False\` (default) | Computed on the fly at every read; cannot be searched/grouped efficiently |
| \`store=True\` | Saved in the database, recomputed when a dependency in \`@api.depends\` changes; searchable, groupable, usable in reports |
| \`readonly=False\` | Lets users override the computed value (computed default pattern) |

Rules:

- **Assign a value for every record** in the loop, even when it is zero - otherwise Odoo raises an error that the field was not computed.
- List every field you read in \`@api.depends\`, including dotted paths. Missing dependencies cause stale stored values.
- Do not call \`write\` inside a compute method.

## Related fields

A related field mirrors a field reachable through relations:

\`\`\`python
    academy_customer_country_id = fields.Many2one(
        related="partner_id.country_id",
        string="Customer Country",
        store=True,
    )
\`\`\`

A related field is a shortcut for a computed field; \`store=True\` makes it searchable and groupable. Without \`store\`, it is read-only and computed on read.

## Constraints

### Python constraints with @api.constrains

\`\`\`python
from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class AcademyDeliveryWindow(models.Model):
    _inherit = "academy.delivery.window"

    @api.constrains("date_from", "date_to")
    def _check_dates(self):
        for window in self:
            if window.date_to and window.date_from and window.date_to <= window.date_from:
                raise ValidationError(
                    _("Delivery window '%s' must end after it starts.", window.name)
                )

    @api.constrains("pallet_count")
    def _check_pallets(self):
        for window in self:
            if window.pallet_count < 0 or window.pallet_count > 33:
                raise ValidationError(_("Pallets must be between 0 and 33."))
\`\`\`

(In a real module you would put these methods directly into the class that defines the model; \`_inherit\` is shown to illustrate extension.)

Constraints run on \`create\` and \`write\` when one of the listed fields is in the values. They only accept simple field names, not dotted paths.

### SQL constraints

For uniqueness, use a database constraint:

\`\`\`python
    _sql_constraints = [
        ("name_order_uniq", "unique(name, sale_order_id)",
         "A delivery window name must be unique per order."),
    ]
\`\`\`

(Recent versions introduce a new declaration style for SQL constraints - verify against the documentation for your version when migrating.)

## Showing the new fields

\`\`\`xml
<xpath expr="//field[@name='payment_term_id']" position="after">
    <field name="academy_customer_po"/>
    <field name="academy_priority" widget="priority"/>
    <field name="academy_weight_total"/>
    <field name="academy_customer_country_id"/>
</xpath>
\`\`\`

And in the quotation list view (\`sale.view_quotation_tree\`, verify the external id in your version):

\`\`\`xml
<record id="view_quotation_tree_academy" model="ir.ui.view">
    <field name="name">sale.order.tree.academy</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_quotation_tree"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='amount_total']" position="before">
            <field name="academy_weight_total" optional="show" sum="Total weight"/>
        </xpath>
    </field>
</record>
\`\`\`

## Exercise steps

1. Add the computed and related fields to \`models/sale_order.py\`.
2. Add both constraints to the delivery window model.
3. Add the fields to the form and list views.
4. Restart and upgrade the module.
5. Set a weight on two products (*Inventory* tab of the product), add them to a quotation and change quantities.
6. Try to save a delivery window whose end is before its start.

## Expected output

- **Total Weight (kg)** updates when you change quantities (e.g. 3 x 12.5 kg + 2 x 4 kg = 45.50).
- **Customer Country** appears; you can *Group By* it in the list (because it is stored).
- Saving the invalid window shows: *"Delivery window 'Morning' must end after it starts."*

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| \`ValueError: Compute method failed to assign sale.order(5,).academy_weight_total\` | A branch of the loop did not assign a value | Assign in every case (default 0.0) |
| Stored value not updating | Missing dependency in \`@api.depends\` | Add the field path, upgrade; recompute existing records if necessary |
| Upgrade very slow | Stored compute on a large table recalculated for all rows | Expected once; plan the upgrade window |
| \`Field ... used in related path is not found\` | Typo in \`related\` path | Check field names in developer mode |
| Constraint not triggered | Field not listed in \`@api.constrains\` or written through SQL | List the fields; never write via SQL |

> **Consultant tip:** Stored computed fields are great for reports, but each one costs recomputation. For values only shown on the form, \`store=False\` is often enough.

## Key takeaways

- \`@api.depends\` drives recomputation; list every dependency.
- \`store=True\` makes a computed/related field searchable and groupable.
- \`@api.constrains\` + \`ValidationError\` protects data quality.
- SQL constraints enforce uniqueness at the database level.`,
        },
        {
          slug: "views-and-view-inheritance",
          title: "Views and view inheritance with XPath",
          durationMin: 45,
          odooVersions: "Odoo 17.0 (18.0 notes)",
          scope: ["customization"],
          body: `## Business context

Users judge a system by its screens. Sunrise's dispatchers need a kanban board of delivery windows, a search view with "Express" and "This week" filters, and the extra sales fields placed where salespeople naturally look. Good views reduce training time and data errors.

## View types

| View | Root tag (17) | Purpose |
|------|---------------|---------|
| Form | \`<form>\` | Edit one record |
| List | \`<tree>\` (17) / \`<list>\` (18) | Browse many records |
| Search | \`<search>\` | Filters, group-bys, search fields |
| Kanban | \`<kanban>\` | Cards, often grouped by stage |
| Calendar, Pivot, Graph, Activity | \`<calendar>\`, \`<pivot>\`, \`<graph>\`, \`<activity>\` | Planning and analysis |

## Odoo 17 changes you must know

- \`attrs\` and \`states\` attributes were **removed** in 17. Use Python-like expressions directly on \`invisible\`, \`readonly\` and \`required\`.

\`\`\`xml
<!-- Odoo 16 and earlier (no longer valid in 17) -->
<field name="academy_customer_po" attrs="{'invisible': [('state', '!=', 'draft')]}"/>

<!-- Odoo 17 -->
<field name="academy_customer_po" invisible="state != 'draft'"/>
<field name="academy_priority" readonly="state in ('sale', 'cancel')"/>
\`\`\`

- Fields used in these expressions must be present in the view (they can be added with \`invisible="1"\`).
- Odoo 18 renames the list root tag to \`<list>\` and \`view_mode\` values from \`tree\` to \`list\`.

## Starter code: views/academy_delivery_window_views.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="academy_delivery_window_view_tree" model="ir.ui.view">
        <field name="name">academy.delivery.window.tree</field>
        <field name="model">academy.delivery.window</field>
        <field name="arch" type="xml">
            <tree decoration-danger="delivery_type == 'express'">
                <field name="name"/>
                <field name="sale_order_id"/>
                <field name="date_from"/>
                <field name="date_to"/>
                <field name="delivery_type"/>
                <field name="pallet_count" sum="Pallets"/>
                <field name="tag_ids" widget="many2many_tags" optional="show"/>
            </tree>
        </field>
    </record>

    <record id="academy_delivery_window_view_form" model="ir.ui.view">
        <field name="name">academy.delivery.window.form</field>
        <field name="model">academy.delivery.window</field>
        <field name="arch" type="xml">
            <form>
                <sheet>
                    <div class="oe_title">
                        <h1><field name="name" placeholder="e.g. Morning slot"/></h1>
                    </div>
                    <group>
                        <group>
                            <field name="sale_order_id"/>
                            <field name="date_from"/>
                            <field name="date_to"/>
                        </group>
                        <group>
                            <field name="delivery_type"/>
                            <field name="pallet_count"/>
                            <field name="tail_lift" invisible="delivery_type == 'pickup'"/>
                            <field name="dock_contact_id"/>
                            <field name="tag_ids" widget="many2many_tags"/>
                        </group>
                    </group>
                    <field name="note" placeholder="Delivery instructions..."/>
                </sheet>
            </form>
        </field>
    </record>

    <record id="academy_delivery_window_view_search" model="ir.ui.view">
        <field name="name">academy.delivery.window.search</field>
        <field name="model">academy.delivery.window</field>
        <field name="arch" type="xml">
            <search>
                <field name="name"/>
                <field name="sale_order_id"/>
                <filter name="express" string="Express" domain="[('delivery_type', '=', 'express')]"/>
                <filter name="tail_lift" string="Tail-lift" domain="[('tail_lift', '=', True)]"/>
                <separator/>
                <filter name="date_from" string="Start Date" date="date_from"/>
                <group expand="0" string="Group By">
                    <filter name="group_type" string="Delivery Type" context="{'group_by': 'delivery_type'}"/>
                    <filter name="group_order" string="Sales Order" context="{'group_by': 'sale_order_id'}"/>
                </group>
            </search>
        </field>
    </record>

    <record id="academy_delivery_window_view_kanban" model="ir.ui.view">
        <field name="name">academy.delivery.window.kanban</field>
        <field name="model">academy.delivery.window</field>
        <field name="arch" type="xml">
            <kanban default_group_by="delivery_type">
                <field name="name"/>
                <field name="sale_order_id"/>
                <field name="date_from"/>
                <field name="pallet_count"/>
                <templates>
                    <t t-name="kanban-box">
                        <div class="oe_kanban_global_click">
                            <strong><field name="name"/></strong>
                            <div><field name="sale_order_id"/></div>
                            <div><field name="date_from"/> - <field name="pallet_count"/> pallets</div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <record id="academy_delivery_window_action" model="ir.actions.act_window">
        <field name="name">Delivery Windows</field>
        <field name="res_model">academy.delivery.window</field>
        <field name="view_mode">tree,kanban,form</field>
        <field name="search_view_id" ref="academy_delivery_window_view_search"/>
        <field name="context">{'search_default_express': 0}</field>
    </record>
</odoo>
\`\`\`

> Odoo 18 note: kanban templates use \`<t t-name="card">\` instead of \`kanban-box\` (verify against the documentation for your version).

## View inheritance

Inheriting views lets you change standard screens **without copying them**. You point at a parent view with \`inherit_id\`, locate a node with XPath, and say where your content goes.

\`\`\`xml
<record id="view_order_form_academy" model="ir.ui.view">
    <field name="name">sale.order.form.academy</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='payment_term_id']" position="after">
            <field name="academy_customer_po" readonly="state in ('sale', 'cancel')"/>
        </xpath>
        <xpath expr="//field[@name='client_order_ref']" position="attributes">
            <attribute name="string">Customer Reference (legacy)</attribute>
        </xpath>
    </field>
</record>
\`\`\`

| \`position\` | Effect |
|------------|--------|
| \`after\` / \`before\` | Insert next to the node |
| \`inside\` | Append as last child |
| \`replace\` | Replace the node (use sparingly - breaks other modules) |
| \`attributes\` | Change attributes of the node |

Shorthand: \`<field name="payment_term_id" position="after">...</field>\` is equivalent to the XPath above.

> **Consultant tip:** Prefer \`after\`, \`inside\` and \`attributes\` over \`replace\`. Replacing a node removes anchors other modules rely on and is the most common cause of "view broken after installing app X".

## Exercise steps

1. Replace your delivery window views with the code above.
2. Upgrade the module.
3. Open *Sales > Delivery Windows*: switch between list, kanban and form.
4. Use the **Express** filter and **Group By > Delivery Type**.
5. Confirm a sales order and check that **Customer PO** becomes read-only.

## Expected output

- Express rows in red in the list.
- Kanban grouped in columns Standard / Express / Customer Pickup.
- **Tail-lift Required** hidden for pickups.
- **Customer PO** read-only on confirmed orders.

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| \`Element '<xpath expr="//field[@name='payment_term']">' cannot be located in parent view\` | XPath target does not exist (typo, or field moved in this version) | Inspect the parent view in developer mode (*Edit View: Form*) and fix the path |
| \`Since 17.0, the "attrs" and "states" attributes are no longer used\` | Old syntax copied from a 16.0 tutorial | Rewrite with \`invisible=\`/\`readonly=\` expressions |
| \`Field 'state' used in modifier 'invisible' ... must be present in view\` | Field referenced but not in view | Add \`<field name="state" invisible="1"/>\` |
| \`Invalid view type: 'list'\` on 17 | Using 18 syntax on 17 | Use \`tree\` on 17 |
| Changes not visible | Module not upgraded or browser cache | \`-u\`, then hard refresh |

## Key takeaways

- Odoo 17 uses expressions in \`invisible\`/\`readonly\`/\`required\`; \`attrs\`/\`states\` are gone.
- List views are \`<tree>\` in 17 and \`<list>\` in 18.
- Inherit views with XPath; avoid \`replace\`.
- Search views make large datasets usable.`,
          resources: [{ title: "View architectures (Odoo 17)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/user_interface/view_architectures.html" }],
        },
        {
          slug: "actions-menus-and-security",
          title: "Actions, menus and security",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Sunrise's rule: **salespeople** may see and edit delivery windows only for their own orders; **sales managers** see everything; the **warehouse** may read windows but not change them. Menus must appear only for people who need them. This lesson connects actions, menus, groups, access rights and record rules.

## Actions

An action tells the web client what to do. The most common is the **window action**:

\`\`\`xml
<record id="academy_delivery_window_action" model="ir.actions.act_window">
    <field name="name">Delivery Windows</field>
    <field name="res_model">academy.delivery.window</field>
    <field name="view_mode">tree,kanban,form</field>
    <field name="domain">[]</field>
    <field name="context">{'search_default_express': 1}</field>
    <field name="help" type="html">
        <p class="o_view_nocontent_smiling_face">Create the first delivery window</p>
    </field>
</record>
\`\`\`

| Action type | Model | Use |
|-------------|-------|-----|
| Window action | \`ir.actions.act_window\` | Open views of a model |
| Server action | \`ir.actions.server\` | Run code or predefined operations |
| Report action | \`ir.actions.report\` | Print a PDF/HTML report |
| URL action | \`ir.actions.act_url\` | Open a web page |
| Client action | \`ir.actions.client\` | Load a JavaScript component (dashboards) |

## Menus

\`\`\`xml
<menuitem id="academy_menu_root_config"
          name="Delivery Setup"
          parent="sale.menu_sale_config"
          sequence="90"/>

<menuitem id="academy_delivery_tag_menu"
          name="Delivery Tags"
          parent="academy_menu_root_config"
          action="academy_delivery_tag_action"
          groups="sales_team.group_sale_manager"/>
\`\`\`

\`groups\` on a menu **hides** it but is not security: a user could still reach the model by other means. Real protection comes from access rights and record rules. (Verify parent menu ids such as \`sale.menu_sale_config\` in developer mode for your version.)

## Security layer 1: groups

\`\`\`xml
<record id="group_academy_warehouse_viewer" model="res.groups">
    <field name="name">Delivery Windows: Read Only</field>
    <field name="category_id" ref="base.module_category_hidden"/>
</record>
\`\`\`

Standard sales groups you will reuse: \`sales_team.group_sale_salesman\` (own documents), \`sales_team.group_sale_salesman_all_leads\` (all documents), \`sales_team.group_sale_manager\` (administrator).

## Security layer 2: access rights (ir.model.access.csv)

Model-level CRUD permissions per group:

\`\`\`text
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_academy_delivery_window_user,academy.delivery.window.user,model_academy_delivery_window,sales_team.group_sale_salesman,1,1,1,0
access_academy_delivery_window_manager,academy.delivery.window.manager,model_academy_delivery_window,sales_team.group_sale_manager,1,1,1,1
access_academy_delivery_window_wh,academy.delivery.window.warehouse,model_academy_delivery_window,group_academy_warehouse_viewer,1,0,0,0
access_academy_delivery_tag_user,academy.delivery.tag.user,model_academy_delivery_tag,sales_team.group_sale_salesman,1,0,0,0
access_academy_delivery_tag_manager,academy.delivery.tag.manager,model_academy_delivery_tag,sales_team.group_sale_manager,1,1,1,1
\`\`\`

| Column | Meaning |
|--------|---------|
| \`id\` | External id of the access line |
| \`model_id:id\` | \`model_\` + model name with underscores |
| \`group_id:id\` | Group external id; empty = applies to **everyone** (avoid) |
| \`perm_*\` | 1 = allowed, 0 = denied |

Rights are **additive**: if any of a user's groups grants a permission, the user has it.

## Security layer 3: record rules (security/academy_security.xml)

Record rules restrict **which records** a user can access:

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="group_academy_warehouse_viewer" model="res.groups">
        <field name="name">Delivery Windows: Read Only</field>
        <field name="category_id" ref="base.module_category_hidden"/>
    </record>

    <record id="academy_delivery_window_rule_own" model="ir.rule">
        <field name="name">Delivery windows: own orders only</field>
        <field name="model_id" ref="model_academy_delivery_window"/>
        <field name="domain_force">[('sale_order_id.user_id', '=', user.id)]</field>
        <field name="groups" eval="[(4, ref('sales_team.group_sale_salesman'))]"/>
    </record>

    <record id="academy_delivery_window_rule_all" model="ir.rule">
        <field name="name">Delivery windows: all</field>
        <field name="model_id" ref="model_academy_delivery_window"/>
        <field name="domain_force">[(1, '=', 1)]</field>
        <field name="groups" eval="[(4, ref('sales_team.group_sale_manager')), (4, ref('group_academy_warehouse_viewer'))]"/>
    </record>
</odoo>
\`\`\`

- Rules attached to groups are combined with **OR** across the user's groups: a manager (who is also a salesman) matches the "all" rule and sees everything.
- Global rules (no group) are combined with **AND** and restrict everyone - use with care.
- The group record is defined before the CSV loads because the manifest lists \`academy_security.xml\` first.

> **Consultant tip:** Test security by logging in as each persona, not as administrator. The admin bypasses most restrictions, so "it works for me" proves nothing.

## Exercise steps

1. Add the group, CSV lines and record rules above; upgrade the module.
2. Create users: *Sam Sales* (Sales: User - own documents), *Mia Manager* (Sales: Administrator), *Wes Warehouse* (Inventory user + Delivery Windows: Read Only).
3. As Sam, create a quotation with two windows. As Mia, create another order with windows.
4. Log in as each user and open *Sales > Delivery Windows* (for Wes, give him access via a menu or URL).

## Expected output

| User | Sees | Can edit |
|------|------|----------|
| Sam | Only windows on his orders | Yes (no delete) |
| Mia | All windows | Yes, including delete |
| Wes | All windows | No - saving shows an access error |

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| Log warning \`The model academy.delivery.window has no access rules\` | CSV missing/not loaded | Add to manifest \`data\`, upgrade |
| \`You are not allowed to access 'Customer Delivery Window' (academy.delivery.window) records\` | No access line for user's groups | Add/adjust CSV line |
| \`Due to security restrictions, you are not allowed to modify ...\` | Record rule excludes the record | Check \`domain_force\` and the user's groups |
| \`No matching record found for external id 'model_academy_delivery_window'\` | Model not loaded (Python import missing) | Fix imports, restart, upgrade |
| CSV loads but nothing applies | Wrong column header or extra spaces | Copy the exact header line |

## Key takeaways

- Actions open views; menus point to actions; menu \`groups\` only hide.
- Access rights (CSV) = which models and operations; record rules = which records.
- Group rules OR together; global rules AND together.
- Always test as real personas.`,
          resources: [{ title: "Security in Odoo (Odoo 17)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/backend/security.html" }],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* Module 3: Business logic & reports                                  */
    /* ------------------------------------------------------------------ */
    {
      title: "Business logic & reports",
      lessons: [
        {
          slug: "extending-sale-order",
          title: "Extending sale.order: fields and action_confirm",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Sunrise's B2B customers always send a purchase order number. Finance keeps rejecting invoices that lack it. Requirement: **a quotation for a company customer cannot be confirmed without a Customer PO**, and confirmation must log the PO in the chatter. This is the classic "extend a standard method" task.

## The inheritance pattern

\`\`\`text
sale.order.action_confirm()   (standard, module "sale")
   -> overridden by sale_stock, sale_project, ... (each calls super())
   -> overridden by academy_sale_extension      (our code calls super())
\`\`\`

Every module in the chain calls \`super()\`, so all of them run. If one override forgets \`super()\`, everything after it in the chain is silently skipped - pickings are not created, projects are not generated, and nobody notices until it is too late.

## Starter code

### __manifest__.py (unchanged dependencies)

\`\`\`python
{
    "name": "Academy Sale Extension",
    "version": "17.0.1.1.0",
    "summary": "Training module: sales extensions for Sunrise Office Supplies",
    "category": "Sales",
    "author": "ERP Consultant Academy",
    "license": "LGPL-3",
    "depends": ["sale_management"],
    "data": [
        "security/academy_security.xml",
        "security/ir.model.access.csv",
        "views/academy_delivery_window_views.xml",
        "views/sale_order_views.xml",
        "views/menus.xml",
    ],
    "installable": True,
}
\`\`\`

### models/sale_order.py

\`\`\`python
import logging

from odoo import _, api, fields, models
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class SaleOrder(models.Model):
    _inherit = "sale.order"

    academy_customer_po = fields.Char(string="Customer PO", copy=False, tracking=True)
    academy_po_required = fields.Boolean(
        string="PO Required",
        compute="_compute_academy_po_required",
    )

    @api.depends("partner_id", "partner_id.commercial_partner_id.is_company")
    def _compute_academy_po_required(self):
        for order in self:
            order.academy_po_required = bool(order.partner_id.commercial_partner_id.is_company)

    def action_confirm(self):
        for order in self:
            if order.academy_po_required and not order.academy_customer_po:
                raise UserError(
                    _("Order %s: enter the Customer PO before confirming.", order.name)
                )
        res = super().action_confirm()
        for order in self:
            if order.academy_customer_po:
                order.message_post(
                    body=_("Confirmed against customer PO %s.", order.academy_customer_po)
                )
            _logger.info("Academy: order %s confirmed by %s", order.name, self.env.user.login)
        return res
\`\`\`

### views/sale_order_views.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_order_form_academy" model="ir.ui.view">
        <field name="name">sale.order.form.academy</field>
        <field name="model">sale.order</field>
        <field name="inherit_id" ref="sale.view_order_form"/>
        <field name="arch" type="xml">
            <xpath expr="//field[@name='payment_term_id']" position="after">
                <field name="academy_po_required" invisible="1"/>
                <field name="academy_customer_po"
                       required="academy_po_required and state in ('draft', 'sent')"
                       readonly="state in ('sale', 'cancel')"/>
            </xpath>
        </field>
    </record>
</odoo>
\`\`\`

## Explanation

1. **Validate before \`super()\`** - if we raise, nothing has happened yet and the transaction rolls back cleanly.
2. **Call \`super()\` and keep its return value** - \`action_confirm\` may return an action (e.g. a wizard); returning \`res\` preserves it.
3. **Post-processing after \`super()\`** - the order is now in state \`sale\`, so we log to the chatter.
4. \`tracking=True\` records changes to the PO in the chatter, because \`sale.order\` inherits \`mail.thread\`.
5. The view's \`required=\` expression gives immediate feedback; the Python check is the real guarantee (it also protects imports and API calls).

> **Consultant tip:** UI-only validations can be bypassed by imports, the API or other modules. Business rules that matter must live in Python, with the view only improving the user experience.

## Exercise steps

1. Update \`models/sale_order.py\` and the view, bump the manifest version.
2. Restart and upgrade the module.
3. Create a quotation for a **company** customer without PO and click **Confirm**.
4. Enter PO "PO-2024-118" and confirm again.
5. Create a quotation for an **individual** (not a company) and confirm without PO.

## Expected output

- Step 3: dialog *"Order S00042: enter the Customer PO before confirming."*; order stays a quotation.
- Step 4: order confirmed, chatter shows *"Confirmed against customer PO PO-2024-118."*, a delivery is created if Inventory is installed (proves \`super()\` ran).
- Step 5: confirmed without error.
- Server log: \`INFO academy_dev odoo.addons.academy_sale_extension.models.sale_order: Academy: order S00042 confirmed by admin\`.

## Debugging guidance

| Symptom | Cause | Fix |
|---------|-------|-----|
| Order confirms but no delivery order is created | \`super()\` not called | Always call \`super().action_confirm()\` |
| \`TypeError: action_confirm() takes 1 positional argument but 2 were given\` | Changed method signature | Keep the same signature as the parent |
| PO field visible but never required | \`academy_po_required\` not in view | Add it (invisible) - needed by the expression |
| \`Field "academy_customer_po" does not exist\` after editing | Forgot restart/upgrade | Restart, \`-u academy_sale_extension\` |
| Error raised but some orders already confirmed | Validation done after \`super()\` | Validate all records first, then call \`super()\` |

## Key takeaways

- \`_inherit\` + same method name + \`super()\` is how you extend standard behaviour.
- Validate first, call \`super()\`, then post-process; return the parent's result.
- Keep real rules in Python; use view expressions for user feedback.
- \`tracking=True\` and \`message_post\` give an audit trail.`,
        },
        {
          slug: "smart-buttons",
          title: "Smart buttons",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Sunrise's sales team wants a one-click link from an order to its delivery windows, showing how many exist - just like the standard **Delivery** and **Invoices** buttons at the top of a sales order. These are **smart buttons**: stat buttons in the form's button box.

## Anatomy of a smart button

| Part | Purpose |
|------|---------|
| Counter field (computed, non-stored) | The number shown on the button |
| Python method returning an action | Opens the related records |
| \`<button>\` in \`button_box\` with \`class="oe_stat_button"\` | Renders the button |

## Starter code

### models/sale_order.py (additions)

\`\`\`python
from odoo import _, api, fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    delivery_window_ids = fields.One2many(
        "academy.delivery.window", "sale_order_id", string="Delivery Windows"
    )
    delivery_window_count = fields.Integer(
        string="Delivery Window Count", compute="_compute_delivery_window_count"
    )

    @api.depends("delivery_window_ids")
    def _compute_delivery_window_count(self):
        for order in self:
            order.delivery_window_count = len(order.delivery_window_ids)

    def action_view_delivery_windows(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": _("Delivery Windows"),
            "res_model": "academy.delivery.window",
            "view_mode": "tree,form",
            "domain": [("sale_order_id", "=", self.id)],
            "context": {"default_sale_order_id": self.id},
        }
\`\`\`

For large volumes, compute counts in one query with \`_read_group\` instead of \`len()\` per record (verify the exact \`_read_group\` signature for your version, it changed in 17.0).

### views/sale_order_views.xml (additions)

\`\`\`xml
<record id="view_order_form_academy_smart_button" model="ir.ui.view">
    <field name="name">sale.order.form.academy.smart.button</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//div[@name='button_box']" position="inside">
            <button name="action_view_delivery_windows"
                    type="object"
                    class="oe_stat_button"
                    icon="fa-calendar"
                    invisible="delivery_window_count == 0">
                <field name="delivery_window_count" widget="statinfo" string="Delivery Windows"/>
            </button>
        </xpath>
    </field>
</record>
\`\`\`

## Explanation

- \`type="object"\` calls the Python method \`action_view_delivery_windows\` on the current record.
- The method returns an **action dictionary** - the same structure as an \`ir.actions.act_window\` record.
- \`domain\` limits the list to this order's windows; \`context\` with \`default_sale_order_id\` pre-fills the order when the user creates a new window from that list.
- \`widget="statinfo"\` displays the number and label in the standard style.
- \`invisible="delivery_window_count == 0"\` hides the button when empty (a design choice - some clients prefer to always show it).
- In Odoo 18 use \`"view_mode": "list,form"\`.

### Alternative: open a single record directly

\`\`\`python
    def action_view_delivery_windows(self):
        self.ensure_one()
        action = {
            "type": "ir.actions.act_window",
            "name": _("Delivery Windows"),
            "res_model": "academy.delivery.window",
            "context": {"default_sale_order_id": self.id},
        }
        if len(self.delivery_window_ids) == 1:
            action.update({"view_mode": "form", "res_id": self.delivery_window_ids.id})
        else:
            action.update({
                "view_mode": "tree,form",
                "domain": [("sale_order_id", "=", self.id)],
            })
        return action
\`\`\`

This mirrors how standard Odoo opens one invoice directly but a list when there are several.

> **Consultant tip:** Smart buttons are one of the cheapest, highest-value customizations. When users complain "I have to search for related documents", a smart button is often the answer.

## Exercise steps

1. Add the count field, method and button.
2. Restart and upgrade.
3. Open a quotation with two delivery windows - the button shows **2 Delivery Windows**.
4. Click it, create a third window from the list (the order is pre-filled).
5. Go back - the button shows **3**.
6. Implement the "single record" alternative and test with an order that has one window.

## Expected output

- Button with calendar icon in the top-right button box.
- List filtered to the order's windows; new windows default to the order.
- With exactly one window, the form opens directly (alternative version).

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| \`Element '<xpath expr="//div[@name='button_box']">' cannot be located\` | Wrong name or view; button box exists in \`sale.view_order_form\` | Inspect the parent view, fix XPath |
| \`AttributeError: 'sale.order' object has no attribute 'action_view_delivery_windows'\` | Method name mismatch or server not restarted | Match names exactly; restart |
| \`Expected singleton\` | Method called on several records | Keep \`self.ensure_one()\` |
| List shows all windows | Missing \`domain\` | Add the domain |
| Button count wrong | Missing \`@api.depends\` or computed stored without dependency | Add dependency |

## Design guidelines

| Guideline | Reason |
|-----------|--------|
| Show counts users act on (open items, related documents) | Buttons are navigation, not decoration |
| Keep at most a handful of custom buttons per form | Too many buttons hide the important ones in a "More" dropdown |
| Use non-stored counters | Counts are cheap to compute and always current |
| Respect access rights | A user without read access to the target model should not see the button - add \`groups=\` matching the CSV rights |
| Reuse standard icons (Font Awesome \`fa-*\`) | Consistent look with standard buttons |

When the target model has record rules, the count computed by \`len()\` reflects only the records the current user may see, which is usually what users expect. Mention this in your functional specification so testers are not surprised when a salesperson and a manager see different numbers on the same order.

## Key takeaways

- A smart button = counter field + action method + stat button in \`button_box\`.
- Return an action dictionary with \`domain\` and \`context\` defaults.
- Use \`view_mode\` \`tree,form\` in 17 and \`list,form\` in 18.`,
        },
        {
          slug: "approval-workflow",
          title: "Basic approval workflow with a state field",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Sunrise wants **manager approval for quotations above 10,000** before they can be confirmed. Sales has an optional standard approval mechanism in some areas (for example Purchase has a standard two-step validation setting), but Sales does not provide this exact rule out of the box, so we build a light approval workflow. Always check standard options and Studio first - and document why custom code was chosen.

## Workflow design

| Approval state | Meaning | Who acts | Buttons visible |
|----------------|---------|----------|-----------------|
| \`not_required\` | Below threshold | - | Confirm |
| \`draft\` | Above threshold, not yet requested | Salesperson | Request Approval |
| \`to_approve\` | Waiting for manager | Sales manager | Approve, Reject |
| \`approved\` | Can be confirmed | Salesperson | Confirm |
| \`rejected\` | Needs rework | Salesperson | Reset to Draft |

## Starter code

### models/sale_order.py (approval part)

\`\`\`python
from odoo import _, api, fields, models
from odoo.exceptions import UserError

APPROVAL_PARAM = "academy_sale_extension.approval_threshold"


class SaleOrder(models.Model):
    _inherit = "sale.order"

    academy_approval_state = fields.Selection(
        [
            ("not_required", "Not Required"),
            ("draft", "To Request"),
            ("to_approve", "Waiting Approval"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        string="Approval",
        default="not_required",
        copy=False,
        tracking=True,
    )
    academy_approved_by_id = fields.Many2one("res.users", string="Approved By", copy=False, readonly=True)

    def _academy_threshold(self):
        value = self.env["ir.config_parameter"].sudo().get_param(APPROVAL_PARAM, "10000")
        return float(value)

    def _academy_needs_approval(self):
        self.ensure_one()
        return self.amount_total > self._academy_threshold()

    def action_academy_request_approval(self):
        for order in self:
            if not order._academy_needs_approval():
                order.academy_approval_state = "not_required"
                continue
            order.academy_approval_state = "to_approve"
            order.message_post(body=_("Approval requested for %s.", order.amount_total))

    def action_academy_approve(self):
        if not self.env.user.has_group("sales_team.group_sale_manager"):
            raise UserError(_("Only sales managers can approve quotations."))
        self.write({"academy_approval_state": "approved", "academy_approved_by_id": self.env.user.id})

    def action_academy_reject(self):
        if not self.env.user.has_group("sales_team.group_sale_manager"):
            raise UserError(_("Only sales managers can reject quotations."))
        self.write({"academy_approval_state": "rejected"})

    def action_academy_reset(self):
        self.write({"academy_approval_state": "draft", "academy_approved_by_id": False})

    def action_confirm(self):
        for order in self:
            if order._academy_needs_approval() and order.academy_approval_state != "approved":
                raise UserError(_("Order %s needs manager approval before confirmation.", order.name))
        return super().action_confirm()
\`\`\`

If you already overrode \`action_confirm\` in the previous lesson, merge both checks into **one** override in the same class.

### data/academy_data.xml (default threshold, add to manifest data)

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo noupdate="1">
    <record id="param_approval_threshold" model="ir.config_parameter">
        <field name="key">academy_sale_extension.approval_threshold</field>
        <field name="value">10000</field>
    </record>
</odoo>
\`\`\`

### views/sale_order_views.xml (header buttons)

\`\`\`xml
<record id="view_order_form_academy_approval" model="ir.ui.view">
    <field name="name">sale.order.form.academy.approval</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//header" position="inside">
            <button name="action_academy_request_approval" type="object" string="Request Approval"
                    class="btn-primary"
                    invisible="state not in ('draft', 'sent') or academy_approval_state not in ('not_required', 'draft')"/>
            <button name="action_academy_approve" type="object" string="Approve" class="btn-primary"
                    groups="sales_team.group_sale_manager"
                    invisible="academy_approval_state != 'to_approve'"/>
            <button name="action_academy_reject" type="object" string="Reject"
                    groups="sales_team.group_sale_manager"
                    invisible="academy_approval_state != 'to_approve'"/>
            <button name="action_academy_reset" type="object" string="Reset Approval"
                    invisible="academy_approval_state != 'rejected'"/>
        </xpath>
        <xpath expr="//field[@name='payment_term_id']" position="after">
            <field name="academy_approval_state" widget="badge"
                   decoration-warning="academy_approval_state == 'to_approve'"
                   decoration-success="academy_approval_state == 'approved'"
                   decoration-danger="academy_approval_state == 'rejected'"/>
            <field name="academy_approved_by_id" invisible="not academy_approved_by_id"/>
        </xpath>
    </field>
</record>
\`\`\`

## Explanation

- The threshold is a **system parameter**, so the client can change it without code (*Settings > Technical > System Parameters*).
- \`noupdate="1"\` stops module upgrades from overwriting the value a client changed.
- Approval rights are enforced **in Python** (\`has_group\`); \`groups=\` on buttons only hides them.
- Note the Odoo 17 syntax: \`invisible="academy_approval_state != 'to_approve'"\` instead of the removed \`states\`/\`attrs\`.
- Production systems should also reset approval when the amount changes after approval. Add that as an extension (hint: override \`write\` carefully, or compare amounts at confirmation time).

> **Consultant tip:** Before building approvals, map the full lifecycle: what happens on rejection, on amount change after approval, on duplication, and on cancellation? Most approval bugs come from these edge cases, not the happy path.

## Exercise steps

1. Add the code, the data file (listed in the manifest after security), and upgrade.
2. As Sam (salesperson), create a quotation of 12,000 and click **Confirm**.
3. Click **Request Approval**.
4. As Mia (manager), open it and **Approve**.
5. As Sam, **Confirm**.
6. Repeat with a rejection and reset.

## Expected output

- Step 2: *"Order S00051 needs manager approval before confirmation."*
- Step 3: badge **Waiting Approval**, chatter entry.
- Step 4: badge **Approved**, *Approved By: Mia Manager*.
- Step 5: order confirmed.
- Sam never sees **Approve/Reject**.

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| \`Since 17.0, the "attrs" and "states" attributes are no longer used\` | Old syntax | Use \`invisible=\` expressions |
| Buttons never show | Expression references a field not in the view, or wrong state value | Ensure fields are in view; check selection keys |
| \`ValueError: could not convert string to float\` | System parameter contains text | Fix the parameter value |
| Threshold reset after upgrade | Data file without \`noupdate="1"\` | Add \`noupdate\` |

## Key takeaways

- A selection "state" field + buttons + guarded methods = a simple workflow.
- Enforce permissions in Python, not only with \`groups\` on buttons.
- Keep thresholds configurable.
- Design for edge cases: rejection, changes after approval, duplication.`,
        },
        {
          slug: "scheduled-and-automated-actions",
          title: "Scheduled actions, activities, server actions and automation rules",
          durationMin: 45,
          odooVersions: "Odoo 17.0 (18.0 notes)",
          scope: ["standard", "configuration", "customization"],
          body: `## Business context

Quotations waiting for approval are being forgotten. Sunrise wants:

1. **Every morning**, managers get a to-do activity for each quotation waiting more than one day.
2. Salespeople can **request approval for many quotations at once** from the list.
3. When an express delivery window is created, the dispatcher is notified - ideally **without code**.

These map to scheduled actions (\`ir.cron\`), activities, server actions and automation rules.

## Tool selection

| Need | Tool | Code? |
|------|------|-------|
| Run periodically | Scheduled action (\`ir.cron\`) | Usually Python |
| Ask a person to do something | Activity (\`mail.activity\`) | Optional |
| Button in the *Actions* menu | Server action (\`ir.actions.server\`) | Optional |
| React to record events (create, update, time-based) | Automation rule (\`base_automation\`, called *Automation Rules* in 17) | Optional |

## Scheduled action: starter code

### models/sale_order.py (cron method)

\`\`\`python
from datetime import timedelta

from odoo import _, api, fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def _cron_academy_remind_pending_approvals(self):
        limit_date = fields.Datetime.now() - timedelta(days=1)
        orders = self.search([
            ("academy_approval_state", "=", "to_approve"),
            ("write_date", "<", limit_date),
        ])
        summary = _("Approve quotation")
        for order in orders:
            already = order.activity_ids.filtered(lambda a: a.summary == summary)
            if already:
                continue
            manager = order.team_id.user_id or self.env.ref("base.user_admin")
            order.activity_schedule(
                "mail.mail_activity_data_todo",
                summary=summary,
                note=_("Quotation %s is waiting for approval.", order.name),
                user_id=manager.id,
            )
\`\`\`

### data/academy_cron.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo noupdate="1">
    <record id="ir_cron_academy_pending_approvals" model="ir.cron">
        <field name="name">Academy: remind pending approvals</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="state">code</field>
        <field name="code">model._cron_academy_remind_pending_approvals()</field>
        <field name="interval_number">1</field>
        <field name="interval_type">days</field>
        <field name="numbercall">-1</field>
        <field name="active">True</field>
    </record>
</odoo>
\`\`\`

> Odoo 18 note: the \`numbercall\` field was removed from \`ir.cron\`; drop that line on 18 (verify against the documentation for your version).

Explanation:

- \`model\` in the cron code is the empty recordset of \`sale.order\`; the method is decorated \`@api.model\` and searches itself.
- \`activity_schedule\` is provided by \`mail.activity.mixin\`, which \`sale.order\` inherits. The first argument is the external id of an activity type.
- The duplicate check makes the cron **idempotent**: running it twice does not create two activities.
- Test immediately from *Settings > Technical > Scheduled Actions > Run Manually*.

## Server action: mass "Request approval"

\`\`\`xml
<record id="action_server_academy_request_approval" model="ir.actions.server">
    <field name="name">Request Approval</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="binding_model_id" ref="sale.model_sale_order"/>
    <field name="binding_view_types">list</field>
    <field name="state">code</field>
    <field name="code">records.action_academy_request_approval()</field>
</record>
\`\`\`

\`binding_model_id\` adds it to the **Actions** (gear) menu; \`records\` is the selection.

## Automation rule (no code, configuration)

Automation rules require the **Automation Rules** module (\`base_automation\`). Configure in developer mode under *Settings > Technical > Automation > Automation Rules* (menu path may differ slightly - verify for your version):

| Setting | Value |
|---------|-------|
| Model | Customer Delivery Window |
| Trigger | On create (or "On create and edit" with a filter) |
| Apply on | Delivery type = Express |
| Action | Create activity - type To-Do, assigned to the dispatcher |

You can also ship automation rules in a module's XML, but the field names of \`base.automation\` changed between versions; for training, configure them through the UI on a test database and export the definition only after verifying the model fields.

## When to use code vs configuration

| Criterion | Prefer configuration | Prefer code |
|-----------|---------------------|-------------|
| Simple condition + standard action | Yes | |
| Needs loops, external calls, complex rules | | Yes |
| Must be version-controlled and tested | | Yes |
| Client wants to tweak it themselves | Yes | |

> **Consultant tip:** Scheduled actions on a duplicated database are deactivated by neutralization - which is good. But remember to **re-test them manually** there; a cron that silently fails in production is a classic "we never knew" incident.

## Exercise steps

1. Add the cron method and XML file (list \`data/academy_cron.xml\` in the manifest), upgrade.
2. Put two quotations in **Waiting Approval**. For training, temporarily change the domain to skip the \`write_date\` condition, or wait a day.
3. Run the scheduled action manually.
4. Run it again and confirm no duplicates.
5. Select three quotations in the list and use *Actions > Request Approval*.
6. Configure the automation rule and create an express delivery window.

## Expected output

- Activities "Approve quotation" assigned to the team leader (or admin), visible in the order's chatter and in the activity menu.
- Second run creates nothing new.
- Mass action moves the selected high-value quotations to **Waiting Approval**.
- Express window creation schedules a To-Do for the dispatcher.

## Debugging guidance

| Symptom | Cause | Fix |
|---------|-------|-----|
| Cron never runs | Inactive (neutralized db) or server running without cron workers | Run manually; check \`active\` and server mode |
| \`ValueError: External ID not found in the system: mail.mail_activity_data_todo\` | Typo or \`mail\` not installed | Fix id; \`sale\` depends on \`mail\` so it should exist |
| \`AttributeError: 'sale.order' object has no attribute '_cron_academy_...'\` | Method name mismatch or code not reloaded | Match names, restart |
| Duplicate activities | No idempotency check | Filter existing activities first |
| Cron data change ignored after upgrade | \`noupdate="1"\` | Edit in UI or remove the record's noupdate flag consciously |

## Key takeaways

- \`ir.cron\` for periodic jobs; make them idempotent.
- \`activity_schedule\` creates to-dos on any model with \`mail.activity.mixin\`.
- Server actions add mass operations to the Actions menu.
- Automation Rules (\`base_automation\`) cover many needs without code.`,
          resources: [{ title: "Odoo 17 developer documentation", kind: "link", url: DOC_DEV }],
        },
        {
          slug: "qweb-pdf-reports",
          title: "QWeb PDF reports and inheriting the sales order report",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Sunrise's drivers need a printed **Delivery Window sheet** per order. Customers also want their **PO number** on the quotation PDF. One new report and one inherited report - the two most common reporting tasks for consultants.

## How Odoo reports work

| Piece | Role |
|-------|------|
| \`ir.actions.report\` | Declares the report: model, type (\`qweb-pdf\`), template name, print menu binding |
| QWeb template | XML/HTML template rendered for the records (\`docs\`) |
| Layout (\`web.external_layout\`) | Company header/footer from *Settings > Document Layout* |
| wkhtmltopdf | Converts the HTML to PDF (must be installed on the server with the supported version) |

## Starter code: new report

### report/academy_delivery_window_report.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="action_report_academy_delivery_windows" model="ir.actions.report">
        <field name="name">Delivery Windows</field>
        <field name="model">sale.order</field>
        <field name="report_type">qweb-pdf</field>
        <field name="report_name">academy_sale_extension.report_delivery_windows</field>
        <field name="report_file">academy_sale_extension.report_delivery_windows</field>
        <field name="print_report_name">'Delivery Windows - %s' % object.name</field>
        <field name="binding_model_id" ref="sale.model_sale_order"/>
        <field name="binding_type">report</field>
    </record>

    <template id="report_delivery_windows">
        <t t-call="web.html_container">
            <t t-foreach="docs" t-as="o">
                <t t-call="web.external_layout">
                    <div class="page">
                        <h2>Delivery Windows - <span t-field="o.name"/></h2>
                        <p>
                            Customer: <span t-field="o.partner_id"/><br/>
                            Customer PO: <span t-esc="o.academy_customer_po or '-'"/>
                        </p>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Window</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Type</th>
                                    <th class="text-end">Pallets</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr t-foreach="o.delivery_window_ids" t-as="w">
                                    <td><span t-field="w.name"/></td>
                                    <td><span t-field="w.date_from"/></td>
                                    <td><span t-field="w.date_to"/></td>
                                    <td><span t-field="w.delivery_type"/></td>
                                    <td class="text-end"><span t-field="w.pallet_count"/></td>
                                </tr>
                            </tbody>
                        </table>
                        <p t-if="not o.delivery_window_ids">No delivery windows planned.</p>
                        <p>Total weight: <span t-field="o.academy_weight_total"/> kg</p>
                    </div>
                </t>
            </t>
        </t>
    </template>
</odoo>
\`\`\`

Add \`"report/academy_delivery_window_report.xml"\` to the manifest \`data\`.

## Starter code: inheriting the sales order report

The quotation/order PDF body is the template \`sale.report_saleorder_document\`, where the record variable is \`doc\`.

### report/sale_report_inherit.xml

\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="report_saleorder_document_academy" inherit_id="sale.report_saleorder_document">
        <xpath expr="//div[@id='informations']" position="inside">
            <div t-if="doc.academy_customer_po" class="col-auto col-3 mw-100 mb-2">
                <strong>Customer PO:</strong>
                <p class="m-0" t-field="doc.academy_customer_po"/>
            </div>
        </xpath>
    </template>
</odoo>
\`\`\`

The \`informations\` block holds the reference/date/salesperson boxes in 17.0; template structure changes between versions, so open the parent template in developer mode and **verify the XPath target for your version** before relying on it. A safer generic anchor is \`//div[hasclass('page')]\` with \`position="inside"\` (appends at the end of the page).

## QWeb cheat sheet

| Directive | Use |
|-----------|-----|
| \`t-field="o.field"\` | Formatted output (dates, currencies, many2one names) - preferred |
| \`t-esc="expr"\` | Escaped raw value (\`t-out\` is the newer equivalent) |
| \`t-if\` / \`t-elif\` / \`t-else\` | Conditions |
| \`t-foreach="items" t-as="x"\` | Loops |
| \`t-call="template"\` | Include another template |
| \`t-set="var" t-value="expr"\` | Variables |

> **Consultant tip:** Before customizing a report, check *Settings > Companies > Configure Document Layout* - logo, colours, fonts and footer are configuration, not code. Many "report change" requests end there.

## Exercise steps

1. Create both XML files, add them to the manifest, upgrade.
2. Open a confirmed order with delivery windows: *Print > Delivery Windows*.
3. Print the standard quotation for an order with a Customer PO.
4. Use the report's HTML preview for faster iteration: in developer mode, open the report action and use the HTML report type, or change \`/report/pdf/\` to \`/report/html/\` in the URL.

## Expected output

- PDF named *Delivery Windows - S00042.pdf* with company header, table of windows and total weight.
- Standard quotation PDF shows **Customer PO: PO-2024-118** in the information row.
- Orders without PO show no empty box.

## Debugging guidance

| Error | Cause | Fix |
|-------|-------|-----|
| \`Element '<xpath expr="//div[@id='informations']">' cannot be located in parent view\` | Template differs in your version | Inspect parent template, change anchor |
| \`QWebException: 'sale.order' object has no attribute 'academy_customer_po'\` | Field not loaded | Restart and upgrade |
| PDF without header/styles | wkhtmltopdf cannot reach the server URL (\`web.base.url\`) or wrong version | Check \`web.base.url\` and the wkhtmltopdf version |
| \`ParseError\` on report XML | Unescaped \`&\` or \`<\` in text | Use \`&amp;\` / \`&lt;\` |
| Report missing in Print menu | No \`binding_model_id\`/\`binding_type\` | Add them, upgrade |

## Requirement checklist for report requests

Before building, collect from the client:

| Question | Why it matters |
|----------|----------------|
| Who prints it, how often, on which paper format? | Paper format and margins (\`report.paperformat\`) |
| Which language - the user's or the customer's? | Translations: standard reports render in the partner's language |
| Is it a new document or a change to a standard one? | New report vs inheritance |
| Is it legally regulated (invoices, delivery notes)? | Localisation requirements may restrict changes |
| Does it need data not stored in Odoo? | May require new fields first |

Agree on a sample (a marked-up PDF of the standard report works well) before coding; reports are where "small" visual changes multiply.

## Key takeaways

- A report = \`ir.actions.report\` + QWeb template, usually wrapped in \`web.external_layout\`.
- Inherit standard reports with XPath instead of copying them.
- Verify template anchors per version.
- Use HTML preview to iterate quickly.`,
          resources: [{ title: "QWeb reports (Odoo 17)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/backend/reports.html" }],
        },
        {
          slug: "debugging-and-logging",
          title: "Debugging and logging",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "customization"],
          body: `## Business context

"It doesn't work" is the most common support ticket. Your job is to turn it into a reproducible, explained problem. Good consultants solve half of technical issues themselves using developer mode and logs, and hand developers precise evidence for the rest.

## A structured debugging method

1. **Reproduce** in a test database with the same version and modules.
2. **Read the error** - the last lines of a traceback name the exception and message; the lines above show the call path.
3. **Locate** - which module and file appear in the traceback? Is it standard or custom?
4. **Isolate** - does it happen without the custom module? With another user?
5. **Fix and verify** - then add a test so it does not come back.

## Developer mode tools

Activate with *Settings > Activate the developer mode* or \`?debug=1\` in the URL (\`?debug=assets\` also loads unminified JavaScript).

| Tool | Where | Use |
|------|-------|-----|
| Field tooltips | Hover a field label | Technical name, model, type, related/computed info |
| *Edit View* | Bug icon menu | See the combined view arch and inheriting views |
| *View Fields* / *Metadata* | Bug icon menu | External id, create/write info of the record |
| *Technical* menu | Settings | Models, views, actions, rules, crons, parameters |

## Server logs

Logs are your primary evidence.

\`\`\`text
2024-05-14 08:12:03,551 4242 INFO academy_dev odoo.modules.loading: Loading module academy_sale_extension (85/85)
2024-05-14 08:12:03,902 4242 WARNING academy_dev odoo.modules.loading: The model academy.delivery.tag has no access rules, consider adding one. E.g. access_academy_delivery_tag,access_academy_delivery_tag,model_academy_delivery_tag,base.group_user,1,0,0,0
2024-05-14 08:12:04,113 4242 ERROR academy_dev odoo.modules.registry: Failed to load registry
\`\`\`

Format: timestamp, process id, level, database, logger (Python module), message.

### Logging from your code

\`\`\`python
import logging

from odoo import models

_logger = logging.getLogger(__name__)


class SaleOrder(models.Model):
    _inherit = "sale.order"

    def action_confirm(self):
        _logger.info("Confirming %s orders: %s", len(self), self.mapped("name"))
        try:
            return super().action_confirm()
        except Exception:
            _logger.exception("Confirmation failed for %s", self.mapped("name"))
            raise
\`\`\`

- Use \`%s\` placeholders with arguments (lazy formatting), not string concatenation.
- \`_logger.exception\` logs the traceback; re-raise so the transaction still rolls back.
- **Never log secrets, passwords, tokens or full personal data.**

| Level | Use |
|-------|-----|
| \`debug\` | Detailed tracing during development |
| \`info\` | Normal significant events |
| \`warning\` | Unexpected but handled |
| \`error\` / \`exception\` | Failures |

Control verbosity:

\`\`\`bash
./odoo-bin -c odoo.conf -d academy_dev --log-level=debug
./odoo-bin -c odoo.conf -d academy_dev --log-handler=odoo.addons.academy_sale_extension:DEBUG
\`\`\`

## Development flags

\`\`\`bash
./odoo-bin -c odoo.conf -d academy_dev -u academy_sale_extension --dev=all
\`\`\`

\`--dev=all\` enables reload on Python changes, reads QWeb/XML views from files and opens a debugger (\`pdb\`) on exceptions. You can also add a breakpoint in code:

\`\`\`python
import pdb; pdb.set_trace()   # remove before committing!
\`\`\`

Never use \`--dev\` in production.

## Error catalogue for this course

| Message | Root cause | Fix |
|---------|-----------|-----|
| \`The model X has no access rules, consider adding one\` | Missing \`ir.model.access.csv\` line | Add CSV line, list file in manifest, upgrade |
| \`lxml.etree.XMLSyntaxError\` / \`ParseError while parsing ...xml:LINE\` | Malformed XML (unclosed tag, \`&\`, merge markers) | Fix the reported line |
| \`Field "academy_customer_po" does not exist in model "sale.order"\` | View loaded but Python field missing: forgot restart or upgrade, import missing | Restart, check \`__init__.py\`, \`-u module\` |
| Field present in code but not on screen | Module not upgraded or view inheritance not loaded | \`-u module\`, check manifest \`data\` |
| \`Element ... cannot be located in parent view\` | Wrong XPath | Inspect parent view |
| \`Expected singleton\` | Field access on multi-record set | Loop / \`ensure_one\` |
| \`Compute method failed to assign\` | Compute branch without assignment | Assign in all branches |
| \`AccessError\` for a user but not admin | Rights or record rules | Test as user, review CSV and rules |
| \`psycopg2.errors.UniqueViolation\` | SQL constraint triggered | Check data / constraint |

> **Consultant tip:** When escalating to a developer, send: Odoo version and edition, module list (or commit hash), exact steps, user used, full traceback from the server log, and whether it reproduces on a fresh test copy. This turns a two-day ping-pong into a one-hour fix.

## Exercise steps

1. Remove a line from your CSV and upgrade - read the warning.
2. Introduce a typo in an XML tag and upgrade - read the \`ParseError\` line number.
3. Add a field to a view but not to Python - read the error.
4. Add an \`_logger.info\` in \`action_confirm\` and confirm an order; find the log line.
5. Restore everything.

## Expected output

Three distinct error messages captured with their fix, plus your own info log line, e.g. \`INFO academy_dev odoo.addons.academy_sale_extension.models.sale_order: Confirming 1 orders: ['S00042']\`.

## Key takeaways

- Reproduce, read, locate, isolate, fix, test.
- Developer mode exposes technical names and view structure.
- Log with \`_logger\` and placeholders; never log secrets.
- \`--dev=all\` speeds development but stays out of production.`,
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* Module 4: Testing & practice                                        */
    /* ------------------------------------------------------------------ */
    {
      title: "Testing & practical assignments",
      lessons: [
        {
          slug: "automated-tests",
          title: "Automated tests with TransactionCase",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["customization"],
          body: `## Business context

Every Odoo upgrade and every new feature risks breaking Sunrise's rules: PO required, approval above 10,000, valid delivery windows. Manual retesting is slow and gets skipped. Automated tests run in minutes and document the expected behaviour.

## Test types in Odoo

| Class | Behaviour | Use |
|-------|-----------|-----|
| \`TransactionCase\` | Each test method runs in a transaction rolled back afterwards (records from \`setUpClass\` are shared) | Most business logic tests |
| \`Form\` helper (\`odoo.tests.Form\`) | Simulates the form view (onchanges, defaults) | UI-level logic |
| \`HttpCase\` | Runs a browser/HTTP server | Tours, controllers |

## Starter code

### tests/__init__.py

\`\`\`python
from . import test_academy_sale
\`\`\`

Do **not** import \`tests\` from the module's root \`__init__.py\`; the test runner discovers the \`tests\` package itself.

### tests/test_academy_sale.py

\`\`\`python
from datetime import timedelta

from odoo import Command, fields
from odoo.exceptions import UserError, ValidationError
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install", "academy")
class TestAcademySale(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company_customer = cls.env["res.partner"].create({
            "name": "Test Company Customer",
            "is_company": True,
        })
        cls.product = cls.env["product.product"].create({
            "name": "Training Desk",
            "list_price": 100.0,
            "weight": 12.5,
        })
        cls.env["ir.config_parameter"].sudo().set_param(
            "academy_sale_extension.approval_threshold", "10000"
        )

    def _create_order(self, qty=2, price=100.0):
        return self.env["sale.order"].create({
            "partner_id": self.company_customer.id,
            "order_line": [Command.create({
                "product_id": self.product.id,
                "product_uom_qty": qty,
                "price_unit": price,
            })],
        })

    def test_weight_total_computed(self):
        order = self._create_order(qty=2)
        self.assertAlmostEqual(order.academy_weight_total, 25.0)
        order.order_line.product_uom_qty = 4
        self.assertAlmostEqual(order.academy_weight_total, 50.0)

    def test_po_required_for_company(self):
        order = self._create_order()
        with self.assertRaises(UserError):
            order.action_confirm()
        order.academy_customer_po = "PO-TEST-1"
        order.action_confirm()
        self.assertEqual(order.state, "sale")

    def test_approval_required_above_threshold(self):
        order = self._create_order(qty=1, price=20000.0)
        order.academy_customer_po = "PO-TEST-2"
        with self.assertRaises(UserError):
            order.action_confirm()
        order.action_academy_request_approval()
        self.assertEqual(order.academy_approval_state, "to_approve")
        order.action_academy_approve()   # test runs as admin, who is a sales manager
        order.action_confirm()
        self.assertEqual(order.state, "sale")

    def test_delivery_window_dates(self):
        order = self._create_order()
        now = fields.Datetime.now()
        with self.assertRaises(ValidationError):
            self.env["academy.delivery.window"].create({
                "name": "Wrong",
                "sale_order_id": order.id,
                "date_from": now,
                "date_to": now - timedelta(hours=1),
            })
\`\`\`

## Explanation

- \`@tagged("post_install", "-at_install")\` runs the tests after **all** modules are installed (so other modules' overrides of \`action_confirm\` are present). The custom tag \`academy\` lets you filter.
- \`setUpClass\` creates shared data once; each test's changes are rolled back.
- Tests use \`assertEqual\`, \`assertAlmostEqual\` (floats), \`assertRaises\` (expected errors).
- Tests run as the superuser environment by default; to test permissions, use \`self.env(user=some_user)\` or \`order.with_user(user)\`.

## Running tests

Always on a **dedicated test database**, never production:

\`\`\`bash
./odoo-bin -c odoo.conf -d academy_test -i academy_sale_extension --test-enable --stop-after-init
\`\`\`

Only your tests (faster):

\`\`\`bash
./odoo-bin -c odoo.conf -d academy_test -u academy_sale_extension --test-enable --test-tags /academy_sale_extension --stop-after-init
\`\`\`

By custom tag:

\`\`\`bash
./odoo-bin -c odoo.conf -d academy_test -u academy_sale_extension --test-tags academy --stop-after-init
\`\`\`

| Option | Meaning |
|--------|---------|
| \`-i\` / \`-u\` | Install / upgrade the module (tests run during this) |
| \`--test-enable\` | Run tests |
| \`--test-tags\` | Filter: \`/module\`, \`tag\`, \`/module:Class.method\` (implies test-enable in recent versions) |
| \`--stop-after-init\` | Exit when done (CI-friendly) |

## Expected output

\`\`\`text
INFO academy_test odoo.addons.academy_sale_extension.tests.test_academy_sale: Starting TestAcademySale.test_approval_required_above_threshold ...
INFO academy_test odoo.addons.academy_sale_extension.tests.test_academy_sale: Starting TestAcademySale.test_delivery_window_dates ...
INFO academy_test odoo.addons.academy_sale_extension.tests.test_academy_sale: Starting TestAcademySale.test_po_required_for_company ...
INFO academy_test odoo.addons.academy_sale_extension.tests.test_academy_sale: Starting TestAcademySale.test_weight_total_computed ...
INFO academy_test odoo.tests.stats: academy_sale_extension: 4 tests ...
INFO academy_test odoo.tests.result: 0 failed, 0 error(s) of 4 tests when loading database 'academy_test'
\`\`\`

(Exact wording varies by version; look for \`0 failed, 0 error(s)\`.)

## Debugging guidance

| Symptom | Cause | Fix |
|---------|-------|-----|
| No tests run | Missing \`--test-enable\`/\`--test-tags\`, \`tests/__init__.py\` not importing the file, or file name not starting with \`test_\` | Fix import and naming |
| \`FAIL: ... AssertionError: 0.0 != 25.0\` | Compute dependency missing, or product weight not set | Check \`@api.depends\` and test data |
| \`ERROR: ... UserError: Order ... needs manager approval\` in a test that should pass | Threshold or data different than you think | Set the parameter explicitly in \`setUpClass\` |
| Tests pass locally but fail in CI | Depends on demo data or existing records | Create all data in the test |

> **Consultant tip:** Write test scenarios in plain language in the functional spec ("Given a company customer without PO, when confirming, then an error appears"). Developers can turn them almost one-to-one into test methods.

## Exercise steps

1. Create the \`tests\` package and file.
2. Run all module tests on \`academy_test\`.
3. Break the compute (remove a dependency) and observe the failure, then fix it.
4. Add a test that a **rejected** quotation cannot be confirmed.

## Key takeaways

- \`TransactionCase\` + \`@tagged("post_install", "-at_install")\` covers most business logic.
- Create your own test data; never rely on production data.
- Run with \`--test-enable\`/\`--test-tags\` and \`--stop-after-init\` on a test database.
- Tests are living documentation of the client's rules.`,
          resources: [{ title: "Testing Odoo (Odoo 17)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/backend/testing.html" }],
        },
        {
          slug: "practical-development-assignments",
          title: "Practical development assignments",
          durationMin: 60,
          odooVersions: "Odoo 17.0 (18.0 notes)",
          scope: ["customization"],
          body: `## How to use this lesson

These thirteen assignments take you from a first field to a tested feature set. Do them in order in \`academy_sale_extension\` on your **development** database, commit each one on its own Git branch, and record evidence (screenshots, log lines, test output). Each assignment lists the goal, hints and acceptance criteria.

> **Consultant tip:** For every assignment, first write two lines: the business requirement in the client's language and why standard configuration does not cover it. That habit is what separates a consultant from a coder.

## Assignment overview

| # | Assignment | Main skills | Est. time |
|---|-----------|-------------|-----------|
| 1 | Add a custom field | Model inheritance, view XPath | 30 min |
| 2 | New model and menu | \`_name\`, action, menu, CSV | 60 min |
| 3 | Field validation | \`@api.constrains\` | 30 min |
| 4 | Computed field | \`@api.depends\`, \`store\` | 45 min |
| 5 | Related field | \`related=\` | 20 min |
| 6 | Smart button | Action method, \`statinfo\` | 45 min |
| 7 | Extend sales order | Override + \`super()\` | 45 min |
| 8 | Custom PDF report | QWeb, \`ir.actions.report\` | 60 min |
| 9 | Basic approval workflow | State field, buttons, guards | 90 min |
| 10 | Simple dashboard | Graph and pivot views | 45 min |
| 11 | Scheduled notification | \`ir.cron\`, activities | 60 min |
| 12 | Import external data via authorized API | External API, test database | 90 min |
| 13 | Automated tests | \`TransactionCase\` | 90 min |

## 1. Add a custom field

Add **Customer PO** (\`academy_customer_po\`, Char) to \`sale.order\`, shown after Payment Terms. *Accept:* visible on quotations, not copied on duplicate (\`copy=False\`), tracked in chatter.

## 2. New model and menu

Create \`academy.delivery.window\` with list, form and search views, an action and a menu under Sales. *Accept:* menu visible to salespeople; no "no access rules" warning in the log.

## 3. Field validation

Block windows that end before they start and pallet counts outside 0-33. *Accept:* clear \`ValidationError\` messages; invalid data cannot be saved through UI or import.

## 4. Computed field

Add \`academy_weight_total\` (stored). *Accept:* updates when quantity or product weight changes; groupable in list.

## 5. Related field

Add \`academy_customer_country_id\` related to \`partner_id.country_id\`, stored. *Accept:* filter and group quotations by customer country.

## 6. Smart button

Show the count of delivery windows on the order with a button that opens them. *Accept:* new windows created from the button default to the order.

## 7. Extend sales order

Override \`action_confirm\`: company customers need a PO; post a chatter message after confirmation. *Accept:* delivery orders still created (proves \`super()\`).

## 8. Custom PDF report

Create the Delivery Windows report and add Customer PO to the standard quotation PDF via inheritance. *Accept:* report in the Print menu, correct file name, PO hidden when empty.

## 9. Basic approval workflow

Approval above a configurable threshold with Request / Approve / Reject / Reset. *Accept:* only managers approve (enforced in Python); unapproved high-value orders cannot be confirmed; all transitions in chatter.

## 10. Simple dashboard

Add graph and pivot views for delivery windows and a menu *Sales > Reporting > Delivery Load*:

\`\`\`xml
<record id="academy_delivery_window_view_graph" model="ir.ui.view">
    <field name="name">academy.delivery.window.graph</field>
    <field name="model">academy.delivery.window</field>
    <field name="arch" type="xml">
        <graph string="Delivery Load" type="bar">
            <field name="date_from" interval="week"/>
            <field name="delivery_type"/>
            <field name="pallet_count" type="measure"/>
        </graph>
    </field>
</record>

<record id="academy_delivery_window_view_pivot" model="ir.ui.view">
    <field name="name">academy.delivery.window.pivot</field>
    <field name="model">academy.delivery.window</field>
    <field name="arch" type="xml">
        <pivot string="Delivery Load">
            <field name="date_from" interval="week" type="row"/>
            <field name="delivery_type" type="col"/>
            <field name="pallet_count" type="measure"/>
        </pivot>
    </field>
</record>

<record id="academy_delivery_load_action" model="ir.actions.act_window">
    <field name="name">Delivery Load</field>
    <field name="res_model">academy.delivery.window</field>
    <field name="view_mode">graph,pivot,tree</field>
</record>

<menuitem id="academy_delivery_load_menu" name="Delivery Load"
          parent="sale.menu_sale_report" action="academy_delivery_load_action" sequence="50"/>
\`\`\`

(Verify the parent menu id \`sale.menu_sale_report\` in developer mode for your version; in 18 use \`list\` instead of \`tree\`.) *Accept:* weekly pallets per delivery type visible as chart and pivot.

## 11. Scheduled notification

Daily cron creating "Approve quotation" activities for quotations waiting more than one day. *Accept:* idempotent (no duplicates); runs manually from *Scheduled Actions*.

## 12. Import external data via authorized API

Write an external Python script (not a module) that reads a CSV of delivery windows and creates them through Odoo's external API using a **dedicated integration user** and an **API key read from an environment variable**, against the **test database only**. See the Integration Lab course for the API details. *Accept:* no credentials in the script or repository; re-running does not create duplicates (look up existing windows first).

## 13. Automated tests

Tests for assignments 3, 4, 7 and 9. *Accept:* \`0 failed, 0 error(s)\` with \`--test-tags /academy_sale_extension\`.

## Evidence checklist

- [ ] Branch and commit per assignment with \`[ADD]\`/\`[IMP]\` messages
- [ ] Manifest version bumped when data structures change
- [ ] Screenshots of each feature as a non-admin user
- [ ] Clean server log on upgrade (no warnings from your module)
- [ ] Test run output
- [ ] Short note: standard alternative considered and why it was rejected

## Common errors across assignments

| Error | Typical assignment | Fix |
|-------|-------------------|-----|
| Missing access rights warning | 2, 10 | CSV line for each new model |
| XML \`ParseError\` | 2, 6, 8, 10 | Validate XML, escape \`&\` |
| Field not found in view | 1, 4, 5 | Restart + \`-u\` |
| \`attrs\` no longer used | 6, 9 | Odoo 17 expressions |
| \`<list>\` not valid | 2, 10 | Use \`<tree>\` on 17 |

## Key takeaways

- Build features incrementally, one branch and one test at a time.
- Each assignment mirrors a real client request.
- Evidence and documentation are part of the deliverable.`,
        },
      ],
    },
  ],

  /* -------------------------------------------------------------------- */
  /* Assessment                                                            */
  /* -------------------------------------------------------------------- */
  assessment: {
    slug: "odoo-technical-fundamentals-final",
    title: "Odoo Technical Fundamentals - Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which layer of Odoo enforces access rights and business logic before data reaches PostgreSQL?",
        kind: "single",
        options: ["The web client", "The ORM in the Odoo server", "PostgreSQL triggers", "The reverse proxy"],
        correct: [1],
        explanation: "All reads and writes go through the ORM on the server, which applies access rights, record rules and business logic.",
      },
      {
        prompt: "A consultant may run UPDATE statements directly on the production database to fix data quickly.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Direct SQL writes bypass the ORM (security, computed fields, integrity, audit trail). SQL is for read-only analysis; fix data via the UI, imports or tested ORM scripts.",
      },
      {
        prompt: "You added a new field in Python and a view references it, but the upgrade fails with 'Field does not exist'. What is the most likely cause?",
        kind: "single",
        options: [
          "The CSV access file is missing",
          "The server was not restarted / the Python file is not imported in __init__.py",
          "The browser cache",
          "PostgreSQL is read-only",
        ],
        correct: [1],
        explanation: "View validation fails when the Python field is not loaded: restart the server, check imports, then upgrade with -u.",
      },
      {
        prompt: "In Odoo 17, how do you hide a field unless the order is in draft?",
        kind: "single",
        options: [
          "attrs=\"{'invisible': [('state', '!=', 'draft')]}\"",
          "states=\"draft\"",
          "invisible=\"state != 'draft'\"",
          "groups=\"draft\"",
        ],
        correct: [2],
        explanation: "Odoo 17 removed attrs and states; use Python-like expressions directly in invisible, readonly and required.",
      },
      {
        prompt: "Which root tag does a list view use in Odoo 17 and in Odoo 18 respectively?",
        kind: "single",
        options: ["<list> and <tree>", "<tree> and <list>", "<tree> in both", "<grid> and <list>"],
        correct: [1],
        explanation: "Odoo 17 uses <tree>; Odoo 18 renamed it to <list> (and view_mode 'tree' to 'list').",
      },
      {
        prompt: "What happens if an override of action_confirm does not call super()?",
        kind: "single",
        options: [
          "Nothing, Odoo calls the parent automatically",
          "The standard logic and other modules' overrides later in the chain are skipped",
          "The module cannot be installed",
          "Only the chatter message is lost",
        ],
        correct: [1],
        explanation: "Without super(), the parent implementations (e.g. delivery creation) never run.",
      },
      {
        prompt: "Which statements about computed fields are correct? (Select all that apply)",
        kind: "multiple",
        options: [
          "@api.depends must list the fields the computation reads",
          "store=True makes the field searchable and groupable",
          "The compute method may skip assigning a value when the result is zero",
          "Computed fields without store=True have no database column",
        ],
        correct: [0, 1, 3],
        explanation: "Every record must be assigned a value in the compute method; the other statements are correct.",
      },
      {
        prompt: "What does ir.model.access.csv control?",
        kind: "single",
        options: [
          "Which records of a model a user can see",
          "Model-level read/write/create/delete permissions per group",
          "Which menus are visible",
          "Field-level translations",
        ],
        correct: [1],
        explanation: "Access rights are model-level CRUD permissions; record rules (ir.rule) filter which records.",
      },
      {
        prompt: "Two group-specific record rules apply to a user (one per group). How are they combined?",
        kind: "single",
        options: ["AND", "OR", "Only the first is applied", "The most restrictive wins"],
        correct: [1],
        explanation: "Group rules are combined with OR across the user's groups; global rules are combined with AND.",
      },
      {
        prompt: "Which command runs only the tests of academy_sale_extension on a test database?",
        kind: "single",
        options: [
          "odoo-bin -d prod -u all",
          "odoo-bin -c odoo.conf -d academy_test -u academy_sale_extension --test-enable --test-tags /academy_sale_extension --stop-after-init",
          "odoo-bin --dev=all",
          "python -m unittest academy_sale_extension",
        ],
        correct: [1],
        explanation: "Upgrade the module with --test-enable and filter with --test-tags /module, on a test database, with --stop-after-init.",
      },
      {
        prompt: "Why should a scheduled action that creates activities check for existing activities first?",
        kind: "single",
        options: [
          "To make it idempotent and avoid duplicates when it runs again",
          "Because ir.cron requires it",
          "To bypass access rights",
          "To speed up PostgreSQL",
        ],
        correct: [0],
        explanation: "Crons run repeatedly; an idempotent job produces the same result no matter how often it runs.",
      },
      {
        prompt: "Which are valid reasons to use a duplicated, neutralized database for development? (Select all that apply)",
        kind: "multiple",
        options: [
          "Outgoing emails and crons are disabled so real customers are not affected",
          "Payment and bank integrations are disabled or in test mode",
          "It allows skipping access rights",
          "Mistakes do not affect live business data",
        ],
        correct: [0, 1, 3],
        explanation: "Neutralization protects customers and systems; it does not change access rights.",
      },
    ],
  },

  /* -------------------------------------------------------------------- */
  /* Assignments                                                           */
  /* -------------------------------------------------------------------- */
  assignments: [
    {
      slug: "odoo-technical-fundamentals-delivery-windows",
      title: "Build the Delivery Windows feature",
      instructions: `## Scenario

Sunrise Office Supplies wants to plan customer delivery windows on sales orders.

## Tasks

1. In \`academy_sale_extension\` (Odoo 17), create the model \`academy.delivery.window\` with: name, sales order (Many2one, cascade), from/to datetimes, delivery type (selection), pallets, tags (Many2many).
2. Provide list (\`<tree>\`), form, search (filters + group by) and kanban views, an action and a menu under Sales.
3. Add access rights for salespeople and managers and a record rule limiting salespeople to their own orders.
4. Add a constraint (end after start) and a stored computed total weight on the sales order.
5. Add a smart button on the sales order.
6. Write at least three \`TransactionCase\` tests.

## Deliverables

- Git repository link or zipped module (no credentials, no database dumps)
- Screenshots as a salesperson and as a manager
- Test run output showing \`0 failed, 0 error(s)\`
- One-page note: requirement, why custom code, how to test

## Evaluation criteria

| Criterion | Weight |
|-----------|--------|
| Module installs and upgrades cleanly (no warnings) | 20% |
| Correct field types and relations | 20% |
| Security (CSV + record rule) works per persona | 20% |
| Views follow Odoo 17 syntax | 15% |
| Tests meaningful and passing | 15% |
| Documentation quality | 10% |`,
    },
    {
      slug: "odoo-technical-fundamentals-approval-report",
      title: "Quotation approval workflow and PDF report",
      instructions: `## Scenario

Quotations above a configurable amount need sales manager approval, and drivers need a printed delivery sheet.

## Tasks

1. Add an approval state field to \`sale.order\` with Request / Approve / Reject / Reset buttons using Odoo 17 \`invisible\` expressions.
2. Enforce in Python that only sales managers approve and that unapproved orders above the threshold (system parameter) cannot be confirmed. Call \`super()\` in \`action_confirm\`.
3. Add a daily scheduled action creating idempotent approval activities.
4. Create a QWeb PDF "Delivery Windows" report and inherit the standard quotation report to show the Customer PO (verify the XPath anchor for your version).
5. Add tests for approval and confirmation.

## Deliverables

- Module source (Git), manifest version bumped
- Short demo video or screenshots of the full approval cycle
- PDF samples of both reports
- Test output
- Edge-case list: amount changed after approval, duplication, cancellation - and how you handle each

## Evaluation criteria

| Criterion | Weight |
|-----------|--------|
| Workflow correctness and security in Python | 30% |
| Correct \`super()\` usage and no regression in standard flow | 20% |
| Cron idempotency | 15% |
| Reports render correctly | 20% |
| Tests and edge-case analysis | 15% |`,
    },
  ],
};
