import Database from "@tauri-apps/plugin-sql";
import { Space } from "./state";

export class AppData {
  constructor(private database: Database) { }

  public static async load(): Promise<AppData> {
    const db = await Database.load("sqlite:app.db");

    return new AppData(db);
  }

  public async getSpaces(): Promise<Space[]> {
    const result: Space[] = await this.database.select("SELECT * FROM spaces;");

    return result;
  }

  public async getSpaceById(id: number): Promise<Space> {
    console.log("get id:", id);
    const result: Space[] = await this.database.select("SELECT * FROM spaces WHERE id = $1 LIMIT 1", [id]);

    return result[0];
  }

  public async createSpace(name: string, path: string, color: string): Promise<void> {
    await this.database.execute("INSERT INTO spaces (name, path, color) VALUES ($1, $2, $3)", [name, path, color]);
  }
}
