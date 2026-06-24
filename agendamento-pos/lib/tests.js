export const TESTS = [
  { id: "forca", label: "Teste de Força", icon: "💪" },
  { id: "composicao", label: "Composição Corporal", icon: "⚖️" },
  { id: "cardio", label: "Teste Cardiorrespiratório (Bike)", icon: "🚴" },
  { id: "sangue", label: "Exame de Sangue", icon: "🩸" },
];

export function formatDateBR(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export function formatDateFull(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  const weekday = WEEKDAYS[d.getDay()];
  return `${formatDateBR(isoDate)} (${weekday})`;
}
