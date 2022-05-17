import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { getDoc, onSnapshot } from 'firebase/firestore'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import TodoList from '../components/TodoList'
import { signup } from '../lib/auth'
import { todosRef, userRef } from '../lib/db'
import { auth } from '../lib/firebase'
import { Todo, UserData } from '../types'

const Home: NextPage = () => {
  const [user, setUser] = useState<UserData>({username: '', email:''})
  const [loadingUser, setLoadingUser] = useState<boolean>(true)
  const [todos, setTodos] = useState<Todo[]>([])
  const router = useRouter()
  const signout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      alert(error)
    }
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user)=> {
      if(!user) return router.push('/login')
      try {
        setLoadingUser(true)
        const userData = await getDoc(userRef(user.uid))
        console.log(userData.data(),'userdata')
        console.log(user, 'user')
        if(!userData.exists()){
          return signout()
        }
        setUser(userData.data())
        return setLoadingUser(false)
      
      } catch (error) {
        alert(error)
      }
    })
  
    return () => {
      unsubscribe()
    }
  }, [])
  
  useEffect(() => {
    if(!loadingUser){
      const auth = getAuth()
      if(!auth.currentUser) return
      const unsubscribe = onSnapshot(todosRef(auth.currentUser.uid), (snapshots)=>{
        const data: Todo[] = []
        snapshots.forEach((snapshot) => {
        data.push(snapshot.data())
        })
        setTodos(data)
      })
      return () => {
        unsubscribe()
      }
    }
  }, [loadingUser])

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar signout={signout} username={user.username} loading={loadingUser}/>
        <TodoList todos={todos}/>
      
      </div>
  )}

export default Home