# AI Agent Office / Fairy Headquarters 🧚

Matematik öğrencisiyim; yazılım geliştirmeyi ve yapay zekâyla denemeler yapmayı seviyorum. Derslerimi, projelerimi ve fikirlerimi toparlamak için tek asistan yerine küçük bir ekip kurmak istedim. Bu, hem kişisel bir araç hem de öğrenme projem.

## Ekiple tanışın

Bunlar özel yerel sistemde tanımladığım roller; hepsi çalışan birer yapay zekâ uzmanı değil.

| Ajan | Görevi |
| --- | --- |
| Cigdem | Koordinasyon ve görev yönlendirme |
| Scholar | Matematik, ders notları ve sınav hazırlığı |
| Radar | Araştırma ve kaynak kontrolü |
| Builder | Yazılım geliştirme ve test |
| Creator | İçerik planlama ve medya üretimi |
| Career | CV, portfolyo ve kariyer çalışmaları |
| Bekci | Güvenlik denetimi ve bağımsız inceleme |
| Kapanis | Gün sonu değerlendirmesi ve planlama |
| Depocu | Dosya düzeni ve depolama incelemesi |
| Postaci | Önemli e-postaları ve yapılacakları ayıklama |

Özel mimaride **13 yardımcı profil** (Builder: 4, Creator: 5, Bekci: 4) ve gerektiğinde yüklenen **11 skill tanımı** var. Rol sorumluluğu, yardımcı alt işi, skill yaklaşımı tanımlar; araç işlemi yapan koddur. Profil veya skill, çalışan süreç ya da hesap erişimi demek değil.

## Neden peri ofisi?

Klasik panel yerine küçük bir dünya istedim: on 3D oda, farklı periler, orman atmosferi, kanat/süzülme animasyonları, kamera ve oda yakınlaşması, inceleme paneli ve grafik ayarları.

Çalışma animasyonu doğrulanmış yürütme için tasarlandı. Tavşanlar yardımcıları temsil eder; public katalogda yardımcı tanımlı olmadığından görünmezler. **Public sürüm ajan çalıştırmaz; görev veya token kullanımı uydurmaz.**

## Nasıl çalışmasını istiyorum?

Hedefim: Cigdem’e görev vermek, Go’nun isteği izinlerle ilgili uzmana yönlendirmesi ve sonucu ofisten incelemek. Builder geliştirme/test, Bekci bağımsız güvenlik incelemesi yapacak; hassas işlemlerde son karar bende.

Özel projede yerel görev kaydı, yönlendirme ve deterministik denetimler mevcut. Tam uzman yürütmesi hâlâ geliştirme aşamasında.

- **Altyapı:** Go; React, TypeScript, Three.js / React Three Fiber, Vite, Tailwind, Zustand ve Motion.
- **Yerel kayıtlar:** Şimdilik JSON. SQLite henüz ana veritabanı değil.
- **Devam edenler:** Claude Code, uzman görevleri, PDF işleme, araştırma, medya üretimi, Gmail/Outlook ve Notion bağlantıları. Hazır adaptör, çalışan OAuth bağlantısı demek değil.

## Güvenlik ve bu deponun sınırı

Ajanların bilgisayarımda serbestçe dolaşmasını istemiyorum. Elle başlatma, yerel kayıtlar, sınırlı izinler/delegasyon ve ayrı onay/uygulama durumları kullanıyorum. Testler güvenlik garantisi veya sertifika değil.

Burada arayüz, genel Go/frontend bileşenleri, sentetik testler ve incelenmiş asset’ler var. Özel talimatlar, hafızalar, günlükler, görev/takvim kayıtları ve kimlik bilgileri yerel kalıyor. **Tam backend burada yok.** Henüz kaynak lisansı seçmedim; public olmak otomatik açık kaynak lisansı sağlamaz.

## Yerelde çalıştırma

Node.js **22.12+** ve npm gerekiyor. Go bileşenlerini test etmek için ayrıca **Go 1.25+** kullanıyorum.

```sh
git clone https://github.com/cigdem-gokdas/AI-agent-office.git
cd AI-agent-office
npm ci --ignore-scripts
npm run dev
```

Tarayıcı: **http://127.0.0.1:5175**. GitHub Pages yayını yok; bu komut özel ajanları başlatmaz.

```sh
npm run build:ui       # Arayüz derlemesi
npm test               # Frontend ve güvenlik testleri
npm run typecheck:ui   # TypeScript kontrolü
go test ./...          # Genel Go bileşenleri
```

Asset kaynakları: [ui/ASSETS.json](ui/ASSETS.json). Yayın sınırları: [EXCLUSIONS.md](EXCLUSIONS.md).
