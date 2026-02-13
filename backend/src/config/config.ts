import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  connectionString: string;
}

const config: Config = {
  port: parseInt(process.env.PORT ?? "3000"),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  connectionString: process.env.DATABASE_URL ?? ""
};

export default config;