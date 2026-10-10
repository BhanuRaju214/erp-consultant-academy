import type { CourseContent } from "../types";

/**
 * Testing & Quality Assurance for ERP (Odoo) implementations.
 * All company names, people, products and amounts are fictional.
 */
export const testingQa: CourseContent = {
  slug: "testing-qa",
  section: "testing",
  title: "Testing & Quality Assurance for ERP Projects",
  summary:
    "Plan, write and execute ERP tests the way real implementation teams do: business scenario test cases, integration and migration testing, UAT, regression, security, reconciliation, negative testing and defect management, with worked Odoo examples.",
  level: "intermediate",
  platform: "generic",
  odooVersion: "Version-independent (examples use Odoo 17.0)",
  position: 1,
  skills: [
    "Test planning and entry/exit criteria",
    "Business scenario test case writing",
    "Functional and integration testing",
    "Data migration validation and reconciliation",
    "UAT planning and sign-off",
    "Regression and automated testing",
    "Role-based access testing",
    "Negative and exception testing",
    "Defect management and test reporting",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1 — Testing Foundations",
      lessons: [
        {
          slug: "erp-testing-fundamentals",
          title: "Testing Fundamentals in ERP Projects",
          durationMin: 35,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Why testing matters more in ERP than in most software

An ERP system is not a single application — it is a chain of connected business processes. A sales order reserves stock, a delivery reduces inventory and (with automated valuation) posts a journal entry, an invoice creates a receivable, and a payment clears it. A mistake at one step silently travels to the next. A wrong tax on a product does not just show a wrong number on screen; it produces wrong invoices, wrong tax returns and wrong financial statements.

That is why ERP testing is different from testing a website or a mobile app:

| Typical software testing | ERP testing |
|---|---|
| Focus on screens and features | Focus on **end-to-end business processes** (Order to Cash, Procure to Pay) |
| Mostly done by QA engineers | Done by consultants, **key users** and finance staff together |
| Pass = the feature works | Pass = the feature works **and the accounting/stock result is correct** |
| Data is synthetic | Uses **migrated real-world master data** (fictional in training) |
| Few integrations | Many: banks, e-commerce, payroll, EDI, BI tools |
| Users are generic | Users have **roles**, approval limits and company restrictions |

A consultant who only clicks "Confirm" and sees no error has not tested anything. The real question is: *did the business outcome happen correctly?* — right quantity moved, right account debited, right person allowed or blocked.

## The test levels in an ERP project

| Level | What is tested | Who tests | When |
|---|---|---|---|
| Unit testing | A single configuration or custom function (e.g. a computed field) | Developer / consultant | During build |
| Functional testing | One process step in one app (e.g. create and confirm a quotation) | Functional consultant | After configuration of each app |
| Integration testing | End-to-end flows across apps and external systems (Sales → Inventory → Accounting) | Consultant team | After all apps are configured |
| Data migration testing | Completeness and accuracy of loaded legacy data | Consultant + data owner | After each trial load |
| User Acceptance Testing (UAT) | The business confirms the system supports its processes | Key users | Before go-live |
| Regression testing | Existing processes still work after a change | Consultant / automated tests | After every change, upgrade or fix |
| Performance testing | Response times with realistic volumes | Technical team | Before go-live (large projects) |

Security (role-based access) testing and reconciliation testing run across several of these levels.

## Entry and exit criteria

Testing phases should not start just because a date arrived. Each phase has **entry criteria** (conditions to start) and **exit criteria** (conditions to finish).

### Example: integration testing (SIT)

| Entry criteria | Exit criteria |
|---|---|
| All in-scope apps configured in the test database | 100% of planned test cases executed |
| Master data loaded (at least a trial load) | 95%+ test cases passed |
| Test cases reviewed and approved | No open Critical or High severity defects |
| Test users with correct access rights created | Medium defects have an agreed workaround/plan |
| Defect log ready | Test summary report signed off by project manager |

### Example: UAT

| Entry criteria | Exit criteria |
|---|---|
| SIT exit criteria met | All UAT scripts executed by key users |
| UAT database refreshed with migrated data | All Critical/High defects fixed and retested |
| Key users trained | Reconciliations of migrated balances agreed by finance |
| UAT scripts handed over | UAT sign-off form signed by process owners |

## Test environments

Never test on production. A typical Odoo project uses:

- **Development** — where developers build custom modules.
- **Test / Staging** — a copy used for SIT and UAT. On Odoo.sh this is a staging branch; on-premise it is a separate database (verify for your hosting option).
- **Production** — the live database.

Keep a note of which database and which build/version each test was executed on. A defect is meaningless if nobody knows where it was found.

## The testing lifecycle in a project

1. **Plan** — scope, levels, environments, entry/exit criteria, roles, schedule.
2. **Design** — write test cases linked to requirements (traceability).
3. **Prepare** — test data, test users, environment refresh.
4. **Execute** — run test cases, record actual results and evidence (screenshots, document numbers).
5. **Report defects** — log, prioritise, fix, retest.
6. **Close** — test summary report and sign-off.

## Example: what "tested" really means

Scenario: *Sell 10 units of a stock product to a customer.*

A weak tester checks: quotation confirmed, delivery validated, invoice posted.

A strong tester also checks:

- On-hand quantity of the product decreased by exactly 10 in the right warehouse/location.
- The invoice shows the correct price from the customer's pricelist and the correct tax.
- The journal entry debits the receivable account and credits income and tax payable.
- If automated stock valuation is used, the stock output/COGS entries were created with the correct cost (verify for your edition/configuration).
- The customer's due amount and the aged receivable report show the invoice.

## Key takeaways

- ERP testing validates **business outcomes**, not just screens.
- Use multiple test levels: unit, functional, integration, migration, UAT, regression.
- Define **entry and exit criteria** so phases start and finish on facts, not dates.
- Always test in a non-production environment and record where and on which version you tested.
- Every transaction test should verify **quantity, value and accounting** impact.
`,
          flashcards: [
            { term: "SIT", definition: "System Integration Testing — testing end-to-end flows across apps and external systems." },
            { term: "UAT", definition: "User Acceptance Testing — key users confirm the system supports their business processes before go-live." },
            { term: "Entry criteria", definition: "Conditions that must be met before a test phase can start (e.g. configuration complete, test data loaded)." },
            { term: "Exit criteria", definition: "Conditions that must be met to close a test phase (e.g. all cases executed, no open Critical defects)." },
            { term: "Regression testing", definition: "Re-testing existing processes after a change, fix or upgrade to make sure nothing broke." },
            { term: "Test case", definition: "A documented scenario with preconditions, data, steps and an expected result that can be executed and marked Pass/Fail." },
            { term: "Traceability", definition: "Linking each test case to the requirement it proves, so every requirement is covered." },
            { term: "Staging environment", definition: "A non-production copy of the system used for testing changes safely." },
          ],
        },
        {
          slug: "writing-business-scenario-test-cases",
          title: "Writing Business Scenario Test Cases",
          durationMin: 45,
          odooVersions: "Odoo 17.0 (concepts version-independent)",
          scope: ["standard", "configuration"],
          body: `## Business context

A test case is a contract between the consultant and the business: *"If you do these steps with this data, the system will produce this result."* Good test cases are written in business language, can be executed by someone who did not write them, and leave no doubt whether they passed.

## The standard test case template

| Field | Purpose | Example |
|---|---|---|
| Test Case ID | Unique reference | TC-O2C-001 |
| Requirement ID | Link to the requirement (traceability) | REQ-SAL-004 |
| Module | Odoo app(s) involved | Sales, Inventory, Accounting |
| Scenario | One-line business description | Sell stock item with customer pricelist |
| Preconditions | What must exist before starting | Customer, product, stock, pricelist configured |
| Test Data | Exact records and values | Customer "Blue Harbor Traders", product "LED Panel 40W" |
| Steps | Numbered actions | 1. Open Sales... |
| Expected Result | Precise, measurable outcome | Invoice total 1,150.00 incl. 15% tax |
| Actual Result | What really happened (filled during execution) | As expected; INV/2024/00012 |
| Status | Not Run / Pass / Fail / Blocked | Pass |
| Defect ID | Link to defect if failed | DEF-017 |
| Remarks | Evidence, notes, tester, date | Screenshot TC-O2C-001.png, tested by R. Mehta |

### Rules for writing good test cases

- **One business scenario per test case**, but it may cross several apps.
- **Exact data**, not "any customer". Ambiguous data produces non-repeatable results.
- **Measurable expected results**: quantities, amounts, document states, account codes.
- **Independent**: preconditions state everything needed; do not rely on another test having run unless stated.
- **Include accounting and stock checks**, not only document states.

## Worked example 1 — Order to Cash with pricelist and tax

| Field | Value |
|---|---|
| Test Case ID | TC-O2C-001 |
| Requirement ID | REQ-SAL-004 (Wholesale customers get wholesale pricelist) |
| Module | Sales, Inventory, Accounting |
| Scenario | Sell a stocked product to a wholesale customer, deliver, invoice and receive payment |
| Preconditions | Customer "Blue Harbor Traders" has pricelist "Wholesale" (LED Panel 40W = 100.00); 15% sales tax set on product; 50 units on hand in WH/Stock; payment terms "Immediate Payment" |
| Test Data | Customer: Blue Harbor Traders; Product: LED Panel 40W; Qty: 10 |
| Steps | 1. Sales ▸ Orders ▸ Quotations ▸ New. 2. Select customer; check pricelist shows Wholesale. 3. Add product, qty 10. 4. Confirm. 5. Open the Delivery smart button, validate 10 units. 6. Back on the order, Create Invoice ▸ Regular invoice ▸ Confirm (post). 7. Register Payment for the full amount via Bank journal. |
| Expected Result | Unit price 100.00; untaxed 1,000.00; tax 150.00; total 1,150.00. Delivery state Done; on-hand reduces from 50 to 40. Invoice posted, receivable debit 1,150.00, income credit 1,000.00, tax payable credit 150.00. After payment, invoice shows Paid (or In Payment until bank reconciliation, depending on configuration — verify for your version). |
| Actual Result | (to fill) |
| Status | Not Run |
| Defect ID | — |
| Remarks | Attach screenshots of journal items |

## Worked example 2 — Procure to Pay with partial receipt

| Field | Value |
|---|---|
| Test Case ID | TC-P2P-001 |
| Requirement ID | REQ-PUR-002 (Bills are created based on received quantities) |
| Module | Purchase, Inventory, Accounting |
| Scenario | Purchase 100 units, receive 60 now and 40 later, bill only what was received |
| Preconditions | Vendor "Northwind Components" exists; product "Copper Cable 2.5mm" with control policy "On received quantities" and 15% purchase tax; cost 20.00 |
| Test Data | Vendor: Northwind Components; Qty 100; Unit price 20.00 |
| Steps | 1. Purchase ▸ Orders ▸ Requests for Quotation ▸ New. 2. Add vendor and product, qty 100, price 20.00. 3. Confirm Order. 4. Open Receipt, set quantity 60, validate, choose **Create Backorder**. 5. On the PO, Create Bill. 6. Check bill lines, add bill date, Confirm. |
| Expected Result | Receipt done for 60, backorder created for 40. Bill quantity proposed = 60, untaxed 1,200.00, tax 180.00, total 1,380.00. PO shows billed qty 60, received qty 60. Vendor payable credited 1,380.00. |
| Actual Result | (to fill) |
| Status | Not Run |
| Defect ID | — |
| Remarks | Repeat for backorder in TC-P2P-002 |

## Worked example 3 — Sales return and credit note

| Field | Value |
|---|---|
| Test Case ID | TC-O2C-005 |
| Requirement ID | REQ-SAL-011 (Customer returns are restocked and credited) |
| Module | Sales, Inventory, Accounting |
| Scenario | Customer returns 2 damaged-packaging units that are resellable; issue credit note |
| Preconditions | TC-O2C-001 executed: 10 units delivered and invoiced to Blue Harbor Traders |
| Test Data | Return qty 2; reason "Damaged packaging" |
| Steps | 1. Open the done delivery for the order. 2. Click Return, set qty 2, confirm, and validate the return receipt. 3. Open the posted invoice, click Credit Note, enter reason, choose to create a draft credit note, adjust quantity to 2, post. |
| Expected Result | On-hand increases from 40 to 42. Sales order delivered qty shows 8. Credit note total 230.00 (200.00 + 30.00 tax). Customer balance reduced by 230.00. |
| Actual Result | (to fill) |
| Status | Not Run |
| Defect ID | — |
| Remarks | Return wizard labels may vary slightly by version |

## Common mistakes

| Mistake | Better approach |
|---|---|
| "System should work correctly" | "Invoice total = 1,150.00, state Posted" |
| No preconditions | List master data, stock and settings explicitly |
| Steps skip accounting checks | Add "Open journal items and verify accounts" |
| Testing only the happy path | Pair each positive case with negative cases (Lesson: Negative testing) |

## Key takeaways

- Use a consistent template with all 12 fields; never leave Expected Result vague.
- Link every test case to a requirement ID for traceability.
- Use exact, fictional but realistic test data.
- Verify document states, quantities **and** journal entries.
- Record evidence (document numbers, screenshots) in Actual Result and Remarks.
`,
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2 — Functional, Data, Security & Reconciliation Testing",
      lessons: [
        {
          slug: "functional-and-integration-testing",
          title: "Functional & Integration Testing",
          durationMin: 40,
          odooVersions: "Odoo 17.0 (concepts version-independent)",
          scope: ["standard", "configuration"],
          body: `## Business context

Once each app is configured, the consultant must prove two things: each function works on its own (**functional testing**), and the functions work together end to end, including external systems (**integration testing**, often called SIT).

## Functional testing

Functional tests check one feature or configuration against its requirement.

| Requirement | Functional test |
|---|---|
| Quotations above 10,000.00 need manager approval | Create quotation of 12,000.00 as salesperson; confirm action requires approval (configuration-dependent — Odoo's standard sales approval options vary by version; verify) |
| Products are tracked by lot | Receive a lot-tracked product; system asks for lot numbers |
| Payment terms 30% advance, 70% in 30 days | Post invoice; check two due-date lines in the journal items |
| Two-step delivery (Pick + Ship) | Confirm SO; two transfers are created in sequence |

Functional testing is usually done by the consultant who configured the app, immediately after configuring it. It is quick and catches configuration errors early.

## Integration testing

Integration testing proves that data and value flow correctly **between** apps and systems.

### Internal integrations (between Odoo apps)

| Flow | Integration points to verify |
|---|---|
| Order to Cash | Sales → Inventory (delivery), Sales → Accounting (invoice), Accounting → Bank (payment, reconciliation) |
| Procure to Pay | Purchase → Inventory (receipt), Purchase → Accounting (vendor bill), Accounting → Bank |
| Plan to Produce | Sales/Replenishment → Manufacturing (MO), MRP → Inventory (component consumption, finished goods), Inventory valuation → Accounting |
| Hire to Retire | Employees → Payroll → Accounting (Payroll is Enterprise; verify for your edition) |
| Record to Report | All journals → General Ledger → Financial reports |

### External integrations

| Integration | What to test |
|---|---|
| Bank statement import / sync | Statements load, lines match invoices/bills, duplicates rejected |
| E-commerce platform | Orders arrive with correct customer, products, taxes, shipping; stock sync back |
| Payment gateway | Successful payment creates payment record; failed payment does not |
| EDI / API with customers | Messages mapped correctly; errors logged and re-processable |
| BI / reporting tool | Extracted figures match Odoo reports |

For each integration test, verify **both ends**: the record in Odoo and the record in the external system, plus error handling when the other side is down or sends bad data.

## A sample integration test scenario: Make to Order

**Company:** Fictional "Crestline Furniture".
**Scenario:** A customer orders 5 "Oak Dining Table" units; the product uses routes Manufacture + Replenish on Order (MTO) (route availability depends on configuration; verify for your version).

| Step | App | Check |
|---|---|---|
| 1. Confirm SO for 5 tables | Sales | SO confirmed, delivery created waiting for production |
| 2. MO created automatically | Manufacturing | MO for 5 tables, components reserved per BoM |
| 3. Purchase of missing components (if MTO on components) | Purchase | RFQ created for shortage |
| 4. Produce and mark MO done | Manufacturing | Components consumed, 5 tables in stock |
| 5. Deliver | Inventory | Delivery done, stock of tables back to zero |
| 6. Invoice | Accounting | Revenue and receivable posted |
| 7. Valuation | Accounting | If automated valuation is enabled: component consumption and finished goods entries are balanced |

## Planning integration test cycles

Large projects run SIT in cycles:

| Cycle | Focus | Data |
|---|---|---|
| SIT 1 | Main happy paths for each process | Sample master data |
| SIT 2 | Variants, exceptions, integrations | Trial migration data |
| SIT 3 | Full regression after fixes | Near-final migration data |

## Evidence

For every integration test record the document numbers produced (SO, delivery, invoice, payment, journal entry). This creates a **document chain** that anyone can follow to verify the result.

## Key takeaways

- Functional testing proves a single feature; integration testing proves end-to-end flow.
- Test internal flows between apps **and** external systems on both ends.
- Always include error handling for integrations (system down, bad data, duplicates).
- Run SIT in cycles with increasingly realistic data.
- Record the full document chain as evidence.
`,
        },
        {
          slug: "data-migration-testing",
          title: "Data Migration Testing",
          durationMin: 40,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard"],
          body: `## Business context

Migrated data is the foundation the business will run on from day one. If opening stock is wrong, every delivery is wrong. If customer balances are wrong, collections are wrong. Data migration testing proves that what was loaded into Odoo is **complete**, **accurate** and **reconciles** to the legacy system.

## The four validation techniques

| Technique | Question it answers | Example |
|---|---|---|
| Record counts | Did every record arrive? | Legacy: 1,248 active customers; Odoo: 1,248 customers with tag "Migrated" |
| Control totals | Do the sums match? | Sum of open AR invoices legacy 482,350.75 = Odoo 482,350.75 |
| Sample checks | Are individual records correct field by field? | 25 random products compared on name, UoM, category, cost, sales price, taxes |
| Reconciliation | Do financial balances agree with legacy trial balance? | Odoo receivable account balance = legacy AR control account at cutover date |

### Record counts

Prepare a count sheet before loading:

| Object | Legacy count | Excluded (reason) | Expected in Odoo | Actual in Odoo | Difference |
|---|---|---|---|---|---|
| Customers | 1,310 | 62 (inactive > 3 yrs) | 1,248 | 1,248 | 0 |
| Vendors | 214 | 9 (duplicates merged) | 205 | 204 | -1 |
| Products | 3,560 | 410 (obsolete) | 3,150 | 3,150 | 0 |
| Open sales orders | 87 | 0 | 87 | 87 | 0 |

Any difference must be explained (e.g. the missing vendor failed import due to an invalid country code).

### Control totals

Pick numeric fields and compare sums:

- Total on-hand quantity per warehouse.
- Total stock value per product category.
- Sum of open AR and open AP amounts.
- Sum of credit limits (if migrated).

### Sample checks

Select records randomly **and** deliberately pick edge cases: records with special characters, multiple addresses, foreign currency, lot/serial tracking, zero cost. Compare field by field and log differences.

## Reconciling AR, AP and stock values to legacy

At cutover date, finance must agree that the Odoo opening position equals the legacy closing position.

| Area | Legacy source | Odoo source | Tolerance |
|---|---|---|---|
| Accounts receivable | AR aged report at cutover | Aged Receivable report + receivable account balance | 0.00 |
| Accounts payable | AP aged report at cutover | Aged Payable report + payable account balance | 0.00 |
| Stock quantity | Stock listing per location | Inventory ▸ Reporting ▸ Stock (per location) | 0 units |
| Stock value | Stock valuation report | Inventory valuation report and stock account balance (verify report names for your version/edition) | Agreed rounding only |
| GL balances | Trial balance at cutover | Trial balance after opening entry | 0.00 |

Typical approach in Odoo:

1. Load open customer invoices and vendor bills individually (so they can be paid later) against a temporary opening/suspense account rather than real income/expense accounts.
2. Load opening stock via inventory adjustment with the agreed unit cost.
3. Post the opening trial balance journal entry, clearing the suspense account.
4. Check that the suspense account balance is **zero**. A non-zero balance means something does not reconcile.

## Migration test cycles

| Load | Purpose | Sign-off |
|---|---|---|
| Trial load 1 | Validate templates and mapping | Consultant |
| Trial load 2 | Full volume, measure load time, reconcile | Consultant + data owners |
| Dress rehearsal | Run as in cutover plan, with timings | Project manager |
| Production load | Final load at cutover | Finance + process owners |

## Common migration defects

| Defect | Typical cause |
|---|---|
| Duplicate partners | Same customer with different spellings in legacy |
| Wrong UoM on product | Mapping of legacy "PCS" vs "Units" missing |
| Stock value differs | Cost loaded per box but UoM is per unit |
| Partial AR balance | Credit notes not migrated |
| Tax missing on products | Tax names did not match during import |

## Key takeaways

- Validate migration with **counts, control totals, sample checks and reconciliation**.
- Explain every difference; "close enough" is not acceptable for financial balances.
- Use a suspense/opening account and verify it ends at zero.
- Run at least two trial loads and a dress rehearsal before the production load.
- Finance must sign off AR, AP, stock value and trial balance at cutover.
`,
        },
        {
          slug: "role-based-access-testing",
          title: "Role-Based Access Testing",
          durationMin: 35,
          odooVersions: "Odoo 17.0 (concepts version-independent)",
          scope: ["standard", "configuration"],
          body: `## Business context

Users should see and do exactly what their job requires — no more, no less. A salesperson changing product costs or a warehouse user posting journal entries are control failures that auditors will find. Access testing proves the **segregation of duties** designed in the project actually works.

## How Odoo controls access (overview)

| Layer | What it controls | Where configured |
|---|---|---|
| User type | Internal user, portal, public | Settings ▸ Users & Companies ▸ Users |
| Access rights (groups) | Which apps/menus and which models a user can read/write/create/delete | User form, app sections (e.g. Sales: User: Own Documents Only / All Documents / Administrator) |
| Record rules | **Which records** of a model the user can access (e.g. own leads only) | Settings ▸ Technical ▸ Security ▸ Record Rules (developer mode) |
| Field-level groups | Visibility of specific fields | Defined in views/fields (technical) |
| Allowed companies | Which companies a user can work in | User form ▸ Allowed Companies |

## Build a role matrix first

| Role | Sales | Purchase | Inventory | Accounting | Key restrictions |
|---|---|---|---|---|---|
| Salesperson | User: Own Documents | — | — | — | Cannot see other salespeople's orders |
| Sales Manager | Administrator | — | — | — | Can see all orders, cannot post invoices |
| Buyer | — | User | User | — | Cannot validate vendor bills |
| Warehouse Clerk | — | — | User | — | Cannot see costs or invoices |
| Accountant | — | — | — | Accountant / Billing | Cannot confirm sales orders |

Exact group names differ per app and version; read them from the user form in your database.

## Positive and negative tests

For every role, test both what the user **should** be able to do (positive) and what they **must not** be able to do (negative).

| ID | Role | Type | Test | Expected |
|---|---|---|---|---|
| SEC-001 | Salesperson A | Positive | Create and confirm own quotation | Allowed |
| SEC-002 | Salesperson A | Negative | Open Salesperson B's order via list/search | Not visible |
| SEC-003 | Salesperson A | Negative | Open Accounting menu | Menu not visible |
| SEC-004 | Warehouse Clerk | Positive | Validate a receipt | Allowed |
| SEC-005 | Warehouse Clerk | Negative | Open a vendor bill from receipt smart button | Access error or button hidden |
| SEC-006 | Buyer | Negative | Change a product's sales price | Field read-only or access error (depends on design) |
| SEC-007 | Accountant | Negative | Delete a posted journal entry | Not allowed (posted entries must be reset/reversed) |

Test with **real test users**, never with the administrator. Log in as each user (or use a private browser window per user). Administrators bypass many restrictions and give false passes.

## Testing record rules

Record rules restrict which records appear. Classic tests:

- Salesperson sees only own leads/orders when set to "Own Documents Only".
- Multi-company rules: a user of Company A cannot see Company B's journals or invoices unless Company B is in their allowed companies.
- Portal users see only their own invoices and orders on the portal.

Try to reach restricted records through **every path**: list view, search, direct URL with record ID, smart buttons, reports and exports. A rule that hides records from the list but allows a direct URL is a defect.

## Multi-company testing

| Test | Expected |
|---|---|
| User with only Company A selects company switcher | Company B not available |
| User with A and B creates SO while only A active | SO belongs to A; uses A's taxes and journals |
| Inter-company product shared vs company-specific | Company-specific product not visible in other company |
| Reports run in Company A | Contain only Company A figures unless both selected |
| Inter-company rules (if configured) | SO in A creates PO in B (Enterprise-dependent; verify for your edition) |

## Custom groups and Studio changes

When custom groups, record rules or Studio fields are added, include them in the matrix and test them like standard ones. Custom code that uses elevated privileges (sudo) can bypass access rules — ask developers to highlight such places so they can be tested.

## Key takeaways

- Start from a role matrix agreed with the business and auditors.
- Test **positive and negative** cases for every role.
- Never test access as administrator; use dedicated test users.
- Try every path to restricted data: list, search, URL, smart buttons, reports, exports.
- Multi-company setups need dedicated tests for company visibility, taxes and journals.
`,
        },
        {
          slug: "financial-inventory-reconciliation-tests",
          title: "Financial & Inventory Reconciliation Tests",
          durationMin: 40,
          odooVersions: "Odoo 17.0 (valuation/reporting features vary by edition)",
          scope: ["standard", "configuration", "enterprise"],
          body: `## Business context

A finance controller does not trust a system because the screens look nice. They trust it when the **subledgers agree with the general ledger**. Reconciliation tests prove that operational modules (Inventory, Sales, Purchase) and Accounting tell the same story.

## Reconciliation 1 — Stock valuation vs GL stock account

When product categories use **automated (perpetual)** inventory valuation, every stock move that changes value posts a journal entry to the stock valuation account. The inventory valuation report and the stock account balance must then match (automated valuation requires the Accounting features; verify for your edition).

| Check | Source A | Source B | Expected |
|---|---|---|---|
| Total stock value | Inventory valuation report (total) | GL balance of stock valuation account(s) | Equal |
| Per category | Valuation grouped by product category | GL by account if categories use different accounts | Equal |
| Stock interim (received not billed) | Receipts not yet billed | Stock interim (received) account balance | Explainable by open receipts |
| Stock interim (delivered not invoiced) | Deliveries not yet invoiced (Anglo-Saxon setups) | Stock interim (delivered) account balance | Explainable by open deliveries |

### Typical causes of differences

| Cause | How it happens |
|---|---|
| Manual journal entry to stock account | Accountant posts directly to stock account bypassing Inventory |
| Category switched from manual to automated | Value existing before the switch has no GL entry |
| Different accounts on categories | Report total compared to only one account |
| Backdated moves / wrong accounting date | Report at date vs GL at date use different dates |
| Landed costs not validated | Value added to stock layers but not posted (Landed Costs availability depends on edition; verify) |

**Test case example:** Receive 100 units at 20.00 (value 2,000.00), deliver 30 units. Expected: valuation report shows 70 units, 1,400.00; stock account balance increased by 1,400.00 net from these moves.

## Reconciliation 2 — AR subledger vs receivable control account

The **Aged Receivable** report (subledger) lists open items per customer. The **receivable account** in the GL (control account) holds the total. They must agree at any date.

| Check | Source A | Source B | Expected |
|---|---|---|---|
| Total open AR | Aged Receivable report total | Balance of receivable account(s) on trial balance | Equal |
| Per customer | Partner ledger for the customer | Customer's open invoices less payments | Equal |
| Same for AP | Aged Payable report | Payable account balance | Equal |

Report menu names and availability differ between Community and Enterprise (verify for your version/edition).

### Typical causes of differences

- Manual journal entries to receivable accounts without a partner.
- Payments posted but not reconciled with invoices (they still appear as open credits — total agrees, but aging is misleading).
- Multiple receivable accounts (e.g. one per currency or customer group) — compare totals of all of them.
- Report filters (posted only vs including draft entries).

## Reconciliation 3 — Bank

Bank account balance in Odoo after reconciliation must equal the bank statement closing balance. Unreconciled statement lines and outstanding payments/receipts must be explainable.

## Reconciliation 4 — Tax

Tax report totals should agree with tax payable/receivable account balances for the period (allowing for configuration such as cash basis taxes).

## Building a reconciliation test pack

| ID | Reconciliation | Frequency in testing | Owner |
|---|---|---|---|
| REC-01 | Stock valuation vs stock accounts | After each SIT cycle, after migration | Consultant + Cost accountant |
| REC-02 | AR aging vs receivable accounts | After each SIT cycle, after migration | Consultant + AR accountant |
| REC-03 | AP aging vs payable accounts | After each SIT cycle, after migration | Consultant + AP accountant |
| REC-04 | Bank balance vs statement | After payment tests | Treasury |
| REC-05 | Tax report vs tax accounts | After invoice/bill tests | Tax accountant |
| REC-06 | Trial balance vs legacy (opening) | At migration | Finance controller |

Run reconciliations **after** a full batch of transactions, not only on a clean database — differences appear when many processes interact (returns, partial deliveries, credit notes, landed costs).

## Key takeaways

- Subledgers (stock, AR, AP) must agree with their GL control accounts.
- Most differences come from manual journal entries, configuration changes mid-stream, date mismatches or report filters.
- Build a reconciliation pack and run it after every test cycle and every migration load.
- Get finance users to own and sign off reconciliations — they will rely on them after go-live.
`,
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3 — Acceptance, Regression, Exceptions & Defects",
      lessons: [
        {
          slug: "user-acceptance-testing",
          title: "User Acceptance Testing (UAT)",
          durationMin: 40,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

UAT is the moment the business, not the consultants, decides whether the system is fit to run the company. A successful UAT produces confidence and a signed approval; a weak UAT produces surprises in the first week of go-live.

## UAT planning

| Element | Description | Example |
|---|---|---|
| Scope | Processes and requirements to accept | O2C, P2P, Inventory, Accounting close |
| Participants | Key users per department + process owners | 2 sales coordinators, 1 buyer, 2 warehouse leads, 2 accountants |
| Schedule | Sessions per process, with buffer for retests | 2 weeks + 3 days retest |
| Environment | Refreshed copy with migrated data | uat-crestline database |
| Scripts | Business-language scenarios | 45 scripts covering 120 requirements |
| Support | Consultant available to guide and log defects | Daily stand-up at 9:00 |
| Criteria | Exit/sign-off rules | No open Critical/High defects |

## Choosing key users

Good key users:

- Know the current process deeply, including exceptions.
- Have authority to accept or reject on behalf of their department.
- Will train colleagues after go-live (train-the-trainer).
- Have time released from daily work during UAT.

## UAT scripts

UAT scripts are less technical than SIT test cases. They use the user's language and real-life scenarios.

| Script ID | UAT-SAL-03 |
|---|---|
| Process | Order to Cash |
| Business scenario | Monthly repeat order from wholesale customer with partial stock availability |
| Performed by | Sales coordinator |
| Steps | 1. Create order for 3 products. 2. Confirm. 3. Warehouse ships available items. 4. Remaining items shipped next week. 5. Invoice each shipment. |
| Expected | Two deliveries, two invoices, customer statement shows both |
| Result | Pass / Fail |
| Comments | |
| Signature/Date | |

Encourage users to also run **their own day-in-the-life scenarios**: "Do what you did yesterday in the old system."

## Running UAT

1. **Kick-off**: explain objectives, schedule, how to log defects, difference between defect and change request.
2. **Guided execution**: consultant demonstrates the first script, users execute the rest.
3. **Daily triage**: review new defects, assign severity/priority, agree fixes.
4. **Retest**: users retest fixed defects in the same environment.
5. **Sign-off**.

### Defect vs change request

| Situation | Classification |
|---|---|
| Invoice tax is wrong compared to agreed design | Defect |
| User now wants an extra field not in requirements | Change request (scope) |
| Report layout differs from approved mock-up | Defect |
| User prefers old screen layout | Training / change management |

## UAT sign-off form

| Field | Content |
|---|---|
| Project | Crestline Furniture Odoo Implementation |
| Phase | UAT — Cycle 1 |
| Process area | Order to Cash |
| Scripts executed / passed / failed | 18 / 17 / 1 |
| Open defects | DEF-044 (Low): delivery slip logo alignment — accepted for post go-live fix |
| Conditions of acceptance | DEF-044 fixed within 2 weeks of go-live |
| Decision | Accepted / Accepted with conditions / Rejected |
| Process owner name & signature | |
| Project manager signature | |
| Date | |

## Common UAT pitfalls

| Pitfall | Prevention |
|---|---|
| Users not trained before UAT | Run training sessions before UAT starts |
| UAT on empty database | Load migrated master data first |
| Consultants execute scripts for users | Users must execute; consultants only guide |
| Scope creep disguised as defects | Classify change requests separately |
| No sign-off, just "looks fine" | Formal signed form per process |

## Key takeaways

- UAT is owned by the business; consultants facilitate.
- Plan scope, people, environment, scripts, schedule and exit criteria up front.
- Use business-language scripts plus day-in-the-life scenarios.
- Separate defects from change requests.
- Close UAT with a formal sign-off per process area.
`,
        },
        {
          slug: "regression-testing",
          title: "Regression Testing After Changes & Upgrades",
          durationMin: 35,
          odooVersions: "Odoo 17.0 (automated test framework exists across recent versions)",
          scope: ["standard", "customization"],
          body: `## Business context

Every change can break something that worked yesterday: a new custom field, a modified report, a module update, a version upgrade. **Regression testing** re-runs a defined set of tests to make sure existing processes still work after a change.

## When to run regression tests

| Trigger | Regression scope |
|---|---|
| Bug fix in one module | Tests for that process + directly connected processes |
| New customization | Affected processes + integrations |
| Odoo minor updates / patches | Core O2C, P2P, inventory, accounting smoke tests |
| Major version upgrade (e.g. 16.0 → 17.0) | Full regression pack + all customizations + reports + integrations |
| New app installed | Processes touching shared models (partners, products, accounting) |
| Configuration change (e.g. switching to 3-step delivery) | All flows using that warehouse |

## Building a regression pack

A regression pack is a **curated subset** of test cases that covers the most important and most fragile processes.

| Priority | Include |
|---|---|
| 1 | Revenue and cash flows: quotation → invoice → payment |
| 2 | Purchasing and payables |
| 3 | Inventory moves and valuation |
| 4 | Month-end: reconciliation, tax report, financial reports |
| 5 | Every customization and integration |
| 6 | Security tests for key roles |

Keep the pack small enough to run in a day manually (for example 40–80 cases) and grow automated coverage over time.

## Upgrade regression specifics

Major upgrades change data models, views and sometimes workflows. In addition to the pack:

- Compare key reports before and after upgrade on the same data (trial balance, aged receivable, stock valuation).
- Check every custom module installs and its views load.
- Check customized reports (QWeb PDFs) render.
- Re-test integrations: APIs and field names may have changed.
- Check scheduled actions and automated actions still run.

## Automated tests in Odoo

Odoo includes a Python test framework based on unittest. Developers write tests inside a custom module's tests folder. Common base classes include TransactionCase (each test runs in a transaction that is rolled back) and HttpCase (for browser/tour tests). Tests are run when starting the server with the test-enable option on a test database, for example: odoo-bin -d test_db -i my_module --test-enable --stop-after-init. Test tags allow running selected tests (option --test-tags). Check the developer documentation for your version for exact options.

What to automate first:

| Good candidates | Why |
|---|---|
| Custom computed fields and constraints | Fast, deterministic, easy to break |
| Custom pricing/discount logic | High business impact |
| Custom integrations (mock the external system) | Hard to test manually |
| Critical end-to-end flows (tours) | Catch UI breakage after upgrades |

Automated tests do not replace business testing — they protect what you already verified. On Odoo.sh, tests can run automatically on new builds (verify for your hosting plan).

## Regression test cycle

1. Identify the change and its impact (which models, apps, processes).
2. Select regression cases from the pack (plus new cases for the change).
3. Refresh the test database with recent production data (anonymised if needed).
4. Run automated tests, then manual cases.
5. Log defects; fix; retest.
6. Record results in a regression report before deploying to production.

## Example impact analysis

Change: *Add a mandatory field "Delivery Window" to sales orders.*

| Impacted area | Regression tests |
|---|---|
| Sales order creation (UI) | Create SO manually — field required |
| Sales orders from e-commerce | Website order still created (field filled or not required for website) |
| Imported orders | Import template includes the field |
| API integration | External system sends the field or default applies |
| Delivery slip report | Field printed where specified |

This example shows why "small" changes need regression: a mandatory field can silently break website orders or integrations.

## Key takeaways

- Regression testing protects existing processes after any change.
- Maintain a prioritised regression pack focused on money, stock and customizations.
- Upgrades need before/after report comparisons and full customization checks.
- Automate tests for custom logic using Odoo's test framework; keep manual business tests too.
- Always do an impact analysis before choosing regression scope.
`,
        },
        {
          slug: "negative-and-exception-testing",
          title: "Negative & Exception Testing",
          durationMin: 35,
          odooVersions: "Odoo 17.0 (behaviour of some controls varies by version)",
          scope: ["standard", "configuration"],
          body: `## Business context

Most go-live problems do not come from the happy path — they come from **exceptions**: a customer over their credit limit, a vendor paid twice, a warehouse that ships more than ordered. Negative testing proves the system prevents, warns about, or correctly handles invalid situations.

Before testing, agree with the business what the **expected behaviour** is: block, warn, require approval, or allow and report. Odoo's standard behaviour for some of these is a warning rather than a block, and it can change between versions — verify for your version.

## Categories of negative tests

| Category | Examples |
|---|---|
| Invalid data | Missing mandatory fields, wrong formats, negative quantities, invalid VAT numbers |
| Business rule violations | Over-delivery, over-billing, sales below cost, credit limit exceeded |
| Process order violations | Invoice before delivery when policy is "delivered quantities", paying a draft bill |
| Cancellations | Cancel confirmed orders, cancel after partial delivery |
| Duplicates | Duplicate partners, duplicate vendor bill references, duplicate payments |
| Access violations | See Role-Based Access Testing lesson |

## Worked negative test cases

| ID | Scenario | Steps (summary) | Expected result (agree with business) |
|---|---|---|---|
| NEG-01 | Invalid data — missing customer | Create quotation without customer and save | Save prevented; customer field highlighted as required |
| NEG-02 | Invalid data — negative quantity on SO line | Enter qty -5 on sales order line | Per design: block via validation, or treat as return; document behaviour (standard Odoo may allow negative lines — verify) |
| NEG-03 | Over-delivery | SO for 10 units; on delivery set quantity 12 and validate | System allows/blocks per configuration; if allowed, SO delivered qty 12 and invoicing policy decides billing of 12; business decides whether this is acceptable (verify behaviour for your version) |
| NEG-04 | Credit limit | Customer credit limit 5,000.00, open receivable 4,500.00; create SO for 1,000.00 | With the credit limit setting enabled in Accounting, a warning about the credit limit is shown (Odoo 17 shows a warning; hard blocking typically needs customization — verify) |
| NEG-05 | Cancelled order | Confirm SO, cancel it before delivery | SO state Cancelled; delivery cancelled; reserved stock released |
| NEG-06 | Cancel after partial delivery | Deliver 5 of 10 units, try to cancel SO | Behaviour per version: cancellation restricted or remaining moves cancelled; delivered goods must be returned via return process — document actual behaviour |
| NEG-07 | Duplicate vendor bill | Create a second bill for the same vendor with same reference | Duplicate reference warning shown (verify for your version) |
| NEG-08 | Duplicate payment | Register payment on invoice already paid | Register Payment no longer offered for a paid invoice; a second manual payment remains as unreconciled customer credit and is visible in the partner ledger |
| NEG-09 | Over-billing vs PO | PO for 100 units received 100; create bill with 120 units | Bill can be edited; three-way-match/bill control should flag the difference (feature availability depends on configuration/edition — verify) |
| NEG-10 | Expired lot | Deliver a lot past its expiry date (expiration dates enabled) | Warning or prevention per configuration (verify) |
| NEG-11 | Sale below cost | Set unit price lower than product cost | Standard Odoo shows margin if Margins enabled; blocking requires customization or approval rule |
| NEG-12 | Closed period | Post invoice dated in a locked period | Posting blocked by lock date |

## Boundary value testing

Test **at**, **just below** and **just above** limits:

| Rule | Test values |
|---|---|
| Approval needed above 10,000.00 | 9,999.99 / 10,000.00 / 10,000.01 |
| Credit limit 5,000.00 | Exposure 4,999.99 / 5,000.00 / 5,000.01 |
| Discount max 15% | 14.99% / 15% / 15.01% |

Clarify whether the limit is inclusive — a common requirement ambiguity.

## Exception handling in integrations

| Exception | Expected handling |
|---|---|
| External system sends unknown product code | Message logged as failed, not silently skipped; alert sent |
| Duplicate order message | Second message rejected or ignored with log entry |
| Network timeout | Retry policy; no half-created records |
| Invalid tax code | Order rejected with clear error |

## Documenting results

When the system does not behave as the business expects, classify the outcome:

- **Defect** — the agreed design is not met.
- **Gap** — standard Odoo does not support the rule; needs customization or a process workaround (raise a change request).
- **Accepted behaviour** — the business accepts the standard behaviour with a procedure (e.g. weekly report of over-deliveries).

## Key takeaways

- Exceptions cause most real-world failures; test them deliberately.
- Agree expected behaviour (block, warn, approve, allow) before testing.
- Use boundary values around every numeric limit.
- Several Odoo controls are warnings, not blocks — verify and document for your version.
- Classify outcomes as defect, gap or accepted behaviour.
`,
        },
        {
          slug: "defect-management-and-reporting",
          title: "Defect Management & Test Reporting",
          durationMin: 35,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Finding defects is only half the job. Projects succeed when defects are logged clearly, prioritised sensibly, fixed, retested and reported transparently so management can decide whether to go live.

## Writing a good defect report

| Field | Example |
|---|---|
| Defect ID | DEF-031 |
| Title | Invoice for wholesale customer uses public price instead of wholesale pricelist |
| Test Case ID | TC-O2C-001 |
| Environment / DB / build | UAT — uat-crestline — build 2024-05-12 |
| Steps to reproduce | 1. Create SO for Blue Harbor Traders... |
| Expected | Unit price 100.00 (Wholesale) |
| Actual | Unit price 120.00 (Public Pricelist) |
| Evidence | Screenshot, SO S00045 |
| Severity | High |
| Priority | P1 |
| Reported by / date | Key user Sales, 2024-05-13 |
| Assigned to | Functional consultant |
| Status | New |

A defect report must be reproducible by someone else. "Price wrong" is not a defect report.

## Severity vs priority

**Severity** = impact on the business/system. **Priority** = urgency of fixing. They are related but not the same.

| Severity | Meaning | Example |
|---|---|---|
| Critical | Process blocked, no workaround, or data/financial corruption | Cannot post any invoice |
| High | Major function wrong, workaround difficult | Wrong tax on a product group |
| Medium | Function wrong, workaround exists | Report filter missing, can export and filter |
| Low | Cosmetic | Typo in delivery slip label |

| Combination | Example |
|---|---|
| High severity, low priority | Year-end closing report wrong, but go-live is in March and year end is December |
| Low severity, high priority | Company logo wrong on invoice the CEO will see tomorrow |

## Defect lifecycle

| Status | Who | Meaning |
|---|---|---|
| New | Tester | Logged, not yet reviewed |
| Triaged / Open | Test lead | Severity/priority confirmed, assigned |
| In Progress | Consultant / developer | Being fixed |
| Fixed / Ready for Retest | Developer | Fix deployed to test environment |
| Retest | Tester | Being verified |
| Closed | Tester | Verified fixed |
| Reopened | Tester | Retest failed |
| Rejected | Test lead | Not a defect (works as designed, duplicate, change request) |
| Deferred | Steering/PM | Accepted to fix after go-live |

### Retest and regression

When a fix is delivered:

1. **Retest** the failed test case with the same data and steps.
2. Run **related regression** cases — a fix can break neighbouring functionality.
3. Record the build/version where the fix was verified.

## Triage meeting

Run daily during SIT/UAT: review new defects, confirm severity/priority, assign owners, separate change requests, check ageing defects. Keep it short (15–30 minutes).

## Test metrics

| Metric | Formula | Use |
|---|---|---|
| Execution progress | Executed / Planned | Are we on schedule? |
| Pass rate | Passed / Executed | Quality indicator |
| Defect density | Defects / Test cases (or per process) | Where problems cluster |
| Open defects by severity | Count | Go-live readiness |
| Defect ageing | Days open | Bottlenecks |
| Reopen rate | Reopened / Fixed | Quality of fixes |

## Test summary report template

| Section | Content |
|---|---|
| 1. Project & phase | Crestline Furniture — SIT Cycle 2 |
| 2. Period & environment | 2024-05-06 to 2024-05-17, test-crestline, Odoo 17.0 |
| 3. Scope | O2C, P2P, Inventory, MRP, Accounting, Bank integration |
| 4. Execution summary | Planned 160, Executed 158, Passed 149, Failed 6, Blocked 3 |
| 5. Defect summary | Critical 0, High 1, Medium 4, Low 9 open; 37 closed |
| 6. Open risks | DEF-052 (High) landed cost allocation — fix due 2024-05-21 |
| 7. Deviations from plan | Bank integration tests blocked 2 days by bank sandbox outage |
| 8. Reconciliations | Stock vs GL agreed; AR vs control agreed; AP difference 12.40 under investigation |
| 9. Exit criteria assessment | Met except DEF-052 — conditional pass |
| 10. Recommendation | Proceed to UAT after DEF-052 retest |
| 11. Approvals | Test lead, Project manager, Client project owner |

## Key takeaways

- Write defects that are reproducible: steps, expected, actual, evidence, environment.
- Severity is impact, priority is urgency — set both.
- Follow a clear lifecycle; always retest and run related regression before closing.
- Run daily triage during test phases and separate change requests.
- Close each phase with a test summary report that supports a go/no-go decision.
`,
        },
      ],
    },
  ],
  assessment: {
    slug: "testing-qa-final",
    title: "Testing & QA for ERP Projects — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which statement best describes why ERP testing differs from testing a simple web application?",
        kind: "single",
        options: [
          "ERP systems have fewer screens",
          "ERP testing must verify end-to-end business outcomes including stock and accounting impact",
          "ERP systems never need integration testing",
          "ERP testing is done only by developers",
        ],
        correct: [1],
        explanation: "ERP processes are chained across apps; a test passes only when the business outcome (quantity, value, accounting) is correct.",
      },
      {
        prompt: "Which of the following are typical exit criteria for System Integration Testing? (Select all that apply)",
        kind: "multiple",
        options: [
          "All planned test cases executed",
          "No open Critical or High defects",
          "Key users have not yet been trained",
          "Test summary report signed off",
        ],
        correct: [0, 1, 3],
        explanation: "Exit criteria describe the conditions to close a phase: execution complete, no blocking defects, report approved. Training status is not an SIT exit criterion.",
      },
      {
        prompt: "In the standard test case template, which field provides traceability to the business requirement?",
        kind: "single",
        options: ["Test Case ID", "Requirement ID", "Defect ID", "Remarks"],
        correct: [1],
        explanation: "The Requirement ID links each test case to the requirement it proves.",
      },
      {
        prompt: "A purchase order for 100 units is received 60 now with a backorder, and the product's bill control is 'On received quantities'. What quantity should the vendor bill propose?",
        kind: "single",
        options: ["100", "60", "40", "0"],
        correct: [1],
        explanation: "With control on received quantities, the bill proposes what has been received: 60.",
      },
      {
        prompt: "Which four techniques are used to validate a data migration?",
        kind: "single",
        options: [
          "Record counts, control totals, sample checks, reconciliation",
          "Unit tests, smoke tests, load tests, tours",
          "Screenshots, emails, meetings, sign-off",
          "Backups, restores, logs, alerts",
        ],
        correct: [0],
        explanation: "Counts prove completeness, totals and samples prove accuracy, and reconciliation proves balances agree with legacy.",
      },
      {
        prompt: "After migrating open invoices, bills, stock and the opening trial balance through a temporary opening/suspense account, what should the suspense account balance be?",
        kind: "single",
        options: ["Equal to total AR", "Equal to total stock value", "Zero", "Equal to retained earnings"],
        correct: [2],
        explanation: "If all components reconcile, the opening/suspense account nets to zero. A balance indicates a reconciliation difference.",
      },
      {
        prompt: "Access tests should be executed while logged in as the administrator to save time.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Administrators bypass many restrictions and give false passes. Use dedicated test users per role.",
      },
      {
        prompt: "A record rule hides other salespeople's orders from the list view, but a salesperson can open them by typing the record URL. How should this be classified?",
        kind: "single",
        options: ["Expected behaviour", "Defect", "Change request", "Training issue"],
        correct: [1],
        explanation: "Restricted records must be inaccessible through every path, including direct URLs.",
      },
      {
        prompt: "With automated inventory valuation, which two figures should agree in a stock reconciliation?",
        kind: "single",
        options: [
          "Sales revenue and stock quantity",
          "Inventory valuation report total and stock valuation account balance",
          "Aged receivable and stock value",
          "Purchase order total and vendor count",
        ],
        correct: [1],
        explanation: "The stock subledger (valuation report) should equal the GL stock valuation account balance.",
      },
      {
        prompt: "The company logo is wrong on the invoice that will be shown to the CEO tomorrow. What is the most appropriate classification?",
        kind: "single",
        options: [
          "Critical severity, low priority",
          "Low severity, high priority",
          "High severity, high priority",
          "Low severity, low priority",
        ],
        correct: [1],
        explanation: "Cosmetic impact (low severity) but urgent to fix (high priority).",
      },
      {
        prompt: "Which tests are good examples of boundary value testing for an approval limit of 10,000.00? (Select all that apply)",
        kind: "multiple",
        options: ["9,999.99", "10,000.00", "10,000.01", "500.00"],
        correct: [0, 1, 2],
        explanation: "Boundary testing checks just below, at, and just above the limit.",
      },
      {
        prompt: "After a defect is fixed, what should happen before it is closed?",
        kind: "single",
        options: [
          "Developer closes it immediately",
          "Retest the failed case and run related regression tests in the test environment",
          "Deploy to production and wait for user feedback",
          "Mark it deferred",
        ],
        correct: [1],
        explanation: "The tester retests with the same data and runs related regression; only then is the defect closed.",
      },
    ],
  },
  assignments: [
    {
      slug: "testing-qa-assignment-1",
      title: "Write and Execute 10 Test Cases for a Trading Company (O2C + P2P)",
      instructions: `## Scenario

**Silverline Trading Co.** (fictional) buys electrical accessories from vendors and sells them to retailers. They use Odoo 17.0 with Sales, Purchase, Inventory and Invoicing/Accounting. One warehouse, one company, 15% sales and purchase tax, two pricelists (Public, Retail Partner).

Sample master data you must create in your training database:

| Type | Records |
|---|---|
| Customers | Maple Street Electricals (Retail Partner pricelist, credit limit 5,000.00), Riverside Home Store (Public pricelist) |
| Vendors | Northwind Components, Eastgate Supplies |
| Products | Switch Socket 2-Gang (sale 12.00, cost 7.00), LED Bulb 9W (sale 3.50, cost 1.80), Extension Cord 5m (sale 15.00, cost 9.00) — all storable, invoicing policy on delivered quantities, bill control on received quantities |
| Opening stock | 200 / 500 / 100 units |

## Your tasks

1. Write **10 test cases** using the standard template (Test Case ID, Requirement ID, Module, Scenario, Preconditions, Test Data, Steps, Expected Result, Actual Result, Status, Defect ID, Remarks).
   - At least **5 O2C** cases (include: pricelist pricing, partial delivery with backorder, customer return with credit note, payment registration, and the credit limit scenario).
   - At least **4 P2P** cases (include: full receipt and bill, partial receipt, vendor return/refund, duplicate vendor bill reference).
   - At least **3 of the 10** must be negative/exception tests.
   - Invent requirement IDs (e.g. REQ-SAL-001) and list them in a short requirement table.
2. **Execute** all 10 test cases in your Odoo training database. Fill Actual Result, Status and evidence (document numbers, screenshots).
3. Log any failures or unexpected behaviour as defects (Defect ID, title, steps, expected, actual, severity, priority).
4. Perform one reconciliation: compare the Aged Receivable (or partner ledger) total with the receivable account balance after your tests (report names/availability depend on your edition — note what you used).
5. Write a one-page **test summary report** using the template from the Defect Management lesson.

## Deliverables

- Test case workbook (spreadsheet or markdown table) with 10 executed test cases.
- Defect log (may be empty only if you justify it).
- Reconciliation result.
- Test summary report.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Completeness and correctness of template fields | 20% |
| Precise, measurable expected results (amounts, quantities, accounts) | 25% |
| Coverage of positive and negative scenarios | 20% |
| Quality of execution evidence and defect reports | 20% |
| Reconciliation and summary report | 15% |
`,
    },
  ],
};
