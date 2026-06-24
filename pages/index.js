import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "COLE_AQUI_PROJECT_URL",
  "COLE_AQUI_ANON_KEY"
);

export default function Home() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [teste, setTeste] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [ok, setOk] = useState(false);

  async function agendar() {
    await supabase.from("agendamentos").insert([
      { nome, whatsapp, teste, data, horario: hora }
    ]);
    setOk(true);
  }

  if (ok) {
    return <h1>Agendamento confirmado</h1>;
  }

  return (
    <main style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Agendamento</h1>

      <input placeholder="Nome" onChange={e => setNome(e.target.value)} />
      <input placeholder="WhatsApp" onChange={e => setWhatsapp(e.target.value)} />

      <select onChange={e => setTeste(e.target.value)}>
        <option>Selecione o teste</option>
        <option>Força</option>
        <option>Funcional</option>
        <option>Sangue</option>
      </select>

      <input type="date" onChange={e => setData(e.target.value)} />
      <input type="time" onChange={e => setHora(e.target.value)} />

      <button onClick={agendar}>Agendar</button>
    </main>
  );
}
