import { Request, Response } from 'express';
import * as StudentModel from '../models/Student';
import pool from '../config/database';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await StudentModel.getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: '학생 목록 조회 실패', details: err });
  }
};

export const getStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const student = await StudentModel.getStudentById(id);
    if (!student) return res.status(404).json({ error: '학생을 찾을 수 없음' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: '학생 조회 실패', details: err });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const student = await StudentModel.createStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: '학생 등록 실패', details: err });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const student = await StudentModel.updateStudent(id, req.body);
    if (!student) return res.status(404).json({ error: '학생을 찾을 수 없음' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: '학생 정보 수정 실패', details: err });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const ok = await StudentModel.deleteStudent(id);
    if (!ok) return res.status(404).json({ error: '학생을 찾을 수 없음' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '학생 삭제 실패', details: err });
  }
};

// 학생 통계 조회
export const getStudentStats = async (req: Request, res: Response) => {
  try {
    // 전체 학생 수
    const totalQuery = 'SELECT COUNT(*) as total FROM students';
    const totalResult = await pool.query(totalQuery);
    const totalStudents = parseInt(totalResult.rows[0].total);

    // 활성 학생 수 (전체 학생 수와 동일하게)
    const activeStudents = totalStudents;

    // 오늘 출석 수 (임시 데이터)
    const todayAttendance = Math.floor(Math.random() * 20) + 10; // 10-30명

    // 출석률 계산
    const attendanceRate = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

    // 신규 학생 수 (최근 7일)
    const newStudentsQuery = `
      SELECT COUNT(*) as new_students 
      FROM students 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;
    const newStudentsResult = await pool.query(newStudentsQuery);
    const newStudents = parseInt(newStudentsResult.rows[0].new_students);

    res.json({
      totalStudents,
      activeStudents,
      todayAttendance,
      attendanceRate,
      newStudents
    });
  } catch (error) {
    console.error('학생 통계 조회 오류:', error);
    res.status(500).json({ error: '학생 통계 조회 실패' });
  }
};

// 오늘 수업 예정인 학생들 조회
export const getTodayStudents = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    // 오늘 요일의 수업 조회
    const query = `
      SELECT 
        s.id,
        s.time_slot,
        s.subject,
        s.student_ids,
        s.notes,
        st.name
      FROM schedules s
      LEFT JOIN LATERAL (
        SELECT DISTINCT ON (st.id) st.id, st.name
        FROM students st
        WHERE st.id = ANY(s.student_ids)
      ) st ON true
      WHERE s.day_of_week = $1
      ORDER BY s.time_slot ASC
    `;
    
    const result = await pool.query(query, [dayOfWeek]);
    
    // 중복 제거하고 학생별로 정리
    const studentMap = new Map();
    
    result.rows.forEach(row => {
      // notes에서 학생 이름과 과목 파싱
      let studentName = '';
      let subject = '수업'; // 기본값을 '수업'으로 설정
      
      // subject 매핑 (영어 -> 한글)
      const subjectMap: { [key: string]: string } = {
        'class': '수업',
        'test': '시험',
        'makeup': '보충',
        'online': '화상',
        'ot': 'OT',
        'absent': '결석',
        'feedback': '피드백',
        'extra': '추가',
        'review': '복습',
        'practice': '연습',
        'consultation': '상담'
      };
      
      // 데이터베이스의 subject를 한글로 변환
      if (row.subject && subjectMap[row.subject]) {
        subject = subjectMap[row.subject];
      } else if (row.subject) {
        subject = row.subject;
      }
      
      if (row.notes && row.notes.includes('/')) {
        const parts = row.notes.split('/');
        if (parts.length >= 2) {
          studentName = parts[0].trim();
          subject = parts[1].trim();
        }
      } else if (row.notes) {
        // '/'가 없으면 전체를 학생 이름으로
        studentName = row.notes.trim();
      }
      
      // student_ids가 있는 경우 데이터베이스의 학생 정보 사용
      if (row.student_ids && row.student_ids.length > 0) {
        row.student_ids.forEach((studentId: number) => {
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              id: studentId,
              name: row.name || studentName,
              grade: '',
              school: '',
              subject: subject,
              time: row.time_slot,
              notes: row.notes
            });
          }
        });
      } else if (studentName) {
        // student_ids가 없지만 notes에 학생 이름이 있는 경우
        const tempId = `temp_${row.id}_${row.time_slot}`;
        if (!studentMap.has(tempId)) {
          studentMap.set(tempId, {
            id: tempId,
            name: studentName,
            grade: '',
            school: '',
            subject: subject,
            time: row.time_slot,
            notes: row.notes
          });
        }
      }
    });
    
    const todayStudents = Array.from(studentMap.values());
    
    res.json(todayStudents);
  } catch (error) {
    console.error('오늘 학생 목록 조회 오류:', error);
    res.status(500).json({ error: '오늘 학생 목록 조회 실패' });
  }
}; 