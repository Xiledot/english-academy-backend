import { Pool } from 'pg';
import pool from '../config/database';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  category: '고정업무' | '임시업무' | '긴급업무';
  priority: '높음' | '보통' | '낮음';
  status: '미완료' | '진행중' | '완료' | '보류';
  assigned_type: '누구나' | '전인원' | '특정조교';
  assigned_to?: number;
  assigned_name?: string;
  is_recurring: boolean;
  recurring_type?: '매일' | '매주' | '매월' | '요일별';
  recurring_days?: string[];
  due_date?: string;
  target_date: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const query = `
      SELECT t.*, u.name as created_by_name 
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.target_date DESC, t.priority DESC, t.created_at DESC
    `;
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    }));
  } catch (error) {
    console.error('모든 업무 조회 오류:', error);
    throw error;
  }
};

export const getTaskById = async (id: number): Promise<Task | null> => {
  try {
    const query = `
      SELECT t.*, u.name as created_by_name 
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    };
  } catch (error) {
    console.error('업무 조회 오류:', error);
    throw error;
  }
};

export const getTasksByDate = async (targetDate: string): Promise<Task[]> => {
  try {
    const query = `
      SELECT t.*, u.name as created_by_name 
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.target_date = $1
      ORDER BY t.priority DESC, t.created_at DESC
    `;
    const result = await pool.query(query, [targetDate]);
    
    return result.rows.map(row => ({
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    }));
  } catch (error) {
    console.error('날짜별 업무 조회 오류:', error);
    throw error;
  }
};

export const getTasksByAssignee = async (assignedTo: number): Promise<Task[]> => {
  try {
    const query = `
      SELECT t.*, u.name as created_by_name 
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.assigned_to = $1 OR t.assigned_type IN ('누구나', '전인원')
      ORDER BY t.target_date DESC, t.priority DESC, t.created_at DESC
    `;
    const result = await pool.query(query, [assignedTo]);
    
    return result.rows.map(row => ({
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    }));
  } catch (error) {
    console.error('담당자별 업무 조회 오류:', error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
  try {
    const query = `
      INSERT INTO tasks (
        title, description, category, priority, status, assigned_type, 
        assigned_to, assigned_name, is_recurring, recurring_type, recurring_days,
        due_date, target_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      task.title,
      task.description,
      task.category,
      task.priority,
      task.status,
      task.assigned_type,
      task.assigned_to,
      task.assigned_name,
      task.is_recurring,
      task.recurring_type,
      task.recurring_days ? JSON.stringify(task.recurring_days) : null,
      task.due_date,
      task.target_date,
      task.created_by
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    };
  } catch (error) {
    console.error('업무 생성 오류:', error);
    throw error;
  }
};

export const updateTask = async (id: number, task: Partial<Task>): Promise<Task | null> => {
  try {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (task.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(task.title);
    }
    if (task.description !== undefined) {
      setClause.push(`description = $${paramCount++}`);
      values.push(task.description);
    }
    if (task.category !== undefined) {
      setClause.push(`category = $${paramCount++}`);
      values.push(task.category);
    }
    if (task.priority !== undefined) {
      setClause.push(`priority = $${paramCount++}`);
      values.push(task.priority);
    }
    if (task.status !== undefined) {
      setClause.push(`status = $${paramCount++}`);
      values.push(task.status);
      
      // 완료 상태로 변경될 때 completed_at 설정
      if (task.status === '완료') {
        setClause.push(`completed_at = NOW()`);
      } else {
        setClause.push(`completed_at = NULL`);
      }
    }
    if (task.assigned_type !== undefined) {
      setClause.push(`assigned_type = $${paramCount++}`);
      values.push(task.assigned_type);
    }
    if (task.assigned_to !== undefined) {
      setClause.push(`assigned_to = $${paramCount++}`);
      values.push(task.assigned_to);
    }
    if (task.assigned_name !== undefined) {
      setClause.push(`assigned_name = $${paramCount++}`);
      values.push(task.assigned_name);
    }
    if (task.is_recurring !== undefined) {
      setClause.push(`is_recurring = $${paramCount++}`);
      values.push(task.is_recurring);
    }
    if (task.recurring_type !== undefined) {
      setClause.push(`recurring_type = $${paramCount++}`);
      values.push(task.recurring_type);
    }
    if (task.recurring_days !== undefined) {
      setClause.push(`recurring_days = $${paramCount++}`);
      values.push(task.recurring_days ? JSON.stringify(task.recurring_days) : null);
    }
    if (task.due_date !== undefined) {
      setClause.push(`due_date = $${paramCount++}`);
      values.push(task.due_date);
    }
    if (task.target_date !== undefined) {
      setClause.push(`target_date = $${paramCount++}`);
      values.push(task.target_date);
    }

    if (setClause.length === 0) {
      throw new Error('수정할 필드가 없습니다.');
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE tasks 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    };
  } catch (error) {
    console.error('업무 수정 오류:', error);
    throw error;
  }
};

export const deleteTask = async (id: number): Promise<boolean> => {
  try {
    const query = 'DELETE FROM tasks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('업무 삭제 오류:', error);
    throw error;
  }
};

export const getTasksByStatus = async (status: string): Promise<Task[]> => {
  try {
    const query = `
      SELECT t.*, u.name as created_by_name 
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.status = $1
      ORDER BY t.target_date DESC, t.priority DESC, t.created_at DESC
    `;
    const result = await pool.query(query, [status]);
    
    return result.rows.map(row => ({
      ...row,
      recurring_days: row.recurring_days ? JSON.parse(row.recurring_days) : null
    }));
  } catch (error) {
    console.error('상태별 업무 조회 오류:', error);
    throw error;
  }
}; 