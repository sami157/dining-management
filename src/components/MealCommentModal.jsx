import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const MealCommentModal = ({ open, title, initialComment = '', saving = false, onClose, onSave }) => {
    const [comment, setComment] = useState(initialComment);

    useEffect(() => {
        if (open) {
            setComment(initialComment || '');
        }
    }, [open, initialComment]);

    if (!open) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-[92vw] max-w-md border border-base-300 shadow-2xl">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{title}</h3>
                        <p className="text-xs uppercase tracking-widest opacity-50">Optional meal note</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Close comment editor"
                    >
                        <X size={16} />
                    </button>
                </div>

                <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="textarea textarea-bordered w-full min-h-28"
                    placeholder="Add a comment"
                />

                <div className="modal-action">
                    <button
                        type="button"
                        onClick={() => onSave(comment)}
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

export default MealCommentModal;
