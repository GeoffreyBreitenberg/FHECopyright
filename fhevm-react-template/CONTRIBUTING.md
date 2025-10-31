# Contributing to Universal FHEVM SDK

Thank you for your interest in contributing to the Universal FHEVM SDK! We welcome contributions from the community.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Git
- Basic understanding of:
  - Solidity smart contracts
  - Fully Homomorphic Encryption concepts
  - React (for frontend examples)
  - Hardhat development environment

### First Time Contributors

If you're new to the project:

1. **Read the documentation**
   - Main [README](./README.md)
   - [API documentation](./docs/API.md)
   - [Example guides](./examples/)

2. **Explore the codebase**
   - Review the SDK package structure
   - Study the example implementations
   - Run the test suites

3. **Look for good first issues**
   - Check GitHub issues labeled `good-first-issue`
   - Ask questions in issue comments
   - Join community discussions

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/fhevm-react-template.git
cd fhevm-react-template
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install example dependencies
cd examples/anonymous-copyright
npm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# You'll need:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY (for testing)
# - ETHERSCAN_API_KEY (for verification)
```

### 4. Verify Setup

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Check code quality
npm run lint
```

---

## How to Contribute

### Reporting Bugs

When filing a bug report, include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs **actual behavior**
4. **Environment details**:
   - Node.js version
   - npm version
   - Operating system
   - Network (if applicable)
5. **Code samples** or error messages
6. **Screenshots** if relevant

**Template**:
```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Execute '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- Node.js: v18.0.0
- npm: 9.0.0
- OS: Windows 11
- Network: Sepolia

**Additional Context**
Add any other context about the problem.
```

### Suggesting Features

For feature requests, include:

1. **Problem statement**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Alternatives considered**: What other approaches did you think about?
4. **Use cases**: Real-world scenarios where this is useful
5. **Breaking changes**: Will this affect existing code?

**Template**:
```markdown
**Feature Request**

**Problem**
Describe the problem this feature would solve.

**Proposed Solution**
Describe how you envision this feature working.

**Use Cases**
1. Use case 1...
2. Use case 2...

**Additional Context**
Any other relevant information.
```

### Contributing Code

1. **Check existing issues** - someone might already be working on it
2. **Create an issue** - discuss your changes before implementing
3. **Get approval** - wait for maintainer feedback
4. **Create a branch** - use descriptive names
5. **Write code** - follow coding standards
6. **Write tests** - ensure good coverage
7. **Update docs** - keep documentation in sync
8. **Submit PR** - follow PR template

---

## Pull Request Process

### 1. Create a Branch

Use descriptive branch names:

```bash
# Feature branches
git checkout -b feature/add-encryption-util

# Bug fix branches
git checkout -b fix/contract-verification-error

# Documentation branches
git checkout -b docs/update-api-reference
```

### 2. Make Your Changes

**Best Practices**:
- Keep changes focused and atomic
- Write clear commit messages
- Follow coding standards
- Add tests for new features
- Update documentation

**Commit Message Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(sdk): add batch encryption utility

- Implement batchEncrypt function
- Add support for multiple value types
- Include comprehensive tests

Closes #123
```

```bash
fix(contract): resolve reentrancy vulnerability

- Add ReentrancyGuard to sensitive functions
- Update tests to verify protection
- Document security considerations

Fixes #456
```

### 3. Run Quality Checks

Before submitting, ensure:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm test

# Check coverage
npm run coverage

# Security audit
npm run security

# Gas analysis
npm run gas:analysis
```

### 4. Submit Pull Request

**PR Title**: Use same format as commit messages
```
feat(sdk): add batch encryption utility
```

**PR Description**: Include:
- What changes were made
- Why they were made
- Related issues (use `Closes #123`)
- Testing performed
- Breaking changes (if any)

**PR Template**:
```markdown
## Description
Brief description of changes.

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed:
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
```

### 5. Code Review Process

**What to Expect**:
1. Automated checks will run (CI/CD)
2. Maintainers will review your code
3. You may receive feedback or change requests
4. Address feedback promptly
5. Once approved, PR will be merged

**Tips**:
- Respond to all comments
- Ask questions if unclear
- Be open to suggestions
- Keep PR updated with main branch
- Be patient - reviews take time

---

## Coding Standards

### Solidity

**Style Guide**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)

**Best Practices**:
```solidity
// ✅ Good
contract MyContract {
    // State variables
    uint256 private immutable MAX_VALUE;

    // Events
    event ValueUpdated(uint256 indexed oldValue, uint256 indexed newValue);

    // Modifiers
    modifier onlyPositive(uint256 value) {
        require(value > 0, "Value must be positive");
        _;
    }

    // Constructor
    constructor(uint256 _maxValue) {
        MAX_VALUE = _maxValue;
    }

    // External functions
    function updateValue(uint256 newValue) external onlyPositive(newValue) {
        emit ValueUpdated(oldValue, newValue);
    }

    // Public functions
    // Internal functions
    // Private functions
}
```

