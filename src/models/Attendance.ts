import pool from '../config/database';

export interface AttendanceType {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AttendanceSession {
  id: number;
  type_id: number;
  type_name?: string;
  type_color?: string;
  session_name: string;
  day_of_week?: string; // '월', '화', '수', '목', '금', '토', '일'
  start_time?: string;
  end_time?: string;
  teacher_name?: string;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  student_count?: number;
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_name: string;
  student_school?: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  arrival_time?: string;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface AttendanceStats {
  student_name: string;
  total_sessions: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate: number;
}

// 학생 인터페이스 추가
export interface Student {
  id: number;
  name: string;
  school: string;
  type_id: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// 출석부 유형 관련 함수들
export const getAttendanceTypes = async (): Promise<AttendanceType[]> => {
  const result = await pool.query(`
    SELECT * FROM attendance_types 
    WHERE is_active = true 
    ORDER BY name
  `);
  return result.rows;
};

export const createAttendanceType = async (typeData: Partial<AttendanceType>): Promise<AttendanceType> => {
  const { name, description, color } = typeData;
  const result = await pool.query(`
    INSERT INTO attendance_types (name, description, color)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [name, description, color]);
  return result.rows[0];
};

export const deleteAttendanceType = async (id: number): Promise<boolean> => {
  const result = await pool.query(`
    UPDATE attendance_types 
    SET is_active = false, updated_at = NOW()
    WHERE id = $1
  `, [id]);
  return (result.rowCount ?? 0) > 0;
};

// 학생 관리 함수들
export const getStudentsByType = async (typeId: number): Promise<Student[]> => {
  const result = await pool.query(`
    SELECT * FROM attendance_students 
    WHERE type_id = $1 
    ORDER BY name
  `, [typeId]);
  return result.rows;
};

export const createStudent = async (studentData: Partial<Student>): Promise<Student> => {
  const { name, school, type_id, created_by } = studentData;
  const result = await pool.query(`
    INSERT INTO attendance_students (name, school, type_id, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [name, school, type_id, created_by]);
  return result.rows[0];
};

export const updateStudent = async (id: number, studentData: Partial<Student>): Promise<Student | null> => {
  const { name, school } = studentData;
  const result = await pool.query(`
    UPDATE attendance_students 
    SET name = $1, school = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `, [name, school, id]);
  return result.rows[0] || null;
};

export const deleteStudent = async (id: number): Promise<boolean> => {
  const result = await pool.query(`
    DELETE FROM attendance_students WHERE id = $1
  `, [id]);
  return (result.rowCount ?? 0) > 0;
};

// 세션 관련 함수들
export const getAttendanceSessions = async (typeId?: number): Promise<AttendanceSession[]> => {
  let query = `
    SELECT s.*, at.name as type_name, at.color as type_color,
           COUNT(ar.id) as student_count
    FROM attendance_sessions s
    LEFT JOIN attendance_types at ON s.type_id = at.id
    LEFT JOIN attendance_records ar ON s.id = ar.session_id
  `;
  let params: any[] = [];
  
  if (typeId) {
    query += ' WHERE s.type_id = $1';
    params = [typeId];
  }
  
  query += ' GROUP BY s.id, at.name, at.color ORDER BY s.day_of_week, s.start_time';
  
  const result = await pool.query(query, params);
  return result.rows;
};

export const getAttendanceSessionById = async (id: number): Promise<AttendanceSession | null> => {
  const result = await pool.query(`
    SELECT s.*, at.name as type_name, at.color as type_color
    FROM attendance_sessions s
    LEFT JOIN attendance_types at ON s.type_id = at.id
    WHERE s.id = $1
  `, [id]);
  return result.rows[0] || null;
};

export const createAttendanceSession = async (sessionData: Partial<AttendanceSession>): Promise<AttendanceSession> => {
  const { type_id, session_name, day_of_week, start_time, end_time, teacher_name, notes, created_by } = sessionData;
  const result = await pool.query(`
    INSERT INTO attendance_sessions (type_id, session_name, day_of_week, start_time, end_time, teacher_name, notes, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [type_id, session_name, day_of_week, start_time, end_time, teacher_name, notes, created_by]);
  return result.rows[0];
};

export const deleteAttendanceSession = async (id: number): Promise<boolean> => {
  const result = await pool.query(`
    DELETE FROM attendance_sessions WHERE id = $1
  `, [id]);
  return (result.rowCount ?? 0) > 0;
};

// 중복 세션 체크 함수 수정 - 같은 학생의 중복만 체크 (요일 기반)
export const checkDuplicateSession = async (typeId: number, sessionName: string, dayOfWeek: string, startTime: string, studentName?: string): Promise<boolean> => {
  if (!studentName) return false; // 학생 이름이 없으면 중복 아님
  
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM attendance_sessions 
    WHERE type_id = $1 AND session_name = $2 AND day_of_week = $3 AND start_time = $4 AND notes LIKE $5
  `, [typeId, sessionName, dayOfWeek, startTime, `%${studentName}%`]);
  return parseInt(result.rows[0].count) > 0;
};

// 출석 기록 관련 함수들
export const getAttendanceRecords = async (sessionId: number): Promise<AttendanceRecord[]> => {
  const result = await pool.query(`
    SELECT * FROM attendance_records 
    WHERE session_id = $1 
    ORDER BY student_name
  `, [sessionId]);
  return result.rows;
};

export const createAttendanceRecord = async (recordData: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
  const { session_id, student_name, student_school, status, arrival_time, notes, created_by } = recordData;
  const result = await pool.query(`
    INSERT INTO attendance_records (session_id, student_name, student_school, status, arrival_time, notes, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [session_id, student_name, student_school, status, arrival_time, notes, created_by]);
  return result.rows[0];
};

export const updateAttendanceRecord = async (id: number, recordData: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> => {
  const { status, arrival_time, notes } = recordData;
  const result = await pool.query(`
    UPDATE attendance_records 
    SET status = $1, arrival_time = $2, notes = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING *
  `, [status, arrival_time, notes, id]);
  return result.rows[0] || null;
};

export const deleteAttendanceRecord = async (id: number): Promise<boolean> => {
  const result = await pool.query(`
    DELETE FROM attendance_records WHERE id = $1
  `, [id]);
  return (result.rowCount ?? 0) > 0;
};

// 통계 관련 함수들
export const getAttendanceStatsBySession = async (sessionId: number): Promise<AttendanceStats[]> => {
  const result = await pool.query(`
    SELECT 
      student_name,
      COUNT(*) as total_sessions,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
      ROUND(
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END)::float / COUNT(*)) * 100, 
        2
      ) as attendance_rate
    FROM attendance_records 
    WHERE session_id = $1
    GROUP BY student_name
    ORDER BY student_name
  `, [sessionId]);
  return result.rows;
};

export const getAttendanceStatsByType = async (typeId: number): Promise<AttendanceStats[]> => {
  const result = await pool.query(`
    SELECT 
      ar.student_name,
      COUNT(*) as total_sessions,
      SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_count,
      SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
      ROUND(
        (SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END)::float / COUNT(*)) * 100, 
        2
      ) as attendance_rate
    FROM attendance_records ar
    JOIN attendance_sessions s ON ar.session_id = s.id
    WHERE s.type_id = $1
    GROUP BY ar.student_name
    ORDER BY ar.student_name
  `, [typeId]);
  return result.rows;
}; 