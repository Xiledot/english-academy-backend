import pool from '../config/database';

export interface Student {
  id: number;
  name: string;
  birth_date: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export const getAllStudents = async (): Promise<Student[]> => {
  const res = await pool.query('SELECT * FROM students ORDER BY id DESC');
  return res.rows;
};

export const getStudentById = async (id: number): Promise<Student | null> => {
  const res = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  const { name, birth_date, phone, parent_name, parent_phone, memo } = student;
  const res = await pool.query(
    `INSERT INTO students (name, birth_date, phone, parent_name, parent_phone, memo)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, birth_date, phone, parent_name, parent_phone, memo]
  );
  return res.rows[0];
};

export const updateStudent = async (id: number, student: Partial<Student>): Promise<Student | null> => {
  const fields = Object.keys(student);
  const values = Object.values(student);
  if (fields.length === 0) return getStudentById(id);
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const res = await pool.query(
    `UPDATE students SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return res.rows[0] || null;
};

export const deleteStudent = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM students WHERE id = $1', [id]);
  return !!res.rowCount && res.rowCount > 0;
}; 