# Unraid Üzerinde Ermak Rapor Uygulaması Kurulum Rehberi

Bu rehber, geliştirdiğimiz servis raporlama uygulamasını kendi Unraid sunucunuzda nasıl çalıştıracağınızı adım adım anlatır.

## Ön Gereksinimler

1.  **Unraid Sunucusu:** Docker hizmetinin açık olması gerekir.
2.  **App Store (Community Applications):** "Docker Compose Manager" eklentisinin kurulu olması önerilir (veya terminalden işlem yapabilirsiniz).
3.  **GitHub Deposu (Opsiyonel ama önerilen):** Projenin Github'da güncel bir yedeğinin olması.

---

## 1. Projeyi GitHub'a Yükleme

Bilgisayarınızdaki (geliştirme ortamı) terminalde şu komutları çalıştırarak son halini GitHub'a gönderin:

```bash
git add .
git commit -m "Unraid deployment hazirliklari: Dockerfile ve compose eklendi"
git push origin main
```

*(Eğer `origin` tanımlı değilse, önce GitHub'da boş bir repo açıp remote eklemeniz gerekebilir.)*

---

## 2. Unraid Üzerinde Kurulum Yöntemleri

İki yöntemden birini seçebilirsiniz:

### Yöntem A: Docker Compose Manager (Önerilen)

1.  Unraid arayüzünde **Docker** sekmesine gidin.
2.  Aşağıda **Compose** bölümünü bulun (Docker Compose Manager eklentisi kuruluysa).
3.  **Add New Stack** deyin.
4.  İsim olarak `ermak-rapor` verin.
5.  **Edit Stack** diyerek açılan düzenleyiciye, projedeki `docker-compose.yml` içeriğini yapıştırın.
    *   **ÖNEMLİ:** `docker-compose.yml` içindeki `build: .` kısmı Unraid'de doğrudan çalışmaz çünkü kaynak kodlar orada yoktur. Bunun yerine ideal olan Docker Hub'a imajı yüklemektir.
    *   **Alternatif (Kolay Yol - Kodları Unraid'e Kopyalama):**
        1.  Unraid sunucunuzda `/mnt/user/appdata/ermak-rapor` klasörü oluşturun.
        2.  Tüm proje dosyalarını (node_modules hariç) bu klasöre kopyalayın (SMB/Ağ paylaşımı üzerinden).
        3.  Docker Compose Manager'da stack oluştururken "Location" olarak bu klasörü gösterin.
        4.  Şimdi `docker-compose.yml` içindeki `build: .` komutu çalışacaktır.

### Yöntem B: Terminal ve Dosya Transferi (Manuel)

1.  Unraid sunucunuza `ssh` ile bağlanın veya web terminalini açın.
2.  Appdata klasörüne gidin:
    ```bash
    cd /mnt/user/appdata
    mkdir ermak-rapor
    cd ermak-rapor
    ```
3.  Proje dosyalarınızı (geliştirme bilgisayarınızdan) bu klasöre kopyalayın.
    *   Bunu Windows dosya gezgini ile `\\TOWER\appdata\ermak-rapor` adresine giderek yapabilirsiniz.
    *   `node_modules`, `.next`, `.git` klasörlerini kopyalamanıza gerek yok.
    *   **Dockerfile**, **docker-compose.yml**, **package.json**, **next.config.ts**, **prisma/**, **public/** ve **src/** klasörleri mutlaka olmalı.

4.  Terminalden uygulamayı başlatın:
    ```bash
    docker-compose up -d --build
    ```
    *(Bu işlem ilk seferde biraz uzun sürer çünkü imajı sıfırdan oluşturacaktır.)*

---

## 3. Yapılandırma ve Veritabanı

`docker-compose.yml` dosyasında şu ayarlar bulunur:

-   **Port:** `3000:3000` (Tarayıcıdan `http://UNRAID-IP:3000` adresinden erişebilirsiniz. Eğer 3000 doluysa, `docker-compose.yml`'de sol tarafı değiştirin: `8090:3000` gibi).
-   **Database Volume:** `./prisma` klasörü `/app/prisma` ile eşleşir. Veritabanınız (`dev.db`) bu klasörde saklanır. Konteyneri silip tekrar kursanız bile verileriniz kaybolmaz.
-   **Uploads Volume:** `./public/uploads` klasörü yedeklenir. Yüklenen resimler/dosyalar burada tutulur.
-   **Auth Secret:** `docker-compose.yml` içindeki `AUTH_SECRET` değerini rastgele uzun bir şifre ile değiştirmeniz güvenliğiniz için önemlidir. `openssl rand -base64 32` komutuyla üretebilirsiniz.

## 4. Güncelleme Yapılacağı Zaman

Uygulamada değişiklik yaptığınızda:

1.  Dosyaları Unraid'deki klasöre tekrar kopyalayın (üzerine yazın).
2.  Terminalden şu komutu çalıştırın:
    ```bash
    docker-compose up -d --build
    ```
    Bu komut değişiklikleri algılayıp yeniden derleme yapar ve konteyneri günceller.

## 5. Erişim

Kurulum bittikten sonra tarayıcınızdan:
`http://<UNRAID-IP-ADRESI>:3000`
adresine giderek uygulamayı kullanabilirsiniz.
