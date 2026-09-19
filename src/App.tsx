/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import AppRoutes from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { auth, db } from './services/firebase/config';
import { useAuthStore } from './store/useAuthStore';
import { User, UserRole } from './types';

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Default customer role if doc doesn't exist yet
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Customer',
              role: (firebaseUser.email === 'mahmudtelecom1122@gmail.com') ? UserRole.ADMIN : UserRole.CUSTOMER,
              createdAt: Date.now(),
            };
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <HashRouter>
            <AppRoutes />
            <Toaster position="top-center" reverseOrder={false} />
          </HashRouter>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
