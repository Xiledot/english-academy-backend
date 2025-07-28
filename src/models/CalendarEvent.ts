import { Pool } from 'pg';
import pool from '../config/database';

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  color: string;
  category: string;
  location?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  is_holiday: boolean;
  calendar_type: 'personal' | 'shared'; // 개인/분원 캘린더 구분
  created_by_name?: string; // 생성자 이름
}

// 월별 일정 조회 (캘린더 타입별)
export const getEventsByMonth = async (year: number, month: number, calendarType: 'personal' | 'shared', userId?: number): Promise<CalendarEvent[]> => {
  try {
    let query = `
      SELECT e.id, e.title, e.description, 
             TO_CHAR(e.start_date, 'YYYY-MM-DD') as start_date,
             TO_CHAR(e.end_date, 'YYYY-MM-DD') as end_date,
             e.start_time, e.end_time, e.is_all_day, e.color, e.category, 
             e.location, e.created_by, e.is_holiday, e.calendar_type,
             e.created_at, e.updated_at, u.name as created_by_name 
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.calendar_type = $3 AND
        ((DATE_PART('year', e.start_date) = $1 AND DATE_PART('month', e.start_date) = $2)
        OR 
        (e.end_date IS NOT NULL AND 
         e.start_date <= DATE($1 || '-' || $2 || '-01') + INTERVAL '1 month - 1 day' AND
         e.end_date >= DATE($1 || '-' || $2 || '-01')))
    `;
    
    const values: any[] = [year, month, calendarType];
    
    // 개인 캘린더인 경우 본인 것만 조회
    if (calendarType === 'personal' && userId) {
      query += ' AND e.created_by = $4';
      values.push(userId);
    }
    
    query += ' ORDER BY e.start_date ASC, e.start_time ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('월별 일정 조회 오류:', error);
    throw error;
  }
};

// 날짜 범위별 일정 조회 (캘린더 타입별)
export const getEventsByDateRange = async (startDate: string, endDate: string, calendarType: 'personal' | 'shared', userId?: number): Promise<CalendarEvent[]> => {
  try {
    let query = `
      SELECT e.id, e.title, e.description, 
             TO_CHAR(e.start_date, 'YYYY-MM-DD') as start_date,
             TO_CHAR(e.end_date, 'YYYY-MM-DD') as end_date,
             e.start_time, e.end_time, e.is_all_day, e.color, e.category, 
             e.location, e.created_by, e.is_holiday, e.calendar_type,
             e.created_at, e.updated_at, u.name as created_by_name 
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.calendar_type = $3 AND
        e.start_date <= $2 AND 
        ((e.end_date IS NULL AND e.start_date >= $1) OR
        (e.end_date IS NOT NULL AND e.end_date >= $1))
    `;
    
    const values: any[] = [startDate, endDate, calendarType];
    
    // 개인 캘린더인 경우 본인 것만 조회
    if (calendarType === 'personal' && userId) {
      query += ' AND e.created_by = $4';
      values.push(userId);
    }
    
    query += ' ORDER BY e.start_date ASC, e.start_time ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('날짜 범위별 일정 조회 오류:', error);
    throw error;
  }
};

// 일정 검색 (캘린더 타입별)
export const searchEvents = async (searchTerm: string, calendarType: 'personal' | 'shared', userId?: number): Promise<CalendarEvent[]> => {
  try {
    let query = `
      SELECT e.*, u.name as created_by_name 
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.calendar_type = $2 AND
        (e.title ILIKE $1 OR 
        e.description ILIKE $1 OR 
        e.category ILIKE $1 OR
        e.location ILIKE $1)
    `;
    
    const values: any[] = [`%${searchTerm}%`, calendarType];
    
    // 개인 캘린더인 경우 본인 것만 조회
    if (calendarType === 'personal' && userId) {
      query += ' AND e.created_by = $3';
      values.push(userId);
    }
    
    query += ' ORDER BY e.start_date DESC LIMIT 50';
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('일정 검색 오류:', error);
    throw error;
  }
};

