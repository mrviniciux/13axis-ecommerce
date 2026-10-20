import { redirect } from 'next/navigation';
import { auth, googleLoginEnabled } from '@/auth';
import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const [session, userCount] = await Promise.all([auth(), prisma.user.count()]);
  if (
    session?.user.role === 'ADMIN' ||
    session?.user.role === 'INVENTORY_MANAGER'
  ) {
    redirect('/restrict/admin');
  }

  return (
    <main className="grid min-h-screen bg-[#f5f7f4] lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-[#183c35] px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
          <div className="absolute -right-20 top-24 size-[480px] rounded-full border border-white/50" />
          <div className="absolute -right-2 top-42 size-[330px] rounded-full border border-white/40" />
          <div className="absolute bottom-[-180px] left-[-120px] size-[520px] rounded-full border border-white/35" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_48%,rgba(255,255,255,0.18)_48.2%,transparent_48.5%)]" />
        </div>
        <div className="relative flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="flex size-9 items-center justify-center border border-white/30 text-xs">
            13
          </span>
          AXIS COMMERCE
        </div>
        <div className="relative max-w-xl pb-12">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#b6d0c3]">
            Centro de operações
          </p>
          <h2 className="text-5xl font-medium leading-[1.12] tracking-tight xl:text-6xl">
            Cada detalhe do seu catálogo, sob controle.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Produtos, disponibilidade e movimentações em um único lugar,
            preparado para acompanhar sua operação.
          </p>
        </div>
        <p className="relative text-xs text-white/45">
          13axis Commerce · Administração
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <LoginForm
          googleEnabled={googleLoginEnabled}
          registrationEnabled={userCount === 0}
        />
      </section>
    </main>
  );
}
