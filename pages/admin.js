import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [lista, setLista] = useState([]);

  async function carregar() {
    const { data } = await supabase
      .from("agendamentos")
      .select("id, teste, data, horario, participantes(nome, whatsapp)")
      .order("data");

    setLista(data || []);
  }

  async function excluir(id) {
    if (confirm("Deseja excluir este agendamento?")) {
      await supabase.from("agendamentos").delete().eq("id", id);
      carregar();
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "auto" }}>
      <h1>Painel Administrativo</h1>

      {lista.map(a => (
        <div key={a.id} style={{ marginBottom: 10 }}>
          <strong>{a.participantes?.nome}</strong> ({a.participantes?.whatsapp})<br />
          {a.teste} — {a.data} às {a.horario}
          <br />
          <button onClick={() => excluir(a.id)}>Excluir</button>
        </div>
      ))}
    </main>
  );
}
