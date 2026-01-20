"use client";

import { MedicalDocument } from "@/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";

interface DocumentViewerModalProps {
  document: MedicalDocument;
  onClose: () => void;
  onDownload: () => void;
}

export const DocumentViewerModal = ({
  document,
  onClose,
  onDownload,
}: DocumentViewerModalProps) => {
  const isImage = document.mimeType.startsWith("image/");
  const isPDF = document.mimeType === "application/pdf";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document.originalFileName}</DialogTitle>
          <DialogDescription>
            {document.description || "Document medical"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informații document */}
          <div className="rounded-lg border border-dark-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-12-regular">
              <div>
                <span className="text-dark-500">Tip:</span>{" "}
                <span className="text-dark-900">{document.documentType}</span>
              </div>
              <div>
                <span className="text-dark-500">Dimensiune:</span>{" "}
                <span className="text-dark-900">
                  {formatFileSize(document.fileSize)}
                </span>
              </div>
              <div>
                <span className="text-dark-500">Uploadat:</span>{" "}
                <span className="text-dark-900">
                  {formatDateTime(document.uploadedAt).dateTime}
                </span>
              </div>
              <div>
                <span className="text-dark-500">De:</span>{" "}
                <span className="text-dark-900">{document.uploadedBy}</span>
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-10-regular bg-blue-100 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview document */}
          <div className="rounded-lg border border-dark-200 bg-white p-4">
            {isImage ? (
              <img
                src={document.filePath}
                alt={document.originalFileName}
                className="max-w-full h-auto rounded"
              />
            ) : isPDF ? (
              <iframe
                src={document.filePath}
                className="w-full h-[600px] rounded border"
                title={document.originalFileName}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-16-regular text-dark-600 mb-4">
                  Preview nu este disponibil pentru acest tip de fișier
                </p>
                <Button onClick={onDownload} className="shad-primary-btn">
                  Descarcă pentru vizualizare
                </Button>
              </div>
            )}
          </div>

          {/* Acțiuni */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} className="shad-gray-btn">
              Închide
            </Button>
            <Button onClick={onDownload} className="shad-primary-btn">
              ⬇️ Descarcă
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
