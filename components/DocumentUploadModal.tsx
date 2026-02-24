"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

interface DocumentUploadModalProps {
  patientId: string;
  appointmentId?: string;
  onClose: () => void;
}

const uploadSchema = z.object({
  file: z.instanceof(File, { message: "Selectează un fișier" }),
  documentType: z.string().min(1, "Tipul documentului este obligatoriu"),
  category: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  uploadedBy: z.string().min(1, "Numele persoanei este obligatoriu"),
});

const documentTypes = [
  { value: "analysis", label: "Analiză" },
  { value: "image", label: "Imagine Medicală" },
  { value: "report", label: "Raport" },
  { value: "consent", label: "Consimțământ" },
  { value: "certificate", label: "Certificat" },
  { value: "other", label: "Altul" },
];

const categories = [
  { value: "external_analysis", label: "Analiză Externă" },
  { value: "radiology", label: "Radiologie" },
  { value: "laboratory", label: "Laborator" },
  { value: "consultation", label: "Consultație" },
  { value: "administrative", label: "Administrativ" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Altul" },
];

export const DocumentUploadModal = ({
  patientId,
  appointmentId,
  onClose,
}: DocumentUploadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      uploadedBy: "Medic",
    },
  });

  const watchedFile = form.watch("file");

  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", values.file);
      formData.append("patientId", patientId);
      if (appointmentId) formData.append("appointmentId", appointmentId);
      formData.append("documentType", values.documentType);
      if (values.category) formData.append("category", values.category);
      if (values.description) formData.append("description", values.description);
      if (values.tags) formData.append("tags", values.tags);
      formData.append("uploadedBy", values.uploadedBy);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Eroare la upload document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      form.setValue("file", e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document Medical</DialogTitle>
          <DialogDescription>
            Adaugă un document medical pentru acest pacient
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Upload Zone */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Fișier *</FormLabel>
                  <FormControl>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-green-500 bg-green-50"
                          : "border-dark-300 bg-gray-50"
                      }`}
                    >
                      {watchedFile ? (
                        <div className="space-y-2">
                          <p className="text-14-semibold text-dark-900">
                            {watchedFile.name}
                          </p>
                          <p className="text-12-regular text-dark-500">
                            {formatFileSize(watchedFile.size)}
                          </p>
                          <Button
                            type="button"
                            onClick={() => form.setValue("file", undefined as any)}
                            className="shad-gray-btn text-12-medium"
                            size="sm"
                          >
                            Schimbă fișierul
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-14-regular text-dark-600">
                            Trage fișierul aici sau click pentru a selecta
                          </p>
                          <p className="text-12-regular text-dark-500">
                            PDF, imagini, Word (max 10MB)
                          </p>
                          <Input
                            {...field}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onChange(file);
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="shad-primary-btn px-4 py-2 rounded-md text-14-medium cursor-pointer inline-block"
                          >
                            Selectează fișier
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tip Document *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează tip" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorie</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează categorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descriere</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Descriere document (opțional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag-uri</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: urgent, analiza-sange, radiografie (separate prin virgulă)"
                    />
                  </FormControl>
                  <p className="text-11-regular text-dark-500">
                    Tag-urile ajută la căutare și organizare
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uploadedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uploadat de *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nume persoană" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="shad-gray-btn"
                disabled={isLoading}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                className="shad-primary-btn"
                disabled={isLoading}
              >
                {isLoading ? "Se uploadă..." : "Upload Document"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
