import { Request, Response } from 'express';
import * as TodoModel from '../models/Todo';
import * as AnnouncementModel from '../models/Announcement';
import * as PersonalMemoModel from '../models/PersonalMemo';
import pool from '../config/database';

// === 투두리스트 관련 ===

// 날짜별 투두 목록 조회
export const getTodosByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = (req as any).user.id;
    
    console.log('날짜별 투두 조회 요청:', { date, userId });
    
    const todos = await TodoModel.getTodosByDate(userId, date);
    console.log('조회된 투두 개수:', todos.length);
    res.json(todos);
  } catch (error) {
    console.error('날짜별 투두 조회 오류:', error);
    res.status(500).json({ message: '투두 조회 중 오류가 발생했습니다.' });
  }
};

// 모든 투두 조회
export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const todos = await TodoModel.getAllTodos(userId);
    res.json(todos);
  } catch (error) {
    console.error('모든 투두 조회 오류:', error);
    res.status(500).json({ message: '투두 조회 중 오류가 발생했습니다.' });
  }
};

// 새 투두 생성
export const createTodo = async (req: Request, res: Response) => {
  try {
    const todoData = req.body;
    todoData.user_id = (req as any).user.id;
    
    console.log('투두 생성 요청 데이터:', todoData);
    console.log('사용자 ID:', (req as any).user.id);
    
    // 필수 필드 검증
    if (!todoData.title || !todoData.target_date) {
      console.log('필수 필드 누락:', { title: todoData.title, target_date: todoData.target_date });
      return res.status(400).json({ 
        message: '제목과 날짜는 필수입니다.' 
      });
    }

    const newTodo = await TodoModel.createTodo(todoData);
    console.log('생성된 투두:', newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('투두 생성 오류:', error);
    res.status(500).json({ message: '투두 생성 중 오류가 발생했습니다.' });
  }
};

// 투두 수정
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todoData = req.body;
    
    console.log('투두 수정 요청:', { id, todoData });
    
    const updatedTodo = await TodoModel.updateTodo(parseInt(id), todoData);
    
    if (!updatedTodo) {
      console.log('투두를 찾을 수 없음:', id);
      return res.status(404).json({ message: '투두를 찾을 수 없습니다.' });
    }
    
    console.log('투두 수정 완료:', updatedTodo);
    res.json(updatedTodo);
  } catch (error) {
    console.error('투두 수정 오류:', error);
    res.status(500).json({ message: '투두 수정 중 오류가 발생했습니다.' });
  }
};

// 투두 삭제
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await TodoModel.deleteTodo(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: '투두를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '투두가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('투두 삭제 오류:', error);
    res.status(500).json({ message: '투두 삭제 중 오류가 발생했습니다.' });
  }
};

// 투두 상태 토글
export const toggleTodoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTodo = await TodoModel.toggleTodoStatus(parseInt(id));
    
    if (!updatedTodo) {
      return res.status(404).json({ message: '투두를 찾을 수 없습니다.' });
    }
    
    res.json(updatedTodo);
  } catch (error) {
    console.error('투두 상태 토글 오류:', error);
    res.status(500).json({ message: '투두 상태 변경 중 오류가 발생했습니다.' });
  }
};

// 다른 사용자에게 투두 전송 (원장 기능)
export const sendTodoToUser = async (req: Request, res: Response) => {
  try {
    const { toUserId, targetDate, title, description, priority } = req.body;
    const fromUserId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    // 권한 검증 (원장과 부원장만 가능)
    if (userRole !== 'director' && userRole !== 'vice_director') {
      return res.status(403).json({ message: '투두 전송 권한이 없습니다.' });
    }

    // 필수 필드 검증
    if (!toUserId || !targetDate || !title) {
      return res.status(400).json({ 
        message: '수신자, 날짜, 제목은 필수입니다.' 
      });
    }

    const sentTodo = await TodoModel.sendTodoToUser(
      fromUserId, 
      toUserId, 
      targetDate, 
      title, 
      description, 
      priority
    );
    
    res.status(201).json(sentTodo);
  } catch (error) {
    console.error('투두 전송 오류:', error);
    res.status(500).json({ message: '투두 전송 중 오류가 발생했습니다.' });
  }
};

