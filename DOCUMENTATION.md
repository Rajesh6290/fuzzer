# FuzzX — Complete Guide & Interview Prep

---

## PART 1 — Understanding the Project

---

### What Even Is FuzzX?

Okay so imagine you have a website with a search box. Normal users type things like "shoes" or "laptops." But a hacker types things like `' OR 1=1--` or `<script>alert(1)</script>`.

**FuzzX is the tool that does that hacker's job automatically.**

You give it a URL. It fires hundreds of those nasty inputs at it. It watches what the website says back. If the website leaks an error, slows down weirdly, or reflects something it shouldn't — FuzzX flags it as a vulnerability.

That's it. That's the whole idea.

---

### Why Does Something Like This Exist?

Because manually testing every input of every page of every website is impossible. A decent web app has hundreds of endpoints and parameters. No human can test all of them by hand.

FuzzX automates it. You point it at a target, pick what attacks to test, hit start — and go get coffee.

---

### How Does It Actually Work? (Step by Step)

**Step 1 — You fill out a form**

You give FuzzX:

- The URL you want to test (e.g., `https://example.com/search?q=shoes`)
- What HTTP method (GET? POST?)
- Any headers or cookies (if the endpoint needs login)
- Which attack types to test
- How many payloads to send

**Step 2 — FuzzX figures out where to inject**

It looks at your URL and asks: _"where can I put a payload here?"_

- URL has `?q=shoes`? → injects into `q`
- POST body has `{"username": "john"}`? → injects into `username`
- No parameters at all? → tries common names like `id`, `search`, `query`, `input` automatically
- Also always injects into `User-Agent` and `X-Forwarded-For` headers — because devs forget to sanitize those

**Step 3 — It sends a normal request first (baseline)**

Before attacking, it sends one clean request to measure:

- How fast does the server normally respond? (say 300ms)
- How big is the normal response? (say 5KB)

This is the "normal." Everything weird gets compared to this.

**Step 4 — It mutates payloads**

FuzzX doesn't just send `' OR 1=1` once. It also sends:

- `%27%20OR%201%3D1` — URL encoded, to bypass filters
- `%2527%2520OR%25201%253D1` — double encoded, to bypass decode-then-filter
- `'/**/OR/**/1=1` — spaces replaced with comments, to confuse WAFs
- `' oR 1=1` — mixed case, because some filters are case-sensitive

So one payload becomes 3-4 variants automatically.

**Step 5 — The fuzzing loop runs**

FuzzX sends up to **5 requests at the same time** (not all at once — that would crash the target). As soon as one finishes, the next starts. Like a worker pool.

For every request that comes back, it asks the analyzer: _"does this response look suspicious?"_

**Step 6 — The analyzer checks the response**

This is where the actual detection happens. Different attacks are detected differently:

- **SQL Injection** → did the response contain `you have an error in your sql syntax`? Did the server take 5+ seconds when we sent `SLEEP(5)`?
- **XSS** → did `<script>alert(1)</script>` come back in the HTML unescaped?
- **Path Traversal** → does the response contain `root:x:0:0:` (start of `/etc/passwd`)?
- **Command Injection** → does it contain `uid=0(root)` or did the server freeze after `; sleep 5`?
- **SSRF** → did the server return AWS metadata after we sent `http://169.254.169.254/`?
- **SSTI** → if we send `{{7*7}}` and the server returns `49`... it evaluated our code. That's bad.

**Step 7 — Findings get saved**

Every confirmed vulnerability is saved with:

- What parameter was vulnerable
- Exactly which payload triggered it
- What the evidence was (the error, the timing, the reflection)
- Severity: critical / high / medium / low
- A recommendation on how to fix it

**Step 8 — You see the report**

Dashboard shows everything. You can see live logs as the scan runs, then the full vulnerability report when done.

---

### What Is the Project Built With?

| Thing           | What it does                                                           |
| --------------- | ---------------------------------------------------------------------- |
| **Next.js**     | One framework for both the website UI and the backend API              |
| **MongoDB**     | Stores users, scans, vulnerabilities                                   |
| **TypeScript**  | So the code doesn't break from typos                                   |
| **JWT cookies** | Login sessions — stored as a secure HttpOnly cookie                    |
| **bcryptjs**    | Passwords are hashed, never stored plain                               |
| **p-limit**     | Keeps HTTP requests to max 5 concurrent — so you don't DDoS the target |
| **Recharts**    | The graphs on the dashboard                                            |

---

### What Attacks Does It Test?

| Attack                | In Simple Words                                      |
| --------------------- | ---------------------------------------------------- |
| **SQL Injection**     | Tricks the database into running your SQL            |
| **XSS**               | Injects JavaScript into the page                     |
| **Path Traversal**    | Reads files like `/etc/passwd` using `../`           |
| **Command Injection** | Runs OS commands like `whoami` on the server         |
| **SSRF**              | Makes the server talk to internal systems            |
| **Open Redirect**     | Forces the site to redirect you to evil.com          |
| **XXE**               | Reads files through an XML parser                    |
| **LDAP Injection**    | Bypasses directory authentication                    |
| **SSTI**              | Executes code inside template engines                |
| **NoSQL Injection**   | Bypasses MongoDB queries with `$gt`, `$ne` operators |
| **GraphQL Injection** | Dumps your whole database schema via introspection   |

