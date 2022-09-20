import * as firebaseAdmin from 'firebase-admin'

export const verifyIdToken = async (token) => {
   if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
         credential: firebaseAdmin.credential.cert({
            type: process.env.FIREADMIN_TYPE,
            project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREADMIN_PRIVATE_KEY_ID,
            private_key: process.env.FIREADMIN_PRIVATE_KEY.replace(/\\n/gm, "\n"),
            client_email: process.env.FIREADMIN_CLIENT_EMAIL,
            client_id: process.env.FIREADMIN_CLIENT_ID,
            auth_uri: process.env.FIREADMIN_AUTH_URI,
            token_uri: process.env.FIREADMIN_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREADMIN_AUTH_PROVIDER_URL,
            client_x509_cert_url: process.env.FIREADMIN_CLIENT_CERT_URL
         })
      })
   }
   return firebaseAdmin.auth().verifyIdToken(token).catch(err => {throw err})
}