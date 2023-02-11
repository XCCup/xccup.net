export interface Glider {
  id: string;
  brand: string;
  model: string;
  gliderClass: GliderClass;
  reynoldsClass?: boolean;
}

export interface GliderClass {
  key: string;
  description: string;
  shortDescription: string;
}
