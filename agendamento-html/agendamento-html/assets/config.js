// ============================================================
// PREENCHA AQUI com os dados do SEU projeto Supabase
// (Project Settings → API, na Parte 1 do README)
// ============================================================
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA-CHAVE-ANON-AQUI";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TESTS = [
  { id: "forca", label: "Teste de Força", icon: "💪" },
  { id: "composicao", label: "Composição Corporal", icon: "⚖️" },
  { id: "cardio", label: "Teste Cardiorrespiratório (Bike)", icon: "🚴" },
  { id: "sangue", label: "Exame de Sangue", icon: "🩸" },
];

const WEEKDAYS = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];

function formatDateBR(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function formatDateFull(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  return `${formatDateBR(isoDate)} (${WEEKDAYS[d.getDay()]})`;
}

function cleanPhone(v) {
  return v.replace(/\D/g, "");
}
