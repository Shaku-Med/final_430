"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, User, Paperclip, Bell, Lock, Download, FileText } from "lucide-react";
import Cookies from "js-cookie";
import SetQuickToken from "@/app/account/Actions/SetQuickToken";
import dynamic from 'next/dynamic';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false });

interface Attachment {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

interface Task {
  task_id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  created_at: string;
  dueDate?: string;
  dueTime?: string;
  priority: "low" | "medium" | "high";
  privacy: string;
  tags: string[];
  assignee: string;
  attachments: Attachment[];
  notifications: any[];
}

export default function TaskPage({T}: {T: Task}) {
  const params = useParams();
  const [task, setTask] = useState<Task | null>(T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Task not found'}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            {task.privacy === 'private' && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={`${
            task.priority === 'high' ? 'bg-red-100 text-red-700' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {task.priority}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Markdown Preview */}
          <div className="prose max-w-none">
            <Markdown source={task.description} />
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {task.dueTime && ` at ${task.dueTime}`}
                </span>
              </div>
            )}

            {task.assignee && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-5 w-5" />
                <span>Assigned to: {task.assignee}</span>
              </div>
            )}

            {task.notifications && task.notifications.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Bell className="h-5 w-5" />
                <span>{task.notifications.length} notification(s)</span>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-8 w-8 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="ml-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 