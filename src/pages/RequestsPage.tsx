import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MapPicker } from '@/components/ui/map-picker'
import { supabase } from '@/lib/supabase'
import { MapPin, Plus, MessageCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BookRequest {
  id: string
  requester_id: string
  title: string
  author: string | null
  description: string | null
  max_price: number | null
  preferred_condition: string | null
  genre: string | null
  location: string
  contact_email: string
  contact_phone: string | null
  is_active: boolean
  created_at: string
}

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Textbook', 'Children',
  'Young Adult', 'Poetry', 'Drama', 'Other'
]

export function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<BookRequest[]>([])
  const [myRequests, setMyRequests] = useState<BookRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showMap, setShowMap] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    maxPrice: '',
    preferredCondition: '',
    genre: '',
    location: '',
    latitude: 0,
    longitude: 0,
    contactPhone: '',
    contactEmail: user?.email || ''
  })

  useEffect(() => {
    fetchRequests()
    if (user) {
      fetchMyRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch requests')
        console.error('Error fetching requests:', error)
      }
    }
  }

  const fetchMyRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMyRequests(data || [])
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch your requests')
        console.error('Error fetching my requests:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const requestData = {
        requester_id: user?.id,
        title: formData.title,
        author: formData.author || null,
        description: formData.description || null,
        max_price: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        preferred_condition: formData.preferredCondition || null,
        genre: formData.genre || null,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        contact_phone: formData.contactPhone || null,
        contact_email: formData.contactEmail
      }

      const { error } = await supabase
        .from('book_requests')
        .insert([requestData])

      if (error) throw error

      toast.success('Book request created successfully!')
      setDialogOpen(false)
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        maxPrice: '',
        preferredCondition: '',
        genre: '',
        location: '',
        latitude: 0,
        longitude: 0,
        contactPhone: '',
        contactEmail: user?.email || ''
      })
      
      fetchRequests()
      fetchMyRequests()
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create request')
      }
    }

    setLoading(false)
  }

  const handleContactRequester = (request: BookRequest) => {
    const subject = encodeURIComponent(`Book Available: "${request.title}"`)
    const body = encodeURIComponent(`Hi! I have the book "${request.title}"${request.author ? ` by ${request.author}` : ''} that you requested. Are you still interested?`)
    
    const emailUrl = `mailto:${request.contact_email}?subject=${subject}&body=${body}`
    window.open(emailUrl, '_blank')
  }

  const handleWhatsAppContact = (request: BookRequest) => {
    if (!request.contact_phone) return
    
    const message = encodeURIComponent(`Hi! I have the book "${request.title}"${request.author ? ` by ${request.author}` : ''} that you requested. Are you still interested?`)
    const whatsappUrl = `https://wa.me/${request.contact_phone.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const toggleRequestStatus = async (requestId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ is_active: !isActive })
        .eq('id', requestId)

      if (error) throw error

      toast.success(isActive ? 'Request deactivated' : 'Request activated')
      fetchMyRequests()
    } catch {
      toast.error('Failed to update request status')
    }
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Book Requests</h1>
          <p className="text-muted-foreground">
            Request books you're looking for or help others find theirs
          </p>
        </div>
        
        {user && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request a Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request a Book</DialogTitle>
                <DialogDescription>
                  Let sellers know what book you're looking for
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter the book title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      placeholder="Enter the author's name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Any specific edition, condition preferences, or other details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Maximum Price ($)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => handleChange('maxPrice', e.target.value)}
                      placeholder="Optional maximum price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredCondition">Preferred Condition</Label>
                    <Input
                      id="preferredCondition"
                      value={formData.preferredCondition}
                      onChange={(e) => handleChange('preferredCondition', e.target.value)}
                      placeholder="e.g. Good or better"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={formData.genre}
                      onValueChange={(value) => handleChange('genre', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Location *</Label>
                  <Button
                    variant="outline"
                    onClick={() => setShowMap(true)}
                    className="w-full"
                  >
                    Pick on Map
                  </Button>
                  {formData.location && (
                    <div className="space-y-2">
                      <Label>Selected Location</Label>
                      <Input
                        value={formData.location}
                        readOnly
                        placeholder="Location will appear here when selected on map"
                        required
                      />
                    </div>
                  )}
                </div>

                {showMap && (
                  <MapPicker
                    onClose={() => setShowMap(false)}
                    onLocationSelect={(location) => {
                      setFormData(prev => ({
                        ...prev,
                        location: location.address,
                        latitude: location.lat,
                        longitude: location.lng
                      }))
                      setShowMap(false)
                    }}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      placeholder="For WhatsApp contact"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Request'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          {user && <TabsTrigger value="mine">My Requests</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No book requests found.</p>
              {user && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Request
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex item-center justify-between">
                      <CardTitle className="line-clamp-2">{request.title}</CardTitle>
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    {request.author && (
                      <CardDescription>by {request.author}</CardDescription>
                    )}
                    {request.genre && (
                      <Badge variant="outline" className="mt-2 inline-block max-w-fit">
                        {request.genre}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {request.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {request.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {request.max_price && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Max Price:</span>
                          <span className="font-medium">₹{request.max_price}</span>
                        </div>
                      )}
                      
                      {request.preferred_condition && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Condition:</span>
                          <Badge variant="outline">{request.preferred_condition}</Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location.split(',').slice(-2).join(',')}
                      </div>
                    </div>
                    
                    {user?.id !== request.requester_id && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleContactRequester(request)}
                          className="flex-1"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        {request.contact_phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsAppContact(request)}
                            className="flex-1"
                          >
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="mine" className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't made any book requests yet.</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Request
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="line-clamp-2">{request.title}</CardTitle>
                        <Badge variant={request.is_active ? "default" : "secondary"}>
                          {request.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {request.author && (
                        <CardDescription>by {request.author}</CardDescription>
                      )}
                      {request.genre && (
                        <Badge variant="outline" className="mt-2 inline-block max-w-fit">
                          {request.genre}
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {request.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {request.description}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {request.max_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Max Price:</span>
                            <span className="font-medium">₹{request.max_price}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {request.location.split(',').slice(-2).join(',')}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={request.is_active ? "outline" : "default"}
                        onClick={() => toggleRequestStatus(request.id, request.is_active)}
                        className="w-full"
                      >
                        {request.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}