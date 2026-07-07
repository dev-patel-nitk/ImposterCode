/** Part 4: questions 22–28 */

export const SOLUTIONS_PART4 = {
  "Reverse Vowels of a String": {
    python: `import sys

_VOW = set("aeiouAEIOU")

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        s = list(lines[i]); i += 1
        lo, hi = 0, len(s) - 1
        while lo < hi:
            while lo < hi and s[lo] not in _VOW:
                lo += 1
            while lo < hi and s[hi] not in _VOW:
                hi -= 1
            if lo < hi:
                s[lo], s[hi] = s[hi], s[lo]
                lo += 1
                hi -= 1
        print("".join(s))

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    static boolean vow(char c) {
        return "aeiouAEIOU".indexOf(c) >= 0;
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
            char[] s = L.get(i++).toCharArray();
            int lo = 0, hi = s.length - 1;
            while (lo < hi) {
                while (lo < hi && !vow(s[lo])) lo++;
                while (lo < hi && !vow(s[hi])) hi--;
                if (lo < hi) {
                    char t = s[lo]; s[lo] = s[hi]; s[hi] = t;
                    lo++; hi--;
                }
            }
            System.out.println(new String(s));
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

static bool vow(char c) {
    static const string V = "aeiouAEIOU";
    return V.find(c) != string::npos;
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
        string t = L[i++];
        int lo = 0, hi = (int)t.size() - 1;
        while (lo < hi) {
            while (lo < hi && !vow(t[lo])) lo++;
            while (lo < hi && !vow(t[hi])) hi--;
            if (lo < hi) swap(t[lo++], t[hi--]);
        }
        cout << t << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <string.h>

static int vow(char c) {
    return c=='a'||c=='e'||c=='i'||c=='o'||c=='u'||
           c=='A'||c=='E'||c=='I'||c=='O'||c=='U';
}

int main() {
    char buf[4000000];
    fread(buf, 1, sizeof(buf)-1, stdin);
    char *lines[50000];
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
    char s[400000];
    while (tc--) {
        strcpy(s, lines[li++]);
        int n = strlen(s), lo = 0, hi = n - 1;
        while (lo < hi) {
            while (lo < hi && !vow(s[lo])) lo++;
            while (lo < hi && !vow(s[hi])) hi--;
            if (lo < hi) {
                char t = s[lo]; s[lo] = s[hi]; s[hi] = t;
                lo++; hi--;
            }
        }
        printf("%s\\n", s);
    }
    return 0;
}
`,
  },

  "Number of 1 Bits": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        u = n & 0xFFFFFFFF
        c = 0
        while u:
            c += 1
            u &= u - 1
        print(c)

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
            int c = 0;
            while (n != 0) {
                c++;
                n &= n - 1;
            }
            System.out.println(c);
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
        unsigned int n = (unsigned int) stoul(L[i++]);
        int c = 0;
        while (n) { c++; n &= n - 1; }
        cout << c << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        unsigned int n;
        scanf("%u", &n);
        int c = 0;
        while (n) { c++; n &= n - 1; }
        printf("%d\\n", c);
    }
    return 0;
}
`,
  },

  "Ugly Number": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        if n <= 0:
            print(0)
            continue
        for p in (2, 3, 5):
            while n % p == 0:
                n //= p
        print(1 if n == 1 else 0)

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
            if (n <= 0) { System.out.println(0); continue; }
            for (int p : new int[]{2,3,5}) {
                while (n % p == 0) n /= p;
            }
            System.out.println(n == 1 ? 1 : 0);
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
        if (n <= 0) { cout << 0 << "\\n"; continue; }
        for (int p : {2,3,5}) {
            while (n % p == 0) n /= p;
        }
        cout << (n == 1 ? 1 : 0) << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n;
        scanf("%d", &n);
        if (n <= 0) { printf("0\\n"); continue; }
        int ps[] = {2,3,5};
        for (int j = 0; j < 3; j++) {
            int p = ps[j];
            while (n % p == 0) n /= p;
        }
        printf("%d\\n", n == 1);
    }
    return 0;
}
`,
  },

  "Search in Rotated Sorted Array": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        nt = list(map(int, lines[i].split())); i += 1
        n, target = nt[0], nt[1]
        nums = list(map(int, lines[i].split()))[:n]; i += 1
        lo, hi = 0, n - 1
        ans = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                ans = mid
                break
            if nums[lo] <= nums[mid]:
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
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
            String[] nt = L.get(i++).trim().split("\\\\s+");
            int n = Integer.parseInt(nt[0]), target = Integer.parseInt(nt[1]);
            String[] p = L.get(i++).trim().split("\\\\s+");
            int[] nums = new int[n];
            for (int k = 0; k < n; k++) nums[k] = Integer.parseInt(p[k]);
            int lo = 0, hi = n - 1, ans = -1;
            while (lo <= hi) {
                int mid = (lo + hi) / 2;
                if (nums[mid] == target) { ans = mid; break; }
                if (nums[lo] <= nums[mid]) {
                    if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                    else lo = mid + 1;
                } else {
                    if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                    else hi = mid - 1;
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
        int n, target;
        stringstream snt(L[i++]);
        snt >> n >> target;
        vector<int> nums(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> nums[k];
        int lo = 0, hi = n - 1, ans = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (nums[mid] == target) { ans = mid; break; }
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        cout << ans << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, target;
        scanf("%d %d", &n, &target);
        int nums[10005];
        for (int k = 0; k < n; k++) scanf("%d", &nums[k]);
        int lo = 0, hi = n - 1, ans = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (nums[mid] == target) { ans = mid; break; }
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        printf("%d\\n", ans);
    }
    return 0;
}
`,
  },

  "Product of Array Except Self": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        out = [1] * n
        p = 1
        for k in range(n):
            out[k] = p
            p *= a[k]
        p = 1
        for k in range(n - 1, -1, -1):
            out[k] *= p
            p *= a[k]
        print(" ".join(map(str, out)))

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
            long[] a = new long[n];
            for (int k = 0; k < n; k++) a[k] = Long.parseLong(p[k]);
            long[] out = new long[n];
            long prod = 1;
            for (int k = 0; k < n; k++) { out[k] = prod; prod *= a[k]; }
            prod = 1;
            for (int k = n - 1; k >= 0; k--) { out[k] *= prod; prod *= a[k]; }
            StringBuilder sb = new StringBuilder();
            for (int k = 0; k < n; k++) {
                if (k > 0) sb.append(' ');
                sb.append(out[k]);
            }
            System.out.println(sb);
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
        vector<long long> a(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> a[k];
        vector<long long> out(n);
        long long prod = 1;
        for (int k = 0; k < n; k++) { out[k] = prod; prod *= a[k]; }
        prod = 1;
        for (int k = n - 1; k >= 0; k--) { out[k] *= prod; prod *= a[k]; }
        for (int k = 0; k < n; k++) {
            if (k) cout << ' ';
            cout << out[k];
        }
        cout << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n;
        scanf("%d", &n);
        long long a[10005], out[10005];
        for (int k = 0; k < n; k++) scanf("%lld", &a[k]);
        long long p = 1;
        for (int k = 0; k < n; k++) { out[k] = p; p *= a[k]; }
        p = 1;
        for (int k = n - 1; k >= 0; k--) { out[k] *= p; p *= a[k]; }
        for (int k = 0; k < n; k++)
            printf("%s%lld", k ? " " : "", out[k]);
        printf("\\n");
    }
    return 0;
}
`,
  },

  "Jump Game": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        reach = 0
        for j in range(n):
            if j > reach:
                print(0)
                break
            reach = max(reach, j + a[j])
        else:
            print(1)

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
            int[] a = new int[n];
            for (int k = 0; k < n; k++) a[k] = Integer.parseInt(p[k]);
            int reach = 0, ok = 1;
            for (int j = 0; j < n; j++) {
                if (j > reach) { ok = 0; break; }
                reach = Math.max(reach, j + a[j]);
            }
            System.out.println(ok);
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
        vector<int> a(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> a[k];
        int reach = 0, ok = 1;
        for (int j = 0; j < n; j++) {
            if (j > reach) { ok = 0; break; }
            reach = max(reach, j + a[j]);
        }
        cout << ok << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int max(int a, int b) { return a > b ? a : b; }

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, a[10005];
        scanf("%d", &n);
        for (int k = 0; k < n; k++) scanf("%d", &a[k]);
        int reach = 0, ok = 1;
        for (int j = 0; j < n; j++) {
            if (j > reach) { ok = 0; break; }
            reach = max(reach, j + a[j]);
        }
        printf("%d\\n", ok);
    }
    return 0;
}
`,
  },

  "Container With Most Water": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        h = list(map(int, lines[i].split()))[:n]; i += 1
        lo, hi = 0, n - 1
        best = 0
        while lo < hi:
            best = max(best, min(h[lo], h[hi]) * (hi - lo))
            if h[lo] < h[hi]:
                lo += 1
            else:
                hi -= 1
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
            int[] h = new int[n];
            for (int k = 0; k < n; k++) h[k] = Integer.parseInt(p[k]);
            int lo = 0, hi = n - 1, best = 0;
            while (lo < hi) {
                best = Math.max(best, Math.min(h[lo], h[hi]) * (hi - lo));
                if (h[lo] < h[hi]) lo++;
                else hi--;
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
        vector<int> h(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> h[k];
        int lo = 0, hi = n - 1, best = 0;
        while (lo < hi) {
            best = max(best, min(h[lo], h[hi]) * (hi - lo));
            if (h[lo] < h[hi]) lo++;
            else hi--;
        }
        cout << best << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int min(int a, int b) { return a < b ? a : b; }
int max(int a, int b) { return a > b ? a : b; }

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, h[10005];
        scanf("%d", &n);
        for (int k = 0; k < n; k++) scanf("%d", &h[k]);
        int lo = 0, hi = n - 1, best = 0;
        while (lo < hi) {
            best = max(best, min(h[lo], h[hi]) * (hi - lo));
            if (h[lo] < h[hi]) lo++;
            else hi--;
        }
        printf("%d\\n", best);
    }
    return 0;
}
`,
  },
};
