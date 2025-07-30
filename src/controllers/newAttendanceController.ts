import { Request, Response } from 'express';
import { NewAttendanceModel } from '../models/NewAttendance';

export class NewAttendanceController {
  // 카테고리 관련
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await NewAttendanceModel.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('카테고리 조회 오류:', error);
      res.status(500).json({ error: '카테고리 조회에 실패했습니다.' });
    }
  }

  // 그룹 관련
  static async getGroupsByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const groups = await NewAttendanceModel.getGroupsByCategory(parseInt(categoryId));
      res.json(groups);
    } catch (error) {
      console.error('그룹 조회 오류:', error);
      res.status(500).json({ error: '그룹 조회에 실패했습니다.' });
    }
  }

  static async createGroup(req: Request, res: Response) {
    try {
      const group = await NewAttendanceModel.createGroup(req.body);
      res.status(201).json(group);
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      res.status(500).json({ error: '그룹 생성에 실패했습니다.' });
    }
  }

  // 세션 관련
  static async getSessionsByGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const sessions = await NewAttendanceModel.getSessionsByGroup(parseInt(groupId));
      res.json(sessions);
    } catch (error) {
      console.error('세션 조회 오류:', error);
      res.status(500).json({ error: '세션 조회에 실패했습니다.' });
    }
  }

  static async createSession(req: Request, res: Response) {
    try {
      const sessionData = {
        ...req.body,
        created_by: (req as any).user?.id
      };
      const session = await NewAttendanceModel.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error('세션 생성 오류:', error);
      res.status(500).json({ error: '세션 생성에 실패했습니다.' });
    }
  }

  static async updateSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await NewAttendanceModel.updateSession(parseInt(sessionId), req.body);
      if (!session) {
        return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
      }
      res.json(session);
    } catch (error) {
      console.error('세션 수정 오류:', error);
      res.status(500).json({ error: '세션 수정에 실패했습니다.' });
    }
  }

  static async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const deleted = await NewAttendanceModel.deleteSession(parseInt(sessionId));
      if (!deleted) {
        return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
      }
      res.json({ message: '세션이 삭제되었습니다.' });
    } catch (error) {
      console.error('세션 삭제 오류:', error);
      res.status(500).json({ error: '세션 삭제에 실패했습니다.' });
    }
  }

  // 학생 관련
  static async getStudentsBySession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const students = await NewAttendanceModel.getStudentsBySession(parseInt(sessionId));
      res.json(students);
    } catch (error) {
      console.error('학생 조회 오류:', error);
      res.status(500).json({ error: '학생 조회에 실패했습니다.' });
    }
  }

  static async createStudent(req: Request, res: Response) {
    try {
      const student = await NewAttendanceModel.createStudent(req.body);
      res.status(201).json(student);
    } catch (error) {
      console.error('학생 생성 오류:', error);
      res.status(500).json({ error: '학생 생성에 실패했습니다.' });
    }
  }

  static async updateStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const student = await NewAttendanceModel.updateStudent(parseInt(studentId), req.body);
      if (!student) {
        return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
      }
      res.json(student);
    } catch (error) {
      console.error('학생 수정 오류:', error);
      res.status(500).json({ error: '학생 수정에 실패했습니다.' });
    }
  }

  static async deleteStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const deleted = await NewAttendanceModel.deleteStudent(parseInt(studentId));
      if (!deleted) {
        return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
      }
      res.json({ message: '학생이 삭제되었습니다.' });
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      res.status(500).json({ error: '학생 삭제에 실패했습니다.' });
    }
  }

  // 출석 기록 관련
  static async getAttendanceRecords(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const records = await NewAttendanceModel.getAttendanceRecords(parseInt(sessionId));
      res.json(records);
    } catch (error) {
      console.error('출석 기록 조회 오류:', error);
      res.status(500).json({ error: '출석 기록 조회에 실패했습니다.' });
    }
  }

  static async updateAttendanceRecord(req: Request, res: Response) {
    try {
      const { studentId, sessionId } = req.params;
      const { status } = req.body;
      const record = await NewAttendanceModel.updateAttendanceRecord(
        parseInt(studentId), 
        parseInt(sessionId), 
        status
      );
      res.json(record);
    } catch (error) {
      console.error('출석 기록 수정 오류:', error);
      res.status(500).json({ error: '출석 기록 수정에 실패했습니다.' });
    }
  }

  // 통계 관련
  static async getAttendanceStats(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const stats = await NewAttendanceModel.getAttendanceStats(parseInt(sessionId));
      res.json(stats);
    } catch (error) {
      console.error('출석 통계 조회 오류:', error);
      res.status(500).json({ error: '출석 통계 조회에 실패했습니다.' });
    }
  }

  // 검색 관련
  static async searchSessions(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      if (!keyword) {
        return res.status(400).json({ error: '검색어가 필요합니다.' });
      }
      const sessions = await NewAttendanceModel.searchSessions(keyword as string);
      res.json(sessions);
    } catch (error) {
      console.error('세션 검색 오류:', error);
      res.status(500).json({ error: '세션 검색에 실패했습니다.' });
    }
  }
} 