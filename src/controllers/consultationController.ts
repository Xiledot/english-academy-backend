import { Request, Response } from 'express';
import * as ConsultationModel from '../models/Consultation';

export const getAllConsultations = async (req: Request, res: Response) => {
  try {
    const consultations = await ConsultationModel.getAllConsultations();
    res.json(consultations);
  } catch (error) {
    console.error('상담 목록 조회 오류:', error);
    res.status(500).json({ error: '상담 목록을 불러오는데 실패했습니다.' });
  }
};

export const getConsultationById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const consultation = await ConsultationModel.getConsultationById(id);
    
    if (!consultation) {
      return res.status(404).json({ error: '상담을 찾을 수 없습니다.' });
    }
    
    res.json(consultation);
  } catch (error) {
    console.error('상담 조회 오류:', error);
    res.status(500).json({ error: '상담을 불러오는데 실패했습니다.' });
  }
};

export const createConsultation = async (req: Request, res: Response) => {
  try {
    const {
      inquiry_id, student_id, consultation_date, attendees, content, registration_status,
      teacher, test_type, vocabulary_score, structure_score, grammar_score, reading_score, language_score, listening_score
    } = req.body;
    
    if (!consultation_date || !attendees || !content) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    // 현재 로그인한 사용자 ID 가져오기 (실제로는 JWT 토큰에서 추출)
    const created_by = (req as any).user?.id || 1;
    
    const consultation = await ConsultationModel.createConsultation({
      inquiry_id,
      student_id,
      consultation_date,
      attendees,
      content,
      registration_status: registration_status || 'pending',
      created_by,
      teacher,
      test_type,
      vocabulary_score,
      structure_score,
      grammar_score,
      reading_score,
      language_score,
      listening_score
    });
    
    res.status(201).json(consultation);
  } catch (error) {
    console.error('상담 생성 오류:', error);
    res.status(500).json({ error: '상담을 생성하는데 실패했습니다.' });
  }
};

export const updateConsultation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const consultation = await ConsultationModel.updateConsultation(id, updateData);
    
    if (!consultation) {
      return res.status(404).json({ error: '상담을 찾을 수 없습니다.' });
    }
    
    res.json(consultation);
  } catch (error) {
    console.error('상담 수정 오류:', error);
    res.status(500).json({ error: '상담을 수정하는데 실패했습니다.' });
  }
};

export const deleteConsultation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await ConsultationModel.deleteConsultation(id);
    
    if (!success) {
      return res.status(404).json({ error: '상담을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '상담이 삭제되었습니다.' });
  } catch (error) {
    console.error('상담 삭제 오류:', error);
    res.status(500).json({ error: '상담을 삭제하는데 실패했습니다.' });
  }
};

export const getConsultationsByInquiryId = async (req: Request, res: Response) => {
  try {
    const inquiry_id = parseInt(req.params.inquiry_id);
    const consultations = await ConsultationModel.getConsultationsByInquiryId(inquiry_id);
    res.json(consultations);
  } catch (error) {
    console.error('문의별 상담 조회 오류:', error);
    res.status(500).json({ error: '상담 목록을 불러오는데 실패했습니다.' });
  }
};

export const getConsultationsByStudentId = async (req: Request, res: Response) => {
  try {
    const student_id = parseInt(req.params.student_id);
    const consultations = await ConsultationModel.getConsultationsByStudentId(student_id);
    res.json(consultations);
  } catch (error) {
    console.error('학생별 상담 조회 오류:', error);
    res.status(500).json({ error: '상담 목록을 불러오는데 실패했습니다.' });
  }
}; 