**Security**:
- Use `immutable` for constants set in constructor
- Include input validation
- Add descriptive error messages
- Document security assumptions
- Avoid unbounded loops
- Use SafeMath patterns (or Solidity 0.8+)

### JavaScript/TypeScript

**Style**: Use Prettier + ESLint

**Best Practices**:
```javascript
// ✅ Good
async function deployContract(contractName, args = []) {
  try {
    const ContractFactory = await ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...args);
    await contract.waitForDeployment();
    return contract;
  } catch (error) {
    console.error(`Failed to deploy ${contractName}:`, error);
    throw error;
  }
}
```

**Conventions**:
- Use `async/await` over promises
- Add JSDoc comments for public functions
- Handle errors gracefully
- Use descriptive variable names
- Keep functions small and focused

### Testing

**Test Structure**:
```javascript
describe("ContractName", function () {
  let contract, owner, alice, bob;

  beforeEach(async function () {
    // Setup
    [owner, alice, bob] = await ethers.getSigners();
    contract = await deployContract();
  });

  describe("Function Name", function () {
    it("should do expected behavior", async function () {
      // Arrange
      const input = 123;

      // Act
      const tx = await contract.functionName(input);
      await tx.wait();

      // Assert
      expect(await contract.getValue()).to.equal(input);
    });

    it("should revert on invalid input", async function () {
      await expect(
        contract.functionName(0)
      ).to.be.revertedWith("Invalid input");
    });
  });
});
```

**Coverage Targets**:
- Statements: ≥ 85%
- Branches: ≥ 75%
- Functions: ≥ 90%
- Lines: ≥ 85%

---

## Testing Guidelines

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- test/MyContract.test.js

# With gas reporting
npm run test:gas

# With coverage
npm run coverage
```

### Writing Tests

**Categories to Cover**:
1. **Deployment** - Contract initialization
2. **Happy Path** - Expected behavior
3. **Edge Cases** - Boundary conditions
4. **Error Cases** - Failure scenarios
5. **Access Control** - Permission checks
6. **Events** - Event emission
7. **Gas Optimization** - Gas usage
8. **Integration** - Cross-function behavior

**Example**:
```javascript
describe("Author Registration", function () {
  it("should register new author", async function () {
    const authorId = 12345;
    const tx = await contract.registerAuthor(authorId);
    await tx.wait();

    expect(await contract.isRegisteredAuthor(alice.address)).to.be.true;
  });

  it("should emit AuthorRegistered event", async function () {
    const authorId = 12345;

    await expect(contract.registerAuthor(authorId))
      .to.emit(contract, "AuthorRegistered")
      .withArgs(alice.address, anyValue);
  });

  it("should revert if already registered", async function () {
    await contract.registerAuthor(12345);

    await expect(contract.registerAuthor(67890))
      .to.be.revertedWith("Already registered");
  });
});
```

---

## Documentation

### Code Comments

**Solidity**:
```solidity
/// @notice Registers a new author with encrypted ID
/// @dev Stores euint64 encrypted author ID
/// @param _authorId The author's unique identifier (encrypted)
function registerAuthor(uint64 _authorId) external {
    // Implementation
}
```

**JavaScript**:
```javascript
/**
 * Deploys a contract and waits for confirmation
 * @param {string} contractName - Name of contract to deploy
 * @param {Array} args - Constructor arguments
 * @returns {Promise<Contract>} Deployed contract instance
 * @throws {Error} If deployment fails
 */
async function deployContract(contractName, args = []) {
  // Implementation
}
```

### Documentation Files

When adding features, update:
- README.md - If adding major features
- API.md - If changing public APIs
- EXAMPLES.md - If adding examples
- TESTING.md - If adding test patterns

### Writing Good Documentation

**Be Clear**:
- Use simple language
- Provide examples
- Explain why, not just what
- Include error cases

**Be Complete**:
- Document all parameters
- Show return values
- List possible errors
- Include usage examples

**Be Consistent**:
- Follow existing style
- Use same terminology
- Match code structure

---

## Community

### Getting Help

- **GitHub Issues**: Ask questions
- **Discussions**: General topics
- **Pull Requests**: Code-specific discussions

### Stay Updated

- Watch the repository for updates
- Read release notes
- Follow project roadmap

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Create a new issue

---

**Thank you for contributing to the Universal FHEVM SDK!** 🎉

Your contributions help make FHE technology more accessible to developers worldwide.
