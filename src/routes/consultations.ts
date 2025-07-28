import express from 'express';
import * as consultationController from '../controllers/consultationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 상담 목록 조회
router.get('/', consultationController.getAllConsultations);

// 특정 상담 조회
router.get('/:id', consultationController.getConsultationById);

// 새 상담 생성
router.post('/', consultationController.createConsultation);

// 상담 수정
router.put('/:id', consultationController.updateConsultation);

// 상담 삭제
router.delete('/:id', consultationController.deleteConsultation);

// 문의별 상담 조회
router.get('/inquiry/:inquiry_id', consultationController.getConsultationsByInquiryId);

// 학생별 상담 조회
router.get('/student/:student_id', consultationController.getConsultationsByStudentId);

export default router; 