export interface Glider {
  id: string;
  brand: string;
  model: string;
  gliderClass: GliderClass;
}

export interface GliderClass {
  key: string;
  shortDescription: string;
}
