# Deployment Guide - FHEVM Next.js Showcase

Complete guide for deploying the Next.js showcase application to production.

---

## 🚀 Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications with automatic optimizations.

#### Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Deploy with GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure build settings (auto-detected for Next.js)
6. Add environment variables
7. Deploy

#### Environment Variables on Vercel

Add these via Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a
```

---

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

#### Build Settings for Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

### Option 3: AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Choose "Host web app"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Base directory: `examples/nextjs-showcase`
   - Node version: 18+
5. Add environment variables
6. Deploy

---

### Option 4: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_NETWORK=sepolia
railway variables set NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Deploy
railway up
```

---

### Option 5: Self-Hosted (VPS/Docker)

#### Using PM2

```bash
# Build application
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "fhevm-nextjs" -- start

# Save PM2 config
pm2 save

# Auto-restart on reboot
pm2 startup
```

#### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
# Build image
docker build -t fhevm-nextjs .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_NETWORK=sepolia \
  -e NEXT_PUBLIC_CONTRACT_ADDRESS=0x... \
  fhevm-nextjs
```

---

## 🔧 Pre-Deployment Checklist

### 1. Build Test

```bash
# Test production build locally
npm run build
npm start

# Verify at http://localhost:3000
```

### 2. Environment Variables

Ensure all required variables are set:

```bash
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a
```

### 3. Code Quality

```bash
# Run linter
npm run lint

# Fix lint issues
npm run lint -- --fix

# Type check
npm run type-check

# Format code
npm run format
```

### 4. Dependencies

```bash
# Update dependencies
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 5. Performance

- Check bundle size: `npm run build` (look for size warnings)
- Test on slow connection
- Verify images are optimized
- Check Core Web Vitals

---

## 🌐 Domain Configuration

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `fhevm.example.com`)
3. Configure DNS:
   - Type: `CNAME`
   - Name: `fhevm` (or `@` for root)
   - Value: `cname.vercel-dns.com`
4. Wait for DNS propagation (up to 48 hours)

### SSL Certificate

All major platforms (Vercel, Netlify, etc.) provide automatic SSL:
- Free Let's Encrypt certificates
- Automatic renewal
- HTTPS enforced by default

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics

```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
```

Add to `app/layout.tsx`:

```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
  strategy="afterInteractive"
/>
```

---

## 🔒 Security

### Content Security Policy

Add to `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

### Environment Variables

- Never commit `.env.local` to git
- Use platform-specific environment variable management
- Rotate secrets regularly
- Use different values for staging/production

---

## 🚦 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_NETWORK: ${{ secrets.NEXT_PUBLIC_NETWORK }}
          NEXT_PUBLIC_CONTRACT_ADDRESS: ${{ secrets.NEXT_PUBLIC_CONTRACT_ADDRESS }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🔄 Update & Rollback

### Deploy New Version

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Build
npm run build

# Deploy
vercel --prod
```

### Rollback on Vercel

1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

---

## 📈 Performance Optimization

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
```

### Caching

Configure `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## 🐛 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Module Not Found

```bash
# Verify dependencies
npm list @fhevm/sdk
npm list ethers

# Reinstall if needed
npm install --force
```

### Environment Variables Not Loading

- Check variable names start with `NEXT_PUBLIC_`
- Restart dev server after changes
- Verify variables are set in deployment platform

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GeoffreyBreitenberg/fhevm-react-template/issues)
- **Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

**Deployment Checklist** ✅
- [ ] Code builds successfully
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics setup
- [ ] Error tracking enabled
- [ ] Performance verified
- [ ] Security headers set
- [ ] Backups configured
