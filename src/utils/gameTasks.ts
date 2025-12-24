// Game tasks for Syntax: Breach

export interface Task {
  id: string
  title: string
  description: string
  language: 'python' | 'c' | 'cpp'
  template: string
  tests: TaskTest[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface TaskTest {
  input: string
  expectedOutput: string
  description: string
}

export const TASKS: Task[] = [
  // Python Tasks
  {
    id: 'py_reverse_string',
    title: 'Reverse String',
    description: 'Fix the firewall by reversing the encrypted string',
    language: 'python',
    difficulty: 'easy',
    template: `def reverse_string(s):
    # Fix this function
    return s

# Test cases
print(reverse_string("hello"))  # Should output: olleh
print(reverse_string("world"))  # Should output: dlrow`,
    tests: [
      { input: 'hello', expectedOutput: 'olleh', description: 'Reverse "hello"' },
      { input: 'world', expectedOutput: 'dlrow', description: 'Reverse "world"' },
    ],
  },
  {
    id: 'py_sum_array',
    title: 'Sum Array',
    description: 'Calculate the checksum of the data packet',
    language: 'python',
    difficulty: 'easy',
    template: `def sum_array(arr):
    # Calculate sum of all elements
    total = 0
    # Your code here
    return total

# Test cases
print(sum_array([1, 2, 3, 4, 5]))  # Should output: 15
print(sum_array([10, 20, 30]))     # Should output: 60`,
    tests: [
      { input: '[1, 2, 3, 4, 5]', expectedOutput: '15', description: 'Sum of [1, 2, 3, 4, 5]' },
      { input: '[10, 20, 30]', expectedOutput: '60', description: 'Sum of [10, 20, 30]' },
    ],
  },
  {
    id: 'py_fibonacci',
    title: 'Fibonacci Sequence',
    description: 'Generate the security key using Fibonacci',
    language: 'python',
    difficulty: 'medium',
    template: `def fibonacci(n):
    # Generate nth Fibonacci number
    if n <= 1:
        return n
    # Complete the recursive solution
    return 0

# Test cases
print(fibonacci(5))   # Should output: 5
print(fibonacci(10))  # Should output: 55`,
    tests: [
      { input: '5', expectedOutput: '5', description: 'Fibonacci(5)' },
      { input: '10', expectedOutput: '55', description: 'Fibonacci(10)' },
    ],
  },

  // C Tasks
  {
    id: 'c_swap_values',
    title: 'Swap Values',
    description: 'Fix the memory buffer swap',
    language: 'c',
    difficulty: 'easy',
    template: `#include <stdio.h>

void swap(int *a, int *b) {
    // Swap the values
    // Your code here
}

int main() {
    int x = 5, y = 10;
    swap(&x, &y);
    printf("%d %d\\n", x, y);  // Should output: 10 5
    return 0;
}`,
    tests: [
      { input: '5 10', expectedOutput: '10 5', description: 'Swap 5 and 10' },
    ],
  },
  {
    id: 'c_factorial',
    title: 'Factorial',
    description: 'Calculate the authentication hash',
    language: 'c',
    difficulty: 'medium',
    template: `#include <stdio.h>

int factorial(int n) {
    // Calculate factorial
    if (n <= 1) return 1;
    // Your code here
    return 0;
}

int main() {
    printf("%d\\n", factorial(5));  // Should output: 120
    printf("%d\\n", factorial(6));  // Should output: 720
    return 0;
}`,
    tests: [
      { input: '5', expectedOutput: '120', description: 'Factorial of 5' },
      { input: '6', expectedOutput: '720', description: 'Factorial of 6' },
    ],
  },

  // C++ Tasks
  {
    id: 'cpp_is_palindrome',
    title: 'Palindrome Check',
    description: 'Validate the encrypted token',
    language: 'cpp',
    difficulty: 'easy',
    template: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Check if string is palindrome
    // Your code here
    return false;
}

int main() {
    cout << (isPalindrome("radar") ? "true" : "false") << endl;  // true
    cout << (isPalindrome("hello") ? "true" : "false") << endl;  // false
    return 0;
}`,
    tests: [
      { input: 'radar', expectedOutput: 'true', description: 'Check "radar"' },
      { input: 'hello', expectedOutput: 'false', description: 'Check "hello"' },
    ],
  },
  {
    id: 'cpp_find_max',
    title: 'Find Maximum',
    description: 'Locate the highest priority process',
    language: 'cpp',
    difficulty: 'easy',
    template: `#include <iostream>
#include <vector>
using namespace std;

int findMax(vector<int> arr) {
    // Find maximum element
    int maxVal = arr[0];
    // Your code here
    return maxVal;
}

int main() {
    vector<int> v1 = {1, 5, 3, 9, 2};
    vector<int> v2 = {10, 20, 15, 5};
    cout << findMax(v1) << endl;  // Should output: 9
    cout << findMax(v2) << endl;  // Should output: 20
    return 0;
}`,
    tests: [
      { input: '[1, 5, 3, 9, 2]', expectedOutput: '9', description: 'Max of [1, 5, 3, 9, 2]' },
      { input: '[10, 20, 15, 5]', expectedOutput: '20', description: 'Max of [10, 20, 15, 5]' },
    ],
  },
  {
    id: 'cpp_binary_search',
    title: 'Binary Search',
    description: 'Search the database efficiently',
    language: 'cpp',
    difficulty: 'hard',
    template: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int> arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    // Implement binary search
    // Return index if found, -1 if not found
    
    return -1;
}

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 13};
    cout << binarySearch(arr, 7) << endl;   // Should output: 3
    cout << binarySearch(arr, 13) << endl;  // Should output: 6
    cout << binarySearch(arr, 4) << endl;   // Should output: -1
    return 0;
}`,
    tests: [
      { input: '7', expectedOutput: '3', description: 'Search for 7' },
      { input: '13', expectedOutput: '6', description: 'Search for 13' },
      { input: '4', expectedOutput: '-1', description: 'Search for 4 (not found)' },
    ],
  },
]

// Sabotage actions for Phantoms
export interface Sabotage {
  id: string
  name: string
  description: string
  cooldown: number // seconds
  duration?: number // seconds (if applicable)
}

export const SABOTAGES: Sabotage[] = [
  {
    id: 'variable_scramble',
    name: 'Variable Scramble',
    description: 'Rename a variable and cause a glitch effect',
    cooldown: 30,
    duration: 1,
  },
  {
    id: 'infinite_loop',
    name: 'Inject Loop',
    description: 'Inject a subtle infinite loop bug',
    cooldown: 45,
  },
  {
    id: 'blind_spot',
    name: 'Code Blackout',
    description: 'Obscure code for 10 seconds',
    cooldown: 60,
    duration: 10,
  },
  {
    id: 'force_meeting',
    name: 'Emergency Alert',
    description: 'Force an emergency meeting',
    cooldown: 90,
  },
]

// Get random tasks for a game
export function getRandomTasks(count: number): Task[] {
  const shuffled = [...TASKS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, TASKS.length))
}

// Get tasks by language
export function getTasksByLanguage(language: 'python' | 'c' | 'cpp'): Task[] {
  return TASKS.filter(task => task.language === language)
}