---

## PART 2 — Interview Questions (Logical, Not Textbook)

These are the real questions. The ones that check if you actually understand your own project.

---

**"Your baseline is one request. What if that one request was slow because of a network hiccup? Now every timing check is wrong."**

Yeah that's a real weakness. One sample is not reliable. A better approach is take 3-5 baseline requests and average them. Right now if the first request hits a slow moment, the adaptive threshold inflates and you miss time-based injections — or deflates and you get false positives. It's a known tradeoff I made for speed.

---

**"How do you know a finding isn't a false positive?"**

Honestly, you can't be 100% sure from one request. For error-based SQLi we're fairly confident — the DB error string is specific enough. For time-based it's softer — we report confidence as `medium` unless the delay is 1.5× the threshold, then `high`. For XSS, if the exact payload reflects verbatim in the HTML — that's high confidence. But the tool always shows you the exact evidence so you can verify it manually. It's a starting point, not a verdict.

---

**"You check for a stop signal every 10 requests. So the user clicks stop and it could still run 9 more requests. Is that acceptable?"**

For a fuzzer — yes, that's a deliberate tradeoff. Checking the DB on every single request would add a DB round-trip to every HTTP request, slowing everything down massively. 10 is a balance. If it's truly time-sensitive you'd use Redis pub/sub so the engine gets the stop signal pushed to it immediately instead of polling.

---

**"What happens when the log array hits 5000 entries and you trim it? You're losing history."**

Correct. The trim keeps the most recent 5000 and drops the oldest. So the beginning of a long scan is lost. The real fix is to move logs out of the Scan document entirely into a separate collection, or stream them to a file. I kept them in the document for simplicity since it works for most scans.

---

**"Your mutations include double URL encoding. But you're injecting into a URL query param which Next.js already decodes once. Could your double-encoded payload arrive wrong?"**

Yes — and it's intentional. Some servers decode twice (sloppy middleware), which is exactly what double encoding exploits. If the server only decodes once, the double-encoded payload just arrives as a URL-encoded string and won't trigger anything. It's not harmful, it just won't fire. You're probing for misconfigured servers that over-decode.

---

**"You send up to 5 concurrent requests. But your time-based detection depends on response time. Doesn't concurrency corrupt the timing?"**

It can. If 5 slow requests are running in parallel and one of them is your `SLEEP(5)` payload, the measured time might be inflated by queue wait time, not just the sleep. The adaptive threshold helps but in a loaded scanner it's still noisy. The real fix is to send time-based payloads serially — concurrency 1 for those. That's an optimization worth making.

---

**"Why do you store findings in MongoDB instead of returning them from the engine function?"**

Because the engine runs inside an API route and that HTTP request could time out or get killed. If you return results through the request, you lose everything if the connection drops. Saving to DB as you go means even if the browser closes or the server restarts, all findings so far are persisted. The frontend polls for progress separately.

---

**"Could someone point FuzzX at google.com and attack a site they don't own?"**

Yes. The tool doesn't verify ownership of the target. That's the same as Burp Suite or any other security tool. In a production product you'd add ownership verification (DNS TXT record check, or prove you control the domain). For a personal scanner it's on the user.

---

**"Your XSS detection checks if the payload is reflected in the response body. What if the server HTML-encodes it to `&lt;script&gt;` — would you still flag it?"**

No — and that's correct behaviour. `&lt;script&gt;` is properly escaped, the browser won't execute it. The analyzer checks for the raw unescaped version only. If only the encoded version appears, it doesn't trigger. That's the detection working correctly.

---

**"You retry failed requests 2 times. But what if the target is rate-limiting you? Your retry makes it worse."**

The retry is specifically for network errors — DNS failure, connection refused, socket hang up. It's not for HTTP 429. Those come back as a valid HTTP response with statusCode 429 and the engine just records and moves on. There's also a configurable `delay` between requests (default 0ms) which users can set higher if they're hitting rate limits.

---

**"JWT is stateless — once issued you can't revoke it. If a user changes their password, their old token still works for 7 days. Is that a problem?"**

Yes, it's a known limitation of stateless JWTs. The fix is to store a token version in the DB and check it on every request. That adds a DB lookup per request though, which removes the stateless benefit. For this app — personal tool — it's an acceptable tradeoff. For a multi-user production app I'd add token versioning or switch to server-side sessions.

---

**"Your NoSQL injection detection just checks for a 200 response on MongoDB operator payloads. Isn't that a ton of false positives?"**

Fair criticism. The check also looks at response body indicators — non-empty, non-error content — that suggests a successful data return. But yes, this attack type has the lowest confidence. It's flagged as `medium` at best and always needs manual verification. NoSQL injection is genuinely hard to detect black-box without getting a login success or data dump back in the response.

---

**"What's the biggest thing you'd fix if you had more time?"**

The baseline is the most impactful. Right now one slow baseline request can break all time-based detections. After that — sending time-based payloads at concurrency 1, and moving logs to a separate collection so long scans don't hit the MongoDB 16MB document limit. Those three changes would make it production-ready.
