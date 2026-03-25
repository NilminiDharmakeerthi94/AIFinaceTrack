import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import { firebaseConfig, functionsRegion } from "@/config/firebase";

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  }
  return app ?? getApps()[0]!;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseFunctions(): Functions {
  return getFunctions(getFirebaseApp(), functionsRegion);
}
