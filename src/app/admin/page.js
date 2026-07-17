import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminLogin } from '@/comps/adminlogin/adminlogin';
import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';

export const metadata = {
 title: 'Admin Login | DJ Volts',
};

export default async function AdminLoginPage() {
 const cookieStore = await cookies();
 const currentSession = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

 if (currentSession === getAdminSessionValue()) {
  redirect('/admin/dashboard');
 }

 return <AdminLogin />;
}
