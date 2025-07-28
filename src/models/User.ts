import pool from '../config/database';

export interface User {
  id: number;
  name: string;
  role: 'director' | 'teacher' | 'assistant' | 'vice_director';
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  role: 'director' | 'teacher' | 'assistant' | 'vice_director';
  password_hash?: string;
}

export class UserModel {
  // 사용자 생성
  static async create(userData: CreateUserData): Promise<User> {
    const { name, role, password_hash } = userData;
    const query = `
      INSERT INTO users (name, role, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [name, role, password_hash];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 이름으로 사용자 찾기
  static async findByName(name: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  // ID로 사용자 찾기
  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // 모든 사용자 조회
  static async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // 사용자 역할 업데이트
  static async updateRole(id: number, role: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [role, id]);
    return result.rows[0] || null;
  }

  // 사용자 삭제
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
} 