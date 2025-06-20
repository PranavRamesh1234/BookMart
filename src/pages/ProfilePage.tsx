import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { Star, BookOpen, MessageCircle, Settings, LogOut, Eye, EyeOff } from 'lucide-react'
import { CustomSwitch } from '@/components/ui/custom-switch'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
  phone: string | null
  bio: string | null
  created_at: string
  settings: {
    email_notifications: boolean
    show_phone: boolean
    show_email: boolean
    show_location: boolean
  }
}

interface FormData {
  full_name: string
  phone: string
  bio: string
  newPassword: string
  confirmPassword: string
  settings: {
    email_notifications: boolean
    show_phone: boolean
    show_email: boolean
    show_location: boolean
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    bio: '',
    newPassword: '',
    confirmPassword: '',
    settings: {
      email_notifications: true,
      show_phone: true,
      show_email: true,
      show_location: true
    }
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        newPassword: '',
        confirmPassword: '',
        settings: data.settings || {
          email_notifications: true,
          show_phone: true,
          show_email: true,
          show_location: true
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch profile')
        console.error('Error fetching profile:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (error) throw error
      
      toast.success('Profile updated successfully')
      setEditing(false)
      fetchProfile()
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to update profile')
        console.error('Error updating profile:', error)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to sign out')
        console.error('Error signing out:', error)
      }
    }
  }

  const handleSettingsChange = async (setting: keyof FormData['settings'], value: boolean) => {
    if (!user?.id) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            ...formData.settings,
            [setting]: value
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
      
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [setting]: value
        }
      }))
      
      toast.success('Settings updated successfully')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to update settings')
        console.error('Error updating settings:', error)
      }
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (error) throw error
      
      toast.success('Password updated successfully')
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }))
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('weak-password')) {
          toast.error('Password is too weak. Please use a stronger password')
        } else {
          toast.error('Failed to update password')
        }
        console.error('Error updating password:', error)
      }
    }
  }

  const handleWhatsAppContact = () => {
    if (!profile?.phone) return
    
    const message = encodeURIComponent(`Hi ${profile.full_name || 'there'}! I'm interested in your books. Are they still available?`)
    const whatsappUrl = `https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Sidebar */}
          <div className="md:w-1/3">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || ''}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Star className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile.full_name || ''}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/my-listings')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                My Listings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/my-requests')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                My Requests
              </Button>
              {profile.phone && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleWhatsAppContact}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact via WhatsApp
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setEditing(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleChange('full_name', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            placeholder="Tell us about yourself"
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button type="submit">
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Full Name</h3>
                          <p className="text-muted-foreground">{profile.full_name || ''}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">Email</h3>
                          <p className="text-muted-foreground">{profile.email}</p>
                        </div>
                        
                        {profile.phone && (
                          <div>
                            <h3 className="font-semibold">Phone</h3>
                            <p className="text-muted-foreground">{profile.phone}</p>
                          </div>
                        )}
                        
                        {profile.bio && (
                          <div>
                            <h3 className="font-semibold">Bio</h3>
                            <p className="text-muted-foreground">{profile.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your email notification preferences
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>New Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you receive new messages
                          </p>
                        </div>
                        <CustomSwitch
                          checked={formData.settings.email_notifications}
                          onChange={(checked) => handleSettingsChange('email_notifications', checked)}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Privacy Settings</h3>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile information
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Phone Number</Label>
                            <p className="text-sm text-muted-foreground">
                              Display your phone number on your public profile
                            </p>
                          </div>
                          <CustomSwitch
                            checked={formData.settings.show_phone}
                            onChange={(checked) => handleSettingsChange('show_phone', checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Email</Label>
                            <p className="text-sm text-muted-foreground">
                              Display your email on your public profile
                            </p>
                          </div>
                          <CustomSwitch
                            checked={formData.settings.show_email}
                            onChange={(checked) => handleSettingsChange('show_email', checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Location</Label>
                            <p className="text-sm text-muted-foreground">
                              Display your location on your public profile
                            </p>
                          </div>
                          <CustomSwitch
                            checked={formData.settings.show_location}
                            onChange={(checked) => handleSettingsChange('show_location', checked)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Account Security */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Account Security</h3>
                        <p className="text-sm text-muted-foreground">
                          Update your password and security settings
                        </p>
                      </div>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => handleChange('newPassword', e.target.value)}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground flex items-center"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => handleChange('confirmPassword', e.target.value)}
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground flex items-center"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <Button type="submit">Update Password</Button>
                      </form>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  if (!user?.id) {
                                    toast.error('User ID not found')
                                    return
                                  }
                                  const { error } = await supabase.auth.admin.deleteUser(user.id)
                                  if (error) throw error
                                  await signOut()
                                  navigate('/')
                                  toast.success('Account deleted successfully')
                                } catch (error: unknown) {
                                  if (error instanceof Error) {
                                    toast.error('Failed to delete account')
                                    console.error('Error deleting account:', error)
                                  }
                                }
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 