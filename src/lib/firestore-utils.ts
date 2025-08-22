import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// Generic CRUD operations
export class FirestoreService<T extends { id?: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a new document
  async create(data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  // Batch create multiple documents
  async createBatch(items: Omit<T, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();

    items.forEach((item) => {
      const docRef = doc(collection(db, this.collectionName));
      batch.set(docRef, {
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    await batch.commit();
  }

  // Read a single document
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // Read all documents
  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  // Read documents with query
  async query(queryConstraints: any[] = []): Promise<T[]> {
    const q = query(collection(db, this.collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Batch delete multiple documents
  async deleteBatch(ids: string[]): Promise<void> {
    const batch = writeBatch(db);

    ids.forEach((id) => {
      const docRef = doc(db, this.collectionName, id);
      batch.delete(docRef);
    });

    await batch.commit();
  }

  // Real-time subscription
  subscribe(
    callback: (data: T[]) => void,
    queryConstraints: any[] = []
  ): () => void {
    const q = query(collection(db, this.collectionName), ...queryConstraints);
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    });
  }

  // Paginated query
  async getPaginated(
    pageSize: number,
    lastDoc?: any,
    queryConstraints: any[] = []
  ): Promise<{ data: T[]; hasMore: boolean; lastDoc: any }> {
    let q = query(
      collection(db, this.collectionName),
      ...queryConstraints,
      limit(pageSize + 1)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;

    if (hasMore) {
      docs.pop(); // Remove the extra doc used for pagination
    }

    const data = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    return {
      data,
      hasMore,
      lastDoc: docs[docs.length - 1]
    };
  }
}

// Date utilities for Firestore
export const firestoreTimestamp = {
  now: () => Timestamp.now(),
  fromDate: (date: Date) => Timestamp.fromDate(date),
  toDate: (timestamp: Timestamp) => timestamp.toDate(),
};

// Query builders
export const queryBuilders = {
  where: (field: string, operator: any, value: any) => where(field, operator, value),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limit: (limitCount: number) => limit(limitCount),
};
