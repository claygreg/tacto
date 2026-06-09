"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockHistoricalData } from "@/lib/mock-data/diagnostics";
import { mockAssessments as assessmentsList } from "@/lib/mock-data/assessments";

export default function HistoricoPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico e Evolução</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe a evolução da turma ao longo dos bimestres
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <select
          id="select-classroom-history"
          className="px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option>9º Ano A</option>
          <option>8º Ano B</option>
          <option>7º Ano C</option>
        </select>
        <div className="flex gap-2">
          {["Turma", "Individual"].map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "Turma"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de linha */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-sm mb-5">Evolução bimestral — 9º Ano A</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mockHistoricalData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="period" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="average"
              name="Média"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: "#6366f1", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="highest"
              name="Maior nota"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lowest"
              name="Menor nota"
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela comparativa */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Provas aplicadas</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Avaliação", "Turma", "Data", "Questões", "Média", "Participantes"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assessmentsList
              .filter((a) => a.status === "applied")
              .map((a) => (
                <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium">{a.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{a.classroomName}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{a.appliedAt}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{a.questionCount}</td>
                  <td className="px-5 py-3 text-sm font-bold text-primary">7.2</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">10</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
