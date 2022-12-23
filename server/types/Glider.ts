export interface Glider {
  id: string;
  brand: string;
  model: string;
  gliderClass: {
    key: string;
    shortDescription: string;
    description?: string;
  };
}
