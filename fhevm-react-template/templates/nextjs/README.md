# Next.js FHEVM Template

This template provides a complete Next.js 14 application with FHEVM SDK integration.

## Features

- **Next.js 14 App Router** - Modern App Router with Server and Client Components
- **FHEVM SDK Integration** - Full integration with the Universal FHEVM SDK
- **TypeScript** - Complete type safety
- **API Routes** - Server-side FHE operations
- **React Components** - Reusable FHE components
- **Custom Hooks** - Convenient hooks for FHE operations
- **Example Use Cases** - Banking and medical record examples

## Quick Start

### 1. Copy Template

This template is based on the fully functional `nextjs-showcase` example. To use it:

```bash
# Copy the nextjs-showcase example as your starting point
cp -r examples/nextjs-showcase my-fhevm-project
cd my-fhevm-project
```

Alternatively, you can explore the complete working example:

```bash
# Navigate to the showcase example
cd examples/nextjs-showcase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
nextjs/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── encryption/             # Encryption demo page
│   ├── examples/               # Examples page
│   ├── about/                  # About page
│   └── api/                    # API routes
│       ├── fhe/                # FHE operations
│       │   ├── route.ts
│       │   ├── encrypt/route.ts
│       │   ├── decrypt/route.ts
│       │   └── compute/route.ts
│       └── keys/route.ts       # Key management
│
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── fhe/                    # FHE components
│   │   ├── FHEProvider.tsx
│   │   ├── EncryptionDemo.tsx
│   │   ├── ComputationDemo.tsx
│   │   └── KeyManager.tsx
│   ├── examples/               # Example components
│   │   ├── BankingExample.tsx
│   │   └── MedicalExample.tsx
│   ├── Header.tsx
│   └── Footer.tsx
│
├── lib/
│   ├── fhe/                    # FHE utilities
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── keys.ts
│   │   └── types.ts
│   └── utils/                  # General utilities
│       ├── security.ts
│       └── validation.ts
│
├── hooks/                      # Custom React hooks
│   ├── useFHE.ts
│   ├── useEncryption.ts
│   └── useComputation.ts
│
├── types/                      # TypeScript types
│   ├── fhe.ts
│   └── api.ts
│
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

## Usage Examples

### Basic Encryption

```typescript
import { useFhevmClient, useEncrypt } from '@fhevm/sdk/hooks';

function MyComponent() {
  const { client, isReady } = useFhevmClient({
    network: 'sepolia',
    contractAddress: '0x...'
  });

  const { encrypt, isEncrypting } = useEncrypt(client);

  const handleEncrypt = async () => {
    const encrypted = await encrypt(12345, 'uint32');
    console.log('Encrypted:', encrypted);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isReady || isEncrypting}>
      Encrypt Value
    </button>
  );
}
```

### Using FHE Provider

```typescript
import FHEProvider from '@/components/fhe/FHEProvider';

export default function RootLayout({ children }) {
  return (
    <FHEProvider config={{ network: 'sepolia', contractAddress: '0x...' }}>
      {children}
    </FHEProvider>
  );
}
```

### Server-Side Encryption

```typescript
// app/api/my-endpoint/route.ts
import { serverEncrypt } from '@/lib/fhe/server';

export async function POST(request: Request) {
  const { value } = await request.json();

  const encrypted = await serverEncrypt(
    value,
    'uint32',
    { network: 'sepolia', contractAddress: '0x...' }
  );

  return Response.json({ encrypted });
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run type-check` - Check TypeScript types

## Customization

### Adding New Pages

Create a new directory in `app/`:

```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Creating Custom Components

Add components to `components/`:

```typescript
// components/MyComponent.tsx
export default function MyComponent() {
  return <div>My Component</div>;
}
```

### Adding API Routes

Create routes in `app/api/`:

```typescript
// app/api/my-route/route.ts
export async function GET() {
  return Response.json({ message: 'Hello' });
}
```

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t my-fhevm-app .
docker run -p 3000:3000 my-fhevm-app
```

## Learn More

- [FHEVM SDK Documentation](../../docs/API.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [FHEVM Protocol](https://docs.zama.ai/fhevm)
- [Full Next.js Showcase Example](../../examples/nextjs-showcase/README.md)

## Support

For issues or questions:
- Check the [main README](../../README.md)
- Visit the [examples](../../examples)
- Review the [nextjs-showcase](../../examples/nextjs-showcase) for a complete working example
- Open an issue on GitHub
