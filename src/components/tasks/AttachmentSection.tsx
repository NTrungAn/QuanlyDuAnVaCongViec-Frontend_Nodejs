import React, { useState, useEffect } from "react";
import { Paperclip, Loader2, Trash2, File } from "lucide-react";
import { Attachment } from "../../types/task";
import { getAttachments, uploadAttachment, deleteAttachment } from "../../api/task.api";
import { BASE_URL } from "../../api/axios";

interface AttachmentSectionProps {
  taskId: string;
}

const AttachmentSection: React.FC<AttachmentSectionProps> = ({ taskId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const currentUserJson = localStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const userRole = currentUser?.role || "";

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const data = await getAttachments(taskId);
      setAttachments(data);
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadAttachment(taskId, file);
      fetchAttachments();
    } catch (error: any) {
      console.error("Failed to upload attachment:", error);
      alert(error.response?.data?.message || "Lỗi tải tệp. Bạn có quyền thao tác trong dự án này không?");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá tệp đính kèm này?")) return;
    try {
      await deleteAttachment(taskId, attachmentId);
      fetchAttachments();
    } catch (error: any) {
      console.error("Failed to delete attachment:", error);
      alert(error.response?.data?.message || "Không thể xoá tệp này. Bạn có quyền thao tác không?");
    }
  };

  const getFullUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-orange-500" /> Hình ảnh minh chứng / Đính kèm ({attachments.length})
        </h3>
        
        <div>
          <input
            type="file"
            id={`upload-${taskId}`}
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <label
            htmlFor={`upload-${taskId}`}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              uploading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
            }`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            {uploading ? "Đang tải lên..." : "Tải tệp lên"}
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-sm font-medium text-gray-400">
              Chưa có tài liệu hoặc hình ảnh minh chứng nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attachments.map((attachment) => {
              const uploaderId = String(attachment.uploadedBy?._id || "");
              const canDelete = uploaderId === currentUserId || userRole === "ADMIN";
              const asImage = isImage(attachment.fileName);

              return (
                <div key={attachment._id} className="group flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {asImage ? (
                      <img src={getFullUrl(attachment.fileUrl)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <File className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a 
                      href={getFullUrl(attachment.fileUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-gray-800 hover:text-orange-600 truncate block transition-colors"
                      title={attachment.fileName}
                    >
                      {attachment.fileName}
                    </a>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      Bởi: {attachment.uploadedBy?.fullName || "Người dùng"}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(attachment._id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                      title="Xóa tệp"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentSection;
