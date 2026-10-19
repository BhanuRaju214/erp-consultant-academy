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

\`\`\`visual-layers
{
  "title": "The Odoo stack, top to bottom",
  "caption": "Select a layer to see what lives there. Every request passes through each layer in turn; nothing skips the ORM.",
  "layers": [
    { "title": "Web client", "subtitle": "JavaScript (OWL) single-page app in the browser", "icon": "globe", "items": ["Form, list, kanban views", "Actions and menus", "JSON-RPC calls"], "detail": "Renders the view XML it receives from the server and asks the server for data. It never opens a database connection." },
    { "title": "HTTP and RPC layer", "subtitle": "odoo-bin, port 8069", "icon": "plug", "items": ["Web controllers", "JSON-RPC / XML-RPC", "Sessions and login"], "detail": "Receives each browser or API call, identifies the user and database, and hands the call to the model method." },
    { "title": "ORM and business logic", "subtitle": "Python models from every installed module", "icon": "layers", "items": ["Access rights", "Record rules", "Computed fields", "Constraints", "Method overrides"], "detail": "Checks security, runs the standard method plus every override in dependency order, recomputes fields and turns the result into SQL." },
    { "title": "Modules on the addons path", "subtitle": "sale, stock, account, academy_sale_extension", "icon": "box", "items": ["__manifest__.py", "models/", "views/", "security/"], "detail": "Folders the server scans at start-up. Installing or upgrading loads their XML and CSV into the database." },
    { "title": "PostgreSQL and filestore", "subtitle": "The single source of truth", "icon": "database", "items": ["Business tables (sale_order)", "Metadata (ir_model, ir_ui_view)", "Attachments in the filestore"], "detail": "Records and metadata live in PostgreSQL; binary attachments live in the filestore folder. A backup needs both." }
  ],
  "connects": [
    { "title": "External API clients", "detail": "Integrations call the same RPC layer and pass the same ORM security checks.", "icon": "link" },
    { "title": "Scheduled actions", "detail": "Cron workers call model methods inside the server, also through the ORM.", "icon": "clock" }
  ]
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Where Odoo keeps its own metadata",
  "prompt": "Match each PostgreSQL table to what it stores.",
  "leftLabel": "Table",
  "rightLabel": "Stores",
  "pairs": [
    { "left": "ir_model", "right": "One row per model, e.g. sale.order" },
    { "left": "ir_model_fields", "right": "Every field of every model, with its type" },
    { "left": "ir_ui_view", "right": "The XML architecture of form, list and search views" },
    { "left": "ir_ui_menu", "right": "The menu tree users click through" },
    { "left": "ir_model_access", "right": "Model-level read, write, create and delete rights per group" },
    { "left": "sale_order", "right": "The business records themselves: quotations and orders" }
  ],
  "explanation": "Modules load their XML and CSV files into the ir_* tables on install and upgrade, which is why an upgrade changes the database even when no business data changes."
}
\`\`\`

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

\`\`\`visual-decision
{
  "title": "Classify the request: 'a small change on the quotation screen'",
  "caption": "Walk the questions in this order before you estimate anything.",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Does standard Odoo already do it, perhaps with a setting switched on?", "options": [ { "label": "Yes", "next": "r_config" }, { "label": "No", "next": "q2" } ] },
    "q2": { "question": "Is a maintained app (Odoo or a trusted third party) available that fits?", "options": [ { "label": "Yes", "next": "r_app" }, { "label": "No", "next": "q3" } ] },
    "q3": { "question": "Is it only a simple field, label or layout change, and is the client on Enterprise?", "options": [ { "label": "Yes", "next": "r_studio" }, { "label": "No, it needs logic, rules or integration", "next": "r_module" } ] },
    "r_config": { "result": "Configuration", "tone": "success", "detail": "Cheapest and survives upgrades. Document the setting in the configuration workbook." },
    "r_app": { "result": "Install and evaluate the app", "tone": "info", "detail": "Check its version support, licence and who maintains it before recommending it." },
    "r_studio": { "result": "Studio customization", "tone": "warning", "detail": "Fast to deliver, but still a customization: test it on every upgrade." },
    "r_module": { "result": "Custom module (academy_sale_extension)", "tone": "warning", "detail": "Highest cost and must be migrated per major version. Write a specification and tests, and keep it in Git." }
  }
}
\`\`\`

## How a request flows through Odoo

1. A salesperson clicks **Confirm** on a quotation.
2. The web client sends an RPC call: model \`sale.order\`, method \`action_confirm\`, record id.
3. The server checks the user has write access to \`sale.order\` and that record rules allow this record.
4. The ORM runs \`action_confirm\` - the standard code plus any overrides from installed modules (in dependency order).
5. The ORM writes changes to PostgreSQL inside a single transaction. If any error is raised, everything is rolled back.
6. The client reloads the record and shows the new state.

Point 5 is important: an error raised from your code cancels the whole operation. That is how validations safely block bad data.

\`\`\`visual-sequence
{
  "title": "One click on Confirm, step by step",
  "caption": "Press Next to follow the request from the browser down to PostgreSQL and back.",
  "actors": ["Browser", "Odoo server", "ORM", "PostgreSQL"],
  "messages": [
    { "from": "Browser", "to": "Odoo server", "label": "RPC call: sale.order / action_confirm / id 42", "kind": "request", "note": "The web client only sends the model, method and record id." },
    { "from": "Odoo server", "to": "Odoo server", "label": "Identify session, user and database", "kind": "self" },
    { "from": "Odoo server", "to": "ORM", "label": "Call action_confirm on the recordset", "kind": "request" },
    { "from": "ORM", "to": "ORM", "label": "Check access rights and record rules", "kind": "self", "note": "If the user may not write this order, an AccessError stops everything here." },
    { "from": "ORM", "to": "ORM", "label": "Run standard code + overrides in dependency order", "kind": "self", "note": "sale, sale_stock, academy_sale_extension... each override calls super()." },
    { "from": "ORM", "to": "PostgreSQL", "label": "UPDATE sale_order, INSERT stock_picking ...", "kind": "request" },
    { "from": "PostgreSQL", "to": "ORM", "label": "COMMIT (or ROLLBACK on any error)", "kind": "response", "note": "One transaction: a raised UserError undoes every write of this call." },
    { "from": "ORM", "to": "Odoo server", "label": "Return value (True or an action)", "kind": "response" },
    { "from": "Odoo server", "to": "Browser", "label": "JSON response", "kind": "response" },
    { "from": "Browser", "to": "Browser", "label": "Reload record, show state Sales Order", "kind": "self" }
  ]
}
\`\`\`

\`\`\`visual-check
{
  "question": "A validation in academy_sale_extension raises a UserError after the standard code already created the delivery order in the same call. What is left in the database?",
  "options": ["The delivery order, but the sales order stays a quotation", "Nothing from this call: the whole transaction is rolled back", "Everything, because the error came after the writes", "Only the chatter message"],
  "correct": 1,
  "explanation": "Each RPC call runs in one database transaction. Any exception rolls back every write made during that call, which is why raising errors is a safe way to block bad data."
}
\`\`\`

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

Useful recordset operations (select a note to highlight the lines it explains):

\`\`\`visual-codewalk
{
  "title": "Recordset operations you will read every day",
  "language": "python",
  "file": "Odoo shell or any model method",
  "code": [
    "orders = self.env['sale.order'].search([('state', '=', 'sale')], limit=50)",
    "",
    "big = orders.filtered(lambda o: o.amount_total > 10000)   # subset",
    "partners = orders.mapped('partner_id')                     # related records",
    "totals = orders.mapped('amount_total')                     # list of floats",
    "latest_first = orders.sorted(key='date_order', reverse=True)",
    "",
    "order = orders[:1]          # first record (or empty recordset)",
    "order.ensure_one()          # raises an error if not exactly one record"
  ],
  "notes": [
    { "lines": "1", "title": "search returns a recordset", "text": "self.env['sale.order'] gives the model; search takes a domain and returns up to 50 confirmed orders as one recordset, never a Python list." },
    { "lines": "3", "title": "filtered keeps a subset", "text": "Runs the lambda on each record in memory and returns a smaller recordset of the same model." },
    { "lines": "4", "title": "mapped on a relational field", "text": "Returns a res.partner recordset with duplicates removed: the distinct customers of these orders." },
    { "lines": "5", "title": "mapped on a simple field", "text": "Returns a plain Python list of values, one per record, so it can be summed." },
    { "lines": "6", "title": "sorted", "text": "Returns a new recordset ordered by date_order, newest first. The database is not queried again." },
    { "lines": "8-9", "title": "Exactly one record", "text": "Slicing with [:1] never fails, even on an empty set. ensure_one() raises Expected singleton unless there is exactly one record: use it at the top of methods that work on one document." }
  ]
}
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

\`\`\`visual-check
{
  "question": "Which domain finds orders that are in state 'sale' AND belong to a customer from India OR the US?",
  "options": ["[('state', '=', 'sale'), '|', ('partner_id.country_id.code', '=', 'IN'), ('partner_id.country_id.code', '=', 'US')]", "['|', ('state', '=', 'sale'), ('partner_id.country_id.code', '=', 'IN'), ('partner_id.country_id.code', '=', 'US')]", "[('state', '=', 'sale'), ('partner_id.country_id.code', '=', 'IN'), ('partner_id.country_id.code', '=', 'US')]"],
  "correct": 0,
  "explanation": "The '|' operator applies to the two conditions written right after it, and the remaining conditions are joined with AND. Option 2 means sale OR IN, then AND US. Option 3 asks for a country that is both IN and US, which never matches."
}
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

\`\`\`visual-match
{
  "title": "The right tool for the job",
  "prompt": "Match each Python or ORM construct to what it does.",
  "leftLabel": "Construct",
  "rightLabel": "Effect",
  "pairs": [
    { "left": "UserError", "right": "Blocks an action with a dialog and rolls the transaction back" },
    { "left": "ValidationError", "right": "Raised from an @api.constrains method when saved data is invalid" },
    { "left": "sudo()", "right": "Runs the next operations as superuser, bypassing access rights" },
    { "left": "with_context(key=value)", "right": "Passes flags such as default values to downstream code" },
    { "left": "Command.create({...})", "right": "Adds a new line to a One2many field inside create or write" },
    { "left": "Command.link(id)", "right": "Attaches an existing record to a Many2many field" },
    { "left": "_()", "right": "Marks a user-facing string for translation" }
  ],
  "explanation": "Reading code quickly means recognising these building blocks: errors for business rules, environment helpers for security and context, and Command helpers for relational writes."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "A method does print(self.name) and fails with 'Expected singleton: sale.order(1, 2)' when a user runs it from the list on two selected orders. What is the best fix?",
  "options": ["Use self[0].name", "Loop with for order in self and use order.name", "Wrap the line in try/except", "Call sudo() first"],
  "correct": 1,
  "explanation": "self is a recordset that may hold many records. Looping handles one, two or a hundred orders; self[0] silently ignores the others and sudo() has nothing to do with it."
}
\`\`\`

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

\`\`\`visual-dodont
{
  "title": "SQL on an Odoo database",
  "do": ["Use a read-only role or a recent neutralized copy", "Always add LIMIT and a WHERE filter while exploring", "Filter on active and company_id where relevant", "Fix data through the UI, imports or tested ORM scripts"],
  "dont": ["Run UPDATE, INSERT or DELETE on production", "ALTER tables: the ORM owns the schema", "Run long unfiltered queries during business hours", "Assume a computed field exists as a column"]
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Answering the finance manager in one query",
  "language": "sql",
  "file": "read-only psql session",
  "code": [
    "SELECT am.name, am.invoice_date, am.amount_total",
    "FROM account_move am",
    "WHERE am.move_type = 'out_invoice'",
    "  AND am.state = 'posted'",
    "  AND am.invoice_user_id IS NULL",
    "ORDER BY am.invoice_date DESC;"
  ],
  "notes": [
    { "lines": "2", "title": "Model account.move", "text": "Invoices, bills and journal entries all live in account_move; the alias am keeps the query short." },
    { "lines": "3", "title": "Only customer invoices", "text": "move_type separates customer invoices (out_invoice) from credit notes, vendor bills and plain entries." },
    { "lines": "4", "title": "Only posted documents", "text": "Drafts and cancelled invoices are excluded, so finance sees only what counts." },
    { "lines": "5", "title": "The actual question", "text": "invoice_user_id is the Many2one to the salesperson; NULL means the field is empty. Use IS NULL, never = NULL." },
    { "lines": "6", "title": "Newest first", "text": "Sorting by date lets the manager see whether the problem is recent." }
  ]
}
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

\`\`\`visual-match
{
  "title": "SQL clauses",
  "prompt": "Match each SQL clause to its meaning.",
  "leftLabel": "Clause",
  "rightLabel": "Meaning",
  "pairs": [
    { "left": "LEFT JOIN", "right": "Combine tables but keep rows that have no match" },
    { "left": "WHERE", "right": "Filter individual rows before grouping" },
    { "left": "GROUP BY", "right": "Collapse rows into one row per group for COUNT or SUM" },
    { "left": "HAVING", "right": "Filter groups after aggregation" },
    { "left": "LIMIT", "right": "Cap the number of rows returned" },
    { "left": "EXPLAIN", "right": "Show the query plan without changing data" }
  ],
  "explanation": "WHERE works on rows and HAVING works on groups: the duplicate-email query needs HAVING COUNT(*) > 1 because the count only exists after grouping."
}
\`\`\`

## Reading results with care

- Odoo uses an \`active\` boolean for archiving. Archived records are still in the table - filter with \`active\` when relevant.
- Multi-company databases: always check \`company_id\`.
- Monetary amounts are stored in the document currency; company-currency columns (e.g. \`amount_total_signed\` on invoices) may differ.
- Computed, non-stored fields do **not** exist as columns at all.

\`\`\`visual-check
{
  "question": "You look for the column order_line in the table sale_order and cannot find it. Why?",
  "options": ["It was archived", "order_line is a One2many: the link is stored as order_id in sale_order_line", "Your read-only role hides it", "It is stored as jsonb"],
  "correct": 1,
  "explanation": "A One2many has no column. The reverse Many2one (order_id on sale_order_line) holds the link, so you JOIN sale_order_line ON order_id = sale_order.id."
}
\`\`\`

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

\`\`\`visual-flow
{
  "title": "How code travels between branches and databases",
  "steps": [
    { "title": "Feature branch", "icon": "code", "app": "Git", "detail": "17.0-feature-delivery-windows, tested on a developer database." },
    { "title": "Pull request and review", "icon": "users", "app": "Git", "detail": "A second person checks the change against the specification and the review checklist." },
    { "title": "Staging", "icon": "shield", "app": "17.0-staging", "detail": "Release candidate tested by the consultant and client on a neutralized copy of production." },
    { "title": "Production", "icon": "rocket", "app": "17.0", "detail": "Merged, tagged and deployed. The tag tells support exactly which code is live." }
  ]
}
\`\`\`

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

\`\`\`visual-order
{
  "title": "A feature from branch to production",
  "prompt": "Put the steps of the daily workflow in the right order.",
  "items": ["git checkout 17.0 and git pull", "git checkout -b 17.0-feature-delivery-windows", "Edit files, upgrade the module on the dev database and test", "git add and git commit with an [ADD] message", "git push -u origin to the feature branch", "Open a pull request and get it reviewed", "Merge after tests pass on staging, then tag the release"],
  "explanation": "Start from an up-to-date main branch, isolate the work on a feature branch, test before committing, and only merge reviewed code that passed staging."
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Git commands and their effect",
  "prompt": "Match each command to what it does.",
  "leftLabel": "Command",
  "rightLabel": "Effect",
  "pairs": [
    { "left": "git restore path/to/file", "right": "Discards uncommitted changes to one file" },
    { "left": "git revert <commit>", "right": "Adds a new commit that undoes a pushed one, keeping history" },
    { "left": "git blame path/to/file", "right": "Shows who last changed each line" },
    { "left": "git diff 17.0..my-branch", "right": "Compares a branch with production code" },
    { "left": "git log --oneline", "right": "Lists commits one per line" },
    { "left": "git push --force", "right": "Rewrites remote history: avoid on shared branches" }
  ],
  "explanation": "On shared branches, undo with revert rather than force-push: everybody else keeps a consistent history."
}
\`\`\`

## If a secret was committed

Removing the file in a new commit is **not enough**: it stays in history. Immediately **revoke/rotate the credential**, then clean history with your platform's guidance. Treat the secret as compromised.

\`\`\`visual-check
{
  "question": "A developer pushed odoo.conf with the production admin password to the shared repository. What comes first?",
  "options": ["Delete the file in a new commit", "Rotate the password immediately and treat it as compromised", "Force-push to hide the commit", "Add odoo.conf to .gitignore"],
  "correct": 1,
  "explanation": "Anyone who cloned or fetched already has the secret in history. Rotating it removes the risk; cleaning history and .gitignore come after."
}
\`\`\`

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

\`\`\`visual-dodont
{
  "title": "Safety rules for every environment",
  "do": ["Develop and test on a duplicated, neutralized database", "Check mail servers and scheduled actions are inactive before testing", "Read credentials from environment variables or a secrets manager", "Back up the database and the filestore before every upgrade", "Practise restoring a backup"],
  "dont": ["Run a scheduled action 'just to see' on production", "Commit passwords or API keys to Git", "Reuse production API keys in dev or test", "Use --dev=all on a production server", "Demo on a copy you have not verified as neutralized"]
}
\`\`\`

## Environment ladder

| Environment | Data | Who uses it | Purpose |
|-------------|------|-------------|---------|
| Local dev | Demo data or neutralized copy | Developer | Build and unit test |
| Test / training | Neutralized copy | Consultant, key users | Functional testing, training |
| Staging | Recent neutralized copy of production | Consultant, client | Final acceptance before release |
| Production | Real | End users | Live business |

\`\`\`visual-flow
{
  "title": "The environment ladder",
  "caption": "A change climbs one rung at a time; only the last rung touches real customers.",
  "steps": [
    { "title": "Local dev", "icon": "code", "actor": "Developer", "detail": "Demo data or a neutralized copy. Build and unit test.", "impact": "No real customers" },
    { "title": "Test / training", "icon": "graduation", "actor": "Consultant, key users", "detail": "Neutralized copy for functional testing and training.", "impact": "No real customers" },
    { "title": "Staging", "icon": "shield", "actor": "Consultant, client", "detail": "Recent neutralized copy of production. Final acceptance.", "impact": "No real customers" },
    { "title": "Production", "icon": "building", "actor": "End users", "detail": "Live business. Only reviewed, tested, versioned changes arrive here.", "impact": "Real emails, payments and stock" }
  ]
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Restart or upgrade?",
  "prompt": "Match each change to the action that makes it visible in Odoo.",
  "leftLabel": "You changed",
  "rightLabel": "Required action",
  "pairs": [
    { "left": "Logic inside an existing Python method", "right": "Restart the server only" },
    { "left": "A new field in a Python model", "right": "Restart and upgrade with -u" },
    { "left": "View XML or the security CSV", "right": "Upgrade with -u" },
    { "left": "A brand-new module folder", "right": "Restart, Update Apps List, then install" }
  ],
  "explanation": "Python code is loaded when the server starts; XML, CSV and new columns reach the database only during install or upgrade."
}
\`\`\`

## Secrets

- Database passwords and API keys come from environment variables or a secrets manager, not the repository.
- Use a separate admin master password per environment.
- Do not reuse production API keys in dev or test.

## Backups and restore

Take a backup before every upgrade, even on test. A backup consists of the PostgreSQL dump **and** the filestore (attachments). Practise restoring - an untested backup is not a backup.

\`\`\`visual-check
{
  "question": "You restored only the PostgreSQL dump of academy_test on a new server. Users open invoices and the PDF attachments are missing. Why?",
  "options": ["The dump was corrupted", "Attachments live in the filestore, which was not restored", "Neutralization deleted them", "The module was not upgraded"],
  "correct": 1,
  "explanation": "A complete Odoo backup is the database dump plus the filestore folder. Restoring only the dump gives records whose attachments point to missing files."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "The manifest of academy_sale_extension",
  "language": "python",
  "file": "academy_sale_extension/__manifest__.py",
  "code": [
    "{",
    "    'name': 'Academy Sale Extension',",
    "    'version': '17.0.1.0.0',",
    "    'summary': 'Training module: sales extensions for Sunrise Office Supplies',",
    "    'category': 'Sales',",
    "    'author': 'ERP Consultant Academy',",
    "    'license': 'LGPL-3',",
    "    'depends': ['sale_management'],",
    "    'data': [",
    "        'security/academy_security.xml',",
    "        'security/ir.model.access.csv',",
    "        'views/academy_delivery_window_views.xml',",
    "        'views/sale_order_views.xml',",
    "        'views/menus.xml',",
    "    ],",
    "    'installable': True,",
    "    'application': False,",
    "}"
  ],
  "notes": [
    { "lines": "2", "title": "Name shown in Apps", "text": "The technical name is the folder name, academy_sale_extension; this is only the label." },
    { "lines": "3", "title": "Version", "text": "Odoo major (17.0) + module major.minor.patch. Bump it when data structures change; migration scripts depend on it." },
    { "lines": "7", "title": "License", "text": "Required. Without it Odoo logs a warning on load." },
    { "lines": "8", "title": "Dependencies", "text": "sale_management brings sale and the Sales menus. Odoo installs dependencies first and loads our overrides after theirs." },
    { "lines": "9-15", "title": "Data files, loaded in order", "text": "Security first (groups the CSV references), then views (which define actions), then menus (which reference those actions). A wrong order gives External ID not found." },
    { "lines": "16-17", "title": "Installable, not an app", "text": "installable must be True; application False keeps it out of the main Apps filter because it extends Sales." }
  ]
}
\`\`\`

(In a real file the strings may use double quotes; Python accepts both.)

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

\`\`\`visual-codewalk
{
  "title": "A new model: academy.delivery.window",
  "language": "python",
  "file": "academy_sale_extension/models/academy_delivery_window.py",
  "code": [
    "from odoo import fields, models",
    "",
    "",
    "class AcademyDeliveryWindow(models.Model):",
    "    _name = 'academy.delivery.window'",
    "    _description = 'Customer Delivery Window'",
    "    _order = 'date_from'",
    "",
    "    name = fields.Char(required=True)",
    "    sale_order_id = fields.Many2one('sale.order', string='Sales Order', ondelete='cascade')",
    "    date_from = fields.Datetime(string='From', required=True)",
    "    date_to = fields.Datetime(string='To', required=True)",
    "    note = fields.Text()"
  ],
  "notes": [
    { "lines": "4", "title": "A model is a Python class", "text": "It inherits models.Model, so the ORM creates and manages a database table for it." },
    { "lines": "5", "title": "_name creates a new model", "text": "The ORM creates table academy_delivery_window and the external id model_academy_delivery_window used in the CSV." },
    { "lines": "6", "title": "_description", "text": "Human-readable name shown in error messages and technical menus. Odoo warns when it is missing." },
    { "lines": "7", "title": "Default sort order", "text": "Lists show windows by start time unless the user sorts differently." },
    { "lines": "9", "title": "name is special", "text": "Odoo uses the name field as the display name of each record, for example in Many2one dropdowns." },
    { "lines": "10", "title": "Link to the sales order", "text": "A Many2one column sale_order_id; ondelete cascade deletes the windows when the order is deleted." },
    { "lines": "11-12", "title": "Datetimes", "text": "Stored in UTC and shown in each user's timezone." }
  ]
}
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

\`\`\`visual-sequence
{
  "title": "What happens when you install academy_sale_extension",
  "caption": "Press Next to follow odoo-bin -i academy_sale_extension.",
  "actors": ["Administrator", "Odoo server", "Module files", "PostgreSQL"],
  "messages": [
    { "from": "Administrator", "to": "Odoo server", "label": "Install (Apps or -i academy_sale_extension)", "kind": "request" },
    { "from": "Odoo server", "to": "Module files", "label": "Read __manifest__.py", "kind": "request", "note": "Checks depends: sale_management must be installed first, or is installed now." },
    { "from": "Odoo server", "to": "Module files", "label": "Import Python via __init__.py", "kind": "request", "note": "Model classes register in the registry; a missing import means the model never exists." },
    { "from": "Odoo server", "to": "PostgreSQL", "label": "Create table academy_delivery_window, add column to sale_order", "kind": "request" },
    { "from": "Odoo server", "to": "Module files", "label": "Load data files in manifest order", "kind": "request", "note": "Security XML, access CSV, views, menus." },
    { "from": "Odoo server", "to": "PostgreSQL", "label": "Write ir_model_access, ir_ui_view, ir_ui_menu rows", "kind": "request" },
    { "from": "Odoo server", "to": "Odoo server", "label": "Validate views against the models", "kind": "self", "note": "A field missing in Python fails here with Field does not exist." },
    { "from": "PostgreSQL", "to": "Odoo server", "label": "Commit: module state installed", "kind": "response" },
    { "from": "Odoo server", "to": "Administrator", "label": "Menu Sales > Delivery Windows appears", "kind": "response" }
  ]
}
\`\`\`

## Exercise steps

1. Create the folder in your custom addons path with all files above.
2. Restart Odoo, activate developer mode, *Apps > Update Apps List*.
3. Search "Academy Sale Extension" and install it (or \`-i academy_sale_extension\`).
4. Open *Sales > Delivery Windows* and create a window.
5. Open a quotation and fill **Customer PO**.

\`\`\`visual-order
{
  "title": "Build and install the module",
  "prompt": "Put the steps to get a new module running in the right order.",
  "items": ["Create the folder academy_sale_extension in the custom addons path", "Write __manifest__.py and the __init__.py imports", "Add models, security CSV and view XML files", "Restart the Odoo server", "Activate developer mode and click Update Apps List", "Install Academy Sale Extension", "Test the new menu and field as a salesperson"],
  "explanation": "The server only sees a new folder after a restart, and Apps only lists it after Update Apps List. Testing as a real user catches missing access rights that an administrator would not notice."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "Installation fails with 'External ID not found in the system: academy_sale_extension.academy_delivery_window_action'. The action exists in academy_delivery_window_views.xml. What is wrong?",
  "options": ["The action needs a group", "views/menus.xml is listed before the views file in the manifest data", "The model has no access rights", "The server was not restarted"],
  "correct": 1,
  "explanation": "Data files load in the listed order. A menu can only reference an action that has already been loaded, so the views file must come before menus.xml."
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Pick the field type",
  "prompt": "Match each Sunrise requirement to the best field type.",
  "leftLabel": "Requirement",
  "rightLabel": "Field type",
  "pairs": [
    { "left": "Number of pallets on a delivery window", "right": "fields.Integer" },
    { "left": "Delivery type: standard, express or pickup", "right": "fields.Selection" },
    { "left": "Tail-lift required or not", "right": "fields.Boolean" },
    { "left": "Deposit amount in the order currency", "right": "fields.Monetary" },
    { "left": "Window start date and time", "right": "fields.Datetime" },
    { "left": "Free-form delivery instructions", "right": "fields.Text" },
    { "left": "Shipment weight in kg with decimals", "right": "fields.Float" }
  ],
  "explanation": "The type decides how data is stored, searched, grouped and imported. A Selection, for example, gives clean groupable values where a Char would collect spelling variants."
}
\`\`\`

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

\`\`\`visual-decision
{
  "title": "Which relational field?",
  "caption": "Ask these questions for every 'list of X on Y' requirement.",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Does each Y point to exactly one X (for example the dock contact of a window)?", "options": [ { "label": "Yes", "next": "r_m2o" }, { "label": "No, Y shows a list of X", "next": "q2" } ] },
    "q2": { "question": "Can one X belong to several Y at the same time?", "options": [ { "label": "Yes, e.g. the tag Fragile on many windows", "next": "r_m2m" }, { "label": "No, e.g. a window belongs to one order", "next": "r_o2m" } ] },
    "r_m2o": { "result": "Many2one", "tone": "success", "detail": "An integer column with a foreign key, e.g. dock_contact_id to res.partner." },
    "r_m2m": { "result": "Many2many", "tone": "info", "detail": "Odoo creates a relation table between both models, e.g. tag_ids to academy.delivery.tag." },
    "r_o2m": { "result": "One2many + its inverse Many2one", "tone": "info", "detail": "The Many2one sale_order_id on the window stores the link; delivery_window_ids on the order is the virtual reverse." }
  }
}
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

\`\`\`visual-codewalk
{
  "title": "Extending sale.order with new fields",
  "language": "python",
  "file": "academy_sale_extension/models/sale_order.py",
  "code": [
    "from odoo import fields, models",
    "",
    "",
    "class SaleOrder(models.Model):",
    "    _inherit = 'sale.order'",
    "",
    "    academy_customer_po = fields.Char(string='Customer PO', copy=False)",
    "    academy_priority = fields.Selection(",
    "        [('0', 'Normal'), ('1', 'Urgent')], string='Delivery Priority', default='0'",
    "    )",
    "    delivery_window_ids = fields.One2many(",
    "        'academy.delivery.window', 'sale_order_id', string='Delivery Windows'",
    "    )"
  ],
  "notes": [
    { "lines": "5", "title": "_inherit without _name", "text": "Extends the existing model: the new fields become columns of the sale_order table, no new table is created." },
    { "lines": "7", "title": "copy=False", "text": "Duplicating a quotation does not copy the customer PO, because each PO belongs to one order." },
    { "lines": "8-10", "title": "Selection keys are stored", "text": "The database stores '0' or '1'; the labels are translated. Keys must not change after go-live." },
    { "lines": "11-13", "title": "One2many needs its inverse", "text": "The second argument, sale_order_id, is the Many2one on the window. No column is created on sale_order." }
  ]
}
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

\`\`\`visual-check
{
  "question": "The warehouse wants to stop anyone deleting a customer who still has delivery windows as dock contact. Which ondelete fits dock_contact_id?",
  "options": ["cascade", "set null", "restrict"],
  "correct": 2,
  "explanation": "restrict blocks deleting the partner while windows reference it. cascade would delete the windows and set null would silently empty the field."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Stored computed field: total weight",
  "language": "python",
  "file": "academy_sale_extension/models/sale_order.py",
  "code": [
    "from odoo import api, fields, models",
    "",
    "",
    "class SaleOrder(models.Model):",
    "    _inherit = 'sale.order'",
    "",
    "    academy_weight_total = fields.Float(",
    "        string='Total Weight (kg)',",
    "        compute='_compute_academy_weight_total',",
    "        store=True,",
    "        digits=(16, 2),",
    "    )",
    "",
    "    @api.depends('order_line.product_uom_qty', 'order_line.product_id.weight')",
    "    def _compute_academy_weight_total(self):",
    "        for order in self:",
    "            order.academy_weight_total = sum(",
    "                line.product_uom_qty * line.product_id.weight",
    "                for line in order.order_line",
    "            )"
  ],
  "notes": [
    { "lines": "9", "title": "compute names the method", "text": "The field has no user input; the ORM calls this method to fill it." },
    { "lines": "10", "title": "store=True", "text": "The value is saved in a column, so it can be searched, grouped and used in reports. It costs a recompute when dependencies change." },
    { "lines": "14", "title": "@api.depends", "text": "Every field the method reads, including dotted paths. Change a quantity or a product weight and Odoo recomputes the order. A missing path means stale stored values." },
    { "lines": "16", "title": "Loop over self", "text": "Odoo computes many orders in one call, so always iterate." },
    { "lines": "17-20", "title": "Assign for every record", "text": "sum() of no lines is 0, so every order gets a value. Skipping a record raises Compute method failed to assign." }
  ]
}
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

\`\`\`visual-sequence
{
  "title": "A quantity changes: how the stored total is recomputed",
  "actors": ["Salesperson", "ORM", "Compute method", "PostgreSQL"],
  "messages": [
    { "from": "Salesperson", "to": "ORM", "label": "write product_uom_qty = 3 on an order line", "kind": "request" },
    { "from": "ORM", "to": "ORM", "label": "Look up fields that depend on order_line.product_uom_qty", "kind": "self", "note": "Built from every @api.depends declaration at start-up." },
    { "from": "ORM", "to": "ORM", "label": "Mark academy_weight_total of that order as to recompute", "kind": "self" },
    { "from": "ORM", "to": "Compute method", "label": "_compute_academy_weight_total(order)", "kind": "request" },
    { "from": "Compute method", "to": "ORM", "label": "order.academy_weight_total = 45.50", "kind": "response" },
    { "from": "ORM", "to": "PostgreSQL", "label": "UPDATE sale_order_line and sale_order in the same transaction", "kind": "request" },
    { "from": "ORM", "to": "Salesperson", "label": "Form shows Total Weight 45.50", "kind": "response" }
  ]
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Store the computed field or not?",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Must users search, filter, group or report on the value?", "options": [ { "label": "Yes", "next": "q2" }, { "label": "No, only shown on the form", "next": "r_nostore" } ] },
    "q2": { "question": "Can every input be listed in @api.depends (no dependency on today's date or the current user)?", "options": [ { "label": "Yes", "next": "r_store" }, { "label": "No", "next": "r_rethink" } ] },
    "r_nostore": { "result": "store=False", "tone": "success", "detail": "Computed on read, always current, no column and no recompute cost." },
    "r_store": { "result": "store=True", "tone": "info", "detail": "Saved in a column and recomputed when a dependency changes. Plan for the initial recompute on large tables during upgrade." },
    "r_rethink": { "result": "Do not store it", "tone": "warning", "detail": "A stored value that depends on time or user would go stale. Use a non-stored field, a search method or a scheduled update instead." }
  }
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Computed, related or constraint?",
  "prompt": "Match each Sunrise requirement to the ORM feature that implements it.",
  "leftLabel": "Requirement",
  "rightLabel": "ORM feature",
  "pairs": [
    { "left": "Total weight of the order for vehicle planning", "right": "Computed field with @api.depends" },
    { "left": "Group quotations by customer country", "right": "Stored related field on partner_id.country_id" },
    { "left": "A window must end after it starts", "right": "@api.constrains raising ValidationError" },
    { "left": "Window names unique per order", "right": "SQL constraint (unique)" }
  ],
  "explanation": "Computed and related fields derive values; constraints refuse invalid data. Uniqueness is best enforced by the database itself."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "The weight total stays the same when a product's weight is changed on the product form, but updates when a quantity changes. What is the cause?",
  "options": ["store=True should be False", "order_line.product_id.weight is missing from @api.depends", "The compute method must call write", "The field needs readonly=False"],
  "correct": 1,
  "explanation": "A stored compute only reruns for changes to the paths listed in @api.depends. Add the missing path, upgrade, and recompute existing records if needed."
}
\`\`\`

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

\`\`\`visual-compare
{
  "title": "View syntax across versions",
  "columns": ["Odoo 16", "Odoo 17", "Odoo 18"],
  "rows": [
    { "label": "Conditional visibility", "values": ["attrs with a domain", "invisible='state != draft' expression", "Expression (same as 17)"] },
    { "label": "states attribute on buttons", "values": [true, false, false] },
    { "label": "List view root tag", "values": ["tree", "tree", "list"] },
    { "label": "view_mode value", "values": ["tree,form", "tree,form", "list,form"] },
    { "label": "Kanban card template", "values": ["kanban-box", "kanban-box", "card"] }
  ],
  "highlight": 1,
  "caption": "This course targets Odoo 17. Copying a tutorial written for another version is the most common source of view errors."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Inheriting the sales order form",
  "language": "xml",
  "file": "academy_sale_extension/views/sale_order_views.xml",
  "code": [
    "<record id='view_order_form_academy' model='ir.ui.view'>",
    "    <field name='name'>sale.order.form.academy</field>",
    "    <field name='model'>sale.order</field>",
    "    <field name='inherit_id' ref='sale.view_order_form'/>",
    "    <field name='arch' type='xml'>",
    "        <field name='payment_term_id' position='after'>",
    "            <field name='academy_customer_po'/>",
    "        </field>",
    "        <field name='client_order_ref' position='attributes'>",
    "            <attribute name='string'>Customer Reference (legacy)</attribute>",
    "        </field>",
    "    </field>",
    "</record>"
  ],
  "notes": [
    { "lines": "1", "title": "A view is a record", "text": "Stored in ir_ui_view. The id becomes the external id academy_sale_extension.view_order_form_academy." },
    { "lines": "4", "title": "inherit_id", "text": "Points at the standard form defined by the sale module. Odoo merges our changes into it at render time; the original stays untouched." },
    { "lines": "6", "title": "Locate the anchor", "text": "This shorthand finds the payment terms field, exactly like an xpath on field name payment_term_id. If the anchor does not exist in this version, the upgrade fails with cannot be located in parent view." },
    { "lines": "7", "title": "Insert after it", "text": "Our field appears below Payment Terms. The full version below also makes it read-only once the order is confirmed." },
    { "lines": "9-11", "title": "Change attributes only", "text": "position attributes relabels the existing field without removing it, so other modules relying on it keep working." }
  ]
}
\`\`\`

The same view written with explicit XPath and a read-only expression:

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

\`\`\`visual-match
{
  "title": "Which position do you need?",
  "prompt": "Match each requirement on the sales order form to the inheritance position.",
  "leftLabel": "Requirement",
  "rightLabel": "position",
  "pairs": [
    { "left": "Show Customer PO just below Payment Terms", "right": "after" },
    { "left": "Add a Delivery Windows tab at the end of the notebook", "right": "inside" },
    { "left": "Rename the label of Customer Reference", "right": "attributes" },
    { "left": "Put a warning banner above the customer field", "right": "before" },
    { "left": "Swap a standard field for a completely different widget block (last resort)", "right": "replace" }
  ],
  "explanation": "after, before, inside and attributes keep the original node, so other modules can still anchor on it. replace removes it and should be rare."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "In a compact delivery window form you put tail_lift with an invisible expression on delivery_type, but delivery_type itself is not in that view. The upgrade fails. What do you add?",
  "options": ["An attrs attribute", "The field delivery_type to the view, with invisible set to 1 if it should stay hidden", "A groups attribute", "A new record rule"],
  "correct": 1,
  "explanation": "In Odoo 17 every field referenced in an invisible, readonly or required expression must be present in the view. Adding it as an invisible field satisfies the check without showing it."
}
\`\`\`

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

\`\`\`visual-layers
{
  "title": "The layers between a user and a delivery window",
  "caption": "Each layer answers a different question. Only the lower three are real security.",
  "layers": [
    { "title": "Menus and buttons with groups", "subtitle": "Can the user see the entry point?", "icon": "list", "items": ["menuitem groups", "button groups"], "detail": "Hides navigation only. A user can still reach the model through a link, the API or another menu." },
    { "title": "Groups (res.groups)", "subtitle": "Who is the user?", "icon": "users", "items": ["Sales: User - own documents", "Sales: Administrator", "Delivery Windows: Read Only"], "detail": "Users get rights through the groups they belong to." },
    { "title": "Access rights (ir.model.access.csv)", "subtitle": "Which operations on which models?", "icon": "key", "items": ["read", "write", "create", "unlink"], "detail": "Model-level CRUD per group. Additive: one group granting a right is enough." },
    { "title": "Record rules (ir.rule)", "subtitle": "Which records?", "icon": "filter", "items": ["Own orders only", "All windows"], "detail": "Domains that filter records. Group rules combine with OR, global rules with AND." },
    { "title": "PostgreSQL", "subtitle": "Reached only through the ORM", "icon": "database", "items": ["academy_delivery_window"], "detail": "The ORM applies the layers above before any SQL runs." }
  ]
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Reading the access CSV line by line",
  "language": "csv",
  "file": "academy_sale_extension/security/ir.model.access.csv",
  "code": [
    "id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink",
    "access_academy_delivery_window_user,academy.delivery.window.user,model_academy_delivery_window,sales_team.group_sale_salesman,1,1,1,0",
    "access_academy_delivery_window_manager,academy.delivery.window.manager,model_academy_delivery_window,sales_team.group_sale_manager,1,1,1,1",
    "access_academy_delivery_window_wh,academy.delivery.window.warehouse,model_academy_delivery_window,group_academy_warehouse_viewer,1,0,0,0",
    "access_academy_delivery_tag_user,academy.delivery.tag.user,model_academy_delivery_tag,sales_team.group_sale_salesman,1,0,0,0",
    "access_academy_delivery_tag_manager,academy.delivery.tag.manager,model_academy_delivery_tag,sales_team.group_sale_manager,1,1,1,1"
  ],
  "notes": [
    { "lines": "1", "title": "Header must be exact", "text": "A typo or extra space in the header makes the file load without applying anything." },
    { "lines": "2", "title": "Salespeople: no delete", "text": "Read, write and create on windows, but unlink is 0. Which windows they see is decided by the record rule." },
    { "lines": "3", "title": "Managers: full rights", "text": "All four permissions, including delete." },
    { "lines": "4", "title": "Warehouse: read only", "text": "Our own group, referenced without module prefix because it is defined in this module. Saving a change gives an access error." },
    { "lines": "5-6", "title": "Tags", "text": "Salespeople may only pick existing tags; managers maintain the list." }
  ]
}
\`\`\`

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

\`\`\`visual-sequence
{
  "title": "Sam Sales opens a delivery window on Mia's order",
  "actors": ["Sam (browser)", "ORM", "Security", "PostgreSQL"],
  "messages": [
    { "from": "Sam (browser)", "to": "ORM", "label": "read academy.delivery.window id 7", "kind": "request" },
    { "from": "ORM", "to": "Security", "label": "Access rights: may group_sale_salesman read this model?", "kind": "request" },
    { "from": "Security", "to": "ORM", "label": "Yes (CSV line perm_read = 1)", "kind": "response" },
    { "from": "ORM", "to": "Security", "label": "Record rules for Sam's groups", "kind": "request" },
    { "from": "Security", "to": "ORM", "label": "Domain: sale_order_id.user_id = Sam", "kind": "response", "note": "Sam is not in the manager or warehouse group, so only the own-orders rule applies." },
    { "from": "ORM", "to": "PostgreSQL", "label": "SELECT ... WHERE id = 7 AND rule domain", "kind": "request" },
    { "from": "PostgreSQL", "to": "ORM", "label": "No row: the order belongs to Mia", "kind": "response" },
    { "from": "ORM", "to": "Sam (browser)", "label": "AccessError: not allowed to access this record", "kind": "response" }
  ]
}
\`\`\`

\`\`\`visual-match
{
  "title": "Security pieces and their purpose",
  "prompt": "Match each security element to what it controls.",
  "leftLabel": "Element",
  "rightLabel": "Controls",
  "pairs": [
    { "left": "ir.model.access.csv", "right": "Which operations a group may perform on a model" },
    { "left": "ir.rule with groups", "right": "Which records a group sees, combined with OR" },
    { "left": "ir.rule without groups (global)", "right": "A filter applied to everyone, combined with AND" },
    { "left": "groups attribute on a menuitem", "right": "Whether the menu entry is shown" },
    { "left": "res.groups record", "right": "A named set of users that rights are granted to" }
  ],
  "explanation": "Menus hide, access rights allow operations, record rules filter rows. Only the last two protect data."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "Mia is in both Sales: Administrator and Sales: User - own documents. The own-orders rule and the all-windows rule both apply to her groups. What does she see?",
  "options": ["Only windows on her own orders, because the stricter rule wins", "All windows, because group rules are combined with OR", "Nothing, because the rules conflict", "Only the first rule by sequence is applied"],
  "correct": 1,
  "explanation": "Group-specific record rules are combined with OR across the user's groups, so the all-windows rule grants her everything. Only global rules are combined with AND."
}
\`\`\`

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

\`\`\`visual-sequence
{
  "title": "The super() chain when Confirm is clicked",
  "caption": "The last installed override runs first and passes control down with super().",
  "actors": ["Browser", "academy_sale_extension", "sale_stock", "sale"],
  "messages": [
    { "from": "Browser", "to": "academy_sale_extension", "label": "action_confirm()", "kind": "request" },
    { "from": "academy_sale_extension", "to": "academy_sale_extension", "label": "Check Customer PO on company customers", "kind": "self", "note": "Raising here stops the call before anything is written." },
    { "from": "academy_sale_extension", "to": "sale_stock", "label": "super().action_confirm()", "kind": "request" },
    { "from": "sale_stock", "to": "sale", "label": "super().action_confirm()", "kind": "request" },
    { "from": "sale", "to": "sale", "label": "state = sale, lock lines", "kind": "self" },
    { "from": "sale", "to": "sale_stock", "label": "return", "kind": "response" },
    { "from": "sale_stock", "to": "sale_stock", "label": "Create the delivery order", "kind": "self" },
    { "from": "sale_stock", "to": "academy_sale_extension", "label": "return res", "kind": "response" },
    { "from": "academy_sale_extension", "to": "academy_sale_extension", "label": "message_post: Confirmed against customer PO", "kind": "self" },
    { "from": "academy_sale_extension", "to": "Browser", "label": "return res", "kind": "response" }
  ]
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "The action_confirm override, step by step",
  "language": "python",
  "file": "academy_sale_extension/models/sale_order.py",
  "code": [
    "    def action_confirm(self):",
    "        for order in self:",
    "            if order.academy_po_required and not order.academy_customer_po:",
    "                raise UserError(",
    "                    _('Order %s: enter the Customer PO before confirming.', order.name)",
    "                )",
    "        res = super().action_confirm()",
    "        for order in self:",
    "            if order.academy_customer_po:",
    "                order.message_post(",
    "                    body=_('Confirmed against customer PO %s.', order.academy_customer_po)",
    "                )",
    "            _logger.info('Academy: order %s confirmed by %s', order.name, self.env.user.login)",
    "        return res"
  ],
  "notes": [
    { "lines": "1", "title": "Same name, same signature", "text": "Overriding means defining the parent's method again in a class with _inherit = 'sale.order'. Changing the arguments breaks callers." },
    { "lines": "2-6", "title": "Validate every record first", "text": "If any selected order lacks a PO, the UserError rolls back the whole call before anything is confirmed." },
    { "lines": "7", "title": "Call super() and keep the result", "text": "Runs standard sale code and every other module's override: deliveries, projects, and so on." },
    { "lines": "8-12", "title": "Post-process after super()", "text": "The orders are now confirmed, so the chatter message describes a fact." },
    { "lines": "13", "title": "Log with placeholders", "text": "Lazy %s formatting; never log secrets or personal data." },
    { "lines": "14", "title": "Return the parent's result", "text": "action_confirm can return an action such as a wizard; dropping it would break that flow." }
  ]
}
\`\`\`

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

\`\`\`visual-order
{
  "title": "Anatomy of a safe override",
  "prompt": "Put the parts of an overridden action_confirm in the order they must run.",
  "items": ["Loop over self and raise UserError for any invalid order", "Call super().action_confirm() and store the result", "Post the chatter message and write the log line", "Return the stored result"],
  "explanation": "Validate first so nothing is half-done, let the standard chain run, then add your follow-up and return what the parent returned."
}
\`\`\`

\`\`\`visual-check
{
  "question": "After installing a colleague's module, confirmed orders no longer create delivery orders, but no error appears. What do you check first?",
  "options": ["The access CSV of the stock module", "Whether the colleague's action_confirm override calls super()", "The wkhtmltopdf version", "The manifest version number"],
  "correct": 1,
  "explanation": "An override without super() silently skips the standard code and every override below it, including the one in sale_stock that creates the delivery."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "The method behind the button",
  "language": "python",
  "file": "academy_sale_extension/models/sale_order.py",
  "code": [
    "    def action_view_delivery_windows(self):",
    "        self.ensure_one()",
    "        return {",
    "            'type': 'ir.actions.act_window',",
    "            'name': _('Delivery Windows'),",
    "            'res_model': 'academy.delivery.window',",
    "            'view_mode': 'tree,form',",
    "            'domain': [('sale_order_id', '=', self.id)],",
    "            'context': {'default_sale_order_id': self.id},",
    "        }"
  ],
  "notes": [
    { "lines": "1", "title": "Name matches the button", "text": "A button with type object and this name calls the method on the record shown in the form." },
    { "lines": "2", "title": "One order at a time", "text": "The button always works on one record; ensure_one documents and enforces that." },
    { "lines": "3-4", "title": "Return an action", "text": "The dictionary has the same shape as an ir.actions.act_window record; the web client opens it." },
    { "lines": "7", "title": "Views to show", "text": "tree,form in Odoo 17; list,form in Odoo 18." },
    { "lines": "8", "title": "domain filters the list", "text": "Only this order's windows. Without it the user sees every window." },
    { "lines": "9", "title": "context pre-fills new records", "text": "default_sale_order_id sets the order when the user clicks New in that list." }
  ]
}
\`\`\`

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

\`\`\`visual-sequence
{
  "title": "A click on '2 Delivery Windows'",
  "actors": ["Salesperson", "Web client", "Odoo server", "PostgreSQL"],
  "messages": [
    { "from": "Web client", "to": "Odoo server", "label": "Load form: read delivery_window_count", "kind": "request", "note": "Non-stored compute: counted at every read, so it is always current." },
    { "from": "Odoo server", "to": "Web client", "label": "delivery_window_count = 2", "kind": "response" },
    { "from": "Salesperson", "to": "Web client", "label": "Click the stat button", "kind": "request" },
    { "from": "Web client", "to": "Odoo server", "label": "call_button: action_view_delivery_windows on order 42", "kind": "request" },
    { "from": "Odoo server", "to": "Web client", "label": "Action dict: model, views, domain, context", "kind": "response" },
    { "from": "Web client", "to": "Odoo server", "label": "search_read academy.delivery.window with the domain", "kind": "request" },
    { "from": "Odoo server", "to": "PostgreSQL", "label": "SELECT ... WHERE sale_order_id = 42 (plus record rules)", "kind": "request" },
    { "from": "PostgreSQL", "to": "Odoo server", "label": "2 rows", "kind": "response" },
    { "from": "Odoo server", "to": "Web client", "label": "Records", "kind": "response" },
    { "from": "Web client", "to": "Salesperson", "label": "List of the order's 2 windows", "kind": "response" }
  ]
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Smart button errors",
  "prompt": "Match each symptom to its fix.",
  "leftLabel": "Symptom",
  "rightLabel": "Fix",
  "pairs": [
    { "left": "The list opened by the button shows every window in the database", "right": "Add the domain on sale_order_id to the action" },
    { "left": "New windows created from the list have no order", "right": "Add default_sale_order_id to the context" },
    { "left": "Element div button_box cannot be located", "right": "Inspect the parent view and correct the XPath" },
    { "left": "Expected singleton when the method runs", "right": "Keep self.ensure_one() and call it per record" },
    { "left": "Has no attribute action_view_delivery_windows", "right": "Match the button name to the method and restart" }
  ],
  "explanation": "Most smart button bugs are in the returned action: the domain controls what is shown and the context controls defaults."
}
\`\`\`

## Design guidelines

| Guideline | Reason |
|-----------|--------|
| Show counts users act on (open items, related documents) | Buttons are navigation, not decoration |
| Keep at most a handful of custom buttons per form | Too many buttons hide the important ones in a "More" dropdown |
| Use non-stored counters | Counts are cheap to compute and always current |
| Respect access rights | A user without read access to the target model should not see the button - add \`groups=\` matching the CSV rights |
| Reuse standard icons (Font Awesome \`fa-*\`) | Consistent look with standard buttons |

When the target model has record rules, the count computed by \`len()\` reflects only the records the current user may see, which is usually what users expect. Mention this in your functional specification so testers are not surprised when a salesperson and a manager see different numbers on the same order.

\`\`\`visual-check
{
  "question": "Why is delivery_window_count deliberately a non-stored computed field?",
  "options": ["Stored fields cannot be integers", "Counts are cheap to compute and stay current without recompute triggers", "Stat buttons only accept non-stored fields", "Stored fields ignore record rules"],
  "correct": 1,
  "explanation": "A count is quick to compute on read and always reflects the current data. Storing it adds a column and recompute work with no benefit unless you need to search or group on it."
}
\`\`\`

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

\`\`\`visual-flow
{
  "title": "Approval lifecycle of a quotation above 10,000",
  "caption": "Select a step to see who acts and which button moves the order on.",
  "steps": [
    { "title": "To Request", "icon": "file", "actor": "Salesperson", "document": "academy_approval_state = draft", "detail": "Amount is above the threshold. Confirm is blocked in Python.", "odoo": "Button: Request Approval" },
    { "title": "Waiting Approval", "icon": "clock", "actor": "Sales manager", "document": "to_approve", "detail": "Chatter logs the request. Only managers see Approve and Reject, and the methods check has_group.", "odoo": "Buttons: Approve / Reject", "branch": { "when": "Rejected", "result": "Rework, then Reset Approval", "tone": "danger" } },
    { "title": "Approved", "icon": "check", "actor": "Sales manager", "document": "approved", "detail": "Approved By is set to the manager." },
    { "title": "Confirmed", "icon": "handshake", "actor": "Salesperson", "document": "Sales order", "detail": "action_confirm now passes the approval guard and calls super().", "odoo": "Button: Confirm" }
  ]
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Where the approval is really enforced",
  "language": "python",
  "file": "academy_sale_extension/models/sale_order.py (excerpt)",
  "code": [
    "    def _academy_threshold(self):",
    "        value = self.env['ir.config_parameter'].sudo().get_param(APPROVAL_PARAM, '10000')",
    "        return float(value)",
    "",
    "    def action_academy_approve(self):",
    "        if not self.env.user.has_group('sales_team.group_sale_manager'):",
    "            raise UserError(_('Only sales managers can approve quotations.'))",
    "        self.write({'academy_approval_state': 'approved', 'academy_approved_by_id': self.env.user.id})",
    "",
    "    def action_confirm(self):",
    "        for order in self:",
    "            if order._academy_needs_approval() and order.academy_approval_state != 'approved':",
    "                raise UserError(_('Order %s needs manager approval before confirmation.', order.name))",
    "        return super().action_confirm()"
  ],
  "notes": [
    { "lines": "2", "title": "Configurable threshold", "text": "Read from a system parameter, so the client changes it without code. sudo() is justified: salespeople cannot read system parameters, and the value is not user input." },
    { "lines": "3", "title": "Text to number", "text": "Parameters are stored as text. A non-numeric value raises could not convert string to float." },
    { "lines": "6-7", "title": "Permission check in Python", "text": "groups on the button only hides it. This check also protects calls from the API, server actions and imports." },
    { "lines": "8", "title": "One write for all records", "text": "write on the recordset updates every selected order and records the approver." },
    { "lines": "12-13", "title": "The guard", "text": "Above the threshold and not approved means no confirmation, whatever path the call came from." },
    { "lines": "14", "title": "Return super()", "text": "The standard confirmation runs only after the guard passes." }
  ]
}
\`\`\`

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

\`\`\`visual-roleplay
{
  "title": "Scoping the approval workflow",
  "setting": "Specification workshop at Sunrise Office Supplies. The sales director wants approvals live next week.",
  "client": "Sales director",
  "rounds": [
    {
      "says": "Just hide the Confirm button for big quotations unless a manager approved them. That is enough, right?",
      "options": [
        { "text": "Yes, hiding the button with groups is quick.", "quality": "poor", "feedback": "Hidden buttons are not security: imports, the API or the list Actions menu could still confirm." },
        { "text": "We will hide it for usability, but the rule itself will be checked in Python so no path can bypass it.", "quality": "best", "feedback": "The view improves the experience, the server enforces the rule." }
      ]
    },
    {
      "says": "And if the salesperson changes the amount after approval?",
      "options": [
        { "text": "That should not happen, salespeople are trustworthy.", "quality": "poor", "feedback": "Edge cases are where approval workflows fail audits." },
        { "text": "Let's decide now: reset approval when the total changes, or re-check the approved amount at confirmation. I will write it into the specification and the tests.", "quality": "best", "feedback": "You turn an edge case into an explicit, testable requirement." },
        { "text": "We can handle that in phase two.", "quality": "ok", "feedback": "Acceptable if documented as a known gap, but the client must sign off on the risk." }
      ]
    }
  ],
  "wrapup": "Map rejection, amount changes, duplication and cancellation before coding, and enforce every rule in Python."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "The client changed the approval threshold to 25,000 in System Parameters. After the next module upgrade it is back to 10,000. What fixes this?",
  "options": ["Mark the data file with noupdate='1'", "Store the threshold in Python as a constant", "Give the parameter a group", "Run the upgrade with --dev=all"],
  "correct": 0,
  "explanation": "Records in a noupdate data file are created on install but not overwritten on upgrade, so values the client changed are preserved."
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Pick the automation tool",
  "prompt": "Match each Sunrise need to the Odoo tool that fits it best.",
  "leftLabel": "Need",
  "rightLabel": "Tool",
  "pairs": [
    { "left": "Every morning, remind managers about waiting quotations", "right": "Scheduled action (ir.cron)" },
    { "left": "Ask a specific person to approve a quotation", "right": "Activity (mail.activity)" },
    { "left": "Request approval for many selected quotations at once", "right": "Server action bound to the list" },
    { "left": "Notify the dispatcher when an express window is created", "right": "Automation rule (base_automation)" }
  ],
  "explanation": "Time-driven work goes to a cron, event-driven work to an automation rule, user-triggered mass work to a server action, and to-dos for people to activities."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Declaring the scheduled action",
  "language": "xml",
  "file": "academy_sale_extension/data/academy_cron.xml",
  "code": [
    "<?xml version='1.0' encoding='utf-8'?>",
    "<odoo noupdate='1'>",
    "    <record id='ir_cron_academy_pending_approvals' model='ir.cron'>",
    "        <field name='name'>Academy: remind pending approvals</field>",
    "        <field name='model_id' ref='sale.model_sale_order'/>",
    "        <field name='state'>code</field>",
    "        <field name='code'>model._cron_academy_remind_pending_approvals()</field>",
    "        <field name='interval_number'>1</field>",
    "        <field name='interval_type'>days</field>",
    "        <field name='numbercall'>-1</field>",
    "        <field name='active'>True</field>",
    "    </record>",
    "</odoo>"
  ],
  "notes": [
    { "lines": "2", "title": "noupdate", "text": "Created on install, not overwritten on upgrade, so an administrator's changes to the schedule survive." },
    { "lines": "3", "title": "A cron is a record", "text": "Model ir.cron, visible under Settings > Technical > Scheduled Actions." },
    { "lines": "5-7", "title": "What it runs", "text": "Python code on the sale.order model; model is the empty sale.order recordset, so the method searches the orders itself." },
    { "lines": "8-9", "title": "How often", "text": "Every 1 day. The next execution date is shown and can be changed in the UI." },
    { "lines": "10", "title": "Odoo 17 only", "text": "numbercall -1 means run forever. The field was removed in Odoo 18: drop this line there." },
    { "lines": "11", "title": "Active", "text": "Neutralized databases deactivate crons; test with Run Manually." }
  ]
}
\`\`\`

> Odoo 18 note: the \`numbercall\` field was removed from \`ir.cron\`; drop that line on 18 (verify against the documentation for your version).

Explanation:

- \`model\` in the cron code is the empty recordset of \`sale.order\`; the method is decorated \`@api.model\` and searches itself.
- \`activity_schedule\` is provided by \`mail.activity.mixin\`, which \`sale.order\` inherits. The first argument is the external id of an activity type.
- The duplicate check makes the cron **idempotent**: running it twice does not create two activities.
- Test immediately from *Settings > Technical > Scheduled Actions > Run Manually*.

\`\`\`visual-sequence
{
  "title": "One run of the reminder cron",
  "actors": ["Cron scheduler", "sale.order", "mail.activity", "PostgreSQL"],
  "messages": [
    { "from": "Cron scheduler", "to": "Cron scheduler", "label": "Next execution date reached: lock the job", "kind": "self", "note": "Only one worker runs a given job at a time." },
    { "from": "Cron scheduler", "to": "sale.order", "label": "model._cron_academy_remind_pending_approvals()", "kind": "request" },
    { "from": "sale.order", "to": "PostgreSQL", "label": "search: to_approve and write_date older than 1 day", "kind": "request" },
    { "from": "PostgreSQL", "to": "sale.order", "label": "Orders S00051, S00057", "kind": "response" },
    { "from": "sale.order", "to": "sale.order", "label": "Skip orders that already have an 'Approve quotation' activity", "kind": "self", "note": "This check makes the job idempotent." },
    { "from": "sale.order", "to": "mail.activity", "label": "activity_schedule(To-Do, user = team leader)", "kind": "request" },
    { "from": "mail.activity", "to": "PostgreSQL", "label": "INSERT activity rows", "kind": "request" },
    { "from": "Cron scheduler", "to": "PostgreSQL", "label": "Commit and set the next execution date", "kind": "request" }
  ]
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "The reminder cron is run manually twice in a row on academy_test. With the code in this lesson, how many 'Approve quotation' activities does each waiting quotation get?",
  "options": ["One", "Two", "None, manual runs do not create activities", "It depends on the interval"],
  "correct": 0,
  "explanation": "The method skips orders that already have an activity with that summary, so the second run creates nothing new. That is what idempotent means."
}
\`\`\`

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

\`\`\`visual-flow
{
  "title": "From Print to PDF",
  "steps": [
    { "title": "Print menu", "icon": "file", "actor": "User", "detail": "The report appears because binding_model_id links the report action to sale.order." },
    { "title": "ir.actions.report", "icon": "settings", "app": "Server", "detail": "Finds the template named in report_name and the selected records (docs)." },
    { "title": "QWeb rendering", "icon": "code", "app": "Server", "detail": "Loops over docs, calls web.external_layout for header and footer, fills t-field values in the user's or partner's language." },
    { "title": "wkhtmltopdf", "icon": "layers", "app": "Server", "detail": "Converts the HTML to PDF, fetching CSS from web.base.url." },
    { "title": "Download", "icon": "check", "actor": "User", "detail": "File name from print_report_name, e.g. Delivery Windows - S00042.pdf." }
  ]
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "The template, trimmed to its skeleton",
  "language": "xml",
  "file": "report/academy_delivery_window_report.xml (excerpt)",
  "code": [
    "<template id='report_delivery_windows'>",
    "    <t t-call='web.html_container'>",
    "        <t t-foreach='docs' t-as='o'>",
    "            <t t-call='web.external_layout'>",
    "                <div class='page'>",
    "                    <h2>Delivery Windows - <span t-field='o.name'/></h2>",
    "                    <table class='table table-sm'>",
    "                        <tr t-foreach='o.delivery_window_ids' t-as='w'>",
    "                            <td><span t-field='w.name'/></td>",
    "                            <td><span t-field='w.date_from'/></td>",
    "                        </tr>",
    "                    </table>",
    "                    <p t-if='not o.delivery_window_ids'>No delivery windows planned.</p>",
    "                </div>",
    "            </t>",
    "        </t>",
    "    </t>",
    "</template>"
  ],
  "notes": [
    { "lines": "1", "title": "Template id = report_name", "text": "academy_sale_extension.report_delivery_windows is what the report action points to." },
    { "lines": "2", "title": "HTML container", "text": "Provides the HTML page and assets every PDF report needs." },
    { "lines": "3", "title": "One page per record", "text": "docs holds the selected orders; o is the current one." },
    { "lines": "4", "title": "Company layout", "text": "Header, footer and logo from Configure Document Layout: configuration, not code." },
    { "lines": "6", "title": "t-field formats values", "text": "Dates follow the language and timezone, Many2one fields show the display name." },
    { "lines": "8", "title": "Loop over the windows", "text": "One table row per delivery window of this order." },
    { "lines": "13", "title": "Conditional text", "text": "t-if shows the line only for orders without windows." }
  ]
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "QWeb directives",
  "prompt": "Match each directive to its job in a report.",
  "leftLabel": "Directive",
  "rightLabel": "Job",
  "pairs": [
    { "left": "t-field", "right": "Print a field with Odoo formatting (dates, currency, names)" },
    { "left": "t-out / t-esc", "right": "Print the escaped value of an expression" },
    { "left": "t-if", "right": "Render the element only when a condition is true" },
    { "left": "t-foreach + t-as", "right": "Repeat the element for each item" },
    { "left": "t-call", "right": "Include another template such as web.external_layout" },
    { "left": "t-set + t-value", "right": "Store an intermediate value in a variable" }
  ],
  "explanation": "Prefer t-field for record fields: it formats according to the field type and language, which t-out does not."
}
\`\`\`

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

\`\`\`visual-decision
{
  "title": "Handling a 'change the quotation PDF' request",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is it about logo, colours, fonts, address or footer?", "options": [ { "label": "Yes", "next": "r_layout" }, { "label": "No, content changes", "next": "q2" } ] },
    "q2": { "question": "Is it a new document, or a change to the standard quotation?", "options": [ { "label": "New document", "next": "r_new" }, { "label": "Change to the standard one", "next": "r_inherit" } ] },
    "r_layout": { "result": "Configure Document Layout", "tone": "success", "detail": "Pure configuration under Settings > Companies. No code, no upgrade risk." },
    "r_new": { "result": "New ir.actions.report + QWeb template", "tone": "info", "detail": "Like the Delivery Windows sheet: bound to the model's Print menu." },
    "r_inherit": { "result": "Inherit sale.report_saleorder_document", "tone": "warning", "detail": "Add content with XPath; never copy the whole template. Verify the anchor in your version." }
  }
}
\`\`\`

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

\`\`\`visual-order
{
  "title": "Debug a ticket like a professional",
  "prompt": "Put the debugging steps in the right order.",
  "items": ["Reproduce on a test database with the same version and modules", "Read the last lines of the traceback: exception and message", "Locate the module and file in the traceback: standard or custom?", "Isolate: without the custom module, with another user", "Fix, verify, and add a test so it does not come back"],
  "explanation": "Without a reproduction you cannot prove a fix; without isolating you may fix the wrong module."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Anatomy of a log line",
  "language": "text",
  "file": "odoo server log",
  "code": [
    "2024-05-14 08:12:03,902 4242 WARNING academy_dev odoo.modules.loading: The model academy.delivery.tag has no access rules, consider adding one."
  ],
  "notes": [
    { "lines": "1", "title": "Timestamp and process id", "text": "2024-05-14 08:12:03,902 and 4242: when it happened and which worker. Match it to the time the user clicked." },
    { "lines": "1", "title": "Level", "text": "WARNING: unexpected but handled. ERROR and tracebacks are failures." },
    { "lines": "1", "title": "Database", "text": "academy_dev: essential on servers hosting several databases." },
    { "lines": "1", "title": "Logger", "text": "odoo.modules.loading is the Python module that wrote the line. Your own code logs as odoo.addons.academy_sale_extension...." },
    { "lines": "1", "title": "Message", "text": "Tells you the fix: add an ir.model.access.csv line for academy.delivery.tag." }
  ]
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Which log level?",
  "prompt": "Match each situation to the log level you would use.",
  "leftLabel": "Situation",
  "rightLabel": "Level",
  "pairs": [
    { "left": "Tracing every loop iteration while developing", "right": "debug" },
    { "left": "Order S00042 confirmed by a user", "right": "info" },
    { "left": "External API slow, retried successfully", "right": "warning" },
    { "left": "Confirmation failed, traceback needed", "right": "exception" }
  ],
  "explanation": "Production usually runs at info, so debug lines stay silent. _logger.exception adds the traceback automatically and is used inside an except block."
}
\`\`\`

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

\`\`\`visual-dodont
{
  "title": "Debugging and logging hygiene",
  "do": ["Reproduce on a test copy before changing anything", "Log with %s placeholders and arguments", "Re-raise after _logger.exception so the transaction rolls back", "Send version, modules, steps, user and full traceback when escalating", "Remove pdb breakpoints before committing"],
  "dont": ["Debug on production with --dev=all", "Log passwords, tokens or full personal data", "Swallow exceptions silently with a bare except", "Test only as administrator", "Report 'it does not work' without a traceback"]
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "A salesperson gets an AccessError on delivery windows, but the consultant logged in as admin cannot reproduce it. What is the next step?",
  "options": ["Close the ticket: it works", "Log in as that user (or a user with the same groups) and review the CSV lines and record rules", "Give the salesperson admin rights", "Restart the server"],
  "correct": 1,
  "explanation": "The administrator bypasses most restrictions. Reproduce with the user's groups, then check access rights and record rules."
}
\`\`\`

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

\`\`\`visual-codewalk
{
  "title": "Reading one test like a specification",
  "language": "python",
  "file": "academy_sale_extension/tests/test_academy_sale.py (excerpt)",
  "code": [
    "@tagged('post_install', '-at_install', 'academy')",
    "class TestAcademySale(TransactionCase):",
    "",
    "    @classmethod",
    "    def setUpClass(cls):",
    "        super().setUpClass()",
    "        cls.company_customer = cls.env['res.partner'].create({",
    "            'name': 'Test Company Customer',",
    "            'is_company': True,",
    "        })",
    "",
    "    def test_po_required_for_company(self):",
    "        order = self._create_order()",
    "        with self.assertRaises(UserError):",
    "            order.action_confirm()",
    "        order.academy_customer_po = 'PO-TEST-1'",
    "        order.action_confirm()",
    "        self.assertEqual(order.state, 'sale')"
  ],
  "notes": [
    { "lines": "1", "title": "When the tests run", "text": "post_install and not at_install: after all modules are installed, so every override of action_confirm is present. academy is a custom tag for filtering." },
    { "lines": "2", "title": "TransactionCase", "text": "Each test runs in a transaction that is rolled back, so tests never leave data behind." },
    { "lines": "4-10", "title": "Shared test data", "text": "Created once for the class. Tests create their own data and never rely on demo or production records." },
    { "lines": "12", "title": "Name starts with test_", "text": "Only methods named test_... are run. The name reads as the requirement." },
    { "lines": "13-15", "title": "Given / when / then: the failure", "text": "A company customer without PO: confirming must raise UserError." },
    { "lines": "16-18", "title": "The success path", "text": "With a PO the order confirms and its state becomes sale." }
  ]
}
\`\`\`

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

\`\`\`visual-sequence
{
  "title": "What happens during a test run",
  "caption": "odoo-bin -d academy_test -u academy_sale_extension --test-tags /academy_sale_extension --stop-after-init",
  "actors": ["odoo-bin", "Test runner", "TestAcademySale", "academy_test DB"],
  "messages": [
    { "from": "odoo-bin", "to": "academy_test DB", "label": "Upgrade academy_sale_extension", "kind": "request" },
    { "from": "odoo-bin", "to": "Test runner", "label": "All modules loaded: run post_install tests matching the tags", "kind": "request" },
    { "from": "Test runner", "to": "TestAcademySale", "label": "setUpClass: create customer and product", "kind": "request" },
    { "from": "TestAcademySale", "to": "academy_test DB", "label": "test_po_required_for_company: create order, confirm", "kind": "request" },
    { "from": "academy_test DB", "to": "TestAcademySale", "label": "Rollback after the test", "kind": "response", "note": "Each test starts from the same clean data." },
    { "from": "Test runner", "to": "TestAcademySale", "label": "Next test method ...", "kind": "request" },
    { "from": "Test runner", "to": "odoo-bin", "label": "0 failed, 0 error(s) of 4 tests", "kind": "response" },
    { "from": "odoo-bin", "to": "odoo-bin", "label": "Stop after init (exit code for CI)", "kind": "self" }
  ]
}
\`\`\`

\`\`\`visual-match
{
  "title": "Test command options",
  "prompt": "Match each command-line option to its meaning.",
  "leftLabel": "Option",
  "rightLabel": "Meaning",
  "pairs": [
    { "left": "-u academy_sale_extension", "right": "Upgrade the module; its tests run during this" },
    { "left": "--test-enable", "right": "Turn test execution on" },
    { "left": "--test-tags /academy_sale_extension", "right": "Only run this module's tests" },
    { "left": "--stop-after-init", "right": "Exit when done instead of serving HTTP" },
    { "left": "-d academy_test", "right": "Use the dedicated test database, never production" }
  ],
  "explanation": "Together these give a fast, repeatable, CI-friendly run that cannot touch live data."
}
\`\`\`

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

\`\`\`visual-check
{
  "question": "You wrote tests/test_academy_sale.py but the run reports 0 tests for your module. Which cause is most likely?",
  "options": ["The tests package is not imported from the module root __init__.py", "tests/__init__.py does not import test_academy_sale", "TransactionCase needs a database argument", "The test methods are not decorated with @api.model"],
  "correct": 1,
  "explanation": "The runner discovers the tests package itself, but that package must import each test file. The module root must not import tests."
}
\`\`\`

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

\`\`\`visual-timeline
{
  "title": "Your path through the assignments",
  "items": [
    { "when": "1-2", "title": "Fields, model and menu", "detail": "Customer PO on sale.order; academy.delivery.window with views, action, menu and CSV.", "icon": "box" },
    { "when": "3-5", "title": "Data quality and derived values", "detail": "Constraints, stored computed weight, related customer country.", "icon": "check" },
    { "when": "6-7", "title": "Navigation and business logic", "detail": "Smart button; action_confirm override that calls super().", "icon": "workflow" },
    { "when": "8-9", "title": "Documents and approvals", "detail": "QWeb report and report inheritance; approval workflow enforced in Python.", "icon": "file" },
    { "when": "10-11", "title": "Insight and automation", "detail": "Graph and pivot dashboard; idempotent daily cron with activities.", "icon": "chart" },
    { "when": "12-13", "title": "Integration and proof", "detail": "API import with an integration user on the test database; automated tests with 0 failed.", "icon": "shield" }
  ]
}
\`\`\`

\`\`\`visual-order
{
  "title": "The rhythm of every assignment",
  "prompt": "Put the steps you repeat for each assignment in order.",
  "items": ["Write the requirement and why standard does not cover it", "Create a feature branch", "Code, restart and upgrade on the development database", "Test as a non-admin user and capture evidence", "Add or update automated tests", "Commit with an [ADD] or [IMP] message and push for review"],
  "explanation": "Requirement first, isolated branch, verified as a real user, protected by tests, then reviewed. That is the deliverable, not just the code."
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Error to fix, across the course",
  "prompt": "Match each error you will meet in the assignments to its fix.",
  "leftLabel": "Error",
  "rightLabel": "Fix",
  "pairs": [
    { "left": "The model has no access rules, consider adding one", "right": "Add a CSV line per new model and list the file in the manifest" },
    { "left": "ParseError while parsing a view file", "right": "Fix the malformed XML on the reported line" },
    { "left": "Field does not exist in model sale.order", "right": "Check __init__.py imports, restart, then upgrade" },
    { "left": "attrs and states attributes are no longer used", "right": "Rewrite with Odoo 17 invisible and readonly expressions" },
    { "left": "Compute method failed to assign", "right": "Assign the field for every record in the loop" },
    { "left": "Element cannot be located in parent view", "right": "Inspect the parent view and correct the XPath anchor" }
  ],
  "explanation": "These six messages cover most failed upgrades in this course. Reading the message carefully usually tells you the fix."
}
\`\`\`

\`\`\`visual-check
{
  "question": "Assignment 12 imports delivery windows through the external API. Which setup meets the acceptance criteria?",
  "options": ["Admin login and password written in the script, run on production", "A dedicated integration user with an API key read from an environment variable, run on the test database, looking up existing windows first", "Direct INSERT statements into academy_delivery_window", "An API key committed in a config file in the repository"],
  "correct": 1,
  "explanation": "A dedicated user limits rights, the environment variable keeps secrets out of Git, the test database protects live data, and the lookup makes re-runs idempotent."
}
\`\`\`

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
