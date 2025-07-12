"use client"

import { signOut } from "@/auth"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Brain,
  Plug,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  Play,
  Pause,
  Eye,
  Activity,
  Zap,
  Globe,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Bot,
  Link,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  PlayCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ServiceCredential {
  id: number
  user_id: string
  service_name: string
  credentials: {
    access_token?: string
    refresh_token?: string
    expires_at?: string
    bot_token?: string
    channel_id?: string
    [key: string]: string | number | boolean | undefined
  }
  created_at: string
  updated_at: string
}

interface UserWorkflow {
  id: number
  user_id: string
  name: string
  config: {
    trigger: {
      service: string
      query?: string
      subreddit?: string
      [key: string]: string | number | boolean | undefined
    }
    filter: {
      prompt: string
      enabled: boolean
    }
    action: {
      service: string
      channel_id?: string
      [key: string]: string | number | boolean | undefined
    }
  }
  status: 'active' | 'paused' | 'draft'
  created_at: string
  updated_at: string
  last_run?: string
  total_runs: number
}

interface SimulationResult {
  workflow_id: number
  workflow_name: string
  simulation_id: string
  status: 'success' | 'partial_failure' | 'error'
  total_duration: number
  started_at: string
  completed_at: string
  steps: Array<{
    step_name: string
    step: string
    status: string
    duration: number
    result?: string | number | boolean
    details?: {
      results_found?: number
      sample_posts?: Array<{
        title: string
        subreddit: string
        score: number
        author: string
      }>
      ai_reasoning?: Array<{
        decision: string
        confidence: number
        post_title: string
        reasoning: string
      }>
      sample_message?: {
        content: string
      }
      error?: string
    }
  }>
  summary: {
    reddit_posts_found: number
    posts_filtered: number
    discord_messages_sent: number
    credentials_missing: string[]
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [serviceCredentials, setServiceCredentials] = useState<ServiceCredential[]>([])
  const [userWorkflows, setUserWorkflows] = useState<UserWorkflow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [showSimulationModal, setShowSimulationModal] = useState(false)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Discord form state
  const [discordForm, setDiscordForm] = useState({
    bot_token: '',
    channel_id: ''
  })

  // Workflow form state
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    trigger: {
      service: 'reddit',
      query: ''
    },
    filter: {
      prompt: '',
      enabled: true
    },
    action: {
      service: 'discord',
      channel_id: ''
    }
  })

  // Legacy state for backward compatibility - kept for potential future use
  // const [workflows, setWorkflows] = useState([
  //   {
  //     id: 1,
  //     name: "Reddit Lead Hunter",
  //     trigger: "New posts in r/startup",
  //     filter: "High-intent SaaS leads",
  //     action: "Send to CRM",
  //     status: "active",
  //     runs: 1247,
  //     lastRun: "2 minutes ago"
  //   },
  //   {
  //     id: 2,
  //     name: "Discord Community Monitor",
  //     trigger: "Mentions in Discord",
  //     filter: "Support requests",
  //     action: "Create ticket",
  //     status: "paused",
  //     runs: 892,
  //     lastRun: "1 hour ago"
  //   }
  // ])

  // Load data on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadServiceCredentials()
      loadUserWorkflows()
    }
  }, [session])

  // Load service credentials
  const loadServiceCredentials = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServiceCredentials(data)
      }
    } catch (error) {
      console.error('Error loading service credentials:', error)
    }
  }

  // Load user workflows
  const loadUserWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows')
      if (response.ok) {
        const data = await response.json()
        setUserWorkflows(data)
      }
    } catch (error) {
      console.error('Error loading user workflows:', error)
    }
  }

  // Helper functions
  const getServiceStatus = (serviceName: string) => {
    return serviceCredentials.some(cred => cred.service_name === serviceName)
  }

  const getConnectedChannels = () => {
    const discordCreds = serviceCredentials.find(cred => cred.service_name === 'discord_action')
    return discordCreds ? [discordCreds.credentials.channel_id] : []
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    redirect("/signin")
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "workflows", label: "Workflows", icon: Brain },
    { id: "connections", label: "Connections", icon: Plug },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" })
  }

  // Reddit OAuth connection
  const handleRedditConnect = async () => {
    setIsLoading(true)
    try {
      window.location.href = '/api/auth/reddit'
    } catch (error) {
      console.error('Reddit connection error:', error)
      setIsLoading(false)
    }
  }

  // Discord connection
  const handleDiscordConnect = async () => {
    if (!discordForm.bot_token || !discordForm.channel_id) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_name: 'discord_action',
          credentials: {
            bot_token: discordForm.bot_token,
            channel_id: discordForm.channel_id
          }
        })
      })

      if (response.ok) {
        await loadServiceCredentials()
        setShowDiscordModal(false)
        setDiscordForm({ bot_token: '', channel_id: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to connect Discord')
      }
    } catch (error) {
      console.error('Discord connection error:', error)
      alert('Failed to connect Discord')
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect service
  const handleDisconnect = async (serviceName: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/services?service_name=${serviceName}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadServiceCredentials()
      } else {
        alert('Failed to disconnect service')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      alert('Failed to disconnect service')
    } finally {
      setIsLoading(false)
    }
  }

  // Create workflow
  const handleCreateWorkflow = async () => {
    if (!workflowForm.name || !workflowForm.trigger.query || !workflowForm.filter.prompt) {
      alert('Please fill in all required fields')
      return
    }

    const channels = getConnectedChannels()
    if (channels.length === 0) {
      alert('Please connect a Discord channel first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflowForm.name,
          config: {
            ...workflowForm,
            action: {
              ...workflowForm.action,
              channel_id: channels[0]
            }
          }
        })
      })

      if (response.ok) {
        await loadUserWorkflows()
        setShowWorkflowModal(false)
        setWorkflowForm({
          name: '',
          trigger: { service: 'reddit', query: '' },
          filter: { prompt: '', enabled: true },
          action: { service: 'discord', channel_id: '' }
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create workflow')
      }
    } catch (error) {
      console.error('Create workflow error:', error)
      alert('Failed to create workflow')
    } finally {
      setIsLoading(false)
    }
  }

  // Update workflow status
  const handleUpdateWorkflowStatus = async (workflowId: number, newStatus: 'active' | 'paused') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: workflowId,
          status: newStatus
        })
      })

      if (response.ok) {
        await loadUserWorkflows()
      } else {
        alert('Failed to update workflow status')
      }
    } catch (error) {
      console.error('Update workflow error:', error)
      alert('Failed to update workflow status')
    } finally {
      setIsLoading(false)
    }
  }

  // Run simulation
  const handleRunSimulation = async (workflow: UserWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsSimulating(true)
    setSimulationResult(null)
    setShowSimulationModal(true)

    try {
      const response = await fetch('/api/workflows/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: workflow.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSimulationResult(result)
      } else {
        const error = await response.json()
        alert(error.error || 'Simulation failed')
      }
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Simulation failed')
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.3);
        }
        .glass-sidebar {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .neon-glow {
          box-shadow: 0 0 20px rgba(245, 101, 19, 0.3);
        }
        .neon-glow-blue {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        .neon-glow-green {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }
        .neon-glow-purple {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
        .particle-bg {
          background-image: radial-gradient(circle at 25% 25%, rgba(245, 101, 19, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
        }
        .holographic-pulse {
          animation: holographic-pulse 2s ease-in-out infinite;
        }
        @keyframes holographic-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(245, 101, 19, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(245, 101, 19, 0.5);
          }
        }
        .connection-orb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
        }
        .connection-orb.connected {
          background: linear-gradient(45deg, #22c55e, #16a34a);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
          animation: glow-green 2s ease-in-out infinite alternate;
        }
        .connection-orb.disconnected {
          background: linear-gradient(45deg, #6b7280, #4b5563);
          box-shadow: 0 0 10px rgba(107, 114, 128, 0.3);
        }
        @keyframes glow-green {
          from { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          to { box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
        }
        .waterfall-step {
          position: relative;
          margin-bottom: 16px;
        }
        .waterfall-step::before {
          content: '';
          position: absolute;
          left: 12px;
          top: 40px;
          width: 2px;
          height: calc(100% - 40px);
          background: linear-gradient(to bottom, rgba(245, 101, 19, 0.3), transparent);
        }
        .waterfall-step:last-child::before {
          display: none;
        }
      `}</style>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">NEXUS</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start text-white hover:bg-white/10 ${activeTab === item.id ? 'bg-primary/20 neon-glow' : ''
                }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="glass-card border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows, connections..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 w-96"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {session.user.name?.[0] || session.user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="text-white font-medium">{session.user.name || "User"}</p>
                  <p className="text-gray-400">{session.user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 particle-bg">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Welcome back, {session.user.name || "User"}!
                    </h2>
                    <p className="text-gray-300">
                      Your AI agents are working hard to filter the signal from the noise.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {userWorkflows.filter(w => w.status === "active").length}
                      </div>
                      <div className="text-sm text-gray-400">Active Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {userWorkflows.reduce((sum, w) => sum + w.total_runs, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Runs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Today&apos;s Runs</p>
                        <p className="text-2xl font-bold text-white">
                          {userWorkflows.filter(w => w.status === 'active').length * 12}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xs text-green-400 mt-2">+12% from yesterday</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg Response</p>
                        <p className="text-2xl font-bold text-white">1.2s</p>
                      </div>
                      <Zap className="h-8 w-8 text-yellow-400" />
                    </div>
                    <p className="text-xs text-green-400 mt-2">-0.3s improvement</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-white">98.7%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <p className="text-xs text-green-400 mt-2">+0.3% improvement</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Connections</p>
                        <p className="text-2xl font-bold text-white">{serviceCredentials.length}</p>
                      </div>
                      <Globe className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Services connected</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userWorkflows.slice(0, 4).map((workflow) => (
                      <div key={workflow.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${workflow.status === "active" ? "bg-green-400" : "bg-gray-400"}`}></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{workflow.name} processed {workflow.total_runs} items</p>
                          <p className="text-gray-400 text-xs">{workflow.last_run || 'Never run'}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                    {userWorkflows.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No workflows yet. Create your first workflow to get started!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "workflows" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">AI Workflows</h2>
                  <p className="text-gray-300">Manage your automated AI agents and workflows</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowWorkflowModal(true)}
                    className="bg-primary hover:bg-primary/90 neon-glow"
                    disabled={!getServiceStatus('reddit_trigger') || !getServiceStatus('discord_action')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workflow
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/dashboard/create-agent'}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    title="Streamlined workflow creation with guided form"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Quick Create
                  </Button>
                </div>
              </div>

              {(!getServiceStatus('reddit_trigger') || !getServiceStatus('discord_action')) && (
                <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-yellow-500 font-medium">Setup Required</p>
                        <p className="text-gray-300 text-sm">
                          Connect Reddit and Discord in the Connections tab to create workflows.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="glass-card border-white/10 hover:neon-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{workflow.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                            {workflow.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateWorkflowStatus(
                              workflow.id,
                              workflow.status === "active" ? "paused" : "active"
                            )}
                            className="h-8 w-8 text-white hover:bg-white/10"
                            disabled={isLoading}
                          >
                            {workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <Search className="h-4 w-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Trigger</p>
                            <p className="text-white text-sm">
                              Reddit: &quot;{workflow.config.trigger.query}&quot;
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Brain className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">AI Filter</p>
                            <p className="text-white text-sm truncate">
                              {workflow.config.filter.prompt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Action</p>
                            <p className="text-white text-sm">
                              Discord: {workflow.config.action.channel_id}
                            </p>
                          </div>
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            <span className="text-white font-medium">{workflow.total_runs}</span> runs
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRunSimulation(workflow)}
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            disabled={isLoading}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Simulate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {userWorkflows.length === 0 && (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No workflows yet</h3>
                    <p className="text-gray-400 mb-4">
                      Create your first AI workflow to start automating tasks.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowWorkflowModal(true)}
                        className="bg-primary hover:bg-primary/90"
                        disabled={!getServiceStatus('reddit_trigger') || !getServiceStatus('discord_action')}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Workflow
                      </Button>
                      <Button
                        onClick={() => window.location.href = '/dashboard/create-agent'}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        title="Streamlined workflow creation with guided form"
                      >
                        <Bot className="mr-2 h-4 w-4" />
                        Quick Create
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "connections" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Service Connections</h2>
                <p className="text-gray-300">Connect your accounts to enable AI-powered automation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reddit Connection */}
                <Card className="glass-card border-white/10 hover:neon-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <Search className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Reddit Trigger</h3>
                          <p className="text-sm text-gray-400">
                            Monitor subreddits for new posts
                          </p>
                        </div>
                      </div>
                      <div className={`connection-orb ${getServiceStatus('reddit_trigger') ? 'connected' : 'disconnected'}`}></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-medium ${getServiceStatus('reddit_trigger') ? 'text-green-400' : 'text-gray-400'}`}>
                          {getServiceStatus('reddit_trigger') ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {getServiceStatus('reddit_trigger') && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Scopes</span>
                          <span className="text-white">identity, read, history</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      {getServiceStatus('reddit_trigger') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect('reddit_trigger')}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleRedditConnect}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          size="sm"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4 mr-2" />}
                          Connect Reddit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Discord Connection */}
                <Card className="glass-card border-white/10 hover:neon-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Discord Action</h3>
                          <p className="text-sm text-gray-400">
                            Send messages to Discord channels
                          </p>
                        </div>
                      </div>
                      <div className={`connection-orb ${getServiceStatus('discord_action') ? 'connected' : 'disconnected'}`}></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-medium ${getServiceStatus('discord_action') ? 'text-green-400' : 'text-gray-400'}`}>
                          {getServiceStatus('discord_action') ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {getServiceStatus('discord_action') && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Channel</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white">{getConnectedChannels()[0] || 'N/A'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(getConnectedChannels()[0] || '', 'channel')}
                              className="h-6 w-6 p-0"
                            >
                              {copiedText === 'channel' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      {getServiceStatus('discord_action') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect('discord_action')}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setShowDiscordModal(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          Connect Discord
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Setup Instructions */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Setup Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Reddit Setup</h4>
                      <ol className="text-sm text-gray-300 space-y-2">
                        <li>1. Click &quot;Connect Reddit&quot; to start OAuth flow</li>
                        <li>2. Authorize Nexus to access your Reddit account</li>
                        <li>3. You&apos;ll be redirected back with connection confirmed</li>
                        <li>4. Use Reddit triggers in your workflows</li>
                      </ol>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Discord Setup</h4>
                      <ol className="text-sm text-gray-300 space-y-2">
                        <li>1. Create a Discord bot in Developer Portal</li>
                        <li>2. Copy your bot token</li>
                        <li>3. Add bot to your server with message permissions</li>
                        <li>4. Get channel ID and connect via form</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Analytics & Insights</h2>
                <p className="text-gray-300">Monitor your AI agents&apos; performance and system health</p>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white/5 border-white/10">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="traces">Traces</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Execution Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                          <p className="text-gray-400">Chart placeholder - Integration with Recharts</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Success Rates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                          <p className="text-gray-400">Chart placeholder - Success rate over time</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Response Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">Performance metrics visualization</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="traces" className="space-y-4">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Request Traces</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userWorkflows.slice(0, 3).map((workflow, index) => (
                          <div key={workflow.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${workflow.status === "active" ? "bg-green-400" : "bg-gray-400"}`}></div>
                              <div>
                                <p className="text-white text-sm">{workflow.name}</p>
                                <p className="text-gray-400 text-xs">workflow-{workflow.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-300">1.{index + 2}s</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRunSimulation(workflow)}
                                className="text-white hover:bg-white/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
                <p className="text-gray-300">Manage your account and preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <Input value={session.user.email || ""} disabled className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Name</Label>
                      <Input value={session.user.name || ""} className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Dark Mode</Label>
                      <Button variant="outline" size="sm" className="border-white/10 text-white">
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Email Notifications</Label>
                      <Button variant="outline" size="sm" className="border-white/10 text-white">
                        On
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Real-time Updates</Label>
                      <Button variant="outline" size="sm" className="border-white/10 text-white">
                        On
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Discord Connection Modal */}
      {showDiscordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Connect Discord</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDiscordModal(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Bot Token</Label>
                <Input
                  type="password"
                  placeholder="Your Discord bot token"
                  value={discordForm.bot_token}
                  onChange={(e) => setDiscordForm({ ...discordForm, bot_token: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Channel ID</Label>
                <Input
                  placeholder="Discord channel ID"
                  value={discordForm.channel_id}
                  onChange={(e) => setDiscordForm({ ...discordForm, channel_id: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDiscordModal(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDiscordConnect}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Create New Workflow</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWorkflowModal(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <Label className="text-white">Workflow Name</Label>
                <Input
                  placeholder="e.g., Reddit Lead Hunter"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center">
                  <Search className="h-4 w-4 mr-2 text-orange-400" />
                  1. Select Trigger
                </h4>
                <div>
                  <Label className="text-white">Reddit Search Query</Label>
                  <Input
                    placeholder="e.g., startup, SaaS, project management"
                    value={workflowForm.trigger.query}
                    onChange={(e) => setWorkflowForm({
                      ...workflowForm,
                      trigger: { ...workflowForm.trigger, query: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  2. AI Filter
                </h4>
                <div>
                  <Label className="text-white">Filter Prompt</Label>
                  <Textarea
                    placeholder="e.g., Filter for posts about SaaS startups looking for solutions, high-intent leads only"
                    value={workflowForm.filter.prompt}
                    onChange={(e) => setWorkflowForm({
                      ...workflowForm,
                      filter: { ...workflowForm.filter, prompt: e.target.value }
                    })}
                    className="bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
                  3. Select Action
                </h4>
                <div>
                  <Label className="text-white">Discord Channel</Label>
                  <Select value={getConnectedChannels()[0] || ''} disabled>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select Discord channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {getConnectedChannels().map(channelId => (
                        <SelectItem key={channelId || 'none'} value={channelId || ''}>
                          {channelId || 'No channel'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWorkflowModal(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWorkflow}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Workflow'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">
                Workflow Simulation: {selectedWorkflow?.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSimulationModal(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {isSimulating && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-white">Running simulation...</p>
              </div>
            )}

            {simulationResult && (
              <div className="space-y-6">
                {/* Summary */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      Simulation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">
                          {simulationResult.summary.reddit_posts_found}
                        </div>
                        <div className="text-sm text-gray-400">Posts Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {simulationResult.summary.posts_filtered}
                        </div>
                        <div className="text-sm text-gray-400">Posts Filtered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {simulationResult.summary.discord_messages_sent}
                        </div>
                        <div className="text-sm text-gray-400">Messages Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {simulationResult.total_duration}ms
                        </div>
                        <div className="text-sm text-gray-400">Total Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Waterfall Trace */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Execution Trace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {simulationResult.steps.map((step, index) => (
                        <div key={index} className="waterfall-step">
                          <div className="glass-card p-4 border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                  step.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                  {step.status === 'success' ? <CheckCircle className="h-4 w-4" /> :
                                    step.status === 'error' ? <AlertCircle className="h-4 w-4" /> :
                                      <Clock className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{step.step_name}</h4>
                                  <p className="text-sm text-gray-400">{step.duration}ms</p>
                                </div>
                              </div>
                              <Badge variant={step.status === 'success' ? 'default' : 'destructive'}>
                                {step.status}
                              </Badge>
                            </div>

                            {step.details && (
                              <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                                {step.step === 'reddit_trigger' && step.details.sample_posts && (
                                  <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                      Found {step.details.results_found} posts, showing top 3:
                                    </p>
                                    <div className="space-y-2">
                                      {step.details.sample_posts.slice(0, 3).map((post, idx: number) => (
                                        <div key={idx} className="text-sm">
                                          <p className="text-white">{post.title}</p>
                                          <p className="text-gray-400">
                                            r/{post.subreddit} • {post.score} points • u/{post.author}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {step.step === 'ai_filter' && step.details.ai_reasoning && (
                                  <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                      AI Analysis Results:
                                    </p>
                                    <div className="space-y-2">
                                      {step.details.ai_reasoning.map((analysis, idx: number) => (
                                        <div key={idx} className="text-sm">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <Badge variant={analysis.decision === 'PASS' ? 'default' : 'secondary'}>
                                              {analysis.decision}
                                            </Badge>
                                            <span className="text-gray-400">
                                              {Math.round(analysis.confidence * 100)}% confidence
                                            </span>
                                          </div>
                                          <p className="text-white">{analysis.post_title}</p>
                                          <p className="text-gray-400">{analysis.reasoning}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {step.step === 'discord_action' && step.details.sample_message && (
                                  <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                      Sample Discord message:
                                    </p>
                                    <div className="bg-white/5 p-3 rounded border border-white/10">
                                      <pre className="text-sm text-white whitespace-pre-wrap">
                                        {step.details.sample_message.content}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {step.details.error && (
                                  <div className="text-red-400 text-sm">
                                    Error: {step.details.error}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 