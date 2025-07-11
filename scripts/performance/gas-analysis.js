const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Gas Usage Analysis and Optimization Recommendations
 *
 * Analyzes gas usage patterns and provides optimization suggestions
 */

console.log("==========================================");
console.log("   Gas Usage Analysis");
console.log("   Performance Optimization Report");
console.log("==========================================\n");

const results = {
  timestamp: new Date().toISOString(),
  functions: [],
  recommendations: [],
  totalGasEstimate: 0
};

// Run tests with gas reporting
console.log("1. Running Gas Reporter");
console.log("   --------------------");
try {
  const output = execSync("npm run test:gas", {
    encoding: "utf-8",
    env: { ...process.env, REPORT_GAS: "true" }
  });

  console.log("   ✅ Gas report generated");
  console.log("");
} catch (error) {
  console.log("   ⚠️  Could not generate gas report");
  console.log("   Error:", error.message);
}

// Analyze contract patterns
console.log("2. Code Pattern Analysis");
console.log("   ---------------------");

const contractsDir = path.join(__dirname, "..", "..", "contracts");
const patterns = {
  storageReads: {
    pattern: /\w+\s*=\s*\w+;/g,
    recommendation: "Cache storage reads in memory",
    gasSaving: "~100 gas per read"
  },
  publicArrays: {
    pattern: /\[\]\s+public/g,
    recommendation: "Consider making arrays private with getter functions",
    gasSaving: "~50-200 gas per call"
  },
  stringConcatenation: {
    pattern: /string\.concat|abi\.encodePacked/g,
    recommendation: "Minimize string operations",
    gasSaving: "~100-500 gas"
  },
  requireMessages: {
    pattern: /require\([^,]+,\s*"[^"]{32,}"\)/g,
    recommendation: "Shorten require error messages (< 32 chars)",
    gasSaving: "~20 gas per character over 32"
  }
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath);

  console.log(`   Analyzing ${fileName}...`);

  for (const [patternName, config] of Object.entries(patterns)) {
    const matches = content.match(config.pattern);
    if (matches && matches.length > 0) {
      console.log(`     ⚠️  Found ${matches.length} instances of ${patternName}`);
      console.log(`        💡 ${config.recommendation}`);
      console.log(`        ⛽ Potential saving: ${config.gasSaving}`);

      results.recommendations.push({
        file: fileName,
        pattern: patternName,
        count: matches.length,
        recommendation: config.recommendation,
        gasSaving: config.gasSaving
      });
    }
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith(".sol")) {
      analyzeFile(filePath);
    }
  }
}

scanDirectory(contractsDir);
console.log("");

// Optimization recommendations
console.log("3. Optimization Recommendations");
console.log("   ----------------------------");

const recommendations = [
  {
    title: "Enable Optimizer",
    description: "Ensure Solidity optimizer is enabled with optimal runs",
    current: "Check hardhat.config.js optimizer settings",
    suggestion: "runs: 200 for balanced optimization"
  },
  {
    title: "Use Immutable for Constants",
    description: "Mark constants as immutable when set in constructor",
    gasSaving: "~20,000 gas for deployment"
  },
  {
    title: "Pack Storage Variables",
    description: "Group variables by size to fit in 32-byte slots",
    gasSaving: "~20,000 gas per slot saved"
  },
  {
    title: "Use Events for Data Storage",
    description: "Store non-critical data in events instead of storage",
    gasSaving: "~20,000 gas vs storage"
  },
  {
    title: "Batch Operations",
    description: "Combine multiple operations into single transactions",
    gasSaving: "~21,000 gas per transaction saved"
  }
];

recommendations.forEach((rec, index) => {
  console.log(`   ${index + 1}. ${rec.title}`);
  console.log(`      ${rec.description}`);
  if (rec.gasSaving) {
    console.log(`      ⛽ Potential saving: ${rec.gasSaving}`);
  }
  if (rec.current) {
    console.log(`      Current: ${rec.current}`);
  }
  if (rec.suggestion) {
    console.log(`      Suggestion: ${rec.suggestion}`);
  }
  console.log("");
});

// Check optimizer configuration
console.log("4. Current Optimizer Configuration");
console.log("   -------------------------------");

try {
  const configPath = path.join(__dirname, "..", "..", "hardhat.config.js");
  const config = fs.readFileSync(configPath, "utf8");

  const optimizerMatch = config.match(/optimizer:\s*{[\s\S]*?enabled:\s*(\w+)[\s\S]*?runs:\s*(\d+)/);

  if (optimizerMatch) {
    const enabled = optimizerMatch[1];
    const runs = optimizerMatch[2];

    console.log(`   Optimizer Enabled: ${enabled}`);
    console.log(`   Optimization Runs: ${runs}`);

    if (enabled === "true") {
      console.log("   ✅ Optimizer is enabled");

      const runsNum = parseInt(runs);
      if (runsNum >= 200 && runsNum <= 1000) {
        console.log("   ✅ Runs setting is optimal");
      } else if (runsNum < 200) {
        console.log("   ⚠️  Consider increasing runs for better runtime gas efficiency");
      } else {
        console.log("   ⚠️  High runs value may increase deployment cost");
      }
    } else {
      console.log("   ❌ Optimizer is disabled - Enable for production!");
    }
  } else {
    console.log("   ⚠️  Could not parse optimizer configuration");
  }
} catch (error) {
  console.log("   ⚠️  Error reading configuration:", error.message);
}
console.log("");

// Summary
console.log("==========================================");
console.log("   GAS ANALYSIS SUMMARY");
console.log("==========================================");
console.log(`   Recommendations: ${results.recommendations.length}`);
console.log(`   Optimization Patterns: ${Object.keys(patterns).length}`);
console.log("==========================================\n");

// Save report
const reportDir = path.join(__dirname, "..", "..", "reports");
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const reportFile = path.join(reportDir, `gas-analysis-${Date.now()}.json`);
fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
console.log(`Report saved to: ${reportFile}\n`);

console.log("💡 Next Steps:");
console.log("   1. Review recommendations above");
console.log("   2. Implement suggested optimizations");
console.log("   3. Run 'npm run test:gas' to measure improvements");
console.log("   4. Compare before/after gas usage\n");

console.log("✅ Gas analysis complete!");
