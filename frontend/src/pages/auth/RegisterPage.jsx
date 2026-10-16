import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import OtpForm from '../../components/OtpForm'
import usePageMeta from '../../hooks/usePageMeta'

export default function RegisterPage() {
  usePageMeta('Sign Up', 'Create your PAYAN account with email or mobile verification.')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref') || ''
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <ShieldCheck className="h-9 w-9 text-brand-500" />
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500">Register with your mobile number or email</p>
      </div>
      {referralCode && <p className="mb-4 text-sm text-brand-700">Invited with code: {referralCode}</p>}
      <OtpForm purpose="register" referralCode={referralCode} onSuccess={() => {
        toast.success('Account verified. Welcome aboard!')
        navigate('/dashboard', { replace: true })
      }} />
      <p className="mt-4 text-center text-sm text-slate-600">Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
      </p>
    </div>
  </div>
}
