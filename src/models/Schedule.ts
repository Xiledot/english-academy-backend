import pool from '../config/database';

export interface Schedule {
  id: number;
  day_of_week: number;
  time_slot: string;
  subject: string;
  teacher_id: number;
  student_ids: number[];
  room?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateScheduleData {
  day_of_week: number;
  time_slot: string;
  subject: string;
  teacher_id: number;
  student_ids: number[];
  room?: string;
  notes?: string;
}

export interface UpdateScheduleData extends Partial<CreateScheduleData> {}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  slot_name: string;
  is_active: boolean;
}

export class ScheduleModel {
  // 시간표 생성
  static async create(scheduleData: CreateScheduleData): Promise<Schedule> {
    const { day_of_week, time_slot, subject, teacher_id, student_ids, room, notes } = scheduleData;
    const query = `
      INSERT INTO schedules (day_of_week, time_slot, subject, teacher_id, student_ids, room, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [day_of_week, time_slot, subject, teacher_id, student_ids, room, notes];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 모든 시간표 조회
  static async findAll(): Promise<Schedule[]> {
    const query = 'SELECT * FROM schedules ORDER BY day_of_week, time_slot';
    const result = await pool.query(query);
    return result.rows;
  }

  // 요일별 시간표 조회
  static async findByDay(dayOfWeek: number): Promise<Schedule[]> {
    const query = 'SELECT * FROM schedules WHERE day_of_week = $1 ORDER BY time_slot';
    const result = await pool.query(query, [dayOfWeek]);
    return result.rows;
  }

  // 강사별 시간표 조회
  static async findByTeacher(teacherId: number): Promise<Schedule[]> {
    const query = 'SELECT * FROM schedules WHERE teacher_id = $1 ORDER BY day_of_week, time_slot';
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }

  // 학생별 시간표 조회
  static async findByStudent(studentId: number): Promise<Schedule[]> {
    const query = 'SELECT * FROM schedules WHERE $1 = ANY(student_ids) ORDER BY day_of_week, time_slot';
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  // ID로 시간표 찾기
  static async findById(id: number): Promise<Schedule | null> {
    const query = 'SELECT * FROM schedules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // 시간대별 시간표 조회
  static async findByTimeSlot(dayOfWeek: number, timeSlot: string): Promise<Schedule | null> {
    const query = 'SELECT * FROM schedules WHERE day_of_week = $1 AND time_slot = $2';
    const result = await pool.query(query, [dayOfWeek, timeSlot]);
    return result.rows[0] || null;
  }

  // 시간표 업데이트
  static async update(id: number, scheduleData: UpdateScheduleData): Promise<Schedule | null> {
    const fields = Object.keys(scheduleData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE schedules 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [id, ...fields.map(field => scheduleData[field as keyof UpdateScheduleData])];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // 시간표 삭제
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM schedules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // 시간대 목록 조회
  static async getTimeSlots(): Promise<TimeSlot[]> {
    const query = 'SELECT * FROM time_slots WHERE is_active = true ORDER BY start_time';
    const result = await pool.query(query);
    return result.rows;
  }

  // 요일별 시간표 통계
  static async getScheduleStats() {
    const query = `
      SELECT 
        day_of_week,
        COUNT(*) as total_classes,
        COUNT(DISTINCT teacher_id) as unique_teachers,
        COUNT(DISTINCT unnest(student_ids)) as total_students
      FROM schedules 
      GROUP BY day_of_week 
      ORDER BY day_of_week
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // 시간대 충돌 확인
  static async checkConflict(dayOfWeek: number, timeSlot: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM schedules WHERE day_of_week = $1 AND time_slot = $2';
    let values = [dayOfWeek, timeSlot];
    
    if (excludeId) {
      query += ' AND id != $3';
      values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }
} 