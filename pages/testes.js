import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const TESTES = ["Força", "Funcional", "Sangue"];

export default function Testes() {
  const [indice, setIndice] = useState(0);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const router = useRouter();

  async function salvar() {
    const participante_id = localStorage.getItem("participante_id");

    if (!participante_id) {
      alert("Sessão expirada. Refaça o agendamento.");
      router.push("/");
      return;
    }

    // Limite de sangue: 12 por dia
    if (TESTES[indice] === "Sangue") {
      const { count } = await supabase
        .from("agendamentos")
        .select("*", { count: "exact" })
        .eq("teste", "Sangue")
        .eq("data", data);

      if (count >= 12) {
        alert("Limite diário do exame de sangue atingido.");
        return;
      }
    }

    await supabase.from("agendamentos").insert([{
      participante_id,
      teste: TESTES[indice],
      data,
      horario: hora
    }]);

    if (indice === TESTES.length - 1) {
      router.push("/confirmacao");
    } else {
      setIndice(indice + 1);
      setData("");
      setHora("");
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Agendar teste: {TESTES[indice]}</h2>

      <label>Data</label>
      <input type="date" onChange={e => setData(e.target.value)} />

      <label>Horário</label>
      <input type="time" onChange={e => setHora(e.target.value)} />

      <button onClick={salvar}>Salvar e continuar</button>
    </main>
  );
}
