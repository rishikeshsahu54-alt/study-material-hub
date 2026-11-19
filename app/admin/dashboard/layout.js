import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import AdminDashboardShell from '@/components/AdminDashboardShell';

export const metadata = {
  title: 'Admin Dashboard — Study Materials Hub',
  description: 'Manage study materials, uploaded PDF documents, and academic subjects.',
};

export default function AdminDashboardLayout({ children }) {
  // Server-side authentication verification
  const session = getServerSession();
  if (!session) {
    redirect('/admin/login');
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
