# 🥝 Kiwi Platform (MVP)

> **Plataforma de Escrow y Custodia de Fondos para Transacciones P2P en Bolivia.**
> *Proyecto de Grado / Tesis de Ingeniería.*

![Status](https://img.shields.io/badge/Status-Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Stack](https://img.shields.io/badge/Stack-Django%20%7C%20React%20Native-green)

## 📖 Descripción del Proyecto

**Kiwi** es una plataforma de intermediación financiera diseñada para eliminar el riesgo de estafas en la compra-venta de productos entre desconocidos.

A diferencia de las billeteras digitales tradicionales, Kiwi opera bajo un modelo de **Pasarela de Custodia (Pass-through)**:
1.  El comprador paga mediante **QR Bancario** (Interoperable).
2.  Kiwi asegura los fondos temporalmente (**Locking**).
3.  Una vez confirmada la entrega del producto, Kiwi dispersa los fondos automáticamente a la cuenta bancaria del vendedor (**Payout**).

### 🚀 Características Principales (MVP)
* **Onboarding Seguro:** Registro con verificación de identidad (KYC) mediante carga de documentos.
* **Gestión de Acuerdos:** Creación de links de cobro por parte del vendedor.
* **Pagos QR:** Integración simulada con el sistema financiero nacional (QR Simple/BCB).
* **Arquitectura Orientada a Eventos:** Procesamiento asíncrono de pagos y notificaciones.
* **Resolución de Disputas:** Mecanismo de congelamiento de fondos ante reportes de fraude.

---

## 🛠️ Stack Tecnológico

El proyecto está construido como un **Monolito Modular** utilizando tecnologías modernas y robustas.

### 📱 Frontend (Mobile App)
* **Framework:** [React Native](https://reactnative.dev/) vía **Expo SDK**.
* **Lenguaje:** TypeScript.
* **Estilos:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS).
* **Estado:** Zustand + React Query.

### 🔙 Backend (API Core)
* **Framework:** Python 3.11 + [Django 5](https://www.djangoproject.com/).
* **API:** Django Rest Framework (DRF).
* **Base de Datos:** PostgreSQL 15.
* **Asincronía & Eventos:** Redis 7 + Celery 5.
* **Contenedorización:** Docker & Docker Compose.

---

## 🧩 Arquitectura del Sistema

Kiwi utiliza una **Arquitectura Híbrida (Event-Driven Modular Monolith)**. Aunque el despliegue es monolítico, los dominios están desacoplados internamente y se comunican mediante eventos.
