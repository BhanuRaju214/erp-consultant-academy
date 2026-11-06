# Setting up Odoo the right way — editions, hosting, databases and apps

nexusEPM Consultant Podcast · about 10 minutes

- **Priya**: Host, nexusEPM Academy
- **Arjun**: Odoo functional consultant

Audio file: public/podcasts/odoo-setup-databases.mp3. Voices: en-IN-NeerjaNeural (Priya), en-IN-PrabhatNeural (Arjun).

## Transcript

### Welcome

**Priya:** Welcome to the nexusEPM Consultant Podcast. I'm Priya, and today we're going one step before any business process: setting up Odoo itself. Editions, hosting, databases and apps. With me again is Arjun, an Odoo functional consultant. Arjun, welcome back.

**Arjun:** Thanks, Priya. This is the topic nobody puts on the slides, and the one that causes the most expensive mistakes.

**Priya:** Why expensive?

**Arjun:** Because the setup decisions are made in week one and lived with for years. Choose the wrong hosting option and you migrate later. Test in production and you email real customers. Uninstall the wrong app and its data is gone.

### Community or Enterprise

**Priya:** Let's start with editions. Community and Enterprise. What's the real difference?

**Arjun:** Odoo is open core. Community is free, under the L G P L licence, and it already has CRM, Sales, Purchase, Inventory, Manufacturing and Website. Enterprise is paid per user, and it adds the full Accounting app, with bank synchronisation and reconciliation, where Community only has Invoicing. It also adds Studio, Sign, Planning, Quality, the mobile experience, support from Odoo, and the upgrade service.

**Priya:** So when would you recommend Community?

**Arjun:** For a small company with its own technical people and simple accounting needs. The moment they need full accounting, Studio, or official upgrades, Enterprise is usually cheaper than building those things yourself.

### Online, Odoo.sh or on-premise

**Priya:** Then hosting. There are three options, right?

**Arjun:** Right. Odoo Online is software as a service. Odoo runs everything, you start in minutes, upgrades and backups are automatic. The catch is that you can only use standard apps and Studio. No custom Python modules, and no modules from the Apps Store.

**Priya:** And Odoo dot S H?

**Arjun:** That's Odoo's cloud platform for Enterprise with your own code. Your custom modules live in GitHub, and every project has production, staging and development branches. Staging automatically gets a safe copy of production for testing.

**Priya:** And on-premise is the client's own server.

**Arjun:** Yes, Community or Enterprise. Full control, but also full responsibility: security patches, PostgreSQL, backups, monitoring, HTTPS, upgrades. If the client has no IT team, I think twice.

**Priya:** What did you recommend for Northwind, our training company?

**Arjun:** Northwind needs a custom integration with a courier's A P I. That's custom Python code, so Odoo Online was out. They have no IT team and no data residency rule, so Odoo dot S H.

### Installing Odoo

**Priya:** For trainees who want Odoo on their own laptop, what's the easiest path?

**Arjun:** Docker. Two containers: one for PostgreSQL, one for Odoo, and you open localhost, port eight zero six nine. If you want to understand what's under the hood, install from source: PostgreSQL, the Odoo code from GitHub, the Python requirements, and wkhtmltopdf for PDF reports.

**Priya:** And the configuration file. Which settings should a functional consultant recognise?

**Arjun:** Four or five. The admin password, which is really the master password for the database manager. The addons path, which lists where modules live. The data directory, where the filestore is. List D B, which you set to false in production to hide the database manager. And workers. Production should never run with workers set to zero, or one big report freezes everyone.

### Databases and backups

**Priya:** Let's talk databases. What exactly is an Odoo database?

**Arjun:** One complete business. Companies, users, installed apps, settings, master data, every transaction. Technically it's two things: a PostgreSQL database, and the filestore, a folder with all the attachments.

**Priya:** Which is why a database dump alone isn't a backup.

**Arjun:** Exactly. If you only dump PostgreSQL, you lose every scanned bill and product image. The zip backup from Odoo's database manager contains both.

**Priya:** Walk us through the database manager.

**Arjun:** On a self-hosted Odoo it's at slash web slash database slash manager. You can create, duplicate, back up, restore and delete databases, and every action asks for the master password. When you create one, the country matters a lot, because it decides the chart of accounts and taxes once Accounting is installed. And demo data is for training databases only.

**Priya:** There's a question when you restore. Moved or copied?

**Arjun:** My favourite trap. Moved keeps the database's identity, so use it only when the restored database replaces the original, like moving to a new server. For anything that lives next to production, a test copy, a rehearsal, choose copy. It gets a new identity and isn't confused with production.

### Environments and neutralization

**Priya:** You keep saying production, staging. How many databases does a project need?

**Arjun:** Usually four. Development, where we build and break things. Staging, a recent copy of production for user acceptance testing and rehearsals. Production, the real business. And training, so end users never practise in production. Changes move up, from development to staging to production. Data moves down, from production to staging.

**Priya:** And copies of production are dangerous.

**Arjun:** Very. A copy still has the live mail server, payment keys and scheduled jobs. I know a project where three hundred and forty customers received a test invoice from a copy. So we neutralize every copy. Neutralizing disables mail servers, stops scheduled actions, puts payment providers into test mode and cuts bank synchronisation. Odoo dot S H does it automatically for staging. On-premise, you run the neutralize command before anyone logs in.

### Apps

**Priya:** Last big topic: apps.

**Arjun:** Everything in Odoo is a module. An app is just a main module with an icon on the home screen. You open the Apps menu, search, click Activate, and Odoo installs the app plus everything it depends on. Install Sales and you also get Contacts, Product, Invoicing and Discuss.

**Priya:** And some features come from Settings.

**Arjun:** Right. Tick lots and serial numbers in Inventory settings, and a module gets installed. That's why we document settings as carefully as apps. And developer mode shows Update Apps List, for newly added custom modules, and the Upgrade button, for modules whose code has changed.

**Priya:** What about uninstalling?

**Arjun:** That's the dangerous direction. Uninstalling removes the app's data and every module that depends on it. No undo, except a backup. If a user just shouldn't see a menu, use access rights. Never uninstall to hide something.

### First-time setup and wrap-up

**Priya:** Once the apps are in, what does a consultant do first?

**Arjun:** The foundation. Company details and logo, document layout, languages, currencies, check the fiscal localization, then users with the right access rights, and outgoing email, in production only.

**Priya:** Give our listeners three things to remember.

**Arjun:** One, decide edition, hosting, version and databases before the first workshop. Two, a database is PostgreSQL plus the filestore: back it up as a zip, restore test copies as copies, and neutralize them. Three, install apps with their dependencies in mind, and remember that uninstalling deletes data.

**Priya:** Arjun, thank you. And to everyone listening: open the course in the portal, try the exercises, and set up your own Northwind training database. See you next time on the nexusEPM Consultant Podcast.
