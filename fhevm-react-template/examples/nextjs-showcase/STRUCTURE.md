# Next.js Showcase Structure

This document outlines the complete structure of the Next.js showcase example with full FHEVM SDK integration.

## Directory Structure

### `/app` - Application Pages & API Routes

#### Pages
- `layout.tsx` - Root layout with Header/Footer
- `page.tsx` - Home page with feature overview
- `globals.css` - Global styles
- `encryption/page.tsx` - Interactive encryption demo
- `examples/page.tsx` - Code examples and use cases
- `about/page.tsx` - FHEVM information

#### API Routes
- `api/fhe/route.ts` - General FHE operations endpoint
- `api/fhe/encrypt/route.ts` - Encryption endpoint
- `api/fhe/decrypt/route.ts` - Decryption endpoint (client-side guidance)
- `api/fhe/compute/route.ts` - Homomorphic computation info
- `api/keys/route.ts` - Key management endpoint

### `/components` - React Components

#### UI Components (`/components/ui`)
- `Button.tsx` - Reusable button with variants and loading states
- `Input.tsx` - Form input with labels and validation
- `Card.tsx` - Container card component

#### FHE Components (`/components/fhe`)
- `FHEProvider.tsx` - Context provider for FHEVM client
- `EncryptionDemo.tsx` - Interactive encryption demonstration
- `ComputationDemo.tsx` - Homomorphic computation examples
- `KeyManager.tsx` - Key management interface

#### Example Components (`/components/examples`)
- `BankingExample.tsx` - Private banking use case
- `MedicalExample.tsx` - Medical records use case

#### Layout Components
- `Header.tsx` - Navigation header
- `Footer.tsx` - Footer with links

### `/lib` - Utilities & Libraries

#### FHE Utilities (`/lib/fhe`)
- `client.ts` - Client initialization helpers
- `server.ts` - Server-side FHE operations
- `keys.ts` - Key management utilities
- `types.ts` - FHE-specific type definitions

#### General Utilities (`/lib/utils`)
- `security.ts` - Security helpers (validation, rate limiting)
- `validation.ts` - Input validation functions

#### Configuration
- `config.ts` - Network and contract configuration
- `utils.ts` - General helper functions

### `/hooks` - Custom React Hooks

- `useFHE.ts` - Re-exports SDK hooks
- `useEncryption.ts` - Encryption hook with state management
- `useComputation.ts` - Computation operations hook

### `/types` - TypeScript Type Definitions

- `fhe.ts` - FHE operation types
- `api.ts` - API request/response types

### Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `.env.example` - Environment variables template
- `.eslintrc.json` - ESLint configuration
- `.prettierrc.json` - Prettier configuration

## Key Features Implemented

### 1. Complete SDK Integration
✅ FHEVM client initialization
✅ Encryption operations (uint32, uint64)
✅ Decryption workflow
✅ Type-safe operations
✅ Error handling

### 2. API Routes
✅ Server-side encryption
✅ Computation information
✅ Key management endpoints
✅ RESTful design
✅ Error responses

### 3. Reusable Components
✅ UI component library
✅ FHE-specific components
✅ Example use cases
✅ Loading states
✅ Error boundaries

### 4. Custom Hooks
✅ Client management
✅ Encryption operations
✅ Computation info
✅ State management
✅ Error handling

### 5. Type Safety
✅ Complete TypeScript coverage
✅ FHE type definitions
✅ API type definitions
✅ Component prop types
✅ Hook return types

## File Count Summary

```
Total files created: 40+

API Routes: 5 files
- Main FHE endpoint
- Encrypt endpoint
- Decrypt endpoint
- Compute endpoint
- Keys endpoint

Components: 13 files
- 3 UI components
- 4 FHE components
- 2 Example components
- 2 Layout components
- 2 existing (Header, Footer)

Libraries: 6 files
- 4 FHE utilities
- 2 General utilities

Hooks: 3 files
Types: 2 files
Config: 2 files
```

## Integration Points

### SDK Usage
All components use the `@fhevm/sdk` package:
```typescript
import { createFhevmClient, encryptUint32 } from '@fhevm/sdk';
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';
```

### API Integration
Server-side operations use Next.js API routes:
```typescript
// Client calls API
const response = await fetch('/api/fhe/encrypt', {
  method: 'POST',
  body: JSON.stringify({ value, type })
});
```

### Component Communication
FHEProvider shares client state:
```typescript
<FHEProvider config={config}>
  <App />
</FHEProvider>
```

## Usage Examples

### Basic Encryption
```typescript
const { client, isReady } = useFhevmClient(config);
const { encrypt, isEncrypting } = useEncrypt(client);

const encrypted = await encrypt(12345, 'uint32');
```

### API Route
```typescript
// app/api/fhe/encrypt/route.ts
export async function POST(request: NextRequest) {
  const { value, type } = await request.json();
  const client = await createFhevmClient(config);
  const encrypted = await encryptUint32(client, value);
  return NextResponse.json({ encrypted });
}
```

### Component
```typescript
// components/fhe/EncryptionDemo.tsx
export default function EncryptionDemo() {
  const { client } = useFHE();
  const { encrypt } = useEncrypt(client);
  // ... component logic
}
```

## Next Steps

This structure provides:
1. Complete SDK integration examples
2. Reusable component library
3. API route templates
4. Custom hook patterns
5. Type-safe development

Developers can:
- Copy components for their projects
- Use API routes as templates
- Reference integration patterns
- Extend with new features
- Deploy to production

## Documentation

See also:
- [README.md](./README.md) - Main documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [../../templates/nextjs/README.md](../../templates/nextjs/README.md) - Template guide
- [../../README.md](../../README.md) - Project overview
