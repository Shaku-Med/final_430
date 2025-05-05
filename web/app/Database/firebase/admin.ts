import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import Private from './Private'
let bl: any = Private()

const firebaseAdminConfig = {
  credential: cert(bl),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
}

const apps = getApps()

if (!apps.length) {
  initializeApp(firebaseAdminConfig)
}

export const adminStorage = getStorage() 