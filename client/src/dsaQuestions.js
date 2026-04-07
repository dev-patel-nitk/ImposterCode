// FILE: client/src/dsaQuestions.js

export const DSA_QUESTIONS = (() => {
  // ==========================================
  // 🟢 HELPERS: RANDOM INPUT & SOLVERS 
  // Computes expected answers in O(N) time 
  // to ensure generated cases are 100% accurate.
  // ==========================================
  
  const getRandomString = (length, chars = 'abcdefghijklmnopqrstuvwxyz') => {
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const getRandomArray = (length, min = -1000, max = 1000) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  };

  // --- SOLVERS ---
  const solveTwoSum = (nums, target) => {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) return `${map.get(complement)} ${i}`;
      map.set(nums[i], i);
    }
    return "-1 -1";
  };

  const solveValidParentheses = (s) => {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
      if (char === '(' || char === '{' || char === '[') stack.push(char);
      else if (stack.pop() !== map[char]) return false;
    }
    return stack.length === 0;
  };

  const solveLongestSubstring = (s) => {
    let max = 0, start = 0;
    const map = new Map();
    for (let i = 0; i < s.length; i++) {
      if (map.has(s[i]) && map.get(s[i]) >= start) start = map.get(s[i]) + 1;
      map.set(s[i], i);
      max = Math.max(max, i - start + 1);
    }
    return max.toString();
  };

  const solveLevelOrder = (arr) => {
    if (!arr || arr.length === 0) return "[]";
    const result = [];
    let i = 0;
    let currentLevel = [0]; 
    while (currentLevel.length > 0) {
      const vals = [];
      const nextLevel = [];
      for (const idx of currentLevel) {
        if (idx >= arr.length || arr[idx] === null) continue;
        vals.push(arr[idx]);
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        if (left < arr.length && arr[left] !== null) nextLevel.push(left);
        if (right < arr.length && arr[right] !== null) nextLevel.push(right);
      }
      if (vals.length > 0) result.push(`[${vals.join(',')}]`);
      currentLevel = nextLevel;
      i++;
      if (i > 1000) break; 
    }
    return `[${result.join(',')}]`;
  };

  const solveTrappingWater = (height) => {
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0, res = 0;
    while (left < right) {
      if (height[left] < height[right]) {
        leftMax = Math.max(leftMax, height[left]);
        res += leftMax - height[left];
        left++;
      } else {
        rightMax = Math.max(rightMax, height[right]);
        res += rightMax - height[right];
        right--;
      }
    }
    return res.toString();
  };

  const solveMaxSubarray = (arr) => {
    let max = -Infinity, curr = 0;
    for (let n of arr) { curr = Math.max(n, curr + n); max = Math.max(max, curr); }
    return max.toString();
  };

  const solveContainsDup = (arr) => {
    return (new Set(arr).size !== arr.length) ? "1" : "0"; 
  };

  const solveMajorityElement = (arr) => {
    let count = 0, candidate = null;
    for (let n of arr) { if (count === 0) candidate = n; count += (n === candidate) ? 1 : -1; }
    return candidate.toString();
  };

  const solveSingleNumber = (arr) => {
    return arr.reduce((a, b) => a ^ b, 0).toString();
  };

  const solveSearchRotated = (nums, target) => {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      if (nums[mid] === target) return mid.toString();
      if (nums[left] <= nums[mid]) {
        if (nums[left] <= target && target < nums[mid]) right = mid - 1;
        else left = mid + 1;
      } else {
        if (nums[mid] < target && target <= nums[right]) left = mid + 1;
        else right = mid - 1;
      }
    }
    return "-1";
  };

  const solveProductExceptSelf = (nums) => {
    const n = nums.length;
    const res = new Array(n).fill(1);
    let left = 1, right = 1;
    for (let i = 0; i < n; i++) {
      res[i] *= left;
      left *= nums[i];
    }
    for (let i = n - 1; i >= 0; i--) {
      res[i] *= right;
      right *= nums[i];
    }
    return `[${res.join(',')}]`;
  };

  const solveJumpGame = (nums) => {
    let reachable = 0;
    for (let i = 0; i < nums.length; i++) {
      if (i > reachable) return "false";
      reachable = Math.max(reachable, i + nums[i]);
    }
    return "true";
  };

  const solveContainerWater = (height) => {
    let max = 0, l = 0, r = height.length - 1;
    while (l < r) {
      max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
      if (height[l] < height[r]) l++;
      else r--;
    }
    return max.toString();
  };

  // ==========================================
  // 🟢 ANTI-BRUTE-FORCE GENERATORS (10,000 LIMIT)
  // Safely sized to prevent JDoodle OS crashes
  // ==========================================

  const twoSumNums = Array.from({ length: 10000 }, (_, i) => i + 1);
  const twoSumTarget = 19999; 
  const vpStr = "(".repeat(5000) + ")".repeat(5000); 
  const lsStr = "a".repeat(4900) + "bcdefghijklmnopqrstuvwxyz" + "b".repeat(4900) + "z".repeat(175);
  const levelOrderArr = Array.from({ length: 1023 }, (_, i) => i + 1);
  const twNums = Array.from({ length: 10000 }, (_, i) => i < 5000 ? 5000 - i : i - 5000);
  const maxSubArr1 = getRandomArray(10000, -100, 100);
  const maxSubArr2 = Array(10000).fill(-5); maxSubArr2[5000] = 10;
  const dupArr1 = Array.from({ length: 10000 }, (_, i) => i);
  const dupArr2 = [...dupArr1]; dupArr2[9999] = 1; 
  const majArr1 = Array(10000).fill(5); majArr1.fill(3, 0, 4999);
  
  const singleArr1 = [];
  for(let i=1; i<=4999; i++) { singleArr1.push(i); singleArr1.push(i); }
  singleArr1.push(99999);

  const palStr1 = "a".repeat(5000) + "b" + "a".repeat(5000);
  const palStr2 = "a".repeat(10000) + "b";
  const anaStr1 = getRandomString(5000);
  const anaStr2 = anaStr1.split('').reverse().join('');
  
  const rotatedNums = Array.from({ length: 10000 }, (_, i) => (i < 3000 ? i + 7000 : i - 3000));
  const rotatedTarget = 2999;
  const productNums = Array.from({ length: 5000 }, (_, i) => (i === 2500 ? 0 : (i % 5) + 1));
  const jumpNums = Array.from({ length: 10000 }, (_, i) => (i === 9998 ? 0 : 1));
  const containerHeights = Array.from({ length: 10000 }, (_, i) => (i === 0 || i === 9999 ? 1000 : 500));

  // ==========================================
  // 🟢 COMPILED QUESTION LIST
  // ==========================================
  return [
    {
      "_id": { "$oid": "aab100d23523fc80061e3001" },
      "title": "Two Sum",
      "difficulty": "easy",
      "description": "Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`. Assume exactly one solution exists. You may not use the same element twice.\n\n**Input Format:**\n- First line: **T**, number of test cases.\n- For each test case:\n  - Line 1: **N** **Target**\n  - Line 2: **N** space-separated integers.\n\n**Output Format:**\n- For each test case, print two indices separated by a space in **ascending order**.",
      "constraints": ["1 <= T <= 10", "2 <= N <= 2 * 10^4", "-10^9 <= nums[i] <= 10^9"],
      "sampleInput": "2\n4 9\n2 7 11 15\n3 6\n3 2 4",
      "sampleOutput": "0 1\n1 2",
      "testCases": [
        { "input": { "nums": [2, 7, 11, 15], "target": 9 }, "output": "0 1" },
        { "input": { "nums": [3, 2, 4], "target": 6 }, "output": "1 2" },
        { "input": { "nums": [3, 3], "target": 6 }, "output": "0 1" },
        { "input": { "nums": [1, 2, 3, 4, 5], "target": 9 }, "output": "3 4" },
        { "input": { "nums": twoSumNums, "target": twoSumTarget }, "output": solveTwoSum(twoSumNums, twoSumTarget) }
      ],
      "tags": ["Array", "Hash Map"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3002" },
      "title": "Valid Parentheses",
      "difficulty": "easy",
      "description": "Given a string `s` containing only `'('`, `')'`, `'{'`, `'}'`, `'['`, `']'`, determine if it is **valid**.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: A single string **s**.\n\n**Output Format:**\n- Print `true` or `false` for each test case.",
      "constraints": ["1 <= T <= 10", "0 <= s.length <= 2 * 10^4", "s consists only of '(){}[]'"],
      "sampleInput": "2\n()[]{}\n(]",
      "sampleOutput": "true\nfalse",
      "testCases": [
        { "input": "()[]{}", "output": "true" },
        { "input": "(]", "output": "false" },
        { "input": "{[]}", "output": "true" },
        { "input": "([)]", "output": "false" },
        { "input": vpStr, "output": solveValidParentheses(vpStr) ? "true" : "false" }
      ],
      "tags": ["Stack", "String"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3003" },
      "title": "Longest Substring Without Repeating Characters",
      "difficulty": "medium",
      "description": "Given a string `s`, find the **length** of the longest substring without repeating characters.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: A single string **s**.",
      "constraints": ["1 <= T <= 10", "0 <= s.length <= 5 * 10^4"],
      "sampleInput": "2\nabcabcbb\nbbbbb",
      "sampleOutput": "3\n1",
      "testCases": [
        { "input": "abcabcbb", "output": "3" },
        { "input": "bbbbb", "output": "1" },
        { "input": "pwwkew", "output": "3" },
        { "input": "aab", "output": "2" },
        { "input": lsStr, "output": solveLongestSubstring(lsStr) }
      ],
      "tags": ["Sliding Window", "String"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3004" },
      "title": "Binary Tree Level Order Traversal",
      "difficulty": "medium",
      "description": "Given the root of a binary tree, return its **level order traversal** as a 2D array.",
      "constraints": ["1 <= T <= 10", "0 <= Number of nodes <= 2000"],
      "sampleInput": "2\n7\n3 9 20 null null 15 7\n1\n1",
      "sampleOutput": "[[3],[9,20],[15,7]]\n[[1]]",
      "testCases": [
        { "input": [3, 9, 20, null, null, 15, 7], "output": solveLevelOrder([3, 9, 20, null, null, 15, 7]) },
        { "input": [1], "output": solveLevelOrder([1]) },
        { "input": [], "output": "[]" },
        { "input": [1, null, 2, null, null, null, 3], "output": solveLevelOrder([1, null, 2, null, null, null, 3]) },
        { "input": levelOrderArr, "output": solveLevelOrder(levelOrderArr) }
      ],
      "tags": ["Tree", "BFS"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3005" },
      "title": "Trapping Rain Water",
      "difficulty": "hard",
      "description": "Compute how much water can be trapped after raining given an elevation map.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4", "0 <= height[i] <= 10^5"],
      "sampleInput": "2\n12\n0 1 0 2 1 0 1 3 2 1 2 1\n6\n4 2 0 3 2 5",
      "sampleOutput": "6\n9",
      "testCases": [
        { "input": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], "output": "6" },
        { "input": [4, 2, 0, 3, 2, 5], "output": "9" },
        { "input": [3, 0, 3], "output": "3" },
        { "input": [3, 0, 2, 0, 4], "output": "7" },
        { "input": twNums, "output": solveTrappingWater(twNums) }
      ],
      "tags": ["Array", "Two Pointers"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c40" },
      "title": "Maximum Subarray",
      "difficulty": "medium",
      "description": "Given an integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
      "constraints": ["1 <= N <= 10^5", "-10^4 <= arr[i] <= 10^4"],
      "sampleInput": "9\n-2 1 -3 4 -1 2 1 -5 4",
      "sampleOutput": "6",
      "testCases": [
        { "input": "9\n-2 1 -3 4 -1 2 1 -5 4", "output": "6" },
        { "input": "1\n1", "output": "1" },
        { "input": "5\n5 4 -1 7 8", "output": "23" },
        { "input": `10000\n${maxSubArr1.join(' ')}`, "output": solveMaxSubarray(maxSubArr1) },
        { "input": `10000\n${maxSubArr2.join(' ')}`, "output": "10" }
      ],
      "tags": ["Array", "Dynamic Programming"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c41" },
      "title": "Contains Duplicate",
      "difficulty": "easy",
      "description": "Given an integer array, return `1` if any value appears at least twice in the array, and return `0` if every element is distinct.",
      "constraints": ["1 <= N <= 10^5", "-10^9 <= arr[i] <= 10^9"],
      "sampleInput": "4\n1 2 3 1",
      "sampleOutput": "1",
      "testCases": [
        { "input": "4\n1 2 3 1", "output": "1" },
        { "input": "4\n1 2 3 4", "output": "0" },
        { "input": "10\n1 1 1 3 3 4 3 2 4 2", "output": "1" },
        { "input": `10000\n${dupArr1.join(' ')}`, "output": "0" },
        { "input": `10000\n${dupArr2.join(' ')}`, "output": "1" }
      ],
      "tags": ["Array", "Hash Table"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c42" },
      "title": "Single Number",
      "difficulty": "easy",
      "description": "Given a non-empty array of integers, every element appears twice except for one. Find that single one.",
      "constraints": ["1 <= N <= 3 * 10^4", "N is always odd."],
      "sampleInput": "3\n2 2 1",
      "sampleOutput": "1",
      "testCases": [
        { "input": "3\n2 2 1", "output": "1" },
        { "input": "5\n4 1 2 1 2", "output": "4" },
        { "input": "1\n1", "output": "1" },
        { "input": "7\n0 1 0 1 99 2 2", "output": "99" },
        { "input": `${singleArr1.length}\n${singleArr1.join(' ')}`, "output": "99999" }
      ],
      "tags": ["Array", "Bit Manipulation"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c43" },
      "title": "Majority Element",
      "difficulty": "easy",
      "description": "Given an array of size N, return the majority element.",
      "constraints": ["1 <= N <= 5 * 10^4"],
      "sampleInput": "3\n3 2 3",
      "sampleOutput": "3",
      "testCases": [
        { "input": "3\n3 2 3", "output": "3" },
        { "input": "7\n2 2 1 1 1 2 2", "output": "2" },
        { "input": "1\n5", "output": "5" },
        { "input": "5\n1 1 1 2 2", "output": "1" },
        { "input": `10000\n${majArr1.join(' ')}`, "output": "5" }
      ],
      "tags": ["Array", "Divide and Conquer"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c44" },
      "title": "Valid Palindrome",
      "difficulty": "easy",
      "description": "Given a string `s`, return `1` if it is a palindrome, or `0` otherwise.",
      "constraints": ["1 <= s.length <= 2 * 10^5"],
      "sampleInput": "racecar",
      "sampleOutput": "1",
      "testCases": [
        { "input": "racecar", "output": "1" },
        { "input": "hello", "output": "0" },
        { "input": "AmanaplanacanalPanama", "output": "1" },
        { "input": palStr1, "output": "1" },
        { "input": palStr2, "output": "0" }
      ],
      "tags": ["Two Pointers", "String"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c45" },
      "title": "Valid Anagram",
      "difficulty": "easy",
      "description": "Given two strings `s` and `t`, return `1` if `t` is an anagram of `s`, and `0` otherwise.",
      "constraints": ["1 <= s.length, t.length <= 5 * 10^4"],
      "sampleInput": "anagram\nnagaram",
      "sampleOutput": "1",
      "testCases": [
        { "input": "anagram\nnagaram", "output": "1" },
        { "input": "rat\ncar", "output": "0" },
        { "input": "a\na", "output": "1" },
        { "input": "ab\na", "output": "0" },
        { "input": `${anaStr1}\n${anaStr2}`, "output": "1" }
      ],
      "tags": ["Hash Table", "String"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c46" },
      "title": "Length of Last Word",
      "difficulty": "easy",
      "description": "Given a string `s` consisting of words and spaces, return the length of the last word in the string.",
      "constraints": ["1 <= s.length <= 10^4"],
      "sampleInput": "2\nHello World",
      "sampleOutput": "5",
      "testCases": [
        { "input": "2\nHello World", "output": "5" },
        { "input": "3\nfly me moon", "output": "4" },
        { "input": "1\nword", "output": "4" },
        { "input": "5\nluffy is still joy boy", "output": "3" },
        { "input": "2\na b", "output": "1" }
      ],
      "tags": ["String"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c47" },
      "title": "Climbing Stairs",
      "difficulty": "easy",
      "description": "In how many distinct ways can you climb to the top of n stairs?",
      "constraints": ["1 <= n <= 45"],
      "sampleInput": "3",
      "sampleOutput": "3",
      "testCases": [
        { "input": "2", "output": "2" },
        { "input": "3", "output": "3" },
        { "input": "4", "output": "5" },
        { "input": "5", "output": "8" },
        { "input": "45", "output": "1836311903" }
      ],
      "tags": ["Math", "Dynamic Programming"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c48" },
      "title": "Fibonacci Number",
      "difficulty": "easy",
      "description": "The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones. Given `n`, calculate `F(n)`.",
      "constraints": ["0 <= n <= 30"],
      "sampleInput": "4",
      "sampleOutput": "3",
      "testCases": [
        { "input": "2", "output": "1" },
        { "input": "3", "output": "2" },
        { "input": "4", "output": "3" },
        { "input": "10", "output": "55" },
        { "input": "30", "output": "832040" }
      ],
      "tags": ["Math", "Dynamic Programming"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c49" },
      "title": "Power of Two",
      "difficulty": "easy",
      "description": "Given an integer `n`, return `1` if it is a power of two. Otherwise, return `0`.",
      "constraints": ["-2^31 <= n <= 2^31 - 1"],
      "sampleInput": "16",
      "sampleOutput": "1",
      "testCases": [
        { "input": "1", "output": "1" },
        { "input": "16", "output": "1" },
        { "input": "3", "output": "0" },
        { "input": "1024", "output": "1" },
        { "input": "-16", "output": "0" }
      ],
      "tags": ["Math", "Bit Manipulation"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c50" },
      "title": "Missing Number",
      "difficulty": "easy",
      "description": "Given an array containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
      "constraints": ["1 <= N <= 10^4"],
      "sampleInput": "3\n3 0 1",
      "sampleOutput": "2",
      "testCases": [
        { "input": "3\n3 0 1", "output": "2" },
        { "input": "2\n0 1", "output": "2" },
        { "input": "9\n9 6 4 2 3 5 7 0 1", "output": "8" },
        { "input": "1\n0", "output": "1" },
        { "input": `10000\n${Array.from({length:10000}, (_,i)=>i+1).join(' ')}`, "output": "0" }
      ],
      "tags": ["Array", "Bit Manipulation"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c51" },
      "title": "Reverse Integer",
      "difficulty": "medium",
      "description": "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range, return `0`.",
      "constraints": ["-2^31 <= x <= 2^31 - 1"],
      "sampleInput": "-123",
      "sampleOutput": "-321",
      "testCases": [
        { "input": "123", "output": "321" },
        { "input": "-123", "output": "-321" },
        { "input": "120", "output": "21" },
        { "input": "0", "output": "0" },
        { "input": "1534236469", "output": "0" }
      ],
      "tags": ["Math"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c52" },
      "title": "Find Minimum in Rotated Sorted Array",
      "difficulty": "medium",
      "description": "Suppose an array of length `n` sorted in ascending order is rotated between 1 and `n` times. Given the sorted rotated array, return the minimum element.",
      "constraints": ["1 <= N <= 5000", "-5000 <= arr[i] <= 5000", "Elements are unique."],
      "sampleInput": "5\n3 4 5 1 2",
      "sampleOutput": "1",
      "testCases": [
        { "input": "5\n3 4 5 1 2", "output": "1" },
        { "input": "7\n4 5 6 7 0 1 2", "output": "0" },
        { "input": "4\n11 13 15 17", "output": "11" },
        { "input": "1\n5", "output": "5" },
        { "input": "2\n2 1", "output": "1" }
      ],
      "tags": ["Array", "Binary Search"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c54" },
      "title": "First Unique Character",
      "difficulty": "easy",
      "description": "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return `-1`.",
      "constraints": ["1 <= s.length <= 10^5"],
      "sampleInput": "loveleetcode",
      "sampleOutput": "2",
      "testCases": [
        { "input": "leetcode", "output": "0" },
        { "input": "loveleetcode", "output": "2" },
        { "input": "aabb", "output": "-1" },
        { "input": "z", "output": "0" },
        { "input": "a".repeat(5000) + "b" + "a".repeat(5000), "output": "5000" }
      ],
      "tags": ["Hash Table", "String"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c55" },
      "title": "Palindrome Number",
      "difficulty": "easy",
      "description": "Given an integer `x`, return `1` if `x` is a palindrome integer, else return `0`.",
      "constraints": ["-2^31 <= x <= 2^31 - 1"],
      "sampleInput": "121",
      "sampleOutput": "1",
      "testCases": [
        { "input": "121", "output": "1" },
        { "input": "-121", "output": "0" },
        { "input": "10", "output": "0" },
        { "input": "0", "output": "1" },
        { "input": "123454321", "output": "1" }
      ],
      "tags": ["Math"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c56" },
      "title": "Move Zeroes",
      "difficulty": "easy",
      "description": "Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements.",
      "constraints": ["1 <= N <= 10^4"],
      "sampleInput": "5\n0 1 0 3 12",
      "sampleOutput": "1 3 12 0 0",
      "testCases": [
        { "input": "5\n0 1 0 3 12", "output": "1 3 12 0 0" },
        { "input": "1\n0", "output": "0" },
        { "input": "2\n1 0", "output": "1 0" },
        { "input": "5\n0 0 0 1 2", "output": "1 2 0 0 0" },
        { "input": `10000\n${Array(5000).fill(0).concat(Array.from({length:5000}, ()=>1)).join(' ')}`, "output": `${Array.from({length:5000}, ()=>1).concat(Array(5000).fill(0)).join(' ')}` }
      ],
      "tags": ["Array", "Two Pointers"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c57" },
      "title": "Reverse Vowels of a String",
      "difficulty": "easy",
      "description": "Given a string `s`, reverse only all the vowels in the string and return it.",
      "constraints": ["1 <= s.length <= 3 * 10^5"],
      "sampleInput": "hello",
      "sampleOutput": "holle",
      "testCases": [
        { "input": "hello", "output": "holle" },
        { "input": "leetcode", "output": "leotcede" },
        { "input": "aA", "output": "Aa" },
        { "input": "bcd", "output": "bcd" },
        { "input": "aeiou", "output": "uoiea" }
      ],
      "tags": ["Two Pointers", "String"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c58" },
      "title": "Number of 1 Bits",
      "difficulty": "easy",
      "description": "Write a function that takes an unsigned integer and returns the number of '1' bits it has (also known as the Hamming weight).",
      "constraints": ["0 <= n <= 2^31 - 1"],
      "sampleInput": "11",
      "sampleOutput": "3",
      "testCases": [
        { "input": "11", "output": "3" },
        { "input": "128", "output": "1" },
        { "input": "255", "output": "8" },
        { "input": "0", "output": "0" },
        { "input": "2147483645", "output": "30" }
      ],
      "tags": ["Math", "Bit Manipulation"]
    },
    {
      "_id": { "$oid": "60a1b2c3d4e5f6001a2b3c59" },
      "title": "Ugly Number",
      "difficulty": "easy",
      "description": "An ugly number is a positive integer whose prime factors are limited to `2`, `3`, and `5`. Given an integer `n`, return `1` if `n` is an ugly number, else `0`.",
      "constraints": ["-2^31 <= n <= 2^31 - 1"],
      "sampleInput": "14",
      "sampleOutput": "0",
      "testCases": [
        { "input": "6", "output": "1" },
        { "input": "1", "output": "1" },
        { "input": "14", "output": "0" },
        { "input": "8", "output": "1" },
        { "input": "0", "output": "0" }
      ],
      "tags": ["Math"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3006" },
      "title": "Search in Rotated Sorted Array",
      "difficulty": "medium",
      "description": "Given an integer array nums sorted in ascending order (with distinct values) that is possibly rotated at an unknown pivot, and a target, return the index of target. If not found, return -1.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 10^4", "-10^4 <= nums[i], target <= 10^4"],
      "sampleInput": "1\n7 0\n4 5 6 7 0 1 2",
      "sampleOutput": "4",
      "testCases": [
        { "input": { "nums": [4, 5, 6, 7, 0, 1, 2], "target": 0 }, "output": "4" },
        { "input": { "nums": [4, 5, 6, 7, 0, 1, 2], "target": 3 }, "output": "-1" },
        { "input": { "nums": [1], "target": 0 }, "output": "-1" },
        { "input": { "nums": [1, 3], "target": 3 }, "output": "1" },
        { "input": { "nums": [3, 1], "target": 1 }, "output": "1" },
        { "input": { "nums": [5, 1, 3], "target": 5 }, "output": "0" },
        { "input": { "nums": [1, 2, 3, 4, 5], "target": 4 }, "output": "3" },
        { "input": { "nums": [8, 9, 2, 3, 4], "target": 9 }, "output": "1" },
        { "input": { "nums": [1, 3, 5], "target": 1 }, "output": "0" },
        { "input": { "nums": rotatedNums, "target": rotatedTarget }, "output": solveSearchRotated(rotatedNums, rotatedTarget) }
      ],
      "tags": ["Array", "Binary Search"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3007" },
      "title": "Product of Array Except Self",
      "difficulty": "medium",
      "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must solve it in O(N) time without the division operator.",
      "constraints": ["1 <= T <= 10", "2 <= N <= 10^4", "-30 <= nums[i] <= 30"],
      "sampleInput": "1\n4\n1 2 3 4",
      "sampleOutput": "[24,12,8,6]",
      "testCases": [
        { "input": [1, 2, 3, 4], "output": "[24,12,8,6]" },
        { "input": [-1, 1, 0, -3, 3], "output": "[0,0,9,0,0]" },
        { "input": [1, 1], "output": "[1,1]" },
        { "input": [2, 3, 4], "output": "[12,8,6]" },
        { "input": [0, 4, 0], "output": "[0,0,0]" },
        { "input": [1, -1], "output": "[-1,1]" },
        { "input": [2, 2, 2], "output": "[4,4,4]" },
        { "input": [1, 2, 0, 4], "output": "[0,0,8,0]" },
        { "input": [-1, -1, -1, -1], "output": "[-1,-1,-1,-1]" },
        { "input": productNums, "output": solveProductExceptSelf(productNums) }
      ],
      "tags": ["Array", "Prefix Sum"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3009" },
      "title": "Jump Game",
      "difficulty": "medium",
      "description": "You are given an integer array nums. You are initially at the first index, and each element represents your maximum jump length. Return true if you can reach the last index, or false otherwise.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 10^4", "0 <= nums[i] <= 10^5"],
      "sampleInput": "1\n5\n2 3 1 1 4",
      "sampleOutput": "true",
      "testCases": [
        { "input": [2, 3, 1, 1, 4], "output": "true" },
        { "input": [3, 2, 1, 0, 4], "output": "false" },
        { "input": [0], "output": "true" },
        { "input": [2, 0, 0], "output": "true" },
        { "input": [1, 0, 1, 0], "output": "false" },
        { "input": [1, 1, 1, 1], "output": "true" },
        { "input": [10, 0, 0, 0], "output": "true" },
        { "input": [0, 1], "output": "false" },
        { "input": [1, 2, 3], "output": "true" },
        { "input": jumpNums, "output": solveJumpGame(jumpNums) }
      ],
      "tags": ["Array", "Greedy"]
    },
    {
      "_id": { "$oid": "aab100d23523fc80061e3010" },
      "title": "Container With Most Water",
      "difficulty": "medium",
      "description": "Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water.",
      "constraints": ["1 <= T <= 10", "2 <= N <= 10^4", "0 <= height[i] <= 10^4"],
      "sampleInput": "1\n9\n1 8 6 2 5 4 8 3 7",
      "sampleOutput": "49",
      "testCases": [
        { "input": [1, 8, 6, 2, 5, 4, 8, 3, 7], "output": "49" },
        { "input": [1, 1], "output": "1" },
        { "input": [4, 3, 2, 1, 4], "output": "16" },
        { "input": [1, 2, 1], "output": "2" },
        { "input": [0, 2], "output": "0" },
        { "input": [10, 9, 8, 7, 6, 5], "output": "15" },
        { "input": [1, 2, 4, 3], "output": "4" },
        { "input": [2, 3, 4, 5, 18, 17, 6], "output": "17" },
        { "input": [7, 7, 7, 7], "output": "21" },
        { "input": containerHeights, "output": solveContainerWater(containerHeights) }
      ],
      "tags": ["Array", "Two Pointers"]
    }
  ];
})();