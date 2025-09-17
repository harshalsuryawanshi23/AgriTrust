
import { IncomingMessage } from 'http';
import { getSession } from 'next-auth/react';
import { auth } from './firebase-admin'; // We will create this file next

export const getAuth = async (req?: IncomingMessage) => {
  const session = await getSession({ req }) as any;

  if (session?.idToken) {
    try {
      const decodedToken = await auth.verifyIdToken(session.idToken);
      return { user: { ...decodedToken, uid: decodedToken.uid } };
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return { user: null };
    }
  } 

  return { user: null };
};
