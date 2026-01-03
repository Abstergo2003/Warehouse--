import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  host: 'db', // nazwa usługi z docker-compose
  port: 5432,
  database: 'mydb',
  username: 'myuser',
  password: 'mypassword',
});

export default sql;