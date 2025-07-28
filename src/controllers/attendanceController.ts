import { Request, Response } from 'express';
import * as AttendanceModel from '../models/Attendance';

// 출석부 유형 관련 컨트롤러들
export const getAttendanceTypes = async (req: Request, res: Response) => {
  try {
    const types = await AttendanceModel.getAttendanceTypes();
    res.json(types);
  } catch (error) {
    console.error('출석부 유형 조회 오류:', error);
    res.status(500).json({ error: '출석부 유형을 가져오는데 실패했습니다.' });
  }
};

export const createAttendanceType = async (req: Request, res: Response) => {
  try {
    const newType = await AttendanceModel.createAttendanceType(req.body);
    res.status(201).json(newType);
  } catch (error) {
    console.error('출석부 유형 생성 오류:', error);
    res.status(500).json({ error: '출석부 유형 생성에 실패했습니다.' });
  }
};

export const deleteAttendanceType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await AttendanceModel.deleteAttendanceType(parseInt(id));
    if (success) {
      res.json({ message: '출석부 유형이 삭제되었습니다.' });
    } else {
      res.status(404).json({ error: '출석부 유형을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('출석부 유형 삭제 오류:', error);
    res.status(500).json({ error: '출석부 유형 삭제에 실패했습니다.' });
  }
};

// 학생 관리 컨트롤러들
export const getStudentsByType = async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params;
    const students = await AttendanceModel.getStudentsByType(parseInt(typeId));
    res.json(students);
  } catch (error) {
    console.error('학생 목록 조회 오류:', error);
    res.status(500).json({ error: '학생 목록을 가져오는데 실패했습니다.' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const studentData = {
      ...req.body,
      created_by: (req as any).user?.userId || 1
    };
    const newStudent = await AttendanceModel.createStudent(studentData);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('학생 생성 오류:', error);
    res.status(500).json({ error: '학생 추가에 실패했습니다.' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedStudent = await AttendanceModel.updateStudent(parseInt(id), req.body);
    if (updatedStudent) {
      res.json(updatedStudent);
    } else {
      res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('학생 정보 수정 오류:', error);
    res.status(500).json({ error: '학생 정보 수정에 실패했습니다.' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await AttendanceModel.deleteStudent(parseInt(id));
    if (success) {
      res.json({ message: '학생이 삭제되었습니다.' });
    } else {
      res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('학생 삭제 오류:', error);
    res.status(500).json({ error: '학생 삭제에 실패했습니다.' });
  }
};

// 세션 관련 컨트롤러들
export const getAttendanceSessions = async (req: Request, res: Response) => {
  try {
    const { typeId } = req.query;
    const sessions = await AttendanceModel.getAttendanceSessions(
      typeId ? parseInt(typeId as string) : undefined
    );
    res.json(sessions);
  } catch (error) {
    console.error('세션 목록 조회 오류:', error);
    res.status(500).json({ error: '세션 목록을 가져오는데 실패했습니다.' });
  }
};

export const getAttendanceSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await AttendanceModel.getAttendanceSessionById(parseInt(id));
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('세션 조회 오류:', error);
    res.status(500).json({ error: '세션을 가져오는데 실패했습니다.' });
  }
};

export const createAttendanceSession = async (req: Request, res: Response) => {
  try {
    const sessionData = {
      ...req.body,
      created_by: (req as any).user?.userId || 1
    };
    const newSession = await AttendanceModel.createAttendanceSession(sessionData);
    res.status(201).json(newSession);
  } catch (error) {
    console.error('세션 생성 오류:', error);
    res.status(500).json({ error: '세션 생성에 실패했습니다.' });
  }
};

// 중복 세션 체크 컨트롤러
export const checkDuplicateSession = async (req: Request, res: Response) => {
  try {
    const { typeId, sessionName, dayOfWeek, startTime, studentName } = req.query;
    
    if (!typeId || !sessionName || !dayOfWeek || !startTime) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    const isDuplicate = await AttendanceModel.checkDuplicateSession(
      parseInt(typeId as string),
      sessionName as string,
      dayOfWeek as string,
      startTime as string,
      studentName as string
    );
    
    res.json({ isDuplicate });
  } catch (error) {
    console.error('중복 세션 체크 오류:', error);
    res.status(500).json({ error: '중복 세션 체크에 실패했습니다.' });
  }
};

export const deleteAttendanceSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await AttendanceModel.deleteAttendanceSession(parseInt(id));
    if (success) {
      res.json({ message: '세션이 삭제되었습니다.' });
    } else {
      res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('세션 삭제 오류:', error);
    res.status(500).json({ error: '세션 삭제에 실패했습니다.' });
  }
};

// 출석 기록 관련 컨트롤러들
export const getAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const records = await AttendanceModel.getAttendanceRecords(parseInt(sessionId));
    res.json(records);
  } catch (error) {
    console.error('출석 기록 조회 오류:', error);
    res.status(500).json({ error: '출석 기록을 가져오는데 실패했습니다.' });
  }
};

export const createAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const recordData = {
      ...req.body,
      created_by: (req as any).user?.userId || 1
    };
    const newRecord = await AttendanceModel.createAttendanceRecord(recordData);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('출석 기록 생성 오류:', error);
    res.status(500).json({ error: '출석 기록 생성에 실패했습니다.' });
  }
};

export const updateAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedRecord = await AttendanceModel.updateAttendanceRecord(parseInt(id), req.body);
    if (updatedRecord) {
      res.json(updatedRecord);
    } else {
      res.status(404).json({ error: '출석 기록을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('출석 기록 수정 오류:', error);
    res.status(500).json({ error: '출석 기록 수정에 실패했습니다.' });
  }
};

export const deleteAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await AttendanceModel.deleteAttendanceRecord(parseInt(id));
    if (success) {
      res.json({ message: '출석 기록이 삭제되었습니다.' });
    } else {
      res.status(404).json({ error: '출석 기록을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('출석 기록 삭제 오류:', error);
    res.status(500).json({ error: '출석 기록 삭제에 실패했습니다.' });
  }
};

// 통계 관련 컨트롤러들
export const getAttendanceStatsBySession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const stats = await AttendanceModel.getAttendanceStatsBySession(parseInt(sessionId));
    res.json(stats);
  } catch (error) {
    console.error('세션별 출석 통계 조회 오류:', error);
    res.status(500).json({ error: '출석 통계를 가져오는데 실패했습니다.' });
  }
};

export const getAttendanceStatsByType = async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params;
    const stats = await AttendanceModel.getAttendanceStatsByType(parseInt(typeId));
    res.json(stats);
  } catch (error) {
    console.error('유형별 출석 통계 조회 오류:', error);
    res.status(500).json({ error: '출석 통계를 가져오는데 실패했습니다.' });
  }
}; 