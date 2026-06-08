import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';

export default function LoginScreen() {
  const { login, cadastrar, resetarSenha, error } = useAuth();
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroLocal, setErroLocal] = useState(null);
  const [mensagemEnvio, setMensagemEnvio] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErroLocal(null);
    setEnviando(true);

    try {
      if (modo === 'cadastro') {
        if (!email || !email.includes('@')) {
          setErroLocal('Informe um e-mail válido.');
          return;
        }
        if (!password || password.length < 6) {
          setErroLocal('A senha deve ter no mínimo 6 caracteres.');
          return;
        }
        if (password !== confirmPassword) {
          setErroLocal('As senhas não conferem.');
          return;
        }
        const res = await cadastrar(email, password);
        if (res.ok && res.precisaConfirmar) {
          setMensagemEnvio('Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.');
          setEnviado(true);
        }
      } else if (modo === 'recuperar') {
        if (!email || !email.includes('@')) {
          setErroLocal('Informe um e-mail válido.');
          return;
        }
        const res = await resetarSenha(email);
        if (res.ok) {
          setMensagemEnvio('Enviamos um link de recuperação para o seu e-mail. Siga as instruções para redefinir sua senha.');
          setEnviado(true);
        }
      } else {
        if (!email || !email.includes('@')) {
          setErroLocal('Informe um e-mail válido.');
          return;
        }
        if (!password) {
          setErroLocal('Informe sua senha.');
          return;
        }
        const res = await login(email, password);
        if (!res.ok) {
          setErroLocal(res.error?.message || 'Falha ao entrar.');
        }
      }
    } catch (e) {
      setErroLocal(e.message || 'Erro inesperado.');
    } finally {
      setEnviando(false);
    }
  }

  function resetForm() {
    setEnviado(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErroLocal(null);
    setMensagemEnvio('');
  }

  function trocarModo(novo) {
    setModo(novo);
    setErroLocal(null);
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="min-h-screen w-full bg-fifa-blue flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.3) 0%, transparent 30%)',
        }}
      />

      <div className="w-full max-w-md bg-fifa-navy-900/80 backdrop-blur-glass rounded-glass-xl shadow-glass-lg border border-white/10 p-6 sm:p-8 text-gray-200 relative z-10 animate-bounce-in">
        <div className="flex flex-col items-center mb-6 select-none">
          <div className="font-display text-3xl sm:text-[40px] text-white tracking-[2px] leading-none">FIFA</div>
          <div className="font-display text-xs sm:text-sm text-fifa-blue tracking-[1px] uppercase leading-none mt-1">World Cup™</div>
          <div className="font-display text-2xl sm:text-[28px] text-fifa-gold tracking-[3px] leading-none mt-1">Fantasy</div>
        </div>

        {enviado ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-fifa-gold/10 border-2 border-fifa-gold/40 flex items-center justify-center">
              <Mail size={28} className="text-fifa-gold" />
            </div>
            <h2 className="text-lg font-black text-gray-100 mb-2">Verifique seu e-mail</h2>
            <p className="text-xs text-white/60 leading-relaxed">
              {mensagemEnvio}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="block mx-auto mt-6 text-[11px] uppercase font-bold tracking-wider text-white/40 hover:text-white/70 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        ) : (
          <>
            {modo === 'recuperar' ? (
              <button
                type="button"
                onClick={() => trocarModo('entrar')}
                className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider text-white/40 hover:text-white/70 transition-colors mb-4"
              >
                <ArrowLeft size={12} /> Voltar
              </button>
            ) : (
              <div className="flex rounded-lg bg-black/20 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => trocarModo('entrar')}
                  className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors ${modo === 'entrar' ? 'bg-fifa-blue text-white' : 'text-white/50 hover:text-white'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => trocarModo('cadastro')}
                  className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors ${modo === 'cadastro' ? 'bg-fifa-gold text-black' : 'text-white/50 hover:text-white'}`}
                >
                  Criar conta
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-100 mb-1 flex items-center gap-2">
                  {modo === 'cadastro' ? <UserPlus size={18} /> : modo === 'recuperar' ? <KeyRound size={18} /> : <LogIn size={18} />}
                  {modo === 'cadastro' ? 'Criar conta' : modo === 'recuperar' ? 'Recuperar senha' : 'Entrar'}
                </h2>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {modo === 'cadastro'
                    ? 'Crie sua conta com e-mail e senha.'
                    : modo === 'recuperar'
                      ? 'Informe seu e-mail para receber o link de recuperação.'
                      : 'Entre com seu e-mail e senha.'}
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">E-mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="bg-fifa-navy-800 border border-white/10 text-gray-200 text-sm rounded-lg p-3 outline-none focus:border-fifa-blue transition-colors"
                />
              </label>

              {modo !== 'recuperar' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">Senha</span>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={modo === 'cadastro' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                      minLength={6}
                      className="w-full bg-fifa-navy-800 border border-white/10 text-gray-200 text-sm rounded-lg p-3 pr-10 outline-none focus:border-fifa-blue transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-2"
                      tabIndex={-1}
                    >
                      {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              )}

              {modo === 'cadastro' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">Confirmar senha</span>
                  <div className="relative">
                    <input
                      type={mostrarConfirmar ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      minLength={6}
                      className="w-full bg-fifa-navy-800 border border-white/10 text-gray-200 text-sm rounded-lg p-3 pr-10 outline-none focus:border-fifa-gold transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-2"
                      tabIndex={-1}
                    >
                      {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              )}

              <div className="flex items-center justify-between">
                {modo === 'entrar' && (
                  <button
                    type="button"
                    onClick={() => trocarModo('recuperar')}
                    className="text-[10px] uppercase font-bold tracking-wider text-fifa-blue hover:text-fifa-blue-dark transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>

              {(erroLocal || error) && (
                <p className="text-[11px] text-red-300 bg-red-950/30 border border-red-900/40 rounded-lg p-2.5">
                  {erroLocal || error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="bg-fifa-blue hover:bg-fifa-blue-dark active:scale-95 disabled:opacity-60 disabled:hover:bg-fifa-blue text-white font-black text-sm uppercase tracking-wider py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                {modo === 'cadastro' ? <UserPlus size={14} /> : <LogIn size={14} />}
                {enviando
                  ? 'Aguarde...'
                  : modo === 'cadastro'
                    ? 'Criar conta'
                    : modo === 'recuperar'
                      ? 'Enviar link'
                      : 'Entrar'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
