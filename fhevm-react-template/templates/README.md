# FHEVM Templates

This directory contains starter templates for building confidential dApps with the FHEVM SDK.

## Available Templates

### Next.js Template

**Location:** `nextjs/`

A complete Next.js 14 application with App Router, showcasing full FHEVM SDK integration.

**Features:**
- Next.js 14 App Router
- TypeScript support
- API routes for server-side FHE operations
- Reusable React components
- Custom hooks
- Example use cases (Banking, Medical Records)
- Complete type definitions

**Quick Start:**
```bash
# Navigate to the template
cd templates/nextjs

# See the README for detailed instructions
cat README.md
```

## Using Templates

### Option 1: Reference the Example

The `nextjs-showcase` in `examples/` is a complete working example that follows this template structure.

```bash
cd examples/nextjs-showcase
npm install
npm run dev
```

### Option 2: Copy Template Structure

Copy the template to start a new project:

```bash
# Create your project directory
mkdir my-fhevm-project

# Copy example as template
cp -r examples/nextjs-showcase/* my-fhevm-project/

# Install and run
cd my-fhevm-project
npm install
npm run dev
```

## Template Structure

All templates follow this general structure:

```
template/
├── app/ or src/          # Application code
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   ├── fhe/             # FHE-specific components
│   └── examples/        # Example use cases
├── lib/                 # Utilities and helpers
│   ├── fhe/            # FHE operations
│   └── utils/          # General utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── README.md           # Template documentation
```

## Common Features

All templates include:

1. **FHEVM SDK Integration**
   - Client initialization
   - Encryption/decryption utilities
   - Type-safe operations

2. **Component Library**
   - FHE Provider
   - Encryption demo
   - Computation examples
   - Key management UI

3. **API Routes** (for frameworks that support them)
   - Encryption endpoints
   - Decryption endpoints
   - Computation info
   - Key management

4. **Type Safety**
   - Complete TypeScript definitions
   - Type-safe FHE operations
   - API type definitions

5. **Examples**
   - Banking use case (private balances)
   - Medical records (private health data)
   - Ready-to-customize components

## Creating Your Own Template

To create a new template:

1. Create a new directory in `templates/`
2. Set up your framework
3. Install FHEVM SDK: `npm install @fhevm/sdk`
4. Add core components:
   - FHE client initialization
   - Encryption/decryption components
   - Example use cases
5. Add documentation (README.md)
6. Test thoroughly

## Planned Templates

Future templates (contributions welcome):

- **React (Vite)** - Pure React with Vite
- **Vue 3** - Vue 3 with Composition API
- **Node.js** - Backend-only integration
- **React Native** - Mobile application template

## Contributing

To contribute a new template:

1. Fork the repository
2. Create your template in a new directory
3. Follow the common structure guidelines
4. Include comprehensive documentation
5. Add working examples
6. Submit a pull request

## Support

- Main documentation: [/docs](../docs/)
- API reference: [/docs/API.md](../docs/API.md)
- Examples: [/examples](../examples/)
- Issues: [GitHub Issues](https://github.com/GeoffreyBreitenberg/fhevm-react-template/issues)
