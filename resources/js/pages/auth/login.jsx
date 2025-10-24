import { useEffect, useState } from 'react';
import axios from "axios";
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ButtonGradient from '@/Components/ButtonGradient';
import TextInput from '@/Components/TextInput';
import PasswordInputWithToggle from '@/Components/PasswordInputWithToggle'
import { Head, Link, useForm, router } from '@inertiajs/react';
import { encrypOrDesencrypAES, getApi } from '@/utils/generalFunctions';


export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset, setError } = useForm({
        email: '',
        password: ''
    });

    const [loginEnabled, setLoginEnabled] = useState(true);
    const [autoLoginProcessed, setAutoLoginProcessed] = useState(false);

    useEffect(() => {
        checkLoginStatus();
        return () => {
            // reset('email');
            reset('password');
        };
    }, []);

    const checkLoginStatus = async () => {
        try {
            console.log('🔍 Verificando estado del login...');
            // Usar axios directamente sin el interceptor de token ya que esta ruta es pública
            const response = await axios.get('/api/configuracion/value/login_enabled');
            console.log('📡 Respuesta configuración:', response.data);
            const isEnabled = response.data.valor;

            console.log('🔄 Login habilitado:', isEnabled);
            setLoginEnabled(isEnabled);

            // Si el login está deshabilitado, hacer login automático
            console.log(isEnabled, autoLoginProcessed);
            if (!isEnabled && !autoLoginProcessed) {
                console.log('🚀 Iniciando login automático...');
                await performAutoLogin();
            } else {
                console.log('⏸️ Login automático no necesario o ya procesado');
            }
        } catch (error) {
            console.error('❌ Error checking login status:', error);
            console.error('❌ Error details:', error.response?.data || error.message);
            // Por defecto, asumir que el login está habilitado
            setLoginEnabled(true);
        }
    };

    const performAutoLogin = async () => {
        try {
            console.log('🔐 Iniciando proceso de login automático...');
            setAutoLoginProcessed(false);

            // Credenciales por defecto
            const defaultCredentials = {
                email: 'admin@planing.omag.cloud',
                password: 'TuPasswordSeguro123!'
            };

            console.log('🍪 Obteniendo CSRF cookie...');
            await axios.get('/sanctum/csrf-cookie');

            console.log('📨 Enviando credenciales de login...');
            console.log('📧 Email:', defaultCredentials.email);
            console.log('🔑 Password: [OCULTO]');

            data.email = defaultCredentials.email;
            data.password = defaultCredentials.password;
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
                    email: defaultCredentials.email ?? 'admin@planing.omag.cloud',
                    password: defaultCredentials.password ?? 'TuPasswordSeguro123!',
                })
                if (response.status !== 200) throw new Error("Not found");
                const encryptedToken = await encrypOrDesencrypAES(response.data.token);
                localStorage.setItem("Token", encryptedToken);
                localStorage.setItem("Username", response.data.usuario.username);
                localStorage.setItem("Email", response.data.usuario.email);

                // Te rediriges usando Inertia a una ruta protegida por sesión
                router.visit('/dashboard');
            } catch (err) {
                console.error("Error al guardar datos en localStorage:", err);
            }

        } catch (error) {
            console.error('❌ Error en login automático:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error message:', error.message);
            // Si falla el login automático, mostrar el formulario normal
            setLoginEnabled(true);
            setAutoLoginProcessed(true);
        }
    };

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
            if (response.status !== 200) throw new Error("Not found");
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

    // Si el login está deshabilitado y estamos procesando el auto-login, mostrar loading
    if (!loginEnabled && !autoLoginProcessed) {
        return (
            <GuestLayout>
                <Head title="Log in" />
                <div className="text-center">
                    <div className="mb-4 font-medium text-sm text-blue-600">
                        Iniciando sesión automáticamente...
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </GuestLayout>
        );
    }

    // Si el login está deshabilitado pero falló el auto-login, mostrar formulario
    if (!loginEnabled && autoLoginProcessed) {
        return (
            <GuestLayout>
                <Head title="Log in" />
                <div className="text-center">
                    <div className="mb-4 font-medium text-sm text-red-600">
                        Error en el inicio de sesión automático. Contacte al administrador.
                    </div>
                </div>
            </GuestLayout>
        );
    }

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
