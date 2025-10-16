import { eq } from 'drizzle-orm';
import { db } from './index';
import { notes } from './schema';

export async function getPendingNotes() {
  return await db.select().from(notes).where(eq(notes.status, 'pending')).orderBy(notes.createdAt);
}

export async function getApprovedNotes() {
  return await db
    .select({
      id: notes.id,
      name: notes.name,
      title: notes.title,
      message: notes.message,
      createdAt: notes.createdAt,
    })
    .from(notes)
    .where(eq(notes.status, 'approved'))
    .orderBy(notes.createdAt);
}

export async function approveNote(noteId: number) {
  return await db
    .update(notes)
    .set({
      status: 'approved',
      approvedAt: new Date(),
    })
    .where(eq(notes.id, noteId));
}

export async function rejectNote(noteId: number) {
  return await db.update(notes).set({ status: 'rejected' }).where(eq(notes.id, noteId));
}
