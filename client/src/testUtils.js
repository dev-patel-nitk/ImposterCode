// FILE: client/src/testUtils.js

// 1. Convert JSON Input -> Competitive Programming Text Input
export const formatInputForExecution = (input) => {
  // Case 1: Simple String (e.g., "()[]{}")
  if (typeof input === 'string') {
    return input;
  }

  // Case 2: Array (e.g., [1, 2, 3]) -> "3 \n 1 2 3"
  if (Array.isArray(input)) {
    return `${input.length}\n${input.join(' ')}`;
  }

  // Case 3: Object (Two Sum, Gas Station, etc.)
  if (typeof input === 'object' && input !== null) {
    // Two Sum: { nums: [...], target: 9 }
    if (input.nums && input.target !== undefined) {
      return `${input.nums.length} ${input.target}\n${input.nums.join(' ')}`;
    }
    // Gas Station: { gas: [...], cost: [...] }
    if (input.gas && input.cost) {
      return `${input.gas.length}\n${input.gas.join(' ')}\n${input.cost.join(' ')}`;
    }
    // Merge Sorted Array: { nums1, m, nums2, n }
    if (input.nums1 && input.nums2) {
      return `${input.m} ${input.n}\n${input.nums1.join(' ')}\n${input.nums2.join(' ')}`;
    }
  }

  return "";
};

// 2. Normalize Output for Comparison
// Converts C++ (1/0), Python (True/False), and JSON (true/false) to standard boolean
export const normalizeOutput = (rawOutput) => {
  const clean = rawOutput.trim().toLowerCase();
  
  if (clean === 'true' || clean === '1') return 'true';
  if (clean === 'false' || clean === '0') return 'false';
  
  // Remove brackets for array comparison (e.g., "[1, 2]" -> "1 2")
  if (clean.startsWith('[') && clean.endsWith(']')) {
      return clean.slice(1, -1).replace(/,/g, ' ').trim();
  }
  
  return clean;
};

export const normalizeExpected = (expected) => {
    if (expected === true) return 'true';
    if (expected === false) return 'false';
    if (Array.isArray(expected)) return expected.join(' ');
    return String(expected).trim().toLowerCase();
}