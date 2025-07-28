import { Pool } from 'pg';

// 데이터베이스 연결 설정
const pool = new Pool({
  user: 'hanny', // macOS 사용자명
  host: 'localhost',
  database: 'english_academy',
  password: '', // 기본적으로 비밀번호 없음
  port: 5432,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
});

export default pool; 