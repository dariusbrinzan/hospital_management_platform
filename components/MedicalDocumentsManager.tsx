"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { formatDateTime } from "@/lib/utils";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface MedicalDocumentsManagerProps {
  patientId: string;
  appointmentId?: string;
  canUpload?: boolean;
}

const documentTypeLabels: Record<string, string> = {
  analysis: "Analiză",
  image: "Imagine Medicală",
  report: "Raport",
  consent: "Consimțământ",
  certificate: "Certificat",
  other: "Altul",
};

const categoryLabels: Record<string, string> = {
  external_analysis: "Analiză Externă",
  radiology: "Radiologie",
  laboratory: "Laborator",
  consultation: "Consultație",
  administrative: "Administrativ",
  legal: "Legal",
  other: "Altul",
};

export const MedicalDocumentsManager = ({
  patientId,
  appointmentId,
  canUpload = true,
}: MedicalDocumentsManagerProps) => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDocuments();
  }, [patientId, appointmentId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ patientId });
      if (appointmentId) params.append("appointmentId", appointmentId);
      if (filterType !== "all") params.append("documentType", filterType);

      const response = await fetch(`/api/documents?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi acest document?")) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedBy: "User" }),
      });

      if (response.ok) {
        loadDocuments();
      } else {
        alert("Eroare la ștergerea documentului");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Eroare la ștergerea documentului");
    }
  };

  const handleDownload = async (doc: MedicalDocument) => {
    try {
      const response = await fetch(`/api/documents/${doc.$id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = doc.originalFileName;
        window.document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Eroare la descărcarea documentului");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Eroare la descărcarea documentului");
    }
  };

  const handleView = (document: MedicalDocument) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.includes("word")) return "📝";
    return "📎";
  };

  const filteredDocuments = documents.filter((doc) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.originalFileName.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-18-semibold">Documente Medicale</h3>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)} className="shad-primary-btn">
            + Adaugă Document
          </Button>
        )}
      </div>

      {/* Filtre */}
      <div className="flex gap-4 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrează după tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            {Object.entries(documentTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Caută documente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-md"
        />
      </div>

      {/* Lista documente */}
      {isLoading ? (
        <div className="text-center py-8 text-dark-600">Se încarcă...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="rounded-lg border border-dark-200 bg-white p-8 text-center">
          <p className="text-16-regular text-dark-600">
            Nu există documente pentru acest pacient
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <div
              key={document.$id}
              className="rounded-lg border border-dark-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getFileIcon(document.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-14-semibold text-dark-900 truncate">
                      {document.originalFileName}
                    </h4>
                    <p className="text-12-regular text-dark-500 mt-1">
                      {documentTypeLabels[document.documentType] || document.documentType}
                      {document.category && ` • ${categoryLabels[document.category] || document.category}`}
                    </p>
                  </div>
                </div>
              </div>

              {document.description && (
                <p className="text-12-regular text-dark-600 mb-2 line-clamp-2">
                  {document.description}
                </p>
              )}

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
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

              <div className="text-11-regular text-dark-500 mb-3">
                <p>Uploadat: {formatDateTime(document.uploadedAt).dateOnly}</p>
                <p>De: {document.uploadedBy}</p>
                <p>Dimensiune: {formatFileSize(document.fileSize)}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleView(document)}
                  className="flex-1 shad-primary-btn text-12-medium"
                  size="sm"
                >
                  Vizualizează
                </Button>
                <Button
                  onClick={() => handleDownload(document)}
                  className="shad-gray-btn text-12-medium"
                  size="sm"
                >
                  ⬇️
                </Button>
                {canUpload && (
                  <Button
                    onClick={() => handleDelete(document.$id)}
                    className="shad-gray-btn text-12-medium text-red-600 hover:text-red-700"
                    size="sm"
                  >
                    🗑️
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          patientId={patientId}
          appointmentId={appointmentId}
          onClose={() => {
            setShowUploadModal(false);
            loadDocuments();
          }}
        />
      )}

      {showViewer && selectedDocument && (
        <DocumentViewerModal
          document={selectedDocument}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
          onDownload={() => handleDownload(selectedDocument)}
        />
      )}
    </div>
  );
};
