import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  customCategories: string[]
  onCustomCategoryAdd: (category: string) => void
  onCustomCategoryRemove: (category: string) => void
}

const defaultCategories = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Marketing',
  'Research',
  'Other'
]

export function CategorySelect({
  value,
  onChange,
  customCategories,
  onCustomCategoryAdd,
  onCustomCategoryRemove
}: CategorySelectProps) {
  const [newCategory, setNewCategory] = useState('')

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categories = newCategory.split(',').map(c => c.trim()).filter(c => c)
      categories.forEach(category => {
        if (!customCategories.includes(category) && !defaultCategories.includes(category)) {
          onCustomCategoryAdd(category)
        }
      })
      setNewCategory('')
    }
  }

  return (
    <div className="space-y-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {defaultCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
          {customCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="space-y-2">
        <Label>Add Custom Categories</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter categories (comma-separated)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCategory()
              }
            }}
          />
          <Button onClick={handleAddCategory}>
            Add
          </Button>
        </div>
      </div>
      {customCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Custom Categories</Label>
          <div className="flex flex-wrap gap-2">
            {customCategories.map((category) => (
              <div
                key={category}
                className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"
              >
                <span className="text-sm">{category}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => onCustomCategoryRemove(category)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 