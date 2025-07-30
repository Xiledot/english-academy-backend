import { Pool } from 'pg';
import db from '../config/database';

// 타입 정의
export interface AttendanceCategory {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface AttendanceGroup {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  year?: number;
  semester?: number;
  exam_type?: string;
  round_number?: number;
  month?: number;
  created_at: Date;
  category_name?: string; // JOIN 시 포함
}

export interface AttendanceSession {
  id: number;
  group_id: number;
  name: string;
  school_name?: string;
  session_date?: Date;
  start_time?: string;
  end_time?: string;
  teacher_name?: string;
  notes?: string;
  created_by?: number;
  created_at: Date;
  group_name?: string; // JOIN 시 포함
  category_name?: string; // JOIN 시 포함
}

export interface AttendanceStudent {
  id: number;
  session_id: number;
  student_name: string;
  school_name?: string;
  grade?: number;
  class_name?: string;
  student_number?: number;
  notes?: string;
  created_at: Date;
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  session_id: number;
  attendance_status: 'present' | 'absent' | 'late' | 'excused';
  attendance_time?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  student_name?: string; // JOIN 시 포함
}

export class NewAttendanceModel {
  // 카테고리 관련 메서드
  static async getAllCategories(): Promise<AttendanceCategory[]> {
    const query = `
      SELECT * FROM attendance_categories 
      ORDER BY 
        CASE name 
          WHEN '월간평가' THEN 1 
          WHEN '서킷 모의고사' THEN 2 
          WHEN '최종 파이널' THEN 3 
          WHEN '예비고사' THEN 4 
          ELSE 5 
        END
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // 그룹 관련 메서드
  static async getGroupsByCategory(categoryId: number): Promise<AttendanceGroup[]> {
    const query = `
      SELECT ag.*, ac.name as category_name
      FROM attendance_groups ag
      JOIN attendance_categories ac ON ag.category_id = ac.id
      WHERE ag.category_id = $1
      ORDER BY 
        CASE ac.name 
          WHEN '월간평가' THEN ag.month
          WHEN '서킷 모의고사' THEN ag.round_number
          WHEN '최종 파이널' THEN ag.round_number
          WHEN '예비고사' THEN ag.year * 100 + ag.semester * 10 + CASE ag.exam_type WHEN '중간고사' THEN 1 ELSE 2 END
          ELSE ag.id
        END
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows;
  }

