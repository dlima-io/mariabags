export interface Configuracion {
  clave: string;
  valor: string;
  updated_at: Date;
}

export interface CreateConfiguracionDTO {
  clave: string;
  valor: string;
}

export interface UpdateConfiguracionDTO {
  valor: string;
}
