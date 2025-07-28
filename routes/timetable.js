const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// 시간표 조회
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM time_slots 
      ORDER BY 
        CASE day 
          WHEN 'monday' THEN 1 
          WHEN 'tuesday' THEN 2 
          WHEN 'wednesday' THEN 3 
          WHEN 'thursday' THEN 4 
          WHEN 'friday' THEN 5 
          WHEN 'saturday' THEN 6 
          WHEN 'special' THEN 7 
        END, 
        time_slot ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('시간표 조회 오류:', error);
    res.status(500).json({ error: '시간표 조회 실패' });
  }
});

// 오늘 시간표 가져오기
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    
    const query = `
      SELECT 
        ts.id,
        ts.time_slot,
        ts.student_name,
        ts.subject,
        ts.day
      FROM time_slots ts
      WHERE ts.day = $1
      ORDER BY ts.time_slot ASC
    `;
    
    const result = await pool.query(query, [todayName]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('오늘 시간표 조회 오류:', error);
    res.status(500).json({ error: '오늘 시간표 조회 실패' });
  }
});

// 시간표 업데이트
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, subject } = req.body;
    
    const query = `
      UPDATE time_slots 
      SET student_name = $1, subject = $2 
      WHERE id = $3
    `;
    
    await pool.query(query, [student_name, subject, id]);
    res.json({ message: '시간표 업데이트 성공' });
  } catch (error) {
    console.error('시간표 업데이트 오류:', error);
    res.status(500).json({ error: '시간표 업데이트 실패' });
  }
});

// 시간대 업데이트
router.put('/time/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { time_slot } = req.body;
    
    const query = `
      UPDATE time_slots 
      SET time_slot = $1 
      WHERE id = $2
    `;
    
    await pool.query(query, [time_slot, id]);
    res.json({ message: '시간대 업데이트 성공' });
  } catch (error) {
    console.error('시간대 업데이트 오류:', error);
    res.status(500).json({ error: '시간대 업데이트 실패' });
  }
});

module.exports = router; 