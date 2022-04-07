export interface CreateNews {
  title: string;
  message: string;
  from: string;
  till: string;
  icon: string;
}

export interface News extends CreateNews {
  id: string;
}
