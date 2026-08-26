import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { apiErrorMessage } from '../../services/api'
import { authService } from '../../services/authService'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authService.updateProfile(profileForm)
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await authService.changePassword(passwordForm)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Personal Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Full name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
          />
          <Button type="submit" loading={savingProfile}>
            Save Changes
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            value={passwordForm.password_confirmation}
            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
          />
          <Button type="submit" loading={savingPassword}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  )
}
