import React, { useState } from 'react';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { garageAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const CommentSection = ({ vehicleId, comments = [], onCommentAdded, onCommentDeleted, isOwner = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            navigate('/login');
            return;
        }

        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const comment = await garageAPI.addComment(vehicleId, newComment.trim());
            onCommentAdded?.(comment);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        setDeletingId(commentId);
        try {
            await garageAPI.deleteComment(vehicleId, commentId);
            onCommentDeleted?.(commentId);
        } catch (error) {
            console.error('Failed to delete comment:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
        } catch {
            return '';
        }
    };

    const canDeleteComment = (comment) => {
        if (!user) return false;
        return user.id === comment.userId || isOwner || user.isAdmin;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-white">
                    Yorumlar ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "Bir yorum yazın..." : "Yorum yapmak için giriş yapın"}
                        disabled={!user || isSubmitting}
                        rows={3}
                        maxLength={500}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none pr-12"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                        {newComment.length}/500
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={!user || !newComment.trim() || isSubmitting}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Gönder
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500">Henüz yorum yok</p>
                        <p className="text-slate-600 text-sm">İlk yorumu siz yapın!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group relative p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-slate-300" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white">{comment.userName}</span>
                                        <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </p>
                                </div>

                                {/* Delete Button */}
                                {canDeleteComment(comment) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deletingId === comment.id}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        {deletingId === comment.id ? (
                                            <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
