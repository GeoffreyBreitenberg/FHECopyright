# CI/CD Pipeline Documentation

Complete Continuous Integration and Continuous Deployment infrastructure for Anonymous Copyright Protection System.

---

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Workflows](#workflows)
4. [Code Quality Tools](#code-quality-tools)
5. [Running Locally](#running-locally)
6. [GitHub Actions Setup](#github-actions-setup)
7. [Badges](#badges)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### CI/CD Features

✅ **Automated Testing**
- Multiple Node.js versions (18.x, 20.x, 22.x)
- Cross-platform testing (Ubuntu, Windows, macOS)
- Unit and integration tests
- 56+ test cases coverage

✅ **Code Quality Checks**
- Solidity linting (Solhint)
- JavaScript linting (ESLint)
- Code formatting (Prettier)
- Complexity analysis

✅ **Coverage Reporting**
- Automated coverage generation
- Codecov integration
- PR coverage comments
- Coverage badges

✅ **Security**
- Dependency audit
- Vulnerability scanning
- Outdated package detection

✅ **Performance**
- Gas usage reporting
- Performance benchmarks
- Optimization recommendations

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Code Push / PR                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Code Quality Checks                         │
│  - Prettier (formatting)                                 │
│  - Solhint (Solidity linting)                            │
│  - ESLint (JavaScript linting)                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│           Build and Test Matrix                          │
│  - OS: Ubuntu, Windows, macOS                            │
│  - Node: 18.x, 20.x, 22.x                                │
│  - Compile contracts                                     │
│  - Run all tests                                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Coverage Analysis                             │
│  - Generate coverage report                              │
│  - Upload to Codecov                                     │
│  - Comment on PR                                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│           Security Audit                                 │
│  - npm audit                                             │
│  - Dependency check                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│        Gas Reporting (PR only)                           │
│  - Generate gas report                                   │
│  - Comment on PR                                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│       Deployment Dry Run (PR only)                       │
│  - Simulate deployment                                   │
│  - Verify artifacts                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              ✅ All Checks Passed                        │
└─────────────────────────────────────────────────────────┘
```

---

## Workflows

### 1. Main CI/CD Workflow

**File**: `.github/workflows/main.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs**:

#### Job 1: Code Quality Checks
```yaml
Runs on: ubuntu-latest
Matrix: Node 18.x, 20.x
Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Run Prettier check
  5. Run Solhint
  6. Run ESLint
```

#### Job 2: Build and Test
```yaml
Runs on: ubuntu-latest, windows-latest
Matrix: Node 18.x, 20.x
Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Compile contracts
  5. Run tests
  6. Generate coverage
  7. Upload to Codecov
```

#### Job 3: Security Audit
```yaml
Runs on: ubuntu-latest
Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Run npm audit
  5. Check outdated packages
```

#### Job 4: Gas Report (PR only)
```yaml
Runs on: ubuntu-latest
Condition: Pull Request
Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Compile contracts
  5. Run gas reporter
  6. Comment on PR
```

#### Job 5: Deployment Dry Run (PR only)
```yaml
Runs on: ubuntu-latest
Condition: Pull Request
Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Compile contracts
  5. Run simulation
  6. Verify artifacts
```

### 2. Test Workflow

**File**: `.github/workflows/test.yml`

**Triggers**:
- Push to `main`, `develop`, `feature/**`
- Pull requests to `main`, `develop`
- Daily schedule (00:00 UTC)
- Manual trigger

**Jobs**:

#### Job 1: Test Matrix
```yaml
Runs on: ubuntu-latest, windows-latest, macos-latest
Matrix: Node 18.x, 20.x, 22.x
Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Compile contracts
  5. Run unit tests
  6. Run integration tests
```

#### Job 2: Coverage
```yaml
Runs on: ubuntu-latest
Needs: test-matrix
Steps:
  1. Generate coverage
  2. Upload to Codecov
  3. Upload artifacts
  4. Comment on PR
```

#### Job 3: Test Quality Gates
```yaml
Runs on: ubuntu-latest
Needs: coverage
Steps:
  1. Check test count (≥45)
  2. Verify quality metrics
```

---

## Code Quality Tools

### Solhint (Solidity Linter)

**Configuration**: `.solhint.json`

**Rules**:
- Code complexity: max 10
- Compiler version: ≥0.8.20
- Max line length: 120
- No empty blocks
- Proper function visibility

**Usage**:
```bash
# Lint Solidity files
npm run lint:sol

# Fix automatically
npm run lint:sol:fix
```

**Ignored Files**: `.solhintignore`
- node_modules/
- artifacts/
- cache/
- coverage/

### ESLint (JavaScript Linter)

**Configuration**: `.eslintrc.json`

**Rules**:
- ES2021 syntax
- No unused variables (warn)
- Prefer const
- No var
- Always use ===
- Semicolons required

**Usage**:
```bash
# Lint JavaScript files
npm run lint:js

# Fix automatically
npm run lint:js:fix
```

### Prettier (Code Formatter)

**Configuration**: `.prettierrc.json`

**Settings**:
- Solidity: 4 spaces, 120 char width
- JavaScript: 2 spaces, 100 char width
- JSON: 2 spaces, 80 char width

**Usage**:
```bash
# Check formatting
npm run prettier:check

# Format all files
npm run prettier

# Format and fix all
npm run format
```

---

## Running Locally

### Prerequisites

```bash
# Install dependencies
npm install

# Install linters globally (optional)
npm install -g solhint eslint prettier
```

### Run All Checks

```bash
# Run complete CI pipeline locally
npm run ci
```

This runs:
1. Linting (Solhint + ESLint)
2. Compilation
3. Tests
4. Coverage

### Individual Commands

```bash
# Code quality
npm run lint              # Run all linters
npm run lint:sol          # Solidity only
npm run lint:js           # JavaScript only
npm run prettier:check    # Check formatting

# Fix issues
npm run lint:fix          # Fix linting issues
npm run prettier          # Format code
npm run format            # Fix and format everything

# Testing
npm test                  # Run all tests
npm run test:main         # Main test suite
npm run test:gas          # With gas reporting
npm run coverage          # Generate coverage

# Build
npm run compile           # Compile contracts
npm run clean             # Clean artifacts
```

### Pre-commit Checks

Before committing code, run:

```bash
npm run format            # Format and fix
npm run ci                # Run full pipeline
```

---

## GitHub Actions Setup

### 1. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Under **Actions permissions**, select **Allow all actions**
4. Click **Save**

### 2. Configure Codecov (Optional)

1. Go to [Codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add your repository
4. Copy the token
5. Go to **Settings** → **Secrets and variables** → **Actions**
6. Click **New repository secret**
7. Name: `CODECOV_TOKEN`
8. Value: [Your Codecov token]
9. Click **Add secret**

### 3. Verify Workflows

Push code to `main` or create a pull request:

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

Check workflow status:
1. Go to **Actions** tab
2. See running workflows
3. Click on workflow for details

---

## Badges

Add these badges to your README.md:

### CI/CD Status

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Automated%20Testing/badge.svg)
```

### Code Coverage

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

### License

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### Node Version

```markdown
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
```

---

## Troubleshooting

### Common Issues

#### 1. Prettier Check Fails

**Error**: `Code style issues found`

**Solution**:
```bash
# Format code
npm run prettier

# Or fix everything
npm run format
```

#### 2. Solhint Errors

**Error**: `Linting errors found in contracts`

**Solution**:
```bash
# Check specific errors
npm run lint:sol

# Try auto-fix
npm run lint:sol:fix

# Manual fixes may be needed
```

#### 3. ESLint Warnings

**Error**: `JavaScript linting issues`

**Solution**:
```bash
# Check errors
npm run lint:js

# Auto-fix
npm run lint:js:fix
```

#### 4. Test Failures

**Error**: `Tests failed`

**Solution**:
```bash
# Run tests locally
npm test

# Check specific test
npm run test:main

# Review test output
npm test -- --verbose
```

#### 5. Coverage Upload Fails

**Error**: `Codecov upload failed`

**Solution**:
- Check `CODECOV_TOKEN` is set
- Verify Codecov account access
- Check network connectivity
- Review Codecov dashboard

#### 6. Workflow Permissions

**Error**: `Permission denied`

**Solution**:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

#### 7. Node Version Issues

**Error**: `Unsupported Node version`

**Solution**:
- Update Node.js to 18.x, 20.x, or 22.x
- Check `.nvmrc` file
- Use nvm: `nvm install 20`

---

## Workflow Customization

### Modify Triggers

Edit `.github/workflows/main.yml`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - feature/*     # Add feature branches
  pull_request:
    branches:
      - main
      - develop
```

### Change Node Versions

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Modify versions
```

### Add More Checks

```yaml
- name: Custom check
  run: npm run custom-script
```

### Modify Coverage Threshold

Edit test script to fail on low coverage:

```json
{
  "scripts": {
    "coverage": "hardhat coverage --check-coverage --statements 85 --branches 75 --functions 90 --lines 85"
  }
}
```

---

## Performance Optimization

### Speed Up CI

1. **Use caching**:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
```

2. **Run jobs in parallel**:
```yaml
needs: []  # Remove dependencies when possible
```

3. **Skip redundant steps**:
```yaml
if: github.event_name == 'pull_request'
```

4. **Use matrix wisely**:
```yaml
strategy:
  matrix:
    # Test fewer combinations
    os: [ubuntu-latest]
    node-version: [20.x]
```

---

## Security Best Practices

### Secrets Management

1. Never commit secrets to repository
2. Use GitHub Secrets for sensitive data
3. Use environment variables
4. Rotate secrets regularly

### Dependency Management

```bash
# Regular audits
npm audit

# Fix vulnerabilities
npm audit fix

# Check outdated
npm outdated
```

### Code Scanning

Enable GitHub Advanced Security:
1. **Settings** → **Security** → **Code scanning**
2. Enable **CodeQL analysis**
3. Configure scanning schedule

---

## Monitoring and Metrics

### Track These Metrics

1. **Build Success Rate**: % of successful builds
2. **Test Coverage**: Maintain ≥85%
3. **Build Time**: Monitor trends
4. **Flaky Tests**: Identify and fix
5. **Security Alerts**: Address promptly

### View Analytics

1. Go to **Insights** → **Actions**
2. View workflow runs
3. Analyze trends
4. Identify bottlenecks

---

## Summary

### CI/CD Components

✅ **2 GitHub Actions workflows**
- Main CI/CD Pipeline
- Automated Testing

✅ **3 Linting tools**
- Solhint (Solidity)
- ESLint (JavaScript)
- Prettier (Formatting)

✅ **Coverage integration**
- Codecov
- PR comments
- Badges

✅ **Security tools**
- npm audit
- Dependency scanning

✅ **Performance monitoring**
- Gas reporting
- Test timing

### Quick Commands

```bash
# Development
npm run format        # Format code
npm run ci            # Run full pipeline

# Checks
npm run lint          # All linters
npm run prettier:check # Formatting
npm test              # All tests
npm run coverage      # Coverage

# Deployment
npm run compile       # Build contracts
npm run simulate      # Dry run
```

---

**CI/CD Pipeline Complete! 🚀**

Your project now has enterprise-grade continuous integration and deployment infrastructure with automated testing, code quality checks, and comprehensive monitoring.
