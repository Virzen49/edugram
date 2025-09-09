// Utility to group lectures by category → subject → chapters
 // keep your long lecture array in rawLectures.ts

import rawData from "./rawdata";



const lectures : any = [];

rawData.forEach((lec) => {
  let category = lectures.find((c : any) => c.category === lec.category);
  if (!category) {
    category = { category: lec.category, subject: [] };
    lectures.push(category);
  }

  let subject = category.subject.find((s : any) => s.id === lec.subject);
  if (!subject) {
    subject = {
      id: lec.subject,
      name: lec.module,
      icon: '📘', // assign icons manually later
      color: '#14B8A6',
      chapters: [],
    };
    category.subject.push(subject);
  }

  subject.chapters.push({
    id: lec.chapter,
    name: lec.title,
    progress: 0,
    total: 1,
    fileType: lec.file_type,
    fileUrl: lec.file_url,
    description: lec.description,
  });
});

export default lectures;