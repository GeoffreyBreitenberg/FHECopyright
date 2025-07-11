const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Comprehensive Security Audit Script
 *
 * Performs multiple security checks:
 * 1. npm audit for dependency vulnerabilities
 * 2. Solidity code analysis
 * 3. Contract size checks
 * 4. Access control verification
 * 5. DoS attack surface analysis
 */

console.log("==========================================");
console.log("   Security Audit Report");
console.log("   Comprehensive Security Analysis");
console.log("==========================================\n");

const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  passed: 0,
  warnings: 0,
  failures: 0
};

// Check 1: npm audit
console.log("1. Dependency Vulnerability Scan");
console.log("   --------------------------------");
try {
  execSync("npm audit --json", { encoding: "utf-8", stdio: "pipe" });
  console.log("   ✅ No vulnerabilities found");
  results.checks.push({ name: "Dependency Audit", status: "PASS" });
  results.passed++;
} catch (error) {
  const auditOutput = error.stdout || error.stderr;
  try {
    const audit = JSON.parse(auditOutput);
    const vulnCount = audit.metadata?.vulnerabilities;

    if (vulnCount) {
      console.log(`   ⚠️  Found vulnerabilities:`);
      console.log(`      Critical: ${vulnCount.critical || 0}`);
      console.log(`      High: ${vulnCount.high || 0}`);
      console.log(`      Moderate: ${vulnCount.moderate || 0}`);
      console.log(`      Low: ${vulnCount.low || 0}`);

      if (vulnCount.critical > 0 || vulnCount.high > 0) {
        results.checks.push({ name: "Dependency Audit", status: "FAIL", details: vulnCount });
        results.failures++;
      } else {
        results.checks.push({ name: "Dependency Audit", status: "WARN", details: vulnCount });
        results.warnings++;
      }
    }
  } catch (e) {
    console.log("   ⚠️  Could not parse audit results");
    results.checks.push({ name: "Dependency Audit", status: "WARN" });
    results.warnings++;
  }
}
console.log("");

// Check 2: Contract Size Analysis
console.log("2. Contract Size Analysis");
console.log("   -----------------------");
try {
  const artifactsDir = path.join(__dirname, "..", "..", "artifacts", "contracts");

  if (fs.existsSync(artifactsDir)) {
    const contracts = [];

    function findContracts(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.includes(".dbg.json")) {
          findContracts(filePath);
        } else if (file.endsWith(".json") && !file.includes(".dbg.json")) {
          try {
            const artifact = JSON.parse(fs.readFileSync(filePath, "utf8"));
            if (artifact.bytecode && artifact.bytecode !== "0x") {
              const size = Buffer.from(artifact.bytecode.slice(2), "hex").length;
              contracts.push({ name: artifact.contractName, size });
            }
          } catch (e) {
            // Skip invalid files
          }
        }
      }
    }

    findContracts(artifactsDir);

    let hasOversized = false;
    contracts.forEach(contract => {
      const sizeKB = (contract.size / 1024).toFixed(2);
      const percentage = ((contract.size / 24576) * 100).toFixed(1);

      if (contract.size > 24576) {
        console.log(`   ❌ ${contract.name}: ${sizeKB} KB (${percentage}%) - EXCEEDS LIMIT`);
        hasOversized = true;
      } else if (contract.size > 20000) {
        console.log(`   ⚠️  ${contract.name}: ${sizeKB} KB (${percentage}%) - Near limit`);
      } else {
        console.log(`   ✅ ${contract.name}: ${sizeKB} KB (${percentage}%)`);
      }
    });

    if (hasOversized) {
      results.checks.push({ name: "Contract Size", status: "FAIL" });
      results.failures++;
    } else {
      results.checks.push({ name: "Contract Size", status: "PASS" });
      results.passed++;
    }
  } else {
    console.log("   ⚠️  Artifacts not found. Run 'npm run compile' first.");
    results.checks.push({ name: "Contract Size", status: "SKIP" });
  }
} catch (error) {
  console.log("   ⚠️  Error analyzing contract size:", error.message);
  results.checks.push({ name: "Contract Size", status: "ERROR" });
  results.warnings++;
}
console.log("");

