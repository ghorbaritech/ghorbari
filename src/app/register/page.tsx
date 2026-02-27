'use client'

import { useState } from 'react'
import { signUp } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, MapPin, Phone, Mail, User, Lock } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleSubmit(formData: FormData) {
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)
        setError(null)
        const result = await signUp(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                <div className="text-center">
                    <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <User className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Join Bangladesh's Premier Construction Marketplace
                    </p>
                </div>

                <form className="mt-10 space-y-5" action={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="pl-12 h-12 bg-gray-50 border-gray-100 focus:bg-white rounded-xl font-medium"
                                placeholder="Full Name"
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="pl-12 h-12 bg-gray-50 border-gray-100 focus:bg-white rounded-xl font-medium"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                className="pl-12 h-12 bg-gray-50 border-gray-100 focus:bg-white rounded-xl font-medium"
                                placeholder="Phone Number"
                            />
                        </div>

                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                required
                                className="pl-12 h-12 bg-gray-50 border-gray-100 focus:bg-white rounded-xl font-medium"
                                placeholder="Full Address"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12 h-12 bg-gray-50 border-gray-100 focus:bg-white rounded-xl font-medium"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-12 h-12 bg-gray-50 border-gray-100 focus:bg-white rounded-xl font-medium"
                                placeholder="Repeat Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-11 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all active:scale-95"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-bold decoration-2 underline-offset-4 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
