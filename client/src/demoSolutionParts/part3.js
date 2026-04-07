/** Part 3: questions 15–21 */

export const SOLUTIONS_PART3 = {
  "Power of Two": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        ok = n > 0 and (n & (n - 1)) == 0
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
        int i = 0, tc = Integer.parseInt(L.get(i++));
        for (; tc-- > 0; ) {
            int n = Integer.parseInt(L.get(i++));
            boolean ok = n > 0 && (n & (n - 1)) == 0;
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
    size_t i = 0;
    int tc = stoi(L[i++]);
    while (tc--) {
        int n = stoi(L[i++]);
        bool ok = n > 0 && (n & (n - 1)) == 0;
        cout << (ok ? 1 : 0) << "\\n";
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
        int ok = n > 0 && (n & (n - 1)) == 0;
        printf("%d\\n", ok);
    }
    return 0;
}
`,
  },

  "Missing Number": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        x = 0
        for k in range(n + 1):
            x ^= k
        for v in a:
            x ^= v
        print(x)

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
            int x = 0;
            for (int k = 0; k <= n; k++) x ^= k;
            for (int k = 0; k < n; k++) x ^= Integer.parseInt(p[k]);
            System.out.println(x);
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
        stringstream sa(L[i++]);
        int x = 0;
        for (int k = 0; k <= n; k++) x ^= k;
        for (int k = 0; k < n; k++) { int v; sa >> v; x ^= v; }
        cout << x << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        int n, x = 0, v;
        scanf("%d", &n);
        for (int k = 0; k <= n; k++) x ^= k;
        for (int k = 0; k < n; k++) { scanf("%d", &v); x ^= v; }
        printf("%d\\n", x);
    }
    return 0;
}
`,
  },

  "Reverse Integer": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    IMIN, IMAX = -(2**31), 2**31 - 1
    for _ in range(tc):
        x = int(lines[i]); i += 1
        sign = -1 if x < 0 else 1
        x = abs(x)
        r = 0
        while x:
            r = r * 10 + x % 10
            x //= 10
        r *= sign
        if r < IMIN or r > IMAX:
            r = 0
        print(r)

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
            int x = Integer.parseInt(L.get(i++));
            long sign = x < 0 ? -1 : 1;
            long ax = Math.abs((long)x);
            long r = 0;
            while (ax > 0) {
                r = r * 10 + ax % 10;
                ax /= 10;
            }
            r *= sign;
            if (r < Integer.MIN_VALUE || r > Integer.MAX_VALUE) r = 0;
            System.out.println((int)r);
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
        long long x = stoll(L[i++]);
        long long sign = x < 0 ? -1 : 1;
        long long ax = llabs(x);
        long long r = 0;
        while (ax > 0) {
            r = r * 10 + ax % 10;
            ax /= 10;
        }
        r *= sign;
        if (r < INT_MIN || r > INT_MAX) r = 0;
        cout << (int)r << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        long long x;
        scanf("%lld", &x);
        long long sign = x < 0 ? -1 : 1;
        long long ax = llabs(x);
        long long r = 0;
        while (ax > 0) {
            r = r * 10 + ax % 10;
            ax /= 10;
        }
        r *= sign;
        if (r < INT_MIN || r > INT_MAX) r = 0;
        printf("%d\\n", (int)r);
    }
    return 0;
}
`,
  },

  "Find Minimum in Rotated Sorted Array": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if a[mid] > a[hi]:
                lo = mid + 1
            else:
                hi = mid
        print(a[lo])

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
            int lo = 0, hi = n - 1;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (a[mid] > a[hi]) lo = mid + 1;
                else hi = mid;
            }
            System.out.println(a[lo]);
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
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] > a[hi]) lo = mid + 1;
            else hi = mid;
        }
        cout << a[lo] << "\\n";
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
        int a[5005];
        for (int k = 0; k < n; k++) scanf("%d", &a[k]);
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] > a[hi]) lo = mid + 1;
            else hi = mid;
        }
        printf("%d\\n", a[lo]);
    }
    return 0;
}
`,
  },

  "First Unique Character": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        s = lines[i]; i += 1
        c = [0] * 256
        for ch in s:
            c[ord(ch)] += 1
        ans = -1
        for j, ch in enumerate(s):
            if c[ord(ch)] == 1:
                ans = j
                break
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
            String s = L.get(i++);
            int[] c = new int[256];
            for (char ch : s.toCharArray()) c[ch]++;
            int ans = -1;
            for (int j = 0; j < s.length(); j++) {
                if (c[s.charAt(j)] == 1) { ans = j; break; }
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
        string t = L[i++];
        int c[256] = {0};
        for (unsigned char ch : t) c[ch]++;
        int ans = -1;
        for (size_t j = 0; j < t.size(); j++) {
            if (c[(unsigned char)t[j]] == 1) { ans = (int)j; break; }
        }
        cout << ans << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <string.h>

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
    while (tc--) {
        char *s = lines[li++];
        int c[256] = {0};
        for (char *q = s; *q; q++) c[(unsigned char)*q]++;
        int ans = -1;
        for (int j = 0; s[j]; j++) {
            if (c[(unsigned char)s[j]] == 1) { ans = j; break; }
        }
        printf("%d\\n", ans);
    }
    return 0;
}
`,
  },

  "Palindrome Number": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        x = int(lines[i]); i += 1
        if x < 0:
            print(0)
            continue
        y, z, rev = x, x, 0
        while z:
            rev = rev * 10 + z % 10
            z //= 10
        print(1 if y == rev else 0)

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
            int x = Integer.parseInt(L.get(i++));
            if (x < 0) { System.out.println(0); continue; }
            int y = x, rev = 0;
            while (y > 0) {
                rev = rev * 10 + y % 10;
                y /= 10;
            }
            System.out.println(x == rev ? 1 : 0);
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
        long long x = stoll(L[i++]);
        if (x < 0) { cout << 0 << "\\n"; continue; }
        long long y = x, rev = 0;
        while (y > 0) {
            rev = rev * 10 + y % 10;
            y /= 10;
        }
        cout << (x == rev ? 1 : 0) << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int tc;
    scanf("%d", &tc);
    while (tc--) {
        long long x;
        scanf("%lld", &x);
        if (x < 0) { printf("0\\n"); continue; }
        long long y = x, rev = 0;
        while (y > 0) {
            rev = rev * 10 + y % 10;
            y /= 10;
        }
        printf("%d\\n", x == rev ? 1 : 0);
    }
    return 0;
}
`,
  },

  "Move Zeroes": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        w = 0
        for v in a:
            if v != 0:
                a[w] = v
                w += 1
        for k in range(w, n):
            a[k] = 0
        print(" ".join(map(str, a)))

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
            int w = 0;
            for (int v : a) if (v != 0) a[w++] = v;
            for (int k = w; k < n; k++) a[k] = 0;
            StringBuilder sb = new StringBuilder();
            for (int k = 0; k < n; k++) {
                if (k > 0) sb.append(' ');
                sb.append(a[k]);
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
        vector<int> a(n);
        stringstream sa(L[i++]);
        for (int k = 0; k < n; k++) sa >> a[k];
        int w = 0;
        for (int v : a) if (v != 0) a[w++] = v;
        for (int k = w; k < n; k++) a[k] = 0;
        for (int k = 0; k < n; k++) {
            if (k) cout << ' ';
            cout << a[k];
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
        int n, a[10005];
        scanf("%d", &n);
        for (int k = 0; k < n; k++) scanf("%d", &a[k]);
        int w = 0;
        for (int k = 0; k < n; k++)
            if (a[k] != 0) a[w++] = a[k];
        for (int k = w; k < n; k++) a[k] = 0;
        for (int k = 0; k < n; k++)
            printf("%s%d", k ? " " : "", a[k]);
        printf("\\n");
    }
    return 0;
}
`,
  },
};
