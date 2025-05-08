"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Student {
  id: string;
  name: string;
  avatar?: string;
  earnedDate: string;
}

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievementTitle: string;
  students: Student[];
}

export function StudentListModal({
  isOpen,
  onClose,
  achievementTitle,
  students,
}: StudentListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{achievementTitle} - Earned By</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <Avatar>
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">
                    Earned on {new Date(student.earnedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 