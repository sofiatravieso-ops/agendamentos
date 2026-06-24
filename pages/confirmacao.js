import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Confirmacao() {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    async function carregar() {
      const participante_id = localStorage.getItem("participante_id");

      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("participante_id", participante_id)
        .order("data");

      setAgendamentos(data || []);
    }
    carregar();
  }, []);

  return (
    <main style={{ maxWidth: 500, margin: "auto" }}>
      <h1>Agendamento confirmado</h1>

      {agendamentos.map(a => (
        <p key={a.id}>
          <strong>{a.teste}</strong> — {a.data} às {a.horario}
        </p>
      ))}

      <p>
        Guarde esta informação. Em caso de dúvidas, entre em contato com a equipe.
      </p>
    </main>
  );
}
