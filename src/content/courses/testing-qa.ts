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

\`\`\`visual-match
{ "title": "Practice: pick the right test level",
  "prompt": "Crestline Furniture has these testing needs. Match each one to the test level that should cover it.",
  "leftLabel": "Testing need", "rightLabel": "Test level",
  "pairs": [
    { "left": "A developer's new computed field 'Margin %' must return 25.00 when price is 100.00 and cost is 75.00", "right": "Unit testing" },
    { "left": "Confirm that a quotation for a lot-tracked chair can be created and confirmed in Sales", "right": "Functional testing" },
    { "left": "A confirmed sales order must create the delivery, the invoice and the receivable journal entry correctly", "right": "Integration testing (SIT)" },
    { "left": "1,248 legacy customers and their open balances must be present and correct in Odoo", "right": "Data migration testing" },
    { "left": "The sales coordinator confirms she can run her monthly repeat orders in the new system", "right": "User Acceptance Testing (UAT)" },
    { "left": "After a fix to the pricelist rule, quotation-to-payment must still work as before", "right": "Regression testing" },
    { "left": "Month-end invoicing of 4,000 lines must finish within the agreed time", "right": "Performance testing" }
  ],
  "explanation": "Each level answers a different question: unit = does one piece of logic compute correctly, functional = does one step work in one app, integration = does value flow across apps, migration = is the loaded data complete and accurate, UAT = does the business accept it, regression = did a change break what worked, performance = is it fast enough at real volume." }
\`\`\`

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

\`\`\`visual-check
{ "question": "SIT at Crestline Furniture is planned to start on Monday. On Friday the consultant reports: all apps configured, test cases approved, but no master data has been loaded and test users do not exist yet. What should the test lead do?",
  "options": ["Start SIT on Monday as planned and load data in parallel", "Start SIT using the administrator account to save time", "Postpone the start: entry criteria are not met", "Skip SIT and go straight to UAT"],
  "correct": 2,
  "explanation": "Entry criteria exist so phases start on facts, not dates. Testing without master data or proper test users produces results that are not repeatable and false passes (admin bypasses access rules), so the time is wasted and the cases must be re-run anyway." }
\`\`\`

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

\`\`\`visual-order
{ "title": "Practice: the testing lifecycle",
  "prompt": "Put the testing activities of an ERP project in the order they happen.",
  "items": ["Plan scope, levels, environments and entry/exit criteria", "Design test cases linked to requirement IDs", "Prepare test data, test users and refresh the environment", "Execute test cases and record actual results with evidence", "Log, triage, fix and retest defects", "Close with a test summary report and sign-off"],
  "explanation": "You cannot design cases before you know the scope, cannot execute before data and users exist, and cannot close before defects are retested. Skipping Prepare is the most common cause of 'Blocked' test cases on day one." }
\`\`\`

## Example: what "tested" really means

Scenario: *Sell 10 units of a stock product to a customer.*

A weak tester checks: quotation confirmed, delivery validated, invoice posted.

A strong tester also checks:

- On-hand quantity of the product decreased by exactly 10 in the right warehouse/location.
- The invoice shows the correct price from the customer's pricelist and the correct tax.
- The journal entry debits the receivable account and credits income and tax payable.
- If automated stock valuation is used, the stock output/COGS entries were created with the correct cost (verify for your edition/configuration).
- The customer's due amount and the aged receivable report show the invoice.

\`\`\`visual-check
{ "question": "A tester marks 'Sell 10 LED Panel 40W' as Pass because the order, delivery and invoice all reached Done/Posted without errors. Which check is still missing before this can honestly be called a pass?",
  "options": ["Nothing, no error means it works", "Check that the invoice PDF has the company logo", "Verify on-hand dropped by 10 in WH/Stock and the journal entry hit the right receivable, income and tax accounts", "Ask the developer if the code was changed"],
  "correct": 2,
  "explanation": "Document states only prove the buttons worked. ERP tests pass when the business outcome is right: quantity moved in the right location and the accounting entry uses the right accounts and amounts. A wrong income account produces no error at all." }
\`\`\`

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

\`\`\`visual-order
{ "title": "Practice: write the steps of TC-O2C-001",
  "prompt": "You are writing the Steps field for TC-O2C-001 (Blue Harbor Traders buys 10 LED Panel 40W). Put the steps in the order a tester must execute them.",
  "items": ["Sales > Orders > Quotations > New, select Blue Harbor Traders", "Check the pricelist on the quotation shows Wholesale", "Add LED Panel 40W, quantity 10, and confirm the order", "Open the Delivery smart button and validate 10 units", "Create Invoice > Regular invoice and post it", "Register Payment for 1,150.00 via the Bank journal", "Open journal items and verify receivable, income and tax accounts"],
  "explanation": "The pricelist must be checked before lines are added, because the unit price is taken from it when the line is created. The policy is invoice on delivered quantities, so the delivery must be validated before the invoice proposes 10 units. The accounting check comes last because it proves the outcome of the whole chain." }
\`\`\`

\`\`\`visual-match
{ "title": "Practice: step and expected result",
  "prompt": "A good test case states a measurable expected result for each step. Match each step of TC-O2C-001 to its expected result.",
  "leftLabel": "Test step", "rightLabel": "Expected result",
  "pairs": [
    { "left": "Add LED Panel 40W, qty 10, on the quotation", "right": "Unit price 100.00, untaxed 1,000.00, tax 150.00, total 1,150.00" },
    { "left": "Validate the delivery", "right": "Delivery state Done; on-hand in WH/Stock goes from 50 to 40" },
    { "left": "Post the customer invoice", "right": "Receivable debit 1,150.00; income credit 1,000.00; tax payable credit 150.00" },
    { "left": "Register the full payment", "right": "Invoice shows In Payment or Paid; customer due amount 0.00" },
    { "left": "Open the Aged Receivable report before payment", "right": "Blue Harbor Traders shows 1,150.00 in the current bucket" }
  ],
  "explanation": "Every expected result contains a number, a state or an account. That is what makes the case executable by someone else and impossible to argue about: either on-hand is 40 or it is not." }
\`\`\`

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

\`\`\`visual-order
{ "title": "Practice: write the steps of TC-P2P-001",
  "prompt": "Put the Procure-to-Pay steps for the partial receipt test (100 Copper Cable 2.5mm ordered, 60 received) in execution order.",
  "items": ["Create an RFQ for Northwind Components, 100 units at 20.00", "Confirm the order", "Open the receipt, set quantity 60 and validate", "Choose Create Backorder for the remaining 40", "Create Bill from the purchase order", "Check the bill proposes 60 units, total 1,380.00, and confirm it"],
  "explanation": "The bill control policy is 'On received quantities', so the bill can only be checked after the receipt is validated. Choosing Create Backorder (not No Backorder) is part of the test: it proves the remaining 40 stay expected and can be received in TC-P2P-002." }
\`\`\`

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

\`\`\`visual-check
{ "question": "Which Expected Result for TC-O2C-005 (customer returns 2 LED Panel 40W, credit note issued) is written correctly?",
  "options": ["Return works and credit note is fine", "System handles the return correctly", "On-hand 40 to 42; SO delivered qty 8; credit note 230.00 (200.00 + 30.00 tax) posted; customer balance reduced by 230.00", "Credit note created"],
  "correct": 2,
  "explanation": "Only the third option is measurable: it states quantities, amounts and the effect on the customer balance. 'Credit note created' would pass even if the credit note had the wrong quantity or tax, which is exactly the defect you want to catch." }
\`\`\`

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

\`\`\`visual-match
{ "title": "Practice: requirement and test type",
  "prompt": "Match each Crestline Furniture requirement to the test type that proves it best.",
  "leftLabel": "Requirement", "rightLabel": "Test type",
  "pairs": [
    { "left": "Custom discount function returns 5% for orders above 2,000.00", "right": "Unit test" },
    { "left": "Lot-tracked products ask for a lot number on receipt", "right": "Functional test" },
    { "left": "Web shop orders arrive in Odoo with correct taxes and stock syncs back", "right": "Integration test" },
    { "left": "Sales coordinator accepts the repeat-order process for her team", "right": "UAT" },
    { "left": "Existing invoicing still works after the payment terms change", "right": "Regression test" },
    { "left": "A quotation without a customer cannot be saved", "right": "Negative test" }
  ],
  "explanation": "Pick the cheapest test that really proves the requirement: logic in one function is a unit test, one feature in one app is functional, anything crossing systems is integration, business acceptance is UAT, 'still works after a change' is regression, and 'must be prevented' is a negative test." }
\`\`\`

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

\`\`\`visual-check
{ "question": "The web shop integration test passes: the order appears in Odoo with correct products and taxes. What is the most important additional integration test?",
  "options": ["Check the order list view colours", "Send the same order message twice and stop the network mid-sync, then check for duplicates or half-created orders", "Re-test the same order ten more times", "Ask the web shop vendor to confirm it works"],
  "correct": 1,
  "explanation": "Happy-path success proves only one end of the story. Real integrations fail on retries, duplicates and timeouts, and those produce double orders or orphan records that nobody notices until stock or revenue is wrong." }
\`\`\`

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

\`\`\`visual-flow
{ "title": "Make to Order: integration points to verify",
  "caption": "Each arrow is a hand-over between apps. An integration test checks the record created on both sides of every hand-over.",
  "steps": [
    { "title": "Sales order confirmed", "app": "Sales", "icon": "cart", "document": "SO for 5 Oak Dining Table", "detail": "Check: delivery created, waiting for production." },
    { "title": "Manufacturing order", "app": "Manufacturing", "icon": "factory", "document": "MO for 5 tables", "detail": "Check: created automatically, components per BoM reserved.", "branch": { "when": "Components short", "result": "RFQ created in Purchase", "tone": "warning" } },
    { "title": "Produce", "app": "Manufacturing", "icon": "wrench", "detail": "Check: components consumed, 5 tables in stock.", "impact": "Valuation: components out, finished goods in" },
    { "title": "Deliver", "app": "Inventory", "icon": "truck", "detail": "Check: delivery Done, table stock back to 0." },
    { "title": "Invoice", "app": "Accounting", "icon": "invoice", "detail": "Check: revenue and receivable posted with correct tax.", "impact": "Dr Receivable, Cr Income, Cr Tax payable" }
  ] }
\`\`\`

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

\`\`\`visual-flow
{ "title": "Migration pipeline and where each test sits",
  "loop": "Repeat for each trial load until the reconciliation has zero unexplained differences",
  "steps": [
    { "title": "Extract", "icon": "database", "actor": "Data owner", "detail": "Export from legacy with record counts and control totals taken at the same moment." },
    { "title": "Transform", "icon": "settings", "actor": "Consultant", "detail": "Clean duplicates, map UoM, taxes, accounts and categories. Test: mapping table reviewed, excluded records listed with reasons." },
    { "title": "Load", "icon": "server", "app": "Odoo import", "detail": "Import templates into the test database. Test: import log has no failed rows or every failure is explained.", "branch": { "when": "Rows rejected", "result": "Fix source or mapping, reload", "tone": "warning" } },
    { "title": "Reconcile", "icon": "scale", "actor": "Finance", "detail": "Counts, control totals, sample checks, AR/AP/stock/TB agreement. Test: suspense account is 0.00.", "branch": { "when": "Difference found", "result": "Explain or fix before sign-off", "tone": "danger" } }
  ] }
\`\`\`

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

\`\`\`visual-match
{ "title": "Practice: which check catches which problem?",
  "prompt": "Match each migration problem to the validation technique that would catch it first.",
  "leftLabel": "Problem in the loaded data", "rightLabel": "Check that catches it",
  "pairs": [
    { "left": "One vendor silently failed to import because of an invalid country code", "right": "Record count per object" },
    { "left": "Open AR loaded as 480,120.75 instead of 482,350.75 because credit notes were skipped", "right": "Control total of open AR amounts" },
    { "left": "A product's UoM is 'Box of 10' instead of 'Units', but quantities and totals still match", "right": "Field-by-field sample check" },
    { "left": "The opening trial balance entry leaves 2,500.00 on the suspense account", "right": "Reconciliation to the legacy trial balance" }
  ],
  "explanation": "Counts prove completeness, control totals prove the sums, samples prove the individual fields, and reconciliation proves the balances. A UoM error can pass counts and totals, which is why random plus edge-case samples are mandatory." }
\`\`\`

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

\`\`\`visual-order
{ "title": "Practice: cutover load and reconcile",
  "prompt": "Put the opening-balance migration steps in the right order.",
  "items": ["Agree the legacy trial balance, AR and AP aging and stock valuation at the cutover date", "Load open customer invoices and vendor bills against the opening suspense account", "Load opening stock via inventory adjustment at the agreed unit cost", "Post the opening trial balance entry that clears the suspense account", "Check the suspense account is 0.00 and compare Odoo reports to legacy", "Finance signs off AR, AP, stock value and trial balance"],
  "explanation": "The legacy figures must be frozen first, otherwise you reconcile to a moving target. The opening TB entry comes after the detailed loads so it clears the suspense account; only a zero suspense balance proves every piece agrees." }
\`\`\`

\`\`\`visual-check
{ "question": "The count sheet shows Vendors: legacy 214, excluded 9 (duplicates merged), expected 205, actual 204. The go-live is next week. What is the correct action?",
  "options": ["Accept it: one vendor out of 205 is under 1%", "Find which vendor is missing and why, fix the source or mapping, and document the explanation", "Create the missing vendor manually after go-live", "Change the expected count to 204"],
  "correct": 1,
  "explanation": "Every difference must be explained. The missing vendor may have open bills worth thousands, so 'close enough' can mean an unpaid supplier and a wrong AP balance on day one." }
\`\`\`

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

\`\`\`visual-match
{ "title": "Practice: write the negative access tests",
  "prompt": "For each role in the matrix, match the action the test must prove they can NOT do.",
  "leftLabel": "Role", "rightLabel": "Must NOT be able to",
  "pairs": [
    { "left": "Salesperson (Own Documents Only)", "right": "Open another salesperson's sales order, even by URL" },
    { "left": "Sales Manager", "right": "Post a customer invoice" },
    { "left": "Buyer", "right": "Validate (post) a vendor bill" },
    { "left": "Warehouse Clerk", "right": "See product costs or open vendor bills" },
    { "left": "Accountant", "right": "Confirm a sales order" },
    { "left": "Portal customer", "right": "See invoices of other customers" }
  ],
  "explanation": "Each restriction is a segregation-of-duties control: the person who creates a commitment (order) must not also post the money side (invoice or bill). If a negative test passes as Allowed, the control does not exist." }
\`\`\`

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

\`\`\`visual-decision
{ "title": "Practice: evaluate an access test result",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Was the test executed while logged in as the dedicated role test user (not admin)?", "options": [ { "label": "Yes", "next": "q2" }, { "label": "No, as administrator", "next": "r1" } ] },
    "q2": { "question": "Is the result the same as the role matrix says?", "options": [ { "label": "Yes", "next": "q3" }, { "label": "No, the user can do MORE", "next": "r2" }, { "label": "No, the user can do LESS", "next": "r3" } ] },
    "q3": { "question": "Did you also try URL, search, smart buttons, reports and export?", "options": [ { "label": "Yes, all paths blocked", "next": "r4" }, { "label": "Only the menu and list", "next": "r5" } ] },
    "r1": { "result": "Invalid test: re-run as the role user", "tone": "warning", "detail": "Administrators bypass record rules and groups, so a pass proves nothing." },
    "r2": { "result": "Security defect: log as High or Critical", "tone": "danger", "detail": "Excess access breaks segregation of duties and will be an audit finding." },
    "r3": { "result": "Defect: user is blocked from their job", "tone": "warning", "detail": "Check missing groups or an over-strict record rule; severity depends on whether a workaround exists." },
    "r4": { "result": "Pass: record evidence per path", "tone": "success", "detail": "Note user, database, build and the paths tried." },
    "r5": { "result": "Not finished: test the remaining paths", "tone": "info", "detail": "A hidden menu does not stop a direct URL or an export." } } }
\`\`\`

## Multi-company testing

| Test | Expected |
|---|---|
| User with only Company A selects company switcher | Company B not available |
| User with A and B creates SO while only A active | SO belongs to A; uses A's taxes and journals |
| Inter-company product shared vs company-specific | Company-specific product not visible in other company |
| Reports run in Company A | Contain only Company A figures unless both selected |
| Inter-company rules (if configured) | SO in A creates PO in B (Enterprise-dependent; verify for your edition) |

\`\`\`visual-check
{ "question": "SEC-002 says Salesperson A must not see Salesperson B's orders. The list view hides them, but opening /odoo/sales/45 (B's order) shows the full order. What is the result of SEC-002?",
  "options": ["Pass, because the list view hides the order", "Fail: log a defect, the record rule does not protect all access paths", "Pass with a remark", "Not applicable, users do not type URLs"],
  "correct": 1,
  "explanation": "A record rule must protect the data, not just the menu. URLs are shared in emails and chats every day, so a hidden list with an open URL is a real data leak." }
\`\`\`

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

\`\`\`visual-check
{ "question": "Category 'Cables' uses automated valuation (FIFO). You receive 50 units at 20.00, then 50 units at 22.00, then deliver 60 units. What should the valuation report and the stock account show for these moves?",
  "options": ["40 units, 800.00", "40 units, 880.00", "40 units, 840.00", "60 units, 1,260.00"],
  "correct": 1,
  "explanation": "FIFO consumes the oldest layer first: 50 x 20.00 + 10 x 22.00 = 1,220.00 leaves stock. Remaining 40 units are from the 22.00 layer, so 880.00. Receipts posted 2,100.00, deliveries took 1,220.00, net 880.00 on the stock account: subledger and GL agree." }
\`\`\`

\`\`\`visual-order
{ "title": "Practice: stock count test case",
  "prompt": "Put the steps of a stock-count test (TC-INV-007: count finds 3 missing Oak Dining Chairs) in order.",
  "items": ["Note on-hand quantity (25) and the stock account balance before the count", "Inventory > Operations > Physical Inventory: set counted quantity 22 for WH/Stock", "Apply the count with reason 'Annual count'", "Check on-hand is now 22 and a stock move to the inventory loss location exists", "Check the journal entry: credit stock valuation, debit inventory loss/adjustment expense for 3 x unit cost", "Re-run the valuation report and confirm it still equals the stock account balance"],
  "explanation": "Recording the before figures is what makes the test measurable. The last step is the real reconciliation test: a count that changes quantity without posting the value would quietly break stock vs GL agreement." }
\`\`\`

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

\`\`\`visual-match
{ "title": "Practice: diagnose the difference",
  "prompt": "Each reconciliation failed with this symptom. Match it to the most likely cause.",
  "leftLabel": "Symptom", "rightLabel": "Likely cause",
  "pairs": [
    { "left": "Stock account is 2,500.00 higher than the valuation report; one journal entry on the stock account has no stock move", "right": "Manual journal entry posted directly to the stock account" },
    { "left": "Valuation report includes stock from before 1 March but the GL has no entry for it", "right": "Category switched from manual to automated valuation mid-stream" },
    { "left": "Report total matches only after adding a second stock account", "right": "Categories use different stock valuation accounts" },
    { "left": "Aged Receivable is 640.00 lower than the receivable account; one entry has no partner", "right": "Manual receivable entry posted without a partner" },
    { "left": "Totals agree but a paid customer still shows an old overdue invoice and a credit", "right": "Payment posted but not reconciled with the invoice" }
  ],
  "explanation": "Most differences are not software bugs: they come from postings that bypass the subledger, configuration changes during testing, or incomplete comparisons. Knowing the pattern tells you where to look first." }
\`\`\`

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

\`\`\`visual-order
{ "title": "Practice: month-end close test case",
  "prompt": "Put the steps of the month-end close test (TC-R2R-003, closing April at Crestline Furniture) in order.",
  "items": ["Check all April receipts, deliveries, invoices and bills are posted", "Reconcile the bank journal to the April statement closing balance", "Run REC-01 to REC-03: stock, AR and AP subledgers vs GL", "Run the tax report and compare it to the tax accounts", "Set the lock date to 30 April", "Try to post a test invoice dated 28 April and confirm it is blocked"],
  "explanation": "Reconciliations only mean something once every transaction is posted. The lock date comes after the checks, and the final negative step proves the lock really protects the closed period." }
\`\`\`

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

\`\`\`visual-timeline
{ "title": "A UAT cycle at Crestline Furniture",
  "items": [
    { "when": "Week -2", "title": "Prepare", "icon": "clipboard", "detail": "SIT exit met, key users trained, UAT database refreshed with migrated data, scripts handed over." },
    { "when": "Day 1", "title": "Kick-off", "icon": "flag", "detail": "Objectives, schedule, how to log defects, defect vs change request." },
    { "when": "Days 1-8", "title": "Execute", "icon": "users", "detail": "Consultant demonstrates the first script; key users run the rest and their day-in-the-life scenarios." },
    { "when": "Daily 9:00", "title": "Triage", "icon": "filter", "detail": "Review new defects, set severity and priority, separate change requests." },
    { "when": "Days 9-12", "title": "Retest", "icon": "refresh", "detail": "Key users retest fixed defects with the same data; related regression is re-run." },
    { "when": "Day 13", "title": "Sign-off", "icon": "signature", "detail": "Process owners sign: accepted, accepted with conditions, or rejected." }
  ] }
\`\`\`

### Defect vs change request

| Situation | Classification |
|---|---|
| Invoice tax is wrong compared to agreed design | Defect |
| User now wants an extra field not in requirements | Change request (scope) |
| Report layout differs from approved mock-up | Defect |
| User prefers old screen layout | Training / change management |

\`\`\`visual-match
{ "title": "Practice: classify UAT findings",
  "prompt": "Key users logged these findings. Match each one to its correct classification.",
  "leftLabel": "Finding", "rightLabel": "Classification",
  "pairs": [
    { "left": "Invoice for Blue Harbor Traders charges 18% tax; the signed design says 15%", "right": "Defect" },
    { "left": "Warehouse lead now wants a 'Pallet ID' field that was never in the requirements", "right": "Change request" },
    { "left": "Accountant cannot find the partner ledger and says Odoo has no such report", "right": "Training issue" },
    { "left": "Standard Odoo shows a credit limit warning, the business wanted a hard block", "right": "Gap (needs a decision or customisation)" }
  ],
  "explanation": "Classifying correctly protects the timeline: defects are fixed within scope, change requests go to change control, training issues are solved by coaching, and gaps need a business decision. Treating a change request as a defect is the classic way UAT never ends." }
\`\`\`

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

\`\`\`visual-roleplay
{ "title": "The key user who will not sign",
  "setting": "Crestline Furniture, UAT day 13. O2C scripts: 18 executed, 17 passed. The only open defect is DEF-044 (Low, logo alignment on the delivery slip). The sales coordinator refuses to sign the O2C form.",
  "client": "Sales coordinator",
  "rounds": [
    { "says": "I'm not signing. I just don't feel ready with this system.",
      "options": [
        { "text": "Everything passed, so you have to sign today.", "quality": "poor", "feedback": "Pressure turns a worried key user into an opponent and a forced signature means nothing at go-live." },
        { "text": "That's important to hear. Which part of your daily work worries you most? Let's look at it together.", "quality": "best", "feedback": "Turns a feeling into concrete items you can test, train or log." },
        { "text": "Fine, I'll tell the project manager you rejected UAT.", "quality": "poor", "feedback": "Escalating before understanding the concern wastes the chance to solve it." } ] },
    { "says": "Credit notes for partial returns. I did it once with you and I'm not sure I can do it alone.",
      "options": [
        { "text": "Let's run UAT-SAL-07 again now, and you drive while I only watch.", "quality": "best", "feedback": "A user-executed retest builds confidence and gives real evidence." },
        { "text": "It's in the manual, page 40.", "quality": "ok", "feedback": "Documentation helps, but confidence comes from doing it." },
        { "text": "That's not a defect, so it doesn't count.", "quality": "poor", "feedback": "True, but dismissive: it is a training issue that still blocks sign-off." } ] },
    { "says": "OK, that worked. But the logo on the delivery slip is still wrong.",
      "options": [
        { "text": "We can sign as Accepted with conditions: DEF-044 fixed within 2 weeks of go-live, written on the form.", "quality": "best", "feedback": "Uses the formal option for a Low cosmetic defect and records the commitment." },
        { "text": "I'll fix it tonight in production directly.", "quality": "poor", "feedback": "Untested production changes break change control." } ] }
  ],
  "wrapup": "A refusal is information. Find the concrete concern, let the user prove it by doing, and use 'Accepted with conditions' for agreed Low defects." }
\`\`\`

## Common UAT pitfalls

| Pitfall | Prevention |
|---|---|
| Users not trained before UAT | Run training sessions before UAT starts |
| UAT on empty database | Load migrated master data first |
| Consultants execute scripts for users | Users must execute; consultants only guide |
| Scope creep disguised as defects | Classify change requests separately |
| No sign-off, just "looks fine" | Formal signed form per process |

\`\`\`visual-check
{ "question": "To keep the UAT schedule, the consultant offers to execute the remaining 12 P2P scripts himself overnight and give the results to the buyer to sign. Why is this a problem?",
  "options": ["It is not a problem if the results are correct", "UAT proves the business can run its process; if users do not execute, there is no acceptance and no confidence at go-live", "Consultants are not allowed to log in to the UAT database", "Scripts must always be run during office hours"],
  "correct": 1,
  "explanation": "The value of UAT is that the people who will run the process prove they can, with their own exceptions. A consultant-executed UAT is just another SIT cycle and hides training gaps until the first week of go-live." }
\`\`\`

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

\`\`\`visual-decision
{ "title": "Practice: what must be re-tested after this change?",
  "start": "q1",
  "nodes": {
    "q1": { "question": "What kind of change is it?", "options": [ { "label": "Bug fix in one module", "next": "q2" }, { "label": "New customization or field", "next": "q3" }, { "label": "Major version upgrade", "next": "r3" }, { "label": "Minor Odoo update / patch", "next": "r4" } ] },
    "q2": { "question": "Does the fixed code or config touch shared data (partners, products, taxes, accounts)?", "options": [ { "label": "No", "next": "r1" }, { "label": "Yes", "next": "r2" } ] },
    "q3": { "question": "Is the new field mandatory, or used by an integration, import or report?", "options": [ { "label": "No", "next": "r1" }, { "label": "Yes", "next": "r5" } ] },
    "r1": { "result": "Retest the failed case + its own process", "tone": "success", "detail": "Plus directly connected steps, e.g. a delivery fix also re-runs invoicing." },
    "r2": { "result": "Retest the process + every flow using that data", "tone": "warning", "detail": "A tax fix affects sales, purchase, POS and the tax report." },
    "r3": { "result": "Full regression pack + all customizations, reports, integrations", "tone": "danger", "detail": "Compare trial balance, aged AR and stock valuation before and after on the same data." },
    "r4": { "result": "Smoke tests on O2C, P2P, inventory and accounting", "tone": "info", "detail": "Plus customizations that override standard methods." },
    "r5": { "result": "Affected processes + every entry channel", "tone": "warning", "detail": "UI, website, import templates, API and the printed report: a mandatory field can silently block web orders." } } }
\`\`\`

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

\`\`\`visual-compare
{ "title": "Manual vs automated regression",
  "columns": ["Manual regression", "Automated tests"],
  "rows": [
    { "label": "Speed per run", "values": ["Hours to days", "Minutes"] },
    { "label": "Cost to create", "values": ["Low: reuse test cases", "Higher: developer writes the test"] },
    { "label": "Cost per repeat run", "values": ["High: people time every time", "Near zero"] },
    { "label": "Judges business sense (is this invoice reasonable?)", "values": [true, false] },
    { "label": "Catches UI and layout surprises", "values": [true, "Only with tours"] },
    { "label": "Runs on every build (e.g. Odoo.sh)", "values": [false, true] },
    { "label": "Best for", "values": ["UAT-style flows, reports, new changes", "Custom logic, pricing, integrations with mocks"] }
  ],
  "highlight": 1,
  "caption": "Use both: automate the stable, repeatable checks of custom code and keep a manual pack for business outcomes." }
\`\`\`

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

\`\`\`visual-check
{ "question": "A developer fixes DEF-052 (landed cost allocation by weight). The failed test case now passes. What else must be run before deploying to production?",
  "options": ["Nothing, the defect is fixed", "Related regression: receipts with and without landed costs, stock valuation report vs stock account, and vendor bills for the same products", "The full 160-case SIT pack", "Only the automated tests"],
  "correct": 1,
  "explanation": "A fix to landed costs changes stock layer values, so receipt, valuation and bill flows that touch the same data can break. Running related regression is proportional; the full pack is for upgrades, not single fixes." }
\`\`\`

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

\`\`\`visual-match
{ "title": "Practice: input and expected system response",
  "prompt": "Match each invalid input to the expected behaviour agreed for Silverline Trading Co. (Odoo 17).",
  "leftLabel": "Invalid input", "rightLabel": "Expected response",
  "pairs": [
    { "left": "Save a quotation with no customer", "right": "Save blocked; Customer field highlighted as required" },
    { "left": "Post an invoice dated 15 March when the lock date is 31 March", "right": "Posting blocked with a lock date error" },
    { "left": "Second bill from Northwind Components with the same bill reference", "right": "Duplicate reference warning before posting" },
    { "left": "SO of 1,000.00 for Maple Street Electricals (limit 5,000.00, open AR 4,500.00)", "right": "Credit limit warning shown; order can still be confirmed" },
    { "left": "Web shop sends an order with an unknown product code", "right": "Message logged as failed and an alert is sent; nothing created" }
  ],
  "explanation": "The expected response must be agreed before testing: block, warn or log. In standard Odoo 17 the credit limit is a warning, not a block; if the business assumed a block, that is a gap to decide on, not a defect." }
\`\`\`

## Boundary value testing

Test **at**, **just below** and **just above** limits:

| Rule | Test values |
|---|---|
| Approval needed above 10,000.00 | 9,999.99 / 10,000.00 / 10,000.01 |
| Credit limit 5,000.00 | Exposure 4,999.99 / 5,000.00 / 5,000.01 |
| Discount max 15% | 14.99% / 15% / 15.01% |

Clarify whether the limit is inclusive — a common requirement ambiguity.

\`\`\`visual-check
{ "question": "Requirement: 'Quotations above 10,000.00 need manager approval.' Which set of test values is the best boundary test?",
  "options": ["5,000.00 and 20,000.00", "9,999.99, 10,000.00 and 10,000.01", "10,000.00 only", "0.00 and 99,999.99"],
  "correct": 1,
  "explanation": "Errors cluster at the edges: a developer may code 'greater or equal' instead of 'greater than'. Testing just below, at and just above the limit reveals that, and 10,000.00 itself must NOT need approval because the rule says 'above'." }
\`\`\`

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

\`\`\`visual-dodont
{ "title": "Negative testing: do and don't",
  "do": ["Agree block, warn, approve or allow with the business before running the test", "Test at, just below and just above every numeric limit", "Check that a blocked action left no half-created record behind", "Pair every happy-path case with at least one negative case", "Record the actual message text as evidence"],
  "dont": ["Assume Odoo blocks something because the requirement says 'must not'", "Mark a warning as Fail when the agreed behaviour was a warning", "Test only with the administrator, who bypasses many controls", "Log a standard-behaviour gap as a defect: raise a change request", "Stop after the first invalid value works as expected"] }
\`\`\`

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

\`\`\`visual-match
{ "title": "Practice: set the severity",
  "prompt": "Crestline Furniture UAT logged these defects. Match each to its severity.",
  "leftLabel": "Defect", "rightLabel": "Severity",
  "pairs": [
    { "left": "Customer invoices post revenue to the Bank suspense account instead of Product Sales", "right": "Critical: financial data is silently wrong" },
    { "left": "Deliveries for lot-tracked tables cannot be validated at all", "right": "Critical: process blocked, no workaround" },
    { "left": "Wrong 18% tax on the whole Outdoor Furniture category", "right": "High: major function wrong, workaround hard" },
    { "left": "Aged Payable takes 90 seconds to load; filtering by vendor works fast", "right": "Medium: works, with a reasonable workaround" },
    { "left": "Typo 'Delivey Address' on the delivery slip PDF", "right": "Low: cosmetic" }
  ],
  "explanation": "Severity measures business impact, not how annoying it is. Wrong accounting with no error message is Critical because it corrupts the books and is found only at month end; a blocked delivery stops shipping. A slow report with a workaround is Medium, a typo is Low." }
\`\`\`

\`\`\`visual-decision
{ "title": "Practice: triage a new defect",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is it really a defect (agreed design not met)?", "options": [ { "label": "Yes", "next": "q2" }, { "label": "No, it is a new wish", "next": "r0" } ] },
    "q2": { "question": "Does it block a process or corrupt financial or stock data?", "options": [ { "label": "Yes", "next": "q3" }, { "label": "No", "next": "q4" } ] },
    "q3": { "question": "Is there a safe, documented workaround?", "options": [ { "label": "No", "next": "r1" }, { "label": "Yes", "next": "r2" } ] },
    "q4": { "question": "Is a main function wrong, or only cosmetic?", "options": [ { "label": "Function wrong, easy workaround", "next": "q5" }, { "label": "Cosmetic only", "next": "q6" } ] },
    "q5": { "question": "Is the process used in the first weeks after go-live?", "options": [ { "label": "Yes", "next": "r3" }, { "label": "No, e.g. year-end only", "next": "r4" } ] },
    "q6": { "question": "Will customers or management see it soon?", "options": [ { "label": "Yes", "next": "r5" }, { "label": "No", "next": "r6" } ] },
    "r0": { "result": "Reject as defect, raise a change request", "tone": "info", "detail": "Goes to change control with business reason and estimate." },
    "r1": { "result": "Critical, P1: blocks go-live", "tone": "danger", "detail": "Fix and retest before any sign-off." },
    "r2": { "result": "High, P1 or P2", "tone": "warning", "detail": "Workaround documented and trained; fix before go-live unless steering accepts the risk in writing." },
    "r3": { "result": "Medium, P2", "tone": "warning", "detail": "Fix in the current cycle; workaround in the user guide." },
    "r4": { "result": "Medium, P3", "tone": "info", "detail": "Plan the fix before the period when it is needed." },
    "r5": { "result": "Low severity, high priority", "tone": "info", "detail": "Quick fix, e.g. logo or label on the invoice PDF." },
    "r6": { "result": "Low, P4: can be deferred", "tone": "success", "detail": "Accept with conditions on the sign-off form." } } }
\`\`\`

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

\`\`\`visual-flow
{ "title": "Defect lifecycle",
  "loop": "Reopened defects go back to In Progress until the retest passes",
  "steps": [
    { "title": "New", "icon": "alert", "actor": "Tester", "detail": "Logged with steps, expected, actual, evidence and environment." },
    { "title": "Triaged / Assigned", "icon": "filter", "actor": "Test lead", "detail": "Severity and priority confirmed, owner assigned.", "branch": { "when": "Not a defect or duplicate", "result": "Rejected", "tone": "neutral" } },
    { "title": "In Progress", "icon": "wrench", "actor": "Consultant / developer", "detail": "Root cause found and fixed in development.", "branch": { "when": "Steering accepts risk", "result": "Deferred", "tone": "warning" } },
    { "title": "Fixed / Ready for Retest", "icon": "rocket", "actor": "Developer", "detail": "Fix deployed to the test environment; build noted." },
    { "title": "Retest", "icon": "refresh", "actor": "Tester", "detail": "Same data and steps, plus related regression.", "branch": { "when": "Retest fails", "result": "Reopened", "tone": "danger" } },
    { "title": "Closed", "icon": "check", "actor": "Tester", "detail": "Verified fixed on a recorded build." }
  ] }
\`\`\`

\`\`\`visual-match
{ "title": "Practice: who moves the defect?",
  "prompt": "Match each status change to the person who owns it.",
  "leftLabel": "Status change", "rightLabel": "Owner",
  "pairs": [
    { "left": "Log as New with evidence", "right": "Tester / key user" },
    { "left": "Confirm severity and assign", "right": "Test lead" },
    { "left": "Move to Fixed / Ready for Retest", "right": "Developer or consultant" },
    { "left": "Close or Reopen after retest", "right": "The tester who found it" },
    { "left": "Defer to after go-live", "right": "Steering committee / project manager" }
  ],
  "explanation": "Separation matters here too: the developer who fixed it must not close it, because only an independent retest proves the fix. Deferring is a business risk decision, so it belongs to steering, not to the team." }
\`\`\`

### Retest and regression

When a fix is delivered:

1. **Retest** the failed test case with the same data and steps.
2. Run **related regression** cases — a fix can break neighbouring functionality.
3. Record the build/version where the fix was verified.

## Triage meeting

Run daily during SIT/UAT: review new defects, confirm severity/priority, assign owners, separate change requests, check ageing defects. Keep it short (15–30 minutes).

\`\`\`visual-roleplay
{ "title": "Pressure to downgrade before go-live",
  "setting": "Crestline Furniture, triage meeting three days before go-live. DEF-052 (High): landed costs are allocated by quantity instead of weight, so stock values of imported tables are wrong. Exit criteria say: no open Critical or High defects.",
  "client": "Project manager",
  "rounds": [
    { "says": "Let's just mark DEF-052 as Medium so we meet the exit criteria. Nobody will notice.",
      "options": [
        { "text": "OK, it's your call as PM.", "quality": "poor", "feedback": "Changing severity to pass a gate hides the risk from the people who must accept it, and wrong stock values will reach the balance sheet." },
        { "text": "Severity is about impact, and this misstates stock and COGS. I can't change it, but we can take it to steering as a go-live risk decision.", "quality": "best", "feedback": "Keeps the classification honest and moves the decision to the right owner." },
        { "text": "I'll refuse to work on go-live until it's fixed.", "quality": "poor", "feedback": "Inflexible; it removes you from the solution instead of offering options." } ] },
    { "says": "Steering will panic. What options do we actually have?",
      "options": [
        { "text": "Option 1: fix and retest in 2 days. Option 2: go live, finance books a manual landed cost correction monthly until the fix, with a REC-01 check each month-end.", "quality": "best", "feedback": "Gives costed options with a control, so steering can make a real decision." },
        { "text": "We'll just fix it after go-live somehow.", "quality": "poor", "feedback": "No plan, no owner, no control: that is how wrong valuations stay for months." } ] },
    { "says": "Fine. If steering picks option 2, what do you need from me?",
      "options": [
        { "text": "Record it as Deferred with steering's written approval, the workaround owner and a fix date on the go-live checklist.", "quality": "best", "feedback": "A deferred defect is legitimate only when the risk acceptance is documented and owned." },
        { "text": "Nothing, I'll remember it.", "quality": "ok", "feedback": "Good intent, but undocumented risk acceptance protects nobody when the auditor asks." } ] }
  ],
  "wrapup": "Never bend severity to meet a gate. Keep the facts honest, offer options with controls, and let steering accept the risk in writing." }
\`\`\`

## Test metrics

| Metric | Formula | Use |
|---|---|---|
| Execution progress | Executed / Planned | Are we on schedule? |
| Pass rate | Passed / Executed | Quality indicator |
| Defect density | Defects / Test cases (or per process) | Where problems cluster |
| Open defects by severity | Count | Go-live readiness |
| Defect ageing | Days open | Bottlenecks |
| Reopen rate | Reopened / Fixed | Quality of fixes |

\`\`\`visual-check
{ "question": "SIT Cycle 2: planned 160, executed 158, passed 149. Of 40 fixed defects, 8 were reopened. Which statement is correct?",
  "options": ["Pass rate 93.1% and reopen rate 5%", "Pass rate 94.3% and reopen rate 20%: fixes are not being tested well before handover", "Pass rate 98.8% and reopen rate 8%", "Pass rate 94.3% and reopen rate 80%"],
  "correct": 1,
  "explanation": "Pass rate is passed / executed = 149 / 158 = 94.3% (not / planned). Reopen rate is 8 / 40 = 20%, which is high: one fix in five fails retest, so developers should test fixes better and the team should expect extra retest time." }
\`\`\`

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
