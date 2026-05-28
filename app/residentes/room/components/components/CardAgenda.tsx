"use client";

import {
  useParticipants
} from "@livekit/components-react";
import { useState, useEffect, Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { getByAssembly as getAgendaByAssembly } from "@/app/services/agenda.service";
import {
  closeVotingQuestion,
  getByAssembly as getVotingQuestionsByAssembly,
  openVotingQuestion,
} from "@/app/services/voting-questions.service";
import { getByVotingQuestion as getOptionsByVotingQuestion } from "@/app/services/question-options.service";
import { create as createVote, getResultsByQuestion } from "@/app/services/votes.service";
import { getQuorum, getCoefficient, getAttendees, getCited } from "@/app/services/assemblies.service";
import { create as createAttendance } from "@/app/services/assembly-attendances.service";

interface CardAgendaProps {
  assemblyId?: string;
}

interface AgendaWithQuestions {
  id: string;
  assembly_id: string;
  title: string;
  sort_order: number;
  is_votable: boolean;
  required_quorum: number;
  is_active: boolean;
  votingQuestions: any[];
  options: Record<string, any[]>;
  // Nuevos campos dinámicos mapeados desde mockData/DB
  duration?: number;
  is_treated?: boolean;
  status?: 'open' | 'closed' | 'pending';
}

type VotingStatus = 'PENDING' | 'OPEN' | 'CLOSED';

interface VotingStatusChangedPayload {
  questionId: string;
  status: VotingStatus;
  statusMessage?: string;
  color?: 'yellow' | 'green' | 'red';
  changedBy?: string;
  changedAt?: string;
}

export function CardAgenda({ assemblyId }: CardAgendaProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userRoles = (session?.user?.roles || []).map((role) => String(role).toLowerCase().trim());
  const isAdmin = userRoles.includes('admin') || userRoles.includes('administrador') || userRoles.includes('administrator');
  const userId = session?.user?.id || '';
  const userEmail = session?.user?.email || '';
  const participants = useParticipants();
  const [showAgenda, setShowAgenda] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentVote, setCurrentVote] = useState<any>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [statusActionByQuestion, setStatusActionByQuestion] = useState<Record<string, boolean>>({});
  
  
  // Attendance data for modals
  const [attendanceStats, setAttendanceStats] = useState({
    coefficient: 0,
    quorum: 0,
    presentes: 0,
    ausentes: 0,
    citados: 0,
  });

  const FALLBACK_PROXY_FILE_ID = '00000000-0000-0000-0000-000000000000';
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  const SOCKET_NAMESPACE = process.env.NEXT_PUBLIC_SOCKET_NAMESPACE || '/qa';

  const normalizeText = (value: string): string => String(value || '').trim().toLowerCase();

  const normalizeVotingStatus = (status: any): VotingStatus => {
    const normalized = normalizeText(String(status || 'PENDING'));
    if (normalized === 'open' || normalized === 'active') return 'OPEN';
    if (normalized === 'closed' || normalized === 'votado') return 'CLOSED';
    return 'PENDING';
  };

  const statusColorClass = (status: VotingStatus): 'pending' | 'active' | 'closed' => {
    if (status === 'OPEN') return 'active';
    if (status === 'CLOSED') return 'closed';
    return 'pending';
  };

  const updateQuestionStatusLocal = (
    questionId: string,
    status: VotingStatus,
    statusMessage?: string
  ) => {
    setAgendaItems((prev) =>
      prev.map((agenda) => ({
        ...agenda,
        votingQuestions: agenda.votingQuestions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                status,
                status_message: statusMessage || question.status_message,
              }
            : question
        ),
      }))
    );

    setCurrentVote((prev: any) => {
      if (!prev || prev.questionId !== questionId) return prev;
      const statusInfo = getStatusInfo({ status, status_message: statusMessage });
      return {
        ...prev,
        questionStatus: status,
        status: statusInfo.label,
        statusStyle: statusInfo.style,
        statusMessage: statusInfo.statusMessage,
      };
    });
  };

  const getPersonId = (item: any): string => String(
    item?.userId ||
    item?.userid ||
    item?.user_id ||
    item?.authorId ||
    item?.author_id ||
    item?.user?.id ||
    item?.unit_assignment?.user?.id ||
    ''
  );

  const getPersonEmail = (item: any): string => String(
    item?.email ||
    item?.user_email ||
    item?.user?.email ||
    item?.unit_assignment?.user?.email ||
    ''
  );

  const getPersonName = (item: any): string => {
    const firstName = String(
      item?.first_name ||
      item?.user_first_name ||
      item?.user?.first_name ||
      item?.unit_assignment?.user?.first_name ||
      ''
    );
    const lastName = String(
      item?.last_name ||
      item?.user_last_name ||
      item?.user?.last_name ||
      item?.unit_assignment?.user?.last_name ||
      ''
    );
    return `${firstName} ${lastName}`.trim();
  };

  const getAttendanceId = (item: any): string => String(
    item?.id ||
    item?.assembly_attendance_id ||
    item?.assemblyAttendanceId ||
    item?.assembly_attendances_id ||
    item?.attendance_id ||
    ''
  );

  const getUnitAssignmentId = (item: any): string => String(
    item?.unit_assignments_id ||
    item?.unitAssignmentId ||
    item?.ua_id ||
    ''
  );

  const getCoefficientFromAttendance = (item: any): number => {
    const raw =
      item?.coefficient_at_voting ??
      item?.coefficient ??
      item?.u_coefficient ??
      item?.unit_assignment?.coefficient ??
      item?.unit_assignment?.unit?.coefficient ??
      0;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 0;
    return parsed;
  };

  const matchesCurrentUser = (item: any): boolean => {
    const itemId = getPersonId(item);
    const itemEmail = normalizeText(getPersonEmail(item));
    const itemName = normalizeText(getPersonName(item));

    const sameById = itemId && userId && itemId === String(userId);
    const sameByEmail = itemEmail && normalizeText(userEmail) && itemEmail === normalizeText(userEmail);
    const sameByName = itemName && normalizeText(userName) && itemName === normalizeText(userName);

    return Boolean(sameById || sameByEmail || sameByName);
  };

  const resolveAttendanceForVoting = async (): Promise<{ attendanceId: string; coefficientAtVoting: number }> => {
    if (!assemblyId) {
      return { attendanceId: '', coefficientAtVoting: 0 };
    }

    const attendeesResponse = await getAttendees(assemblyId);
    const attendees = Array.isArray(attendeesResponse?.data) ? attendeesResponse.data : [];
    const matchedAttendee = attendees.find((item: any) => matchesCurrentUser(item));

    if (matchedAttendee) {
      const existingAttendanceId = getAttendanceId(matchedAttendee);
      if (existingAttendanceId) {
        setAttendanceId(existingAttendanceId);
        return {
          attendanceId: existingAttendanceId,
          coefficientAtVoting: getCoefficientFromAttendance(matchedAttendee),
        };
      }
    }

    const citedResponse = await getCited(assemblyId);
    const cited = Array.isArray(citedResponse?.data) ? citedResponse.data : [];
    const matchedCited = cited.find((item: any) => matchesCurrentUser(item));

    if (!matchedCited) {
      return { attendanceId: '', coefficientAtVoting: 0 };
    }

    const unitAssignmentId = getUnitAssignmentId(matchedCited);
    if (!unitAssignmentId) {
      return { attendanceId: '', coefficientAtVoting: 0 };
    }

    const createdAttendance = await createAttendance({
      assemblies_id: assemblyId,
      unit_assignments_id: unitAssignmentId,
      arrival_at: new Date().toISOString(),
      is_present: true,
      proxy_file_id: FALLBACK_PROXY_FILE_ID,
      notes: 'Registro automático para votación en agenda',
    });

    const createdAttendanceId = String(createdAttendance?.data?.id || '');
    if (!createdAttendanceId) {
      return { attendanceId: '', coefficientAtVoting: 0 };
    }

    setAttendanceId(createdAttendanceId);

    return {
      attendanceId: createdAttendanceId,
      coefficientAtVoting: getCoefficientFromAttendance(matchedCited),
    };
  };

  const fetchAgendaData = async (showLoader = true) => {
    if (!assemblyId) {
      setAgendaItems([]);
      return;
    }

    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      // Fetch attendance stats in parallel
      const [quorumRes, coefficientRes] = await Promise.all([
        getQuorum(assemblyId),
        getCoefficient(assemblyId),
      ]);

      setAttendanceStats({
        coefficient: Number(coefficientRes.data?.total_coefficient || 0),
        quorum: Number(quorumRes.data?.current_quorum || 0),
        presentes: Number(quorumRes.data?.attendees_count || 0),
        ausentes: 0,
        citados: Number(quorumRes.data?.total_cited_count || quorumRes.data?.total_ph_count || 0),
      });

      // Fetch agenda items
      const agendaRes = await getAgendaByAssembly(assemblyId);
      const agendaData = Array.isArray(agendaRes?.data) ? agendaRes.data : [];

      // Fetch voting questions for all agenda items
      const votingRes = await getVotingQuestionsByAssembly(assemblyId);
      const votingQuestions = Array.isArray(votingRes?.data) ? votingRes.data : [];

      // Group voting questions by agenda_id
      const questionsByAgenda = votingQuestions.reduce((acc, q) => {
        if (!acc[q.agenda_id]) {
          acc[q.agenda_id] = [];
        }
        acc[q.agenda_id].push(q);
        return acc;
      }, {} as Record<string, any[]>);

      // Fetch options for each voting question
      const optionsByQuestion: Record<string, any[]> = {};
      for (const q of votingQuestions) {
        const qId = q?.id;
        if (!qId) continue;

        try {
          const optionsRes = await getOptionsByVotingQuestion(qId);
          optionsByQuestion[qId] = Array.isArray(optionsRes?.data) ? optionsRes.data : [];
        } catch {
          optionsByQuestion[qId] = [];
        }
      }

      // Build agenda with questions
      const agendaWithQuestions: AgendaWithQuestions[] = agendaData
        .map((item: any) => ({
          ...item,
          id: item?.id || '',
          votingQuestions: questionsByAgenda[item?.id || ''] || [],
          options: optionsByQuestion,
        }))
        .filter((item: any) => item?.id);

      setAgendaItems(agendaWithQuestions);
    } catch (err) {
      console.error('Error fetching agenda data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar agenda');
      setAgendaItems([]);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  // Fetch agenda items and voting data
  useEffect(() => {
    void fetchAgendaData(true);
  }, [assemblyId]);

  // Get status label and style
  const getStatusInfo = (question: any) => {
    const status = normalizeVotingStatus(question?.status);
    const statusMessage = String(question?.status_message || question?.statusMessage || '').trim();

    switch (status) {
      case 'CLOSED':
        return { label: 'Votación cerrada', style: 'closed', statusMessage };
      case 'OPEN':
        return { label: 'Votación abierta', style: 'active', statusMessage };
      case 'PENDING':
      default:
        return { label: 'Votación pendiente', style: 'pending', statusMessage };
    }
  };

  const handleAdminStatusAction = async (
    questionId: string,
    action: 'open' | 'close'
  ) => {
    if (!isAdmin) return;

    setStatusActionByQuestion((prev) => ({ ...prev, [questionId]: true }));

    try {
      if (action === 'open') {
        const response = await openVotingQuestion(questionId, 'Votación abierta por el administrador');
        const nextStatus = normalizeVotingStatus(response?.data?.status || 'OPEN');
        updateQuestionStatusLocal(questionId, nextStatus, 'Votación abierta por el administrador');
      } else {
        const response = await closeVotingQuestion(questionId, 'Votación cerrada por el administrador');
        const nextStatus = normalizeVotingStatus(response?.data?.status || 'CLOSED');
        updateQuestionStatusLocal(questionId, nextStatus, 'Votación cerrada por el administrador');
      }

      await fetchAgendaData(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado de la votación');
    } finally {
      setStatusActionByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  useEffect(() => {
    if (!assemblyId) return;

    const socket: Socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      query: {
        assemblyId,
        userName,
        userId: userId || '',
        userRole: isAdmin ? 'admin' : 'participant',
      },
      transports: ['websocket'],
      reconnection: true,
    });

    socket.emit('join_assembly', {
      assemblyId,
      userName,
      userId,
      userRole: isAdmin ? 'admin' : 'participant',
    });

    socket.on('voting_status_changed', (payload: VotingStatusChangedPayload) => {
      if (!payload?.questionId || !payload?.status) return;
      const nextStatus = normalizeVotingStatus(payload.status);
      updateQuestionStatusLocal(payload.questionId, nextStatus, payload.statusMessage);
    });

    return () => {
      socket.emit('leave_assembly', { assemblyId });
      socket.disconnect();
    };
  }, [assemblyId, userName, userId, isAdmin]);

  // Handle vote button click
  const handleVoteClick = (agendaItem: AgendaWithQuestions, question: any) => {
    const options = agendaItem.options[question.id] || [];
    const statusInfo = getStatusInfo(question);
    const normalizedStatus = normalizeVotingStatus(question.status);

    // Regla de quórum requerida del punto o 50% por defecto
    const tieneQuorum = attendanceStats.quorum >= (agendaItem.required_quorum || 50);

    setCurrentVote({
      agendaItemId: agendaItem.id,
      questionId: question.id,
      title: question.question_text,
      description: question.description,
      questionStatus: normalizedStatus,
      status: statusInfo.label,
      statusStyle: statusInfo.style,
      statusMessage: statusInfo.statusMessage,
      isVotable: agendaItem.is_votable && question.status !== 'closed',
      tieneQuorum: tieneQuorum, // Pasar estado de quórum al modal
      options: options.map((opt, idx) => ({
        id: opt.id,
        name: opt.option_text,
        votes: 0,
        percent: 0,
      })),
      stats: {
        presentes: attendanceStats.presentes,
        quorum: attendanceStats.quorum,
        coeficiente: attendanceStats.coefficient,
      },
    });
    setSelectedOption(null);
    setShowVoteModal(true);
  };

  // Handle results button click
  const handleResultsClick = async (agendaItem: AgendaWithQuestions, question: any) => {
    try {
      const resultsRes = await getResultsByQuestion(question.id);
      const resultsData = resultsRes?.data;
      const statusInfo = getStatusInfo(question);

      setCurrentVote({
        agendaItemId: agendaItem.id,
        questionId: question.id,
        title: resultsData?.question_text || question.question_text,
        description: question.description,
        status: statusInfo.label,
        statusStyle: statusInfo.style,
        options: (resultsData?.options || []).map((opt: any) => {
          return {
            id: opt.option_id,
            name: opt.option_text,
            votes: Number(opt.votes_count || 0),
            percent: Number(opt.percentage || 0),
            coefficient_total: Number(opt.coefficient_total || 0),
          };
        }),
        votesMatrix: [], // Would need detailed vote data
        stats: {
          presentes: attendanceStats.presentes,
          ausentes: Math.max(attendanceStats.citados - attendanceStats.presentes, 0),
          citados: attendanceStats.citados,
          coeficiente: attendanceStats.coefficient,
          quorum: attendanceStats.quorum,
          totalVotes: Number(resultsData?.total_votes || 0),
        },
      });
      setShowResultsModal(true);
    } catch (err) {
      console.error('Error fetching vote results:', err);
    }
  };

  return (
    <>
      <div className={styles["sidebar-content"]}>
        <div className={styles["info-card"]}>
          <div
            className={styles["info-card-header"]}
            onClick={() => setShowAgenda(!showAgenda)}
          >
            <div className={styles["info-card-title"]}>
              <div className={styles["info-card-icon icon-agenda"]}>
                <FileText size={20} color="white" />
              </div>
              <span>Orden del día ({agendaItems.length})</span>
            </div>
            {showAgenda ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {showAgenda && (
            <div className={styles["card-seccion-order"]}>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Cargando agenda...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : agendaItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No hay puntos en la agenda</div>
              ) : (
                agendaItems.map((agendaItem, agendaIdx) => {
                  // Evaluar si el punto completo de la agenda está cerrado
                  const esPuntoCerrado = normalizeVotingStatus(agendaItem.status) === 'CLOSED';
                  const questionStatuses = agendaItem.votingQuestions.map((question) =>
                    normalizeVotingStatus(question.status)
                  );
                  const hasOpenQuestion = questionStatuses.includes('OPEN');
                  const hasPendingQuestion = questionStatuses.includes('PENDING');
                  const hasVotingQuestions = agendaItem.votingQuestions.length > 0;
                  const markerClass = hasVotingQuestions
                    ? hasOpenQuestion
                      ? 'agenda-number-open'
                      : hasPendingQuestion
                      ? 'agenda-number-pending'
                      : 'agenda-number-closed'
                    : 'agenda-number-text';
                  const itemStateClass = hasVotingQuestions
                    ? hasOpenQuestion
                      ? 'agenda-item-open'
                      : hasPendingQuestion
                      ? 'agenda-item-pending'
                      : 'agenda-item-closed'
                    : 'agenda-item-text';
                  return(
                  
                  <div key={agendaItem.id} className={`${styles["agenda-item"]} ${styles[itemStateClass]}${esPuntoCerrado ? ` ${styles["item-closed"]}` : ""}`}
                  style={esPuntoCerrado ? { opacity: 0.8 } : {}}
                  >
                    {/* Header */}
                    <div className={styles["agenda-header"]}>
                      <div
                        className={`${styles["agenda-number"]} ${styles[markerClass]}`}
                        title={hasVotingQuestions ? 'Punto con votación' : 'Punto informativo'}
                      />
                      <div className={styles["agenda-details"]}>
                        <div className={styles["agenda-point-row"]}>
                          <div className={styles["agenda-title-text"]}>PUNTO {agendaIdx + 1}</div>
                        </div>
                        <div className={styles["agenda-main-title"]}>
                          {agendaItem.title}
                        </div>

                        {agendaItem.votingQuestions.length > 0 ? (
                          agendaItem.votingQuestions.map((question) => {
                            const statusInfo = getStatusInfo(question);
                            return (
                              <div 
                                key={question.id} 
                                className={`${styles["agenda-status"]} ${styles[statusInfo.style]} ${styles["agenda-status-chip"]}`}
                              >
                                ● {statusInfo.label}
                              </div>
                            );
                          })
                        ) : (
                          <div className={`${styles["agenda-status"]} ${styles["pending"]}`}>
                            ● Sin votación
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Voting options for each question */}
                    {agendaItem.votingQuestions.map((question) => {
                      const options = agendaItem.options[question.id] || [];
                      const statusInfo = getStatusInfo(question);
                      const normalizedQuestionStatus = normalizeVotingStatus(question.status);
                      const isStatusActionLoading = Boolean(statusActionByQuestion[question.id]);
                      const isVotable = agendaItem.is_votable;
                      const tieneQuorum = attendanceStats.quorum >= (agendaItem.required_quorum || 50);
                      const canVoteNow = isVotable && !esPuntoCerrado && tieneQuorum && normalizedQuestionStatus === 'OPEN';

                      return (
                        <div key={question.id} className={styles["voting-options"]}>
                          <div className={styles["voting-question-row"]}>
                            <div className={styles["voting-label"]}>
                              {question.question_text}
                            </div>
                            {isAdmin ? (
                              <div className={styles["voting-question-actions"]}>
                                <button
                                  className={`${styles["admin-status-btn"]} ${styles["admin-status-open"]} ${
                                    normalizedQuestionStatus === 'OPEN' ? styles["admin-status-selected"] : ''
                                  }`}
                                  disabled={isStatusActionLoading}
                                  onClick={() => handleAdminStatusAction(question.id, 'open')}
                                >
                                  Abrir
                                </button>
                                <button
                                  className={`${styles["admin-status-btn"]} ${styles["admin-status-close"]} ${
                                    normalizedQuestionStatus === 'CLOSED' ? styles["admin-status-selected"] : ''
                                  }`}
                                  disabled={isStatusActionLoading}
                                  onClick={() => handleAdminStatusAction(question.id, 'close')}
                                >
                                  Cerrar
                                </button>
                              </div>
                            ) : null}
                          </div>
                         {options.map((option) => (
                          
                              <div 
                                key={option.id} 
                                className={styles["option-item"]}>
                                <div className={styles["option-radio"]}></div>
                                <div className={styles["option-name"]}>{option.option_text}</div>
                                <div className={styles["option-votes"]}>-</div>
                              </div>
                         ))} 
                          {isVotable && (
                            <div className={styles["action-buttons"]}>
                              <button
                                className={styles["btn-vote"]}
                                disabled={!canVoteNow || isSubmittingVote}
                                style={!canVoteNow || isSubmittingVote ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                onClick={() => handleVoteClick(agendaItem, question)}
                              >
                                {esPuntoCerrado
                                  ? 'Punto cerrado'
                                  : !tieneQuorum
                                  ? 'Sin quórum'
                                  : normalizedQuestionStatus !== 'OPEN'
                                  ? 'Votación no abierta'
                                  : isSubmittingVote
                                  ? 'Enviando...'
                                  : 'Votar'}
                              </button>
                              <button
                                className={styles["btn-view"]}
                                onClick={() => handleResultsClick(agendaItem, question)}
                              >
                                Ver votos
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* If no voting questions but is votable */}
                    {agendaItem.votingQuestions.length === 0 && agendaItem.is_votable && (
                      <div className={styles["action-buttons"]}>
                        <button className={styles["btn-vote"]} disabled>
                          Sin preguntas de votación
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA VOTAR */}
      {showVoteModal && currentVote && (
        <div className={styles["vote-modal-overlay"]} onClick={() => setShowVoteModal(false)}>
          <div className={styles["vote-modal"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["vote-header"]}>
              <div className={styles["vote-status"]}>
                <span
                  className={styles["status-dot-green"]}
                  style={{
                    background:
                      currentVote.statusStyle === 'active'
                        ? '#22c55e'
                        : currentVote.statusStyle === 'closed'
                        ? '#ef4444'
                        : '#f59e0b',
                  }}
                ></span>
                {currentVote.status}
              </div>
              <h3>{currentVote.title}</h3>
              {currentVote.statusMessage ? (
                <p style={{ marginTop: '0.4rem', color: '#666', fontSize: '0.85rem' }}>{currentVote.statusMessage}</p>
              ) : null}
            </div>

            {/* SECCIÓN DE ASISTENCIA */}
            <div className={styles["vote-attendance-section"]}>
              <div className={styles["vote-attendance-header"]}>
                <span>Asistencia</span>
              </div>
              <div className={`${styles["attendance-grid"]} ${styles["attendance-votos"]}`}>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Coeficiente</div>
                  <div className={styles["attendance-value"]}>{currentVote.stats.coeficiente}%</div>
                </div>
                <div className={styles["attendance-item"]}>
                  <div className={styles["attendance-label"]}>Quorum</div>
                  <div className={`${styles["attendance-value"]} ${styles["quorum"]}`}>{currentVote.stats.quorum}%</div>
                </div>
              </div>
            </div>

            <div className={styles["vote-options"]}>
              {currentVote.options.map((opt: any, idx: number) => {
                const isSelected = selectedOption === opt.id;
                return(
                <div
                  className={`${styles["vote-option-item"]}${isSelected ? styles["selected"] : ""}`}
                  key={idx}
                  onClick={() => setSelectedOption(opt.id)}
                 /*onClick={() => currentVote.tieneQuorum && setSelectedOption(opt.id)}*/
                  /*style={!currentVote.tieneQuorum ? { cursor: 'not-allowed', opacity: 0.7 } : {}}*/
                >
                  <div className={styles["vote-radio"]}></div>
                  <div className={styles["vote-option-name"]}>{opt.name}</div>
                </div>
                );
              })}
            </div>


            <div className={styles["vote-actions"]}>
              <button
                className={styles["vote-cancel"]}
                onClick={() => setShowVoteModal(false)}
              >
                Cancelar
              </button>
              <button
                className={styles["vote-submit"]}
                disabled={!selectedOption || isSubmittingVote}
                onClick={async () => {
                  if (!selectedOption || !currentVote?.questionId || !assemblyId) return;

                  if (normalizeVotingStatus(currentVote.questionStatus) !== 'OPEN') {
                    alert('La votación no está abierta.');
                    await fetchAgendaData(false);
                    return;
                  }

                  setIsSubmittingVote(true);
                  try {
                    const attendanceData = await resolveAttendanceForVoting();
                    const resolvedAttendanceId = attendanceData.attendanceId || attendanceId || '';

                    if (!resolvedAttendanceId) {
                      alert('No se pudo identificar tu asistencia para registrar el voto.');
                      return;
                    }

                    await createVote({
                      voting_questions_id: currentVote.questionId,
                      questions_options_id: selectedOption,
                      assembly_attendances_id: resolvedAttendanceId,
                      coefficient_at_voting: Number(attendanceData.coefficientAtVoting || attendanceStats.coefficient || 0),
                    });

                    setShowVoteModal(false);
                    setSelectedOption(null);
                    await fetchAgendaData(false);
                    alert('Voto registrado exitosamente.');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Error al registrar el voto';
                    if (normalizeText(message).includes('ya registró un voto')) {
                      alert('Ya registraste tu voto para esta pregunta.');
                    } else if (normalizeText(message).includes('no está abierta')) {
                      alert('La votación no está abierta.');
                      await fetchAgendaData(false);
                    } else {
                      alert(message);
                    }
                  } finally {
                    setIsSubmittingVote(false);
                  }
                }}
              >
                {isSubmittingVote ? 'Enviando...' : 'Votar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA VER RESULTADOS */}
      {showResultsModal && currentVote && (
        <div className={styles["results-modal-overlay"]} onClick={() => setShowResultsModal(false)}>
          <div className={styles["results-modal"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["results-header"]}>
              <div
                className={styles["results-status"]}
                style={{
                  color:
                    currentVote.statusStyle === 'active'
                      ? '#22c55e'
                      : currentVote.statusStyle === 'closed'
                      ? '#ef4444'
                      : '#f59e0b',
                }}
              >
                <span
                  className={styles["results-status-dot"]}
                  style={{
                    background:
                      currentVote.statusStyle === 'active'
                        ? '#22c55e'
                        : currentVote.statusStyle === 'closed'
                        ? '#ef4444'
                        : '#f59e0b',
                  }}
                ></span>
                {currentVote.status}
              </div>
              <div className={styles["results-title"]}>{currentVote.title}</div>
              {currentVote.statusMessage ? (
                <p style={{ marginBottom: '0.7rem', color: '#666', fontSize: '0.85rem' }}>{currentVote.statusMessage}</p>
              ) : null}

              {/* SECCIÓN DE ASISTENCIA */}
              <div className={styles["results-attendance-section"]}>
                <div className={styles["results-attendance-header"]}>
                  <span>Asistencia</span>
                </div>
                <div className={styles["attendance-grid"]}>
                  <div className={styles["attendance-item"]}>
                    <div className={styles["attendance-label"]}>Presentes</div>
                    <div className={styles["attendance-value"]}>{currentVote.stats.presentes}</div>
                  </div>
                  <div className={styles["attendance-item"]}>
                    <div className={styles["attendance-label"]}>Ausentes</div>
                    <div className={styles["attendance-value"]}>{currentVote.stats.ausentes}</div>
                  </div>
                  <div className={styles["attendance-item"]}>
                    <div className={styles["attendance-label"]}>Citados</div>
                    <div className={styles["attendance-value"]}>{currentVote.stats.citados}</div>
                  </div>
                  <div className={styles["attendance-item"]}>
                    <div className={styles["attendance-label"]}>Coeficiente</div>
                    <div className={styles["attendance-value"]}>{currentVote.stats.coeficiente}%</div>
                  </div>
                  <div className={styles["attendance-item"]}>
                    <div className={styles["attendance-label"]}>Quorum</div>
                    <div className={`${styles["attendance-value"]} ${styles["quorum"]}`}>{currentVote.stats.quorum}%</div>
                  </div>
                </div>
              </div>

              <div className={styles["results-link"]}>
                <a href="#">Ver Reporte</a>
              </div>
            </div>

            <div className={styles["results-table"]}>
              <div className={styles["results-table-header"]}>
                <span>Opción</span>
                <span># Votos</span>
                <span>% Coeficiente</span>
              </div>

              {currentVote.options.map((opt: any, idx: number) => (
                <div className={styles["results-row"]} key={idx}>
                  <div className={styles["results-option-name"]}>
                    <span className={styles["results-radio-dot"]}></span>
                    {opt.name}
                  </div>
                  <div className={styles["results-votes"]}>{opt.votes}</div>
                  <div className={styles["results-percentage"]}>
                    <span className={styles["results-percentage-text"]}>{opt.percent}%</span>
                    <div className={styles["results-bar"]}>
                      <div
                        className={styles["results-bar-fill"]}
                        style={{ width: `${opt.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles["results-tabs"]}>
              <button className={`${styles["results-tab"]} ${styles["active"]}`}>Voto realizado</button>
              <button className={styles["results-tab"]}>Votos no realizados</button>
            </div>

            {currentVote.votesMatrix && currentVote.votesMatrix.length > 0 && (
              <div className={styles["results-matrix"]}>
                <div className={styles["matrix-header-cell"]}></div>
                {[...Array(10)].map((_, i) => (
                  <div className={styles["matrix-header-cell"]} key={i}>
                    {String(i + 1).padStart(3, '0')}
                  </div>
                ))}

                {currentVote.votesMatrix.map((row: boolean[], rowIdx: number) => (
                  <Fragment key={`row-group-${rowIdx}`}>
                    <div className={styles["matrix-header-cell"]} key={`row-${rowIdx}`}>
                      {String(rowIdx + 1).padStart(3, '0')}
                    </div>
                    {row.map((voted, colIdx) => (
                      <div
                        className={`${styles["matrix-cell"]} ${voted ? styles['voted'] : ''}`}
                        key={`${rowIdx}-${colIdx}`}
                      />
                    ))}
                  </Fragment>
                ))}
              </div>
            )}

            <button
              className={styles["results-close"]}
              onClick={() => setShowResultsModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
