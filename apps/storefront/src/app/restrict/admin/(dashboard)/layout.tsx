import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminFrame from '@/components/AdminFrame';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'INVENTORY_MANAGER')
  ) {
    redirect('/restrict/admin/login');
  }

  return (
    <AdminFrame userName={session.user.name ?? session.user.email ?? 'Admin'}>
      {children}
    </AdminFrame>
  );
}
