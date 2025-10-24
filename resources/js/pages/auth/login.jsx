import { useEffect } from 'react';
import axios from "axios";
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ButtonGradient from '@/Components/ButtonGradient';
import TextInput from '@/Components/TextInput';
import PasswordInputWithToggle from '@/Components/PasswordInputWithToggle'
import { Head, Link, useForm, router } from '@inertiajs/react';
import { encrypOrDesencrypAES } from '@/utils/generalFunctions';


export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset, setError } = useForm({
        email: '',
        password: ''
    });

    useEffect(() => {
        return () => {
            // reset('email');
            reset('password');
        };
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        await axios.get('/sanctum/csrf-cookie')
        post(route('login'), {
            onSuccess: async () => {
                console.log('Login successful!');
                try {
                    await axios.get('/sanctum/csrf-cookie');
                    const response = await axios.post("/api/login", {
                        email: data.email,
                        password: data.password,
                    })
                    const encryptedToken = await encrypOrDesencrypAES(response.data.token);
                    localStorage.setItem("Token", encryptedToken);
                    localStorage.setItem("Username", response.data.usuario.username);
                    localStorage.setItem("Email", response.data.usuario.email);

                    // Te rediriges usando Inertia a una ruta protegida por sesión
                    router.visit('/dashboard');
                } catch (err) {
                    console.error("Error al guardar datos en localStorage:", err);
                }
            },
            onError: (errors) => {
                if (errors.email) setError("email", "Estas credenciales no coinciden con nuestros registros");
                if (errors.password) setError("password", "Estas credenciales no coinciden con nuestros registros");
            }
        });
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post("/api/login", {
                email: data.email,
                password: data.password,
            })
            if(response.status !== 200) throw new Error("Not found");
            const encryptedToken = await encrypOrDesencrypAES(response.data.token);
            localStorage.setItem("Token", encryptedToken);
            localStorage.setItem("Username", response.data.usuario.username);
            localStorage.setItem("Email", response.data.usuario.email);

            // Te rediriges usando Inertia a una ruta protegida por sesión
            router.visit('/dashboard');
        } catch (err) {
            console.error("Error al guardar datos en localStorage:", err);
        }
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

                    <InputError message={errors.password} className="mt-2" />
                </div>
                <ButtonGradient className="w-full mt-4" disabled={processing}>
                    Sign in
                </ButtonGradient>
            </form>
        </GuestLayout>
    );
}
