import pool from '../config/database';

export interface Consultation {
  id: number;
  inquiry_id?: number;
  student_id?: number;
  consultation_date: string;
  attendees: string;
  content: string;
  registration_status: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  inquiry_name?: string;
  student_name?: string;
  created_by_name?: string;
  teacher?: string;
  test_type?: string;
  vocabulary_score?: number;
  structure_score?: number;
  grammar_score?: number;
  reading_score?: number;
  language_score?: number;
  listening_score?: number;
}

export const getAllConsultations = async (): Promise<Consultation[]> => {
  const res = await pool.query(`
    SELECT c.*, i.name as inquiry_name, s.name as student_name, u.name as created_by_name
    FROM consultations c
    LEFT JOIN inquiries i ON c.inquiry_id = i.id
    LEFT JOIN students s ON c.student_id = s.id
    LEFT JOIN users u ON c.created_by = u.id
    ORDER BY c.consultation_date DESC
  `);
  return res.rows;
};

export const getConsultationById = async (id: number): Promise<Consultation | null> => {
  const res = await pool.query(`
    SELECT c.*, i.name as inquiry_name, s.name as student_name, u.name as created_by_name
    FROM consultations c
    LEFT JOIN inquiries i ON c.inquiry_id = i.id
    LEFT JOIN students s ON c.student_id = s.id
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.id = $1
  `, [id]);
  return res.rows[0] || null;
};

export const createConsultation = async (consultation: Omit<Consultation, 'id'>): Promise<Consultation> => {
  const {
    inquiry_id, student_id, consultation_date, attendees, content, registration_status, created_by,
    teacher, test_type, vocabulary_score, structure_score, grammar_score, reading_score, language_score, listening_score
  } = consultation;
  
  const res = await pool.query(
    `INSERT INTO consultations (inquiry_id, student_id, consultation_date, attendees, content, registration_status, created_by, teacher, test_type, vocabulary_score, structure_score, grammar_score, reading_score, language_score, listening_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
    [inquiry_id, student_id, consultation_date, attendees, content, registration_status, created_by, teacher, test_type, vocabulary_score, structure_score, grammar_score, reading_score, language_score, listening_score]
  );
  return res.rows[0];
};

export const updateConsultation = async (id: number, consultation: Partial<Consultation>): Promise<Consultation | null> => {
  // 허용된 필드만 필터링
  const allowedFields = ['consultation_date', 'attendees', 'content', 'registration_status', 'teacher', 'test_type', 'vocabulary_score', 'structure_score', 'grammar_score', 'reading_score', 'language_score', 'listening_score'];
  const fields = Object.keys(consultation).filter(f => allowedFields.includes(f));
  const values = fields.map(f => (consultation as any)[f]);
  if (fields.length === 0) return getConsultationById(id);
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const res = await pool.query(
    `UPDATE consultations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return res.rows[0] || null;
};

export const deleteConsultation = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM consultations WHERE id = $1', [id]);
  return !!res.rowCount && res.rowCount > 0;
};

export const getConsultationsByInquiryId = async (inquiry_id: number): Promise<Consultation[]> => {
  const res = await pool.query(`
    SELECT c.*, i.name as inquiry_name, s.name as student_name, u.name as created_by_name
    FROM consultations c
    LEFT JOIN inquiries i ON c.inquiry_id = i.id
    LEFT JOIN students s ON c.student_id = s.id
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.inquiry_id = $1
    ORDER BY c.consultation_date DESC
  `, [inquiry_id]);
  return res.rows;
};

export const getConsultationsByStudentId = async (student_id: number): Promise<Consultation[]> => {
  const res = await pool.query(`
    SELECT c.*, i.name as inquiry_name, s.name as student_name, u.name as created_by_name
    FROM consultations c
    LEFT JOIN inquiries i ON c.inquiry_id = i.id
    LEFT JOIN students s ON c.student_id = s.id
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.student_id = $1
    ORDER BY c.consultation_date DESC
  `, [student_id]);
  return res.rows;
}; 