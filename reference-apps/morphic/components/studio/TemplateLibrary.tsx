'use client'

import React, { useEffect,useState } from 'react'

import { Download, Play,Save, Search, Star, Trash2, Upload } from 'lucide-react'

import { TemplateManager } from '@/lib/studio/template-manager'
import { ComponentDefinition,WorkflowTemplate } from '@/lib/types/studio'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface TemplateLibraryProps {
  onLoadTemplate: (template: WorkflowTemplate) => void
  onLoadComponent: (component: ComponentDefinition) => void
  onSaveWorkflow?: (name: string, description: string, category: WorkflowTemplate['category'], tags: string[]) => void
}

export function TemplateLibrary({ onLoadTemplate, onLoadComponent, onSaveWorkflow }: TemplateLibraryProps) {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([])
  const [components, setComponents] = useState<ComponentDefinition[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    category: 'custom' as WorkflowTemplate['category'],
    tags: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    setWorkflows(TemplateManager.getWorkflowTemplates())
    setComponents(TemplateManager.getComponentDefinitions())
  }

  const handleSaveWorkflow = () => {
    if (!saveForm.name.trim()) return

    if (onSaveWorkflow) {
      const tags = saveForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      onSaveWorkflow(saveForm.name, saveForm.description, saveForm.category, tags)
    }

    setIsSaveDialogOpen(false)
    setSaveForm({ name: '', description: '', category: 'custom', tags: '' })
    loadTemplates() // Refresh the list
  }

  const handleLoadTemplate = (template: WorkflowTemplate) => {
    onLoadTemplate(template)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      TemplateManager.deleteWorkflowTemplate(templateId)
      loadTemplates()
    }
  }

  const handleExportTemplate = (templateId: string) => {
    const exported = TemplateManager.exportWorkflowTemplate(templateId)
    if (exported) {
      const blob = new Blob([exported], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workflow-template-${templateId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        const imported = TemplateManager.importWorkflowTemplate(content)
        if (imported) {
          loadTemplates()
          alert('Template imported successfully!')
        } else {
          alert('Failed to import template. Please check the file format.')
        }
      }
    }
    reader.readAsText(file)
  }

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'research', 'shopping', 'analysis', 'automation', 'custom']

  return (
    <div className="w-80 bg-background border-l p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Template Library</h3>
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Workflow Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Name</Label>
                <Input
                  id="template-name"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter template description"
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={saveForm.category}
                  onValueChange={(value) => setSaveForm(prev => ({ ...prev, category: value as WorkflowTemplate['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                <Input
                  id="template-tags"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., research, search, analysis"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveWorkflow}>
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Import/Export */}
      <div className="flex gap-2 mb-4">
        <label className="flex-1">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <span>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            className="hidden"
          />
        </label>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm">{workflow.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workflow.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs">{workflow.metadata.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {workflow.category}
                </Badge>
                {workflow.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {workflow.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{workflow.tags.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Used {workflow.metadata.usageCount} times</span>
                <span>{workflow.nodes.length} nodes</span>
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleLoadTemplate(workflow)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Load
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportTemplate(workflow.id)}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTemplate(workflow.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No templates found</p>
            <p className="text-xs mt-1">Create your first workflow template!</p>
          </div>
        )}
      </div>
    </div>
  )
}