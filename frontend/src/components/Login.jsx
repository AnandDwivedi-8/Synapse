import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import API from '@/lib/axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import { useTheme } from '@/context/ThemeContext';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log('📤 Attempting login with:', input);
            const res = await API.post('/user/login', input);
            console.log('📥 Login response:', res.data);
            console.log('📥 Response includes token?', !!res.data.token);
            console.log('📥 Cookies after login:', document.cookie);
            if (res.data.success) {
                console.log('✅ Login successful, setting user and token');
                dispatch(setAuthUser(res.data.user));
                // Also store token in localStorage as fallback
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                    console.log('✅ Token stored in localStorage');
                }
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log('❌ Login error:', error);
            console.log('❌ Error response:', error?.response?.data);
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
                    <p className='text-sm text-center' style={{ color: 'var(--text-secondary)' }}>Login to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='font-medium text-primary'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                <div>
                    <span className='font-medium text-primary'>Password</span>
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
                        <Button type='submit' className='bg-blue-500 hover:bg-blue-600'>Login</Button>
                    )
                }

                <span className='text-center' style={{ color: 'var(--text-secondary)' }}>Don't have an account? <Link to="/signup" className='text-blue-600'>Signup</Link></span>
            </form>
        </div>
    )
}

export default Login