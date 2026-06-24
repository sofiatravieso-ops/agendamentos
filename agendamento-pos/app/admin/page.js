"use client";

import { useState, useEffect } from "react";
import { TESTS, formatDateFull } from "../../lib/tests";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [participants, setParticipants] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_password");
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setAuthed(false);
        sessionStorage.removeItem("admin_password");
      } else {
        setParticipants(data.participants);
      }
    } catch (e) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    sessionStorage.setItem("admin_password", password);
    setAuthed(true);
  }

  async function deleteBooking(bookingId) {
    if (!confirm("Excluir este agendamento e liberar o horário?")) return;
    await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    load();
  }

  async function deleteParticipant(participantId) {
    if (!confirm("Excluir esta participante e TODOS os agendamentos dela?")) return;
    await fetch("/api/admin/delete-participant", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ participant_id: participantId }),
    });
    load();
  }

  function exportExcel() {
    const url = "/api/admin/export";
    fetch(url, { headers: { "x-admin-password": password } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "agendamentos.xlsx";
        link.click();
      });
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <h1 className="text-2xl font-bold text-brand-800 mb-4 text-center">
          Painel Administrativo
        </h1>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-md p-6 border border-brand-100 space-y-4">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-lg px-4 py-3 rounded-xl border-2 border-brand-200 focus:border-brand-500 focus:outline-none"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-lg font-bold py-3 rounded-xl">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-800">Painel Administrativo</h1>
        <button
          onClick={exportExcel}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-xl"
        >
          📥 Exportar Excel
        </button>
      </div>

      {loading && <div className="text-brand-500">Carregando...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {participants && participants.length === 0 && (
        <div className="text-brand-500">Nenhum agendamento ainda.</div>
      )}

      <div className="space-y-4">
        {participants &&
          participants.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-md p-5 border border-brand-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-brand-800 text-lg">{p.name}</div>
                  <div className="text-brand-500 text-sm">{p.whatsapp}</div>
                </div>
                <button
                  onClick={() => deleteParticipant(p.id)}
                  className="text-red-500 text-sm font-medium hover:underline"
                >
                  Excluir participante
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {TESTS.map((t) => {
                  const b = p.bookings.find((bk) => bk.test_id === t.id);
                  return (
                    <div
                      key={t.id}
                      className="flex justify-between items-center bg-brand-50 rounded-lg px-3 py-2"
                    >
                      <div className="text-sm">
                        <div className="font-medium text-brand-700">
                          {t.icon} {t.label}
                        </div>
                        {b ? (
                          <div className="text-brand-500 capitalize">
                            {formatDateFull(b.slot.date)}
                            {b.slot.time ? ` às ${b.slot.time}` : ""}
                          </div>
                        ) : (
                          <div className="text-brand-300">Não agendado</div>
                        )}
                      </div>
                      {b && (
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="text-red-400 hover:text-red-600 text-sm"
                          title="Excluir agendamento"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
