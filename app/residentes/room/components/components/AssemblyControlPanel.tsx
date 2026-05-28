"use client";
import React from "react";
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
}