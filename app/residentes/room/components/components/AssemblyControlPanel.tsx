"use client";
import React from "react";
 conecta-ph_front_valen
import { useRouter } from "next/navigation";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { useAssemblyState } from "@/app/hooks/useAssemblyState";

// Definimos la interfaz para recibir el ID dinámico
interface AssemblyControlPanelProps {
  assemblyId: string;
}

export default function AssemblyControlPanel({ assemblyId }: AssemblyControlPanelProps){
  const router = useRouter();
  const { iniciar, finalizar, cambiarEstado, loading, response, error } = useAssemblyState();

  return (
    /* 🌟 ÚNICO CAMBIO: Cambiamos bg-[#1e1e24] a bg-white, text-white a text-zinc-800, y border-zinc-800 a border-zinc-200 */
    <div className="p-6 border border-zinc-200 rounded-2xl bg-white text-zinc-800 shadow-2xl space-y-6">
        
        {/* Subtítulo integrado al tema claro */}
        <h2 className="text-base font-bold uppercase tracking-wider text-zinc-400">
          Panel de Control de Asamblea
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => iniciar(assemblyId)}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-500 font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg"
            disabled={loading}
          >
            Iniciar Asamblea
          </button>

          <button
            onClick={() => finalizar(assemblyId)}
            className="bg-rose-600 text-white px-5 py-3 rounded-xl hover:bg-rose-500 font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg"
            disabled={loading}
          >
            Finalizar Asamblea
          </button>

          <button
            onClick={() => cambiarEstado(assemblyId, "en curso")}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-500 font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg"
            disabled={loading}
          >
            Cambiar Estado
          </button>
        </div>

        {loading && <p className="text-xs text-zinc-500 animate-pulse">Procesando...</p>}
        {error && <p className="text-xs text-rose-600 font-semibold">⚠️ {error}</p>}
        
        {response && (
          /* Ajustado fondo de la consola para que sea legible en el entorno claro */
          <pre className="bg-zinc-950 p-3 rounded-xl text-xs font-mono border border-zinc-800 overflow-x-auto text-zinc-400 max-h-40">
            {JSON.stringify(response, null, 2)}
          </pre>
        )}

       {/* Separador inferior y botón de escape ajustados sutilmente */}
        <div className="border-t border-zinc-200 pt-4 flex justify-end">
          <button 
            // 3. Modificamos el push para que inyecte el parámetro ?r= que lee la interfaz intacta
            onClick={() => router.push(`/residentes/room?r=${assemblyId}`)}
            className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider"
          >
            ← Volver al Salón
          </button>
        </div>
    </div>
  );

import { useAssemblyState } from "@/app/hooks/useAssemblyState";

export default function AssemblyControlPanel(){
    const{iniciar, finalizar, cambiarEstado, loading, response, error } = useAssemblyState();

    return(
        <div className="p-4 border rounded bg-white shadow-md">
            <h2 className="text-lg font-bold mb-4">Panel de Control de Asamblea</h2>
            <div className="space-x-2">
            <button
          onClick={() => iniciar("123")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
            >
          Iniciar Asamblea
            </button>

         <button
          onClick={() => finalizar("123")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          disabled={loading}
            >
          Finalizar Asamblea
        </button>

        <button
          onClick={() => cambiarEstado("123", "en curso")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Cambiar Estado
        </button>
      </div>
      {loading && <p className="mt-3 text-gray-500">Procesando...</p>}
      {error && <p className="mt-3 text-red-500">{error}</p>}
      {response && (
        <pre className="mt-3 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
    );
 pre-main
}