// FILE: client/src/dsaQuestions.js
export const DSA_QUESTIONS = [
  {
    "_id": { "$oid": "696216d23523fc80061e2621" },
    "title": "Valid Parentheses",
    "difficulty": "easy",
    "description": "You are given a string containing only parentheses characters such as '()', '{}', and '[]'. Determine if the string is valid.\n\n**Input Format:**\n- The first line contains an integer **T**, the number of test cases.\n- For each test case, there is a single line containing the string **s**.\n\n**Output Format:**\n- For each test case, print `true` if valid, otherwise `false` on a new line.",
    "constraints": ["1 <= T <= 10", "1 <= s.length <= 10^4"],
    "sampleInput": [ "2", "()[]{}", "(]" ],
    "sampleOutput": [ "true", "false" ],
    "testCases": [
      { "input": "()[]{}", "output": true },
      { "input": "(]", "output": false },
      { "input": "{[]}", "output": true },
      { "input": "([)]", "output": false }
    ],
    "tags": [ "Stack", "String" ]
  },
  {
    "_id": { "$oid": "696216e03523fc80061e2622" },
    "title": "Reverse String",
    "difficulty": "easy",
    "description": "You are given a string. Your task is to reverse it in-place and print the result.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** (length), Line 2: String **S**.\n\n**Output Format:**\n- Print the reversed string.",
    "constraints": ["1 <= T <= 10", "1 <= N <= 10^5"],
    "sampleInput": [ "2", "5\nhello", "6\nHannah" ],
    "sampleOutput": [ "olleh", "hannaH" ],
    "testCases": [
      { "input": ["5", "hello"], "output": "olleh" },
      { "input": ["6", "Hannah"], "output": "hannaH" },
      { "input": ["4", "race"], "output": "ecar" }
    ],
    "tags": [ "Two Pointers", "String" ]
  },
  {
    "_id": { "$oid": "696216eb3523fc80061e2623" },
    "title": "Two Sum",
    "difficulty": "easy",
    "description": "Given an array of integers and an integer target, find two distinct indices such that they add up to the target.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** **Target**, Line 2: **N** integers.\n\n**Output Format:**\n- Print indices separated by space.",
    "constraints": ["1 <= T <= 10", "2 <= N <= 10^4"],
    "sampleInput": [ "2", "4 9\n2 7 11 15", "3 6\n3 2 4" ],
    "sampleOutput": [ "0 1", "1 2" ],
    "testCases": [
      { "input": { "nums": [2, 7, 11, 15], "target": 9 }, "output": "0 1" },
      { "input": { "nums": [3, 2, 4], "target": 6 }, "output": "1 2" },
      { "input": { "nums": [3, 3], "target": 6 }, "output": "0 1" }
    ],
    "tags": [ "Array", "Hash Map" ]
  },
  {
    "_id": { "$oid": "696217f23523fc80061e2624" },
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "medium",
    "description": "Find the length of the longest substring without repeating characters.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: A single string **S**.",
    "constraints": ["1 <= T <= 10", "0 <= s.length <= 5 * 10^4"],
    "sampleInput": [ "2", "abcabcbb", "bbbbb" ],
    "sampleOutput": [ "3", "1" ],
    "testCases": [
      { "input": "abcabcbb", "output": "3" },
      { "input": "bbbbb", "output": "1" },
      { "input": "pwwkew", "output": "3" },
      { "input": "", "output": "0" }
    ],
    "tags": [ "Sliding Window", "String" ]
  },
  {
    "_id": { "$oid": "6962182b3523fc80061e2625" },
    "title": "Subarray Sum Equals K",
    "difficulty": "medium",
    "description": "Find the total number of continuous subarrays whose sum equals K.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** **K**, Line 2: **N** integers.",
    "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4"],
    "sampleInput": [ "2", "3 2\n1 1 1", "3 3\n1 2 3" ],
    "sampleOutput": [ "2", "2" ],
    "testCases": [
      { "input": { "nums": [1, 1, 1], "target": 2 }, "output": "2" },
      { "input": { "nums": [1, 2, 3], "target": 3 }, "output": "2" },
      { "input": { "nums": [1, -1, 0], "target": 0 }, "output": "3" }
    ],
    "tags": [ "Prefix Sum", "Hash Map" ]
  },
  {
    "_id": { "$oid": "696218343523fc80061e2626" },
    "title": "Kth Largest Element",
    "difficulty": "medium",
    "description": "Find the Kth largest element in an array.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N** **K**, Line 2: **N** integers.",
    "constraints": ["1 <= T <= 10", "1 <= K <= N <= 10^5"],
    "sampleInput": [ "2", "6 2\n3 2 1 5 6 4", "9 4\n3 2 3 1 2 4 5 5 6" ],
    "sampleOutput": [ "5", "4" ],
    "testCases": [
      { "input": { "nums": [3, 2, 1, 5, 6, 4], "target": 2 }, "output": "5" },
      { "input": { "nums": [3, 2, 3, 1, 2, 4, 5, 5, 6], "target": 4 }, "output": "4" },
      { "input": { "nums": [1], "target": 1 }, "output": "1" }
    ],
    "tags": [ "Array", "Heap" ]
  },
  {
    "_id": { "$oid": "696218de3523fc80061e2628" },
    "title": "Jump Game",
    "difficulty": "medium",
    "description": "Determine if you can reach the last index of the array starting from the first.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
    "constraints": ["1 <= T <= 10", "1 <= N <= 10^4"],
    "sampleInput": [ "2", "5\n2 3 1 1 4", "5\n3 2 1 0 4" ],
    "sampleOutput": [ "true", "false" ],
    "testCases": [
      { "input": [2, 3, 1, 1, 4], "output": "true" },
      { "input": [3, 2, 1, 0, 4], "output": "false" },
      { "input": [0], "output": "true" }
    ],
    "tags": [ "Array", "Greedy" ]
  },
  {
    "_id": { "$oid": "696219303523fc80061e262b" },
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "easy",
    "description": "Maximize your profit by choosing a single day to buy and a different day to sell.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
    "constraints": ["1 <= T <= 10", "1 <= N <= 10^5"],
    "sampleInput": [ "2", "6\n7 1 5 3 6 4", "5\n7 6 4 3 1" ],
    "sampleOutput": [ "5", "0" ],
    "testCases": [
      { "input": [7, 1, 5, 3, 6, 4], "output": "5" },
      { "input": [7, 6, 4, 3, 1], "output": "0" },
      { "input": [1, 2], "output": "1" }
    ],
    "tags": [ "Array", "DP" ]
  },
  {
    "_id": { "$oid": "696219523523fc80061e262d" },
    "title": "Trapping Rain Water",
    "difficulty": "hard",
    "description": "Compute how much water can be trapped after raining given an elevation map.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
    "constraints": ["1 <= T <= 10", "1 <= N <= 2 * 10^4"],
    "sampleInput": [ "2", "12\n0 1 0 2 1 0 1 3 2 1 2 1", "6\n4 2 0 3 2 5" ],
    "sampleOutput": [ "6", "9" ],
    "testCases": [
      { "input": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], "output": "6" },
      { "input": [4, 2, 0, 3, 2, 5], "output": "9" }
    ],
    "tags": [ "Array", "Stack", "Two Pointers" ]
  },
  {
    "_id": { "$oid": "696219673523fc80061e262f" },
    "title": "Largest Rectangle in Histogram",
    "difficulty": "hard",
    "description": "Find the area of the largest rectangle in a histogram.\n\n**Input Format:**\n- First line: **T**.\n- For each test case: Line 1: **N**, Line 2: **N** integers.",
    "constraints": ["1 <= T <= 10", "1 <= N <= 10^5"],
    "sampleInput": [ "2", "6\n2 1 5 6 2 3", "2\n2 4" ],
    "sampleOutput": [ "10", "4" ],
    "testCases": [
      { "input": [2, 1, 5, 6, 2, 3], "output": "10" },
      { "input": [2, 4], "output": "4" }
    ],
    "tags": [ "Stack", "Array" ]
  }
];