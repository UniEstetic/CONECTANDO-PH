const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreateVotingQuestionDto {
  question_text: string;
  status: string;
  result_type: string;
  opened_at?: Date;
  closed_at?: Date | null;
}

export interface VotingQuestion {
  id: string;
  question_text: string;
  status: string;
  result_type: string;
  opened_at: Date;
  closed_at: Date | null;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

// Crear pregunta de votación
export async function createVotingQuestion(
  dto: CreateVotingQuestionDto
): Promise<ApiResponse<VotingQuestion>> {
  const response = await fetch(`${API_URL}/voting-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Error al crear la pregunta de votación');
  }

  return response.json();
}

// Obtener todas las preguntas
export async function getVotingQuestions(
  where?: string
): Promise<VotingQuestion[]> {
  const url = new URL(`${API_URL}/voting-questions`);
  if (where) {
    url.searchParams.append('where', where);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Error al obtener las preguntas de votación');
  }

  return response.json();
}

// Actualizar pregunta
export async function updateVotingQuestion(
  id: string,
  dto: CreateVotingQuestionDto
): Promise<ApiResponse<VotingQuestion>> {
  const response = await fetch(`${API_URL}/voting-questions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar la pregunta de votación');
  }

  return response.json();
}

// Eliminar pregunta
export async function deleteVotingQuestion(
  id: string
): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_URL}/voting-questions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar la pregunta de votación');
  }

  return response.json();
}