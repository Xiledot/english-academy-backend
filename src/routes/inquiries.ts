import express from 'express';
import * as inquiryController from '../controllers/inquiryController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 문의 목록 조회
router.get('/', inquiryController.getAllInquiries);

// 특정 문의 조회
router.get('/:id', inquiryController.getInquiryById);

// 새 문의 생성
router.post('/', inquiryController.createInquiry);

// 문의 수정
router.put('/:id', inquiryController.updateInquiry);

// 문의 삭제
router.delete('/:id', inquiryController.deleteInquiry);

// 문의 상태 업데이트
router.patch('/:id/status', inquiryController.updateInquiryStatus);

// 상태별 문의 조회
router.get('/status/:status', inquiryController.getInquiriesByStatus);

export default router; 