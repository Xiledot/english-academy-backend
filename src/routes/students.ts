import express from 'express';
import * as studentController from '../controllers/studentController';

const router = express.Router();

// 학생 통계 조회
router.get('/stats', studentController.getStudentStats);

// 오늘 수업 예정인 학생들 조회
router.get('/today', studentController.getTodayStudents);

// 학생 목록 조회
router.get('/', studentController.getStudents);
// 학생 단건 조회
router.get('/:id', studentController.getStudent);
// 학생 등록
router.post('/', studentController.createStudent);
// 학생 정보 수정
router.put('/:id', studentController.updateStudent);
// 학생 삭제
router.delete('/:id', studentController.deleteStudent);

export default router; 