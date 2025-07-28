import { Pool } from 'pg';
import pool from '../config/database';

export interface TodoItem {
  id?: number;
  user_id: number;
  target_date: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: '높음' | '보통' | '낮음';
  sent_by?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  sent_by_name?: string; // 전송자 이름
}

// 날짜별 투두 목록 조회
export const getTodosByDate = async (userId: number, targetDate: string): Promise<TodoItem[]> => {
  try {
    const query = `
      SELECT t.*, u.name as sent_by_name 
      FROM todo_items t
      LEFT JOIN users u ON t.sent_by = u.id
      WHERE t.user_id = $1 AND DATE(t.target_date) = DATE($2)
      ORDER BY t.is_completed ASC, t.priority DESC, t.created_at ASC
    `;
    const result = await pool.query(query, [userId, targetDate]);
    return result.rows;
  } catch (error) {
    console.error('날짜별 투두 조회 오류:', error);
    throw error;
  }
};

// 모든 투두 조회 (사용자별)
export const getAllTodos = async (userId: number): Promise<TodoItem[]> => {
  try {
    const query = `
      SELECT t.*, u.name as sent_by_name 
      FROM todo_items t
      LEFT JOIN users u ON t.sent_by = u.id
      WHERE t.user_id = $1
      ORDER BY t.target_date DESC, t.is_completed ASC, t.priority DESC, t.created_at ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('모든 투두 조회 오류:', error);
    throw error;
  }
};

// 특정 투두 조회
export const getTodoById = async (id: number): Promise<TodoItem | null> => {
  try {
    const query = `
      SELECT t.*, u.name as sent_by_name 
      FROM todo_items t
      LEFT JOIN users u ON t.sent_by = u.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('투두 조회 오류:', error);
    throw error;
  }
};

// 새 투두 생성
export const createTodo = async (todo: Omit<TodoItem, 'id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<TodoItem> => {
  try {
    const query = `
      INSERT INTO todo_items (
        user_id, target_date, title, description, is_completed, priority, sent_by
      ) VALUES ($1, DATE($2), $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      todo.user_id,
      todo.target_date,
      todo.title,
      todo.description,
      todo.is_completed,
      todo.priority,
      todo.sent_by
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('투두 생성 오류:', error);
    throw error;
  }
};

// 투두 수정
export const updateTodo = async (id: number, todo: Partial<TodoItem>): Promise<TodoItem | null> => {
  try {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (todo.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(todo.title);
    }
    if (todo.description !== undefined) {
      setClause.push(`description = $${paramCount++}`);
      values.push(todo.description);
    }
    if (todo.is_completed !== undefined) {
      setClause.push(`is_completed = $${paramCount++}`);
      values.push(todo.is_completed);
      
      // 완료 상태로 변경될 때 completed_at 설정
      if (todo.is_completed) {
        setClause.push(`completed_at = NOW()`);
      } else {
        setClause.push(`completed_at = NULL`);
      }
    }
    if (todo.priority !== undefined) {
      setClause.push(`priority = $${paramCount++}`);
      values.push(todo.priority);
    }
    if (todo.target_date !== undefined) {
      setClause.push(`target_date = DATE($${paramCount++})`);
      values.push(todo.target_date);
    }

    if (setClause.length === 0) {
      throw new Error('수정할 필드가 없습니다.');
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE todo_items 
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
    console.error('투두 수정 오류:', error);
    throw error;
  }
};

// 투두 삭제
export const deleteTodo = async (id: number): Promise<boolean> => {
  try {
    const query = 'DELETE FROM todo_items WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('투두 삭제 오류:', error);
    throw error;
  }
};

// 투두 상태 토글 (완료/미완료)
export const toggleTodoStatus = async (id: number): Promise<TodoItem | null> => {
  try {
    const query = `
      UPDATE todo_items 
      SET 
        is_completed = NOT is_completed,
        completed_at = CASE 
          WHEN is_completed = false THEN NOW() 
          ELSE NULL 
        END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('투두 상태 토글 오류:', error);
    throw error;
  }
};

// 다른 사용자에게 투두 전송 (원장 기능)
export const sendTodoToUser = async (
  fromUserId: number, 
  toUserId: number, 
  targetDate: string,
  title: string,
  description?: string,
  priority: '높음' | '보통' | '낮음' = '보통'
): Promise<TodoItem> => {
  try {
    const todo = {
      user_id: toUserId,
      target_date: targetDate,
      title,
      description,
      is_completed: false,
      priority,
      sent_by: fromUserId
    };

    return await createTodo(todo);
  } catch (error) {
    console.error('투두 전송 오류:', error);
    throw error;
  }
}; 