// 특정 일정 조회
export const getEventById = async (id: number): Promise<CalendarEvent | null> => {
  try {
    const query = `
      SELECT e.*, u.name as created_by_name 
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('일정 조회 오류:', error);
    throw error;
  }
};

// 새 일정 생성
export const createEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> => {
  try {
    const query = `
      INSERT INTO calendar_events (
        title, description, start_date, end_date, start_time, end_time,
        is_all_day, color, category, location, created_by, is_holiday, calendar_type
      ) VALUES ($1, $2, $3::DATE, $4::DATE, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title, description, 
                TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
                start_time, end_time, is_all_day, color, category, 
                location, created_by, is_holiday, calendar_type,
                created_at, updated_at
    `;
    
    const values = [
      event.title,
      event.description,
      event.start_date,
      event.end_date,
      event.start_time,
      event.end_time,
      event.is_all_day,
      event.color,
      event.category,
      event.location,
      event.created_by,
      event.is_holiday,
      event.calendar_type
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('일정 생성 오류:', error);
    throw error;
  }
};

// 일정 수정
export const updateEvent = async (id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  try {
    console.log('CalendarEvent.updateEvent 호출:');
    console.log('- ID:', id);
    console.log('- 수정할 이벤트 데이터:', event);
    
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (event.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(event.title);
    }
    if (event.description !== undefined) {
      setClause.push(`description = $${paramCount++}`);
      values.push(event.description);
    }
    if (event.start_date !== undefined) {
      setClause.push(`start_date = $${paramCount++}::DATE`);
      values.push(event.start_date);
      console.log('- start_date 업데이트:', event.start_date);
    }
    if (event.end_date !== undefined) {
      setClause.push(`end_date = $${paramCount++}::DATE`);
      values.push(event.end_date);
      console.log('- end_date 업데이트:', event.end_date);
    }
    if (event.start_time !== undefined) {
      setClause.push(`start_time = $${paramCount++}`);
      values.push(event.start_time);
    }
    if (event.end_time !== undefined) {
      setClause.push(`end_time = $${paramCount++}`);
      values.push(event.end_time);
    }
    if (event.is_all_day !== undefined) {
      setClause.push(`is_all_day = $${paramCount++}`);
      values.push(event.is_all_day);
    }
    if (event.color !== undefined) {
      setClause.push(`color = $${paramCount++}`);
      values.push(event.color);
    }
    if (event.category !== undefined) {
      setClause.push(`category = $${paramCount++}`);
      values.push(event.category);
    }
    if (event.location !== undefined) {
      setClause.push(`location = $${paramCount++}`);
      values.push(event.location);
    }
    if (event.calendar_type !== undefined) {
      setClause.push(`calendar_type = $${paramCount++}`);
      values.push(event.calendar_type);
    }

    if (setClause.length === 0) {
      throw new Error('수정할 필드가 없습니다.');
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE calendar_events 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, 
                TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
                start_time, end_time, is_all_day, color, category, 
                location, created_by, is_holiday, calendar_type,
                created_at, updated_at
    `;

    console.log('- 실행할 SQL:', query);
    console.log('- SQL 파라미터:', values);

    const result = await pool.query(query, values);
    
    console.log('- SQL 실행 결과:', result.rows[0]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('일정 수정 오류:', error);
    throw error;
  }
};

// 일정 삭제
export const deleteEvent = async (id: number): Promise<boolean> => {
  try {
    const query = 'DELETE FROM calendar_events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('일정 삭제 오류:', error);
    throw error;
  }
};

// 다가오는 일정 조회 (대시보드용)
export const getUpcomingEvents = async (userId: number, days: number = 7): Promise<{
  shared: CalendarEvent[],
  personal: CalendarEvent[]
}> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    // 분원 일정 조회
    const sharedQuery = `
      SELECT e.*, u.name as created_by_name 
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.calendar_type = 'shared' AND
        e.start_date >= $1 AND 
        e.start_date <= $2
      ORDER BY e.start_date ASC, e.start_time ASC
      LIMIT 5
    `;
    
    // 개인 일정 조회
    const personalQuery = `
      SELECT e.*, u.name as created_by_name 
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.calendar_type = 'personal' AND
        e.created_by = $3 AND
        e.start_date >= $1 AND 
        e.start_date <= $2
      ORDER BY e.start_date ASC, e.start_time ASC
      LIMIT 5
    `;
    
    const [sharedResult, personalResult] = await Promise.all([
      pool.query(sharedQuery, [today, futureDateStr]),
      pool.query(personalQuery, [today, futureDateStr, userId])
    ]);
    
    return {
      shared: sharedResult.rows,
      personal: personalResult.rows
    };
  } catch (error) {
    console.error('다가오는 일정 조회 오류:', error);
    throw error;
  }
}; 