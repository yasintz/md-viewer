import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CommentReply {
  id: string;
  text: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
  replies: CommentReply[];
}

export interface CommentHistory {
  id: string;
  fileName: string;
  filePath?: string;
  comments: Comment[];
  savedAt: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export interface FileComments {
  [filePath: string]: Comment[];
}

interface MarkdownReviewerState {
  // Single file mode
  markdownContent: string;
  currentFileName: string;
  comments: Comment[];
  
  // Folder mode
  isFolderMode: boolean;
  folderHandle: FileSystemDirectoryHandle | null;
  folderName: string;
  fileTree: FileTreeNode[];
  currentFilePath: string | null;
  fileComments: FileComments; // Comments per file path
  
  // Shared
  commentHistory: CommentHistory[];
  selectedHistoryId: string | null;
  selectedText: string;
  showCommentDialog: boolean;
  showExportDialog: boolean;
  commentText: string;
  selectionPosition: { line: number; column: number } | null;
  commentsSidebarCollapsed: boolean;
  
  // File Watcher Module state
  configId: string | null;
  sortBy: 'name' | 'changed' | 'created';
  selectedFilePath: string | null;
  showFileTree: boolean;
  showTableOfContents: boolean;

  // Actions
  setMarkdownContent: (content: string, fileName: string) => void;
  setFolderMode: (folderHandle: FileSystemDirectoryHandle | null, folderName: string, fileTree: FileTreeNode[]) => void;
  setCurrentFile: (filePath: string) => void;
  addComment: (comment: Comment, filePath?: string) => void;
  addReplyToComment: (commentId: string, reply: CommentReply, filePath?: string) => void;
  deleteComment: (id: string, filePath?: string) => void;
  deleteReply: (commentId: string, replyId: string, filePath?: string) => void;
  updateComment: (id: string, text: string, filePath?: string) => void;
  updateReply: (commentId: string, replyId: string, text: string, filePath?: string) => void;
  setSelectedText: (text: string) => void;
  setShowCommentDialog: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setCommentText: (text: string) => void;
  setSelectionPosition: (
    position: { line: number; column: number } | null
  ) => void;
  saveCurrentCommentsToHistory: () => void;
  loadHistoryComments: (historyId: string) => void;
  setSelectedHistoryId: (id: string | null) => void;
  resetComments: () => void;
  clearCommentDialog: () => void;
  setCommentsSidebarCollapsed: (collapsed: boolean) => void;
  getCurrentFileComments: () => Comment[];
  
