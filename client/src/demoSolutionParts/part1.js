/** Part 1: questions 1–7. I/O matches server/questions.js (T then each testcase block). */

export const SOLUTIONS_PART1 = {
  "Two Sum": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n, target = map(int, lines[i].split()); i += 1
        nums = list(map(int, lines[i].split()))[:n]; i += 1
        seen = {}
        for k, x in enumerate(nums):
            j = seen.get(target - x)
            if j is not None:
                print(j, k)
                break
            seen[x] = k

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            String[] nt = L.get(i++).split("\\\\s+");
            int n = Integer.parseInt(nt[0]), target = Integer.parseInt(nt[1]);
            String[] parts = L.get(i++).trim().split("\\\\s+");
            Map<Integer, Integer> seen = new HashMap<>();
            for (int k = 0; k < n; k++) {
                int x = Integer.parseInt(parts[k]);
                Integer j = seen.get(target - x);
                if (j != null) {
                    System.out.println(j + " " + k);
                    break;
                }
                seen.put(x, k);
            }
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        int n, target;
        stringstream ss(L[i++]);
        ss >> n >> target;
        vector<int> nums(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> nums[k];
        unordered_map<int, int> seen;
        for (int k = 0; k < n; k++) {
            int need = target - nums[k];
            if (seen.count(need)) {
                cout << seen[need] << " " << k << "\\n";
                break;
            }
            seen[nums[k]] = k;
        }
    }
    return 0;
}
`,
    c: `#include <stdio.h>

#define MAXN 20005

