import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Chat,
  Channel,
  ChannelList,
  ChannelHeader,
  MessageList,
  MessageComposer,
  Window,
  useChatContext,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import streamChatClient from '../lib/streamChat';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import type { User, StudentProfile } from '../types';

export function MessagesPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student' && user.role !== 'pi') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 max-w-6xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-900 mb-3 shrink-0">Inbox</h1>
        <Chat client={streamChatClient} theme="str-chat__theme-light">
          <MessagesPageInner user={user} />
        </Chat>
      </div>
    </div>
  );
}

function MessagesPageInner({ user }: { user: User }) {
  const { channel: activeChannel, setActiveChannel } = useChatContext();

  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);

  // Ref for click-outside detection on the student picker dropdown
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showStudentPicker) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowStudentPicker(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showStudentPicker]);

  const openStudentPicker = async () => {
    setShowStudentPicker(true);
    setLoadingStudents(true);
    try {
      const list = await api.students.list();
      setStudents(list);
    } catch {
      /* ignore */
    } finally {
      setLoadingStudents(false);
    }
  };

  const startConversation = async (student: StudentProfile) => {
    if (creatingChannel) return;
    const studentUserId = student.userId ?? (student as unknown as { id: string }).id;
    // Deterministic channel ID: sort the two UUIDs, strip dashes, join, and
    // truncate to 64 chars (Stream's hard limit).
    const channelId = [user.id, studentUserId]
      .sort()
      .join('')
      .replace(/-/g, '')
      .substring(0, 64);
    const studentName = ((student.firstName ?? '') + ' ' + (student.lastName ?? '')).trim();
    setCreatingChannel(true);
    try {
      await api.stream.upsertUser(studentUserId);

      const channel = streamChatClient.channel('messaging', channelId, {
        members: [user.id, studentUserId],
        name: studentName,
      });
      await channel.create();
      setActiveChannel(channel);
      setShowStudentPicker(false);
    } catch (err) {
      console.error('[MessagesPage] Failed to create channel:', err);
    } finally {
      setCreatingChannel(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-[500px] gap-0 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Left: channel list + optional new conversation UI for PIs */}
      <div className="w-full md:max-w-sm md:min-w-[280px] flex flex-col border-r border-slate-200 bg-white">
        {user.role === 'pi' && (
          <div className="p-2 border-b border-slate-100 shrink-0">
            <button
              onClick={() => void openStudentPicker()}
              className="w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              + New Conversation
            </button>

            {showStudentPicker && (
              <div
                ref={pickerRef}
                className="mt-2 border border-slate-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto"
              >
                {loadingStudents ? (
                  <div className="p-3 text-sm text-slate-500 text-center">Loading students…</div>
                ) : students.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500 text-center">No students found</div>
                ) : (
                  students.map((s) => {
                    const sId = s.userId ?? (s as unknown as { id: string }).id;
                    const name =
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      (s as unknown as { email?: string }).email ||
                      sId;
                    return (
                      <button
                        key={sId}
                        disabled={creatingChannel}
                        onClick={() => { void startConversation(s); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors disabled:opacity-50 disabled:cursor-wait"
                      >
                        {name}
                      </button>
                    );
                  })
                )}
                <button
                  onClick={() => setShowStudentPicker(false)}
                  className="w-full px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <ChannelList
          filters={{ type: 'messaging', members: { $in: [user.id] } }}
          sort={{ last_message_at: -1 }}
          options={{ state: true, presence: true, limit: 30 }}
          customActiveChannel={activeChannel?.id}
        />
      </div>

      {/* Right: active channel thread */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeChannel ? (
          <Channel channel={activeChannel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageComposer />
            </Window>
          </Channel>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400 text-sm p-8 text-center">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
