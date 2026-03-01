import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDM3cUGVTZefpilBQ4z9a3MltTWSLXXYI8",
  authDomain: "mkm-distributor-hub.firebaseapp.com",
  databaseURL: "https://mkm-distributor-hub-default-rtdb.firebaseio.com",
  projectId: "mkm-distributor-hub",
  storageBucket: "mkm-distributor-hub.firebasestorage.app",
  messagingSenderId: "667643712343",
  appId: "1:667643712343:web:d63bef76d0bd6a3682a412",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
