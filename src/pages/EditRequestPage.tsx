import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPicker } from '@/components/ui/map-picker'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { TrashIcon } from '@heroicons/react/24/outline'

interface BookRequest {
  id: string
  title: string
  author: string
  description: string | null
  preferred_condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  max_price: number | null
  genre: string | null
  location: string
  latitude: number | null
  longitude: number | null
  contact_email: string
  contact_phone: string | null
  created_at: string
  user_id: string
}

const conditions = ['new', 'like_new', 'good', 'fair', 'poor']
const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Textbook', 'Children',
  'Young Adult', 'Poetry', 'Drama', 'Other'
]

export function EditRequestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<BookRequest>>({
    title: '',
    author: '',
    description: '',
    preferred_condition: 'good',
    max_price: null,
    genre: null,
    location: '',
    latitude: null,
    longitude: null,
    contact_email: '',
    contact_phone: null,
  })
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    fetchRequest()
  }, [id])

  const fetchRequest = async () => {
    try {
      console.log('Fetching request with ID:', id)
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        toast.error('Failed to fetch request details')
        navigate('/my-requests')
        return
      }

      console.log('Fetched request data:', data)

      // Check if the user owns this request
      if (data.requester_id !== user?.id) {
        console.log('User ID mismatch:', {
          requestUserId: data.requester_id,
          currentUserId: user?.id
        })
        toast.error('You do not have permission to edit this request')
        navigate('/my-requests')
        return
      }

      setFormData(data)
    } catch (error) {
      console.error('Unexpected error in fetchRequest:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
      toast.error('Failed to fetch request details')
      navigate('/my-requests')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof BookRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('book_requests')
        .update({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          preferred_condition: formData.preferred_condition,
          max_price: formData.max_price,
          genre: formData.genre,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Request updated successfully')
      navigate('/my-requests')
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Failed to update request')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this request? This action cannot be undone.')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('book_requests')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Request deleted successfully')
      navigate('/my-requests')
    } catch (error) {
      console.error('Error deleting request:', error)
      toast.error('Failed to delete request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/my-requests')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Requests
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what you're looking for, any specific edition, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Preferred Condition</Label>
                    <Select
                      value={formData.preferred_condition}
                      onValueChange={(value) => handleChange('preferred_condition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_price">Maximum Price</Label>
                    <Input
                      id="max_price"
                      type="number"
                      value={formData.max_price || ''}
                      onChange={(e) => handleChange('max_price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Enter maximum price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={formData.genre || ''}
                    onValueChange={(value) => handleChange('genre', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleChange('contact_email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone (WhatsApp)</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone || ''}
                      onChange={(e) => handleChange('contact_phone', e.target.value)}
                      placeholder="Include country code (e.g., +1)"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete Request
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 