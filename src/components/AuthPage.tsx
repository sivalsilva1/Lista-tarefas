import { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  CheckSquare, Loader2, AlertCircle, CheckCircle2, ArrowLeft
} from 'lucide-react';
import type { AuthView } from '../types/auth';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<string | null>;
}

export function AuthPage({ onSignIn, onSignUp, onResetPassword }: AuthPageProps) {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30 mb-4">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TaskFlow</h1>
          <p className="text-slate-400 text-sm mt-1">Organize sua vida com clareza</p>
        </div>

        {/* Card principal */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
          {view === 'login' && (
            <LoginForm
              onSignIn={onSignIn}
              onGoRegister={() => setView('register')}
              onGoReset={() => setView('reset-password')}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              onSignUp={onSignUp}
              onGoLogin={() => setView('login')}
            />
          )}
          {view === 'reset-password' && (
            <ResetForm
              onResetPassword={onResetPassword}
              onGoLogin={() => setView('login')}
              onSent={() => setView('reset-sent')}
            />
          )}
          {view === 'reset-sent' && (
            <ResetSent onGoLogin={() => setView('login')} />
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Seus dados são protegidos pelo Supabase Auth
        </p>
      </div>
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────

function LoginForm({ onSignIn, onGoRegister, onGoReset }: {
  onSignIn: (e: string, p: string) => Promise<string | null>;
  onGoRegister: () => void;
  onGoReset: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await onSignIn(email, password);
    setLoading(false);
    if (err) setError(translateError(err));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Bem-vindo de volta!</h2>
        <p className="text-slate-400 text-sm mt-1">Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="login-email"
          type="email"
          label="E-mail"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div className="space-y-1">
          <label htmlFor="login-password" className="text-sm font-medium text-slate-300">
            Senha
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="auth-input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onGoReset}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Esqueceu a senha?
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="auth-btn-primary w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
        <p className="text-slate-400 text-sm">
          Não tem uma conta?{' '}
          <button
            onClick={onGoRegister}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Cadastre-se grátis
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Register ───────────────────────────────────────────────────────────────

function RegisterForm({ onSignUp, onGoLogin }: {
  onSignUp: (e: string, p: string, n: string) => Promise<string | null>;
  onGoLogin: () => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const err = await onSignUp(email, password, displayName);
    setLoading(false);
    if (err) setError(translateError(err));
  };

  return (
    <div className="p-8">
      <button
        onClick={onGoLogin}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Criar conta</h2>
        <p className="text-slate-400 text-sm mt-1">É rápido e gratuito</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="reg-name"
          type="text"
          label="Seu nome"
          value={displayName}
          onChange={setDisplayName}
          placeholder="João Silva"
          icon={<User className="w-4 h-4" />}
          autoComplete="name"
        />

        <InputField
          id="reg-email"
          type="email"
          label="E-mail"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div className="space-y-1">
          <label htmlFor="reg-password" className="text-sm font-medium text-slate-300">
            Senha
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              required
              className="auth-input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Barra de força da senha */}
          {password && (
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= passwordStrength.score
                      ? passwordStrength.color
                      : 'bg-slate-700'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-1 self-center">
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <InputField
          id="reg-confirm"
          type="password"
          label="Confirmar senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repita a senha"
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        {error && <ErrorAlert message={error} />}

        <button
          type="submit"
          disabled={loading || !email || !password || !displayName}
          className="auth-btn-primary w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {loading ? 'Criando conta…' : 'Criar minha conta'}
        </button>
      </form>

      <p className="text-xs text-slate-600 text-center mt-4">
        Ao criar uma conta você concorda com os Termos de Uso.
      </p>
    </div>
  );
}

// ── Reset Password ─────────────────────────────────────────────────────────

function ResetForm({ onResetPassword, onGoLogin, onSent }: {
  onResetPassword: (e: string) => Promise<string | null>;
  onGoLogin: () => void;
  onSent: () => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await onResetPassword(email);
    setLoading(false);
    if (err) {
      setError(translateError(err));
    } else {
      onSent();
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={onGoLogin}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
      </button>

      <div className="mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <Mail className="w-5 h-5 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Recuperar senha</h2>
        <p className="text-slate-400 text-sm mt-1">
          Enviaremos um link de redefinição para o seu e-mail.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="reset-email"
          type="email"
          label="E-mail da conta"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        {error && <ErrorAlert message={error} />}

        <button
          type="submit"
          disabled={loading || !email}
          className="auth-btn-primary w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {loading ? 'Enviando…' : 'Enviar link de recuperação'}
        </button>
      </form>
    </div>
  );
}

// ── Reset Sent ─────────────────────────────────────────────────────────────

function ResetSent({ onGoLogin }: { onGoLogin: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">E-mail enviado!</h2>
      <p className="text-slate-400 text-sm mb-6">
        Verifique sua caixa de entrada e clique no link para redefinir a sua senha.
        O link expira em 1 hora.
      </p>
      <button onClick={onGoLogin} className="auth-btn-secondary w-full">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao login
      </button>
    </div>
  );
}

// ── Componentes auxiliares ─────────────────────────────────────────────────

function InputField({
  id, type, label, value, onChange, placeholder, icon, autoComplete,
}: {
  id: string; type: string; label: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; autoComplete?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="auth-input pl-10"
        />
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Fraca', color: 'bg-red-500' },
    { label: 'Razoável', color: 'bg-orange-500' },
    { label: 'Boa', color: 'bg-amber-400' },
    { label: 'Forte', color: 'bg-emerald-500' },
  ];
  return { score, ...levels[Math.max(0, score - 1)] };
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
  if (msg.includes('Password should be at least')) return 'A senha deve ter ao menos 6 caracteres.';
  if (msg.includes('Unable to validate email')) return 'E-mail inválido.';
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde um momento.';
  return msg;
}