  // File Watcher Module actions
  setConfigId: (configId: string | null) => void;
  setSortBy: (sortBy: 'name' | 'changed' | 'created') => void;
  setSelectedFilePath: (filePath: string | null) => void;
  setShowFileTree: (show: boolean) => void;
  setShowTableOfContents: (show: boolean) => void;
}

export const useMarkdownReviewerStore = create<MarkdownReviewerState>()(
  persist(
    (set, get) => ({
      markdownContent: '',
      currentFileName: '',
      comments: [],
      isFolderMode: false,
      folderHandle: null,
      folderName: '',
      fileTree: [],
      currentFilePath: null,
      fileComments: {},
      commentHistory: [],
      selectedHistoryId: null,
      selectedText: '',
      showCommentDialog: false,
      showExportDialog: false,
      commentText: '',
      selectionPosition: null,
      commentsSidebarCollapsed: false,
      
      // File Watcher Module state
      configId: null,
      sortBy: 'name',
      selectedFilePath: null,
      showFileTree: true,
      showTableOfContents: true,

      setMarkdownContent: (content, fileName) => {
        const state = get();

        // Check if content actually changed
        const contentChanged = state.markdownContent !== content;
        const fileNameChanged = state.currentFileName !== fileName;
        
        // Check if this is initial load (markdownContent is empty)
        // This happens when page refreshes - markdownContent isn't persisted but comments are
        const isInitialLoad = !state.markdownContent && content && !state.isFolderMode;
        
        // ALWAYS check localStorage for comments on initial load to prevent clearing them
        // This is critical because Zustand might not have hydrated yet when setMarkdownContent is called
        let hasStoredComments = false;
        let storedComments: Comment[] = [];
        if (isInitialLoad) {
          try {
            const stored = localStorage.getItem('markdown-reviewer-storage');
            if (stored) {
              const parsed = JSON.parse(stored);
              // Zustand persist stores as { state: {...}, version: 0 } or just the state directly
              storedComments = parsed?.state?.comments || parsed?.comments || [];
              const storedFileName = parsed?.state?.currentFileName || '';
              // If we have stored comments, preserve them if:
              // 1. fileName matches stored fileName, OR
              // 2. currentFileName is empty (first load), OR  
              // 3. currentFileName matches fileName
              hasStoredComments = storedComments.length > 0 && (
                storedFileName === fileName || 
                state.currentFileName === fileName || 
                !state.currentFileName ||
                !storedFileName
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
        
        const shouldPreserveComments = isInitialLoad && (state.comments.length > 0 || hasStoredComments);
        
        // Don't clear comments on initial load of same file (page refresh scenario)
        if (shouldPreserveComments) {
          // Restore comments from localStorage if they exist and state doesn't have them yet
          const commentsToUse = state.comments.length > 0 ? state.comments : (hasStoredComments ? storedComments : []);
          // Just update the content without clearing comments
          set({
            markdownContent: content,
            currentFileName: fileName,
            comments: commentsToUse, // Restore comments if they were in localStorage
          });
          return;
        }
        
        // Only save to history and clear comments if content actually changed
        if (contentChanged || fileNameChanged) {
          let updatedHistory = state.commentHistory;
          const currentComments = state.isFolderMode && state.currentFilePath
            ? state.fileComments[state.currentFilePath] || []
            : state.comments;
            
          if (currentComments.length > 0) {
            // Save current comments to history before updating content
            const historyEntry: CommentHistory = {
              id: Date.now().toString(),
              fileName: state.currentFileName || fileName,
              filePath: state.currentFilePath || undefined,
              comments: currentComments,
              savedAt: Date.now(),
            };
            updatedHistory = [...state.commentHistory, historyEntry];
          }

          // Update content and clear comments for current file only if content changed
          if (state.isFolderMode && state.currentFilePath) {
            // In folder mode, clear comments for the current file
            const updatedFileComments = { ...state.fileComments };
            updatedFileComments[state.currentFilePath] = [];
            set({
              markdownContent: content,
              currentFileName: fileName,
              fileComments: updatedFileComments,
              commentHistory: updatedHistory,
              selectedHistoryId: null,
            });
          } else {
            // Single file mode
            set({
              markdownContent: content,
              currentFileName: fileName,
              comments: [],
              commentHistory: updatedHistory,
              selectedHistoryId: null,
            });
          }
        } else {
          // Content hasn't changed, just update the fileName if needed (shouldn't happen, but safe)
          if (fileNameChanged) {
            set({ currentFileName: fileName });
          }
        }
      },

      setFolderMode: (folderHandle, folderName, fileTree) => {
        set({
          isFolderMode: folderHandle !== null,
          folderHandle,
          folderName,
          fileTree,
          currentFilePath: null,
          markdownContent: '',
          currentFileName: '',
        });
      },

      setCurrentFile: (filePath) => {
        const state = get();
        // In single file mode, don't overwrite comments from fileComments (which is empty)
        // Only use fileComments in folder mode
        if (state.isFolderMode) {
          const fileComments = state.fileComments[filePath] || [];
          set({
            currentFilePath: filePath,
            comments: fileComments, // Set comments for the selected file
          });
        } else {
          // Single file mode - just set currentFilePath, preserve existing comments
          set({
            currentFilePath: filePath,
            // Don't overwrite comments in single file mode - they're stored in state.comments
          });
        }
      },

      getCurrentFileComments: () => {
        const state = get();
        const result = state.isFolderMode && state.currentFilePath
          ? state.fileComments[state.currentFilePath] || []
          : state.comments;
        return result;
      },

      saveCurrentCommentsToHistory: () => {
        const state = get();
        const currentComments = state.isFolderMode && state.currentFilePath
          ? state.fileComments[state.currentFilePath] || []
          : state.comments;
          
        if (!state.currentFileName || currentComments.length === 0) return;

        const historyEntry: CommentHistory = {
          id: Date.now().toString(),
          fileName: state.currentFileName,
          filePath: state.currentFilePath || undefined,
          comments: currentComments,
          savedAt: Date.now(),
        };

        set({
          commentHistory: [...state.commentHistory, historyEntry],
        });
      },

      loadHistoryComments: (historyId) => {
        const state = get();
        const history = state.commentHistory.find((h) => h.id === historyId);
        if (history) {
          set({
            selectedHistoryId: historyId,
          });
        }
      },

      setSelectedHistoryId: (id) => set({ selectedHistoryId: id }),

      addComment: (comment, filePath) =>
        set((state) => {
          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const newFileComments = {
              ...state.fileComments,
              [filePath]: [...fileComments, comment],
            };
            return {
              fileComments: newFileComments,
              comments: [...fileComments, comment], // Update current comments
            };
          }
          return { comments: [...state.comments, comment] };
        }),

      addReplyToComment: (commentId, reply, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...(c.replies || []), reply] }
                : c
            );

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      deleteComment: (id, filePath) =>
        set((state) => {
          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = fileComments.filter((c) => c.id !== id);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: state.comments.filter((c) => c.id !== id),
          };
        }),

      deleteReply: (commentId, replyId, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: (c.replies || []).filter((r) => r.id !== replyId),
                  }
                : c
            );

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      updateComment: (id, text, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) => (c.id === id ? { ...c, text } : c));

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      updateReply: (commentId, replyId, text, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: (c.replies || []).map((r) =>
                      r.id === replyId ? { ...r, text } : r
                    ),
                  }
                : c
            );

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      setSelectedText: (text) => set({ selectedText: text }),

      setShowCommentDialog: (show) => set({ showCommentDialog: show }),

      setShowExportDialog: (show) => set({ showExportDialog: show }),

      setCommentText: (text) => set({ commentText: text }),

      setSelectionPosition: (position) => set({ selectionPosition: position }),

      resetComments: () => {
        const state = get();
        if (state.isFolderMode && state.currentFilePath) {
          const updatedFileComments = { ...state.fileComments };
          updatedFileComments[state.currentFilePath] = [];
          set({
            fileComments: updatedFileComments,
            comments: [],
          });
        } else {
          set({ comments: [] });
        }
      },

      clearCommentDialog: () =>
        set({
          showCommentDialog: false,
          commentText: '',
          selectedText: '',
          selectionPosition: null,
        }),

      setCommentsSidebarCollapsed: (collapsed) =>
        set({ commentsSidebarCollapsed: collapsed }),
      
      // File Watcher Module actions
      setConfigId: (configId) => set({ configId }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSelectedFilePath: (selectedFilePath) => set({ selectedFilePath }),
      setShowFileTree: (showFileTree) => set({ showFileTree }),
      setShowTableOfContents: (showTableOfContents) => set({ showTableOfContents }),
    }),
    {
      name: 'markdown-reviewer-storage',
      partialize: (state) => ({
        // Persist all comment-related data
        comments: state.comments,
        fileComments: state.fileComments,
        commentHistory: state.commentHistory,
        currentFilePath: state.currentFilePath,
        currentFileName: state.currentFileName,
        isFolderMode: state.isFolderMode,
        folderName: state.folderName,
        fileTree: state.fileTree,
        commentsSidebarCollapsed: state.commentsSidebarCollapsed,
        selectedHistoryId: state.selectedHistoryId,
        // File Watcher Module persisted state
        configId: state.configId,
        sortBy: state.sortBy,
        selectedFilePath: state.selectedFilePath,
        showFileTree: state.showFileTree,
        showTableOfContents: state.showTableOfContents,
        // Note: folderHandle cannot be persisted, will need to be re-selected
        // Note: markdownContent is not persisted to avoid storing large files
      }),
    }
  )
);

