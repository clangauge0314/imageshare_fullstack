import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCI6DEfj_7mgeDmfnNE2chE9-xO0HkpJDk",
  authDomain: "imagifly-7b2a1.firebaseapp.com",
  projectId: "imagifly-7b2a1",
  storageBucket: "imagifly-7b2a1.appspot.com",
  messagingSenderId: "1086025148197",
  appId: "1:1086025148197:web:03ee8b94872b3c12d61ccc",
  measurementId: "G-368HL9PY6V",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
