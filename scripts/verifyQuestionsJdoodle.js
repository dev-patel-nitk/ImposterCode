const questions = require("../server/questions");

const CREDENTIALS = [
  { clientId: "cfa368c3611d5a5a2aa6f2ce9f9df889", clientSecret: "f7686465d7b2f52c8e3fdfd5f7d3d79aeb0dec44490fd79f5d89825adc618017" },
  { clientId: "7397db393db95d2eaa3e95fbe68f30e0", clientSecret: "9186750c8ad4b8b0630be1882603758d5b88336c152a2d370d183b159d5f2335" },
  { clientId: "f39ce27c14cb4ac8378f9ae4f22ffaed", clientSecret: "1c33ea31a870274f864fc8c94b1ebaca744b55967174050d46be1dd5b96fcc80" }
];

let credIdx = 0;
const getCred = () => {
  const c = CREDENTIALS[credIdx];
  credIdx = (credIdx + 1) % CREDENTIALS.length;
  return c;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (s) => String(s ?? "").trim().toLowerCase().replace(/\r/g, "");

const commonHelpers = `
const fs = require("fs");
const input = fs.readFileSync(0, "utf8").replace(/\\r/g, "");
const lines = input.split("\\n");
let lineIdx = 0;
const readLine = () => (lineIdx < lines.length ? lines[lineIdx++] : "");
const readNonEmptyLine = () => {
  while (lineIdx < lines.length) {
    const l = lines[lineIdx++];
    if (l.trim() !== "") return l;
  }
  return "";
};
const readIntLine = () => parseInt(readNonEmptyLine().trim(), 10);
const splitInts = (line) => (line.trim() ? line.trim().split(/\\s+/).map(Number) : []);
`;

function solutionFor(title) {
  switch (title) {
    case "Two Sum":
      return `
${commonHelpers}
const t = readIntLine();
let out = [];
for (let tc = 0; tc < t; tc++) {
  const [n, target] = splitInts(readNonEmptyLine());
  const nums = splitInts(readNonEmptyLine()).slice(0, n);
  const map = new Map();
  let ans = "-1 -1";
  for (let i = 0; i < nums.length; i++) {
    const c = target - nums[i];
    if (map.has(c)) { ans = map.get(c) + " " + i; break; }
    map.set(nums[i], i);
  }
  out.push(ans);
}
console.log(out.join("\\n"));
`;
    case "Valid Parentheses":
      return `
${commonHelpers}
const t = readIntLine();
const mp = {')':'(',']':'[','}':'{'};
let out = [];
for (let i = 0; i < t; i++) {
  const s = readNonEmptyLine().trim();
  let st = [];
  let ok = true;
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') st.push(ch);
    else if (st.pop() !== mp[ch]) { ok = false; break; }
  }
  if (st.length) ok = false;
  out.push(ok ? "1" : "0");
}
console.log(out.join("\\n"));
`;
    case "Longest Substring Without Repeating Characters":
      return `
${commonHelpers}
const t = readIntLine();
let out = [];
for (let tc = 0; tc < t; tc++) {
  const s = readNonEmptyLine();
  let l = 0, best = 0;
  const m = new Map();
  for (let r = 0; r < s.length; r++) {
    if (m.has(s[r]) && m.get(s[r]) >= l) l = m.get(s[r]) + 1;
    m.set(s[r], r);
    best = Math.max(best, r - l + 1);
  }
  out.push(String(best));
}
console.log(out.join("\\n"));
`;
    case "Binary Tree Level Order Traversal":
      return `
${commonHelpers}
const t = readIntLine();
let out = [];
for (let tc = 0; tc < t; tc++) {
  const n = readIntLine();
  if (!n) { out.push("[]"); continue; }
  const arr = readNonEmptyLine().trim().split(/\\s+/).slice(0, n);
  let levels = [];
  let cur = [0];
  while (cur.length) {
    const vals = [];
    const nxt = [];
    for (const idx of cur) {
      if (idx >= arr.length || arr[idx] === "-1" || arr[idx] === "null") continue;
      vals.push(arr[idx]);
      const l = idx * 2 + 1, r = idx * 2 + 2;
      if (l < arr.length && arr[l] !== "-1" && arr[l] !== "null") nxt.push(l);
      if (r < arr.length && arr[r] !== "-1" && arr[r] !== "null") nxt.push(r);
    }
    if (vals.length) levels.push("[" + vals.join(",") + "]");
    cur = nxt;
  }
  out.push("[" + levels.join(",") + "]");
}
console.log(out.join("\\n"));
`;
    case "Trapping Rain Water":
      return arrayNProgram(`
let l=0, r=a.length-1, lm=0, rm=0, res=0;
while(l<r){ if(a[l]<a[r]){ lm=Math.max(lm,a[l]); res+=lm-a[l++]; } else { rm=Math.max(rm,a[r]); res+=rm-a[r--]; } }
return String(res);`);
    case "Maximum Subarray":
      return arrayNProgram(`
let cur=-1e18,best=-1e18;
for(const x of a){ cur=Math.max(x, cur + x); best=Math.max(best, cur); }
return String(best);`);
    case "Contains Duplicate":
      return arrayNProgram(`return new Set(a).size !== a.length ? "1":"0";`);
    case "Single Number":
      return arrayNProgram(`let x=0; for(const v of a) x^=v; return String(x);`);
    case "Majority Element":
      return arrayNProgram(`
let c=0, cand=0;
for(const v of a){ if(c===0) cand=v; c += (v===cand?1:-1); }
return String(cand);`);
    case "Valid Palindrome":
      return stringLineProgram(`
const t = readIntLine();
let out = [];
for(let tc=0; tc<t; tc++){
  const s = readNonEmptyLine().toLowerCase().replace(/[^a-z0-9]/g,'');
  let i=0,j=s.length-1,ok=true;
  while(i<j){ if(s[i++]!==s[j--]){ok=false;break;} }
  out.push(ok?"1":"0");
}
console.log(out.join("\\n"));
`);
    case "Valid Anagram":
      return `
${commonHelpers}
const t = readIntLine();
let out = [];
for (let tc = 0; tc < t; tc++) {
  const s = readNonEmptyLine();
  const tt = readNonEmptyLine();
  if (s.length !== tt.length) { out.push("0"); continue; }
  const m = new Map();
  for (const ch of s) m.set(ch, (m.get(ch)||0)+1);
  for (const ch of tt) m.set(ch, (m.get(ch)||0)-1);
  let ok = true;
  for (const v of m.values()) if (v !== 0) { ok = false; break; }
  out.push(ok ? "1" : "0");
}
console.log(out.join("\\n"));
`;
    case "Length of Last Word":
      return `
${commonHelpers}
const t = readIntLine();
let out = [];
for(let tc=0; tc<t; tc++){
  readNonEmptyLine(); // legacy leading count in dataset
  const s = readNonEmptyLine();
  const w = s.trim().split(/\\s+/);
  out.push(String(w[w.length-1]?.length || 0));
}
console.log(out.join("\\n"));
`;
    case "Climbing Stairs":
      return intPerLineProgram(`
if(n<=2) return String(n);
let a=1,b=2;
for(let i=3;i<=n;i++){ const c=a+b; a=b; b=c; }
return String(b);
`);
    case "Fibonacci Number":
      return intPerLineProgram(`
if(n<=1) return String(n);
let a=0,b=1;
for(let i=2;i<=n;i++){ const c=a+b; a=b; b=c; }
return String(b);
`);
    case "Power of Two":
      return intPerLineProgram(`return (n>0 && (n & (n-1))===0) ? "1":"0";`);
    case "Missing Number":
      return arrayNProgram(`
const n = a.length;
let x = n;
for(let i=0;i<n;i++) x ^= i ^ a[i];
return String(x);
`);
    case "Reverse Integer":
      return intPerLineProgram(`
let x=n, sign=x<0?-1:1; x=Math.abs(x);
let r=0;
while(x){ r = r*10 + (x%10); x = Math.floor(x/10); }
r*=sign;
if(r < -2147483648 || r > 2147483647) return "0";
return String(r);
`);
    case "Find Minimum in Rotated Sorted Array":
      return arrayNProgram(`
let l=0,r=a.length-1;
while(l<r){ const m=(l+r)>>1; if(a[m]>a[r]) l=m+1; else r=m; }
return String(a[l]);
`);
    case "First Unique Character":
      return stringLineProgram(`
const t=readIntLine(); let out=[];
for(let tc=0; tc<t; tc++){
  const s=readNonEmptyLine();
  const m=new Map();
  for(const ch of s) m.set(ch,(m.get(ch)||0)+1);
  let idx=-1;
  for(let i=0;i<s.length;i++){ if(m.get(s[i])===1){ idx=i; break; } }
  out.push(String(idx));
}
console.log(out.join("\\n"));
`);
    case "Palindrome Number":
      return intPerLineProgram(`
if(n<0) return "0";
const s=String(n);
return s===s.split('').reverse().join('') ? "1":"0";
`);
    case "Move Zeroes":
      return arrayNProgram(`
const nz = a.filter(v=>v!==0);
const z = Array(a.length - nz.length).fill(0);
return nz.concat(z).join(' ');
`);
    case "Reverse Vowels of a String":
      return stringLineProgram(`
const t=readIntLine(); let out=[]; const vow=new Set('aeiouAEIOU'.split(''));
for(let tc=0; tc<t; tc++){
  const arr=readNonEmptyLine().split('');
  let l=0,r=arr.length-1;
  while(l<r){
    while(l<r && !vow.has(arr[l])) l++;
    while(l<r && !vow.has(arr[r])) r--;
    if(l<r){ const tmp=arr[l]; arr[l]=arr[r]; arr[r]=tmp; l++; r--; }
  }
  out.push(arr.join(''));
}
console.log(out.join("\\n"));
`);
    case "Number of 1 Bits":
      return intPerLineProgram(`
let x = n >>> 0, c=0;
while(x){ x &= (x-1); c++; }
return String(c);
`);
    case "Ugly Number":
      return intPerLineProgram(`
if(n<=0) return "0";
while(n%2===0) n/=2;
while(n%3===0) n/=3;
while(n%5===0) n/=5;
return n===1 ? "1":"0";
`);
    case "Search in Rotated Sorted Array":
      return `
${commonHelpers}
const t = readIntLine();
let out = [];
for(let tc=0; tc<t; tc++){
  const [n, target] = splitInts(readNonEmptyLine());
  const a = splitInts(readNonEmptyLine()).slice(0, n);
  let l=0,r=a.length-1,ans=-1;
  while(l<=r){
    const m=(l+r)>>1;
    if(a[m]===target){ ans=m; break; }
    if(a[l] <= a[m]){
      if(a[l] <= target && target < a[m]) r=m-1;
      else l=m+1;
    } else {
      if(a[m] < target && target <= a[r]) l=m+1;
      else r=m-1;
    }
  }
  out.push(String(ans));
}
console.log(out.join("\\n"));
`;
    case "Product of Array Except Self":
      return arrayNProgram(`
const n=a.length, res=Array(n).fill(1);
let p=1; for(let i=0;i<n;i++){ res[i]=p; p*=a[i]; }
p=1; for(let i=n-1;i>=0;i--){ res[i]*=p; p*=a[i]; }
return res.join(' ');
`);
    case "Jump Game":
      return arrayNProgram(`
let reach=0;
for(let i=0;i<a.length;i++){ if(i>reach) return "0"; reach=Math.max(reach, i+a[i]); }
return "1";
`);
    case "Container With Most Water":
      return arrayNProgram(`
let l=0,r=a.length-1,b=0;
while(l<r){ b=Math.max(b, Math.min(a[l],a[r])*(r-l)); if(a[l]<a[r]) l++; else r--; }
return String(b);
`);
    default:
      throw new Error(`No solution mapping for: ${title}`);
  }
}

function arrayNProgram(body) {
  return `
${commonHelpers}
const t = readIntLine();
let out = [];
for(let tc=0; tc<t; tc++){
  const n = readIntLine();
  const a = splitInts(readNonEmptyLine()).slice(0, n);
  const solve = (a) => { ${body} };
  out.push(solve(a));
}
console.log(out.join("\\n"));
`;
}

function intPerLineProgram(body) {
  return `
${commonHelpers}
const t = readIntLine();
let out = [];
for(let tc=0; tc<t; tc++){
  let n = parseInt(readNonEmptyLine().trim(), 10);
  const solve = (n) => { ${body} };
  out.push(solve(n));
}
console.log(out.join("\\n"));
`;
}

function stringLineProgram(raw) {
  return `${commonHelpers}\n${raw}`;
}

async function runOnJdoodle(script, stdin) {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { clientId, clientSecret } = getCred();
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script,
        stdin,
        language: "nodejs",
        versionIndex: "4"
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 429 && attempt < maxAttempts - 1) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    if (!response.ok) {
      throw new Error(`JDoodle HTTP ${response.status}`);
    }
    return data;
  }
  throw new Error("JDoodle: max retries exceeded");
}

