import type { CourseContent } from "../types";

/**
 * Integration Fundamentals (Integration Lab, course 1).
 *
 * Every code example reads secrets from environment variables and is meant to
 * run only against a training/test database. Odoo 19 introduced a new JSON-2
 * external API; the legacy XML-RPC / JSON-RPC endpoints are deprecated there.
 */

const DOC_EXTERNAL_API = "https://www.odoo.com/documentation/17.0/developer/reference/external_api.html";
const DOC_DEV = "https://www.odoo.com/documentation/17.0/developer.html";

export const integrationFundamentals: CourseContent = {
  slug: "integration-fundamentals",
  section: "integration-lab",
  title: "Integration Fundamentals",
  summary:
    "Learn to design, build and support safe integrations between Odoo and other systems: REST and HTTP, JSON and XML, authentication, secrets management, webhooks, Postman testing, the Odoo external API (XML-RPC, JSON-RPC and the newer JSON-2 API), common business integrations, middleware, error handling, retries and idempotency.",
  level: "advanced",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (19.0 API notes)",
  position: 1,
  skills: [
    "REST and HTTP",
    "JSON and XML",
    "API authentication",
    "Secrets management",
    "Webhooks",
    "Postman",
    "Odoo external API",
    "Integration design",
    "Error handling and retries",
    "Idempotency and reconciliation",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    /* Module 1: API foundations                                           */
    /* ------------------------------------------------------------------ */
    {
      title: "API foundations",
      lessons: [
        {
          slug: "rest-and-http-fundamentals",
          title: "REST fundamentals, HTTP methods and status codes",
          durationMin: 35,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Sunrise Office Supplies runs Odoo for sales, inventory and accounting, but also a web shop, a shipping carrier portal, a payment provider and a CRM used by its field team. Each of these systems needs to exchange data with Odoo. Almost all modern systems do that through **web APIs over HTTP**, most of them following the **REST** style. A consultant who understands HTTP can read API documentation, design integrations and diagnose failures without waiting for a developer.

> **Safety first:** every exercise in this course runs against a **training or test database** only, with credentials stored in environment variables. Never point a training script at production, and never expose API keys in frontend code, repositories or documents.

## What is an API?

An **Application Programming Interface** is a contract that lets one program ask another to do something or return data. A web API uses HTTP: the client sends a **request** to a URL, the server returns a **response**.

\`\`\`visual-flow
{
  "title": "Request and response",
  "steps": [
    {
      "title": "Client sends an HTTP request",
      "icon": "globe",
      "app": "Web shop"
    },
    {
      "title": "Server processes it",
      "icon": "server",
      "app": "Odoo / middleware"
    },
    {
      "title": "HTTP response returns to the client",
      "icon": "refresh",
      "app": "Web shop"
    }
  ]
}
\`\`\`

## Anatomy of an HTTP request

\`\`\`http
POST /api/v1/orders HTTP/1.1
Host: shop.example.com
Content-Type: application/json
Authorization: Bearer <token-from-secret-store>
Idempotency-Key: 7f3c9a2e-0d1b-4c55-9a77-1b2f0e6d9a10

{"customer_email": "buyer@example.com", "lines": [{"sku": "DESK-120", "qty": 2}]}
\`\`\`

| Part | Example | Purpose |
|------|---------|---------|
| Method | \`POST\` | What action to perform |
| URL / path | \`/api/v1/orders\` | Which resource |
| Query string | \`?limit=50&page=2\` | Filters, paging |
| Headers | \`Content-Type\`, \`Authorization\` | Metadata, credentials |
| Body | JSON document | Data sent to the server |

## REST principles in practice

REST (Representational State Transfer) organises an API around **resources** identified by URLs:

| Resource | URL |
|----------|-----|
| All customers | \`/api/customers\` |
| One customer | \`/api/customers/42\` |
| Orders of a customer | \`/api/customers/42/orders\` |

Characteristics: stateless requests (each carries its own authentication), standard methods, standard status codes, usually JSON bodies.

## HTTP methods

| Method | Meaning | Safe (no change)? | Idempotent? | Typical use |
|--------|---------|-------------------|-------------|-------------|
| \`GET\` | Read | Yes | Yes | Fetch customers |
| \`POST\` | Create / trigger action | No | **No** | Create an order |
| \`PUT\` | Replace a resource | No | Yes | Replace an address |
| \`PATCH\` | Partially update | No | Usually not guaranteed | Change a phone number |
| \`DELETE\` | Remove | No | Yes | Delete a draft |

**Idempotent** means repeating the same request has the same effect as sending it once. This matters enormously for retries: retrying a \`GET\` is harmless, retrying a \`POST /orders\` may create a duplicate order unless the API supports idempotency keys. We return to this in the error-handling lesson.

## HTTP status codes

| Code | Name | What it tells you | Retry? |
|------|------|-------------------|--------|
| 200 | OK | Success with body | - |
| 201 | Created | Resource created | - |
| 204 | No Content | Success, empty body | - |
| 400 | Bad Request | Invalid data or format | No - fix the request |
| 401 | Unauthorized | Missing/invalid credentials | No - fix credentials |
| 403 | Forbidden | Authenticated but not allowed | No - fix permissions |
| 404 | Not Found | Wrong URL or record | No |
| 409 | Conflict | Duplicate or version conflict | Usually no - investigate |
| 422 | Unprocessable Entity | Validation failed | No |
| 429 | Too Many Requests | Rate limit hit | Yes, after the \`Retry-After\` delay |
| 500 | Internal Server Error | Server bug | Maybe, limited |
| 502 / 503 / 504 | Gateway / unavailable / timeout | Temporary infrastructure issue | Yes, with backoff |

Rule of thumb: **4xx = the client must change something; 5xx and 429 = may be temporary.**

> **Consultant tip:** In an integration specification, always list which status codes the receiving system returns and what your integration does for each. "What happens on 409?" is a question that prevents duplicate invoices.

## Calling an API from Python

\`\`\`python
import os

import requests

BASE_URL = os.environ["SHOP_API_URL"]          # e.g. a sandbox URL
TOKEN = os.environ["SHOP_API_TOKEN"]           # never hard-code

response = requests.get(
    f"{BASE_URL}/api/v1/customers",
    params={"limit": 5},
    headers={"Authorization": f"Bearer {TOKEN}", "Accept": "application/json"},
    timeout=30,
)
print(response.status_code)
response.raise_for_status()      # raises for 4xx/5xx
for customer in response.json()["items"]:
    print(customer["id"], customer["email"])
\`\`\`

Always set a **timeout**; without one a hung connection can block your sync forever.

## Exercise

1. Using a public test API (for example a mock server your trainer provides), send a \`GET\` and a \`POST\`.
2. Record method, URL, headers (mask tokens), status code and response time.
3. Deliberately send invalid JSON and record the status code.
4. Fill a table mapping each status code you saw to the action your integration should take.

**Expected output:** a small table such as:

| Request | Status | Action |
|---------|--------|--------|
| GET /customers | 200 | Process |
| POST /orders (bad JSON) | 400 | Log, alert, do not retry |
| GET /orders/999999 | 404 | Log, mark record as missing |

## Key takeaways

- HTTP request = method + URL + headers + body; response = status + headers + body.
- REST organises APIs around resources and standard methods.
- \`GET\`, \`PUT\`, \`DELETE\` are idempotent; \`POST\` is not.
- 4xx means fix the request; 429 and 5xx may be retried with backoff.
- Always use timeouts and keep tokens out of code.`,
          flashcards: [
            { term: "REST", definition: "An API style organised around resources identified by URLs and manipulated with standard HTTP methods." },
            { term: "Idempotent", definition: "An operation that has the same effect whether it is performed once or many times; essential for safe retries." },
            { term: "HTTP 401 vs 403", definition: "401: not authenticated (missing/invalid credentials). 403: authenticated but not permitted." },
            { term: "HTTP 429", definition: "Too Many Requests: a rate limit was hit; wait (Retry-After) and retry with backoff." },
            { term: "Timeout", definition: "Maximum time a client waits for a response; always set one to avoid hung integrations." },
            { term: "Webhook", definition: "An HTTP call a system sends to your endpoint when an event happens (push instead of polling)." },
            { term: "Exponential backoff", definition: "Retry strategy where the wait doubles after each failed attempt, usually with random jitter." },
          ],
          resources: [{ title: "Odoo 17 External API", kind: "link", url: DOC_EXTERNAL_API }],
        },
        {
          slug: "json-and-xml",
          title: "JSON and XML data formats",
          durationMin: 30,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Sunrise's web shop sends orders as JSON, its bank provides statements in an XML format, and Odoo's legacy external API uses XML-RPC. Integration consultants spend much of their time **mapping fields between formats**. Understanding structure, data types and encoding avoids the classic bugs: wrong decimals, lost accents, swapped dates.

## JSON

JSON (JavaScript Object Notation) is the default format for REST APIs.

\`\`\`json
{
  "order_ref": "WEB-10045",
  "created_at": "2024-05-14T09:30:00Z",
  "customer": {
    "email": "buyer@example.com",
    "name": "Élodie Martin",
    "vat": null
  },
  "lines": [
    {"sku": "DESK-120", "qty": 2, "unit_price": 249.90},
    {"sku": "CHAIR-07", "qty": 4, "unit_price": 89.00}
  ],
  "paid": true
}
\`\`\`

| JSON type | Example | Notes |
|-----------|---------|-------|
| Object | \`{"a": 1}\` | Key-value pairs; keys are strings |
| Array | \`[1, 2]\` | Ordered list |
| String | \`"DESK-120"\` | Always double quotes; UTF-8 |
| Number | \`249.90\` | No distinction between integer and decimal; beware floating point |
| Boolean | \`true\` / \`false\` | Lowercase |
| Null | \`null\` | Absence of value - differs from empty string |

Common pitfalls:

- **Dates** have no native JSON type. Agree on ISO 8601 (\`2024-05-14T09:30:00Z\`) and on timezone (UTC is safest). Odoo stores datetimes in UTC.
- **Money** as floating point can produce rounding noise; some APIs send amounts as strings or integer minor units (cents). Document which.
- **Null vs missing vs empty string** - decide what each means: "clear the field" or "do not touch"?

### Parsing JSON in Python

\`\`\`python
import json

raw = '{"order_ref": "WEB-10045", "lines": [{"sku": "DESK-120", "qty": 2}]}'
data = json.loads(raw)
for line in data["lines"]:
    print(line["sku"], line["qty"])

payload = json.dumps({"name": "Élodie Martin"}, ensure_ascii=False)
\`\`\`

## XML

XML (eXtensible Markup Language) is common in banking (ISO 20022 camt/pain files), EDI, government e-invoicing and older SOAP services.

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Order ref="WEB-10045">
  <Customer>
    <Email>buyer@example.com</Email>
    <Name>Élodie Martin</Name>
  </Customer>
  <Lines>
    <Line sku="DESK-120" qty="2" unitPrice="249.90"/>
    <Line sku="CHAIR-07" qty="4" unitPrice="89.00"/>
  </Lines>
</Order>
\`\`\`

| Concept | Example |
|---------|---------|
| Element | \`<Email>...</Email>\` |
| Attribute | \`sku="DESK-120"\` |
| Namespace | \`xmlns="urn:iso:std:iso:20022:..."\` - must be handled when parsing |
| Schema (XSD) | Defines allowed structure; validate before sending |

Everything in XML is text: the receiver must convert \`"2"\` to a number. Special characters \`&\`, \`<\` must be escaped as \`&amp;\`, \`&lt;\`.

### Parsing XML in Python

\`\`\`python
import xml.etree.ElementTree as ET

root = ET.fromstring(xml_text)          # xml_text loaded from a test file
for line in root.iter("Line"):
    sku = line.get("sku")
    qty = float(line.get("qty"))
    print(sku, qty)
\`\`\`

For untrusted XML from external parties, use a hardened parser such as \`defusedxml\` to avoid XML attacks.

## JSON vs XML

| Criterion | JSON | XML |
|-----------|------|-----|
| Readability | Compact | Verbose |
| Typical use | REST APIs, webhooks | Banking, EDI, SOAP, e-invoicing |
| Data types | Basic types | All text unless schema says otherwise |
| Validation | JSON Schema (optional) | XSD (common) |
| Odoo | JSON-RPC, JSON-2 (19) | XML-RPC, imports of some bank formats |

## Field mapping: the heart of integration

A **mapping table** is a mandatory integration deliverable:

| Source (web shop JSON) | Target (Odoo) | Transformation | Required |
|------------------------|---------------|----------------|----------|
| \`order_ref\` | \`sale.order.client_order_ref\` | none | Yes |
| \`customer.email\` | \`res.partner.email\` (lookup) | lowercase, trim | Yes |
| \`created_at\` | \`sale.order.date_order\` | ISO 8601 UTC to Odoo datetime | Yes |
| \`lines[].sku\` | \`product.product.default_code\` (lookup) | trim | Yes |
| \`lines[].qty\` | \`sale.order.line.product_uom_qty\` | number | Yes |
| \`lines[].unit_price\` | \`sale.order.line.price_unit\` | decimal, 2 places | Yes |
| \`paid\` | (none - drives payment registration) | business rule | No |

> **Consultant tip:** For every mapped field, document the lookup rule (how to find the related record), what happens when it is not found, and who owns fixing it. Unmapped "not found" cases are the number one source of integration support tickets.

## Exercise

1. Convert the JSON order above into the XML structure by hand.
2. Write a mapping table for the web shop customer object to \`res.partner\` (name, email, phone, street, city, country code, VAT).
3. Identify three fields where null vs missing must be specified.

**Expected output:** a valid XML document, a 7-row mapping table and a short note on null handling.

## Key takeaways

- JSON dominates REST APIs; XML remains common in banking and EDI.
- Agree on date, timezone, decimal and encoding conventions explicitly.
- Null, missing and empty are different - specify their meaning.
- The field mapping table is the core integration deliverable.`,
        },
        {
          slug: "authentication-and-authorization",
          title: "Authentication and authorization",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0 / 19.0",
          scope: ["standard", "configuration"],
          body: `## Business context

The web shop needs to create sales orders in Odoo. The tempting shortcut: "just use the admin login". If that password leaks, the attacker owns the entire ERP: payroll, bank accounts, customer data. Proper authentication and least-privilege authorization limit the damage of any leak and make every action traceable.

## Two different questions

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | Who are you? | API key, password, OAuth2 token, certificate |
| **Authorization** | What are you allowed to do? | Odoo groups, access rights, record rules, OAuth2 scopes |

## Common authentication methods

| Method | How it works | Notes |
|--------|-------------|-------|
| Username + password | Sent with each call or to obtain a session | Avoid for integrations; use keys instead |
| API key | Long random secret identifying a user/app | Simple; must be stored securely and rotated |
| Bearer token | \`Authorization: Bearer <token>\` header | Usually short-lived; obtained via OAuth2 |
| OAuth2 | Standard for delegated access with scopes and expiring tokens | Used by Google, Microsoft, most SaaS |
| HMAC signature | Request signed with shared secret | Common for webhooks |
| Mutual TLS | Client certificate | Banking and high-security APIs |

## OAuth2 concepts

OAuth2 lets an application obtain a **token** with limited **scopes** instead of handling a user's password.

| Term | Meaning |
|------|---------|
| Resource owner | The user or organisation owning the data |
| Client | Your integration (has a client id and client secret) |
| Authorization server | Issues tokens |
| Resource server | The API holding data |
| Access token | Short-lived credential sent with API calls |
| Refresh token | Longer-lived credential to obtain new access tokens |
| Scope | Permission granted, e.g. \`orders.read\` |

Main flows:

- **Authorization code (with PKCE)** - a user logs in and consents; used when acting on behalf of a user.
- **Client credentials** - machine-to-machine; the integration authenticates as itself.

You do not need to implement OAuth2 servers - you need to know which flow a vendor uses, which scopes to request (the minimum), where tokens are stored and how refresh works.

## Authentication in Odoo's external API

For the Odoo external API, users authenticate with their login and either their password or, preferably, an **API key**. API keys are created by the user in *Preferences > Account Security > New API Key* (the option appears in recent versions; developer mode may be required - verify for your version). The key is shown **once**; store it immediately in a secret store.

- The API key replaces the password in API calls.
- It carries the permissions of the user who created it.
- Revoking the key does not affect the user's interactive login.
- Odoo 19's JSON-2 API uses the API key as a bearer token (check the External API documentation for your version).

Odoo also offers OAuth login for *users* (e.g. sign in with Google via the \`auth_oauth\` module); that is user sign-in, not API authorization for integrations.

## Least privilege and the dedicated integration user

Create **one dedicated user per integration** (e.g. "Integration - Web Shop"):

| Practice | Why |
|----------|-----|
| Dedicated user, never a human's or admin account | Traceability (chatter shows "Integration - Web Shop") and independent revocation |
| Only the groups needed (e.g. Sales: User, no Accounting, no Settings) | Limits damage if the key leaks |
| No access to the administration menus | Prevents privilege escalation |
| Separate users for test and production | A test key can never touch production |
| Document owner, purpose and rotation date | Supports audits |

Check licensing implications: in Odoo Enterprise, an internal user used by an integration typically counts as a user for subscription purposes - verify with your Odoo pricing agreement.

### Designing the permission set

For the web shop integration at Sunrise:

| Operation | Model | Permission needed |
|-----------|-------|-------------------|
| Find/create customers | \`res.partner\` | read, create, write |
| Read products and prices | \`product.product\`, \`product.pricelist\` | read |
| Create quotations | \`sale.order\`, \`sale.order.line\` | create, write |
| Confirm orders | \`sale.order\` | write (via \`action_confirm\`) |
| Delete anything | - | **not needed - do not grant** |

Test the integration user's rights by logging in as that user in a test database (with a password set for testing only) and performing each step.

> **Consultant tip:** When a vendor asks for "an admin account to set up the connector", ask which operations it performs and propose a restricted user. Accept admin access only temporarily, with a documented reason and a revocation date.

## Exercise

1. In your **test** database, create the user "Integration - Web Shop" with Sales: User (own documents) only.
2. Log in as that user (test password) and verify: can create a quotation, cannot open Accounting or Settings.
3. As that user, create an API key named "webshop-test" and store it in an environment variable on your machine (\`ODOO_API_KEY\`), not in a file inside your repository.
4. Fill the permission table above for a "read-only reporting" integration.

**Expected output:** a working restricted user, a stored key, and a permission table with read-only rights only.

## Debugging guidance

| Symptom | Cause |
|---------|-------|
| \`authenticate\` returns \`False\` | Wrong database, login or key; key revoked |
| \`AccessError\` on create | User lacks the group or access right - expected if least privilege is correct; add only the missing right |
| Works in test, fails in production | Different user or groups in production; keys are per database |

## Key takeaways

- Authentication proves identity; authorization limits actions.
- Prefer API keys or OAuth2 tokens over passwords.
- One dedicated, least-privilege user per integration and environment.
- Keys inherit the user's rights - restrict the user, not just the key.`,
          resources: [{ title: "Odoo 17 External API", kind: "link", url: DOC_EXTERNAL_API }],
        },
        {
          slug: "secrets-management",
          title: "Secrets management",
          durationMin: 30,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

A partner once pasted a production API key into a project wiki "so the team could test". Six months later the wiki was shared with a subcontractor, and the key was still valid. Secrets leak through documents, chat, repositories, screenshots and browser code far more often than through hacking. Managing them properly is part of every integration design.

## What counts as a secret?

- Odoo API keys and passwords
- OAuth2 client secrets, access and refresh tokens
- Webhook signing secrets
- Payment provider and bank API credentials
- Database passwords, SSH keys, certificates and private keys

## Where secrets must never be

| Location | Why it is dangerous |
|----------|--------------------|
| Frontend code (JavaScript, mobile apps) | Anyone can open developer tools or decompile and read it |
| Git repositories (even private) | Copied to every clone, kept in history forever |
| Documentation, wikis, specifications, tickets | Widely shared, rarely cleaned |
| Email and chat | Searchable, forwarded, retained |
| Screenshots and screen recordings | Shared in training material |
| Log files | Collected by monitoring tools |
| Postman collections exported to others | Variables travel with the file |

> **Rule:** never expose API keys in frontend code, repositories or documents. A browser-based shop must call **its own backend**, which holds the key and calls Odoo; the browser never sees the Odoo key.

## Where secrets should live

| Option | Use when |
|--------|----------|
| Environment variables | Simple scripts, containers, CI jobs |
| Platform secret settings (e.g. hosting provider's secret store, CI secrets) | Hosted middleware and pipelines |
| Dedicated vault (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) | Multiple systems, audit and rotation requirements |
| Local \`.env\` file excluded by \`.gitignore\` | Developer laptops only, never committed |

### Reading secrets in Python

\`\`\`python
import os


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


ODOO_URL = require_env("ODOO_URL")
ODOO_DB = require_env("ODOO_DB")
ODOO_USER = require_env("ODOO_USER")
ODOO_API_KEY = require_env("ODOO_API_KEY")
\`\`\`

Note the error message prints the variable **name**, never its value.

### Setting environment variables

\`\`\`bash
# Linux / macOS (current shell only)
export ODOO_URL="https://academy-test.example.com"
export ODOO_DB="academy_test"
export ODOO_USER="integration.webshop@example.com"
export ODOO_API_KEY="paste-from-your-secret-store"
\`\`\`

\`\`\`powershell
# Windows PowerShell (current session only)
$env:ODOO_URL = "https://academy-test.example.com"
$env:ODOO_API_KEY = "paste-from-your-secret-store"
\`\`\`

Avoid typing secrets into shell history on shared machines; prefer loading them from a vault CLI or a protected \`.env\` file.

### .gitignore entries

\`\`\`text
.env
.env.*
*.pem
*.key
secrets/
\`\`\`

## Rotation

Rotation means replacing a secret periodically or after any suspected exposure.

1. Create a new key for the integration user.
2. Update the secret store / environment.
3. Restart or redeploy the integration, verify it works.
4. Revoke the old key.
5. Record the rotation date and next due date.

| Trigger | Action |
|---------|--------|
| Scheduled (e.g. every 90 days, per policy) | Rotate |
| Team member with access leaves | Rotate |
| Secret seen in a repo, document, log or chat | Rotate **immediately**; treat as compromised |
| Vendor security incident | Rotate |

Removing a leaked secret from a file is not enough - it remains in history and copies. Revoke it.

## Logging without leaking

\`\`\`python
import logging

_logger = logging.getLogger("webshop_sync")


def mask(value: str) -> str:
    return value[:4] + "..." if value else ""


_logger.info("Connecting to %s as %s", ODOO_URL, ODOO_USER)   # OK
_logger.debug("Key prefix %s", mask(ODOO_API_KEY))            # only a prefix, if at all
\`\`\`

Never log full tokens, passwords, full card numbers or bank details.

> **Consultant tip:** Add a "Secrets" section to every integration design: list each secret, its owner, storage location, which environments have separate values, and the rotation schedule. Never put the values themselves in the document.

## Exercise

1. Create a \`.env.example\` file listing variable **names** with placeholder values and commit only that file.
2. Store your real test values in your shell environment or a local \`.env\` file excluded by \`.gitignore\`.
3. Write the \`require_env\` helper and run it without one variable set - confirm the error names the variable but shows no secret.
4. Write a rotation runbook for the "Integration - Web Shop" key.

**Expected output:**

\`\`\`text
RuntimeError: Missing required environment variable: ODOO_API_KEY
\`\`\`

and a five-step rotation runbook.

## Key takeaways

- Secrets never go in frontend code, repositories, documents, chat or logs.
- Use environment variables or a vault; commit only \`.env.example\`.
- Separate secrets per environment; test keys never touch production.
- Rotate on schedule and immediately after exposure.`,
        },
        {
          slug: "webhooks",
          title: "Webhooks: signatures and idempotency",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0 / 19.0",
          scope: ["standard", "configuration", "customization"],
          body: `## Business context

Sunrise's payment provider must tell Odoo when a customer pays. Polling ("any new payments?") every minute is wasteful and slow. Instead, the provider sends a **webhook**: an HTTP \`POST\` to a URL you control, the moment the event happens. Webhooks are efficient - and dangerous if you accept them blindly.

## Polling vs webhooks

| Aspect | Polling | Webhook |
|--------|---------|---------|
| Who initiates | Your system asks repeatedly | Source system pushes on event |
| Latency | Up to the polling interval | Near real time |
| Load | Many empty calls | Only when events occur |
| Risks | Rate limits | Spoofed calls, duplicates, out-of-order delivery, missed events when your endpoint is down |

Most robust designs combine both: webhooks for speed, a periodic **reconciliation poll** to catch anything missed.

## A typical webhook

\`\`\`http
POST /webhooks/payments HTTP/1.1
Content-Type: application/json
X-Signature: 5d41402abc4b2a76b9719d911017c592...
X-Event-Id: evt_01HXYZ123

{"event_id": "evt_01HXYZ123", "type": "payment.succeeded", "order_ref": "WEB-10045", "amount": "678.80", "currency": "EUR"}
\`\`\`

## Rule 1: verify the signature

Anyone who knows your URL can send a request. Providers sign each webhook with a shared secret (commonly HMAC-SHA256 over the raw body). Verify before doing anything.

\`\`\`python
import hashlib
import hmac
import os


def verify_signature(raw_body: bytes, received_signature: str) -> bool:
    secret = os.environ["PAYMENT_WEBHOOK_SECRET"].encode("utf-8")
    expected = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    # constant-time comparison prevents timing attacks
    return hmac.compare_digest(expected, received_signature or "")
\`\`\`

- Compute over the **raw bytes** received, before parsing JSON (re-serialising changes bytes).
- Use \`hmac.compare_digest\`, not \`==\`.
- Reject with **401** if invalid; log the event id, not the body.
- Many providers include a **timestamp** in the signed content; reject old timestamps to prevent replay attacks.
- Follow the provider's exact algorithm (header names and encodings differ).

## Rule 2: be idempotent

Providers retry when they do not receive a 2xx quickly, so **the same event can arrive several times**. Processing it twice may register a payment twice.

\`\`\`python
def handle_payment_event(event: dict, store) -> str:
    event_id = event["event_id"]
    if store.already_processed(event_id):
        return "duplicate-ignored"
    # ... register the payment in Odoo (test database) ...
    store.mark_processed(event_id)
    return "processed"
\`\`\`

\`store\` can be a database table with a **unique constraint** on \`event_id\`; the constraint is the real guarantee when two deliveries arrive simultaneously.

## Rule 3: respond fast, process asynchronously

1. Verify signature.
2. Store the event (with unique event id).
3. Return \`200\` immediately.
4. Process from a queue / scheduled job; retry processing failures internally.

Slow endpoints cause provider timeouts, which cause retries, which cause duplicates.

## Rule 4: handle ordering

Events can arrive out of order (\`payment.refunded\` before \`payment.succeeded\`). Use event timestamps or fetch the current state from the provider's API before acting.

## Webhooks and Odoo

| Option | Scope | Notes |
|--------|-------|-------|
| Payment provider modules | Standard | Odoo's payment provider apps already handle their providers' notifications (e.g. Stripe, Adyen, PayPal - availability depends on edition and country; verify) |
| Automation Rules with a webhook trigger / "send webhook notification" action | Configuration | Introduced in recent versions of \`base_automation\` (Odoo 17+); verify options for your version |
| Custom HTTP controller in a module | Customization | Full control; you implement signature checks, idempotency and access control |
| Middleware receives the webhook, then calls Odoo's API | Third-party / custom | Keeps Odoo unexposed; adds queueing and monitoring |

A custom controller sketch (Odoo 17, for training only):

\`\`\`python
import json
import logging

from odoo import http
from odoo.http import request

from .signature import verify_signature   # your helper reading the secret from the environment

_logger = logging.getLogger(__name__)


class PaymentWebhook(http.Controller):

    @http.route("/academy/webhooks/payment", type="http", auth="public",
                methods=["POST"], csrf=False)
    def payment_webhook(self, **kwargs):
        raw = request.httprequest.get_data()
        signature = request.httprequest.headers.get("X-Signature", "")
        if not verify_signature(raw, signature):
            _logger.warning("Rejected webhook with invalid signature")
            return request.make_response("invalid signature", status=401)
        event = json.loads(raw)
        # store event idempotently (unique event_id) and process later
        return request.make_response("ok", status=200)
\`\`\`

\`auth="public"\` means no Odoo login - the **signature is your authentication**. Any database writes from such a route need careful, minimal \`sudo()\` use. Prefer standard payment modules or middleware when possible.

> **Consultant tip:** Ask every vendor four questions: How do you sign webhooks? How often and how long do you retry? Is there an event id? Can we replay missed events? The answers shape your design.

## Exercise

1. Write \`verify_signature\` and test it with a sample body and a signature you compute yourself using a test secret from an environment variable.
2. Change one character in the body - verification must fail.
3. Simulate the same event three times against a list-based store - only one is processed.

**Expected output:**

\`\`\`text
valid signature: True
tampered body: False
processed, duplicate-ignored, duplicate-ignored
\`\`\`

## Key takeaways

- Webhooks push events; verify every signature over the raw body.
- Expect duplicates and out-of-order delivery - process idempotently by event id.
- Acknowledge fast, process asynchronously.
- Pair webhooks with periodic reconciliation.`,
        },
        {
          slug: "postman-testing",
          title: "Testing APIs with Postman",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0 / 19.0",
          scope: ["standard"],
          body: `## Business context

Before writing code, you want to confirm that the web shop's API returns what its documentation claims, and that Odoo accepts the calls you plan. **Postman** (or similar tools such as Insomnia, Bruno or curl) lets consultants explore and test APIs interactively, share test suites with developers and reproduce bugs precisely.

## Key Postman concepts

| Concept | Purpose |
|---------|---------|
| Request | One HTTP call (method, URL, headers, body) |
| Collection | A folder of related requests, shareable |
| Environment | A set of variables per target (e.g. "Odoo Test", "Shop Sandbox") |
| Variable | Placeholder like \`{{base_url}}\` replaced at send time |
| Pre-request script | JavaScript run before a request (e.g. compute a timestamp) |
| Tests | JavaScript assertions run after the response |
| Runner | Executes a whole collection in order |

## Variables and environments - without real secrets

Create an environment **"Odoo Training"**:

| Variable | Initial value (shared) | Current value (local only) |
|----------|-----------------------|---------------------------|
| \`base_url\` | \`https://academy-test.example.com\` | same |
| \`db\` | \`academy_test\` | same |
| \`login\` | \`integration.webshop@example.com\` | same |
| \`api_key\` | *(leave empty)* | your test key |

- In Postman, the **initial value** is synced and shared with anyone who receives the environment; the **current value** stays local. Put secrets only in the current value, and mark the variable type as *secret*.
- Never export or share environments containing keys. Share an environment template with empty secret values.
- Use a **test** database only.

## Calling Odoo JSON-RPC from Postman (Odoo 17)

Request: \`POST {{base_url}}/jsonrpc\`, header \`Content-Type: application/json\`.

### 1. Authenticate

\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "common",
    "method": "authenticate",
    "args": ["{{db}}", "{{login}}", "{{api_key}}", {}]
  },
  "id": 1
}
\`\`\`

Expected response: \`{"jsonrpc": "2.0", "id": 1, "result": 7}\` - \`7\` is the user id (yours will differ). \`"result": false\` means wrong credentials.

Tests tab - save the uid:

\`\`\`javascript
const body = pm.response.json();
pm.test("authenticated", () => pm.expect(body.result).to.be.a("number"));
pm.environment.set("uid", body.result);
\`\`\`

### 2. Read customers

\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "{{db}}", {{uid}}, "{{api_key}}",
      "res.partner", "search_read",
      [[["customer_rank", ">", 0]]],
      {"fields": ["name", "email", "country_id"], "limit": 5}
    ]
  },
  "id": 2
}
\`\`\`

Tests:

\`\`\`javascript
const body = pm.response.json();
pm.test("no error", () => pm.expect(body.error).to.be.undefined);
pm.test("max 5 rows", () => pm.expect(body.result.length).to.be.at.most(5));
\`\`\`

Note: JSON-RPC errors usually come back with HTTP **200** and an \`error\` object in the body - always test for \`error\`, not only the status code.

### Odoo 19 note

Odoo 19 introduced a new **JSON-2** external API (\`/json/2/...\`, API key sent as a bearer token), and the legacy \`/xmlrpc\` and \`/jsonrpc\` endpoints are deprecated and scheduled for removal in a future version. Check the External API documentation for your version and build a separate Postman collection per API style.

## Organising a collection

\`\`\`text
Odoo Training API
  00 Auth
     Authenticate
  10 Customers
     Search customers
     Create test customer
     Update test customer phone
  20 Products
     Search product by default_code
  90 Negative tests
     Wrong api key
     Missing required field
     Model without access
\`\`\`

Negative tests are as important as positive ones: they prove error handling and least privilege.

> **Consultant tip:** Attach the Postman collection (without secrets) to the integration specification. Developers, testers and the client's IT can reproduce exactly what you validated, and a failing request becomes a precise bug report.

## Exercise

1. Create the environment and collection above against your **test** database.
2. Run Authenticate, Search customers, Create test customer (name prefixed with "TEST-").
3. Run the negative tests and record the error messages.
4. Run the whole collection in the Runner.
5. Export the collection and confirm it contains \`{{api_key}}\` placeholders, not the key.

**Expected output:** all positive tests green; negative tests returning an \`error\` object (e.g. \`AccessDenied\` or \`AccessError\`); exported file free of secrets.

## Debugging guidance

| Symptom | Cause |
|---------|-------|
| \`result: false\` on authenticate | Wrong db/login/key |
| \`{{uid}}\` sent literally | Variable not set - run Authenticate first, check environment selected |
| HTTP 404 on \`/jsonrpc\` | Wrong base URL or proxy path |
| \`error.data.name\` = \`odoo.exceptions.AccessError\` | Integration user lacks rights - expected for negative tests |
| \`Invalid JSON\` | Trailing commas or unquoted keys |

## Key takeaways

- Collections + environments make API tests repeatable and shareable.
- Secrets only in local current values marked secret - never shared.
- Odoo JSON-RPC errors arrive in the body; test for them.
- Keep separate collections for legacy RPC and Odoo 19 JSON-2.`,
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* Module 2: Odoo external API                                         */
    /* ------------------------------------------------------------------ */
    {
      title: "Odoo external API",
      lessons: [
        {
          slug: "odoo-xml-rpc",
          title: "Odoo XML-RPC external API with Python",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0 (deprecated in 19.0)",
          scope: ["standard"],
          body: `## Business context

Sunrise's CRM team wants a nightly list of customers from Odoo, and the web shop must create customers and quotations. Odoo's **external API** gives authorized programs access to any model the user is allowed to see, using the same ORM methods as the UI (\`search_read\`, \`create\`, \`write\`...). All access rights and record rules still apply.

> **Before you start:** run these examples only against a **training/test database**, as a **dedicated integration user**, with the API key in an **environment variable**. Never expose API keys in frontend code, repositories or documents.

## Version note

In Odoo 17 and 18, the external API is available over **XML-RPC** (\`/xmlrpc/2/common\`, \`/xmlrpc/2/object\`) and **JSON-RPC** (\`/jsonrpc\`). Odoo 19 introduced a new **JSON-2** API and deprecated the XML-RPC/JSON-RPC endpoints, which are scheduled for removal in a future version. The concepts here (models, domains, methods, rights) carry over, but **check the External API documentation for your version** before building something long-lived.

## The two endpoints

| Endpoint | Purpose | Key methods |
|----------|---------|-------------|
| \`/xmlrpc/2/common\` | Metadata and login, no authentication needed | \`version()\`, \`authenticate(db, login, key, {})\` |
| \`/xmlrpc/2/object\` | Call model methods | \`execute_kw(db, uid, key, model, method, args, kwargs)\` |

## Complete example

\`\`\`python
"""Odoo XML-RPC training script - TEST DATABASE ONLY."""
import os
import xmlrpc.client


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


URL = require_env("ODOO_URL")          # e.g. https://academy-test.example.com
DB = require_env("ODOO_DB")            # e.g. academy_test
USER = require_env("ODOO_USER")        # integration user login
API_KEY = require_env("ODOO_API_KEY")  # API key used in place of the password

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
print("Server version:", common.version()["server_version"])

uid = common.authenticate(DB, USER, API_KEY, {})
if not uid:
    raise SystemExit("Authentication failed - check database, login and API key")

models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")


def call(model, method, *args, **kwargs):
    return models.execute_kw(DB, uid, API_KEY, model, method, list(args), kwargs)


# 1. Read: customers with an email, max 5
customers = call(
    "res.partner", "search_read",
    [["customer_rank", ">", 0], ["email", "!=", False]],
    fields=["name", "email", "country_id"],
    limit=5,
    order="name asc",
)
for c in customers:
    country = c["country_id"][1] if c["country_id"] else "-"
    print(c["id"], c["name"], c["email"], country)

# 2. Count
total = call("res.partner", "search_count", [["customer_rank", ">", 0]])
print("Customers:", total)

# 3. Create a test customer
partner_id = call("res.partner", "create", {
    "name": "TEST-API Customer",
    "email": "test-api@example.com",
    "is_company": True,
})
print("Created partner", partner_id)

# 4. Update it
call("res.partner", "write", [partner_id], {"phone": "+1 555 0100"})

# 5. Read it back
print(call("res.partner", "read", [partner_id], fields=["name", "phone"]))
\`\`\`

## Understanding execute_kw

\`\`\`text
execute_kw(db, uid, api_key, model, method, args, kwargs)
\`\`\`

| Method | \`args\` | Useful \`kwargs\` | Returns |
|--------|--------|-----------------|---------|
| \`search\` | \`[domain]\` | \`offset\`, \`limit\`, \`order\` | list of ids |
| \`search_count\` | \`[domain]\` | - | integer |
| \`read\` | \`[ids]\` | \`fields\` | list of dicts |
| \`search_read\` | \`[domain]\` | \`fields\`, \`offset\`, \`limit\`, \`order\` | list of dicts |
| \`create\` | \`[values]\` (or a list of dicts) | - | new id (or ids) |
| \`write\` | \`[ids, values]\` | - | \`True\` |
| \`unlink\` | \`[ids]\` | - | \`True\` |
| \`fields_get\` | \`[]\` | \`attributes\` | field definitions |
| Public business methods, e.g. \`action_confirm\` | \`[ids]\` | - | method result |

Notes:

- Many2one values are returned as \`[id, "display name"]\` and written as an id.
- One2many/Many2many are written with command tuples, e.g. \`[(0, 0, {...})]\` to create a line, \`[(6, 0, [ids])]\` to replace links.
- Always pass \`fields\` - reading all fields is slow and may hit fields the user cannot access.
- Methods starting with \`_\` are private and cannot be called externally.

### Creating a quotation with lines

\`\`\`python
product_ids = call("product.product", "search", [["default_code", "=", "DESK-120"]], limit=1)
if not product_ids:
    raise SystemExit("Product DESK-120 not found in test database")

order_id = call("sale.order", "create", {
    "partner_id": partner_id,
    "client_order_ref": "WEB-10045",
    "order_line": [
        (0, 0, {"product_id": product_ids[0], "product_uom_qty": 2}),
    ],
})
print("Quotation", call("sale.order", "read", [order_id], fields=["name", "amount_total"]))
\`\`\`

### Discovering fields

\`\`\`python
fields_info = call("sale.order", "fields_get", attributes=["string", "type", "required"])
for name, info in sorted(fields_info.items()):
    if info.get("required"):
        print(name, info["type"], info["string"])
\`\`\`

## Error handling

\`\`\`python
try:
    call("res.partner", "create", {"email": "missing-name@example.com"})
except xmlrpc.client.Fault as exc:
    # Business/validation/access error raised by Odoo - do not retry blindly
    print("Odoo error:", exc.faultString.splitlines()[-1])
except (ConnectionError, TimeoutError, xmlrpc.client.ProtocolError) as exc:
    # Network/server problem - candidate for retry with backoff
    print("Transport error:", exc)
\`\`\`

| Error | Meaning | Retry? |
|-------|---------|--------|
| \`Fault\` containing \`AccessDenied\` | Bad credentials | No |
| \`Fault\` containing \`AccessError\` | Missing rights for the integration user | No - adjust rights consciously |
| \`Fault\` containing \`ValidationError\` / \`UserError\` | Business rule rejected the data | No - fix data |
| \`ProtocolError\` 502/503/504, connection reset, timeout | Infrastructure | Yes, with backoff |

> **Consultant tip:** When an integration "suddenly fails", check whether someone changed the integration user's groups, archived it, or revoked its key. These configuration changes cause more outages than code bugs.

## Exercise steps

1. Set \`ODOO_URL\`, \`ODOO_DB\`, \`ODOO_USER\`, \`ODOO_API_KEY\` for your **test** database.
2. Run the script; record the server version and customers listed.
3. Create a quotation for the test customer with one product.
4. Trigger an \`AccessError\` by trying to read \`account.move\` as the sales-only integration user.
5. Delete your TEST-API records (or archive them with \`write\` \`{"active": False}\`).

## Expected output

\`\`\`text
Server version: 17.0
12 Acme Corp info@acme.example BE
...
Customers: 37
Created partner 58
[{'id': 58, 'name': 'TEST-API Customer', 'phone': '+1 555 0100'}]
\`\`\`

(Ids and data depend on your database.)

## Key takeaways

- \`/xmlrpc/2/common\` authenticates; \`/xmlrpc/2/object\` + \`execute_kw\` calls model methods.
- Use the API key in place of the password, read from the environment.
- Access rights and record rules apply - least privilege still works.
- Distinguish Odoo faults (do not retry) from transport errors (retry).
- Odoo 19 deprecates XML-RPC in favour of JSON-2; check your version's docs.`,
          resources: [
            { title: "Odoo 17 External API", kind: "link", url: DOC_EXTERNAL_API },
            { title: "Odoo 17 developer documentation", kind: "link", url: DOC_DEV },
          ],
        },
        {
          slug: "odoo-json-rpc-and-json-2",
          title: "JSON-RPC and the Odoo 19 JSON-2 API",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0 / 19.0",
          scope: ["standard"],
          body: `## Business context

Sunrise's middleware is written in JavaScript/TypeScript and prefers JSON over XML. Odoo exposes the same external API over **JSON-RPC**, and Odoo 19 adds a new **JSON-2** API designed for modern integrations. You should recognise all three styles, because you will meet clients on different versions.

> Run every example against a **test database** with the API key from an **environment variable**. Never put keys in browser code, repositories or documents.

## JSON-RPC (Odoo 17 / 18; deprecated in 19)

A single endpoint, \`POST /jsonrpc\`, receives a JSON-RPC 2.0 envelope naming the service (\`common\` or \`object\`), the method and the arguments - the same arguments as XML-RPC.

\`\`\`python
"""Odoo JSON-RPC training script - TEST DATABASE ONLY."""
import itertools
import os

import requests

URL = os.environ["ODOO_URL"]
DB = os.environ["ODOO_DB"]
USER = os.environ["ODOO_USER"]
API_KEY = os.environ["ODOO_API_KEY"]

_ids = itertools.count(1)


def jsonrpc(service, method, *args):
    payload = {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {"service": service, "method": method, "args": list(args)},
        "id": next(_ids),
    }
    resp = requests.post(f"{URL}/jsonrpc", json=payload, timeout=30)
    resp.raise_for_status()               # transport-level errors
    body = resp.json()
    if body.get("error"):                 # Odoo errors come back in the body
        data = body["error"].get("data", {})
        raise RuntimeError(f"{data.get('name')}: {data.get('message')}")
    return body["result"]


uid = jsonrpc("common", "authenticate", DB, USER, API_KEY, {})
if not uid:
    raise SystemExit("Authentication failed")

partners = jsonrpc(
    "object", "execute_kw", DB, uid, API_KEY,
    "res.partner", "search_read",
    [[["customer_rank", ">", 0]]],
    {"fields": ["name", "email"], "limit": 5},
)
for p in partners:
    print(p["id"], p["name"], p["email"])
\`\`\`

Key differences from REST you must remember:

- Odoo JSON-RPC returns HTTP **200 even for business errors**; check the \`error\` key.
- Every call sends db, uid and key - there is no session.
- Methods and domains are identical to XML-RPC.

## JSON-2 API (Odoo 19)

Odoo 19 introduced a new external JSON API, commonly called **JSON-2**. Based on the Odoo 19 documentation, its general shape is:

\`\`\`text
POST /json/2/<model>/<method>
Authorization: bearer <api key>
X-Odoo-Database: <database name>
Content-Type: application/json

{"ids": [...], "context": {...}, ...named arguments of the method...}
\`\`\`

An illustrative call (verify exact paths, headers and parameter names in the External API documentation for your version):

\`\`\`python
import os

import requests

URL = os.environ["ODOO_URL"]
API_KEY = os.environ["ODOO_API_KEY"]
DB = os.environ["ODOO_DB"]

resp = requests.post(
    f"{URL}/json/2/res.partner/search_read",
    headers={
        "Authorization": f"bearer {API_KEY}",
        "X-Odoo-Database": DB,
        "Content-Type": "application/json",
    },
    json={"domain": [["customer_rank", ">", 0]], "fields": ["name", "email"], "limit": 5},
    timeout=30,
)
resp.raise_for_status()
print(resp.json())
\`\`\`

Notable characteristics (verify for your version):

| Aspect | XML-RPC / JSON-RPC | JSON-2 |
|--------|-------------------|--------|
| Endpoint | \`/xmlrpc/2/...\`, \`/jsonrpc\` | \`/json/2/<model>/<method>\` |
| Authentication | db + uid + key in every call | API key as bearer token in a header |
| Errors | XML-RPC Fault / JSON body with \`error\` | HTTP status codes with JSON error body |
| Arguments | Positional lists | Named arguments |
| Status | Deprecated in 19, removal planned in a future version | Recommended going forward |

## Choosing for a project

| Client's version | Recommendation |
|------------------|----------------|
| 16.0 / 17.0 / 18.0 | XML-RPC or JSON-RPC; isolate API calls in one adapter module so you can switch later |
| 19.0+ | Use JSON-2 for new integrations; plan migration of existing RPC integrations |
| Upgrade planned | Budget the API migration in the upgrade project |

### The adapter pattern

\`\`\`python
class OdooClient:
    """All Odoo calls go through this class. Swap the transport per version."""

    def __init__(self, transport):
        self.transport = transport

    def search_read(self, model, domain, fields, limit=None):
        return self.transport.search_read(model, domain, fields, limit)

    def create(self, model, values):
        return self.transport.create(model, values)

    def write(self, model, ids, values):
        return self.transport.write(model, ids, values)
\`\`\`

Business logic (e.g. "sync products") calls \`OdooClient\` only; the transport class knows whether it speaks XML-RPC, JSON-RPC or JSON-2. Upgrading Odoo then changes one class, not the whole integration.

> **Consultant tip:** In every integration specification, record the Odoo version, the API style used, and the deprecation status. During upgrade scoping, search for integrations using \`/xmlrpc\` or \`/jsonrpc\` - they are migration work items.

## Calling Odoo from a browser? No.

A web page must never call Odoo's external API directly with an API key - the key would be visible to every visitor. Browser code calls **your backend** (or middleware), which holds the key in its environment and calls Odoo server-to-server. CORS restrictions will usually block direct calls anyway, but security is the real reason.

## Exercise steps

1. Run the JSON-RPC script against your **test** database (17/18).
2. Trigger an error (wrong model name \`res.partnerx\`) and print the error name and message.
3. If you have access to an Odoo 19 test database, repeat the read with JSON-2 following the official documentation.
4. Sketch the \`OdooClient\` adapter with one transport implemented.

## Expected output

\`\`\`text
12 Acme Corp info@acme.example
...
RuntimeError: builtins.KeyError: 'res.partnerx'
\`\`\`

(Exact error names vary by version.)

## Debugging guidance

| Symptom | Cause |
|---------|-------|
| HTTP 200 but nothing happened | Error object in body not checked |
| 404 on \`/json/2/...\` | Server is not Odoo 19+, or path differs - check docs |
| 401 on JSON-2 | Missing/invalid bearer key or database header |
| Works from script, fails from browser | CORS - and you should not call from the browser anyway |

## Key takeaways

- JSON-RPC = same methods as XML-RPC in a JSON envelope; errors are in the body.
- Odoo 19 adds JSON-2 and deprecates the legacy RPC endpoints; check your version's documentation.
- Isolate API calls behind an adapter to survive upgrades.
- Never call Odoo with an API key from frontend code.`,
          resources: [{ title: "Odoo 17 External API", kind: "link", url: DOC_EXTERNAL_API }],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* Module 3: Integration patterns                                      */
    /* ------------------------------------------------------------------ */
    {
      title: "Integration patterns & practice",
      lessons: [
        {
          slug: "business-integrations",
          title: "Payment, e-commerce, CRM, banking and shipping integrations",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "enterprise", "configuration", "third-party"],
          body: `## Business context

Sunrise's IT roadmap lists five integrations: card payments, an existing web shop, a field-sales CRM, bank statements and a 3PL warehouse/carrier. For each, the consultant's first question is: **is there a standard Odoo app or connector, or do we need custom/third-party work?** This lesson gives a conceptual map; always verify availability for the client's version, edition and country.

## Decision ladder

1. Standard Odoo feature or official connector?
2. Configuration of an existing generic tool (e.g. automation rules, import templates)?
3. Third-party app (Odoo Apps store, OCA) - check quality, support and version?
4. Middleware / iPaaS?
5. Custom development?

Go down the ladder only when the step above does not meet the requirement.

## Payment gateways

| Aspect | Notes |
|--------|-------|
| Odoo approach | Payment provider apps (e.g. Stripe, Adyen, PayPal, Mollie and others) configured under *Accounting/Invoicing or Website > Configuration > Payment Providers*; availability depends on version, edition and country - verify |
| Flow | Customer pays on portal/website/POS terminal; provider confirms (often via webhook/notification); Odoo creates a payment transaction and reconciles it with the order/invoice |
| Key decisions | Capture mode (immediate vs manual capture), refunds, fees accounting, payout reconciliation |
| Security | Card data stays with the provider (PCI scope); Odoo stores tokens/references, not card numbers |
| Test | Use the provider's **test mode** and test keys on a test database |

## E-commerce

| Scenario | Typical approach |
|----------|------------------|
| New shop | Odoo Website + eCommerce (standard) - no integration needed |
| Existing external shop (Shopify, WooCommerce, Magento...) | Third-party connector or middleware; some marketplace connectors exist in Enterprise - verify for your version |
| Data flows | Products/prices/stock: Odoo to shop. Orders/customers/payments: shop to Odoo. Shipment status: Odoo to shop |

Master questions: which system owns products, prices and stock? How are taxes calculated (shop vs Odoo)? How are SKUs matched (\`default_code\`)? What happens to cancelled or partially refunded orders?

## CRM

| Scenario | Approach |
|----------|----------|
| Use Odoo CRM | Standard - no integration |
| Keep external CRM (e.g. Salesforce, HubSpot) | Connector or middleware; sync accounts/contacts, won opportunities become quotations in Odoo |

Define **system of record per field**: if both systems edit customer addresses, you need conflict rules ("last write wins" is rarely acceptable for finance data).

## Banking

| Method | Scope | Notes |
|--------|-------|-------|
| Manual statement import (CAMT, OFX, CSV, etc.) | Standard/configuration | Supported formats depend on version and localisation - verify |
| Automatic bank synchronisation via providers | **Enterprise feature** (Odoo Online/Odoo.sh/Enterprise) - verify bank and country coverage | Odoo connects through aggregation providers; the client authorises access with their bank |
| Payment files (SEPA credit transfer, etc.) | Localisation/Enterprise modules depending on country - verify | Outgoing payments |
| Direct bank API / host-to-host | Custom or third-party | High security requirements (certificates, mTLS), bank-specific |

Banking integrations are high risk: always include a reconciliation process and never test with real bank credentials in a training database.

## Shipping and 3PL

| Scenario | Approach |
|----------|----------|
| Carrier labels and rates (FedEx, UPS, DHL, etc.) | Odoo provides shipping connectors in Enterprise for several carriers - verify carriers, countries and version |
| Simple flat-rate or rule-based shipping | Standard delivery methods (configuration) |
| 3PL warehouse (external logistics provider) | Usually middleware or custom: send delivery orders to the 3PL, receive shipment confirmations (quantities, lot/serial numbers, tracking numbers), receive stock snapshots for reconciliation |

3PL key questions: who validates the Odoo delivery (integration user after confirmation from the 3PL)? How are partial shipments and backorders handled? How often are stock levels reconciled?

## Integration requirements checklist

| Topic | Question |
|-------|----------|
| Direction | One-way or bi-directional? |
| Trigger | Real time (webhook), near real time (queue), batch (nightly)? |
| Volume | Records per day, peak hour? |
| Ownership | System of record for each entity/field |
| Matching keys | SKU, email, VAT, external id? |
| Errors | Who is alerted, who fixes, how are records replayed? |
| Security | Auth method, integration user, secret storage |
| Environments | Sandbox/test endpoints available? |
| Edition | Does the standard connector require Enterprise? |
| Reconciliation | How do we prove both systems agree? |

> **Consultant tip:** Write "verify" next to every connector claim in your proposal until you have tested it in the client's version and edition. Sales promises about connectors are a frequent source of scope disputes.

## Exercise

For Sunrise, fill one row per integration:

| Integration | Standard/Enterprise/third-party/custom | Direction | Trigger | Matching key | Reconciliation |
|-------------|---------------------------------------|-----------|---------|--------------|----------------|
| Card payments | | | | | |
| External web shop | | | | | |
| Field CRM | | | | | |
| Bank statements | | | | | |
| 3PL warehouse | | | | | |

**Expected output:** the completed table plus a list of items you marked "verify" with how you will verify them (documentation, test database, vendor demo).

## Key takeaways

- Climb down the decision ladder: standard, configuration, third-party, middleware, custom.
- Bank synchronisation and many shipping connectors are Enterprise features - verify per version and country.
- Define system of record, matching keys and reconciliation for every integration.
- Test only with sandbox credentials on test databases.`,
        },
        {
          slug: "middleware-and-scheduled-sync",
          title: "Middleware and scheduled synchronisation",
          durationMin: 35,
          odooVersions: "Odoo 17.0 / 18.0 / 19.0",
          scope: ["third-party", "customization"],
          body: `## Business context

Sunrise's 3PL sends shipment files every 15 minutes, the web shop posts orders continuously, and the CRM wants a nightly customer sync. Connecting each system directly to every other creates a fragile "spaghetti" of point-to-point links. **Middleware** centralises transformation, routing, retries and monitoring.

## Point-to-point vs middleware

| Aspect | Point-to-point | Middleware / iPaaS |
|--------|---------------|-------------------|
| Setup effort | Low for one link | Higher initially |
| Number of links | Grows quickly (n systems, many pairs) | Each system connects once to the hub |
| Monitoring | Scattered logs | Central dashboard, alerts |
| Retries/queues | Re-implemented each time | Built in |
| Change impact | Change one system, fix many links | Change one adapter |

Middleware options range from iPaaS products (e.g. Make, Zapier, n8n, Workato, Boomi, MuleSoft, Azure Logic Apps) to custom services with a message queue. The choice depends on volume, complexity, budget and the client's IT skills.

## Sync patterns

| Pattern | How | Use |
|---------|-----|-----|
| Event-driven | Webhook or message queue triggers processing | Orders, payments |
| Scheduled batch | Job runs every N minutes/hours | Product catalogue, stock levels, nightly CRM sync |
| Delta (incremental) | Fetch only records changed since the last run | Large datasets |
| Full refresh | Fetch everything | Small datasets, periodic reconciliation |

### Delta sync with a watermark

Odoo records have \`write_date\` (last modification, UTC). Store the timestamp of the last successful run (the **watermark**) and fetch changes since then:

\`\`\`python
import os
from datetime import datetime, timezone

# odoo = an authenticated client from the previous lessons (test database only)


def load_watermark(path: str) -> str:
    try:
        with open(path, encoding="utf-8") as fh:
            return fh.read().strip()
    except FileNotFoundError:
        return "1970-01-01 00:00:00"


def save_watermark(path: str, value: str) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(value)


WATERMARK_FILE = os.environ.get("SYNC_WATERMARK_FILE", "partner_sync.watermark")
started = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
since = load_watermark(WATERMARK_FILE)

offset, page_size = 0, 200
while True:
    batch = odoo.search_read(
        "res.partner",
        [["write_date", ">", since], ["customer_rank", ">", 0]],
        ["name", "email", "phone", "write_date"],
        limit=page_size,
        offset=offset,
        order="write_date asc, id asc",
    )
    if not batch:
        break
    for partner in batch:
        push_to_crm(partner)          # idempotent upsert in the target system
    offset += page_size

save_watermark(WATERMARK_FILE, started)   # only after the whole run succeeded
\`\`\`

(Here \`odoo.search_read\` is the adapter from the previous lesson extended with \`offset\` and \`order\`, and \`push_to_crm\` is your target-system function.)

Design points:

- Save the watermark **only after success**, and use the run's **start** time so changes made during the run are picked up next time.
- **Paginate** with \`limit\`/\`offset\` and a stable order.
- Make the target write an **upsert** so overlaps are harmless.
- Periodically run a **full reconciliation** to catch anything missed (deleted records do not show up in a \`write_date\` delta; archived ones do).

## Where to schedule

| Option | Notes |
|--------|-------|
| Middleware scheduler | Preferred when middleware exists; central monitoring |
| Server cron / container scheduler | Simple scripts; ensure single instance (no overlapping runs) |
| Odoo scheduled action (\`ir.cron\`) calling an external API | Customization; keeps logic in Odoo but adds outbound credentials to Odoo's environment and load to Odoo workers |

Prevent overlapping runs (a lock file, a database lock or the scheduler's concurrency setting); two simultaneous runs are a common source of duplicates.

## Queues

A queue (e.g. RabbitMQ, a cloud queue service, or a jobs table) decouples receiving from processing:

\`\`\`visual-flow
{
  "title": "Decoupling with a queue",
  "steps": [
    {
      "title": "Web shop sends a webhook",
      "icon": "store"
    },
    {
      "title": "Receiver enqueues the message",
      "icon": "plug"
    },
    {
      "title": "Queue",
      "icon": "list"
    },
    {
      "title": "Worker processes it",
      "icon": "settings",
      "branch": {
        "when": "Fails after N retries",
        "result": "Moved to the dead-letter queue",
        "tone": "danger"
      }
    },
    {
      "title": "Odoo API",
      "icon": "server"
    }
  ]
}
\`\`\`

- Workers retry transient failures with backoff.
- After N attempts the message moves to a **dead-letter queue** for human review.
- Nothing is lost when Odoo is down for maintenance.

## Monitoring

| Metric | Alert when |
|--------|-----------|
| Last successful run | Older than 2 x schedule interval |
| Error count | Above threshold per run |
| Dead-letter queue size | Greater than 0 |
| Processing lag | Orders older than X minutes not in Odoo |
| Reconciliation differences | Any unexplained difference |

> **Consultant tip:** Define the **support model** together with the integration: who receives alerts, response time, how to replay a failed message. An integration without an owner fails silently.

## Exercise

1. Draw the Sunrise integration landscape (web shop, payment, CRM, bank, 3PL, Odoo) as point-to-point and as hub-and-spoke.
2. For the nightly CRM sync, write the watermark logic and decide the page size.
3. Define four monitoring alerts with thresholds and owners.

**Expected output:** two diagrams, a pseudo-code or Python delta sync, and an alert table.

## Key takeaways

- Middleware centralises mapping, retries and monitoring.
- Delta sync uses a watermark on \`write_date\`, saved only after success.
- Paginate, prevent overlapping runs and upsert on the target.
- Queues with dead-letter handling make integrations resilient; monitoring makes them supportable.`,
        },
        {
          slug: "error-handling-retries-idempotency",
          title: "Error handling, retries, idempotency and reconciliation",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0 / 19.0",
          scope: ["customization", "standard"],
          body: `## Business context

On Black Friday, Sunrise's web shop sent 2,000 orders. Odoo restarted for 90 seconds during peak; the integration retried every order immediately, timed out again, and some orders were created **twice** because the first attempt had actually succeeded before the timeout. Finance found 37 duplicate invoices a week later. This lesson is about making sure that never happens.

## Classify errors first

| Class | Examples | Strategy |
|-------|----------|----------|
| Transient | Timeout, connection reset, 502/503/504, 429 | Retry with exponential backoff and jitter |
| Permanent - data | Validation error, product not found, missing required field | Do not retry; send to error queue, alert data owner |
| Permanent - configuration | Access error, authentication failed, revoked key | Do not retry; alert integration owner immediately |
| Unknown outcome | Timeout **after** the request was sent | Retry only if the operation is idempotent; otherwise check first |

## Exponential backoff with jitter

\`\`\`python
import logging
import random
import time
import xmlrpc.client

_logger = logging.getLogger("integration")

TRANSIENT = (ConnectionError, TimeoutError, xmlrpc.client.ProtocolError, OSError)


def with_retry(func, *args, max_attempts=5, base_delay=1.0, max_delay=60.0, **kwargs):
    for attempt in range(1, max_attempts + 1):
        try:
            return func(*args, **kwargs)
        except xmlrpc.client.Fault:
            raise                                   # business/access error: never retry
        except TRANSIENT as exc:
            if attempt == max_attempts:
                _logger.error("Giving up after %s attempts: %s", attempt, exc)
                raise
            delay = min(max_delay, base_delay * 2 ** (attempt - 1))
            delay += random.uniform(0, delay / 2)   # jitter spreads retries
            _logger.warning("Attempt %s failed (%s); retrying in %.1fs", attempt, exc, delay)
            time.sleep(delay)
\`\`\`

| Attempt | Base delay (s) |
|---------|---------------|
| 1 fails | 1 |
| 2 fails | 2 |
| 3 fails | 4 |
| 4 fails | 8 |
| 5 fails | give up, dead-letter |

Jitter prevents thousands of clients retrying at the exact same second. Honour \`Retry-After\` headers from 429/503 responses when present.

## Idempotency: retries without duplicates

An operation is idempotent if repeating it does not change the result. \`create\` is **not** idempotent. Make it so:

### 1. Idempotency keys (APIs that support them)

Many payment and commerce APIs accept an \`Idempotency-Key\` header: the server remembers the key and returns the original result for repeats. Generate one key per business operation (e.g. per order), not per attempt.

### 2. Natural or external keys - upsert

Odoo's external API has no built-in idempotency-key header, so search first by a unique business key, then create or update:

\`\`\`python
def upsert_order(call, external_ref: str, values: dict) -> int:
    """Create the sales order once per external reference; update if it exists."""
    existing = call("sale.order", "search", [["client_order_ref", "=", external_ref]], limit=1)
    if existing:
        return existing[0]          # already imported: do not create again
    values = dict(values, client_order_ref=external_ref)
    return call("sale.order", "create", values)
\`\`\`

Good matching keys:

| Entity | Key |
|--------|-----|
| Product | \`default_code\` (internal reference / SKU) - ensure uniqueness |
| Customer | External system id stored on the partner, or a unique email/VAT (with care) |
| Order | External order number in \`client_order_ref\` (or a dedicated field) |
| Any record | **External ID** (\`ir.model.data\`, e.g. \`webshop.order_10045\`) - the mechanism Odoo imports use |

Search-then-create still has a race window if two workers process the same message simultaneously. Protect with a single worker per key, a queue that deduplicates, or a unique constraint (e.g. a custom field with an SQL unique constraint - customization).

## Logging that helps support

Log per message: correlation id, external reference, operation, result, duration, error class. Never log secrets or full personal data.

\`\`\`text
2024-11-29T10:15:02Z INFO  corr=7f3c9a2e ext=WEB-10045 op=create_order result=created odoo_id=812 ms=640
2024-11-29T10:15:03Z WARN  corr=7f3c9a2f ext=WEB-10046 op=create_order attempt=1 error=Timeout retry_in=1.3s
2024-11-29T10:15:05Z INFO  corr=7f3c9a2f ext=WEB-10046 op=create_order result=exists odoo_id=813 ms=210
2024-11-29T10:15:06Z ERROR corr=7f3c9a30 ext=WEB-10047 op=create_order error=ValidationError msg="Product SKU-999 not found" -> dead-letter
\`\`\`

Note line 3: the retry found the order already created by the timed-out first attempt - the upsert prevented a duplicate.

## Reconciliation reports

Even with perfect code, prove consistency regularly:

| Check | Source | Target | Frequency |
|-------|--------|--------|-----------|
| Order count and total per day | Web shop | Odoo \`sale.order\` with \`client_order_ref\` | Daily |
| Orders in shop missing in Odoo | Shop order list | Odoo search by ref | Daily |
| Duplicate refs in Odoo | - | Group by \`client_order_ref\` having count > 1 | Daily |
| Stock per SKU | Odoo | 3PL snapshot | Daily |
| Payments vs payouts | Provider report | Odoo journal | Per payout |

A reconciliation report lists differences with reasons and owners; zero unexplained differences is the target.

> **Consultant tip:** Ask the client's finance team to sign off on the reconciliation report format before go-live. It becomes the acceptance criterion for the integration and the first thing to check when someone says "the numbers don't match".

## Exercise

1. Implement \`with_retry\` and simulate failures with a function that raises \`TimeoutError\` twice, then succeeds.
2. Implement \`upsert_order\` against your **test database** and call it three times with the same reference.
3. Write the SQL-free reconciliation: using the API, list \`client_order_ref\` values appearing more than once (hint: \`read_group\`/\`search_read\` then count in Python).

**Expected output:**

\`\`\`text
Attempt 1 failed (timeout); retrying in 1.2s
Attempt 2 failed (timeout); retrying in 2.7s
Success on attempt 3
upsert WEB-TEST-1 -> 901 (created)
upsert WEB-TEST-1 -> 901 (exists)
upsert WEB-TEST-1 -> 901 (exists)
Duplicates found: 0
\`\`\`

## Key takeaways

- Classify errors: retry transient ones only, with exponential backoff and jitter.
- Make creates idempotent with idempotency keys, external ids or search-then-upsert.
- Log with correlation ids and without secrets.
- Reconcile regularly; differences must be explained.`,
        },
        {
          slug: "practical-integration-assignments",
          title: "Practical integration assignments and design template",
          durationMin: 60,
          odooVersions: "Odoo 17.0 (19.0 API notes)",
          scope: ["standard", "customization"],
          body: `## How to use this lesson

These six assignments combine everything in the course. Do them in order, as the dedicated integration user, against a **training/test database only**.

> **Mandatory rules for every assignment**
> - Read all credentials from **environment variables** (\`ODOO_URL\`, \`ODOO_DB\`, \`ODOO_USER\`, \`ODOO_API_KEY\`, plus any sandbox keys).
> - **Never expose API keys in frontend code, repositories or documents** - including your assignment submission and screenshots.
> - **Only run against a training/test database.** Prefix created records with \`TEST-\`.
> - On Odoo 19+, the legacy XML-RPC/JSON-RPC endpoints are deprecated; check the External API documentation for your version and use JSON-2 where appropriate.

## Assignment overview

| # | Assignment | Skills |
|---|-----------|--------|
| 1 | Read customer data via authorized API | Authentication, \`search_read\`, least privilege |
| 2 | Create/update a record in a test database | \`create\`, \`write\`, error handling |
| 3 | Sync products from an external system | Mapping, upsert by \`default_code\`/external id |
| 4 | Simulate an order integration | Lookups, order lines, confirmation |
| 5 | Handle duplicate requests and API errors | Idempotency, retries, logging |
| 6 | Document an integration design | Specification, security, reconciliation |

## 1. Read customer data via authorized API

Create a read-only integration user (Contacts/Sales read). Fetch customers changed in the last 30 days with name, email, country and \`write_date\`, paginated by 50, and write them to a CSV file.

*Acceptance:* script uses environment variables; user cannot write (prove with a negative test); output CSV contains no fields beyond those requested.

## 2. Create/update a record in a test database

Create a customer \`TEST-Integration Co\`, then update its phone and address. Catch and print the Odoo error when you omit the required \`name\`.

*Acceptance:* running the script twice does not create a second customer (search first by a unique key such as \`ref\` or email).

## 3. Sync products from an external system

Given an external JSON catalogue:

\`\`\`json
[
  {"sku": "DESK-120", "title": "Standing Desk 120cm", "price": 249.90, "barcode": "5400000000017"},
  {"sku": "CHAIR-07", "title": "Ergo Chair", "price": 89.00, "barcode": "5400000000024"}
]
\`\`\`

Upsert into Odoo by \`default_code\`:

\`\`\`python
def upsert_product(call, item):
    values = {
        "name": item["title"],
        "default_code": item["sku"],
        "list_price": item["price"],
        "barcode": item["barcode"],
    }
    ids = call("product.product", "search", [["default_code", "=", item["sku"]]], limit=1)
    if ids:
        call("product.product", "write", ids, values)
        return ids[0], "updated"
    return call("product.product", "create", values), "created"
\`\`\`

Extension: register an External ID for each product (\`ir.model.data\` with your own module prefix such as \`webshop_sync\`) and match on it instead; this requires additional rights for the integration user - discuss whether that is acceptable.

*Acceptance:* first run creates, second run updates, no duplicates; a summary line \`created=2 updated=0 errors=0\`.

## 4. Simulate an order integration

From a sample shop order JSON (external ref, customer email, lines with SKU and quantity): find or create the customer by email, look up products by SKU, create a quotation with \`client_order_ref\` = external ref, and confirm it with \`action_confirm\`.

*Acceptance:* unknown SKU produces a clear error and no partial order; order visible in Odoo with the external reference; confirmation succeeds when the integration user has the rights.

## 5. Handle duplicate requests and API errors

Send the same order three times, and simulate two transient failures (raise \`TimeoutError\` in a wrapper). Use exponential backoff for transient errors and upsert by \`client_order_ref\`.

*Acceptance:* exactly one order exists; logs show retries with increasing delays; validation errors are not retried; a reconciliation query shows zero duplicate references.

## 6. Document an integration design

Fill the template below for the Sunrise web shop to Odoo order integration.

### Integration design document template

| Section | Content to provide |
|---------|-------------------|
| Integration name and id | e.g. INT-01 Web shop orders to Odoo |
| Business purpose | Why it exists, business owner |
| Systems and versions | Source, target, Odoo version/edition, API style (XML-RPC/JSON-RPC/JSON-2) |
| Direction and trigger | One-way/bi-directional; webhook, queue, schedule (frequency) |
| Data objects and volume | Entities, records per day, peak |
| System of record | Owner per entity/field |
| Field mapping | Link to mapping table (source field, target field, transformation, required, default) |
| Matching keys / idempotency | e.g. \`client_order_ref\`, \`default_code\`, external ids, idempotency keys |
| Authentication and authorization | Method, dedicated integration user, groups granted |
| Secrets | Names only, storage location, owner, rotation schedule (no values!) |
| Error handling | Error classes, retry policy (attempts, backoff), dead-letter handling |
| Logging and monitoring | What is logged (no secrets/PII), alerts, thresholds, recipients |
| Reconciliation | Reports, frequency, sign-off owner |
| Environments | Test/staging/production endpoints (no credentials), neutralization |
| Security review | Data classification, personal data, transport encryption |
| Testing | Test cases incl. negative and duplicate scenarios |
| Support model | Who fixes what, response times, replay procedure |
| Version risks | Deprecations (e.g. legacy RPC in Odoo 19), upgrade plan |

### Field mapping sub-template

| Source field | Target model.field | Transformation | Required | Default / if missing | Notes |
|--------------|-------------------|----------------|----------|---------------------|-------|
| | | | | | |

*Acceptance:* every row filled; no secret values anywhere; reviewed by a peer.

> **Consultant tip:** The design document is not paperwork - it is the contract between business, IT and the integrator. Most integration disputes are resolved by pointing at a row of this table, or caused by its absence.

## Submission checklist

- [ ] Scripts in a repository **without** credentials; \`.env.example\` with names only
- [ ] Output logs (secrets masked) and CSV samples
- [ ] Screenshots from the **test** database
- [ ] Completed design document and mapping table
- [ ] Short reflection: what would change for Odoo 19's JSON-2 API

## Key takeaways

- Practise on test databases with dedicated users and environment-based secrets.
- Upsert by business keys to stay idempotent.
- Handle transient errors with backoff and never retry validation errors.
- A complete design document is part of every integration deliverable.`,
          resources: [
            { title: "Odoo 17 External API", kind: "link", url: DOC_EXTERNAL_API },
            { title: "Odoo 17 developer documentation", kind: "link", url: DOC_DEV },
          ],
        },
      ],
    },
  ],

  /* -------------------------------------------------------------------- */
  /* Assessment                                                            */
  /* -------------------------------------------------------------------- */
  assessment: {
    slug: "integration-fundamentals-final",
    title: "Integration Fundamentals - Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which HTTP method is NOT idempotent by definition?",
        kind: "single",
        options: ["GET", "PUT", "DELETE", "POST"],
        correct: [3],
        explanation: "POST typically creates a new resource each time; repeating it may create duplicates unless an idempotency mechanism is used.",
      },
      {
        prompt: "An API returns HTTP 403. What does it mean?",
        kind: "single",
        options: [
          "The credentials are missing or invalid",
          "The caller is authenticated but not allowed to perform the action",
          "The server is temporarily unavailable",
          "The resource was created",
        ],
        correct: [1],
        explanation: "403 Forbidden: authenticated but not authorized. 401 indicates missing/invalid credentials.",
      },
      {
        prompt: "Which errors are reasonable candidates for automatic retry with exponential backoff? (Select all that apply)",
        kind: "multiple",
        options: ["HTTP 503 Service Unavailable", "HTTP 429 Too Many Requests", "Validation error: required field missing", "Connection timeout"],
        correct: [0, 1, 3],
        explanation: "Transient errors (503, 429, timeouts) may be retried; validation errors are permanent and must be fixed, not retried.",
      },
      {
        prompt: "Where may an Odoo API key be stored for a production integration?",
        kind: "single",
        options: [
          "In the website's JavaScript so the shop can call Odoo directly",
          "In the Git repository, in a private repo",
          "In an environment variable or secrets vault of the backend/middleware",
          "In the integration specification document for reference",
        ],
        correct: [2],
        explanation: "Secrets belong in environment variables or a vault; never in frontend code, repositories or documents.",
      },
      {
        prompt: "In Odoo's XML-RPC API, which endpoint and method are used to log in?",
        kind: "single",
        options: [
          "/xmlrpc/2/object with execute_kw",
          "/xmlrpc/2/common with authenticate",
          "/web/login with POST",
          "/jsonrpc with search_read",
        ],
        correct: [1],
        explanation: "common.authenticate(db, login, password_or_api_key, {}) returns the uid; object.execute_kw then calls model methods.",
      },
      {
        prompt: "Access rights and record rules apply to calls made through the Odoo external API.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "External API calls run as the authenticated user through the ORM, so all security applies - which is why least privilege works.",
      },
      {
        prompt: "What is the main purpose of verifying an HMAC signature on an incoming webhook?",
        kind: "single",
        options: [
          "To compress the payload",
          "To prove the request came from the expected sender and was not altered",
          "To prevent duplicates",
          "To convert XML to JSON",
        ],
        correct: [1],
        explanation: "The signature authenticates the sender and protects integrity. Duplicates are handled by idempotency (event ids).",
      },
      {
        prompt: "A webhook provider retries an event because your endpoint responded slowly. How do you prevent processing it twice?",
        kind: "single",
        options: [
          "Disable retries at the provider",
          "Store processed event ids (with a unique constraint) and ignore repeats",
          "Respond with HTTP 500",
          "Process events in random order",
        ],
        correct: [1],
        explanation: "Idempotent processing keyed on the event id makes duplicates harmless.",
      },
      {
        prompt: "When syncing products from an external system into Odoo, what prevents duplicate products?",
        kind: "single",
        options: [
          "Always calling create",
          "Upserting by a unique key such as default_code or an External ID",
          "Deleting all products before each sync",
          "Using a faster network",
        ],
        correct: [1],
        explanation: "Search by a unique business key or external id, then write or create (upsert).",
      },
      {
        prompt: "What changed regarding Odoo's external API in Odoo 19?",
        kind: "single",
        options: [
          "The external API was removed entirely",
          "A new JSON-2 API was introduced and the legacy XML-RPC/JSON-RPC endpoints were deprecated, with removal planned in a future version",
          "XML-RPC became the only supported protocol",
          "API keys were replaced by passwords",
        ],
        correct: [1],
        explanation: "Odoo 19 introduced JSON-2 and deprecated legacy RPC endpoints; check the External API documentation for your version.",
      },
      {
        prompt: "Which practices belong to a dedicated integration user setup? (Select all that apply)",
        kind: "multiple",
        options: [
          "Only the groups the integration needs",
          "Separate users and keys for test and production",
          "Using the administrator account for convenience",
          "Documented owner and key rotation schedule",
        ],
        correct: [0, 1, 3],
        explanation: "Least privilege, environment separation and documented ownership/rotation; never the admin account.",
      },
      {
        prompt: "Automatic bank statement synchronisation through Odoo's aggregation providers is a feature of which offering?",
        kind: "single",
        options: [
          "Odoo Community only",
          "Odoo Enterprise (including Odoo Online/Odoo.sh) - coverage to be verified per bank and country",
          "Any Python script",
          "PostgreSQL extensions",
        ],
        correct: [1],
        explanation: "Bank synchronisation via providers is an Enterprise feature; always verify bank and country coverage for the client's version.",
      },
    ],
  },

  /* -------------------------------------------------------------------- */
  /* Assignments                                                           */
  /* -------------------------------------------------------------------- */
  assignments: [
    {
      slug: "integration-fundamentals-product-order-sync",
      title: "Product and order sync against a test database",
      instructions: `## Scenario

Sunrise Office Supplies' web shop must push products and orders into Odoo. Build a working prototype against a **training/test database only**.

## Tasks

1. Create a dedicated integration user with least-privilege groups; create an API key and store it in an environment variable.
2. Write a Python script (XML-RPC or JSON-RPC on Odoo 17; note what would change with JSON-2 on Odoo 19) that:
   - upserts products from a JSON file by \`default_code\`;
   - imports orders from a JSON file: finds/creates customers by email, creates quotations with \`client_order_ref\`, confirms them;
   - retries transient errors with exponential backoff and jitter, never retries validation/access errors;
   - is idempotent: running it three times creates no duplicates.
3. Produce a reconciliation report: orders in the file vs orders in Odoo, duplicates, missing SKUs.

## Rules

- All credentials from environment variables; submit a \`.env.example\` with names only.
- Never expose API keys in frontend code, repositories, documents or screenshots.

## Deliverables

- Source code (no secrets)
- Run logs for three consecutive runs (secrets masked)
- Reconciliation report
- Short README: how to run, environment variables required, known limitations

## Evaluation criteria

| Criterion | Weight |
|-----------|--------|
| Correct use of the Odoo external API | 25% |
| Idempotency (no duplicates on re-run) | 25% |
| Error classification and retry logic | 20% |
| Secrets handling and least privilege | 20% |
| Reconciliation and documentation | 10% |`,
    },
    {
      slug: "integration-fundamentals-design-document",
      title: "Integration design document: 3PL warehouse",
      instructions: `## Scenario

Sunrise will outsource warehousing to a 3PL provider. Odoo must send delivery orders to the 3PL; the 3PL returns shipment confirmations (quantities, lots, tracking numbers) by webhook and a daily stock snapshot by file.

## Tasks

Using the integration design document template from the practical assignments lesson, write the design covering:

1. Business purpose, systems, Odoo version/edition and API style (with the Odoo 19 JSON-2 deprecation note).
2. Data flows, triggers and volumes; system of record per entity.
3. Field mapping tables for delivery order out, shipment confirmation in and stock snapshot in.
4. Matching keys and idempotency (event ids, delivery references, external ids).
5. Authentication (webhook signatures, API keys, integration user and groups) and secrets handling (names, storage, rotation - no values).
6. Error handling, retry policy, dead-letter process, monitoring and alerts.
7. Reconciliation reports (stock per SKU, open deliveries) and sign-off owners.
8. Test plan including negative, duplicate and out-of-order scenarios, run only on a test database.
9. A conceptual note on whether a standard or third-party connector exists (mark as "verify").

## Deliverables

- Design document (markdown or doc), mapping tables, landscape diagram
- Test case list (at least 10 cases)

## Evaluation criteria

| Criterion | Weight |
|-----------|--------|
| Completeness against the template | 25% |
| Mapping quality and data ownership | 20% |
| Security and secrets handling | 20% |
| Error handling, idempotency and reconciliation | 25% |
| Clarity and testability | 10% |`,
    },
  ],
};
