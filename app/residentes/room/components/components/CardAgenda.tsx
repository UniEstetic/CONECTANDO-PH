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

import { useSession } from "next-auth/react";
import styles from '@/app/ui/styles/roomResidentes.module.css';
import { getByAssembly as getAgendaByAssembly } from "@/app/services/agenda.service";
import { getByAssembly as getVotingQuestionsByAssembly } from "@/app/services/voting-questions.service";
import { getByVotingQuestion as getOptionsByVotingQuestion } from "@/app/services/question-options.service";
import { getByVotingQuestion as getVotesByVotingQuestion } from "@/app/services/votes.service";
import { getQuorum, getCoefficient } from "@/app/services/assemblies.service";

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
}

export function CardAgenda({ assemblyId }: CardAgendaProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const participants = useParticipants();
  const [showAgenda, setShowAgenda] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentVote, setCurrentVote] = useState<any>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Attendance data for modals
  const [attendanceStats, setAttendanceStats] = useState({
    coefficient: 0,
    quorum: 0,
    presentes: 0,
    ausentes: 0,
    citados: 0,
  });

  // Fetch agenda items and voting data
  useEffect(() => {
    const fetchAgendaData = async () => {
      if (!assemblyId) {
        setAgendaItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch attendance stats in parallel
        const [quorumRes, coefficientRes] = await Promise.all([
          getQuorum(assemblyId),
          getCoefficient(assemblyId),
        ]);

        setAttendanceStats({
          coefficient: coefficientRes.data?.total_coefficient || 0,
          quorum: quorumRes.data?.current_quorum || 0,
          presentes: quorumRes.data?.attendees_count || 0,
          ausentes: 0, // Will be calculated
          citados: quorumRes.data?.total_ph_coefficient || 0,
        });

        // Fetch agenda items
        const agendaRes = await getAgendaByAssembly(assemblyId);
        const agendaData = agendaRes.data || [];

        // Fetch voting questions for all agenda items
        const votingRes = await getVotingQuestionsByAssembly(assemblyId);
        const votingQuestions = votingRes.data || [];

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
          if (qId) {
            try {
              const optionsRes = await getOptionsByVotingQuestion(qId);
              optionsByQuestion[qId] = optionsRes.data || [];
            } catch {
              optionsByQuestion[qId] = [];
            }
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
        setIsLoading(false);
      }
    };

    fetchAgendaData();
  }, [assemblyId]);

  // Get status label and style
  const getStatusInfo = (question: any) => {
    switch (question.status) {
      case 'closed':
        return { label: 'Votación cerrada', style: 'closed' };
      case 'open':
      case 'active':
        return { label: 'Votación en curso', style: 'active' };
      case 'pending':
      default:
        return { label: 'Votación a realizar', style: 'pending' };
    }
  };

  // Handle vote button click
  const handleVoteClick = (agendaItem: AgendaWithQuestions, question: any) => {
    const options = agendaItem.options[question.id] || [];
    const statusInfo = getStatusInfo(question);

    setCurrentVote({
      agendaItemId: agendaItem.id,
      questionId: question.id,
      title: question.question_text,
      description: question.description,
      status: statusInfo.label,
      statusStyle: statusInfo.style,
      isVotable: agendaItem.is_votable && question.status !== 'closed',
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
    setShowVoteModal(true);
  };

  // Handle results button click
  const handleResultsClick = async (agendaItem: AgendaWithQuestions, question: any) => {
    try {
      const options = agendaItem.options[question.id] || [];
      const votesRes = await getVotesByVotingQuestion(question.id);
      const votes: any[] = votesRes.data || [];
      const statusInfo = getStatusInfo(question);

      // Count votes per option
      const voteCounts: Record<string, number> = {};
      votes.forEach(v => {
        voteCounts[v.question_option_id] = (voteCounts[v.question_option_id] || 0) + 1;
      });

      const totalVotes = votes.length;

      setCurrentVote({
        agendaItemId: agendaItem.id,
        questionId: question.id,
        title: question.question_text,
        description: question.description,
        status: statusInfo.label,
        statusStyle: statusInfo.style,
        options: options.map((opt) => {
          const votes = voteCounts[opt.id] || 0;
          const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          return {
            id: opt.id,
            name: opt.option_text,
            votes,
            percent: parseFloat(percent.toFixed(2)),
          };
        }),
        votesMatrix: [], // Would need detailed vote data
        stats: {
          presentes: attendanceStats.presentes,
          ausentes: attendanceStats.citados - attendanceStats.presentes,
          citados: attendanceStats.citados,
          coeficiente: attendanceStats.coefficient,
          quorum: attendanceStats.quorum,
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
                agendaItems.map((agendaItem, agendaIdx) => (
                  <div key={agendaItem.id} className={styles["agenda-item"]}>
                    {/* Header */}
                    <div className={styles["agenda-header"]}>
                      <div className={styles["agenda-number"]}>
                        <span style={{ fontSize: "0.75rem", color: "#fff" }}>●</span>
                      </div>
                      <div className={styles["agenda-details"]}>
                        <div className={styles["agenda-title-text"]}>PUNTO {agendaIdx + 1}</div>
                        <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                          {agendaItem.title}
                        </div>
                        {agendaItem.votingQuestions.length > 0 ? (
                          agendaItem.votingQuestions.map((question) => {
                            const statusInfo = getStatusInfo(question);
                            return (
                              <div 
                                key={question.id} 
                                className={`${styles["agenda-status"]} ${styles[statusInfo.style]}`}
                              >
                                ● {statusInfo.label}: {question.question_text}
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
                      const isVotable = agendaItem.is_votable && question.status !== 'closed';

                      return (
                        <div key={question.id} className={styles["voting-options"]}>
                          <div className={styles["voting-label"]}>
                            {question.question_text}
                          </div>
                          {options.map((option, idx) => (
                            <div key={option.id} className={styles["option-item"]}>
                              <div className={styles["option-radio"]}></div>
                              <div className={styles["option-name"]}>{option.option_text}</div>
                              <div className={styles["option-votes"]}>-</div>
                            </div>
                          ))}
                          {isVotable && (
                            <div className={styles["action-buttons"]}>
                              <button
                                className={styles["btn-vote"]}
                                onClick={() => handleVoteClick(agendaItem, question)}
                              >
                                Votar
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
                ))
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
                <span className={styles["status-dot-green"]}></span>
                {currentVote.status}
              </div>
              <h3>{currentVote.title}</h3>
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
              {currentVote.options.map((opt: any, idx: number) => (
                <div
                  className={styles["vote-option-item"]}
                  key={idx}
                  onClick={() => {/* Aquí manejas la selección */ }}
                >
                  <div className={styles["vote-radio"]}></div>
                  <div className={styles["vote-option-name"]}>{opt.name}</div>
                </div>
              ))}
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
                onClick={() => {
                  // Aquí envías el voto
                  setShowVoteModal(false);
                }}
              >
                Votar
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
              <div className={styles["results-status"]}>
                <span className={styles["results-status-dot"]}></span>
                {currentVote.status}
              </div>
              <div className={styles["results-title"]}>{currentVote.title}</div>

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
