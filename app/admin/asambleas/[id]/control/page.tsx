"use client";
import React from "react";
import { useParams } from "next/navigation";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import AssemblyControlPanel from "@/app/residentes/room/components/components/AssemblyControlPanel";

export default function ControlPage() {
  const { id } = useParams();
  
  // Forzamos a TypeScript a reconocerlo como un string limpio
  const assemblyId = id as string;

  return (
    // 1. Reemplazamos bg-gray-50 por el degradado ocre/dorado de la app principal
    <div className="min-h-screen bg-gradient-to-br from-[#b08d49] via-[#c4a468] to-[#997535] p-8 font-sans flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* 2. Encabezado del Panel en tarjeta oscura con bordes redondeados estilizados */}
        <div className="bg-[#1e1e24] text-white p-6 rounded-2xl border border-zinc-800 shadow-2xl">
          <h1 className="text-2xl font-bold tracking-wide text-zinc-100">
            Control de Asamblea <span className="text-[#c4a468]">#{assemblyId}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Consola exclusiva para la mutación de estados en tiempo real (Inicio, Pausa y Cierre).
          </p>
        </div>

        {/* 🚀 Renderizado de tu componente interactivo (que ahora también es oscuro) */}
        <AssemblyControlPanel assemblyId={assemblyId} />

        {/* 3. Bloque informativo de respaldo adaptado al tema oscuro */}
        <div className="p-4 border border-zinc-800 rounded-xl bg-[#1e1e24]/90 text-center text-zinc-400 text-xs shadow-md">
          ✨ Nota: El quórum, los coeficientes y las votaciones por pregunta se visualizan y operan en paralelo directamente desde la pantalla de la sala en vivo.
        </div>

      </div>
    </div>
  );
}