  static async createGroup(groupData: Partial<AttendanceGroup>): Promise<AttendanceGroup> {
    const { category_id, name, description, year, semester, exam_type, round_number, month } = groupData;
    const query = `
      INSERT INTO attendance_groups (category_id, name, description, year, semester, exam_type, round_number, month)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await db.query(query, [category_id, name, description, year, semester, exam_type, round_number, month]);
    return result.rows[0];
  }

  // 세션 관련 메서드
  static async getSessionsByGroup(groupId: number): Promise<AttendanceSession[]> {
    const query = `
      SELECT 
        ases.*, 
        ag.name as group_name,
        ac.name as category_name
      FROM attendance_sessions ases
      JOIN attendance_groups ag ON ases.group_id = ag.id
      JOIN attendance_categories ac ON ag.category_id = ac.id
      WHERE ases.group_id = $1
      ORDER BY ases.created_at DESC
    `;
    const result = await db.query(query, [groupId]);
    return result.rows;
  }

  static async createSession(sessionData: Partial<AttendanceSession>): Promise<AttendanceSession> {
    const { group_id, name, school_name, session_date, start_time, end_time, teacher_name, notes, created_by } = sessionData;
    const query = `
      INSERT INTO attendance_sessions (group_id, name, school_name, session_date, start_time, end_time, teacher_name, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await db.query(query, [group_id, name, school_name, session_date, start_time, end_time, teacher_name, notes, created_by]);
    return result.rows[0];
  }

  static async updateSession(sessionId: number, sessionData: Partial<AttendanceSession>): Promise<AttendanceSession> {
    const { name, school_name, session_date, start_time, end_time, teacher_name, notes } = sessionData;
    const query = `
      UPDATE attendance_sessions 
      SET name = $2, school_name = $3, session_date = $4, start_time = $5, end_time = $6, teacher_name = $7, notes = $8
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [sessionId, name, school_name, session_date, start_time, end_time, teacher_name, notes]);
    return result.rows[0];
  }

  static async deleteSession(sessionId: number): Promise<boolean> {
    const query = 'DELETE FROM attendance_sessions WHERE id = $1';
    const result = await db.query(query, [sessionId]);
    return (result.rowCount ?? 0) > 0;
  }

  // 학생 관련 메서드
  static async getStudentsBySession(sessionId: number): Promise<AttendanceStudent[]> {
    const query = `
      SELECT * FROM attendance_students 
      WHERE session_id = $1 
      ORDER BY student_number, student_name
    `;
    const result = await db.query(query, [sessionId]);
    return result.rows;
  }

  static async createStudent(studentData: Partial<AttendanceStudent>): Promise<AttendanceStudent> {
    const { session_id, student_name, school_name, grade, class_name, student_number, notes } = studentData;
    const query = `
      INSERT INTO attendance_students (session_id, student_name, school_name, grade, class_name, student_number, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await db.query(query, [session_id, student_name, school_name, grade, class_name, student_number, notes]);
    return result.rows[0];
  }

  static async updateStudent(studentId: number, studentData: Partial<AttendanceStudent>): Promise<AttendanceStudent> {
    const { student_name, school_name, grade, class_name, student_number, notes } = studentData;
    const query = `
      UPDATE attendance_students 
      SET student_name = $2, school_name = $3, grade = $4, class_name = $5, student_number = $6, notes = $7
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [studentId, student_name, school_name, grade, class_name, student_number, notes]);
    return result.rows[0];
  }

  static async deleteStudent(studentId: number): Promise<boolean> {
    const query = 'DELETE FROM attendance_students WHERE id = $1';
    const result = await db.query(query, [studentId]);
    return (result.rowCount ?? 0) > 0;
  }

  // 출석 기록 관련 메서드
  static async getAttendanceRecords(sessionId: number): Promise<AttendanceRecord[]> {
    const query = `
      SELECT ar.*, ast.student_name
      FROM attendance_records ar
      JOIN attendance_students ast ON ar.student_id = ast.id
      WHERE ar.session_id = $1
      ORDER BY ast.student_number, ast.student_name
    `;
    const result = await db.query(query, [sessionId]);
    return result.rows;
  }

  static async updateAttendanceRecord(studentId: number, sessionId: number, status: string): Promise<AttendanceRecord> {
    // 기존 기록이 있는지 확인
    const existingQuery = 'SELECT * FROM attendance_records WHERE student_id = $1 AND session_id = $2';
    const existingResult = await db.query(existingQuery, [studentId, sessionId]);

    if (existingResult.rows.length > 0) {
      // 업데이트
      const updateQuery = `
        UPDATE attendance_records 
        SET attendance_status = $3, attendance_time = NOW(), updated_at = NOW()
        WHERE student_id = $1 AND session_id = $2
        RETURNING *
      `;
      const result = await db.query(updateQuery, [studentId, sessionId, status]);
      return result.rows[0];
    } else {
      // 새로 생성
      const insertQuery = `
        INSERT INTO attendance_records (student_id, session_id, attendance_status, attendance_time)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `;
      const result = await db.query(insertQuery, [studentId, sessionId, status]);
      return result.rows[0];
    }
  }

  // 통계 관련 메서드
  static async getAttendanceStats(sessionId: number): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN ar.attendance_status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.attendance_status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ar.attendance_status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN ar.attendance_status = 'excused' THEN 1 END) as excused_count
      FROM attendance_students ast
      LEFT JOIN attendance_records ar ON ast.id = ar.student_id
      WHERE ast.session_id = $1
    `;
    const result = await db.query(query, [sessionId]);
    return result.rows[0];
  }

  // 검색 관련 메서드
  static async searchSessions(keyword: string): Promise<AttendanceSession[]> {
    const query = `
      SELECT 
        ases.*, 
        ag.name as group_name,
        ac.name as category_name
      FROM attendance_sessions ases
      JOIN attendance_groups ag ON ases.group_id = ag.id
      JOIN attendance_categories ac ON ag.category_id = ac.id
      WHERE 
        ases.name ILIKE $1 
        OR ases.school_name ILIKE $1
        OR ag.name ILIKE $1
        OR ac.name ILIKE $1
      ORDER BY ases.created_at DESC
      LIMIT 50
    `;
    const result = await db.query(query, [`%${keyword}%`]);
    return result.rows;
  }
} 