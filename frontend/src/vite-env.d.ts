/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_WHATSAPP_DEFAULT_MESSAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
