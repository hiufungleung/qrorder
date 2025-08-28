'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Template {
  id: string
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  preview: {
    categoriesCount: number
    dishesCount: number
    tablesCount: number
    sampleOrdersCount: number
  }
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    summary: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      if (data.status === 200) {
        setTemplates(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    try {
      let response
      
      if (selectedTemplate) {
        // Use template import API
        const params = new URLSearchParams({
          template: selectedTemplate,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          summary: formData.summary
        })
        
        response = await fetch(`/api/templates/import?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // Use regular signup API
        response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            password: formData.password,
            summary: formData.summary,
            is_admin: false // Always false for public signup
          }),
        })
      }

      const data = await response.json()

      if (data.status === 201) {
        setSuccess(true)
        // Redirect to login page after successful signup
        setTimeout(() => {
          router.push('/auth/login?message=signup-success')
        }, 2000)
      } else {
        setError(data.message || 'Failed to create account')
      }
    } catch (error) {
      setError('An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Account Created!</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Your restaurant account has been successfully created. You will be redirected to the login page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              QR Order
            </h1>
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create your restaurant account
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Restaurant Sign Up</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Start managing your restaurant with QR Order
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Restaurant Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Restaurant Name"
                    required
                    disabled={isLoading}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="restaurant@example.com"
                    required
                    disabled={isLoading}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    required
                    disabled={isLoading}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St, City, State"
                    required
                    disabled={isLoading}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="summary" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Restaurant Description
                </label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Tell customers about your restaurant (optional)"
                  disabled={isLoading}
                  className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[100px]"
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Quick Start Options
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Choose a template to start with pre-built menu and data, or start from scratch.
                    {selectedTemplate && (
                      <span className="block mt-2 text-blue-600 dark:text-blue-400 font-medium">
                        Template selected! Your restaurant will be created with the {templates.find(t => t.id === selectedTemplate)?.name || 'selected template'} menu structure.
                      </span>
                    )}
                  </p>
                  
                  <div className="space-y-3">
                    {/* Start from Scratch Option */}
                    <div 
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedTemplate === null
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTemplate(null)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 w-4 h-4 rounded-full border-2 ${
                          selectedTemplate === null
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedTemplate === null && (
                            <div className="w-2 h-2 bg-white rounded-full ml-0.5 mt-0.5"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Start from Scratch
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create your restaurant with empty menu and customize everything yourself.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Template Options */}
                    {templatesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading templates...</span>
                      </div>
                    ) : (
                      templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 w-4 h-4 rounded-full border-2 ${
                              selectedTemplate === template.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedTemplate === template.id && (
                                <div className="w-2 h-2 bg-white rounded-full ml-0.5 mt-0.5"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {template.name}
                                </h4>
                                {template.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {template.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{template.preview.categoriesCount} categories</span>
                                <span>{template.preview.dishesCount} dishes</span>
                                <span>{template.preview.tablesCount} tables</span>
                                {template.preview.sampleOrdersCount > 0 && (
                                  <span>{template.preview.sampleOrdersCount} sample orders</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2" suppressHydrationWarning>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password *
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    disabled={isLoading}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    suppressHydrationWarning
                  />
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  selectedTemplate ? `Create with ${templates.find(t => t.id === selectedTemplate)?.name || 'Template'}` : 'Create Restaurant Account'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}