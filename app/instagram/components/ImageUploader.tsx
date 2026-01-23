"use client";

import { uploadImage } from "../lib/imageUpload";

export function ImageUploader() {
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    location.reload(); // simple refresh for now
  };

  return (
    <label className="cursor-pointer text-white text-sm opacity-80">
      Upload Image
      <input type="file" accept="image/*" hidden onChange={onUpload} />
    </label>
  );
}
