"use client";
import { useState } from "react";
import { startAssembly, endAssembly, changeAssemblyStatus } from "@/app/services/assemblies.service";
// Importamos el tipo para mantener el tipado fuerte
import { responseAssembly } from "@/app/types/assemblies"; // Ajusta la ruta según dónde guardes tus tipos
export function useAssemblyState(){
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<responseAssembly | null>(null);
    const[error, setError] = useState<string | null>(null);

    const iniciar = async (id: string) => {
        try{
            setLoading(true);
            setError(null); // Reseteamos errores previos
            const data = await startAssembly(id);
            setResponse(data);
            return data; // Retornamos los datos por si el componente los necesita de inmediato
        }catch(err: any){
            setError(err.message);
            throw err; // Relanzamos para que el componente pueda manejarlo en un try/catch si es necesario (ej: mostrar un toast)
        }finally{
            setLoading(false);
        }
    };
    
    const finalizar = async(id: string) => {
        try{
            setLoading(true);
            setError(null); // 2. Limpia errores viejos si se reintenta la acción
            const data = await endAssembly(id);
            setResponse(data); 
        }catch(err: any){
            setError(err.message);
            throw err; // 3. Consistencia: relanzamos el error igual que en iniciar
        }finally{
            setLoading(false);
        }   
    };

    const cambiarEstado = async(id: string, estado: string) => {
        try{
            setLoading(true);
            setError(null); // 2. Limpia errores viejos antes de enviar el nuevo estado
            const data = await changeAssemblyStatus(id, estado);
            setResponse(data);
        }catch(err: any){
            setError(err.message);
            throw err; // 3. Consistencia
        }finally{
            setLoading(false);
        }
    };

    return {iniciar, finalizar, cambiarEstado,loading, response, error };
}
