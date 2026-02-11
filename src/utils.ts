function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) 
    throw new Error(`missing required environment variable: ${name}`);

  return value;
}



export const PROJECT_NAME           = getEnv('PROJECT_NAME');
export const PROJECT_HOME_URL       = getEnv('PROJECT_HOME_URL');

export const ACCENT_COLOR           = getEnv('ACCENT_COLOR');
export const FOREGROUND_COLOR       = getEnv('FOREGROUND_COLOR');
export const TINTED_ACCENT_COLOR    = getEnv('TINTED_ACCENT_COLOR');
export const DATA_URL               = getEnv('DATA_URL');

