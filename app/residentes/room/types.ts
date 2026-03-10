// Tipo para los mensajes
export interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
  isRead: boolean;
  isModerator?: boolean;
  replyTo?: {
    author: string;
    text: string;
  };
}

// Tipo para peticiones de palabra
export interface WordRequest {
  id: string;
  name: string;
  apartment: string;
  tower: string;
  initials: string;
  time: string;
}
