import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  connectionString: string;
  sessionSecret: string;
  clientId: string
}

const config: Config = {
  port: parseInt(process.env.PORT ?? "3000"),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  connectionString: process.env.DATABASE_URL ?? "",
  clientSecret: process.env.CLIENT_SECRET ?? "",
  clientId: process.env.CLIENT_ID ?? ""
};

export default config;