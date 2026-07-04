/**
 * Neon データベース接続。
 * @neondatabase/serverless を使い、Edge/Serverless 環境で動作する。
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
