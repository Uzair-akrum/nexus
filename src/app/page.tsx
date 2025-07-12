"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Rocket,
  Menu,
  Plug,
  Sparkles,
  Send,
  User,
  Users,
  Brain,
  ChevronRight,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Code,
  CheckCircle,
  PlayCircle
} from "lucide-react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignIn = () => {
    // Redirect to the signin page
    window.location.href = '/signin';
  };

  const handleJoinWaitlist = () => {
    // Redirect to the signup page for account creation
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold font-[family-name:var(--font-geist-sans)]">
                Nexus
              </div>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </button>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
              <Button onClick={handleJoinWaitlist}>Join Waitlist</Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <button
                    onClick={() => scrollToSection('features')}
                    className="text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </button>
                  <div className="pt-4 border-t">
                    <Button variant="ghost" className="w-full mb-2" onClick={handleSignIn}>Sign In</Button>
                    <Button className="w-full" onClick={handleJoinWaitlist}>Join Waitlist</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
              🚀 Coming Soon - Join the Waitlist
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-geist-sans)] mb-6">
              Go Beyond Automation.<br />
              <span className="text-primary">Add Intelligence.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-[family-name:var(--font-inter)] mb-8 max-w-3xl mx-auto">
              Nexus is the developer-first platform to build powerful workflows that think.
              Connect your apps, add a custom AI filter, and let Nexus handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" onClick={handleJoinWaitlist}>
                <Rocket className="w-5 h-5 mr-2" />
                Join Waitlist - Be First
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => scrollToSection('how-it-works')}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>

            {/* Visual Flow */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
              <Card className="w-full md:w-80 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                  </div>
                  <CardTitle className="text-lg">New Reddit Post</CardTitle>
                  <CardDescription>Trigger</CardDescription>
                </CardHeader>
              </Card>

              <div className="hidden md:block">
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>

              <Card className="w-full md:w-80 transition-all duration-300 hover:shadow-lg border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">AI Purchase Intent Filter</CardTitle>
                  <CardDescription>AI-Filter</CardDescription>
                </CardHeader>
              </Card>

              <div className="hidden md:block">
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>

              <Card className="w-full md:w-80 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded"></div>
                  </div>
                  <CardTitle className="text-lg">Post to #leads</CardTitle>
                  <CardDescription>Action</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Integrations Bar */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-8 tracking-wider">
              WORKS WITH YOUR FAVORITE TOOLS
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="w-8 h-8 bg-red-500 rounded"></div>
              </div>
              <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="w-8 h-8 bg-indigo-500 rounded"></div>
              </div>
              <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="w-8 h-8 bg-green-500 rounded"></div>
              </div>
              <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="w-8 h-8 bg-black rounded"></div>
              </div>
              <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="w-8 h-8 bg-orange-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
              Create Your First AI Agent in 3 Minutes
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="relative">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Plug className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Connect</CardTitle>
                  <CardDescription className="text-base">
                    Securely link your apps like Reddit using OAuth2. Your credentials are encrypted and stored safely.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Connect Reddit</span>
                    </div>
                    <div className="text-muted-foreground">
                      ✓ OAuth2 Authentication<br />
                      ✓ Encrypted Storage<br />
                      ✓ Read-only Access
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Filter</CardTitle>
                  <CardDescription className="text-base">
                    Describe the decision you want to make in plain English. Nexus uses GPT-4o to understand your intent and create a smart filter.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono">
                    <div className="text-muted-foreground mb-2">AI Filter:</div>
                    <div className="text-sm">
                      &quot;If a post mentions Apple or Google and has positive purchase intent...&quot;
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Act</CardTitle>
                  <CardDescription className="text-base">
                    Route the filtered, valuable events to where your team works. Get smart alerts in Discord, Slack, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                      <span className="font-semibold">Discord #leads</span>
                    </div>
                    <div className="text-muted-foreground">
                      &quot;🚨 High-intent lead detected:<br />
                      User discussing Apple purchase...&quot;
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
              A Toolkit Built for Power-Users
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="ai-decisions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai-decisions">AI-Powered Decisions</TabsTrigger>
                <TabsTrigger value="developer-first">Developer First</TabsTrigger>
                <TabsTrigger value="observability">Full Observability</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-decisions" className="mt-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Stop reacting to noise. Start acting on signal.</h3>
                    <p className="text-muted-foreground mb-6">
                      Our few-shot prompt engineering and Zod schema validation ensure reliable, structured JSON output.
                      Use sentiment analysis, purchase intent detection, and custom categorization to filter what matters.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Sentiment Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Purchase Intent Detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Custom Categorization</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border rounded-lg p-6">
                    <pre className="text-sm overflow-auto">
                      {`{
  "proceed": true,
  "reasoning": "Post shows strong purchase intent for Apple products with positive sentiment",
  "confidence": 0.85,
  "category": "high-intent-lead"
}`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="developer-first" className="mt-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Built with the tools you already love.</h3>
                    <p className="text-muted-foreground mb-6">
                      Our tech stack includes Next.js, Vercel, and Postgres with a focus on performance and sub-second latency.
                      It&apos;s a robust alternative to self-hosting a cron job + script.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Next.js & TypeScript</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Vercel Edge Functions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Postgres Database</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-2">
                        <Code className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm font-medium">Next.js</span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-2">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm font-medium">Vercel</span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm font-medium">Postgres</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="observability" className="mt-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Know exactly what's happening, always.</h3>
                    <p className="text-muted-foreground mb-6">
                      OpenTelemetry tracing for every agent run, structured logs, and latency metrics.
                      You have full visibility into your workflows with detailed performance insights.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">OpenTelemetry Tracing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Structured Logs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">Latency Metrics</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border rounded-lg p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Trace Waterfall</span>
                      </div>
                      <div className="space-y-1 ml-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                          <span className="text-xs">Reddit API Call - 120ms</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded"></div>
                          <span className="text-xs">AI Filter Processing - 340ms</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded"></div>
                          <span className="text-xs">Discord Webhook - 85ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* User Personas Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
              Designed for Modern Builders
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Indie Hackers & Power-Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automate market research, monitor brand mentions, and capture leads without the hassle
                  of deploying and maintaining your own services. Focus on building, not plumbing.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Startups & Small Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create real-time intelligence streams for your sales, support, and marketing teams.
                  Pipe qualified leads directly to Discord or Slack with zero engineering overhead.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  How do you handle security and my API keys?
                </AccordionTrigger>
                <AccordionContent>
                  We use AES-256 encryption at rest for all credentials and API keys. Our infrastructure follows
                  strict IAM roles and data isolation by userId. Your data is never shared between users and
                  we maintain SOC 2 compliance standards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What is the core technology behind Nexus?
                </AccordionTrigger>
                <AccordionContent>
                  Nexus is built on Next.js with TypeScript, deployed on Vercel Edge Functions, and uses
                  AWS Fargate workers for processing. We integrate with OpenAI GPT-4o for AI filtering
                  and maintain a Postgres database for reliable data storage.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can I use this for more than just Reddit and Discord?
                </AccordionTrigger>
                <AccordionContent>
                  Reddit and Discord are our MVP connectors to validate the core concept. We&apos;re actively
                  working on GitHub, Slack, Twitter, and Webhook integrations. Check our roadmap for
                  upcoming connectors and vote on what you&apos;d like to see next.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  When will Nexus be available?
                </AccordionTrigger>
                <AccordionContent>
                  We&apos;re currently in active development and expect to launch in early 2025.
                  Join our waitlist to be the first to know when we go live and get early access to the platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Will there be a free plan?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! We plan to offer a generous free tier that will include 100 AI filter executions per month,
                  1 active workflow, and basic integrations. This will give you plenty of room to test your
                  ideas and see the value before upgrading.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
              Be the First to Experience Nexus
            </h2>
            <p className="text-xl mb-8 text-background/80">
              Join our waitlist to get early access and be notified when we launch.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={handleJoinWaitlist}>
              <ArrowRight className="w-5 h-5 mr-2" />
              Join Waitlist Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-xl font-bold font-[family-name:var(--font-geist-sans)]">
                  Nexus
                </div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground">
                AI-native automation for modern makers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <button className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </button>
                <button className="block text-muted-foreground hover:text-foreground transition-colors">
                  Integrations
                </button>
                <button className="block text-muted-foreground hover:text-foreground transition-colors">
                  Roadmap
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <button className="block text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </button>
                <button className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </button>
                <button className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-center text-muted-foreground">
              © 2025 Nexus Labs Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