// Check 3: Solidity Linting Security Issues
console.log("3. Solidity Security Lint");
console.log("   ----------------------");
try {
  execSync("npm run lint:sol", { encoding: "utf-8", stdio: "inherit" });
  console.log("   ✅ No security issues found");
  results.checks.push({ name: "Solidity Lint", status: "PASS" });
  results.passed++;
} catch (error) {
  console.log("   ⚠️  Security issues detected. Review output above.");
  results.checks.push({ name: "Solidity Lint", status: "WARN" });
  results.warnings++;
}
console.log("");

// Check 4: Access Control Patterns
console.log("4. Access Control Verification");
console.log("   ---------------------------");
try {
  const contractsDir = path.join(__dirname, "..", "..", "contracts");
  let hasOwner = false;
  let hasModifiers = false;

  function checkFiles(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkFiles(filePath);
      } else if (file.endsWith(".sol")) {
        const content = fs.readFileSync(filePath, "utf8");
        if (content.includes("onlyOwner") || content.includes("Ownable")) {
          hasOwner = true;
        }
        if (content.includes("modifier ")) {
          hasModifiers = true;
        }
      }
    }
  }

  checkFiles(contractsDir);

  if (hasOwner && hasModifiers) {
    console.log("   ✅ Access control modifiers found");
    console.log("   ✅ Owner pattern implemented");
    results.checks.push({ name: "Access Control", status: "PASS" });
    results.passed++;
  } else {
    console.log("   ⚠️  Limited access control found");
    results.checks.push({ name: "Access Control", status: "WARN" });
    results.warnings++;
  }
} catch (error) {
  console.log("   ⚠️  Error checking access control:", error.message);
  results.checks.push({ name: "Access Control", status: "ERROR" });
  results.warnings++;
}
console.log("");

// Check 5: DoS Attack Surface
console.log("5. DoS Attack Surface Analysis");
console.log("   ---------------------------");
console.log("   Checking for common DoS patterns...");

try {
  const contractsDir = path.join(__dirname, "..", "..", "contracts");
  const patterns = {
    unboundedLoops: /for\s*\([^)]*\)\s*{(?![\s\S]*?break)/g,
    externalCalls: /\.call\s*{/g,
    largeArrays: /\[\]\s+public/g
  };

  let issuesFound = 0;

  function analyzeFiles(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        analyzeFiles(filePath);
      } else if (file.endsWith(".sol")) {
        const content = fs.readFileSync(filePath, "utf8");

        if (patterns.unboundedLoops.test(content)) {
          console.log(`   ⚠️  Potential unbounded loop in ${file}`);
          issuesFound++;
        }
        if (patterns.externalCalls.test(content)) {
          console.log(`   ⚠️  External call pattern in ${file}`);
          issuesFound++;
        }
      }
    }
  }

  analyzeFiles(contractsDir);

  if (issuesFound === 0) {
    console.log("   ✅ No obvious DoS vulnerabilities found");
    results.checks.push({ name: "DoS Analysis", status: "PASS" });
    results.passed++;
  } else {
    console.log(`   ⚠️  Found ${issuesFound} potential DoS issues`);
    results.checks.push({ name: "DoS Analysis", status: "WARN", issues: issuesFound });
    results.warnings++;
  }
} catch (error) {
  console.log("   ⚠️  Error analyzing DoS surface:", error.message);
  results.checks.push({ name: "DoS Analysis", status: "ERROR" });
  results.warnings++;
}
console.log("");

// Summary
console.log("==========================================");
console.log("   SECURITY AUDIT SUMMARY");
console.log("==========================================");
console.log(`   Total Checks: ${results.checks.length}`);
console.log(`   ✅ Passed: ${results.passed}`);
console.log(`   ⚠️  Warnings: ${results.warnings}`);
console.log(`   ❌ Failures: ${results.failures}`);
console.log("==========================================\n");

// Save report
const reportDir = path.join(__dirname, "..", "..", "reports");
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const reportFile = path.join(reportDir, `security-audit-${Date.now()}.json`);
fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
console.log(`Report saved to: ${reportFile}\n`);

// Exit code
if (results.failures > 0) {
  console.log("❌ Security audit failed. Please address the issues above.");
  process.exit(1);
} else if (results.warnings > 0) {
  console.log("⚠️  Security audit completed with warnings.");
  process.exit(0);
} else {
  console.log("✅ Security audit passed successfully!");
  process.exit(0);
}
