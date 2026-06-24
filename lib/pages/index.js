import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const router = useRouter();

  async function continuar() {
    const { data } = await supabase
      .from("participantes")
      .insert([{ nome, whatsapp }])
      .select()
      .single();

    localStorage.setItem("participante_id", data.id);
    router.push("/testes");
  }

  return (
    <main style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Agendamento de Testes</h1>

      <input
        placeholder="Nome completo"
        onChange={e => setNome(e.target.value)}
      />

      <input
        placeholder="WhatsApp"
        onChange={e => setWhatsapp(e.target.value)}
      />

      <button onClick={continuar}>Continuar</button>
    </main>
  );
}
