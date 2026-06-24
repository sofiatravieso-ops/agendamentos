"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TESTS, formatDateFull } from "../../lib/tests";

export default function Agendar() {
  const router = useRouter();
  const [testIndex, setTestIndex] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("participant_name");
    const savedWhats = localStorage.getItem("participant_whatsapp");
    const savedPid = localStorage.getItem("participant_id");
    let idx = parseInt(localStorage.getItem("current_test_index") || "0", 10);

    if (!savedName || !savedWhats) {
      router.replace("/");
      return;
    }
    if (idx >= TESTS.length) {
      router.replace("/confirmacao");
      return;
    }

    setName(savedName);
    setWhatsapp(savedWhats);
    setParticipantId(savedPid || null);
    setTestIndex(idx);
  }, [router]);

  const loadSlots = useCallback(async () => {
    if (testIndex === null) return;
    setLoading(true);
    setError("");
    setSelectedDate(null);
    try {
      const res = await fetch(`/api/slots?test_id=${TESTS[testIndex].id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSlots(data.slots || []);
    } catch (e) {
      setError("Não foi possível carregar os horários. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }, [testIndex]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function chooseSlot(slot) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: participantId,
          name,
          whatsapp,
          slot_id: slot.id,
          test_id: TESTS[testIndex].id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        loadSlots();
        return;
      }
      if (data.participant_id) {
        localStorage.setItem("participant_id", data.participant_id);
        setParticipantId(data.participant_id);
      }
      const nextIndex = testIndex + 1;
      localStorage.setItem("current_test_index", String(nextIndex));
      if (nextIndex >= TESTS.length) {
        router.push("/confirmacao");
      } else {
        setTestIndex(nextIndex);
      }
    } catch (e) {
      setError("Erro de conexão. Verifique a internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (testIndex === null) {
    return <div className="text-center text-brand-700 mt-20">Carregando...</div>;
  }

  const test = TESTS[testIndex];

  // Agrupa horários por data
  const byDate = {};
  for (const s of slots) {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  }
  const dates = Object.keys(byDate).sort();
  const isDaily = test.id === "sangue";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-brand-500 font-medium">
          Teste {testIndex + 1} de {TESTS.length}
        </span>
        <div className="flex gap-1">
          {TESTS.map((t, i) => (
            <div
              key={t.id}
              className={`w-3 h-3 rounded-full ${
                i < testIndex
                  ? "bg-brand-500"
                  : i === testIndex
                  ? "bg-brand-300"
                  : "bg-brand-100"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-brand-100 mb-4">
        <h1 className="text-2xl font-bold text-brand-800 mb-1">
          {test.icon} {test.label}
        </h1>
        <p className="text-brand-500">Escolha um dia e horário disponível</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-brand-500 py-10">Carregando horários...</div>
      ) : dates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-brand-100 text-center text-brand-500">
          Não há mais horários disponíveis para este teste. Fale com a organizadora.
        </div>
      ) : !selectedDate ? (
        <div className="space-y-3">
          <p className="text-brand-700 font-medium mb-2">Escolha o dia:</p>
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className="w-full bg-white hover:bg-brand-50 border-2 border-brand-200 rounded-xl py-4 px-5 text-left flex justify-between items-center shadow-sm transition"
            >
              <span className="text-lg font-medium text-brand-800 capitalize">
                {formatDateFull(date)}
              </span>
              <span className="text-brand-400 text-sm">
                {byDate[date].length} vaga{byDate[date].length > 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-brand-500 mb-4 font-medium"
          >
            ← Escolher outro dia
          </button>
          <p className="text-brand-700 font-medium mb-3 capitalize">
            {formatDateFull(selectedDate)}
          </p>
          {isDaily ? (
            <button
              disabled={submitting}
              onClick={() => chooseSlot(byDate[selectedDate][0])}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xl font-bold py-5 rounded-xl shadow transition"
            >
              {submitting ? "Agendando..." : "Confirmar este dia"}
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {byDate[selectedDate].map((slot) => (
                <button
                  key={slot.id}
                  disabled={submitting}
                  onClick={() => chooseSlot(slot)}
                  className="bg-white hover:bg-brand-500 hover:text-white disabled:opacity-50 border-2 border-brand-300 rounded-xl py-3 text-center font-semibold text-brand-700 shadow-sm transition"
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
