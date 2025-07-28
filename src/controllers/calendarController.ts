import { Request, Response } from 'express';
import * as CalendarEventModel from '../models/CalendarEvent';

// 월별 일정 조회
export const getEventsByMonth = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const { calendar_type = 'shared' } = req.query;
    const userId = (req as any).user.id;
    
    const events = await CalendarEventModel.getEventsByMonth(
      parseInt(year), 
      parseInt(month), 
      calendar_type as 'personal' | 'shared',
      userId
    );
    res.json(events);
  } catch (error) {
    console.error('월별 일정 조회 오류:', error);
    res.status(500).json({ message: '일정 조회 중 오류가 발생했습니다.' });
  }
};

// 날짜 범위별 일정 조회
export const getEventsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, calendar_type = 'shared' } = req.query;
    const userId = (req as any).user.id;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: '시작일과 종료일이 필요합니다.' });
    }
    
    const events = await CalendarEventModel.getEventsByDateRange(
      startDate as string, 
      endDate as string,
      calendar_type as 'personal' | 'shared',
      userId
    );
    res.json(events);
  } catch (error) {
    console.error('날짜 범위별 일정 조회 오류:', error);
    res.status(500).json({ message: '일정 조회 중 오류가 발생했습니다.' });
  }
};

// 일정 검색
export const searchEvents = async (req: Request, res: Response) => {
  try {
    const { q, calendar_type = 'shared' } = req.query;
    const userId = (req as any).user.id;
    
    if (!q) {
      return res.status(400).json({ message: '검색어가 필요합니다.' });
    }
    
    const events = await CalendarEventModel.searchEvents(
      q as string, 
      calendar_type as 'personal' | 'shared',
      userId
    );
    res.json(events);
  } catch (error) {
    console.error('일정 검색 오류:', error);
    res.status(500).json({ message: '일정 검색 중 오류가 발생했습니다.' });
  }
};

// 특정 일정 조회
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await CalendarEventModel.getEventById(parseInt(id));
    
    if (!event) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('일정 조회 오류:', error);
    res.status(500).json({ message: '일정 조회 중 오류가 발생했습니다.' });
  }
};

// 새 일정 생성
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    eventData.created_by = (req as any).user.id;
    
    // 필수 필드 검증
    if (!eventData.title || !eventData.start_date) {
      return res.status(400).json({ 
        message: '제목과 시작일은 필수입니다.' 
      });
    }
    
    // 색상 기본값 설정
    if (!eventData.color) {
      eventData.color = '#3B82F6';
    }
    
    // 카테고리 기본값 설정
    if (!eventData.category) {
      eventData.category = '중요';
    }
    
    // 캘린더 타입 기본값 설정
    if (!eventData.calendar_type) {
      eventData.calendar_type = 'shared';
    }
    
    // 하루 종일 일정이면 시간 제거
    if (eventData.is_all_day) {
      eventData.start_time = null;
      eventData.end_time = null;
    }
    
    const newEvent = await CalendarEventModel.createEvent(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('일정 생성 오류:', error);
    res.status(500).json({ message: '일정 생성 중 오류가 발생했습니다.' });
  }
};

// 일정 수정
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eventData = req.body;
    
    console.log('일정 수정 요청:');
    console.log('- ID:', id);
    console.log('- 수정 데이터:', eventData);
    
    // 하루 종일 일정이면 시간 제거
    if (eventData.is_all_day) {
      eventData.start_time = null;
      eventData.end_time = null;
    }
    
    const updatedEvent = await CalendarEventModel.updateEvent(parseInt(id), eventData);
    
    console.log('- 업데이트된 일정:', updatedEvent);
    
    if (!updatedEvent) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('일정 수정 오류:', error);
    res.status(500).json({ message: '일정 수정 중 오류가 발생했습니다.' });
  }
};

// 일정 삭제
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await CalendarEventModel.deleteEvent(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '일정이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('일정 삭제 오류:', error);
    res.status(500).json({ message: '일정 삭제 중 오류가 발생했습니다.' });
  }
};

// 다가오는 일정 조회 (대시보드용)
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { days = 7 } = req.query;
    
    const upcomingEvents = await CalendarEventModel.getUpcomingEvents(
      userId, 
      parseInt(days as string)
    );
    
    res.json(upcomingEvents);
  } catch (error) {
    console.error('다가오는 일정 조회 오류:', error);
    res.status(500).json({ message: '다가오는 일정 조회 중 오류가 발생했습니다.' });
  }
}; 