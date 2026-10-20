'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function LoginForm({
  googleEnabled,
  registrationEnabled,
}: {
  googleEnabled: boolean;
  registrationEnabled: boolean;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const tabs: ('login' | 'register')[] = registrationEnabled
    ? ['login', 'register']
    : ['login'];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    if (mode === 'register') {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(formData.get('name') ?? ''),
          email,
          password,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Não foi possível criar a conta.');
        setBusy(false);
        return;
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/restrict/admin',
    });
    if (result?.error) {
      setError('Credenciais inválidas ou conta sem acesso administrativo.');
      setBusy(false);
      return;
    }
    window.location.assign('/restrict/admin');
  }

  async function googleSignIn() {
    setBusy(true);
    await signIn('google', { callbackUrl: '/restrict/admin' });
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-9 flex size-12 items-center justify-center bg-[#183c35] text-white">
        <KeyRound aria-hidden="true" size={21} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a0442d]">
        13axis · operações
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1b2522]">
        {mode === 'login' ? 'Acesse seu painel' : 'Crie sua conta admin'}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#67716e]">
        {mode === 'login'
          ? 'Entre para acompanhar seu catálogo e estoque.'
          : 'A primeira conta cadastrada terá acesso de administradora.'}
      </p>

      <div
        className={`mt-8 grid border-b border-[#dce1dd] ${registrationEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMode(tab);
              setError('');
            }}
            className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
              mode === tab
                ? 'border-[#183c35] text-[#183c35]'
                : 'border-transparent text-[#7c8582] hover:text-[#1b2522]'
            }`}
          >
            {tab === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <label className="block text-sm font-medium text-[#303a37]">
            Nome completo
            <input
              required
              minLength={2}
              maxLength={120}
              name="name"
              autoComplete="name"
              className="mt-2 h-11 w-full border border-[#d8dfda] bg-white px-3 text-sm outline-none focus:border-[#366b5d] focus:ring-2 focus:ring-[#366b5d]/15"
              placeholder="Seu nome"
            />
          </label>
        )}
        <label className="block text-sm font-medium text-[#303a37]">
          E-mail
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="mt-2 h-11 w-full border border-[#d8dfda] bg-white px-3 text-sm outline-none focus:border-[#366b5d] focus:ring-2 focus:ring-[#366b5d]/15"
            placeholder="voce@empresa.com"
          />
        </label>
        <label className="block text-sm font-medium text-[#303a37]">
          Senha
          <span className="relative mt-2 block">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={mode === 'register' ? 12 : undefined}
              className="h-11 w-full border border-[#d8dfda] bg-white px-3 pr-11 text-sm outline-none focus:border-[#366b5d] focus:ring-2 focus:ring-[#366b5d]/15"
              placeholder={
                mode === 'register' ? 'Mínimo de 12 caracteres' : 'Sua senha'
              }
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#77817d] hover:text-[#1b2522]"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="border border-[#e8c8be] bg-[#fff5f1] px-3 py-2 text-sm text-[#9b3f2b]"
          >
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="flex h-11 w-full items-center justify-center gap-2 bg-[#183c35] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#28584c] disabled:cursor-wait disabled:opacity-60"
        >
          {mode === 'login' ? 'Entrar no painel' : 'Criar conta e entrar'}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-[#8a9390]">
            <span className="h-px flex-1 bg-[#e2e6e3]" />
            ou continue com
            <span className="h-px flex-1 bg-[#e2e6e3]" />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={googleSignIn}
            className="flex h-11 w-full items-center justify-center gap-3 border border-[#d8dfda] bg-white text-sm font-medium text-[#303a37] hover:bg-[#f7f9f7] disabled:opacity-60"
          >
            <GoogleMark />
            Continuar com Google
          </button>
        </>
      )}

      <p className="mt-8 text-center text-xs leading-5 text-[#7b8581]">
        Acesso restrito a administradores e gestores de estoque autorizados.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.15a11 11 0 0 0 0 9.9l3.69-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.52 10.52 0 0 0 12 1a11 11 0 0 0-9.85 6.05l3.69 2.84C6.71 7.29 9.14 5.36 12 5.36Z"
      />
    </svg>
  );
}
