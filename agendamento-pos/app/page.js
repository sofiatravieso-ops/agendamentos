"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Se a pessoa já começou (ou terminou) o agendamento neste celular, vai direto pra frente
    const saved = localStorage.getItem("participant_id");
    const savedTest = localStorage.getItem("current_test_index");
    if (saved) {
      router.replace("/agendar");
      return;
    }
    setChecking(false);
  }, [router]);

  function handleStart(e) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;
    localStorage.setItem("participant_name", name.trim());
    localStorage.setItem("participant_whatsapp", whatsapp.trim());
    localStorage.setItem("current_test_index", "0");
    router.push("/agendar");
  }

  if (checking) {
    return <div className="text-center text-brand-700 mt-20">Carregando...</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-brand-100">
        <h1 className="text-2xl font-bold text-brand-800 mb-3">Oi meninas! 💙</h1>
        <p className="text-brand-900 text-[17px] leading-relaxed">
          Para as avaliações finais vamos tentar fazer o agendamento por esse
          site, para facilitar para todas! Os horários disponíveis para cada
          teste são fixados nas datas que aparecem, assim que alguém agenda
          esse horário, ele para de ficar disponível, então se um horário não
          aparece, provavelmente ele foi agendado para outra voluntária.
        </p>
        <p className="text-brand-900 text-[17px] mt-3">
          Qualquer dúvida, me mande mensagem no Whats.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-brand-100">
        <h2 className="text-xl font-semibold text-brand-800 mb-4">
          Vamos começar
        </h2>
        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label className="block text-brand-800 font-medium mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full text-lg px-4 py-3 rounded-xl border-2 border-brand-200 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-brand-800 font-medium mb-2">
              WhatsApp (com DDD)
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full text-lg px-4 py-3 rounded-xl border-2 border-brand-200 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xl font-bold py-4 rounded-xl shadow transition"
          >
            Começar agendamento →
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-brand-400 mt-6">
        Você vai agendar os 4 testes, um de cada vez.
      </p>
    </div>
  );
}
