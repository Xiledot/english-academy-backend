import { Pool } from 'pg';
import pool from '../config/database';

export interface Announcement {
  id?: number;
  target_date: string;
  title: string;
  content?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string; // 생성자 이름
}

// 날짜별 조례사항 조회
export const getAnnouncementsByDate = async (targetDate: string): Promise<Announcement[]> => {
  try {
    const query = `
      SELECT a.*, u.name as created_by_name 
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE DATE(a.target_date) = DATE($1)
      ORDER BY a.created_at ASC
    `;
    const result = await pool.query(query, [targetDate]);
    return result.rows;
  } catch (error) {
    console.error('날짜별 조례사항 조회 오류:', error);
    throw error;
  }
};

// 모든 조례사항 조회
export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const query = `
      SELECT a.*, u.name as created_by_name 
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.target_date DESC, a.created_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('모든 조례사항 조회 오류:', error);
    throw error;
  }
};

// 특정 조례사항 조회
export const getAnnouncementById = async (id: number): Promise<Announcement | null> => {
  try {
    const query = `
      SELECT a.*, u.name as created_by_name 
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('조례사항 조회 오류:', error);
    throw error;
  }
};

// 새 조례사항 생성
export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> => {
  try {
    const query = `
      INSERT INTO announcements (
        target_date, title, content, created_by
      ) VALUES (DATE($1), $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      announcement.target_date,
      announcement.title,
      announcement.content,
      announcement.created_by
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('조례사항 생성 오류:', error);
    throw error;
  }
};

// 조례사항 수정
export const updateAnnouncement = async (id: number, announcement: Partial<Announcement>): Promise<Announcement | null> => {
  try {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (announcement.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(announcement.title);
    }
    if (announcement.content !== undefined) {
      setClause.push(`content = $${paramCount++}`);
      values.push(announcement.content);
    }
    if (announcement.target_date !== undefined) {
      setClause.push(`target_date = DATE($${paramCount++})`);
      values.push(announcement.target_date);
    }

    if (setClause.length === 0) {
      throw new Error('수정할 필드가 없습니다.');
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE announcements 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('조례사항 수정 오류:', error);
    throw error;
  }
};

// 조례사항 삭제
export const deleteAnnouncement = async (id: number): Promise<boolean> => {
  try {
    const query = 'DELETE FROM announcements WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('조례사항 삭제 오류:', error);
    throw error;
  }
}; 