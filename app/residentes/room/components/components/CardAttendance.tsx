"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { getCited, getAttendees, getAbsences, getCoefficient, getQuorum } from "@/app/services/assemblies.service";
import { Check } from "lucide-react";

interface CardAttendanceProps {
  assemblyId?: string;
}

interface QuorumData {
  required_quorum: number;
  current_quorum: number;
  has_quorum: boolean;
  attended_coefficient: number;
  total_ph_coefficient: number;
  attendees_count: number;
}

interface CoefficientData {
  total_coefficient: number;
  unit_count: number;
}

interface AttendanceStats {
  total_citados: number;
  total_asistentes: number;
  total_ausentes: number;
  coeficiente: number;
  quorum_requerido: number;
  quorum_actual: number;
  tiene_quorum: boolean;
}

export function CardAttendance({ assemblyId }: CardAttendanceProps) {
  const { data: session } = useSession();
  const userName = (`${session?.user?.userProfile?.firstName} ${session?.user?.userProfile?.lastName}`) || '';
  const participants = useParticipants();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!assemblyId) {
        // If no assemblyId, use participant count as fallback
        setStats({
          total_citados: 0,
          total_asistentes: participants.length,
          total_ausentes: 0,
          coeficiente: 0,
          quorum_requerido: 0,
          quorum_actual: 0,
          tiene_quorum: false,
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch all attendance data in parallel
        const [citedRes, attendeesRes, absencesRes, coefficientRes, quorumRes] = await Promise.all([
          getCited(assemblyId),
          getAttendees(assemblyId),
          getAbsences(assemblyId),
          getCoefficient(assemblyId),
          getQuorum(assemblyId),
        ]);

        const totalCitados = citedRes.properties?.total_citados || citedRes.data?.length || 0;
        const totalAsistentes = attendeesRes.properties?.total_asistentes || attendeesRes.data?.length || 0;
        const totalAusentes = absencesRes.properties?.total_ausentes || absencesRes.data?.length || 0;
        
        const coefficientData: CoefficientData = coefficientRes.data || { total_coefficient: 0, unit_count: 0 };
        const quorumData: QuorumData = quorumRes.data || {
          required_quorum: 0,
          current_quorum: 0,
          has_quorum: false,
          attended_coefficient: 0,
          total_ph_coefficient: 0,
          attendees_count: 0,
        };

        setStats({
          total_citados: totalCitados,
          total_asistentes: totalAsistentes,
          total_ausentes: totalAusentes,
          coeficiente: coefficientData.total_coefficient || quorumData.attended_coefficient || 0,
          quorum_requerido: quorumData.required_quorum || 0,
          quorum_actual: quorumData.current_quorum || 0,
          tiene_quorum: quorumData.has_quorum || false,
        });
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos de asistencia');
        // Fallback to participant count
        setStats({
          total_citados: 0,
          total_asistentes: participants.length,
          total_ausentes: 0,
          coeficiente: 0,
          quorum_requerido: 0,
          quorum_actual: 0,
          tiene_quorum: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [assemblyId, participants.length]);

  // Calculate percentage for display
  const attendancePercentage = stats && stats.total_citados > 0 
    ? Math.round((stats.total_asistentes / stats.total_citados) * 100) 
    : 0;

  const coefficientPercentage = stats && stats.total_citados > 0
    ? Math.round((stats.coeficiente / stats.total_citados) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-1 rounded-full flex items-center justify-center w-6 h-6">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
           <h3 className="text-lg font-semibold text-gray-800">Asistencia</h3>
        </div>
        <span className="text-sm text-gray-500">
          {isLoading ? 'Cargando...' : `${stats?.total_asistentes || 0} en sala`}
        </span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Citados */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Citados:</span>
          <span className="font-medium text-gray-900">
            {stats?.total_citados ?? 0}
          </span>
        </div>

        {/* Asistentes */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Asistentes:</span>
          <span className="font-medium text-green-600">
            {stats?.total_asistentes ?? 0}
          </span>
        </div>

        {/* Ausentes */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Ausentes:</span>
          <span className="font-medium text-red-600">
            {stats?.total_ausentes ?? 0}
          </span>
        </div>

        <hr className="my-2" />

        {/* Coeficiente */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Coeficiente:</span>
          <span className="font-medium text-gray-900">
            {stats?.coeficiente ?? 0}%
          </span>
        </div>

        {/* Quorum */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Quórum:</span>
          <span className={`font-medium ${stats?.tiene_quorum ? 'text-green-600' : 'text-red-600'}`}>
            {stats?.quorum_actual ?? 0}%
          </span>
        </div>

        {/* Quorum requerido */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Requerido:</span>
          <span className="font-medium text-gray-900">
            {stats?.quorum_requerido ?? 0}%
          </span>
        </div>
      </div>

      {/* Status indicator */}
      {stats && (
        <div className={`mt-4 p-2 rounded text-center text-sm font-medium ${
          stats.tiene_quorum 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {stats.tiene_quorum ? '✓ Quórum alcanzado' : '✗ Sin quórum'}
        </div>
      )}
    </div>
  );
}
