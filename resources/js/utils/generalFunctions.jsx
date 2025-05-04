import axios from "axios";
import CryptoJS from "crypto-js";
import { useEffect } from "react";

let instance = null;

const key = import.meta.env.VITE_SECRETKEY;

export function encrypOrDesencrypAES(data, option = true) {
    if (!key) {
        throw new Error("SECRETKEY is not defined in the environment variables.");
    }

    try {
        return option ? encryptDataAES(data, key) : decryptDataAES(data, key);
    } catch (error) {
        console.error("Error during encryption/decryption:", error);
        return null;
    }
}

export function encryptDataAES(data, key) {
    const encrypted = CryptoJS.AES.encrypt(data, key);
    return encrypted.toString(); // devuelve en base64
}

export function decryptDataAES(cipherText, key) {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

export function createApiInstance() {
    const api = axios.create({
        baseURL: "/api",
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
        },
    });

    api.interceptors.request.use(async (config) => {
        const tokenEncrypted = localStorage.getItem("Token");
        if (tokenEncrypted) {
            const token = await encrypOrDesencrypAES(tokenEncrypted, false);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    });

    return api;
}

export function getApi() {
    if (!instance) {
        instance = createApiInstance();
    }
    return instance;
}

export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export function formatFechaLocal(fechaStr) {
    if (!fechaStr) return "-";
    const [año, mes, día] = fechaStr.split("T")[0].split("-");
    return `${día}/${mes}/${año}`;
}

export function useRouteGuard(filteredSections) {
    const currentPath = window.location.pathname

    // 1) Aplanamos todas las rutas permitidas:
    const allowedPaths = filteredSections
      .flatMap(section =>
        section.options.map(opt =>
          // Concatenamos el basePath de la sección con el `to` de la opción
          (opt.to).replace(/\/{2,}/g, '/') 
        )
      )

    // 2) Chequeo: ¿cabe alguna ruta permitida?
    const isAllowed = allowedPaths.some(route =>
      currentPath.startsWith(route)
    )

    if (!isAllowed) {
      window.location.href = '/notFound'
    }
}