// === 조례사항 관련 (원장 전용) ===

// 날짜별 조례사항 조회
export const getAnnouncementsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    console.log('날짜별 조례사항 조회 요청:', { date });
    
    const announcements = await AnnouncementModel.getAnnouncementsByDate(date);
    console.log('조회된 조례사항 개수:', announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error('날짜별 조례사항 조회 오류:', error);
    res.status(500).json({ message: '조례사항 조회 중 오류가 발생했습니다.' });
  }
};

// 새 조례사항 생성
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcementData = req.body;
    const userRole = (req as any).user.role;
    
    console.log('조례사항 생성 요청 데이터:', announcementData);
    console.log('사용자 권한:', userRole);
    
    // 권한 검증 (원장만 가능)
    if (userRole !== 'director') {
      console.log('권한 없음:', userRole);
      return res.status(403).json({ message: '조례사항 작성 권한이 없습니다.' });
    }

    announcementData.created_by = (req as any).user.id;

    // 필수 필드 검증
    if (!announcementData.title || !announcementData.target_date) {
      console.log('필수 필드 누락:', { title: announcementData.title, target_date: announcementData.target_date });
      return res.status(400).json({ 
        message: '제목과 날짜는 필수입니다.' 
      });
    }

    const newAnnouncement = await AnnouncementModel.createAnnouncement(announcementData);
    console.log('생성된 조례사항:', newAnnouncement);
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('조례사항 생성 오류:', error);
    res.status(500).json({ message: '조례사항 생성 중 오류가 발생했습니다.' });
  }
};

// 조례사항 수정
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcementData = req.body;
    const userRole = (req as any).user.role;
    
    console.log('조례사항 수정 요청:', { id, announcementData });
    
    // 권한 검증 (원장만 가능)
    if (userRole !== 'director') {
      console.log('조례사항 수정 권한 없음:', userRole);
      return res.status(403).json({ message: '조례사항 수정 권한이 없습니다.' });
    }
    
    const updatedAnnouncement = await AnnouncementModel.updateAnnouncement(parseInt(id), announcementData);
    
    if (!updatedAnnouncement) {
      console.log('조례사항을 찾을 수 없음:', id);
      return res.status(404).json({ message: '조례사항을 찾을 수 없습니다.' });
    }
    
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('조례사항 수정 오류:', error);
    res.status(500).json({ message: '조례사항 수정 중 오류가 발생했습니다.' });
  }
};

// 조례사항 삭제
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    
    // 권한 검증 (원장만 가능)
    if (userRole !== 'director') {
      return res.status(403).json({ message: '조례사항 삭제 권한이 없습니다.' });
    }
    
    const deleted = await AnnouncementModel.deleteAnnouncement(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: '조례사항을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '조례사항이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('조례사항 삭제 오류:', error);
    res.status(500).json({ message: '조례사항 삭제 중 오류가 발생했습니다.' });
  }
};

// === 개인 메모 관련 ===

// 날짜별 개인 메모 조회
export const getMemoByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = (req as any).user.id;
    
    const memo = await PersonalMemoModel.getMemoByDate(userId, date);
    res.json(memo);
  } catch (error) {
    console.error('날짜별 메모 조회 오류:', error);
    res.status(500).json({ message: '메모 조회 중 오류가 발생했습니다.' });
  }
};

// 메모 수정 또는 생성 (Upsert)
export const upsertMemo = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;
    
    if (!content && content !== '') {
      return res.status(400).json({ message: '메모 내용이 필요합니다.' });
    }

    const memo = await PersonalMemoModel.upsertMemo(userId, date, content);
    res.json(memo);
  } catch (error) {
    console.error('메모 업서트 오류:', error);
    res.status(500).json({ message: '메모 저장 중 오류가 발생했습니다.' });
  }
};

// 모든 사용자 조회 (투두 전송용)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    
    // 권한 검증 (원장과 부원장만 가능)
    if (userRole !== 'director' && userRole !== 'vice_director') {
      return res.status(403).json({ message: '사용자 목록 조회 권한이 없습니다.' });
    }

    const query = 'SELECT id, name, role FROM users ORDER BY name ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '사용자 목록 조회 중 오류가 발생했습니다.' });
  }
}; 