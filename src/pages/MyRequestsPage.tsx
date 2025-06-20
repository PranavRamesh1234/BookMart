import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPicker } from '@/components/ui/map-picker'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Request {
  id: string
  title: string
  author: string
  description: string | null
  max_price: number | null
  genre: string | null
  location: string
  status: 'open' | 'closed'
  created_at: string
  latitude: number
  longitude: number
  user_id: string
}

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Textbook', 'Children',
  'Young Adult', 'Poetry', 'Drama', 'Other'
]

export function MyRequestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    max_price: '',
    genre: '',
    location: '',
    latitude: 0,
    longitude: 0
  })
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load your requests')
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

  const handleCreateRequest = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .insert([
          {
            title: formData.title,
            author: formData.author,
            description: formData.description,
            max_price: parseFloat(formData.max_price),
            genre: formData.genre || null,
            location: formData.location,
            latitude: formData.latitude,
            longitude: formData.longitude,
            requester_id: user.id,
            contact_email: user.email,
            is_active: true
          }
        ])
        .select()
        .single()

      if (error) throw error

      setRequests(prev => [data, ...prev])
      setFormData({
        title: '',
        author: '',
        description: '',
        max_price: '',
        genre: '',
        location: '',
        latitude: 0,
        longitude: 0
      })
      toast.success('Request created successfully')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to create request')
        console.error('Error creating request:', error)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (requestId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this request? This action cannot be undone.')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('book_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      setRequests(prev => prev.filter(request => request.id !== requestId))
      toast.success('Request deleted successfully')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to delete request')
        console.error('Error deleting request:', error)
      }
    }
  }

  return (
    <div className="py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Requests</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Request</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title">Book Title</label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter book title"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="author">Author</label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description">Description</label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Enter book description"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="max_price">Maximum Price</label>
                    <Input
                      id="max_price"
                      type="number"
                      value={formData.max_price}
                      onChange={(e) => handleChange('max_price', e.target.value)}
                      placeholder="Enter maximum price"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="genre">Genre</label>
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
                  <div className="grid gap-2">
                    <label>Location</label>
                    <Button
                      variant="outline"
                      onClick={() => setShowMap(true)}
                      className="w-full"
                    >
                      Pick on Map
                    </Button>
                    {formData.location && (
                      <Input
                        value={formData.location}
                        readOnly
                        placeholder="Location will appear here when selected on map"
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        title: '',
                        author: '',
                        description: '',
                        max_price: '',
                        genre: '',
                        location: '',
                        latitude: 0,
                        longitude: 0
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    disabled={saving || !formData.title || !formData.author || !formData.description || !formData.max_price || !formData.location}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Request'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No requests yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first book request to start finding the books you need.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Request</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="title">Book Title</label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter book title"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="author">Author</label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleChange('author', e.target.value)}
                        placeholder="Enter author name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="description">Description</label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Enter book description"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="max_price">Maximum Price</label>
                      <Input
                        id="max_price"
                        type="number"
                        value={formData.max_price}
                        onChange={(e) => handleChange('max_price', e.target.value)}
                        placeholder="Enter maximum price"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="genre">Genre</label>
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
                    <div className="grid gap-2">
                      <label>Location</label>
                      <Button
                        variant="outline"
                        onClick={() => setShowMap(true)}
                        className="w-full"
                      >
                        Pick on Map
                      </Button>
                      {formData.location && (
                        <Input
                          value={formData.location}
                          readOnly
                          placeholder="Location will appear here when selected on map"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          title: '',
                          author: '',
                          description: '',
                          max_price: '',
                          genre: '',
                          location: '',
                          latitude: 0,
                          longitude: 0
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRequest}
                      disabled={saving || !formData.title || !formData.author || !formData.description || !formData.max_price || !formData.location}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Request'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{request.title}</CardTitle>
                        {request.author && (
                          <CardDescription>by {request.author}</CardDescription>
                        )}
                        {request.genre && (
                          <Badge variant="outline" className="mt-2 inline-block max-w-fit">
                            {request.genre}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => navigate(`/edit-request/${request.id}`)}
                        >
                          <PencilIcon className="h-4 w-4 text-white dark:text-white" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick= {() => handleDelete(request.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">By {request.author}</p>
                      <p className="text-sm">{request.description}</p>
                      <p className="text-sm font-medium">Max Price: ₹{request.max_price}</p>
                      <p className="text-sm text-muted-foreground">{request.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
              initialPosition={formData.latitude && formData.longitude ? 
                { lat: formData.latitude, lng: formData.longitude } : 
                undefined
              }
            />
          )}
        </>
      )}
    </div>
  )
}