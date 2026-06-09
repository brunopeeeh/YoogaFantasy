import { createClient } from '@supabase/supabase-js';

// Busca as variáveis de ambiente do arquivo .env configurado pelo Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY;

// Alerta o desenvolvedor caso as variáveis não estejam configuradas no .env
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "⚠️ Erro: SUPABASE_URL ou SUPABASE_ANON_KEY não foram definidos no arquivo .env.\n" +
        "Verifique se o arquivo .env está na raiz do projeto e com os prefixos corretos do Vite (VITE_SUPABASE_URL)."
    );
}

// Limpa aspas e espaços extras que o .env possa ter gerado
const limpar = (s) => (typeof s === 'string' ? s.replace(/^["'\s]+|["'\s]+$/g, '') : s);
const urlLimpa = limpar(supabaseUrl);
const keyLimpa = limpar(supabaseAnonKey);

// Inicializa o cliente do Supabase para ser usado em todo o Front-end
export const supabase = createClient(urlLimpa, keyLimpa);