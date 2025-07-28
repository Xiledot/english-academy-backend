import { Pool } from 'pg';

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://hanny@localhost:5432/english_academy',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
});

export default pool; 