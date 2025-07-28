const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// 최근 알림 조회
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    // 실제 알림 테이블이 없으므로 임시 데이터 반환
    const notifications = [
      {
        id: 1,
        title: '새 학생 등록',
        message: '김영희 학생이 등록되었습니다.',
        type: 'success',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
        read: false
      },
      {
        id: 2,
        title: '상담 일정',
        message: '내일 오후 2시 상담이 예정되어 있습니다.',
        type: 'info',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4시간 전
        read: false
      },
      {
        id: 3,
        title: '시험 결과',
        message: '월말 시험 결과가 업로드되었습니다.',
        type: 'success',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
        read: true
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('알림 조회 오류:', error);
    res.status(500).json({ error: '알림 조회 실패' });
  }
});

// 알림 생성
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, message, type, user_id } = req.body;
    
    const query = `
      INSERT INTO notifications (title, message, type, user_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, message, type, user_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('알림 생성 오류:', error);
    res.status(500).json({ error: '알림 생성 실패' });
  }
});

// 알림 읽음 처리
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
    res.json({ message: '알림 읽음 처리 완료' });
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    res.status(500).json({ error: '알림 읽음 처리 실패' });
  }
});

module.exports = router; 