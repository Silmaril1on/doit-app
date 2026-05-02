export async function getTaskGallery(objectiveId) {
  const res = await fetch(
    `/api/user/task/gallery?objectiveId=${encodeURIComponent(objectiveId)}`,
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load gallery");
  return data;
}

export async function getUserGallery(userId, offset = 0, limit = 15) {
  const res = await fetch(
    `/api/user/gallery?userId=${encodeURIComponent(userId)}&offset=${offset}&limit=${limit}`,
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load user gallery");
  return data; // { gallery: [...], total: N }
}

export async function deleteGalleryPhoto(objectiveId, subtaskId) {
  const res = await fetch("/api/user/task/gallery", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectiveId, subtaskId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}
