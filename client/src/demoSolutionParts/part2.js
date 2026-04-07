/** Part 2: questions 8–14 */

export const SOLUTIONS_PART2 = {
  "Single Number": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        x = 0
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
        int x = 0;
        stringstream sa(L[i++]);
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
        for (int k = 0; k < n; k++) { scanf("%d", &v); x ^= v; }
        printf("%d\\n", x);
    }
    return 0;
}
`,
  },

  "Majority Element": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        a = list(map(int, lines[i].split()))[:n]; i += 1
        c = 0
        cand = None
        for v in a:
            if c == 0:
                cand, c = v, 1
            else:
                c += 1 if v == cand else -1
        print(cand)

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
            int c = 0, cand = 0;
            for (int k = 0; k < n; k++) {
                int v = Integer.parseInt(p[k]);
                if (c == 0) { cand = v; c = 1; }
                else c += (v == cand) ? 1 : -1;
            }
            System.out.println(cand);
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
        int c = 0, cand = 0;
        for (int k = 0; k < n; k++) {
            int v; sa >> v;
            if (c == 0) { cand = v; c = 1; }
            else c += (v == cand) ? 1 : -1;
        }
        cout << cand << "\\n";
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
        int c = 0, cand = 0, v;
        for (int k = 0; k < n; k++) {
            scanf("%d", &v);
            if (c == 0) { cand = v; c = 1; }
            /* Ternary-style count for Boyer-Moore */
            else if (v == cand) c++;
            else c--;
        }
        printf("%d\\n", cand);
    }
    return 0;
}
`,
  },

  "Valid Palindrome": {
    python: `import sys

def norm(s):
    return "".join(c.lower() for c in s if c.isalnum())

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        s = norm(lines[i]); i += 1
        print(1 if s == s[::-1] else 0)

if __name__ == "__main__":
    main()
`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    static String norm(String s) {
        StringBuilder b = new StringBuilder();
        for (char c : s.toLowerCase().toCharArray())
            if (Character.isLetterOrDigit(c)) b.append(c);
        return b.toString();
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
            String s = norm(L.get(i++));
            String t = new StringBuilder(s).reverse().toString();
            System.out.println(s.equals(t) ? 1 : 0);
        }
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

static string norm(string s) {
    string t;
    for (char c : s) {
        c = tolower((unsigned char)c);
        if (isalnum((unsigned char)c)) t += c;
    }
    return t;
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
        string t = norm(L[i++]);
        string r = t;
        reverse(r.begin(), r.end());
        cout << (t == r ? 1 : 0) << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

static char tmp[400000], clean[400000];

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
        strcpy(tmp, lines[li++]);
        int cl = 0;
        for (char *q = tmp; *q; q++) {
            if (isalnum((unsigned char)*q))
                clean[cl++] = tolower((unsigned char)*q);
        }
        clean[cl] = 0;
        int ok = 1;
        for (int a = 0, b = cl-1; a < b; a++, b--)
            if (clean[a] != clean[b]) { ok = 0; break; }
        printf("%d\\n", ok);
    }
    return 0;
}
`,
  },

  "Valid Anagram": {
    python: `import sys
from collections import Counter

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        s, t = lines[i], lines[i+1]; i += 2
        print(1 if Counter(s) == Counter(t) else 0)

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
            String s = L.get(i++), t = L.get(i++);
            if (s.length() != t.length()) { System.out.println(0); continue; }
            int[] c = new int[256];
            for (char ch : s.toCharArray()) c[ch]++;
            for (char ch : t.toCharArray()) c[ch]--;
            boolean ok = true;
            for (int v : c) if (v != 0) { ok = false; break; }
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
        string a = L[i++], b = L[i++];
        if (a.size() != b.size()) { cout << 0 << "\\n"; continue; }
        int c[256] = {0};
        for (char ch : a) c[(unsigned char)ch]++;
        for (char ch : b) c[(unsigned char)ch]--;
        bool ok = true;
        for (int k = 0; k < 256; k++) if (c[k]) ok = false;
        cout << (ok ? 1 : 0) << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <string.h>

int main() {
    char buf[4000000];
    fread(buf, 1, sizeof(buf)-1, stdin);
    char *lines[80000];
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
        char *s = lines[li++], *t = lines[li++];
        if (strlen(s) != strlen(t)) { printf("0\\n"); continue; }
        int c[256] = {0};
        for (; *s; s++) c[(unsigned char)*s]++;
        for (; *t; t++) c[(unsigned char)*t]--;
        int ok = 1;
        for (int k = 0; k < 256; k++) if (c[k]) ok = 0;
        printf("%d\\n", ok);
    }
    return 0;
}
`,
  },

  "Length of Last Word": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        i += 1  # dummy segment-count line (per problem statement)
        s = lines[i]; i += 1
        w = s.strip().split()
        print(len(w[-1]) if w else 0)

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
            i++; // dummy
            String s = L.get(i++).trim();
            String[] w = s.split("\\\\s+");
            System.out.println(w.length == 0 ? 0 : w[w.length-1].length());
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
        i++;
        string t = L[i++];
        stringstream ss(t);
        string w, last;
        while (ss >> w) last = w;
        cout << last.size() << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main() {
    char buf[400000];
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
        li++;
        char *s = lines[li++];
        int len = 0, last = 0, in = 0;
        for (; *s; s++) {
            if (!isspace((unsigned char)*s)) {
                if (!in) { len = 0; in = 1; }
                len++;
            } else in = 0;
            if (in) last = len;
        }
        printf("%d\\n", last);
    }
    return 0;
}
`,
  },

  "Climbing Stairs": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        if n <= 2:
            print(n)
            continue
        a, b = 1, 2
        for _ in range(3, n+1):
            a, b = b, a + b
        print(b)

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
            if (n <= 2) { System.out.println(n); continue; }
            long a = 1, b = 2;
            for (int k = 3; k <= n; k++) {
                long c = a + b; a = b; b = c;
            }
            System.out.println(b);
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
        if (n <= 2) { cout << n << "\\n"; continue; }
        long long a = 1, b = 2;
        for (int k = 3; k <= n; k++) { long long c = a+b; a=b; b=c; }
        cout << b << "\\n";
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
        if (n <= 2) { printf("%d\\n", n); continue; }
        long long a = 1, b = 2, c;
        for (int k = 3; k <= n; k++) { c = a+b; a=b; b=c; }
        printf("%lld\\n", b);
    }
    return 0;
}
`,
  },

  "Fibonacci Number": {
    python: `import sys

def main():
    lines = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip() != ""]
    i, tc = 0, int(lines[0]); i += 1
    for _ in range(tc):
        n = int(lines[i]); i += 1
        if n <= 1:
            print(n)
            continue
        a, b = 0, 1
        for _ in range(2, n+1):
            a, b = b, a+b
        print(b)

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
            if (n <= 1) { System.out.println(n); continue; }
            long a = 0, b = 1;
            for (int k = 2; k <= n; k++) {
                long c = a + b; a = b; b = c;
            }
            System.out.println(b);
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
        if (n <= 1) { cout << n << "\\n"; continue; }
        long long a = 0, b = 1;
        for (int k = 2; k <= n; k++) { long long c = a+b; a=b; b=c; }
        cout << b << "\\n";
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
        if (n <= 1) { printf("%d\\n", n); continue; }
        long long a = 0, b = 1, c;
        for (int k = 2; k <= n; k++) { c = a+b; a=b; b=c; }
        printf("%lld\\n", b);
    }
    return 0;
}
`,
  },
};
