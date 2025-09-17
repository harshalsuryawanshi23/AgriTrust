
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns"; // We will create this file next
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Mock data for recent activities - replace with actual data fetching
const getRecentActivities = async (userId: string) => {
  const logsRef = collection(db, `farmer-logs/${userId}/logs`);
  const q = query(logsRef, orderBy("date", "desc"), limit(5));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getRecentActivities(user.uid).then(setRecentActivities);
    }
  }, [user]);

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Farms" value={12} />
        <MetricCard title="Total Crops" value={8} />
        <MetricCard title="Pending Tasks" value={5} />
        <MetricCard title="Notifications" value={3} />
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentActivities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
