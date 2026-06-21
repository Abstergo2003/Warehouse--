import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  // Opcjonalnie: Limit połączeń dla deweloperki, żeby nie zatykać bazy
  max: process.env.NODE_ENV === 'production' ? 50 : 10,
  idle_timeout: 20, // Zamknij połączenie jeśli nieużywane przez 20s
});

// Deklarujemy typ dla zmiennej globalnej, aby TypeScript nie krzyczał
declare global {
  var sqlGlobal: ReturnType<typeof postgres> | undefined;
}

// Singleton: Sprawdzamy czy połączenie już istnieje w globalnym scope
let db: ReturnType<typeof postgres>;

if (process.env.NODE_ENV === 'production') {
  db = sql;
} else {
  if (!global.sqlGlobal) {
    global.sqlGlobal = sql;
  }
  db = global.sqlGlobal;
}

// Asynchroniczna migracja bazy danych dla nowej kolumny 'status' użytkownika
async function runMigrations() {
  try {
    // Dodajemy kolumnę 'status' jako nullable
    await db.unsafe(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20);
    `);
    
    // Ustawiamy status wszystkich istniejących użytkowników na 'approved'
    await db.unsafe(`
      UPDATE users SET status = 'approved' WHERE status IS NULL;
    `);
    
    // Ustawiamy domyślny status 'pending' dla nowych i oznaczamy NOT NULL
    await db.unsafe(`
      ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending';
      ALTER TABLE users ALTER COLUMN status SET NOT NULL;
    `);
    console.log("✅ Database migrations for 'status' user column completed successfully.");
  } catch (error) {
    console.error("❌ Database migration error:", error);
  }
}

// Uruchamiamy migrację w tle przy imporcie bazy danych
runMigrations();

export default db;