int main() {
    int tc;
    if (scanf("%d", &tc) != 1) return 0;
    while (tc--) {
        int n, target, nums[MAXN];
        scanf("%d %d", &n, &target);
        long seen[400000], idx[400000];
        int ns = 0;
        for (int k = 0; k < n; k++) scanf("%d", &nums[k]);
        for (int k = 0; k < n; k++) {
            long need = (long)target - nums[k];
            int found = -1;
            for (int j = 0; j < ns; j++) if (seen[j] == need) { found = idx[j]; break; }
            if (found >= 0) { printf("%d %d\\n", found, k); break; }
            seen[ns] = nums[k]; idx[ns++] = k;
        }
    }
    return 0;
}
`,
  },

  "Valid Parentheses": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    mp = {")": "(", "]": "[", "}": "{"}
    for _ in range(tc):
        s = lines[i]; i += 1
        st = []
        ok = True
        for ch in s:
            if ch in "({[":
                st.append(ch)
            else:
                if not st or st.pop() != mp.get(ch, ""):
                    ok = False
                    break
        if st:
            ok = False
        print(1 if ok else 0)

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        Map<Character, Character> mp = new HashMap<>();
        mp.put(')', '('); mp.put(']', '['); mp.put('}', '{');
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            String s = L.get(i++);
            Deque<Character> st = new ArrayDeque<>();
            boolean ok = true;
            for (char ch : s.toCharArray()) {
                if (ch == '(' || ch == '[' || ch == '{') st.push(ch);
                else {
                    if (st.isEmpty() || st.pop() != mp.get(ch)) { ok = false; break; }
                }
            }
            if (!st.isEmpty()) ok = false;
            System.out.println(ok ? 1 : 0);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    map<char,char> mp{{')','('},{']','['},{'}','{'}};
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        string t = L[i++];
        stack<char> st;
        bool ok = true;
        for (char ch : t) {
            if (ch=='('||ch=='['||ch=='{') st.push(ch);
            else {
                if (st.empty() || st.top()!=mp[ch]) { ok=false; break; }
                st.pop();
            }
        }
        if (!st.empty()) ok = false;
        cout << (ok?1:0) << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <string.h>

static char st[20005];
static int sp;

int main() {
    char buf[5000000];
    fread(buf, 1, sizeof(buf)-1, stdin);
    char *lines[200000];
    int nl = 0;
    char *p = buf;
    while (*p) {
        while (*p == '\\n' || *p == '\\r') p++;
        if (!*p) break;
        lines[nl++] = p;
        while (*p && *p != '\\n' && *p != '\\r') p++;
        if (*p) *p++ = 0;
    }
    int li = 1, tc = atoi(lines[0]);
    while (tc--) {
        char *t = lines[li++];
        sp = 0;
        int ok = 1;
        for (; *t; t++) {
            if (*t=='('||*t=='['||*t=='{') st[sp++] = *t;
            else {
                char want = (*t==')')?'(':(*t==']')?'[':'{';
                if (sp==0 || st[--sp]!=want) { ok=0; break; }
            }
        }
        if (sp) ok = 0;
        printf("%d\\n", ok);
    }
    return 0;
}
`,
  },

  "Longest Substring Without Repeating Characters": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        s = lines[i]; i += 1
        last = {}
        start = 0
        best = 0
        for j, ch in enumerate(s):
            if ch in last and last[ch] >= start:
                start = last[ch] + 1
            last[ch] = j
            best = max(best, j - start + 1)
        print(best)

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            String s = L.get(i++);
            Map<Character, Integer> last = new HashMap<>();
            int start = 0, best = 0;
            for (int j = 0; j < s.length(); j++) {
                char ch = s.charAt(j);
                Integer p = last.get(ch);
                if (p != null && p >= start) start = p + 1;
                last.put(ch, j);
                best = Math.max(best, j - start + 1);
            }
            System.out.println(best);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        string t = L[i++];
        vector<int> last(256, -1);
        int start = 0, best = 0;
        for (int j = 0; j < (int)t.size(); j++) {
            unsigned char ch = t[j];
            if (last[ch] >= start) start = last[ch] + 1;
            last[ch] = j;
            best = max(best, j - start + 1);
        }
        cout << best << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    char buf[600000];
    fread(buf, 1, sizeof(buf)-1, stdin);
    char *lines[60000];
    int nl = 0;
    char *p = buf;
    while (*p) {
        while (*p == '\\n' || *p == '\\r') p++;
        if (!*p) break;
        lines[nl++] = p;
        while (*p && *p != '\\n' && *p != '\\r') p++;
        if (*p) *p++ = 0;
    }
    int li = 1, tc = atoi(lines[0]);
    static int last[256];
    while (tc--) {
        char *t = lines[li++];
        for (int k = 0; k < 256; k++) last[k] = -1;
        int start = 0, best = 0;
        for (int j = 0; t[j]; j++) {
            unsigned char ch = (unsigned char)t[j];
            if (last[ch] >= start) start = last[ch] + 1;
            last[ch] = j;
            int len = j - start + 1;
            if (len > best) best = len;
        }
        printf("%d\\n", best);
    }
    return 0;
}
`,
  },

  "Binary Tree Level Order Traversal": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        if n == 0:
            print("[]")
            continue
        arr = lines[i].split(); i += 1
        blocks = []
        cur = [0]
        while cur:
            vals, nxt = [], []
            for idx in cur:
                if idx >= n or arr[idx] in ("-1", "null"):
                    continue
                vals.append(arr[idx])
                L, R = idx * 2 + 1, idx * 2 + 2
                if L < n and arr[L] not in ("-1", "null"):
                    nxt.append(L)
                if R < n and arr[R] not in ("-1", "null"):
                    nxt.append(R)
            if vals:
                blocks.append("[" + ",".join(vals) + "]")
            cur = nxt
        print("[" + ",".join(blocks) + "]")

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    static boolean miss(String[] a, int i) {
        return i >= a.length || "-1".equals(a[i]) || "null".equals(a[i]);
    }
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            int n = Integer.parseInt(L.get(i++));
            if (n == 0) { System.out.println("[]"); continue; }
            String[] arr = L.get(i++).trim().split("\\\\s+");
            StringBuilder out = new StringBuilder("[");
            List<Integer> cur = new ArrayList<>();
            cur.add(0);
            boolean first = true;
            while (!cur.isEmpty()) {
                List<Integer> nxt = new ArrayList<>();
                StringBuilder lvl = new StringBuilder("[");
                boolean any = false;
                for (int idx : cur) {
                    if (idx >= n || miss(arr, idx)) continue;
                    if (any) lvl.append(",");
                    any = true;
                    lvl.append(arr[idx]);
                    int Lc = idx * 2 + 1, Rc = idx * 2 + 2;
                    if (Lc < n && !miss(arr, Lc)) nxt.add(Lc);
                    if (Rc < n && !miss(arr, Rc)) nxt.add(Rc);
                }
                lvl.append("]");
                if (any) {
                    if (!first) out.append(",");
                    first = false;
                    out.append(lvl);
                }
                cur = nxt;
            }
            out.append("]");
            System.out.println(out);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

static bool miss(vector<string>& a, int i) {
    return i >= (int)a.size() || a[i]=="-1" || a[i]=="null";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        int n = stoi(L[i++]);
        if (n == 0) { cout << "[]\\n"; continue; }
        vector<string> arr;
        stringstream sa(L[i++]);
        string tok;
        while (sa >> tok) arr.push_back(tok);
        string out = "[";
        vector<int> cur{0};
        bool first = true;
        while (!cur.empty()) {
            vector<int> nxt;
            string lvl = "[";
            bool any = false;
            for (int idx : cur) {
                if (idx >= n || miss(arr, idx)) continue;
                if (any) lvl += ",";
                any = true;
                lvl += arr[idx];
                int Lc = idx*2+1, Rc = idx*2+2;
                if (Lc < n && !miss(arr, Lc)) nxt.push_back(Lc);
                if (Rc < n && !miss(arr, Rc)) nxt.push_back(Rc);
            }
            lvl += "]";
            if (any) {
                if (!first) out += ",";
                first = false;
                out += lvl;
            }
            cur = nxt;
        }
        out += "]";
        cout << out << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAXN 2500

static char *toks[MAXN];
static int miss(int i, int n) {
    return i >= n || strcmp(toks[i], "-1") == 0 || strcmp(toks[i], "null") == 0;
}

int main() {
    char buf[8000000];
    size_t z = fread(buf, 1, sizeof(buf)-1, stdin);
    buf[z] = 0;
    char *lines[120000];
    int nl = 0;
    char *p = buf;
    while (*p) {
        while (*p == '\\n' || *p == '\\r') p++;
        if (!*p) break;
        lines[nl++] = p;
        while (*p && *p != '\\n' && *p != '\\r') p++;
        if (*p) *p++ = 0;
    }
    int li = 1, tc = atoi(lines[0]);
    char out[200000];
    while (tc--) {
        int n = atoi(lines[li++]);
        if (n == 0) { printf("[]\\n"); continue; }
        int tn = 0;
        for (char *t = strtok(lines[li++], " \\t"); t; t = strtok(NULL, " \\t"))
            toks[tn++] = t;
        strcpy(out, "[");
        int cur[MAXN], cs = 0, firstlvl = 1;
        cur[cs++] = 0;
        while (cs > 0) {
            int nx[MAXN], ns = 0;
            char lvl[80000];
            strcpy(lvl, "[");
            int lc = 0, any = 0;
            for (int i = 0; i < cs; i++) {
                int idx = cur[i];
                if (idx >= n || miss(idx, tn)) continue;
                any = 1;
                if (lc) strcat(lvl, ",");
                strcat(lvl, toks[idx]);
                lc++;
                int Lc = idx*2+1, Rc = idx*2+2;
                if (Lc < n && !miss(Lc, tn)) nx[ns++] = Lc;
                if (Rc < n && !miss(Rc, tn)) nx[ns++] = Rc;
            }
            strcat(lvl, "]");
            if (any) {
                if (!firstlvl) strcat(out, ",");
                firstlvl = 0;
                strcat(out, lvl);
            }
            memcpy(cur, nx, sizeof(int)*ns);
            cs = ns;
            if (!any) break;
        }
        strcat(out, "]");
        printf("%s\\n", out);
    }
    return 0;
}
`,
  },

  "Trapping Rain Water": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        h = list(map(int, lines[i].split()))[:n]; i += 1
        l, r = 0, n - 1
        lm = rm = ans = 0
        while l < r:
            if h[l] < h[r]:
                lm = max(lm, h[l])
                ans += lm - h[l]
                l += 1
            else:
                rm = max(rm, h[r])
                ans += rm - h[r]
                r -= 1
        print(ans)

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            int n = Integer.parseInt(L.get(i++));
            String[] p = L.get(i++).trim().split("\\\\s+");
            int[] h = new int[n];
            for (int k = 0; k < n; k++) h[k] = Integer.parseInt(p[k]);
            int l = 0, r = n - 1, lm = 0, rm = 0, ans = 0;
            while (l < r) {
                if (h[l] < h[r]) {
                    lm = Math.max(lm, h[l]);
                    ans += lm - h[l];
                    l++;
                } else {
                    rm = Math.max(rm, h[r]);
                    ans += rm - h[r];
                    r--;
                }
            }
            System.out.println(ans);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        int n = stoi(L[i++]);
        vector<int> h(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> h[k];
        int l = 0, r = n-1, lm = 0, rm = 0, ans = 0;
        while (l < r) {
            if (h[l] < h[r]) {
                lm = max(lm, h[l]);
                ans += lm - h[l++];
            } else {
                rm = max(rm, h[r]);
                ans += rm - h[r--];
            }
        }
        cout << ans << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

#define MAXN 20005

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, h[MAXN];
        scanf("%d", &n);
        for (int k = 0; k < n; k++) scanf("%d", &h[k]);
        int l = 0, r = n-1, lm = 0, rm = 0;
        long ans = 0;
        while (l < r) {
            if (h[l] < h[r]) {
                if (h[l] > lm) lm = h[l];
                ans += lm - h[l++];
            } else {
                if (h[r] > rm) rm = h[r];
                ans += rm - h[r--];
            }
        }
        printf("%ld\\n", ans);
    }
    return 0;
}
`,
  },

  "Maximum Subarray": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        cur = best = a[0]
        for x in a[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        print(best)

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            int n = Integer.parseInt(L.get(i++));
            String[] p = L.get(i++).trim().split("\\\\s+");
            long cur = Long.parseLong(p[0]), best = cur;
            for (int k = 1; k < n; k++) {
                long x = Long.parseLong(p[k]);
                cur = Math.max(x, cur + x);
                best = Math.max(best, cur);
            }
            System.out.println(best);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        int n = stoi(L[i++]);
        long long cur, best;
        stringstream sa(L[i++]);
        sa >> cur; best = cur;
        for (int k = 1; k < n; k++) {
            long long x; sa >> x;
            cur = max(x, cur + x);
            best = max(best, cur);
        }
        cout << best << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <limits.h>

#define MAXN 20005

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, a[MAXN];
        scanf("%d", &n);
        for (int k = 0; k < n; k++) scanf("%d", &a[k]);
        long cur = a[0], best = a[0];
        for (int k = 1; k < n; k++) {
            long x = a[k];
            long nxt = x > cur + x ? x : cur + x;
            cur = nxt;
            if (cur > best) best = cur;
        }
        printf("%ld\\n", best);
    }
    return 0;
}
`,
  },

  "Contains Duplicate": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        print(1 if len(set(a)) != n else 0)

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> L = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) L.add(line);
        }
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            int n = Integer.parseInt(L.get(i++));
            String[] p = L.get(i++).trim().split("\\\\s+");
            Set<Integer> seen = new HashSet<>();
            int dup = 0;
            for (int k = 0; k < n; k++) {
                int x = Integer.parseInt(p[k]);
                if (!seen.add(x)) { dup = 1; break; }
            }
            System.out.println(dup);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> L;
    string s;
    while (getline(cin, s)) {
        s.erase(0, s.find_first_not_of(" \\t"));
        s.erase(s.find_last_not_of(" \\t") + 1);
        if (!s.empty()) L.push_back(s);
    }
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        int n = stoi(L[i++]);
        unordered_set<long long> st;
        int dup = 0;
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) {
            long long x; sa >> x;
            if (st.count(x)) dup = 1;
            st.insert(x);
        }
        cout << dup << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <stdlib.h>

#define MAXN 20005

static int cmp(const void *a, const void *b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, a[MAXN];
        scanf("%d", &n);
        for (int k = 0; k < n; k++) scanf("%d", &a[k]);
        qsort(a, n, sizeof(int), cmp);
        int dup = 0;
        for (int k = 1; k < n; k++)
            if (a[k] == a[k-1]) { dup = 1; break; }
        printf("%d\\n", dup);
    }
    return 0;
}
`,
  },
};
