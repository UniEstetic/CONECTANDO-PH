const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreateVoteDto {
  voting_questions_id: string;
  questions_options_id: string;
  coefficient_at_voting: number;
}

export interface Vote {
  id: string;
  voting_questions_id: string;
  questions_options_id: string;
  coefficient_at_voting: number;
  created_at: Date;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

// Crear voto
export async function createVote(dto: CreateVoteDto): Promise<ApiResponse<Vote>> {
  const response = await fetch(`${API_URL}/votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Error al crear el voto');
  }

  return response.json();
}

// Obtener todos los votos
export async function getVotes(where?: string): Promise<Vote[]> {
  const url = new URL(`${API_URL}/votes`);
  if (where) {
    url.searchParams.append('where', where);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Error al obtener los votos');
  }

  return response.json();
}

// Eliminar voto
export async function deleteVote(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_URL}/votes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el voto');
  }

  return response.json();
}