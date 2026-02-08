# 🚀 ডিপ্লয়মেন্ট গাইড

## স্টেপ বাই স্টেপ ইন্সট্রাকশন:

### 📁 **STEP 1: Files Replace করো**

1. তোমার existing project folder খোলো
2. এই ZIP থেকে সব files extract করো
3. তোমার project এ replace করো:

```
তোমার-প্রজেক্ট/
├── src/
│   ├── components/ ← এই folder টা সম্পূর্ণ replace করো
│   ├── App.tsx ← Replace করো
│   ├── types.ts ← Replace করো
│   ├── constants.ts ← Replace করো
│   ├── firebase.ts ← এটা আগের মতই থাকবে (শুধু check করো)
│   ├── index.tsx ← Same থাকবে
│   └── ... (বাকি files same)
```

---

### 🔥 **STEP 2: Firebase Configuration Check**

`firebase.ts` file এ তোমার Firebase config আছে কিনা check করো:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**যদি না থাকে:**
1. Firebase Console এ যাও
2. তোমার project select করো
3. Project Settings → General → Your apps
4. Web app থেকে config copy করো
5. `firebase.ts` এ paste করো

---

### 📦 **STEP 3: Dependencies Install**

Terminal খোলো এবং run করো:

```bash
# Project folder এ যাও
cd your-project-folder

# Dependencies install করো
npm install

# অথবা যদি yarn use করো
yarn install
```

---

### 🧪 **STEP 4: Local Testing**

Deploy করার আগে local এ test করো:

```bash
# Development server চালু করো
npm run dev

# Browser এ খুলবে: http://localhost:5173
```

**Test করো:**
- ✅ App load হচ্ছে?
- ✅ Logo তে 5-7 tap করলে Admin panel খুলছে?
- ✅ Admin login কাজ করছে?
- ✅ Settings save হচ্ছে?
- ✅ Movie/Series add করতে পারছে?

---

### 🏗️ **STEP 5: Build for Production**

সব ঠিক থাকলে production build করো:

```bash
npm run build
```

এটা একটা `dist` folder তৈরি করবে যার মধ্যে production-ready files থাকবে।

---

### 🌐 **STEP 6: Deploy**

#### **Option A: Vercel (সবচেয়ে সহজ)**

1. [Vercel.com](https://vercel.com) এ যাও
2. GitHub দিয়ে login করো
3. "New Project" click করো
4. তোমার GitHub repo select করো
5. Deploy button click করো

**Settings:**
- Framework Preset: `Vite`
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`

#### **Option B: Netlify**

1. [Netlify.com](https://netlify.com) এ যাও
2. "Add new site" → "Import an existing project"
3. GitHub repo select করো
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy click করো

#### **Option C: Manual Upload (যদি GitHub use না করো)**

**Vercel:**
```bash
# Vercel CLI install করো
npm i -g vercel

# Deploy করো
vercel --prod
```

**Netlify:**
```bash
# Netlify CLI install করো
npm i -g netlify-cli

# Deploy করো
netlify deploy --prod --dir=dist
```

---

### ⚙️ **STEP 7: Post-Deployment Setup**

Deploy হওয়ার পর:

#### 1. **Admin Account তৈরি করো:**
   - Firebase Console → Authentication → Add user
   - Email/Password দিয়ে user তৈরি করো

#### 2. **Bot Username Set করো:**
   - App খোলো
   - Logo তে 5-7 tap করো
   - Login করো
   - Settings tab এ যাও
   - Bot Username দাও (without @)
   - Channel Link দাও
   - Save Settings

#### 3. **Content Add করো:**
   - Movies tab → Movie add করো
   - Series tab → Series + Episodes add করো
   - Top 10/Stories enable করো (optional)

---

### 🔧 **Troubleshooting:**

#### ❌ "Firebase not configured"
- Solution: `firebase.ts` এ config ঠিক আছে কিনা check করো

#### ❌ "Build failed"
- Solution: `npm install` আবার run করো
- Node version check করো (should be 16+)

#### ❌ "Admin panel not opening"
- Solution: Logo তে একটু ধীরে ধীরে 5-7 tap করো

#### ❌ "Settings not saving"
- Solution: Firebase Firestore enable করো Console থেকে
- Rules check করো

#### ❌ "Telegram links not working"
- Solution: Settings এ Bot Username ঠিক দিয়েছ কিনা check করো

---

### 📱 **Telegram Mini App Integration:**

#### 1. **BotFather দিয়ে Bot তৈরি করো:**
```
/newbot
Bot name: Your Bot Name
Username: your_bot (এটা Settings এ use করবে)
```

#### 2. **Mini App Setup:**
```
/newapp
Select your bot
App name: StreamBox
Description: Watch movies and series
Photo: Upload thumbnail
Web App URL: https://your-vercel-app.vercel.app
```

#### 3. **Testing:**
- Bot খোলো Telegram এ
- Menu button এ click করো
- Mini App launch হবে

---

### ✅ **Final Checklist:**

Deploy করার আগে check করো:

- [ ] Firebase config ঠিক আছে
- [ ] Local testing সব ঠিক
- [ ] Build successful
- [ ] Admin account তৈরি
- [ ] Bot username correct
- [ ] Telegram Mini App linked

---

### 🎉 **Success!**

সব ঠিক থাকলে তোমার app এখন live!

**Next Steps:**
1. Content add করতে শুরু করো
2. Users দের invite করো
3. Enjoy! 🎬

---

## 📞 Help লাগলে:

কোনো সমস্যা হলে console error message দেখাও। আমি help করব!

**Happy Streaming! 🍿**
