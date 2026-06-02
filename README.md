# FitLife Takip & Sağlık Platformu

FitLife, kullanıcıların sağlık, egzersiz, fitness ve yaşamsal metriklerini takip etmelerini sağlayan, yapay zeka destekli modern bir web uygulamasıdır. 

## Özellikler

- **Gelişmiş PWA Desteği**: Çevrimdışı çalışabilme ve cihazlara yüklenebilme özelliği.
- **Yapay Zeka Destekli Analizler**: Gemini API entegrasyonu ile sağlık verilerinizin akıllı analizi.
- **Modern Arayüz**: TailwindCSS ve React kullanılarak geliştirilmiş, duyarlı (responsive) tasarım.
- **Firebase Entegrasyonu**: Veri yönetimi ve kimlik doğrulama işlemleri.

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### Ön Gereksinimler

- Node.js (güncel sürüm)
- npm veya yarn

### Kurulum Adımları

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Ortam değişkenlerini ayarlayın:
   `.env.example` veya `.env.local` dosyasını kullanarak gerekli API anahtarlarını yapılandırın (özellikle `GEMINI_API_KEY`).

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Teknolojiler

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Gemini API](https://ai.google.dev/)
- [Vite PWA](https://vite-pwa-org.netlify.app/)
