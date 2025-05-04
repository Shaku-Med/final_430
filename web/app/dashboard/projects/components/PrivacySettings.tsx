import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X } from 'lucide-react'

interface PrivacySettingsProps {
  visibility: 'public' | 'private' | 'team'
  onVisibilityChange: (value: 'public' | 'private' | 'team') => void
  allowComments: boolean
  onAllowCommentsChange: (value: boolean) => void
  teamMembers: string[]
  onTeamMemberAdd: (email: string) => void
  onTeamMemberRemove: (email: string) => void
}

export function PrivacySettings({
  visibility,
  onVisibilityChange,
  allowComments,
  onAllowCommentsChange,
  teamMembers,
  onTeamMemberAdd,
  onTeamMemberRemove
}: PrivacySettingsProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const handleAddMember = () => {
    if (newMemberEmail.trim() && !teamMembers.includes(newMemberEmail.trim())) {
      onTeamMemberAdd(newMemberEmail.trim())
      setNewMemberEmail('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Project Visibility</Label>
        <Select value={visibility} onValueChange={onVisibilityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="team">Team Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Allow Comments</Label>
        <Switch
          checked={allowComments}
          onCheckedChange={onAllowCommentsChange}
        />
      </div>

      {visibility === 'team' && (
        <div className="space-y-2">
          <Label>Team Members</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Add team member email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <Button onClick={handleAddMember}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {teamMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {teamMembers.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                >
                  {email}
                  <button
                    onClick={() => onTeamMemberRemove(email)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 