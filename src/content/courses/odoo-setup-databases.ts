import type { CourseContent } from "../types";

/**
 * Odoo setup: editions, hosting, installation, databases and apps.
 * The first course of Odoo Application Training: every later app course assumes
 * the trainee can get a database running and install apps safely.
 * Running example company: Northwind Office Supplies Pvt Ltd (B2B office-supplies distributor).
 */
export const odooSetupDatabases: CourseContent = {
  slug: "odoo-setup-databases",
  section: "odoo-apps",
  title: "Odoo Setup: Installation, Databases & Apps",
  summary:
    "Before any app can be configured, a consultant has to choose an edition and hosting option, get Odoo running, create and protect databases, and install the right apps. This course covers Community vs Enterprise, Odoo Online vs Odoo.sh vs on-premise, installing Odoo, the database manager (create, duplicate, back up, restore, delete), environment strategy and neutralization, installing and uninstalling apps, and the first-time setup checklist, using Northwind Office Supplies as the running example.",
  level: "beginner",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 0,
  skills: [
    "Recommend an Odoo edition and hosting option for a client",
    "Install Odoo on a server or with Docker and read the configuration file",
    "Create, duplicate, back up, restore and delete databases with the database manager",
    "Design a production, staging, development and training database strategy",
    "Neutralize a copied database so it cannot email customers or charge cards",
    "Install, upgrade and uninstall apps and explain their dependencies",
    "Complete the first-time setup of a new Odoo database",
  ],
  modules: [
    {
      title: "Module 1: Getting Odoo running",
      lessons: [
        {
          slug: "editions-hosting-and-versions",
          title: "Odoo editions, hosting options and versions",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "enterprise"],
          body: `\`\`\`visual-video
{
  "src": "/videos/odoo-setup-databases.mp4",
  "poster": "/videos/odoo-setup-databases.webp",
  "title": "Video: Setting up Odoo, databases and apps",
  "duration": "10:55",
  "caption": "Narrated overview of the whole course: editions, hosting, installation, the database manager, environments, apps and the first-time setup. Narration: Indian English neural voice.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 26,
      "label": "Four decisions"
    },
    {
      "t": 62,
      "label": "Editions"
    },
    {
      "t": 107,
      "label": "Hosting"
    },
    {
      "t": 158,
      "label": "Installing"
    },
    {
      "t": 209,
      "label": "Configuration"
    },
    {
      "t": 261,
      "label": "What a database is"
    },
    {
      "t": 302,
      "label": "Create a database"
    },
    {
      "t": 352,
      "label": "Manage databases"
    },
    {
      "t": 404,
      "label": "Environments"
    },
    {
      "t": 444,
      "label": "Neutralization"
    },
    {
      "t": 488,
      "label": "Apps"
    },
    {
      "t": 535,
      "label": "Uninstall with care"
    },
    {
      "t": 567,
      "label": "First-time setup"
    },
    {
      "t": 612,
      "label": "Key takeaways"
    }
  ]
}
\`\`\`

\`\`\`visual-audio
{
  "src": "/podcasts/odoo-setup-databases.mp3",
  "title": "Podcast: Setting up Odoo the right way",
  "duration": "10:06",
  "caption": "A conversation between Priya (host) and Arjun (Odoo functional consultant) about editions, hosting, databases and apps. Listen on the go; the full transcript is in docs/podcasts.",
  "chapters": [
    {
      "t": 0,
      "label": "Welcome"
    },
    {
      "t": 54,
      "label": "Community or Enterprise"
    },
    {
      "t": 116,
      "label": "Online, Odoo.sh or on-premise"
    },
    {
      "t": 209,
      "label": "Installing Odoo"
    },
    {
      "t": 278,
      "label": "Databases and backups"
    },
    {
      "t": 383,
      "label": "Environments and neutralization"
    },
    {
      "t": 461,
      "label": "Apps"
    },
    {
      "t": 538,
      "label": "First-time setup and wrap-up"
    }
  ]
}
\`\`\`

## 1. Why setup matters

Every Odoo app course in this academy starts with *"open your training database"*. On a real project, that database does not appear by magic. Before the first workshop the consultant has to answer four questions with the client:

1. **Which edition?** Community or Enterprise.
2. **Where will it run?** Odoo Online, Odoo.sh or the client's own server (on-premise).
3. **Which version?** Usually the latest stable major version.
4. **How many databases?** Production, staging, development and training, and who may touch each one.

Wrong answers are expensive. A client who chooses Odoo Online and later needs a custom Python module must migrate to Odoo.sh. A team that tests in production sends test invoices to real customers. A consultant who uninstalls an app "to clean up" deletes its data.

Throughout this course we use our usual fictional company:

| Item | Value |
|---|---|
| Company | Northwind Office Supplies Pvt Ltd |
| Business | B2B distributor of paper, printer consumables, furniture and pantry supplies |
| Users | 25 (sales, purchase, warehouse, accounts) |
| Apps needed | CRM, Sales, Purchase, Inventory, Accounting, later eCommerce |
| Special need | A custom integration with a courier's API (custom Python code) |

## 2. Community vs Enterprise

Odoo is *open core*: one code base with two editions.

\`\`\`visual-compare
{
  "title": "Odoo Community vs Odoo Enterprise",
  "columns": ["Community", "Enterprise"],
  "rows": [
    { "label": "Licence", "values": ["LGPL v3, free", "Odoo Enterprise licence, paid per user"] },
    { "label": "Core apps (CRM, Sales, Purchase, Inventory, Manufacturing, Website)", "values": [true, true] },
    { "label": "Full Accounting app (bank sync, reconciliation models, reports)", "values": ["Invoicing only", true] },
    { "label": "Studio, Knowledge, Sign, Planning, Field Service, Quality, PLM", "values": [false, true] },
    { "label": "Mobile app experience and support from Odoo S.A.", "values": [false, true] },
    { "label": "Version upgrades by Odoo's upgrade service", "values": [false, true] },
    { "label": "Hosting options", "values": ["On-premise only", "Odoo Online, Odoo.sh or on-premise"] }
  ],
  "highlight": 1
}
\`\`\`

> **Consultant tip:** Community is a valid choice for small, technically capable clients. The moment the client needs full accounting with bank synchronisation, Studio, or official upgrades, Enterprise is usually cheaper than building those features.

## 3. Three ways to host Odoo

\`\`\`visual-cards
{
  "label": "Hosting",
  "title": "Odoo Online, Odoo.sh and on-premise",
  "columns": 3,
  "cards": [
    { "icon": "cloud", "title": "Odoo Online (SaaS)", "body": "Odoo S.A. runs everything. Fastest start, automatic upgrades and backups. Standard apps and Studio only: no custom Python modules or Apps Store modules.", "tone": "info" },
    { "icon": "server", "title": "Odoo.sh (PaaS)", "body": "Odoo's cloud platform for Enterprise with your own code from GitHub. Production, staging and development branches, automatic backups, custom and third-party modules." },
    { "icon": "building", "title": "On-premise / self-hosted", "body": "Your server or your cloud provider. Community or Enterprise. Full control, but you own security, backups, monitoring and upgrades.", "tone": "warning" }
  ]
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Which hosting option fits?",
  "start": "custom",
  "nodes": {
    "custom": { "question": "Does the client need custom Python modules or Apps Store modules?", "options": [ { "label": "No, standard apps and Studio are enough", "next": "online" }, { "label": "Yes", "next": "control" } ] },
    "online": { "result": "Odoo Online", "tone": "success", "detail": "Lowest effort. Odoo S.A. handles servers, backups and upgrades." },
    "control": { "question": "Must the data stay on the client's own servers, or do they want to run Community?", "options": [ { "label": "No", "next": "sh" }, { "label": "Yes", "next": "onprem" } ] },
    "sh": { "result": "Odoo.sh", "tone": "success", "detail": "Custom code with Git branches, staging copies of production and managed backups." },
    "onprem": { "result": "On-premise", "tone": "warning", "detail": "Plan for an IT team: OS patching, PostgreSQL, backups, monitoring, HTTPS and upgrades." }
  }
}
\`\`\`

For Northwind, the courier integration needs custom Python code, so **Odoo Online is ruled out**. Northwind has no IT team and no data-residency rule, so the recommendation is **Odoo.sh**.

## 4. Versions and the release cycle

- Odoo releases one **major version** a year, usually in the autumn (16.0, 17.0, 18.0 …).
- Odoo S.A. supports the **last three major versions**. Older versions get no bug or security fixes.
- Odoo Online also receives intermediate **SaaS versions** (for example saas-17.2) between major releases. These are not available on-premise.
- A database belongs to one version. Moving to a new major version is an **upgrade project** (upgrade.odoo.com for Enterprise), not a click.

> **Rule of thumb:** start new projects on the latest stable major version unless a required third-party module is not yet available for it.

\`\`\`visual-match
{
  "title": "Match the client to the hosting option",
  "prompt": "Match each client situation to the most suitable hosting option.",
  "leftLabel": "Client",
  "rightLabel": "Hosting",
  "pairs": [
    { "left": "A 6-person agency that wants CRM and Invoicing running this week", "right": "Odoo Online" },
    { "left": "Northwind: Enterprise apps plus a custom courier integration", "right": "Odoo.sh" },
    { "left": "A defence supplier whose data must stay in its own data centre", "right": "On-premise" },
    { "left": "A student who wants to read Odoo's source code on a laptop", "right": "Community on a local machine" }
  ],
  "explanation": "Custom code rules out Odoo Online; data-residency and Community rule out both Odoo-hosted options."
}
\`\`\`

\`\`\`visual-check
{
  "question": "A client on Odoo Online asks you to install a module they bought on the Odoo Apps Store. What do you tell them?",
  "options": [
    "Upload the module from the Apps menu",
    "Ask Odoo support to install it on the Online database",
    "Odoo Online runs only standard apps and Studio; the module needs Odoo.sh or on-premise",
    "Install it with Studio"
  ],
  "correct": 2,
  "explanation": "Odoo Online does not accept custom or third-party Python modules. The database must move to Odoo.sh or on-premise to use them."
}
\`\`\`

## Key takeaways

- Community is free (LGPL); Enterprise adds full Accounting, Studio and many apps, plus support and upgrades.
- Odoo Online = no custom code; Odoo.sh = Enterprise with custom code and branches; on-premise = full control and full responsibility.
- Odoo supports the last three major versions; a major version change is an upgrade project.
- Decide edition, hosting, version and database strategy before the first configuration workshop.`,
          flashcards: [
            { term: "Odoo Community", definition: "The free, open-source (LGPL v3) edition of Odoo. Runs on-premise only and lacks Enterprise apps such as full Accounting and Studio." },
            { term: "Odoo Enterprise", definition: "The paid edition with additional apps, the full Accounting app, Studio, support and access to Odoo's upgrade service." },
            { term: "Odoo Online", definition: "Odoo's SaaS hosting. Standard apps and Studio only; custom or third-party Python modules cannot be installed." },
            { term: "Odoo.sh", definition: "Odoo's cloud platform (PaaS) for Enterprise, with GitHub-based custom code and production, staging and development branches." },
            { term: "On-premise", definition: "Odoo installed on a server the client (or partner) manages, Community or Enterprise. Full control and full responsibility." },
            { term: "Major version", definition: "The yearly Odoo release (e.g. 17.0, 18.0). Odoo supports the last three; moving between them is an upgrade project." },
          ],
          resources: [
            { title: "Odoo editions compared", kind: "link", url: "https://www.odoo.com/page/editions" },
            { title: "Odoo 17 hosting documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration/hosting.html" },
          ],
        },
        {
          slug: "installing-odoo",
          title: "Installing Odoo: trial, Docker and server installation",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. Business context

A consultant needs three kinds of Odoo installation:

- a **trial on Odoo Online** for a quick demo to a prospect,
- a **local installation** (laptop or Docker) for learning and building prototypes,
- the **client's environment** (Odoo.sh or a server) for the real project.

This lesson shows how each one is created and which settings matter.

## 2. Option A: an Odoo Online trial

1. Go to odoo.com and choose **Start now / Try it free**.
2. Select the apps (for Northwind: CRM, Sales, Purchase, Inventory, Accounting).
3. Enter company name, email, country and language.
4. Odoo creates a database at *yourcompany.odoo.com* in about a minute.

Trials expire after a few weeks unless a subscription is attached. Use them for demos, never for client data you cannot lose.

## 3. Option B: Docker (fastest local setup)

Odoo publishes an official image on Docker Hub. Odoo needs a PostgreSQL server, so you run two containers:

\`\`\`bash
# 1. PostgreSQL
docker run -d --name db \\
  -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -e POSTGRES_DB=postgres \\
  postgres:15

# 2. Odoo 17 linked to it, published on port 8069
docker run -d --name odoo -p 8069:8069 --link db:db -t odoo:17
\`\`\`

Open **http://localhost:8069** and the database creation screen appears.

## 4. Option C: installing on a Linux server (from source)

This is how most on-premise and development installations are done on Ubuntu.

\`\`\`visual-steps
{
  "title": "Install Odoo 17 from source on Ubuntu",
  "steps": [
    { "title": "Install PostgreSQL", "body": "Install PostgreSQL 12 or later (sudo apt install postgresql), then create a database role for your Linux user that may create databases but is not a superuser: sudo -u postgres createuser -d -R -S $USER and createdb $USER", "result": "Odoo can connect to PostgreSQL without a password over the local socket." },
    { "title": "Get the code", "body": "git clone --branch 17.0 --single-branch https://github.com/odoo/odoo.git", "result": "The odoo folder with odoo-bin and the standard addons." },
    { "title": "Install Python dependencies", "body": "Odoo 17 needs Python 3.10 or later. Inside a virtual environment run pip install -r requirements.txt", "result": "All Python libraries Odoo needs." },
    { "title": "Install wkhtmltopdf", "body": "Install the patched-Qt build 0.12.6 from the wkhtmltopdf site.", "result": "PDF reports (quotations, invoices) print with headers and footers." },
    { "title": "Start Odoo", "body": "python3 odoo-bin --addons-path=addons -d northwind-dev", "result": "Odoo listens on port 8069 and creates the northwind-dev database on first start." }
  ]
}
\`\`\`

Odoo also publishes **packaged installers**: .deb packages (Debian 12, Ubuntu 22.04 or later) and .rpm packages (Fedora) for Linux, and a Windows installer. Packages are quicker, but source installs make it easier to run several versions side by side.

## 5. The configuration file (odoo.conf)

Command-line options can be stored in a configuration file, passed with \`-c /etc/odoo/odoo.conf\`. Consultants do not need to memorise every option, but must recognise these:

| Option | What it does | Northwind production value |
|---|---|---|
| admin_passwd | The **master password** that protects the database manager | A long random secret, stored in the password vault |
| db_host / db_port / db_user / db_password | How Odoo connects to PostgreSQL | Dedicated database server, user odoo |
| addons_path | Folders that contain modules (standard, Enterprise, custom) | /opt/odoo/addons,/opt/odoo/enterprise,/opt/odoo/custom |
| data_dir | Where the **filestore** (attachments) and sessions live | /var/lib/odoo |
| dbfilter | Which databases this server shows, by hostname or regex | ^northwind-prod$ |
| list_db | Shows or hides the database manager and selector | False in production |
| proxy_mode | Trust the reverse proxy's headers (Nginx with HTTPS) | True |
| workers | Number of worker processes; 0 = single-threaded development mode | About 2 × CPU cores + 1 |

> **Security tip:** In production set a strong \`admin_passwd\`, set \`list_db = False\`, put Odoo behind Nginx with HTTPS, and never expose PostgreSQL to the internet.

\`\`\`visual-dodont
{
  "title": "Server installation do's and don'ts",
  "do": [
    "Run Odoo as its own Linux user, never as root",
    "Put Odoo behind a reverse proxy (Nginx) with HTTPS and proxy_mode = True",
    "Use workers in production so long reports do not block other users",
    "Keep standard, Enterprise and custom addons in separate folders on the addons path",
    "Store the master password in a password vault"
  ],
  "dont": [
    "Leave the default or an empty master password",
    "Expose port 5432 (PostgreSQL) to the internet",
    "Edit files inside the standard addons folder",
    "Use workers = 0 in production",
    "Show the database manager (list_db) on a public production server"
  ]
}
\`\`\`

\`\`\`visual-order
{
  "title": "Bring up a local Odoo 17",
  "prompt": "Put the installation steps in order.",
  "items": [
    "Install PostgreSQL and create a database role",
    "Clone the Odoo 17.0 branch from GitHub",
    "Install the Python requirements in a virtual environment",
    "Install wkhtmltopdf for PDF reports",
    "Start odoo-bin with the addons path",
    "Open localhost:8069 and create the first database"
  ],
  "explanation": "PostgreSQL must exist before Odoo can connect; the code and its Python libraries come next; wkhtmltopdf is needed only for PDFs but should be installed before users print documents."
}
\`\`\`

\`\`\`visual-check
{
  "question": "Users at Northwind complain that the whole system freezes while the accountant prints a large ledger. The server runs with workers = 0. What is the most likely fix?",
  "options": [
    "Increase the PostgreSQL port number",
    "Configure multiple workers so requests are served in parallel",
    "Uninstall the Accounting app",
    "Set list_db = False"
  ],
  "correct": 1,
  "explanation": "workers = 0 runs Odoo in single-process (threaded) mode, meant for development. Production should use several worker processes so one heavy request does not block others."
}
\`\`\`

## Key takeaways

- Trials on Odoo Online are for demos; Docker is the fastest local setup; source installs give the most control.
- Odoo needs PostgreSQL, Python and wkhtmltopdf; it listens on port 8069 by default.
- The configuration file holds the master password, database connection, addons path, filestore location and workers.
- Production servers hide the database manager, use HTTPS through a reverse proxy and run with workers.`,
          flashcards: [
            { term: "odoo-bin", definition: "The command that starts the Odoo server from a source installation." },
            { term: "addons_path", definition: "Comma-separated list of folders where Odoo looks for modules: standard, Enterprise and custom addons." },
            { term: "Master password (admin_passwd)", definition: "The password that protects the database manager: creating, duplicating, backing up, restoring and deleting databases." },
            { term: "Filestore", definition: "The folder (inside data_dir) where Odoo stores attachments such as PDFs and images, outside PostgreSQL." },
            { term: "workers", definition: "Number of Odoo worker processes. 0 means single-process development mode; production uses several." },
            { term: "wkhtmltopdf", definition: "External tool Odoo uses to turn HTML reports into PDF documents." },
          ],
          resources: [
            { title: "Odoo 17 installation guide", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration/on_premise.html" },
            { title: "Odoo 17 deployment and configuration", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration/on_premise/deploy.html" },
          ],
        },
      ],
    },
    {
      title: "Module 2: Working with databases",
      lessons: [
        {
          slug: "creating-and-managing-databases",
          title: "The database manager: create, duplicate, back up, restore and delete",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. What an Odoo database is

One Odoo **database** holds one complete business: companies, users, installed apps, configuration, master data and every transaction. It consists of two parts that always travel together:

\`\`\`visual-layers
{
  "title": "What makes up one Odoo database",
  "layers": [
    { "title": "PostgreSQL database", "subtitle": "northwind-prod", "icon": "database", "items": ["Companies and users", "Installed apps and settings", "Customers, products, prices", "Orders, invoices, stock moves, journal entries"] },
    { "title": "Filestore", "subtitle": "data_dir/filestore/northwind-prod", "icon": "file", "items": ["Attachments and scanned bills", "Product images", "Generated PDFs"] }
  ],
  "connects": [ { "title": "Odoo server", "detail": "One server can serve many databases; dbfilter decides which ones it shows.", "icon": "server" } ]
}
\`\`\`

> **Interview point:** a backup made with PostgreSQL's pg_dump alone **misses the attachments**, because the filestore is outside PostgreSQL. Odoo's zip backup contains both.

One Odoo server can host many databases (for example *northwind-prod*, *northwind-staging* and *northwind-training*). Each database is completely separate: users, data and installed apps are not shared.

## 2. The database manager

On a self-hosted or local Odoo, the database manager is at **/web/database/manager** (for example http://localhost:8069/web/database/manager). Every action asks for the **master password** from the configuration file.

\`\`\`visual-mockup
{
  "title": "Create a database",
  "app": "Database manager",
  "breadcrumb": ["/web/database/manager", "Create Database"],
  "buttons": [ { "label": "Create database", "primary": true, "marker": 6 } ],
  "fields": [
    { "label": "Master Password", "value": "••••••••••••", "marker": 1 },
    { "label": "Database Name", "value": "northwind-training", "marker": 2 },
    { "label": "Email", "value": "admin@northwind.example", "marker": 3 },
    { "label": "Password", "value": "••••••••" },
    { "label": "Language / Country", "value": "English (IN) / India", "marker": 4 },
    { "label": "Demo data", "value": "☑ (training only)", "marker": 5 }
  ],
  "annotations": [
    { "marker": 1, "title": "Master password", "text": "The server's admin_passwd, not a user password." },
    { "marker": 2, "title": "Name", "text": "Lowercase letters, digits, hyphens and underscores. Use a naming convention such as client-environment." },
    { "marker": 3, "title": "Administrator login", "text": "The first user of the database. Use a real mailbox you control." },
    { "marker": 4, "title": "Language and country", "text": "Country decides the default currency and, with Accounting, the fiscal localization (chart of accounts and taxes)." },
    { "marker": 5, "title": "Demo data", "text": "Fills the database with sample customers, products and orders. Perfect for training, never for production." },
    { "marker": 6, "title": "Create", "text": "Odoo creates the PostgreSQL database, installs the base modules and logs you in." }
  ],
  "note": "On Odoo Online, databases are managed from odoo.com/my/databases instead; on Odoo.sh, from the project's branches."
}
\`\`\`

Next to each database the manager offers these actions:

| Action | What it does | Typical use |
|---|---|---|
| **Create** | New empty database (optionally with demo data) | A fresh training or prototype database |
| **Duplicate** | Copies the database *and* its filestore under a new name | Test a risky change on a copy of production |
| **Backup** | Downloads a zip (database + filestore) or a pg_dump file (database only) | Before upgrades, go-live, mass imports |
| **Restore** | Uploads a backup as a new database | Rebuild a test copy from a production backup |
| **Delete** | Drops the database and its filestore permanently | Remove old test copies |
| **Set Master Password** | Changes admin_passwd | After a team member leaves |

### "Moved" or "copied"?

When you restore a backup, Odoo asks whether the database was **moved** or **copied**:

- **Moved** keeps the database UUID: use it when the restored database *replaces* the original (server migration).
- **Copied** gives it a new UUID: use it for every test copy, so the copy is not treated as the same subscription and does not clash with production for in-app services.

\`\`\`visual-steps
{
  "title": "Back up and restore Northwind's database",
  "steps": [
    { "title": "Open the database manager", "path": "http://server:8069/web/database/manager", "result": "List of databases on the server." },
    { "title": "Back up northwind-prod", "body": "Click Backup, enter the master password, choose zip (includes filestore).", "result": "northwind-prod_2026-11-03.zip is downloaded." },
    { "title": "Restore as a neutralized copy", "body": "Click Restore Database, choose the zip, name it northwind-test, tick Neutralize and keep This database is a copy selected (the default).", "result": "A new database with a new UUID; emails, scheduled actions and payment providers are disabled on it (see next lesson)." },
    { "title": "Verify", "body": "Log in, open an attachment and a recent invoice PDF.", "result": "Data and attachments are present: the backup is usable." }
  ]
}
\`\`\`

> **Consultant tip:** a backup you have never restored is only a hope. Restore at least one backup before go-live to prove the process works.

## 3. Databases on Odoo Online and Odoo.sh

| Task | Odoo Online | Odoo.sh |
|---|---|---|
| Where | odoo.com/my/databases | The project's branches (Production, Staging, Development) |
| Duplicate for testing | Duplicate button with *For testing purposes* ticked (the default), which disables emails, payments and delivery orders. Duplicates expire after 15 days; at most five per database | Create a staging branch: it gets a neutralized copy of production |
| Backups | Automatic daily; **Download Backup** gives a zip | Automatic: 7 daily, 4 weekly and 3 monthly backups kept; manual backups and downloads |
| Restore | Not self-service: contact Odoo support | Restore any backup onto production or staging |

\`\`\`visual-check
{
  "question": "The Northwind accountant wants a copy of production to rehearse the year-end close. You restore last night's zip backup. Which option must you choose?",
  "options": [
    "This database was moved",
    "This database is a copy",
    "Either; the result is the same",
    "Neither; use pg_dump instead"
  ],
  "correct": 1,
  "explanation": "A rehearsal database lives next to production, so it must get a new UUID: choose 'copy'. 'Moved' is only for replacing the original, for example when changing servers."
}
\`\`\`

\`\`\`visual-match
{
  "title": "Database manager actions",
  "prompt": "Match each need to the database manager action.",
  "leftLabel": "Need",
  "rightLabel": "Action",
  "pairs": [
    { "left": "Try a risky configuration change on today's data", "right": "Duplicate" },
    { "left": "Keep a safety copy before importing 20,000 products", "right": "Backup" },
    { "left": "Rebuild a test database from Friday's backup", "right": "Restore" },
    { "left": "Remove last month's training copy", "right": "Delete" },
    { "left": "A consultant with server access has left the partner", "right": "Set Master Password" }
  ],
  "explanation": "Duplicate copies a live database; Backup and Restore work through a file; Delete is permanent; changing the master password locks out anyone who knew the old one."
}
\`\`\`

## Key takeaways

- A database = PostgreSQL data + filestore; a zip backup contains both.
- The database manager (/web/database/manager) creates, duplicates, backs up, restores and deletes databases, protected by the master password.
- Restore test databases as **copies**; use **moved** only when replacing the original.
- Demo data is for training databases only.`,
          flashcards: [
            { term: "Database manager", definition: "Odoo's web page at /web/database/manager for creating, duplicating, backing up, restoring and deleting databases." },
            { term: "Zip backup", definition: "An Odoo backup containing the PostgreSQL dump and the filestore, so attachments are included." },
            { term: "Database UUID", definition: "A unique identifier for a database used by subscriptions and Odoo services. A restored copy gets a new UUID." },
            { term: "Demo data", definition: "Sample records Odoo can load when creating a database; useful for training, never for production." },
            { term: "dbfilter", definition: "Server option that limits which databases are shown, often matched to the website's hostname." },
          ],
          resources: [
            { title: "Odoo Online database management", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration/odoo_online.html" },
            { title: "Odoo.sh: branches and backups", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration/odoo_sh/getting_started/branches.html" },
          ],
        },
        {
          slug: "environments-and-neutralization",
          title: "Environment strategy: production, staging, development and training",
          durationMin: 25,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. Business context

Two weeks before go-live, a consultant at another partner tested the invoice email template on a copy of production. The copy still had the outgoing mail server configured, so **340 real customers received a test invoice**. The client's finance director spent a day apologising.

This lesson is about never letting that happen.

## 2. One database per purpose

\`\`\`visual-cards
{
  "label": "Environments",
  "title": "Northwind's four databases",
  "columns": 4,
  "cards": [
    { "icon": "shield", "title": "northwind-prod", "body": "Real business. Only tested changes, applied in a planned window. Daily backups.", "tone": "danger" },
    { "icon": "refresh", "title": "northwind-staging", "body": "Recent neutralized copy of production. Final testing, UAT and go-live rehearsals.", "tone": "warning" },
    { "icon": "code", "title": "northwind-dev", "body": "Developers and consultants build and break things. Small realistic data set.", "tone": "info" },
    { "icon": "graduation", "title": "northwind-training", "body": "End-user training with demo or anonymised data. Reset before every session." }
  ]
}
\`\`\`

Changes always travel in one direction: **dev → staging → production**. Data travels the other way: production is copied *down* to staging so tests use realistic data.

\`\`\`visual-flow
{
  "title": "How a change reaches production",
  "steps": [
    { "title": "Build", "icon": "code", "app": "Dev", "detail": "Configure or develop the change on northwind-dev." },
    { "title": "Refresh staging", "icon": "refresh", "app": "Staging", "detail": "Copy production to staging and neutralize it." },
    { "title": "Test and UAT", "icon": "check", "app": "Staging", "detail": "Key users test with real data.", "branch": { "when": "Defect found", "result": "Back to Dev", "tone": "danger" } },
    { "title": "Back up production", "icon": "database", "app": "Prod", "detail": "Fresh backup before the change window." },
    { "title": "Deploy", "icon": "rocket", "app": "Prod", "detail": "Apply the change in the agreed window, then smoke test." }
  ]
}
\`\`\`

## 3. Neutralization

A copy of production contains real email addresses, live mail servers, payment provider keys, bank synchronisation and scheduled actions (for example automatic follow-up emails). **Neutralizing** a database switches all of that off so the copy is safe to play with.

| Neutralization disables | Why it matters |
|---|---|
| Outgoing and incoming mail servers | No test email reaches a real customer or vendor |
| Scheduled actions (crons) | No automatic reminders, follow-ups or recurring invoices run |
| Payment providers (set to test or disabled) | No real card is charged |
| Bank synchronisation and other external connections | No duplicate bank statements, no calls to live APIs |
| Shows a "neutralized database" banner | Users can see they are not in production |

How to neutralize:

- **Odoo.sh:** staging branches automatically receive *neutralized* duplicates of production: scheduled actions are disabled, outgoing emails are caught by a mail catcher, IAP services are disabled and payment and shipping providers are put in test mode. Development branches never get production data; they use demo data.
- **On-premise:** tick **Neutralize** when you duplicate or restore in the database manager (Odoo 17), or run \`odoo-bin neutralize -d northwind-staging\` on a copy you restored another way.
- **Odoo Online:** keep **For testing purposes** ticked when you click Duplicate (it is the default). It disables emails, payments and delivery orders on the copy, which expires after 15 days.

> **Consultant rule:** after restoring any production copy, neutralize it *before* anyone logs in, and check the banner.

\`\`\`visual-dodont
{
  "title": "Working with environments",
  "do": [
    "Use a naming convention: client-prod, client-staging, client-dev, client-training",
    "Neutralize every copy of production before use",
    "Refresh staging from production before UAT and before go-live rehearsals",
    "Back up production before every change window",
    "Limit production administrator rights to two or three named people"
  ],
  "dont": [
    "Test new configuration directly in production",
    "Let users train in the production database",
    "Copy test data up from staging to production",
    "Leave old copies of production lying around with real personal data",
    "Share the master password by email or chat"
  ]
}
\`\`\`

\`\`\`visual-check
{
  "question": "You restored northwind-prod as northwind-staging on an on-premise server. What must happen before key users start UAT?",
  "options": [
    "Nothing; a restored copy is safe by default",
    "Neutralize it so mail servers, crons and payment providers are disabled",
    "Uninstall the Accounting app on the copy",
    "Set list_db = True"
  ],
  "correct": 1,
  "explanation": "On-premise, a restored copy keeps the live mail servers, scheduled actions and payment providers. Run the neutralize command before anyone tests."
}
\`\`\`

\`\`\`visual-order
{
  "title": "Refresh staging safely",
  "prompt": "Put the staging refresh in order.",
  "items": [
    "Back up production as a zip",
    "Delete the old staging database",
    "Restore the backup as northwind-staging, choosing This database is a copy",
    "Neutralize northwind-staging",
    "Check the neutralized banner and the mail server settings",
    "Invite key users to test"
  ],
  "explanation": "Neutralization must happen before users log in. The banner and an empty or disabled mail server confirm the copy is safe."
}
\`\`\`

## Key takeaways

- Keep separate production, staging, development and training databases.
- Changes move dev → staging → prod; data is copied prod → staging.
- Neutralize every copy of production: no emails, crons, payments or bank sync.
- Back up production before every change window.`,
          flashcards: [
            { term: "Production database", definition: "The live database the business runs on. Only tested changes are applied, in a planned window." },
            { term: "Staging database", definition: "A recent, neutralized copy of production used for final testing, UAT and rehearsals." },
            { term: "Neutralization", definition: "Disabling mail servers, scheduled actions, payment providers and external connections on a database copy so it cannot affect real customers." },
            { term: "Scheduled action (cron)", definition: "A job Odoo runs automatically on a schedule, such as sending follow-ups or generating recurring invoices." },
          ],
          resources: [{ title: "Odoo.sh: staging branches", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration/odoo_sh/getting_started/branches.html" }],
        },
      ],
    },
    {
      title: "Module 3: Apps and first-time setup",
      lessons: [
        {
          slug: "installing-and-managing-apps",
          title: "Installing, upgrading and uninstalling apps",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 1. Apps and modules

Everything in Odoo is a **module**: a folder of Python, XML and data files. An **app** is a module flagged as a main application (Sales, Inventory, Accounting …) that gets its own icon on the home screen. Many modules are technical building blocks or **bridges** between apps (for example *sale_stock* links Sales and Inventory).

\`\`\`visual-hub
{
  "title": "What gets installed with Sales",
  "caption": "Installing one app installs every module it depends on.",
  "center": { "label": "Sales (sale_management)", "icon": "cart" },
  "nodes": [
    { "label": "Contacts", "icon": "users", "detail": "Customers (res.partner)." },
    { "label": "Product", "icon": "package", "detail": "Products, variants and units of measure." },
    { "label": "Invoicing", "icon": "invoice", "detail": "Sales depends on the account module, so Invoicing is installed too." },
    { "label": "Discuss", "icon": "mail", "detail": "Chatter, followers and activities on every order." },
    { "label": "Sales Teams", "icon": "target", "detail": "Shared with CRM." }
  ]
}
\`\`\`

## 2. Installing an app

1. Open the **Apps** menu.
2. Search for the app (the *Apps* filter shows main apps; remove it to see all modules).
3. Click **Activate** (Install in older versions).
4. Odoo installs the app **and all its dependencies**, then reloads.

Some features are installed from **Settings** instead: ticking *Lots & Serial Numbers* in Inventory settings installs the matching module. That is why consultants document settings as carefully as apps.

### Developer mode

Many technical menus are hidden until **developer mode** is on: *Settings ▸ Activate the developer mode* (at the bottom of the page), or add \`?debug=1\` to the URL. In developer mode the Apps menu shows:

- **Update Apps List** — rescans the addons path so newly copied custom modules appear.
- **Upgrade** on an installed module — reloads its data and views after the code changed.
- Technical module names (for example *sale_management*), useful in documentation and support tickets.

## 3. Uninstalling: handle with care

Uninstalling an app **removes its models and data** — orders, records, settings — together with every module that depends on it. Odoo lists those modules before you confirm. There is no undo except restoring a backup.

\`\`\`visual-dodont
{
  "title": "Apps do's and don'ts",
  "do": [
    "Install only the apps in the agreed scope",
    "Check which dependencies an app brings with it",
    "Record installed apps and enabled settings in the configuration workbook",
    "Try any uninstall on a duplicate first",
    "Back up before installing or upgrading custom modules in production"
  ],
  "dont": [
    "Install apps 'just to look' in production",
    "Uninstall an app to hide a menu (use access rights instead)",
    "Install Apps Store modules without checking version, licence and maintainer",
    "Upgrade custom modules in production without testing on staging"
  ]
}
\`\`\`

## 4. Pricing and licences

- **Odoo Online / Odoo.sh / Enterprise:** pricing is per user and depends on the plan; the *One App Free* plan lets a company use a single app free with unlimited users. Prices change, so always check odoo.com/pricing.
- **Community:** all Community apps are free; Enterprise-only apps are simply not available.
- **Apps Store modules:** third-party modules have their own price and licence (LGPL, OPL, proprietary). They need Odoo.sh or on-premise.

\`\`\`visual-decision
{
  "title": "A user asks you to remove the Website app",
  "start": "data",
  "nodes": {
    "data": { "question": "Has anyone created pages, products for the shop or website orders?", "options": [ { "label": "Yes", "next": "hide" }, { "label": "No, it was installed by mistake", "next": "copy" } ] },
    "hide": { "result": "Do not uninstall", "tone": "danger", "detail": "Uninstalling deletes that data. Hide the menu with access rights instead." },
    "copy": { "question": "Have you tried the uninstall on a duplicate and reviewed the dependent modules?", "options": [ { "label": "Yes, nothing else is affected", "next": "ok" }, { "label": "Not yet", "next": "test" } ] },
    "ok": { "result": "Back up, then uninstall in a quiet window", "tone": "success" },
    "test": { "result": "Duplicate the database and test the uninstall first", "tone": "warning" }
  }
}
\`\`\`

\`\`\`visual-check
{
  "question": "A developer copied a new custom module into the custom addons folder on the server, but it does not appear in the Apps menu. What is missing?",
  "options": [
    "Restart PostgreSQL",
    "Activate developer mode and click Update Apps List (the folder must also be on the addons path)",
    "Uninstall and reinstall Sales",
    "Create a new database"
  ],
  "correct": 1,
  "explanation": "Odoo only lists modules it has scanned. Update Apps List rescans the addons path; if the folder is not on the addons path, Odoo never sees the module."
}
\`\`\`

## Key takeaways

- Every app is a module; installing an app installs its dependencies.
- Some features are installed from Settings checkboxes.
- Developer mode unlocks Update Apps List, module upgrades and technical names.
- Uninstalling deletes data: test on a duplicate and back up first.`,
          flashcards: [
            { term: "Module", definition: "A package of Python, XML and data files that adds or changes Odoo features. Apps are modules flagged as main applications." },
            { term: "Dependency", definition: "A module another module requires. Odoo installs dependencies automatically and uninstalls dependents together." },
            { term: "Developer mode", definition: "A mode (Settings or ?debug=1) that shows technical menus such as Update Apps List and module upgrades." },
            { term: "Update Apps List", definition: "Developer-mode action that rescans the addons path so new modules appear in the Apps menu." },
            { term: "Bridge module", definition: "A module that connects two apps, such as sale_stock linking Sales and Inventory." },
          ],
          resources: [{ title: "Odoo 17: apps and modules", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/general/apps_modules.html" }],
        },
        {
          slug: "first-time-setup",
          title: "First-time setup of a new database",
          durationMin: 25,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 1. Business context

Northwind's new database is running with CRM, Sales, Purchase, Inventory and Accounting installed. Before any app-specific configuration, a consultant completes the **foundation settings**. Every later document (quotations, invoices, delivery slips) depends on them.

## 2. The foundation checklist

\`\`\`visual-steps
{
  "title": "First-time setup for Northwind",
  "steps": [
    { "title": "Company details", "path": "Settings ▸ Companies ▸ Update Info", "body": "Legal name, address, GSTIN / tax ID, phone, email, website and logo.", "result": "Correct header on every document and correct tax registration." },
    { "title": "Document layout", "path": "Settings ▸ Companies ▸ Configure Document Layout", "body": "Layout, colours, font, footer with bank details.", "result": "Branded quotations, invoices and delivery slips." },
    { "title": "Languages", "path": "Settings ▸ Languages ▸ Add Languages", "body": "Add Hindi if some customers need translated documents.", "result": "Users and partners can have their own language." },
    { "title": "Currencies", "path": "Accounting ▸ Configuration ▸ Settings ▸ Currencies", "body": "Company currency INR; activate USD for imports and enable automatic rate updates if needed.", "result": "Foreign-currency purchases are possible." },
    { "title": "Fiscal localization", "path": "Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization", "body": "Check that the Indian package (chart of accounts and GST taxes) was installed from the company country.", "result": "Chart of accounts and taxes are ready." },
    { "title": "Users and access rights", "path": "Settings ▸ Users & Companies ▸ Users", "body": "Invite users and give each one the access rights for their role (for example Sales: User, Inventory: Administrator).", "result": "Each person sees only what their role needs." },
    { "title": "Outgoing email", "path": "Settings ▸ General Settings ▸ Discuss / Emails", "body": "Configure the mail server or the domain alias, and test it in production only.", "result": "Quotations and invoices can be emailed." }
  ]
}
\`\`\`

> **Consultant tip:** set the company **country before installing Accounting**. The country decides which fiscal localization package (chart of accounts, taxes, reports) Odoo installs.

## 3. Multi-company in one database

If the client has several legal entities, they usually live in **one database with several companies** (Settings ▸ Users & Companies ▸ Companies). Users switch companies from the top bar, and records can be shared or kept separate per company. Separate databases are used only when entities must never share data — consolidation and inter-company transactions then become integrations.

\`\`\`visual-check
{
  "question": "Northwind's country was left as United States when the database was created, and Accounting was then installed. What is the risk?",
  "options": [
    "None; the country only changes the flag icon",
    "The US chart of accounts and taxes were installed instead of India's GST setup",
    "Users cannot log in",
    "The database cannot be backed up"
  ],
  "correct": 1,
  "explanation": "The company country drives the fiscal localization. Fix the country first, then install or switch the fiscal localization before any accounting entries exist."
}
\`\`\`

\`\`\`visual-order
{
  "title": "Foundation before apps",
  "prompt": "Put the setup tasks in a sensible order.",
  "items": [
    "Create the database with the correct country and language",
    "Fill in company details and logo",
    "Install the apps in scope",
    "Check the fiscal localization and currencies",
    "Configure the document layout",
    "Invite users with the right access rights"
  ],
  "explanation": "Country first (it drives localization), then company data, apps and their accounting foundation. Users come last, when the database is ready for them."
}
\`\`\`

## Key takeaways

- Company details, document layout, languages, currencies, fiscal localization, users and email come before app configuration.
- The company country drives the fiscal localization: set it before installing Accounting.
- Several legal entities usually share one database with multiple companies.`,
          flashcards: [
            { term: "Fiscal localization", definition: "A country package (chart of accounts, taxes, reports) Odoo installs with Accounting based on the company's country." },
            { term: "Document layout", definition: "Company setting that controls the look of printed and emailed documents: layout, colours, logo and footer." },
            { term: "Multi-company", definition: "Several companies in one database; users switch between them and records can be shared or separated." },
          ],
          resources: [
            { title: "Odoo 17: companies", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/general/companies.html" },
            { title: "Odoo 17: users and access rights", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/general/users.html" },
          ],
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-setup-databases-final",
    title: "Odoo Setup, Databases & Apps – Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which hosting option cannot run custom Python modules?",
        kind: "single",
        options: ["Odoo Online", "Odoo.sh", "On-premise Enterprise", "On-premise Community"],
        correct: [0],
        explanation: "Odoo Online runs standard apps and Studio only. Custom and third-party modules need Odoo.sh or on-premise.",
      },
      {
        prompt: "Odoo Community includes the full Accounting app with bank synchronisation.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Community includes Invoicing. The full Accounting app is Enterprise.",
      },
      {
        prompt: "Which two parts make up a complete Odoo database backup?",
        kind: "multiple",
        options: ["The PostgreSQL database", "The filestore", "The addons path", "The odoo.conf file"],
        correct: [0, 1],
        explanation: "Data lives in PostgreSQL and attachments in the filestore. The zip backup contains both; code and configuration are backed up separately.",
      },
      {
        prompt: "Where is the database manager of a self-hosted Odoo?",
        kind: "single",
        options: ["/web/database/manager", "/odoo/settings", "/web/login?db=manager", "Settings ▸ Technical ▸ Databases"],
        correct: [0],
        explanation: "The database manager is at /web/database/manager and is protected by the master password.",
      },
      {
        prompt: "You restore a production backup to create a test database next to production. Which option do you choose?",
        kind: "single",
        options: ["This database was moved", "This database is a copy", "Restore with demo data", "Restore without filestore"],
        correct: [1],
        explanation: "A copy gets a new UUID so it is not confused with production. 'Moved' is for replacing the original.",
      },
      {
        prompt: "Which items does neutralizing a database disable?",
        kind: "multiple",
        options: ["Mail servers", "Scheduled actions", "Payment providers", "User logins"],
        correct: [0, 1, 2],
        explanation: "Neutralization stops emails, crons, payments and external connections. Users can still log in to test.",
      },
      {
        prompt: "Which server option hides the database manager on a production server?",
        kind: "single",
        options: ["list_db = False", "workers = 0", "proxy_mode = True", "data_dir = /var/lib/odoo"],
        correct: [0],
        explanation: "list_db = False hides the database selector and manager.",
      },
      {
        prompt: "Installing the Sales app also installs Invoicing.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "Sales depends on the account module, so Odoo installs Invoicing as a dependency.",
      },
      {
        prompt: "A new custom module was copied to the server but is not visible in Apps. What should you do?",
        kind: "single",
        options: [
          "Activate developer mode and click Update Apps List",
          "Restore yesterday's backup",
          "Neutralize the database",
          "Create the module again in Studio",
        ],
        correct: [0],
        explanation: "Update Apps List rescans the addons path. The module folder must be on the addons path.",
      },
      {
        prompt: "What happens to an app's data when you uninstall it?",
        kind: "single",
        options: ["It is archived and can be restored", "It is deleted with the app's models", "It moves to another app", "Nothing; only the menu disappears"],
        correct: [1],
        explanation: "Uninstalling removes the app's models and data, and dependent modules. Only a backup can bring them back.",
      },
      {
        prompt: "Why should the company country be set before installing Accounting?",
        kind: "single",
        options: [
          "It decides the fiscal localization (chart of accounts and taxes)",
          "It decides the user interface theme",
          "It is needed to create users",
          "It changes the database name",
        ],
        correct: [0],
        explanation: "Odoo installs the fiscal localization package that matches the company country.",
      },
      {
        prompt: "In which direction do changes and data travel between environments?",
        kind: "single",
        options: [
          "Changes dev → staging → prod; data prod → staging",
          "Changes prod → dev; data dev → prod",
          "Both directly in production",
          "Changes staging → dev; data staging → prod",
        ],
        correct: [0],
        explanation: "Changes are promoted upward after testing; production data is copied down (and neutralized) for realistic tests.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-setup-databases-assignment-1",
      title: "Set up Northwind's training environment",
      instructions: `## Scenario

Northwind Office Supplies Pvt Ltd has chosen Odoo Enterprise on Odoo.sh for production. Before the first workshop you need a local training environment and a written environment strategy.

## Tasks

1. Install Odoo 17 locally (Docker or from source) and open the database manager.
2. Create **northwind-training** with demo data, country India and language English.
3. Create **northwind-dev** *without* demo data.
4. Install CRM, Sales, Purchase, Inventory and Invoicing (or Accounting) in northwind-dev. Record which other modules were installed as dependencies.
5. Complete the first-time setup in northwind-dev: company details, logo, document layout, currencies and three users with different access rights.
6. Back up northwind-dev as a zip, restore it as **northwind-dev-copy** (as a copy) and neutralize it. Take a screenshot of the neutralized banner.
7. Write a one-page **environment strategy** for Northwind: databases, purpose of each, who has admin rights, how changes are promoted and how often staging is refreshed.

## Deliverables

- Screenshots for tasks 2, 4, 5 and 6
- The list of dependency modules from task 4
- The environment strategy (PDF or document)

## Evaluation criteria

- Databases named and created correctly, demo data only where intended (20%)
- Apps and dependencies correctly identified (20%)
- Foundation settings complete and correct (20%)
- Backup restored as a copy and neutralized (20%)
- Environment strategy is clear, safe and realistic (20%)`,
    },
  ],
};
