const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// 학생 통계 조회
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 전체 학생 수
    const totalQuery = 'SELECT COUNT(*) as total FROM students WHERE is_active = true';
    const totalResult = await pool.query(totalQuery);
    const totalStudents = parseInt(totalResult.rows[0].total);

    // 활성 학생 수 (최근 30일 내 활동)
    const activeQuery = `
      SELECT COUNT(*) as active 
      FROM students 
      WHERE is_active = true 
      AND last_activity >= NOW() - INTERVAL '30 days'
    `;
    const activeResult = await pool.query(activeQuery);
    const activeStudents = parseInt(activeResult.rows[0].active);

    // 오늘 출석 수 (임시 데이터)
    const todayAttendance = Math.floor(Math.random() * 20) + 10; // 10-30명

    // 출석률 계산
    const attendanceRate = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

    // 신규 학생 수 (최근 7일)
    const newStudentsQuery = `
      SELECT COUNT(*) as new_students 
      FROM students 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;
    const newStudentsResult = await pool.query(newStudentsQuery);
    const newStudents = parseInt(newStudentsResult.rows[0].new_students);

    res.json({
      totalStudents,
      activeStudents,
      todayAttendance,
      attendanceRate,
      newStudents
    });
  } catch (error) {
    console.error('학생 통계 조회 오류:', error);
    res.status(500).json({ error: '학생 통계 조회 실패' });
  }
});

// 학생 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM students ORDER BY name ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('학생 목록 조회 오류:', error);
    res.status(500).json({ error: '학생 목록 조회 실패' });
  }
});

// 학생 추가
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, grade, school, phone, parent_phone, email, address, notes } = req.body;
    
    const query = `
      INSERT INTO students (name, grade, school, phone, parent_phone, email, address, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, grade, school, phone, parent_phone, email, address, notes]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('학생 추가 오류:', error);
    res.status(500).json({ error: '학생 추가 실패' });
  }
});

// 학생 수정
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, school, phone, parent_phone, email, address, notes } = req.body;
    
    const query = `
      UPDATE students 
      SET name = $1, grade = $2, school = $3, phone = $4, parent_phone = $5, email = $6, address = $7, notes = $8
      WHERE id = $9
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, grade, school, phone, parent_phone, email, address, notes, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('학생 수정 오류:', error);
    res.status(500).json({ error: '학생 수정 실패' });
  }
});

// 학생 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM students WHERE id = $1';
    await pool.query(query, [id]);
    
    res.json({ message: '학생 삭제 성공' });
  } catch (error) {
    console.error('학생 삭제 오류:', error);
    res.status(500).json({ error: '학생 삭제 실패' });
  }
});

module.exports = router; 