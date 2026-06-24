"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TESTS, formatDateFull } from "../../lib/tests";

export default function Confirmacao() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const pid = localStorage.getItem("participant_id");
    if (!pid) {
      router.replace("/");
      return;
    }
    fetch(`/api/my-bookings?participant_id=${pid}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
        }
      })
      .catch(() => setError("Não foi possível carregar seu resumo."));
  }, [router]);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-5 mt-10">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-brand-700 mt-20">Carregando seu resumo...</div>;
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">✅</div>
        <h1 className="text-2xl font-bold text-brand-800">Tudo agendado!</h1>
        <p className="text-brand-500 mt-1">
          {data.participant.name}, aqui está o resumo dos seus testes:
        </p>
      </div>

      <div className="space-y-3">
        {TESTS.map((test) => {
          const b = data.bookings.find((bk) => bk.test_id === test.id);
          return (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-md p-5 border border-brand-100"
            >
              <div className="text-lg font-bold text-brand-800 mb-1">
                {test.icon} {test.label}
              </div>
              {b ? (
                <div className="text-brand-600 text-lg capitalize">
                  {formatDateFull(b.slot.date)}
                  {b.slot.time && <> às <strong>{b.slot.time}</strong></>}
                </div>
              ) : (
                <div className="text-red-500">Não agendado</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-4 mt-6 text-brand-700 text-center">
        Guarde estas datas! Qualquer dúvida, fale com a organizadora no WhatsApp.
      </div>
    </div>
  );
}
