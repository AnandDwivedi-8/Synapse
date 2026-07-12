import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import API from '@/lib/axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '@/context/ThemeContext';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
                const res = await API.post('/user/register', input);
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    
    const { isDark } = useTheme();
    
    return (
        <div style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }} className='flex items-center w-screen h-screen justify-center transition-colors duration-300'>
            <form onSubmit={signupHandler} style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
            }} className='shadow-lg flex flex-col gap-5 p-8 rounded-lg border w-96'>
                <div className='my-4'>
                    <h1 className='text-center font-bold text-2xl bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent'>Synapse</h1>
                    <p className='text-sm text-center' style={{ color: 'var(--text-secondary)' }}>Signup to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='font-medium'>Username</span>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                <div>
                    <span className='font-medium'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                <div>
                    <span className='font-medium'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                {
                    loading ? (
                        <Button className='bg-blue-500 hover:bg-blue-600'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit' className='bg-blue-500 hover:bg-blue-600'>Signup</Button>
                    )
                }
                <span className='text-center' style={{ color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" className='text-blue-600'>Login</Link></span>
            </form>
        </div>
    )
}

export default Signup