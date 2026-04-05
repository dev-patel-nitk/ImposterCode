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

  const solveSubarraySum = (nums, k) => {
    let count = 0, sum = 0;
    const map = new Map([[0, 1]]);
    for (let n of nums) {
      sum += n;
      if (map.has(sum - k)) count += map.get(sum - k);
      map.set(sum, (map.get(sum) || 0) + 1);
    }
    return count.toString();
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

  const solveLargestRectangle = (heights) => {
    let max = 0;
    const stack = [];
    for (let i = 0; i <= heights.length; i++) {
      while (stack.length > 0 && (i === heights.length || heights[i] < heights[stack[stack.length - 1]])) {
        const h = heights[stack.pop()];
        const w = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
        max = Math.max(max, h * w);
      }
      stack.push(i);
    }
    return max.toString();
  };

  // ==========================================
  // 🟢 ANTI-BRUTE-FORCE GENERATORS (10,000 LIMIT)
  // Safely sized to prevent JDoodle OS crashes
  // ==========================================

  const vpStr = "(".repeat(5000) + ")".repeat(5000); 
  const rsStr = getRandomString(10000);
  const tsNums = Array.from({ length: 10000 }, (_, i) => i + 1);
  const lsStr = "a".repeat(5000) + getRandomString(100) + "b".repeat(4900);
  const ssNums = getRandomArray(10000, -10, 10);
  const ssTarget = 5;
  const klNums = Array.from({ length: 10000 }, (_, i) => 10000 - i);
  
  // Jump Game Fix: Array of 1s, but a 0 right before the end. Forces O(N) scan but fails.
  const jgNums = Array(10000).fill(1);
  jgNums[9998] = 0; 
  
  const stockNums = Array.from({ length: 9000 }, (_, i) => 9000 - i).concat(Array.from({length: 1000}, (_,i) => i * 10));
  const rwNums = Array.from({ length: 10000 }, (_, i) => i < 5000 ? 5000 - i : i - 5000);
  const lrNums = Array.from({ length: 10000 }, (_, i) => i + 1);

  // ==========================================
  // 🟢 COMPILED QUESTION LIST
  // ==========================================
  return [
    {
      "_id": { "$oid": "696216d23523fc80061e2621" },
      "title": "Valid Parentheses",
      "difficulty": "easy",
      "description": "You are given a string containing only parentheses characters such as '()', '{}', and '[]'. Determine if the string is valid.\n\n**Input Format:**\n- The first line contains an integer **T**, the number of test cases.\n- For each test case, there is a single line containing the string **s**.\n\n**Output Format:**\n- For each test case, print `true` if valid, otherwise `false` on a new line.",
      "constraints": ["1 <= T <= 10", "1 <= s.length <= 2 * 10^4"],
      "sampleInput": "2\\n()[]{}\\n(]",
      "sampleOutput": "true\\nfalse",
      "testCases": [
        { "input": "()[]{}", "output": "true" },
        { "input": "(]", "output": "false" },
        { "input": "{[]}", "output": "true" },
        { "input": vpStr, "output": solveValidParentheses(vpStr) ? "true" : "false" } 
      ],
      "tags": [ "Stack", "String" ]
    },
    {
      "_id": { "$oid": "696216e03523fc80061e2622" },
      "title": "Reverse String",
      "difficulty": "easy",
      "description": "You are given a string. Your task is to reverse it in-place and print the result.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** (length), Line 2: String **S**.\n\n**Output Format:**\n- Print the reversed string.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 10^5"],
      "sampleInput": "2\\n5\\nhello\\n6\\nHannah",
      "sampleOutput": "olleh\\nhannaH",
      "testCases": [
        { "input": "5\nhello", "output": "olleh" },
        { "input": "6\nHannah", "output": "hannaH" },
        { "input": `${rsStr.length}\n${rsStr}`, "output": rsStr.split('').reverse().join('') } 
      ],
      "tags": [ "Two Pointers", "String" ]
    },
    {
      "_id": { "$oid": "696216eb3523fc80061e2623" },
      "title": "Two Sum",
      "difficulty": "easy",
      "description": "Given an array of integers and an integer target, find two distinct indices such that they add up to the target.\n\n**Assume exactly one valid solution exists.**\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** **Target**, Line 2: **N** integers.\n\n**Output Format:**\n- Print indices separated by a space **in ascending order** (e.g., `0 1`, not `1 0`).",
      "constraints": ["1 <= T <= 10", "2 <= N <= 2 * 10^4"],
      "sampleInput": "2\\n4 9\\n2 7 11 15\\n3 6\\n3 2 4",
      "sampleOutput": "0 1\\n1 2",
      "testCases": [
        { "input": { "nums": [2, 7, 11, 15], "target": 9 }, "output": "0 1" },
        { "input": { "nums": [3, 2, 4], "target": 6 }, "output": "1 2" },
        { "input": { "nums": tsNums, "target": 19999 }, "output": "9998 9999" } 
      ],
      "tags": [ "Array", "Hash Map" ]
    },
    {
      "_id": { "$oid": "696217f23523fc80061e2624" },
      "title": "Longest Substring Without Repeating Characters",
      "difficulty": "medium",
      "description": "Find the length of the longest substring without repeating characters.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: A single string **S**.",
      "constraints": ["1 <= T <= 10", "1 <= s.length <= 5 * 10^4"],
      "sampleInput": "2\\nabcabcbb\\nbbbbb",
      "sampleOutput": "3\\n1",
      "testCases": [
        { "input": "abcabcbb", "output": "3" },
        { "input": "bbbbb", "output": "1" },
        { "input": lsStr, "output": solveLongestSubstring(lsStr) } 
      ],
      "tags": [ "Sliding Window", "String" ]
    },
    {
      "_id": { "$oid": "6962182b3523fc80061e2625" },
      "title": "Subarray Sum Equals K",
      "difficulty": "medium",
      "description": "Find the total number of continuous subarrays whose sum equals K.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** **K**, Line 2: **N** integers.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4"],
      "sampleInput": "2\\n3 2\\n1 1 1\\n3 3\\n1 2 3",
      "sampleOutput": "2\\n2",
      "testCases": [
        { "input": { "nums": [1, 1, 1], "target": 2 }, "output": "2" },
        { "input": { "nums": [1, 2, 3], "target": 3 }, "output": "2" },
        { "input": { "nums": ssNums, "target": ssTarget }, "output": solveSubarraySum(ssNums, ssTarget) } 
      ],
      "tags": [ "Prefix Sum", "Hash Map" ]
    },
    {
      "_id": { "$oid": "696218343523fc80061e2626" },
      "title": "Kth Largest Element",
      "difficulty": "medium",
      "description": "Find the Kth largest element in an array.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** **K**, Line 2: **N** integers.",
      "constraints": ["1 <= T <= 10", "1 <= K <= N <= 2 * 10^4"],
      "sampleInput": "2\\n6 2\\n3 2 1 5 6 4\\n9 4\\n3 2 3 1 2 4 5 5 6",
      "sampleOutput": "5\\n4",
      "testCases": [
        { "input": { "nums": [3, 2, 1, 5, 6, 4], "target": 2 }, "output": "5" },
        { "input": { "nums": [3, 2, 3, 1, 2, 4, 5, 5, 6], "target": 4 }, "output": "4" },
        { "input": { "nums": klNums, "target": 150 }, "output": "9851" } 
      ],
      "tags": [ "Array", "Heap" ]
    },
    {
      "_id": { "$oid": "696218de3523fc80061e2628" },
      "title": "Jump Game",
      "difficulty": "medium",
      "description": "Determine if you can reach the last index of the array starting from the first.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4"],
      "sampleInput": "2\\n5\\n2 3 1 1 4\\n5\\n3 2 1 0 4",
      "sampleOutput": "true\\nfalse",
      "testCases": [
        { "input": [2, 3, 1, 1, 4], "output": "true" },
        { "input": [3, 2, 1, 0, 4], "output": "false" },
        { "input": jgNums, "output": "false" } 
      ],
      "tags": [ "Array", "Greedy" ]
    },
    {
      "_id": { "$oid": "696219303523fc80061e262b" },
      "title": "Best Time to Buy and Sell Stock",
      "difficulty": "easy",
      "description": "Maximize your profit by choosing a single day to buy and a different day to sell.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 10^5"],
      "sampleInput": "2\\n6\\n7 1 5 3 6 4\\n5\\n7 6 4 3 1",
      "sampleOutput": "5\\n0",
      "testCases": [
        { "input": [7, 1, 5, 3, 6, 4], "output": "5" },
        { "input": [7, 6, 4, 3, 1], "output": "0" },
        { "input": stockNums, "output": "9990" } 
      ],
      "tags": [ "Array", "DP" ]
    },
    {
      "_id": { "$oid": "696219523523fc80061e262d" },
      "title": "Trapping Rain Water",
      "difficulty": "hard",
      "description": "Compute how much water can be trapped after raining given an elevation map.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4"],
      "sampleInput": "2\\n12\\n0 1 0 2 1 0 1 3 2 1 2 1\\n6\\n4 2 0 3 2 5",
      "sampleOutput": "6\\n9",
      "testCases": [
        { "input": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], "output": "6" },
        { "input": [4, 2, 0, 3, 2, 5], "output": "9" },
        { "input": rwNums, "output": solveTrappingWater(rwNums) } 
      ],
      "tags": [ "Array", "Stack", "Two Pointers" ]
    },
    {
      "_id": { "$oid": "696219673523fc80061e262f" },
      "title": "Largest Rectangle in Histogram",
      "difficulty": "hard",
      "description": "Find the area of the largest rectangle in a histogram.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
      "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4"],
      "sampleInput": "2\\n6\\n2 1 5 6 2 3\\n2\\n2 4",
      "sampleOutput": "10\\n4",
      "testCases": [
        { "input": [2, 1, 5, 6, 2, 3], "output": "10" },
        { "input": [2, 4], "output": "4" },
        { "input": lrNums, "output": solveLargestRectangle(lrNums) } 
      ],
      "tags": [ "Stack", "Array" ]
    }
  ];
})();