function selectQuestions(all, argv) {
  const onlyIdx = argv.indexOf("--only");
  if (onlyIdx === -1) return all;
  const titles = argv.slice(onlyIdx + 1).filter((a) => !a.startsWith("-"));
  if (titles.length === 0) {
    console.error("Usage: node scripts/verifyQuestionsJdoodle.js --only \"Title 1\" \"Title 2\"");
    process.exit(1);
  }
  const selected = all.filter((q) => titles.includes(q.title));
  const missing = titles.filter((t) => !all.some((q) => q.title === t));
  if (missing.length > 0) {
    console.error("Unknown question title(s):", missing.join(", "));
    process.exit(1);
  }
  return selected;
}

async function main() {
  const toRun = selectQuestions(questions, process.argv);
  const report = [];
  let globalPass = 0;
  let globalTotal = 0;

  for (let qi = 0; qi < toRun.length; qi++) {
    const q = toRun[qi];
    const script = solutionFor(q.title);
    const stdin = `${q.testCases.length}\n${q.testCases.map(tc => tc.input).join("\n")}`;
    const expected = q.testCases.map(tc => normalize(tc.output));
    let outputLines = [];
    let status = "ok";
    let error = "";
    let cpuTime = "";
    let memory = "";

    try {
      const resp = await runOnJdoodle(script, stdin);
      cpuTime = resp.cpuTime;
      memory = resp.memory;
      if (resp.statusCode && Number(resp.statusCode) !== 200) {
        status = "runtime_error";
        error = `statusCode=${resp.statusCode}`;
      } else {
        outputLines = normalize(resp.output).split("\n").map(s => s.trim()).filter(Boolean);
      }
    } catch (e) {
      status = "api_error";
      error = e.message;
    }

    const mismatches = [];
    for (let i = 0; i < expected.length; i++) {
      const got = outputLines[i] ?? "";
      const exp = expected[i];
      const pass = got === exp;
      globalTotal++;
      if (pass) globalPass++;
      else mismatches.push({ idx: i + 1, expected: exp, got });
    }

    report.push({
      title: q.title,
      testcases: q.testCases.length,
      status,
      cpuTime,
      memory,
      passCount: q.testCases.length - mismatches.length,
      mismatches,
      error
    });

    if (qi < toRun.length - 1) await sleep(3000);
  }

  const failedQuestions = report.filter(r => r.mismatches.length > 0 || r.status !== "ok");
  console.log(JSON.stringify({
    summary: {
      questionCount: toRun.length,
      testcaseTotal: globalTotal,
      testcasePass: globalPass,
      testcaseFail: globalTotal - globalPass,
      failedQuestionCount: failedQuestions.length
    },
    failedQuestions,
    all: report
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

