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

export default db;