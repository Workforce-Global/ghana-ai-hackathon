"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  onRemoveImage: () => void
  disabled?: boolean
}

export function ImageUpload({ onImageSelect, selectedImage, onRemoveImage, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        onImageSelect(file)
        const reader = new FileReader()
        reader.onload = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
      }
    },
    [onImageSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    disabled,
  })

  const handleRemove = () => {
    onRemoveImage()
    setPreview(null)
  }

  if (selectedImage && preview) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="relative">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Selected crop image"
              width={400}
              height={300}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">{selectedImage.name}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-primary" />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            )}
            <div>
              <p className="text-lg font-medium">{isDragActive ? "Drop the image here" : "Upload crop image"}</p>
              <p className="text-sm text-muted-foreground">Drag & drop or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">Supports: JPEG, PNG, WebP</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
