"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogIn, UserPlus } from "lucide-react"
import toast from "react-hot-toast"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const firestore = getFirestore()

export default function UserLoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const storeUser = async (uid: string) => {
    await setDoc(
      doc(firestore, "users", uid),
      {
        id: uid,
        name: name.trim() || "User",
        email: email.trim(),
        phoneNumber: "",
        addresses: [],
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true },
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password")
      return
    }

    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name")
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        toast.success("Login successful")
      } else {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await storeUser(result.user.uid)
        toast.success("Account created successfully")
      }

      router.replace("/")
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already exists. Please login instead.")
        setIsLogin(true)
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format")
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters")
      } else {
        toast.error(error.message || "Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-custom py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                {isLogin ? <LogIn className="w-7 h-7 text-primary" /> : <UserPlus className="w-7 h-7 text-primary" />}
              </div>
              <CardTitle className="text-3xl font-heading">{isLogin ? "User Login" : "Create Account"}</CardTitle>
              <CardDescription>
                {isLogin ? "Sign in to place and track your orders." : "Register to start ordering your favorites."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your name"
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {loading ? "Please wait..." : isLogin ? "Login as User" : "Register"}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setIsLogin((prev) => !prev)}
                className="mt-5 w-full text-sm text-primary hover:underline"
                disabled={loading}
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
