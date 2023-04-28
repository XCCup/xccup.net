export interface Time {
  day: number;
  hour: number;
  minute: number;
  date: string;
}

export interface Variation {
  min: number;
  max: number;
}

export interface Wind {
  direction: number | string;
  speedKt: number;
  speedMps: number;
  gust: boolean;
  variableDirection: boolean;
  variation: Variation;
}

export interface Visibility {
  meters: number;
  feet: number;
  miles: number;
  kilometers: number;
}

export interface Temperature {
  celsius: number;
  fahrenheit: number;
}

export interface Dewpoint {
  celsius: number;
  fahrenheit: number;
}

export interface Altimeter {
  inches?: number;
  millibars?: number;
}

export interface Cloud {
  code: string;
  meaning: string;
  altitude: number;
  type?: any;
  typeMeaning?: any;
}

export interface METAR {
  type?: string;
  auto?: boolean;
  station?: string;
  time?: Time;
  wind?: Wind;
  correction?: boolean;
  nosig?: boolean;
  visibility?: Visibility;
  temperature?: Temperature;
  dewpoint?: Dewpoint;
  altimeter?: Altimeter;
  clouds?: Cloud[];
  runwayVisualRange?: any[];
  weather?: any[];
  cavok?: boolean;
  windshear?: any[];
  verticalVisibility?: any;
  recentWeather?: any[];
  remarks?: any;
}
