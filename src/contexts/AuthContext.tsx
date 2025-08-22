'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'admin' | 'farmer' | 'viewer';

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  farmer: 2,
  viewer: 1,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role || 'viewer',
          createdAt: data.createdAt?.toDate(),
          lastLogin: data.lastLogin?.toDate(),
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createUserProfile = async (user: User, role: UserRole = 'farmer') => {
    const userProfile = {
      email: user.email!,
      displayName: user.displayName || user.email!.split('@')[0],
      role,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Update last login
      await setDoc(doc(db, 'users', result.user.uid), {
        lastLogin: new Date(),
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole = 'farmer') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user, role);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await createUserProfile(result.user, 'farmer');
      } else {
        // Update last login
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLogin: new Date(),
        }, { merge: true });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userProfile) return false;
    return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole];
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
