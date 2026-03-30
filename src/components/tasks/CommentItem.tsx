import { Trash2 } from "lucide-react";
import { Comment } from "../../types/comment";

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  isOwner: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, isOwner }) => {
  return (
    <div className="flex gap-3 py-3 group">
      <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        {comment.user.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt={comment.user.fullName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-blue-600 font-bold text-[10px] uppercase">
            {comment.user.fullName.substring(0, 2)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 truncate">
              {comment.user.fullName}
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(comment.createdAt).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={() => onDelete(comment._id || comment.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
