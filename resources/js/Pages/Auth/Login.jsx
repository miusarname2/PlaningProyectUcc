import { useEffect } from 'react';
// import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ButtonGradient from '@/Components/ButtonGradient';
import TextInput from '@/Components/TextInput';
import PasswordInputWithToggle from '@/Components/PasswordInputWithToggle'
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="name@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="mt-4 flex justify-between ">
                        <InputLabel htmlFor="password" value="Password" className='text-sm ' />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-blue-600 font-normal"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>
                    <PasswordInputWithToggle data={data} setData={setData} />

                    {/* <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full placeholder:font-black"
                        autoComplete="current-password"
                        placeholder="· · · · · · · ·"
                        onChange={(e) => setData('password', e.target.value)}
                    /> */}

                    <InputError message={errors.password} className="mt-2" />
                </div>
                <ButtonGradient className="w-full mt-4" disabled={processing}>
                    Sign in
                </ButtonGradient>
            </form>
        </GuestLayout>
    );
}
