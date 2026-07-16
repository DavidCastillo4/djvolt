import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/comps/adminDashboard/AdminDashboard';
import {
 DASHBOARD_COOKIE_NAME,
 getDashboardPassword,
 isDashboardSessionValid,
} from '@/lib/dashboardAuth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
 const cookieStore = await cookies();
 const sessionToken = cookieStore.get(DASHBOARD_COOKIE_NAME)?.value;
 let isAuthorized = false;

 try {
  const dashboardPassword = await getDashboardPassword();
  isAuthorized = isDashboardSessionValid(sessionToken, dashboardPassword);
 }
 catch (error) {
  console.error('Dashboard authorization failed:', error);
 }

 if (!isAuthorized) {
  redirect('/');
 }

 return <AdminDashboard />;
}
