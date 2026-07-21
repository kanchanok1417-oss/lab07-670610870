import express, { type Request, type Response } from "express";

// import middleware
import morgan from "morgan";

// import database
import { students } from "@db/db.js";
import { type Student } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json()); // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program as string | undefined;
    const studentId = req.query.studentId as string | undefined;

    let filteredStudents = students;

    if (studentId) {
      filteredStudents = filteredStudents.filter(
        (student) => student.studentId === studentId,
      );
    }

    if (program) {
      filteredStudents = filteredStudents.filter(
        (student) => student.program === program,
      );
    }

    return res.json({
      ok: true,
      students: filteredStudents,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId,
    );
    if (found) {
      return res.status(400).json({
        ok: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/api/students/${new_student.studentId}`);

    return res.json({
      ok: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student does not exist",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/api/students/${body.studentId}`);

    return res.json({
      ok: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as { studentId: string };

    const result = zStudentDeleteBody.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: result.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student ID does not exist",
      });
    }

    students.splice(foundIndex, 1);

    return res.status(200).json({
      ok: true,
      message: `Student Id ${body.studentId} has been deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// GET /api/me
app.get("/api/me", (req: Request, res: Response) => {
  return res.json({
    ok: true,
    fullName: "Kanchanok Trakankasikit",
    studentId: "670610870",
  });
});

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;