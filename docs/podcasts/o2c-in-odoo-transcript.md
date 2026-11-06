# Order to Cash in Odoo — a consultant's conversation

nexusEPM Consultant Podcast · about 8 minutes

- **Priya**: Host, nexusEPM Academy
- **Arjun**: Odoo functional consultant

## Transcript

**Priya:** Welcome to the nexusEPM Consultant Podcast. I'm Priya, and today we're talking about the process every business runs, whether it knows it or not: Order to Cash. With me is Arjun, an Odoo functional consultant. Arjun, welcome.

**Arjun:** Thanks, Priya. Happy to be here. Order to Cash is my favourite process to explain, because if you understand it, you understand half of Odoo.

**Priya:** Let's start simple. What is Order to Cash?

**Arjun:** It's the full revenue cycle. From the first contact with a prospect, through the quotation, the sales order, delivery, the invoice, the customer payment, and finally matching that payment to the bank statement. The business only has its money at the very end, so every step in between matters.

**Priya:** And in Odoo, that's not one app, is it?

**Arjun:** No, and that's the point. It's four apps sharing one database: CRM, Sales, Inventory and Accounting. Each step creates the next document automatically, so nobody retypes anything. Let's follow our training company, Northwind, through it.

**Priya:** Okay. A prospect fills in the contact form on Northwind's website. What happens?

**Arjun:** If Leads are enabled in the CRM settings, that form creates a lead. A salesperson qualifies it, and if it's real, they click Convert to Opportunity. Now it sits in the pipeline, the Kanban view, with an expected revenue and a probability. Nothing has touched the accounts yet. It's only a forecast.

**Priya:** Before we quote, there's the customer record. Why do consultants care so much about it?

**Arjun:** Because the customer master drives everything later. The payment terms decide the due date. The pricelist decides the price. The fiscal position decides which taxes apply. Get the customer wrong, and every invoice after it is wrong. If credit control matters, you also switch on the credit limit setting in Accounting and set a limit on the customer.

**Priya:** Then the quotation.

**Arjun:** From the opportunity you click New Quotation. You can use quotation templates and optional products, and send it by email with a portal link, so the customer can sign and even pay online. A common misunderstanding: a quotation does not reserve stock. Nothing is held until the order is confirmed.

**Priya:** So confirming is the big moment.

**Arjun:** It is. When the customer accepts, you click Confirm, and the quotation becomes a sales order. For storable products, Odoo creates a delivery order straight away. You'll see the Delivery smart button on the order. Stock is reserved based on the reservation method, by default at confirmation if it's available. But here's what surprises people: there's still no journal entry. Confirming an order is a commitment, not revenue.

**Priya:** Over to the warehouse.

**Arjun:** The picker opens the delivery, sets the quantities and clicks Validate. If they can only ship part of it, Odoo offers a backorder for the rest. On-hand stock goes down. And if the company uses automated, perpetual valuation, now we get our first journal entry: the stock value moves out of inventory into an interim stock output account, at cost.

**Priya:** And then we invoice. But when? After delivery, or straight after the order?

**Arjun:** That's the invoicing policy, and it's one of the first questions I ask in discovery. Invoice on ordered quantities, and you can bill as soon as the order is confirmed, which is typical for services or prepayments. Invoice on delivered quantities, and you can only bill what has actually shipped. For physical goods, delivered quantities protects the customer and the business. You set a default in the Sales settings, and you can override it per product.

**Priya:** What does posting the invoice do in the books?

**Arjun:** Debit accounts receivable for the gross amount, credit revenue for the net amount, and credit output tax. In India, that's your GST. With Anglo-Saxon accounting, posting the invoice also recognises the cost of goods sold, so revenue and cost land in the same period. That's the matching principle, built in.

**Priya:** Now the customer pays.

**Arjun:** On the invoice you click Register Payment. In Odoo 17, that posts to an outstanding receipts account, and the invoice shows In Payment, not Paid. That confuses everyone the first time.

**Priya:** Why not Paid?

**Arjun:** Because the money isn't confirmed until it shows up on the bank statement. So the last step is bank reconciliation. You import or sync the statement, and in the reconciliation screen you match the bank line to the payment. Only then does the invoice turn Paid. Reconciliation models can automate the repeat matches. One caution: the full reconciliation widget is in Enterprise. Community's Invoicing app doesn't have it. Odoo 18 also makes the outstanding account optional, so always check the behaviour in the version your client runs.

**Priya:** Where do Order to Cash projects usually go wrong?

**Arjun:** Three places. First, bad customer master data: wrong taxes, wrong terms. Second, the wrong invoicing policy, so you bill goods that never shipped. Third, nobody owns reconciliation, so invoices sit at In Payment for months and the receivables report can't be trusted.

**Priya:** And how does a business know its Order to Cash is healthy?

**Arjun:** I watch a handful of numbers. Quotation win rate. On-time delivery. Order-to-invoice cycle time, meaning how many days from confirmation to invoice. And Days Sales Outstanding, how long it takes customers to pay. If DSO keeps rising, the cash isn't coming in, however good the sales look.

**Priya:** Last question. One piece of advice for a new consultant learning this?

**Arjun:** Run the whole cycle yourself, end to end, in a test database, and open the journal entries at every step. Once you can predict which entry Odoo will post before you click, you're ready to explain it to a client.

**Priya:** Lead to opportunity, quotation to order, delivery to invoice, payment to the bank. Arjun, thank you.

**Arjun:** Thank you, Priya.

**Priya:** You can practise every step in the Order to Cash process walkthrough and the Odoo Sales course here in the nexusEPM Academy. See you next time.
