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
