import { Pool } from 'pg';
import pool from '../config/database';

export interface PersonalMemo {
  id?: number;
  user_id: number;
  target_date: string;
  content: string;
  updated_at?: string;
}

// 날짜별 개인 메모 조회
export const getMemoByDate = async (userId: number, targetDate: string): Promise<PersonalMemo | null> => {
  try {
    const query = `
      SELECT * FROM personal_memos 
      WHERE user_id = $1 AND DATE(target_date) = DATE($2)
    `;
    const result = await pool.query(query, [userId, targetDate]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('날짜별 메모 조회 오류:', error);
    throw error;
  }
};

// 사용자의 모든 메모 조회
export const getAllMemos = async (userId: number): Promise<PersonalMemo[]> => {
  try {
    const query = `
      SELECT * FROM personal_memos 
      WHERE user_id = $1
      ORDER BY target_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('모든 메모 조회 오류:', error);
    throw error;
  }
};

// 특정 메모 조회
export const getMemoById = async (id: number): Promise<PersonalMemo | null> => {
  try {
    const query = 'SELECT * FROM personal_memos WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('메모 조회 오류:', error);
    throw error;
  }
};

// 새 메모 생성
export const createMemo = async (memo: Omit<PersonalMemo, 'id' | 'updated_at'>): Promise<PersonalMemo> => {
  try {
    const query = `
      INSERT INTO personal_memos (user_id, target_date, content)
      VALUES ($1, DATE($2), $3)
      RETURNING *
    `;
    
    const values = [memo.user_id, memo.target_date, memo.content];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('메모 생성 오류:', error);
    throw error;
  }
};

// 메모 수정 또는 생성 (Upsert)
export const upsertMemo = async (userId: number, targetDate: string, content: string): Promise<PersonalMemo> => {
  try {
    const query = `
      INSERT INTO personal_memos (user_id, target_date, content)
      VALUES ($1, DATE($2), $3)
      ON CONFLICT (user_id, target_date) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [userId, targetDate, content];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('메모 업서트 오류:', error);
    throw error;
  }
};

// 메모 수정
export const updateMemo = async (id: number, content: string): Promise<PersonalMemo | null> => {
  try {
    const query = `
      UPDATE personal_memos 
      SET content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [content, id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('메모 수정 오류:', error);
    throw error;
  }
};

// 메모 삭제
export const deleteMemo = async (id: number): Promise<boolean> => {
  try {
    const query = 'DELETE FROM personal_memos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('메모 삭제 오류:', error);
    throw error;
  }
}; 