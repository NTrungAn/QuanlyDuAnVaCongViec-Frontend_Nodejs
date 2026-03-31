import React, { useState, useEffect } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Comment } from "../../types/comment";
import { getCommentsByTask, createComment, deleteComment } from "../../api/comment.api";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  taskId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentUserJson = localStorage.getItem("user");
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
  const currentUserId = String(currentUser?.id || currentUser?._id || "");

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const data = await getCommentsByTask(taskId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await createComment({ content, task: taskId });
      setContent("");
      fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Không thể gửi bình luận.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá bình luận này?")) return;
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Không thể xoá bình luận.");
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-600" /> Thảo luận ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white font-bold text-xs uppercase">
              {currentUser?.fullName?.substring(0, 2) || "ME"}
            </span>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận hoặc thảo luận về công việc..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none pr-12"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-xs font-medium text-gray-400">
              Chưa có thảo luận nào cho công việc này.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id || comment.id}
                comment={comment}
                onDelete={handleDelete}
                isOwner={String(comment.user?._id || comment.user?.id) === currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
