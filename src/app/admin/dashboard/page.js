import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminDashboard } from '@/comps/admindashboard/admindashboard';
import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';

export const metadata = {
 title: 'Admin Dashboard | DJ Volts',
};

export default async function AdminDashboardPage() {
 const cookieStore = await cookies();
 const currentSession = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

 if (currentSession !== getAdminSessionValue()) {
  redirect('/admin');
 }

 return <AdminDashboard />;
}
