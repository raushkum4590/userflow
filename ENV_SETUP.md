# Environment Variables Setup

## For Vercel Deployment

Add the following environment variable in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://3570kumarraushan:6F5Rr8EzvAXUIWS9@cluster0.wethvef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### How to Add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `MONGODB_URI`
   - **Value**: (paste the MongoDB URI above)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project

## For Local Development

If you want to run the full stack locally, create a `.env.local` file:

```bash
# .env.local
MONGODB_URI=mongodb+srv://3570kumarraushan:6F5Rr8EzvAXUIWS9@cluster0.wethvef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Or keep using the separate backend server with `npm run dev:full`
