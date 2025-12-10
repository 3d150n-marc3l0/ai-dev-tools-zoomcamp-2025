import { customAlphabet } from 'nanoid';

// Generate a short, readable session code
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateCode = customAlphabet(alphabet, 6);

export const createSessionCode = (): string => {
  return generateCode();
};

export const getSessionUrl = (code: string): string => {
  return `${window.location.origin}/session/${code}`;
};

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'csharp', name: 'C#', extension: '.cs' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'ruby', name: 'Ruby', extension: '.rb' },
  { id: 'php', name: 'PHP', extension: '.php' },
  { id: 'swift', name: 'Swift', extension: '.swift' },
  { id: 'kotlin', name: 'Kotlin', extension: '.kt' },
] as const;

export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  javascript: `// Welcome to the Interview Session
// Write your JavaScript code here

function solution(input) {
  // Your implementation here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  typescript: `// Welcome to the Interview Session
// Write your TypeScript code here

function solution(input: string): string {
  // Your implementation here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  python: `# Welcome to the Interview Session
# Write your Python code here

def solution(input):
    # Your implementation here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
  java: `// Welcome to the Interview Session
// Write your Java code here

public class Solution {
    public static String solution(String input) {
        // Your implementation here
        return input;
    }
    
    public static void main(String[] args) {
        System.out.println(solution("Hello, World!"));
    }
}
`,
  cpp: `// Welcome to the Interview Session
// Write your C++ code here

#include <iostream>
#include <string>

std::string solution(std::string input) {
    // Your implementation here
    return input;
}

int main() {
    std::cout << solution("Hello, World!") << std::endl;
    return 0;
}
`,
  go: `// Welcome to the Interview Session
// Write your Go code here

package main

import "fmt"

func solution(input string) string {
    // Your implementation here
    return input
}

func main() {
    fmt.Println(solution("Hello, World!"))
}
`,
  rust: `// Welcome to the Interview Session
// Write your Rust code here

fn solution(input: &str) -> String {
    // Your implementation here
    input.to_string()
}

fn main() {
    println!("{}", solution("Hello, World!"));
}
`,
};
