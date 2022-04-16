export interface Mail {
  toUserId: string;
  content: {
    title: string;
    text: string;
  };
}
