
export interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  comments: Comment[];
}

export interface Bio {
  name: string;
  description: string;
  imageUrl: string;
}
