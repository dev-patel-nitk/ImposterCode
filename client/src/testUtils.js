// FILE: client/src/testUtils.js

export const formatInputForExecution = (input) => {
    // Ensure input is properly stringified for the execution environment
    if (typeof input === 'object') {
        return JSON.stringify(input);
    }
    return String(input);
};

export const normalizeOutput = (out) => {
    if (out === null || out === undefined) return "";
    
    // 1. Force strict string conversion IMMEDIATELY to kill JS type coercion
    let cleaned = String(out).toLowerCase().trim();
    
    // 2. Safely translate string booleans to binary for the grader
    if (cleaned === "true" || cleaned === "true.") return "1";
    if (cleaned === "false" || cleaned === "false.") return "0";
    
    return cleaned;
};

export const normalizeExpected = (out) => {
    if (out === null || out === undefined) return "";
    
    // Force strict string conversion
    return String(out).toLowerCase().trim();
};