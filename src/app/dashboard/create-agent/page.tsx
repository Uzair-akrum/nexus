"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Bot,
  Sparkles,
  MessageSquare,
  Plus,
  X,
  Loader2,
  AlertCircle
} from "lucide-react"

/**
 * Create Agent Page
 * 
 * Note: "Agent" is just a user-friendly term for "Workflow". 
 * This page provides a streamlined UI for creating workflows but uses 
 * the same underlying /api/workflows endpoint and database table.
 * 
 * Agent = Workflow in terms of functionality and storage.
 */
export default function CreateAgentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    subreddit: "",
    filterInstruction: "",
    channelId: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords(prev => [...prev, keywordInput.trim()])
      setKeywordInput("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword))
  }

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Note: "Agent" is just a user-friendly term for "Workflow"
      // We use the workflows API since agents are workflows under the hood
      const payload = {
        name: formData.name,
        config: {
          trigger: {
            service: 'reddit',
            subreddit: formData.subreddit,
            keywords: keywords
          },
          filter: {
            prompt: formData.filterInstruction,
            enabled: true
          },
          action: {
            service: 'discord',
            channel_id: formData.channelId
          }
        }
      }

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create agent')
      }

      await response.json()

      // Redirect to dashboard with success message
      router.push('/dashboard?tab=workflows&success=Agent created successfully')
    } catch (error) {
      console.error('Error creating agent:', error)
      setError(error instanceof Error ? error.message : 'Failed to create agent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Create New Agent</h1>
          </div>

          <p className="text-muted-foreground">
            Set up an intelligent agent to monitor Reddit posts and take actions on Discord
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Agent Configuration
            </CardTitle>
            <CardDescription>
              Configure your agent&apos;s trigger conditions, AI filter, and actions
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., SaaS Lead Hunter"
                  required
                />
              </div>

              <Separator />

              {/* Trigger Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                  </div>
                  <h3 className="font-semibold">Trigger Configuration</h3>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subreddit">Subreddit</Label>
                    <Input
                      id="subreddit"
                      value={formData.subreddit}
                      onChange={(e) => handleInputChange('subreddit', e.target.value)}
                      placeholder="e.g., apple, startup, saas"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the subreddit name without &quot;r/&quot;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        id="keywords"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={handleKeywordInputKeyPress}
                        placeholder="e.g., purchase, buy, looking for"
                      />
                      <Button
                        type="button"
                        onClick={addKeyword}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {keyword}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => removeKeyword(keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Add keywords to monitor in posts. Press Enter or click + to add.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* AI Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <h3 className="font-semibold">AI Filter</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filterInstruction">Filter Instructions</Label>
                  <Textarea
                    id="filterInstruction"
                    value={formData.filterInstruction}
                    onChange={(e) => handleInputChange('filterInstruction', e.target.value)}
                    placeholder="e.g., Filter for posts about people looking to purchase SaaS tools with a budget mentioned"
                    rows={4}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe what types of posts should trigger the action. Be specific about the intent you want to capture.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Action Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">Action Configuration</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channelId">Discord Channel ID</Label>
                  <Input
                    id="channelId"
                    value={formData.channelId}
                    onChange={(e) => handleInputChange('channelId', e.target.value)}
                    placeholder="e.g., 123456789012345678"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    The Discord channel ID where matching posts will be sent
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || keywords.length === 0}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 