/* app/deadline.js — format deadline + deteksi bentrokan */
export const formatDeadline = (deadlineString) => {
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { badge: 'Terlambat', color: 'var(--error)', text: `Deadline lewat ${Math.abs(diffDays)} hari` };

  if (diffDays === 0) return { badge: 'Hari ini', color: 'var(--warning)', text: 'Deadline hari ini!' };

  if (diffDays <= 3) return { badge: '≤3 hari', color: 'var(--warning)', text: `${diffDays} hari lagi` };

  return { badge: 'Aman', color: 'var(--success)', text: `${diffDays} hari lagi` };
};

export const checkDeadlineCollision = (deadlineString, otherDeadlines) => {
  const deadline = new Date(deadlineString).getTime();
  const collisions = [];

  otherDeadlines.forEach(other => {
    const otherDeadline = new Date(other).getTime();
    const diff = Math.abs(deadline - otherDeadline);
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays <= 1 && diff > 0) {
      collisions.push({
        deadline: other,
        daysUntil: diffDays
      });
    }
  });

  return collisions;
};