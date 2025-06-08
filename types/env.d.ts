declare namespace NodeJS {
  interface ProcessEnv {
    GLM_API_KEY: string
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_VERCEL_URL?: string
  }
} 