export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "agro-saviour");
  formData.append("cloud_name", "dm1ivhfgv");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dm1ivhfgv/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url;
}
