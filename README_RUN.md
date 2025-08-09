# HAWLADER — Fixed Build

## Run locally
```bash
npm install
npm run dev
```

Create a `.env` (same folder as package.json) with:
```
VITE_FIREBASE_API_KEY=AIzaSyCDglQ-tmm2iacAJBSx-SmWaURqpDReXYI
VITE_FIREBASE_AUTH_DOMAIN=hawlader-212c7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hawlader-212c7
VITE_FIREBASE_STORAGE_BUCKET=hawlader-212c7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=466405482250
VITE_FIREBASE_APP_ID=1:466405482250:web:23a75c581d0fcdfb6c64f3
VITE_FIREBASE_MEASUREMENT_ID=G-WF743RRZW7

```

## Notes
- FullCalendar deep imports fixed; CSS added.
- package.json bumped to FullCalendar ^6.1.14.
