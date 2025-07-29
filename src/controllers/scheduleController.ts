import { Request, Response } from 'express';
import { ScheduleModel, CreateScheduleData, UpdateScheduleData } from '../models/Schedule';
import pool from '../config/database';

export class ScheduleController {
  // 모든 시간표 조회
  static async getAllSchedules(req: Request, res: Response) {
    try {
      const { day, teacher, student } = req.query;
      
      let schedules;
      
      if (day !== undefined) {
        schedules = await ScheduleModel.findByDay(parseInt(day as string));
      } else if (teacher !== undefined) {
        schedules = await ScheduleModel.findByTeacher(parseInt(teacher as string));
      } else if (student !== undefined) {
        schedules = await ScheduleModel.findByStudent(parseInt(student as string));
      } else {
        schedules = await ScheduleModel.findAll();
      }

      res.json({
        success: true,
        data: schedules,
        count: schedules.length
      });
    } catch (error) {
      console.error('시간표 목록 조회 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 시간표 상세 조회
  static async getSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schedule = await ScheduleModel.findById(parseInt(id));

      if (!schedule) {
        return res.status(404).json({ 
          success: false,
          error: '시간표를 찾을 수 없습니다.' 
        });
      }

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('시간표 상세 조회 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 시간표 생성
  static async createSchedule(req: Request, res: Response) {
    try {
      const scheduleData: CreateScheduleData = req.body;
      console.log('받은 스케줄 데이터:', scheduleData);

      // 필수 필드 검증
      if (!scheduleData.day_of_week || !scheduleData.time_slot || !scheduleData.subject || !scheduleData.teacher_id) {
        console.log('필수 필드 누락:', {
          day_of_week: scheduleData.day_of_week,
          time_slot: scheduleData.time_slot,
          subject: scheduleData.subject,
          teacher_id: scheduleData.teacher_id
        });
        return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
      }

      // 기존 스케줄 삭제
      const existingSchedule = await ScheduleModel.findByTimeSlot(scheduleData.day_of_week, scheduleData.time_slot);
      if (existingSchedule) {
        console.log('기존 스케줄 삭제:', existingSchedule.id);
        await ScheduleModel.delete(existingSchedule.id);
      }

      // 새 스케줄 생성
      console.log('새 스케줄 생성 시도:', scheduleData);
      const newSchedule = await ScheduleModel.create(scheduleData);
      console.log('새 스케줄 생성 성공:', newSchedule);
      res.status(201).json(newSchedule);
    } catch (error) {
      console.error('스케줄 생성 오류:', error);
      console.error('에러 스택:', error instanceof Error ? error.stack : '스택 없음');
      res.status(500).json({ error: '스케줄 생성에 실패했습니다.' });
    }
  }

  // 시간표 수정
  static async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateScheduleData = req.body;

      const existingSchedule = await ScheduleModel.findById(parseInt(id));
      if (!existingSchedule) {
        return res.status(404).json({ 
          success: false,
          error: '시간표를 찾을 수 없습니다.' 
        });
      }

      // 시간대 변경 시 충돌 확인
      if (updateData.day_of_week || updateData.time_slot) {
        const day = updateData.day_of_week || existingSchedule.day_of_week;
        const timeSlot = updateData.time_slot || existingSchedule.time_slot;
        const hasConflict = await ScheduleModel.checkConflict(day, timeSlot, parseInt(id));
        if (hasConflict) {
          return res.status(400).json({ 
            success: false,
            error: '해당 시간대에 이미 수업이 있습니다.' 
          });
        }
      }

      const updatedSchedule = await ScheduleModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: '시간표가 성공적으로 수정되었습니다.',
        data: updatedSchedule
      });
    } catch (error) {
      console.error('시간표 수정 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 시간표 삭제
  static async deleteSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingSchedule = await ScheduleModel.findById(parseInt(id));
      if (!existingSchedule) {
        return res.status(404).json({ 
          success: false,
          error: '시간표를 찾을 수 없습니다.' 
        });
      }

      const success = await ScheduleModel.delete(parseInt(id));

      if (success) {
        res.json({
          success: true,
          message: '시간표가 성공적으로 삭제되었습니다.'
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: '시간표 삭제에 실패했습니다.' 
        });
      }
    } catch (error) {
      console.error('시간표 삭제 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 시간대 목록 조회
  static async getTimeSlots(req: Request, res: Response) {
    try {
      const timeSlots = await ScheduleModel.getTimeSlots();

      res.json({
        success: true,
        data: timeSlots
      });
    } catch (error) {
      console.error('시간대 목록 조회 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 시간대 수정
  static async updateTimeSlot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, start_time, end_time } = req.body;

      const query = `
        UPDATE time_slots 
        SET slot_name = $1, start_time = $2, end_time = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const result = await pool.query(query, [title, start_time, end_time, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: '시간대를 찾을 수 없습니다.' 
        });
      }

      res.json({
        success: true,
        message: '시간대가 성공적으로 수정되었습니다.',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('시간대 수정 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 시간표 통계
  static async getScheduleStats(req: Request, res: Response) {
    try {
      const stats = await ScheduleModel.getScheduleStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('시간표 통계 조회 오류:', error);
      res.status(500).json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }
} 